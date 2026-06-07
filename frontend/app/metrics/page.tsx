'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { TrendingUp, Clock, ShieldAlert, CheckCircle, RefreshCw, Play } from 'lucide-react';

interface RunResult {
  id: string;
  type: string;
  category: string;
  prompt: string;
  success: boolean;
  latency: number;
  repairs: number;
  json_validity: number;
  schema_consistency: number;
  error_log: string[];
}

interface EvaluationMetrics {
  success_rate: number;
  average_latency: number;
  average_repairs: number;
  json_validity: number;
  schema_consistency: number;
  runs: RunResult[];
  evaluated_at: string;
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  // Fetch metrics data on mount
  const fetchMetrics = () => {
    setIsLoading(true);
    fetch('http://localhost:8000/api/metrics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching metrics:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRunEvaluation = async () => {
    setIsTriggering(true);
    try {
      const response = await fetch('http://localhost:8000/api/evaluate', {
        method: 'POST'
      });
      if (response.ok) {
        alert("Evaluation suite triggered in background! This will take a few seconds. Refresh metrics shortly.");
      } else {
        alert("Failed to trigger evaluation.");
      }
    } catch (e) {
      console.error(e);
      alert("Error triggering evaluation.");
    } finally {
      setIsTriggering(false);
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#060814]">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-slate-400 text-xs font-mono">Loading telemetry metrics...</span>
        </div>
      </div>
    );
  }

  // Pre-calculate chart formatted data
  const chartData = metrics?.runs.map((run: RunResult, index: number) => ({
    name: `${index + 1}. ${run.category}`,
    latency: run.success ? run.latency : 0,
    repairs: run.repairs,
    type: run.type === 'normal' ? 'Normal' : 'Edge-case'
  })) || [];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-[#1a1f38] bg-[#090d22] px-8 flex items-center justify-between select-none">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h1 id="metrics-dashboard-title" className="font-semibold text-white text-base">Metrics & Benchmarks</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            id="metrics-reload-btn"
            onClick={fetchMetrics}
            disabled={isLoading}
            className="flex items-center space-x-1.5 bg-[#121833] border border-[#222a57] text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
          
          <button
            id="run-evaluation-btn"
            onClick={handleRunEvaluation}
            disabled={isTriggering}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run 20-Prompt Suite</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {metrics && (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-5 gap-6 select-none">
              <div className="glass-card p-5 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Compiler Success</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-emerald-400">{metrics.success_rate}%</span>
                </div>
                <div className="text-[10px] text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Targets &gt; 94% Contract Target
                </div>
              </div>

              <div className="glass-card p-5 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Avg Latency</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-cyan-400">{metrics.average_latency}s</span>
                </div>
                <div className="text-[10px] text-cyan-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> End-to-end Compile Pipeline
                </div>
              </div>

              <div className="glass-card p-5 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Avg Repairs</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-purple-400">{metrics.average_repairs}</span>
                </div>
                <div className="text-[10px] text-purple-500 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Automatic Corrections Loop
                </div>
              </div>

              <div className="glass-card p-5 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">JSON Validity</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-white">{metrics.json_validity}%</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Strict schema validations
                </div>
              </div>

              <div className="glass-card p-5 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Layer Consistency</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-teal-400">{metrics.schema_consistency}%</span>
                </div>
                <div className="text-[10px] text-teal-500">
                  Cross-layer integration score
                </div>
              </div>
            </div>

            {/* Recharts Charts Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Latency Chart */}
              <div className="glass-card p-6 flex flex-col h-[320px]">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Prompt compilation latencies</h4>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1d2449" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} label={{ value: 'Seconds', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10 } }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#090d22', borderColor: '#1a1f38', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#22d3ee', fontSize: '10px' }}
                      />
                      <Bar dataKey="latency" name="Latency (sec)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Repairs Chart */}
              <div className="glass-card p-6 flex flex-col h-[320px]">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Targeted repairs required</h4>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1d2449" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={9} tickLine={false} label={{ value: 'Attempts', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10 } }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#090d22', borderColor: '#1a1f38', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#c084fc', fontSize: '10px' }}
                      />
                      <Area type="monotone" dataKey="repairs" name="Repair Loop Steps" stroke="#8b5cf6" fill="rgba(139, 92, 246, 0.15)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed Runs Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Historical Evaluation Run List</h4>
              <div className="border border-[#1a1f38] bg-[#090d22]/50 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="bg-[#0b0e27] border-b border-[#1a1f38] text-slate-400 font-mono text-[10px] select-none">
                      <th className="p-4">Benchmark ID</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Prompt Context</th>
                      <th className="p-4">Latency</th>
                      <th className="p-4">Repairs</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1f38]/60 text-slate-300">
                    {metrics.runs.map((run: RunResult) => (
                      <tr key={run.id} className="hover:bg-[#131b3e]/30 transition-all font-sans">
                        <td className="p-4 font-mono text-[11px] font-semibold text-white">{run.category}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${run.type === 'normal' ? 'bg-blue-950/40 border border-blue-900 text-blue-300' : 'bg-amber-950/40 border border-amber-900 text-amber-300'}`}>
                            {run.type === 'normal' ? 'Normal' : 'Edge-case'}
                          </span>
                        </td>
                        <td className="p-4 max-w-sm truncate text-slate-400 text-[11px]">{run.prompt}</td>
                        <td className="p-4 font-mono text-cyan-400">{run.latency}s</td>
                        <td className="p-4 font-mono text-purple-400">{run.repairs}</td>
                        <td className="p-4 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono ${run.success ? 'bg-emerald-950/50 border border-emerald-900 text-emerald-400' : 'bg-red-950/50 border border-red-900 text-red-400'}`}>
                            {run.success ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
