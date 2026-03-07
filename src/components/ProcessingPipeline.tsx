import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Cpu, 
  Globe, 
  Zap, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { ProcessingStep, ModelOption } from '../types';

interface ProcessingPipelineProps {
  steps: ProcessingStep[];
  activeModels: ModelOption[];
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ steps, activeModels }) => {
  return (
    <div className="p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Execution Pipeline</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Parallel Mode Active</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-100" />

        <div className="space-y-8">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative pl-12">
              {/* Step Icon */}
              <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                step.status === 'completed' ? 'bg-emerald-500 text-white' :
                step.status === 'processing' ? 'bg-blue-500 text-white' :
                'bg-zinc-100 text-zinc-400'
              }`}>
                {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                 step.status === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> :
                 <Circle className="w-5 h-5" />}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${step.status === 'processing' ? 'text-blue-600' : 'text-zinc-900'}`}>
                    {step.label}
                  </span>
                  {step.status === 'completed' && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Done</span>
                  )}
                </div>
                
                {step.id === 'parallel-run' && step.status !== 'pending' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    {activeModels.map((m) => (
                      <motion.div 
                        key={m}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3 shadow-sm"
                      >
                        <div className="p-2 rounded-lg bg-white border border-zinc-100 shadow-sm">
                          {m === 'roberta' && <Cpu className="w-4 h-4 text-blue-500" />}
                          {m === 'gemini' && <Globe className="w-4 h-4 text-emerald-500" />}
                          {m === 'gpt' && <ShieldCheck className="w-4 h-4 text-purple-500" />}
                          {m === 'huggingface' && <Zap className="w-4 h-4 text-orange-500" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-zinc-900">{m}</span>
                          <span className="text-[8px] text-zinc-400 uppercase">Analyzing...</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {step.details && (
                  <p className="text-xs text-zinc-400 italic">{step.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
