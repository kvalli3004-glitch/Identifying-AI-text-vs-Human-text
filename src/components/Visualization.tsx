import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { AnalysisResult } from '../types';

interface VisualizationProps {
  result: AnalysisResult;
}

export const Visualization: React.FC<VisualizationProps> = ({ result }) => {
  const pieData = [
    { name: 'AI Generated', value: result.overallScore },
    { name: 'Human Written', value: 100 - result.overallScore },
  ];

  const COLORS = ['#ef4444', '#10b981'];

  const metricsData = [
    { name: 'Perplexity', value: result.metrics.perplexity },
    { name: 'Burstiness', value: result.metrics.burstiness },
    { name: 'Coherence', value: result.metrics.coherence },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-6">AI vs Human Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#18181b' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-8 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-zinc-500">AI: {result.overallScore}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-500">Human: {100 - result.overallScore}%</span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-6">Linguistic Metrics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metricsData}>
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} />
              <YAxis stroke="#a1a1aa" fontSize={10} />
              <Tooltip 
                cursor={{ fill: '#f4f4f5' }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#18181b' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-zinc-400 text-center mt-4">
          Higher perplexity and burstiness often indicate human writing.
        </p>
      </div>
    </div>
  );
};
