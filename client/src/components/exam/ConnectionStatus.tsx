import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isOnline,
  isSyncing,
  pendingSyncCount,
}) => {
  if (isOnline && pendingSyncCount === 0 && !isSyncing) {
    return null; // Silent when fully connected
  }

  return (
    <div className="fixed bottom-16 right-4 z-40 animate-in fade-in">
      {!isOnline ? (
        <div className="bg-amber-900 text-amber-100 px-3 py-2 rounded-md shadow-lg border border-amber-600 flex items-center gap-2 text-xs">
          <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>
            Connection lost — answers are saved locally ({pendingSyncCount} pending) and will sync on reconnect.
          </span>
        </div>
      ) : isSyncing ? (
        <div className="bg-blue-900 text-blue-100 px-3 py-2 rounded-md shadow-lg border border-blue-600 flex items-center gap-2 text-xs">
          <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
          <span>Synchronizing offline answers with server...</span>
        </div>
      ) : (
        <div className="bg-emerald-900 text-emerald-100 px-3 py-2 rounded-md shadow-lg border border-emerald-600 flex items-center gap-2 text-xs">
          <Wifi className="w-4 h-4 text-emerald-400" />
          <span>Connected — All responses synchronized.</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
