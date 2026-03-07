import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Globe,
  BarChart2,
  Clock,
  Layers
} from 'lucide-react';
import { MODELS } from '../constants';
import { ModelMetadata } from '../types';

export const ModelComparison: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-zinc-900">Model Comparison</h2>
        <p className="text-zinc-500 text-sm">Compare performance, latency, and accuracy across available detection engines.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {MODELS.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-3xl bg-white border border-zinc-200 flex flex-col gap-6 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                {m.id === 'roberta' && <Cpu className="w-6 h-6" />}
                {m.id === 'gemini' && <Globe className="w-6 h-6" />}
                {m.id === 'gpt' && <ShieldCheck className="w-6 h-6" />}
                {m.id === 'huggingface' && <Zap className="w-6 h-6" />}
              </div>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                m.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 
                m.status === 'degraded' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
              }`}>
                {m.status === 'online' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {m.status}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-1 text-zinc-900">{m.name}</h3>
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mb-3">{m.provider}</p>
              <p className="text-xs text-zinc-600 leading-relaxed h-12 overflow-hidden">{m.description}</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-zinc-400">
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold">Accuracy</span>
                </div>
                <span className="text-xs font-mono text-emerald-600 font-bold">{m.accuracy}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold">Latency</span>
                </div>
                <span className="text-xs font-mono text-blue-600 font-bold">{m.latency}</span>
              </div>
            </div>

            <button className="mt-auto w-full py-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-all">
              View Benchmarks
            </button>
          </motion.div>
        ))}
      </div>

      {/* Detailed Comparison Table */}
      <div className="p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold flex items-center gap-3 text-zinc-900">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            Performance Benchmark Matrix
          </h3>
          <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-zinc-300">
            <span>Updated: Real-time</span>
            <div className="w-1 h-1 rounded-full bg-zinc-200" />
            <span>Source: Internal Benchmarks</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="py-5 px-6 text-[10px] uppercase text-zinc-400 font-black tracking-[0.2em]">Metric</th>
                {MODELS.map(m => (
                  <th key={m.id} className="py-5 px-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-zinc-900">{m.name}</span>
                      <span className="text-[8px] uppercase text-zinc-300 font-bold tracking-tighter">{m.provider}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs">
              {/* Accuracy Row */}
              <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-zinc-600">Accuracy</span>
                  </div>
                </td>
                {MODELS.map(m => (
                  <td key={m.id} className="py-5 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-emerald-600 font-bold text-sm">{m.accuracy}</span>
                      <div className="w-16 h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: m.accuracy }}
                        />
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Latency Row */}
              <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-zinc-600">Latency</span>
                  </div>
                </td>
                {MODELS.map(m => (
                  <td key={m.id} className="py-5 px-6">
                    <span className="font-mono text-blue-600 font-bold">{m.latency}</span>
                  </td>
                ))}
              </tr>

              {/* Cost Row */}
              <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-zinc-600">Inference Cost</span>
                  </div>
                </td>
                {MODELS.map(m => (
                  <td key={m.id} className="py-5 px-6">
                    <span className={`font-medium ${
                      m.cost.includes('Free') ? 'text-emerald-600' : 'text-blue-600'
                    }`}>
                      {m.cost}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Privacy Row */}
              <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-zinc-600">Privacy Level</span>
                  </div>
                </td>
                {MODELS.map(m => (
                  <td key={m.id} className="py-5 px-6">
                    <span className={`px-2 py-1 rounded-md font-bold text-[9px] uppercase ${
                      m.privacy.includes('Maximum') ? 'bg-emerald-50 text-emerald-600' :
                      m.privacy.includes('Standard') ? 'bg-blue-50 text-blue-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {m.privacy}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Max Tokens Row */}
              <tr className="hover:bg-zinc-50/50 transition-colors group">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-100 text-zinc-500">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-zinc-600">Max Context</span>
                  </div>
                </td>
                {MODELS.map(m => (
                  <td key={m.id} className="py-5 px-6 text-zinc-400">
                    {m.maxContext}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
