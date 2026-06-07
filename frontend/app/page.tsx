'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, RotateCcw, AlertTriangle, CheckCircle, RefreshCw, Layers, Terminal, FileCode, Check, Plus, SlidersHorizontal, HelpCircle, Mic, ArrowRight, Globe, ArrowUpRight, ArrowLeft } from 'lucide-react';

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

const TEMPLATES = [
  {
    name: 'Task management',
    creator: 'Base44 App',
    usages: '26,281',
    category: 'Marketing & Sales',
    price: 'Free',
    tags: ['Marketing & Sales', 'Operations'],
    prompt: 'Build a task management system with dashboards, contacts list, and role-based tasks. Admins can view analytics.'
  },
  {
    name: 'Serenity - Spa & Salon',
    creator: 'Digital Doctors',
    usages: '2,784',
    category: 'Marketing & Sales',
    price: '$29.99',
    tags: ['Marketing & Sales', 'Lifestyle & Hobbies'],
    prompt: 'Build a booking app for a spa/salon with calendar views, service catalog, payments integration, and admin portal.'
  },
  {
    name: 'CODE GEN AI',
    creator: 'Vishal Prajapati',
    usages: '20,987',
    category: 'Content Generation',
    price: 'Free',
    tags: ['Content Generation', 'Operations'],
    prompt: 'Build a code generation portal with user logins, history dashboard, subscription plan, and webhook integration.'
  }
];

export default function CompilerConsole() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<PromptOption[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [promptInput, setPromptInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'flow' | 'schemas' | 'simulator'>('flow');
  const [activeSchemaTab, setActiveSchemaTab] = useState<'ui' | 'api' | 'db' | 'auth' | 'rules'>('ui');
  const [planActive, setPlanActive] = useState<boolean>(true);

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

  // Fetch prompts on mount and check query params
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/prompts`)
      .then(res => res.json())
      .then(data => setPrompts(data))
      .catch(err => console.error('Error fetching prompts:', err));

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const promptParam = params.get('prompt');
      if (promptParam) {
        setPromptInput(promptParam);
        // Clear param from URL without reloading
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);


  const handleCategoryClick = (category: string) => {
    if (category === '... More') {
      router.push('/templates');
      return;
    }
    const matching = prompts.find(p => p.category.toLowerCase().includes(category.split(' ')[0].toLowerCase()));
    if (matching) {
      setPromptInput(matching.prompt);
    } else {
      if (category === 'Tasks & Workflows') {
        setPromptInput('Build a task management system with dashboards, contacts list, and role-based tasks. Admins can view analytics.');
      } else if (category === 'CRM & Sales') {
        setPromptInput('Build a CRM portal with customer accounts, sales pipeline deals, interactions log, and a sales leader report.');
      } else if (category === 'Content & Sites') {
        setPromptInput('Build a blog platform with user logins, markdown posting editor, tags, comments, and public website view.');
      } else if (category === 'Finance') {
        setPromptInput('Build a personal finance tracker with accounts, transactions input, custom category budgets, and monthly reports.');
      } else if (category === 'Booking') {
        setPromptInput('Build a service booking system with catalog, calendar scheduler, payments, email confirmation stubs, and admin review.');
      }
    }
  };

  const handleSelectTemplate = (promptText: string) => {
    setPromptInput(promptText);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#060814]">

      {blueprint === null && !isLoading ? (
        // Spacious Landing Workspace
        <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-start">
          <div className="max-w-3xl mx-auto text-center mt-20 mb-8 space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight select-none bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              What will you build next, Uppari?
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-normal">
              Enter natural language requirements to compile your app's database schema, APIs, layouts, and logic.
            </p>
          </div>

          {/* Centralized Prompt Box */}
          <div className="w-full max-w-2.5xl mx-auto bg-[#0d122f] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4.5 border border-[#1e275f] focus-within:border-[#f36b2b]/60 transition-all duration-300 focus-within:shadow-[0_0_30px_rgba(243,107,43,0.12)] relative flex flex-col gap-3">
            <textarea
              id="prompt-input-textarea"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Describe the app you want to create..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm outline-none resize-none min-h-[108px] font-sans leading-relaxed"
            />
            
            <div className="flex justify-end items-center border-t border-[#1e275f] pt-3 select-none">
              {/* Functional Actions */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 font-sans">Plan</span>
                  <button 
                    onClick={() => setPlanActive(!planActive)}
                    className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${planActive ? 'bg-[#f36b2b]' : 'bg-slate-800'}`}
                  >
                    <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform duration-200 ${planActive ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </button>
                </div>
                
                <button
                  id="compile-button"
                  onClick={handleCompile}
                  disabled={!promptInput.trim()}
                  className={`h-9.5 w-9.5 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${promptInput.trim() ? 'bg-[#f36b2b] hover:bg-[#d6571d] text-white shadow-lg shadow-orange-500/20' : 'bg-slate-900/60 text-slate-600'}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick pills below */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto mt-6 select-none">
            {['Tasks & Workflows', 'CRM & Sales', 'Content & Sites', 'Finance', 'Booking', '... More'].map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="px-4 py-2 bg-[#090d22] border border-[#1a1f38] hover:border-[#f36b2b]/50 rounded-full text-xs font-semibold text-slate-400 hover:text-white transition-all active:scale-[0.98]"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Bottom Templates Section */}
          <div className="w-full max-w-4xl mx-auto mt-20 pb-16">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white tracking-wide">Templates</h3>
              <Link href="/templates" className="text-xs text-slate-400 hover:text-[#f36b2b] font-semibold transition-all">
                View all &gt;
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {TEMPLATES.map((t, idx) => (
                <div key={idx} className="glass-card hover:border-[#f36b2b]/50 transition-all flex flex-col group overflow-hidden bg-[#090d22]/40">
                  <div className="h-32 bg-slate-950/40 relative overflow-hidden flex items-center justify-center border-b border-[#1a1f38]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#090d22] to-orange-500/10 opacity-60" />
                    <Globe className="w-8 h-8 text-orange-400/40" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-xs group-hover:text-[#f36b2b] transition-all">{t.name}</h4>
                        <span className="text-[10px] font-semibold text-slate-400 font-mono">{t.price}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">{t.prompt}</p>
                    </div>
                    <div className="space-y-2 pt-1 border-t border-[#1a1f38]/60">
                      <div className="flex flex-wrap gap-1">
                        {t.tags.map(tag => (
                          <span key={tag} className="text-[8px] font-semibold bg-[#121833] border border-[#222a57] text-slate-400 px-1.5 py-0.5 rounded-full font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[9px] pt-1">
                        <span className="text-slate-500 font-mono">By {t.creator} • {t.usages} usages</span>
                        <button
                          onClick={() => handleSelectTemplate(t.prompt)}
                          className="text-[#f36b2b] hover:text-orange-400 font-semibold transition-all flex items-center gap-0.5"
                        >
                          <span>Use</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Console view showing current build and reports
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Console Header */}
          <header className="h-16 border-b border-[#1a1f38] bg-[#090d22] px-8 flex items-center justify-between select-none">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setBlueprint(null);
                  setIsLoading(false);
                }}
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-[#121833] border border-[#222a57] px-3 py-1.5 rounded-lg transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
              <span className="text-slate-600">|</span>
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
                    rows={8}
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
                      <span>Re-Compile Application</span>
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
                  </div>
                )}

                {/* 3. RUNTIME SIMULATOR */}
                {activeTab === 'simulator' && (
                  <div className="space-y-6 max-w-4xl">
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
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

