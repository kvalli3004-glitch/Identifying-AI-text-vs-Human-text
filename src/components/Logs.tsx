import React from 'react';
import { SystemLog } from '../types';
import { format } from 'date-fns';
import { Terminal, Trash2, X } from 'lucide-react';

interface LogsProps {
  logs: SystemLog[];
  onDeleteLog: (id: number) => void;
  onClearLogs: () => void;
}

export const Logs: React.FC<LogsProps> = ({ logs, onDeleteLog, onClearLogs }) => {
  return (
    <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm font-mono">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">System Activity Logs</h3>
          </div>
          {logs.length > 0 && (
            <button 
              onClick={onClearLogs}
              className="flex items-center gap-1.5 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[9px] font-bold rounded transition-all border border-red-100 uppercase tracking-tight"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>
      </div>
      <div className="h-96 overflow-y-auto space-y-2 text-[11px]">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between group hover:bg-zinc-50 p-1 rounded transition-all">
            <div className="flex gap-3 items-center">
              <span className="text-zinc-300">[{format(new Date(log.timestamp), 'HH:mm:ss')}]</span>
              <span className={`uppercase font-bold w-12 ${
                log.level === 'error' ? 'text-red-600' : 
                log.level === 'warn' ? 'text-yellow-600' : 
                'text-emerald-600'
              }`}>
                {log.level}
              </span>
              <span className="text-zinc-600">{log.message}</span>
            </div>
            <button 
              onClick={() => onDeleteLog(log.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-300 hover:text-red-600 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-zinc-300 italic text-center py-8">No logs recorded yet...</div>
        )}
      </div>
    </div>
  );
};
