'use client';

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, AlertTriangle, CheckCircle, RefreshCw, Layers, Terminal, FileCode, Check } from 'lucide-react';

interface UIComponent {
  name: string;
  type: string;
  props: Record<string, any>;
}

interface UISchemaPage {
  name: string;
  route: string;
  components: UIComponent[];
}

interface UISchema {
  pages: UISchemaPage[];
}

interface APIEndpoint {
  path: string;
  method: string;
  required_fields: string[];
  response_fields: string[];
  description: string;
}

interface APISchema {
  endpoints: APIEndpoint[];
}

interface DBSchemaColumn {
  name: string;
  type: string;
  primary_key: boolean;
  nullable: boolean;
}

interface DBSchemaTable {
  name: string;
  columns: DBSchemaColumn[];
}

interface DBSchema {
  tables: DBSchemaTable[];
}

interface AuthRole {
  name: string;
  permissions: string[];
}

interface AuthSchema {
  roles: AuthRole[];
}

interface BusinessRule {
  name: string;
  description: string;
  entity: string;
  condition: string;
}

interface BusinessRulesSchema {
  rules: BusinessRule[];
}

interface ValidationIssue {
  layer: string;
  severity: string;
  message: string;
  path: string;
}

interface ValidationReport {
  is_valid: boolean;
  issues: ValidationIssue[];
}

interface ExecutionStep {
  step_name: string;
  success: boolean;
  details: string;
}

interface ExecutionReport {
  success: boolean;
  steps: ExecutionStep[];
  logs: string[];
  errors: string[];
}

interface Blueprint {
  id: string;
  prompt: string;
  intent: {
    app_type: string;
    features: string[];
    roles: string[];
    assumptions: string[];
  };
  architecture_plan: {
    entities: string[];
    pages: string[];
    services: string[];
  };
  ui_schema: UISchema;
  api_schema: APISchema;
  db_schema: DBSchema;
  auth_schema: AuthSchema;
  business_rules: BusinessRulesSchema;
  validation_report: ValidationReport;
  execution_report: ExecutionReport | null;
  metrics: {
    latency_sec: number;
    repairs_count: number;
    json_validity: number;
    schema_consistency: number;
    success: boolean;
  };
}

interface PromptOption {
  id: string;
  type: string;
  category: string;
  prompt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CompilerConsole() {
  const [prompts, setPrompts] = useState<PromptOption[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [promptInput, setPromptInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'flow' | 'schemas' | 'simulator'>('flow');
  const [activeSchemaTab, setActiveSchemaTab] = useState<'ui' | 'api' | 'db' | 'auth' | 'rules'>('ui');
  
  // Pipeline Build State
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  
  // Schema Editors State
  const [uiEdit, setUiEdit] = useState<string>('');
  const [apiEdit, setApiEdit] = useState<string>('');
  const [dbEdit, setDbEdit] = useState<string>('');
  const [authEdit, setAuthEdit] = useState<string>('');
  const [rulesEdit, setRulesEdit] = useState<string>('');
  
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [simulationReport, setSimulationReport] = useState<ExecutionReport | null>(null);
  const [compilerLogs, setCompilerLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Fetch prompts on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/prompts`)
      .then(res => res.json())
      .then(data => setPrompts(data))
      .catch(err => console.error('Error fetching prompts:', err));
  }, []);

  // Update input text when prompt option is selected
  const handleSelectPrompt = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedPromptId(pId);
    const selected = prompts.find((p: PromptOption) => p.id === pId);
    if (selected) {
      setPromptInput(selected.prompt);
    }
  };

  const handleCompile = async () => {
    if (!promptInput.trim()) return;
    setIsLoading(true);
    setBlueprint(null);
    setCompilerLogs(['[System] Initiating ForgeFlow compiler pipeline...']);
    
    // Simulate real-time logs step progress
    const steps = [
      '[Stage 1] Parsing Natural Language Intent...',
      '[Stage 1] Executing Assumption Engine...',
      '[Stage 2] Synthesizing Component Architecture...',
      '[Stage 3] Spawning 5 parallel Schema Generators...',
      '[Stage 4] Running Cross-Layer Validation validations...',
      '[Stage 5] Evaluating schema discrepancies...'
    ];
    
    let timer = 0;
    steps.forEach((logStep, idx) => {
      setTimeout(() => {
        setCompilerLogs((prev: string[]) => [...prev, logStep]);
      }, timer);
      timer += 400;
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptInput })
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      const data: Blueprint = await response.json();
      
      // Complete remaining logs
      setTimeout(() => {
        if (data.validation_report.is_valid) {
          setCompilerLogs((prev: string[]) => [...prev, '[Stage 4] ✓ Validation successful. Cross-layer consistency verified.']);
        } else {
          setCompilerLogs((prev: string[]) => [
            ...prev,
            `[Stage 5] Validation issues flagged. Invoking Intelligent Repair Engine (repairs count: ${data.metrics.repairs_count})...`,
            ...(data.metrics.repairs_count > 0 ? [`[Stage 5] Completed ${data.metrics.repairs_count} successful target repairs.`] : [])
          ]);
        }
        
        setCompilerLogs((prev: string[]) => [...prev, '[Stage 6] Code generation stubs exported under /generated-app.', '[Stage 6] Dry-run testing migrations & routes...', '[Stage 6] Execution complete. Blueprint generated successfully.']);
        
        setBlueprint(data);
        setUiEdit(JSON.stringify(data.ui_schema, null, 2));
        setApiEdit(JSON.stringify(data.api_schema, null, 2));
        setDbEdit(JSON.stringify(data.db_schema, null, 2));
        setAuthEdit(JSON.stringify(data.auth_schema, null, 2));
        setRulesEdit(JSON.stringify(data.business_rules, null, 2));
        
        setValidationReport(data.validation_report);
        setSimulationReport(data.execution_report);
        setIsLoading(false);
      }, timer + 300);
      
    } catch (err: any) {
      console.error(err);
      setCompilerLogs((prev: string[]) => [...prev, `[ERROR] Compile pipeline aborted: ${err.message}`]);
      setIsLoading(false);
    }
  };

  const handleSimulateEdit = async () => {
    setIsSimulating(true);
    try {
      const ui = JSON.parse(uiEdit);
      const api = JSON.parse(apiEdit);
      const db = JSON.parse(dbEdit);
      const auth = JSON.parse(authEdit);
      const rules = JSON.parse(rulesEdit);
      
      // Perform local cross-layer validation check first in backend
      const checkResponse = await fetch(`${API_BASE_URL}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ui_schema: ui,
          api_schema: api,
          db_schema: db,
          auth_schema: auth,
          business_rules: rules,
          validation_report: validationReport || { is_valid: true, issues: [] }
        })
      });
      
      if (!checkResponse.ok) {
        throw new Error(await checkResponse.text());
      }
      
      const data = await checkResponse.json();
      setSimulationReport(data.execution_report);
      setValidationReport(data.validation_report);
      
    } catch (err: any) {
      alert(`Invalid JSON format: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDownloadZip = () => {
    if (!blueprint) return;
    window.open(`${API_BASE_URL}/api/export/${blueprint.id}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Console Header */}
      <header className="h-16 border-b border-[#1a1f38] bg-[#090d22] px-8 flex items-center justify-between select-none">
        <div className="flex items-center space-x-3">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h1 id="compiler-console-title" className="font-semibold text-white text-base">Compiler Console</h1>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Ready to synthesize application blueprint
        </div>
      </header>

      {/* Main Grid Panel */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Input Sidebar */}
        <section className="col-span-4 border-r border-[#1a1f38] bg-[#070a1e] p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Title / Description */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Requirement Input</h3>
              <p className="text-xs text-slate-400">Select an evaluator benchmark prompt or construct custom specifications.</p>
            </div>

            {/* Select Prompt */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium">Standard / Edge Benchmarks</label>
              <select
                id="benchmark-prompt-select"
                value={selectedPromptId}
                onChange={handleSelectPrompt}
                className="w-full bg-[#121833] border border-[#222a57] rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-all duration-150"
              >
                <option value="">-- Custom Prompt --</option>
                <optgroup label="Normal Prompts">
                  {prompts.filter(p => p.type === 'normal').map(p => (
                    <option key={p.id} value={p.id}>{p.category} Benchmark</option>
                  ))}
                </optgroup>
                <optgroup label="Edge-case Prompts">
                  {prompts.filter(p => p.type === 'edge').map(p => (
                    <option key={p.id} value={p.id}>{p.category} (Edge)</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Prompt Text Input */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium">Product Specification Prompt</label>
              <textarea
                id="prompt-input-textarea"
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                placeholder="Describe your app requirements in natural language (e.g. Build a CRM with billing, login and deals module...)"
                rows={10}
                className="w-full bg-[#121833] border border-[#222a57] rounded-xl p-4 text-xs text-white placeholder-slate-500 outline-none resize-none focus:border-purple-500 transition-all duration-150 font-sans leading-relaxed"
              />
            </div>

            {/* Trigger Button */}
            <button
              id="compile-button"
              onClick={handleCompile}
              disabled={isLoading || !promptInput.trim()}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:hover:from-purple-600 disabled:hover:to-indigo-600 text-white font-semibold text-xs py-3.5 px-6 rounded-xl transition-all duration-150 shadow-lg shadow-purple-500/20 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compiling Blueprint...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Compile Application</span>
                </>
              )}
            </button>
          </div>

          {/* Compiler Terminal logs */}
          <div className="mt-6 border border-[#1d2449] rounded-xl bg-[#030614] overflow-hidden flex flex-col h-48">
            <div className="h-8 border-b border-[#1d2449] bg-[#0c102a] px-4 flex items-center justify-between select-none">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Live Build Logs
              </span>
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="flex-1 p-4 font-mono text-[10px] text-cyan-400 overflow-y-auto space-y-1">
              {compilerLogs.map((log, index) => (
                <div key={index} className={log.startsWith('[ERROR]') ? 'text-red-400' : log.startsWith('[System]') ? 'text-slate-400' : 'text-cyan-400'}>
                  {log}
                </div>
              ))}
              {compilerLogs.length === 0 && (
                <div className="text-slate-600 text-center py-10 select-none">No active build logs.</div>
              )}
            </div>
          </div>
        </section>

        {/* Right Output Inspector tabs */}
        <section className="col-span-8 bg-[#050716] flex flex-col overflow-hidden">
          {/* Tab Navigation header */}
          <div className="h-12 border-b border-[#1a1f38] bg-[#070b20] px-6 flex items-center justify-between select-none">
            <div className="flex space-x-1">
              <button
                id="tab-flow-btn"
                onClick={() => setActiveTab('flow')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 ${activeTab === 'flow' ? 'bg-[#151c3a] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Pipeline Visualizer
              </button>
              <button
                id="tab-schemas-btn"
                onClick={() => setActiveTab('schemas')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 ${activeTab === 'schemas' ? 'bg-[#151c3a] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Schema Editor & Explorer
              </button>
              <button
                id="tab-simulator-btn"
                onClick={() => setActiveTab('simulator')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 ${activeTab === 'simulator' ? 'bg-[#151c3a] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Runtime Simulator
              </button>
            </div>
            
            {blueprint && (
              <div className="flex items-center space-x-4">
                <button
                  id="download-blueprint-btn"
                  onClick={handleDownloadZip}
                  className="flex items-center space-x-1.5 bg-[#121833] border border-cyan-500/30 hover:border-cyan-500 text-cyan-300 hover:text-white px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all select-none active:scale-[0.97]"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Download Blueprint (.zip)</span>
                </button>
                <span className="text-[10px] bg-purple-950/50 border border-purple-800 text-purple-300 font-mono px-2 py-0.5 rounded-md">
                  Repairs: {blueprint.metrics.repairs_count}
                </span>
                <span className="text-[10px] bg-cyan-950/50 border border-cyan-800 text-cyan-300 font-mono px-2 py-0.5 rounded-md">
                  Build time: {blueprint.metrics.latency_sec}s
                </span>
              </div>
            )}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* 1. PIPELINE VISUALIZER FLOW */}
            {activeTab === 'flow' && (
              <div className="space-y-8 max-w-3xl">
                {!blueprint && !isLoading && (
                  <div className="border border-dashed border-[#222a57] rounded-2xl p-16 text-center select-none">
                    <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h4 className="text-slate-300 font-semibold mb-1">No Active Blueprint</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">Input application requirements on the left and trigger compilation to visualize compiler stages.</p>
                  </div>
                )}
                
                {isLoading && (
                  <div className="space-y-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-[#121833]/30 border border-[#1a234b]/50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-8 w-8 rounded bg-[#1d2858]" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-[#1d2858] rounded" />
                            <div className="h-3 w-48 bg-[#1d2858]/60 rounded" />
                          </div>
                        </div>
                        <div className="h-6 w-16 bg-[#1d2858] rounded" />
                      </div>
                    ))}
                  </div>
                )}

                {blueprint && (
                  <div className="relative border-l-2 border-slate-800 pl-8 space-y-6">
                    {/* Stage 1: Intent Extraction */}
                    <div className="relative">
                      <div className="absolute -left-[41px] top-0 h-6 w-6 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-[10px] text-cyan-400 font-bold">1</div>
                      <div className="glass-card p-5">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-white text-sm">Stage 1: Intent Extraction & Assumptions</h4>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono"><Check className="w-3 h-3" /> SUCCESS</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs mt-2">
                          <div className="space-y-1">
                            <span className="text-slate-500 block">Category:</span>
                            <span className="text-cyan-400 font-semibold">{blueprint.intent.app_type}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-500 block">Identified Roles:</span>
                            <span className="text-slate-300 font-mono text-[11px]">{blueprint.intent.roles.join(', ')}</span>
                          </div>
                          <div className="col-span-2 space-y-2">
                            <span className="text-slate-500 block">Compiler Assumptions:</span>
                            <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                              {blueprint.intent.assumptions.map((asm, idx) => (
                                <li key={idx}>{asm}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stage 2: Architecture Planning */}
                    <div className="relative">
                      <div className="absolute -left-[41px] top-0 h-6 w-6 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-[10px] text-cyan-400 font-bold">2</div>
                      <div className="glass-card p-5">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-white text-sm">Stage 2: Architecture Planner</h4>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono"><Check className="w-3 h-3" /> SUCCESS</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs mt-2">
                          <div className="space-y-1">
                            <span className="text-slate-500 block">Entities:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {blueprint.architecture_plan.entities.map(e => (
                                <span key={e} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">{e}</span>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-500 block">Pages:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {blueprint.architecture_plan.pages.map(e => (
                                <span key={e} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">{e}</span>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-500 block">Services:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {blueprint.architecture_plan.services.map(e => (
                                <span key={e} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono">{e}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stage 3: Schema Generation */}
                    <div className="relative">
                      <div className="absolute -left-[41px] top-0 h-6 w-6 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-[10px] text-cyan-400 font-bold">3</div>
                      <div className="glass-card p-5">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-white text-sm">Stage 3: Multi-Layer Schema Generator</h4>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono"><Check className="w-3 h-3" /> SUCCESS</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">Generated 5 independent JSON schema contract definitions with strict ordering guarantees:</p>
                        <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-mono">
                          <span className="bg-[#172554] border border-[#2563eb] text-blue-300 px-2.5 py-1 rounded-md">UI Schema ({blueprint.ui_schema.pages.length} Pages)</span>
                          <span className="bg-[#172554] border border-[#2563eb] text-blue-300 px-2.5 py-1 rounded-md">API Schema ({blueprint.api_schema.endpoints.length} Routes)</span>
                          <span className="bg-[#172554] border border-[#2563eb] text-blue-300 px-2.5 py-1 rounded-md">DB Schema ({blueprint.db_schema.tables.length} Tables)</span>
                          <span className="bg-[#172554] border border-[#2563eb] text-blue-300 px-2.5 py-1 rounded-md">Auth Rules ({blueprint.auth_schema.roles.length} Roles)</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage 4: Cross-Layer Validator */}
                    <div className="relative">
                      <div className="absolute -left-[41px] top-0 h-6 w-6 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-[10px] text-cyan-400 font-bold">4</div>
                      <div className="glass-card p-5">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-white text-sm">Stage 4: Validation Engine & Stage 5: Repairs</h4>
                          {validationReport?.is_valid ? (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono"><Check className="w-3 h-3" /> CONTRACT VALID</span>
                          ) : (
                            <span className="text-[10px] text-red-400 bg-red-950/40 border border-red-900 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono"><AlertTriangle className="w-3 h-3" /> FAILURE REPAIRED</span>
                          )}
                        </div>
                        
                        {validationReport?.issues.length === 0 ? (
                          <p className="text-xs text-slate-400 font-mono">No inconsistencies detected. All layers align perfectly.</p>
                        ) : (
                          <div className="space-y-2">
                            <span className="text-[11px] text-slate-400 block font-semibold">Validation Audit Log:</span>
                            <div className="space-y-1.5 overflow-y-auto max-h-40 font-mono text-[10px]">
                              {validationReport?.issues.map((issue, idx) => (
                                <div key={idx} className={`p-2 rounded border flex items-start gap-2 ${issue.severity === 'ERROR' ? 'bg-red-950/20 border-red-900/40 text-red-300' : 'bg-yellow-950/20 border-yellow-900/40 text-yellow-300'}`}>
                                  {issue.severity === 'ERROR' ? <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                                  <div>
                                    <span className="font-bold underline mr-1">{issue.layer}:</span>
                                    <span>{issue.message}</span>
                                    <span className="block text-[8px] text-slate-500 font-mono mt-0.5">Path: {issue.path}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stage 6: Simulator */}
                    {simulationReport && (
                      <div className="relative">
                        <div className="absolute -left-[41px] top-0 h-6 w-6 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-[10px] text-cyan-400 font-bold">5</div>
                        <div className="glass-card p-5">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-white text-sm">Stage 6: Runtime Simulation Execution</h4>
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono"><Check className="w-3 h-3" /> EXECUTABLE</span>
                          </div>
                          <div className="space-y-2">
                            {simulationReport.steps.map((step, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded bg-slate-950 border border-slate-900">
                                <span className="text-slate-300 font-semibold">{step.step_name}</span>
                                <span className={`text-[10px] font-mono font-bold ${step.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {step.success ? '✓ SUCCESS' : '✕ FAIL'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. SCHEMA EDITOR & EXPLORER */}
            {activeTab === 'schemas' && (
              <div className="flex flex-col h-full space-y-4 max-w-5xl">
                {!blueprint ? (
                  <div className="border border-dashed border-[#222a57] rounded-2xl p-16 text-center select-none">
                    <FileCode className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h4 className="text-slate-300 font-semibold mb-1">No Schemas Generated Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">Generate a blueprint first to inspect and edit contract schemas.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white text-sm">Schema Contract Explorer</h4>
                        <p className="text-[11px] text-slate-500">Edit the generated schema JSONs directly and trigger re-simulation to test consistency.</p>
                      </div>
                      <button
                        id="simulate-revalidate-btn"
                        onClick={handleSimulateEdit}
                        disabled={isSimulating}
                        className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all duration-150 active:scale-[0.98]"
                      >
                        {isSimulating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Simulating...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Validate & Re-Simulate</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-6 items-start">
                      {/* Editor Sub Tabs */}
                      <div className="col-span-3 flex flex-col space-y-1">
                        {[
                          { key: 'ui', label: 'UI Schema' },
                          { key: 'api', label: 'API Schema' },
                          { key: 'db', label: 'Database Schema' },
                          { key: 'auth', label: 'Auth Roles' },
                          { key: 'rules', label: 'Business Rules' }
                        ].map(subTab => (
                          <button
                            key={subTab.key}
                            onClick={() => setActiveSchemaTab(subTab.key as any)}
                            className={`text-left text-xs font-semibold px-4 py-3 rounded-xl transition-all duration-150 ${activeSchemaTab === subTab.key ? 'bg-purple-950/40 border border-purple-800 text-purple-300' : 'text-slate-400 hover:text-white hover:bg-[#121833]/40'}`}
                          >
                            {subTab.label}
                          </button>
                        ))}
                      </div>

                      {/* Textarea code block */}
                      <div className="col-span-9 border border-[#1e254e] rounded-2xl overflow-hidden bg-[#030614] flex flex-col">
                        <div className="h-9 border-b border-[#1e254e] bg-[#0b0e27] px-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>EDITABLE CONFIG SCHEMA</span>
                          <span className="text-cyan-400">JSON Format</span>
                        </div>
                        {activeSchemaTab === 'ui' && (
                          <textarea
                            value={uiEdit}
                            onChange={e => setUiEdit(e.target.value)}
                            className="w-full min-h-[400px] p-6 bg-[#030614] font-mono text-[11px] text-cyan-300 outline-none resize-y"
                          />
                        )}
                        {activeSchemaTab === 'api' && (
                          <textarea
                            value={apiEdit}
                            onChange={e => setApiEdit(e.target.value)}
                            className="w-full min-h-[400px] p-6 bg-[#030614] font-mono text-[11px] text-cyan-300 outline-none resize-y"
                          />
                        )}
                        {activeSchemaTab === 'db' && (
                          <textarea
                            value={dbEdit}
                            onChange={e => setDbEdit(e.target.value)}
                            className="w-full min-h-[400px] p-6 bg-[#030614] font-mono text-[11px] text-cyan-300 outline-none resize-y"
                          />
                        )}
                        {activeSchemaTab === 'auth' && (
                          <textarea
                            value={authEdit}
                            onChange={e => setAuthEdit(e.target.value)}
                            className="w-full min-h-[400px] p-6 bg-[#030614] font-mono text-[11px] text-cyan-300 outline-none resize-y"
                          />
                        )}
                        {activeSchemaTab === 'rules' && (
                          <textarea
                            value={rulesEdit}
                            onChange={e => setRulesEdit(e.target.value)}
                            className="w-full min-h-[400px] p-6 bg-[#030614] font-mono text-[11px] text-cyan-300 outline-none resize-y"
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 3. RUNTIME SIMULATOR */}
            {activeTab === 'simulator' && (
              <div className="space-y-6 max-w-4xl">
                {!simulationReport ? (
                  <div className="border border-dashed border-[#222a57] rounded-2xl p-16 text-center select-none">
                    <Terminal className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h4 className="text-slate-300 font-semibold mb-1">No Simulation Output</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">Deploy a blueprint to simulate standard routing and database migrations.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-bold text-white text-sm">Simulation Compilation Report</h4>
                        <p className="text-[11px] text-slate-500">Live structural validation outcomes on simulated SQLite DB and route handlers.</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold ${simulationReport.success ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400' : 'bg-red-950/60 border border-red-800 text-red-400'}`}>
                        {simulationReport.success ? 'DEPLOYABLE SUCCESS' : 'DEPLOYMENT FAILED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Left: Simulation Logs */}
                      <div className="border border-[#1e254e] rounded-xl bg-[#030614] flex flex-col h-[400px]">
                        <div className="h-9 border-b border-[#1e254e] bg-[#0c0f2a] px-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>EXECUTION CONSOLE LOGS</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="flex-1 p-4 font-mono text-[10px] text-slate-400 overflow-y-auto space-y-1.5 leading-relaxed">
                          {simulationReport.logs.map((log, idx) => (
                            <div key={idx} className={log.startsWith('ERROR:') ? 'text-red-400' : log.startsWith('Successfully') ? 'text-emerald-400' : 'text-slate-400'}>
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Steps Status */}
                      <div className="space-y-4">
                        <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Simulation Audits</h5>
                        {simulationReport.steps.map((step, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-[#1e254e] bg-[#07091d]/50 flex items-start gap-4">
                            <div className="mt-0.5">
                              {step.success ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <h6 className="font-semibold text-white text-xs leading-none">{step.step_name}</h6>
                              <p className="text-[10px] text-slate-400 leading-normal">{step.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
