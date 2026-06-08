'use client';

import React from 'react';
import { BrainCircuit, Cpu, Zap, Settings, RefreshCw } from 'lucide-react';

export default function AdminAIMonitoringPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-widest block">LLM ENGINE</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">AI Monitoring</h1>
          <p className="text-xs text-slate-600 mt-0.5">Pantau kinerja prediksi, latensi, dan log akurasi LifeLine AI Core.</p>
        </div>
        <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
          <RefreshCw className="h-4 w-4" />
          <span>Restart AI Engine</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-600">Response Time (Latency)</span>
            <Zap className="h-4.5 w-4.5 text-yellow-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">245<span className="text-lg text-slate-500 ml-1">ms</span></div>
          <p className="text-[10px] text-emerald-650 mt-2 font-mono font-bold">Status: OPTIMAL</p>
        </div>
        
        <div className="glass-panel border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-600">Prediction Accuracy</span>
            <BrainCircuit className="h-4.5 w-4.5 text-purple-650" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">96.8<span className="text-lg text-slate-500 ml-1">%</span></div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono font-medium">Berdasarkan 1.2k data latih</p>
        </div>

        <div className="glass-panel border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-600">API Usage (Today)</span>
            <Cpu className="h-4.5 w-4.5 text-cyan-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">4,892<span className="text-lg text-slate-500 ml-1"> req</span></div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono font-medium">Quota remaining: 95%</p>
        </div>
      </div>

      <div className="glass-panel border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-205 pb-4 mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Settings className="h-4 w-4 text-slate-600" />
            <span>AI Configurations</span>
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Model Engine</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Versi spesifik LLM yang digunakan untuk inferensi.</p>
            </div>
            <span className="text-xs font-mono text-purple-650 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200 font-bold">lifeline-ai-core</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Prediction Temperature</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Tingkat variasi prediksi (0.0 = kaku, 1.0 = kreatif).</p>
            </div>
            <span className="text-xs font-mono text-emerald-650 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-bold">0.2 (Strict Mode)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
