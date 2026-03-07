import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle, 
  Info, 
  Sparkles,
  RefreshCcw,
  Search,
  Upload,
  BarChart3,
  BrainCircuit,
  ShieldCheck,
  Layers,
  Trash2,
  History
} from 'lucide-react';
import { AnalysisResult, ModelOption, HistoryRecord, SystemLog, Section, ParallelAnalysisResult, ProcessingStep } from '../types';
import { analyzeTextWithGemini } from '../services/geminiService';
import { runParallelAnalysis } from '../services/multiModelService';
import { Visualization } from './Visualization';
import { Workflow } from './Workflow';
import { Logs } from './Logs';
import { Sidebar } from './Sidebar';
import { ModelComparison } from './ModelComparison';
import { ProcessingPipeline } from './ProcessingPipeline';
import { MODELS } from '../constants';

export const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('detection');
  const [text, setText] = useState('');
  const [model, setModel] = useState<ModelOption>('roberta');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [parallelResult, setParallelResult] = useState<ParallelAnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [workflowStep, setWorkflowStep] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [isParallelMode, setIsParallelMode] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<ProcessingStep[]>([
    { id: 'preprocess', label: 'Preprocessing', status: 'pending' },
    { id: 'parallel-run', label: 'Running Models in Parallel', status: 'pending' },
    { id: 'aggregate', label: 'Aggregating Results', status: 'pending' },
    { id: 'final-result', label: 'Final Prediction', status: 'pending' },
  ]);

  useEffect(() => {
    fetchHistory();
    fetchLogs();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  const addLog = async (level: 'info' | 'warn' | 'error', message: string) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message }),
      });
      fetchLogs();
    } catch (err) {
      console.error('Failed to add log', err);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setParallelResult(null);
    setError(null);
    setWorkflowStep(0);
    
    // Reset pipeline steps
    setPipelineSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
    
    addLog('info', `User input received. Starting ${isParallelMode ? 'Parallel' : 'Single Model'} analysis...`);

    try {
      if (isParallelMode) {
        const activeModels: ModelOption[] = ['roberta', 'gemini', 'gpt'];
        
        const res = await runParallelAnalysis(text, activeModels, (stepId, status) => {
          setPipelineSteps(prev => prev.map(s => s.id === stepId ? { ...s, status } : s));
          
          // Map pipeline steps to workflow steps for backward compatibility if needed
          if (stepId === 'preprocess' && status === 'completed') setWorkflowStep(1);
          if (stepId === 'parallel-run' && status === 'completed') setWorkflowStep(2);
          if (stepId === 'aggregate' && status === 'completed') setWorkflowStep(3);
        });

        setParallelResult(res);
        setResult(res.finalResult);
        
        fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.substring(0, 100),
            result_json: JSON.stringify(res.finalResult),
            model_used: 'parallel-ensemble'
          }),
        }).then(fetchHistory);

      } else {
        setTimeout(() => setWorkflowStep(1), 1000);
        setTimeout(() => setWorkflowStep(2), 2500);
        
        const analysisResult = await analyzeTextWithGemini(text);
        
        setTimeout(() => {
          setWorkflowStep(3);
          setResult(analysisResult);
          addLog('info', 'Prediction completed successfully.');
          
          fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: text.substring(0, 100),
              result_json: JSON.stringify(analysisResult),
              model_used: model
            }),
          }).then(fetchHistory);
        }, 4000);
      }
      
      setIsAnalyzing(false);
    } catch (err) {
      setIsAnalyzing(false);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      addLog('error', `Prediction failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target?.result as string);
        addLog('info', `Document uploaded: ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  const handleSelectHistory = (record: HistoryRecord) => {
    const res = JSON.parse(record.result_json);
    setResult(res);
    setText(record.text);
    setActiveSection('detection');
    addLog('info', `Loaded analysis from history (ID: ${record.id})`);
  };

  const clearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistory([]);
      addLog('warn', 'Analysis history cleared by user.');
    } catch (err) {
      console.error('Failed to clear history', err);
    }
  };

  const deleteHistory = async (id: number) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      setHistory(prev => prev.filter(h => h.id !== id));
      addLog('info', `Deleted history record (ID: ${id})`);
    } catch (err) {
      console.error('Failed to delete history', err);
    }
  };

  const clearLogs = async () => {
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      setLogs([]);
    } catch (err) {
      console.error('Failed to clear logs', err);
    }
  };

  const deleteLog = async (id: number) => {
    try {
      await fetch(`/api/logs/${id}`, { method: 'DELETE' });
      setLogs(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Failed to delete log', err);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="space-y-8">
            <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-100 text-center">
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-6" />
              <h2 className="text-4xl font-black mb-4 text-zinc-900">Welcome to AI Detector</h2>
              <p className="text-zinc-500 max-w-2xl mx-auto mb-8">
                The most advanced platform for identifying machine-generated content. 
                Switch to the Text Detection section to start your analysis.
              </p>
              <button 
                onClick={() => setActiveSection('detection')}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                Start Detection
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <BrainCircuit className="w-8 h-8 text-purple-500 mb-4" />
                <h3 className="font-bold mb-2 text-zinc-900">Neural Analysis</h3>
                <p className="text-xs text-zinc-500">Deep learning models trained on billions of parameters.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4" />
                <h3 className="font-bold mb-2 text-zinc-900">High Accuracy</h3>
                <p className="text-xs text-zinc-500">Industry-leading precision in identifying AI patterns.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <BarChart3 className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="font-bold mb-2 text-zinc-900">Detailed Metrics</h3>
                <p className="text-xs text-zinc-500">Perplexity and burstiness scores for every analysis.</p>
              </div>
            </div>
          </div>
        );

      case 'detection':
        return (
          <div className="space-y-8">
            {/* Input Section */}
            <div className="relative group">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste text here for analysis..."
                className="w-full h-64 bg-white border border-zinc-200 rounded-2xl p-6 text-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-zinc-300 shadow-sm"
              />
              <div className="absolute bottom-6 right-6 flex items-center gap-3">
                <div className="flex items-center gap-2 mr-4 bg-zinc-50 p-1.5 rounded-xl border border-zinc-200">
                  <button 
                    onClick={() => setIsParallelMode(false)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${!isParallelMode ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                  >
                    Single
                  </button>
                  <button 
                    onClick={() => setIsParallelMode(true)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${isParallelMode ? 'bg-emerald-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                  >
                    Parallel
                  </button>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !text.trim()}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
                >
                  {isAnalyzing ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
                </button>
              </div>
            </div>

            {/* Pipeline Visualization */}
            <AnimatePresence>
              {(isAnalyzing || result) && isParallelMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <ProcessingPipeline 
                    steps={pipelineSteps} 
                    activeModels={['roberta', 'gemini', 'gpt']} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simplified Results Section */}
            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Classification & Probability Header */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-center">
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2">Final Classification</div>
                      <div className={`text-4xl font-black ${
                        result.classification === 'AI-GENERATED' ? 'text-red-500' : 
                        result.classification === 'HUMAN-WRITTEN' ? 'text-emerald-500' : 'text-orange-500'
                      }`}>
                        {result.classification}
                      </div>
                      <p className="mt-4 text-sm text-zinc-600 leading-relaxed italic">
                        {result.explanation}
                      </p>
                    </div>
                    
                    <div className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-6">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                          <span className="text-red-500">AI Probability</span>
                          <span className="text-zinc-900">{Math.round(result.overallScore)}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.overallScore}%` }}
                            className="h-full bg-red-500"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                          <span className="text-emerald-500">Human Probability</span>
                          <span className="text-zinc-900">{100 - Math.round(result.overallScore)}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${100 - result.overallScore}%` }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlighted Text Analysis Section */}
                  <div className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Highlighted Analysis</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">AI-Generated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">Human-Written</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8 rounded-xl bg-zinc-50 border border-zinc-100 font-serif text-xl leading-[1.8] text-zinc-800">
                      {result.segments.map((segment, i) => (
                        <span 
                          key={i}
                          className={`relative group inline px-1.5 py-0.5 rounded-md transition-all cursor-help mx-0.5 ${
                            segment.label === 'ai' 
                              ? 'bg-red-100 text-red-900 border-b-2 border-red-300 hover:bg-red-200' 
                              : 'bg-emerald-100 text-emerald-900 border-b-2 border-emerald-300 hover:bg-emerald-200'
                          }`}
                        >
                          {segment.text}
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-900 text-[11px] font-bold text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-2xl scale-95 group-hover:scale-100">
                            <span className={segment.label === 'ai' ? 'text-red-400' : 'text-emerald-400'}>
                              {segment.label.toUpperCase()}
                            </span>
                            <span className="mx-2 text-white/20">|</span>
                            {Math.round(segment.score * 100)}% Confidence
                          </span>
                        </span>
                      ))}
                    </div>

                    <div className="mt-8 space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 mb-4">Detailed Segment Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.segments.map((segment, i) => (
                          <div 
                            key={i}
                            className={`p-4 rounded-xl border transition-all hover:bg-zinc-50 ${
                              segment.label === 'ai' 
                                ? 'bg-red-50/50 border-red-100' 
                                : 'bg-emerald-50/50 border-emerald-100'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${segment.label === 'ai' ? 'text-red-500' : 'text-emerald-500'}`}>
                                Segment {i + 1} • {Math.round(segment.score * 100)}% {segment.label === 'ai' ? 'AI' : 'Human'}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-600 leading-relaxed italic">
                              "{segment.explanation}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Parallel Model Comparison Table */}
                  {parallelResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm"
                    >
                      <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Model Consensus Breakdown</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-100">
                              <th className="py-4 px-4 text-[10px] uppercase text-zinc-400 font-bold">Model</th>
                              <th className="py-4 px-4 text-[10px] uppercase text-zinc-400 font-bold">Prediction</th>
                              <th className="py-4 px-4 text-[10px] uppercase text-zinc-400 font-bold">Confidence</th>
                              <th className="py-4 px-4 text-[10px] uppercase text-zinc-400 font-bold">AI Score</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs">
                            {parallelResult.modelResults.map((m) => (
                              <tr key={m.modelId} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                                <td className="py-4 px-4 font-bold text-zinc-900 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  {MODELS.find(mod => mod.id === m.modelId)?.name || m.modelId}
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    m.result.overallScore > 50 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                  }`}>
                                    {m.result.overallScore > 50 ? 'AI Generated' : 'Human Written'}
                                  </span>
                                </td>
                                <td className="py-4 px-4 font-mono text-zinc-500">
                                  {(m.confidence * 100).toFixed(1)}%
                                </td>
                                <td className="py-4 px-4">
                                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500" 
                                      style={{ width: `${m.result.overallScore}%` }}
                                    />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'workflow':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-zinc-900">Parallel Processing Workflow</h2>
            <Workflow activeStep={isAnalyzing ? workflowStep : (result ? 3 : -1)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-zinc-900">
                  <BrainCircuit className="w-5 h-5 text-blue-500" />
                  Neural Inference
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  The system utilizes a transformer-based architecture to analyze semantic coherence and structural patterns. 
                  Each sentence is processed in parallel to determine the probability of machine generation.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <Layers className="w-5 h-5 text-emerald-500 mb-4" />
                <h3 className="font-bold mb-4 text-zinc-900">Feature Extraction</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Linguistic features such as perplexity (predictability) and burstiness (variance in sentence structure) 
                  are extracted during the tokenization phase to differentiate between human and AI writing styles.
                </p>
              </div>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-zinc-900">AI vs Human Distribution & Metrics</h2>
            {result ? (
              <Visualization result={result} />
            ) : (
              <div className="p-12 rounded-3xl bg-white border border-zinc-200 shadow-sm text-center">
                <BarChart3 className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                <p className="text-zinc-400">No analysis data available. Please run a detection first.</p>
              </div>
            )}
          </div>
        );

      case 'models':
        return <ModelComparison />;

      case 'logs':
        return (
          <Logs 
            logs={logs} 
            onDeleteLog={deleteLog} 
            onClearLogs={clearLogs} 
          />
        );      case 'history':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900">Chat History</h2>
              {history.length > 0 && (
                <div className="relative">
                  {!showClearConfirm ? (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All History
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase mr-2">Are you sure?</span>
                      <button
                        onClick={() => {
                          clearHistory();
                          setShowClearConfirm(false);
                        }}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold hover:bg-red-600 transition-all shadow-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-bold hover:bg-zinc-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {history.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {history.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => handleSelectHistory(record)}
                    className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-blue-600 uppercase tracking-widest">{record.model_used}</span>
                      <span className="text-[10px] text-zinc-400">{new Date(record.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-zinc-700 line-clamp-2">{record.text}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-white border border-zinc-200 shadow-sm text-center">
                <History className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                <p className="text-zinc-400">No analysis history found.</p>
              </div>
            )}
          </div>
        );
;

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-white/20">
            <BarChart3 className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Section coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#f9fafb] text-zinc-900 overflow-hidden">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        model={model}
        onModelChange={setModel}
        history={history} 
        onSelectHistory={handleSelectHistory}
        onClearHistory={clearHistory}
        onDeleteHistory={deleteHistory}
      />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
