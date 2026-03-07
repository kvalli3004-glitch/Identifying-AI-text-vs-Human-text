import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Search, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Database, 
  Activity,
  Monitor,
  FileText,
  Zap,
  Play,
  Globe,
  Server
} from 'lucide-react';

interface WorkflowProps {
  activeStep: number;
}

export const Workflow: React.FC<WorkflowProps> = ({ activeStep: externalActiveStep }) => {
  const [internalStep, setInternalStep] = useState(-1);
  const [isSimulating, setIsSimulating] = useState(false);

  // Use external step if not simulating
  const currentStep = isSimulating ? internalStep : externalActiveStep;

  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setInternalStep(0);
    
    const sequence = [
      { step: 0, delay: 1500 }, // Pre-processing
      { step: 1, delay: 3000 }, // Parallel Processing
      { step: 2, delay: 2000 }, // Aggregation
      { step: 3, delay: 2000 }, // Final Classification
      { step: -1, delay: 1000 } // Reset
    ];

    let totalDelay = 0;
    sequence.forEach((item) => {
      totalDelay += item.delay;
      setTimeout(() => {
        setInternalStep(item.step);
        if (item.step === -1) setIsSimulating(false);
      }, totalDelay);
    });
  };

  // Connection line component
  const Connection = ({ d, active, color = "blue", delay = 0 }: { d: string; active: boolean; color?: string; delay?: number }) => {
    const colorMap: Record<string, string> = {
      blue: "text-blue-500",
      emerald: "text-emerald-500",
      amber: "text-amber-500",
      indigo: "text-indigo-500",
      rose: "text-rose-500",
      slate: "text-slate-400"
    };

    const glowMap: Record<string, string> = {
      blue: "#3b82f6",
      emerald: "#10b981",
      amber: "#f59e0b",
      indigo: "#818cf8",
      rose: "#f43f5e",
      slate: "#94a3b8"
    };

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <path 
          d={d} 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none" 
          className={`${active ? colorMap[color] : 'text-zinc-100'} transition-colors duration-500`}
        />
        {active && (
          <motion.path
            d={d}
            stroke={glowMap[color]}
            strokeWidth="4"
            fill="none"
            strokeDasharray="10, 20"
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear",
              delay 
            }}
            className="opacity-50"
          />
        )}
      </svg>
    );
  };

  return (
    <div className="relative h-[800px] w-full bg-white rounded-[2.5rem] border border-zinc-200 p-12 overflow-hidden font-mono shadow-xl">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Live Visualization Widget (Top Right) */}
      <div className="absolute top-4 right-4 w-48 h-48 p-4 rounded-3xl bg-white/80 border border-zinc-200 z-20 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Live Visualization</span>
          <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
        </div>
        <div className="relative flex flex-col items-center justify-center h-28">
          <svg className="w-24 h-24 transform -rotate-90">
            <defs>
              <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-zinc-100"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="44"
              stroke="url(#circleGradient)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={276}
              animate={{ strokeDashoffset: 276 - (276 * (currentStep >= 2 ? 85 : currentStep >= 0 ? 30 : 0)) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-zinc-900 tracking-tighter">{currentStep >= 2 ? '85%' : currentStep >= 0 ? '30%' : '0%'}</span>
            <span className="text-[7px] text-zinc-400 font-black uppercase tracking-widest">AI Probability</span>
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[7px] text-zinc-400 uppercase font-black">
          <span>0%</span>
          <span className="text-zinc-200">|</span>
          <span>50%</span>
          <span className="text-zinc-200">|</span>
          <span>100%</span>
        </div>
      </div>

      {/* Nodes and Connections */}
      <div className="relative h-full">
        {/* Connections */}
        <Connection d="M 112 136 L 112 180" active={currentStep >= 0} color="amber" /> {/* UI to Text Input */}
        <Connection d="M 208 210 Q 336 210 336 176" active={currentStep >= 0} color="emerald" /> {/* Text Input to Pre-processing */}
        <Connection d="M 112 240 L 112 320" active={currentStep >= 1} color="indigo" /> {/* Text Input to Parallel */}
        <Connection d="M 432 96 Q 816 96 816 180" active={currentStep >= 2} color="blue" /> {/* Pre-processing to Aggregation */}
        <Connection d="M 336 390 Q 816 390 816 360" active={currentStep >= 2} color="blue" /> {/* Parallel to Aggregation */}
        <Connection d="M 816 360 L 816 420" active={currentStep >= 3} color="rose" /> {/* Aggregation to Classification */}
        <Connection d="M 720 510 Q 336 510 336 540" active={currentStep >= 3} color="slate" /> {/* Classification to Logging */}
        <Connection d="M 240 610 L 112 610" active={currentStep >= 3} color="slate" /> {/* Logging to Forensic DB */}

        {/* 1. User Interface (Top Left) */}
        <motion.div 
          animate={{ opacity: currentStep === -1 || currentStep === 0 ? 1 : 0.4 }}
          className="absolute top-4 left-4 w-48 p-4 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 border border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.4)] z-10"
        >
          <div className="aspect-video bg-white/30 rounded-xl flex items-center justify-center mb-2 border border-white/40 backdrop-blur-sm">
            <Monitor className="w-8 h-8 text-white" />
          </div>
          <div className="text-center text-[9px] font-black text-white uppercase tracking-widest">User Interface</div>
        </motion.div>

        {/* 2. Text Input (Below UI) */}
        <motion.div 
          animate={{ 
            opacity: currentStep >= 0 ? 1 : 0.4,
            scale: currentStep === 0 ? 1.05 : 1
          }}
          className="absolute top-[180px] left-4 w-48 p-3 rounded-2xl bg-zinc-900 border border-zinc-700 z-10 shadow-[0_0_30px_rgba(245,158,11,0.5)]"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] font-bold text-white uppercase">Text Input</span>
          </div>
        </motion.div>

        {/* 3. Pre-Processing (Top Center) */}
        <motion.div 
          animate={{ 
            opacity: currentStep === 0 ? 1 : 0.4,
            y: currentStep === 0 ? -5 : 0
          }}
          className="absolute top-4 left-[240px] w-48 p-4 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 border border-emerald-300 z-10 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-3 h-3 text-white" />
            <span className="text-[9px] font-black text-white uppercase tracking-widest">Pre-Processing</span>
          </div>
          <div className="space-y-3">
            {['Cleaning', 'Sentence Splitting', 'Tokenization'].map(task => (
              <div key={task} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)]" />
                <span className="text-[9px] text-white font-black">{task}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 4. Parallel Model Processing (Middle Left) */}
        <motion.div 
          animate={{ 
            opacity: currentStep === 1 ? 1 : 0.4,
            scale: currentStep === 1 ? 1.05 : 1,
            boxShadow: currentStep === 1 ? '0 0 50px rgba(99, 102, 241, 0.6)' : '0 0 0px rgba(0,0,0,0)'
          }}
          className="absolute top-[320px] left-4 w-[320px] p-5 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 border border-indigo-400 z-10 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none rounded-[2.5rem]" />
          <div className="relative z-10">
            <div className="text-center text-[10px] font-black text-white uppercase tracking-[0.4em] mb-5 drop-shadow-md">Parallel Model Processing</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'RoBERTa', type: 'Local', color: 'bg-orange-500' },
                { name: 'Gemini', type: 'API', color: 'bg-blue-600' },
                { name: 'GPT-4o', type: 'API', color: 'bg-emerald-500' }
              ].map((model) => (
                <div key={model.name} className="p-2.5 rounded-2xl bg-white border border-indigo-100 flex flex-col items-center shadow-md transition-transform hover:scale-110 hover:shadow-xl">
                  <div className={`w-full h-1.5 rounded-full ${model.color} mb-2.5 shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
                  <div className="text-[10px] font-black text-zinc-900 mb-1">{model.name}</div>
                  <div className="text-[7px] text-zinc-400 uppercase mb-2.5 tracking-tighter font-bold">{model.type}</div>
                  <div className="w-full pt-2 border-t border-zinc-100 text-center">
                    <div className="text-[6px] font-bold text-zinc-400 uppercase">Prediction</div>
                    <div className="text-[7px] font-black text-zinc-600 uppercase">AI / Human</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 5. Prediction Aggregation (Middle Right) */}
        <motion.div 
          animate={{ 
            opacity: currentStep === 2 ? 1 : 0.4,
            x: currentStep === 2 ? 10 : 0
          }}
          className="absolute top-[180px] left-[720px] w-48 p-5 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400 z-10 shadow-[0_0_30px_rgba(59,130,246,0.4)]"
        >
          <div className="flex flex-col items-center text-center">
            <Layers className="w-7 h-7 text-white mb-4" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">Prediction Aggregation</span>
            <div className="w-full space-y-2.5">
              {['Confidence Score', 'Majority Voting', 'Probability Calculation'].map(item => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                  <span className="text-[9px] text-white font-black">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 6. AI vs Human Classification (Bottom Right) */}
        <motion.div 
          animate={{ 
            opacity: currentStep === 3 ? 1 : 0.4,
            scale: currentStep === 3 ? 1.1 : 1
          }}
          className="absolute top-[420px] left-[720px] w-48 p-5 rounded-[2.5rem] bg-gradient-to-br from-rose-500 to-pink-600 border border-rose-400 z-10 shadow-[0_0_40px_rgba(244,63,94,0.5)]"
        >
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="w-7 h-7 text-white mb-4" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">AI vs Human Classification</span>
            <div className="w-full space-y-2.5 text-left">
              {['Highlight AI Sentences', 'AI Percentage Graph'].map(item => (
                <div key={item} className="flex items-center gap-2.5 text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_8px_white]" />
                  <span className="text-[9px] font-black">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 7. Logging & History (Bottom Center) */}
        <motion.div 
          animate={{ opacity: currentStep === 3 ? 1 : 0.4 }}
          className="absolute top-[540px] left-[240px] w-48 p-4 rounded-3xl bg-gradient-to-br from-slate-700 to-zinc-900 border border-slate-600 z-10 shadow-[0_0_20px_rgba(71,85,105,0.3)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-slate-400" />
            <span className="text-[9px] font-black text-white uppercase tracking-widest">Logging & History</span>
          </div>
          <div className="space-y-3">
            {['Store Results', 'Save Log File'].map(task => (
              <div key={task} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-[9px] text-slate-200 font-black">{task}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 8. Forensic DB (Bottom Left) */}
        <div className="absolute top-[600px] left-4 flex flex-col items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-10 rounded-lg bg-gradient-to-b from-slate-700 to-zinc-900 border border-slate-600 flex items-center justify-center shadow-md">
                <div className="w-3 h-0.5 bg-slate-500 rounded-full" />
              </div>
            ))}
          </div>
          <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Forensic DB</span>
        </div>

        {/* Simulate Button (Center Bottom) */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={startSimulation}
            disabled={isSimulating}
            className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 disabled:bg-zinc-100 disabled:text-zinc-400 rounded-2xl font-black text-white text-sm uppercase tracking-[0.3em] transition-all flex items-center gap-4 shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_50px_rgba(79,70,229,0.6)] active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {isSimulating ? (
              <Zap className="w-4 h-4 animate-pulse" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            {isSimulating ? 'Processing...' : 'Simulate Analysis Flow'}
          </button>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: isSimulating ? '100%' : '0%' }}
          transition={{ duration: 8.5, ease: "linear" }}
          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
      </div>
    </div>
  );
};

