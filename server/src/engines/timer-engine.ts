export interface TimerState {
  startedAt: Date;
  serverEndTime: Date;
  remainingSeconds: number;
  isExpired: boolean;
  totalDurationSeconds: number;
}

export class TimerEngine {
  // Grace period in seconds to account for network transmission latency
  private static readonly NETWORK_GRACE_PERIOD_SECONDS = 5;

  /**
   * Compute server-authoritative end time given start time and duration in minutes
   */
  static calculateEndTime(startedAt: Date, durationMinutes: number): Date {
    return new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
  }

  /**
   * Get remaining seconds from now until serverEndTime.
   * Returns 0 if time is expired.
   */
  static getRemainingSeconds(serverEndTime: Date): number {
    const now = Date.now();
    const end = serverEndTime.getTime();
    const diff = end - now;
    return Math.max(0, Math.floor(diff / 1000));
  }

  /**
   * Returns true if time has expired (with grace period for network jitter)
   */
  static isExpired(serverEndTime: Date, allowGrace: boolean = true): boolean {
    const graceMs = allowGrace ? this.NETWORK_GRACE_PERIOD_SECONDS * 1000 : 0;
    return Date.now() > (serverEndTime.getTime() + graceMs);
  }

  /**
   * Get full timer snapshot for client sync
   */
  static getSnapshot(startedAt: Date, serverEndTime: Date, durationMinutes: number): TimerState {
    const remainingSeconds = this.getRemainingSeconds(serverEndTime);
    return {
      startedAt,
      serverEndTime,
      remainingSeconds,
      isExpired: remainingSeconds <= 0,
      totalDurationSeconds: durationMinutes * 60,
    };
  }

  static getServerTime(): Date {
    return new Date();
  }
}
