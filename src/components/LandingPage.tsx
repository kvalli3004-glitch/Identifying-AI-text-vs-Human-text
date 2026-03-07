import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, Zap, Database, Cpu } from 'lucide-react';

export const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-zinc-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 mb-8 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Advanced AI Detection Engine</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-zinc-900">
          AI VS HUMAN <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 italic">
            DETECTION SYSTEM
          </span>
        </h1>

        <p className="text-lg text-zinc-500 mb-12 max-w-2xl mx-auto font-medium">
          Identify machine-generated content with surgical precision. Our multi-model analysis engine provides sentence-level insights, linguistic metrics, and detailed explanations.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-20">
          <button
            onClick={onStart}
            className="group relative px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-zinc-900/20"
          >
            Click Here to Start
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          
          <div className="flex items-center gap-4 text-zinc-400 text-sm font-mono">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> Real-time
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-200" />
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" /> Multi-API
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-200" />
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" /> 95 % Accuracy
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            { title: 'Sentence Highlighting', desc: 'Visual color-coding for every segment of your text.' },
            { title: 'Linguistic Analysis', desc: 'Perplexity, burstiness, and coherence metrics.' },
            { title: 'Explainable AI', desc: 'Detailed reasoning for every detection result.' },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
              <h3 className="text-sm font-bold mb-2 text-zinc-900">{feature.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
