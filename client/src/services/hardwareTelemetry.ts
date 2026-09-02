import api from '../api/client';

export interface HardwareTelemetryData {
  isVM: boolean;
  gpuRenderer: string;
  gpuVendor: string;
  logicalCores: number;
  deviceMemoryGB?: number;
  screenResolution: string;
  isMultiMonitor: boolean;
  monitorCount: number;
  userAgent: string;
  detectedFlags: string[];
}

const KNOWN_VM_PATTERNS = [
  /virtualbox/i,
  /vmware/i,
  /swiftshader/i,
  /llvmpipe/i,
  /softpipe/i,
  /virgl/i,
  /bms-dri/i,
  /basic render driver/i,
  /qemu/i,
  /hyper-v/i,
  /parallels/i,
  /svga/i,
  /vbox/i,
  /mesa.*software/i,
  /microsoft basic render/i,
];

export async function collectHardwareProfile(): Promise<HardwareTelemetryData> {
  const flags: string[] = [];

  // 1. WebGL GPU / Renderer Inspection
  let gpuRenderer = 'Unavailable / Blocked';
  let gpuVendor = 'Unavailable / Blocked';
  let isVM = false;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown Renderer';
        gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown Vendor';
      } else {
        gpuRenderer = gl.getParameter(gl.RENDERER) || 'Generic WebGL';
        gpuVendor = gl.getParameter(gl.VENDOR) || 'Generic Vendor';
      }

      // Check against VM patterns
      const combinedGpu = `${gpuVendor} ${gpuRenderer}`.toLowerCase();
      for (const pattern of KNOWN_VM_PATTERNS) {
        if (pattern.test(combinedGpu)) {
          isVM = true;
          flags.push(`VM_RENDERER_MATCH: ${gpuRenderer}`);
          break;
        }
      }
    } else {
      flags.push('WEBGL_UNAVAILABLE');
    }
  } catch (err) {
    flags.push(`WEBGL_PROBE_ERROR: ${String(err)}`);
  }

  // 2. Hardware Concurrency (Logical Cores)
  const logicalCores = navigator.hardwareConcurrency || 1;
  if (logicalCores <= 1) {
    flags.push(`LOW_CORE_COUNT: ${logicalCores}`);
  }

  // 3. Device Memory
  const deviceMemoryGB = (navigator as any).deviceMemory || undefined;
  if (deviceMemoryGB && deviceMemoryGB <= 2) {
    flags.push(`LOW_DEVICE_MEMORY: ${deviceMemoryGB}GB`);
  }

  // 4. Resolution & Multi-Monitor Detection
  const screenResolution = `${window.screen.width}x${window.screen.height} (Color: ${window.screen.colorDepth}-bit)`;

  let isMultiMonitor = false;
  let monitorCount = 1;

  // Check 1: Screen Extended API (modern browsers)
  if ((window.screen as any).isExtended === true) {
    isMultiMonitor = true;
    monitorCount = 2;
    flags.push('MULTI_MONITOR_EXTENDED_API');
  }

  // Check 2: Heuristic on available bounds vs screen bounds
  try {
    if (window.screen.availWidth > window.screen.width * 1.2) {
      isMultiMonitor = true;
      monitorCount = Math.max(monitorCount, 2);
      flags.push('MULTI_MONITOR_WIDE_BOUNDS_HEURISTIC');
    }
  } catch {
    // Ignore bounds access issues
  }

  // Check 3: Multi-Screen Window Placement API (if permission already granted)
  if ('getScreenDetails' in window && typeof (window as any).getScreenDetails === 'function') {
    try {
      const details = await (window as any).getScreenDetails();
      if (details?.screens?.length > 1) {
        isMultiMonitor = true;
        monitorCount = details.screens.length;
        flags.push(`MULTI_SCREEN_API_COUNT: ${details.screens.length}`);
      }
    } catch {
      // Permission not granted or query skipped
    }
  }

  // 5. User Agent & OS
  const userAgent = navigator.userAgent;

  return {
    isVM,
    gpuRenderer,
    gpuVendor,
    logicalCores,
    deviceMemoryGB,
    screenResolution,
    isMultiMonitor,
    monitorCount,
    userAgent,
    detectedFlags: flags,
  };
}

/**
 * Collects hardware profile and sends telemetry to the server immediately.
 * Fails gracefully without interrupting candidate workflow.
 */
export async function collectAndSendHardwareProfile(): Promise<HardwareTelemetryData | null> {
  try {
    const profile = await collectHardwareProfile();
    await api.post('/auth/hardware-profile', profile);
    return profile;
  } catch (err) {
    console.warn('Telemetry collection notice (non-fatal):', err);
    return null;
  }
}
