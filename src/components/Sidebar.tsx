import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Settings2, 
  History, 
  Terminal, 
  BarChart3, 
  ChevronDown, 
  User,
  CheckCircle2,
  Trash2,
  BrainCircuit,
  Cpu,
  X
} from 'lucide-react';
import { HistoryRecord, Section, ModelOption, ModelMetadata } from '../types';
import { MODELS } from '../constants';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  model: ModelOption;
  onModelChange: (model: ModelOption) => void;
  history: HistoryRecord[];
  onSelectHistory: (record: HistoryRecord) => void;
  onClearHistory: () => void;
  onDeleteHistory: (id: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  model, 
  onModelChange,
  history,
  onSelectHistory,
  onClearHistory,
  onDeleteHistory
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'detection', label: 'Text Detection', icon: Search },
    { id: 'workflow', label: 'Workflow', icon: BrainCircuit },
    { id: 'models', label: 'Model Selection', icon: Settings2 },
    { id: 'history', label: 'Chat History', icon: History },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'stats', label: 'Dataset Stats', icon: BarChart3 },
  ] as const;

  return (
    <div className="w-72 h-screen bg-white text-zinc-900 flex flex-col border-r border-zinc-200">
      {/* Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <h1 className="font-bold text-sm tracking-tight">AI vs Human Text Detector</h1>
      </div>

      {/* Model Selection in Sidebar */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Select Model/API</p>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              MODELS.find(m => m.id === model)?.status === 'online' ? 'bg-emerald-500' : 
              MODELS.find(m => m.id === model)?.status === 'degraded' ? 'bg-orange-500' : 'bg-red-500'
            }`} />
            <span className="text-[10px] text-zinc-400 font-bold uppercase">{MODELS.find(m => m.id === model)?.status}</span>
          </div>
        </div>
        <div className="relative mb-3">
          <select 
            value={model}
            onChange={(e) => onModelChange(e.target.value as ModelOption)}
            className="w-full bg-zinc-50 text-zinc-900 text-xs font-bold py-2.5 px-3 pr-10 rounded-md border border-zinc-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>

        <div className="relative">
          <button className="w-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold py-2.5 px-3 rounded-md flex items-center justify-between hover:bg-blue-100 transition-colors">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analyze FIEE
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-md transition-all ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 font-semibold' 
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Chat History */}
      <div className="p-4 bg-zinc-50 border-t border-zinc-200">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-sm font-bold text-zinc-900">Chat History</h3>
        </div>
        <div className="space-y-2 mb-4">
          {history.slice(0, 3).map((record) => {
            const res = JSON.parse(record.result_json);
            return (
              <div key={record.id} className="group relative">
                <button
                  onClick={() => onSelectHistory(record)}
                  className="w-full bg-white border border-zinc-200 hover:border-blue-200 hover:bg-blue-50/30 p-3 rounded-lg flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs text-zinc-700 truncate">AI-Generated ({res.overallScore}%)</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-300 group-hover:text-zinc-400" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistory(record.id);
                  }}
                  className="absolute -right-2 -top-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
          {history.length === 0 && (
            <p className="text-[10px] text-zinc-300 italic text-center py-2">No recent history</p>
          )}
        </div>

        {history.length > 0 && (
          <div className="px-2">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All History
              </button>
            ) : (
              <div className="bg-red-50 border border-red-100 rounded-lg p-2 animate-in fade-in zoom-in duration-200">
                <p className="text-[9px] font-bold text-red-600 uppercase text-center mb-2">Delete all records?</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClearHistory();
                      setShowClearConfirm(false);
                    }}
                    className="flex-1 py-1.5 bg-red-600 text-white rounded-md text-[9px] font-bold hover:bg-red-700 transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-1.5 bg-white text-zinc-600 border border-zinc-200 rounded-md text-[9px] font-bold hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
