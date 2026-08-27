import React from 'react';
import {
  Calculator,
  BarChart3,
  Percent,
  Building2,
  BookOpen,
  Sparkles,
  Printer,
  Sliders,
  Layers,
  Calendar,
  Scale,
  ShieldCheck,
  RotateCcw,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { PRESET_SCENARIOS } from '../data/taxTables';
import { CompanyInput, SimulationYear } from '../types/tax';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mode: 'wizard' | 'advanced';
  setMode: (mode: 'wizard' | 'advanced') => void;
  simulationYear: SimulationYear;
  setSimulationYear: (year: SimulationYear) => void;
  onSelectPreset: (presetId: string) => void;
  onPrint: () => void;
  onOpenReportModal?: () => void;
  onOpenNewAnalysis?: () => void;
  currentInput: CompanyInput;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  mode,
  setMode,
  simulationYear,
  setSimulationYear,
  onSelectPreset,
  onPrint,
  onOpenReportModal,
  onOpenNewAnalysis,
  currentInput,
}) => {
  return (
    <header id="main-header" className="bg-white border-b border-indigo-100 sticky top-0 z-40 shadow-xs">
      {/* Top Banner & Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branding & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
              Σ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-indigo-950 tracking-tight flex items-center">
                  Simula<span className="text-indigo-600">Reforma</span>
                </h1>
                <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Reforma 2027
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Simulador Tributário • Híbrido vs Simplificado vs Presumido & Real
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1.5 md:hidden">
            {onOpenNewAnalysis && (
              <button
                id="mobile-new-analysis-btn"
                onClick={onOpenNewAnalysis}
                className="text-xs font-bold p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1"
                title="Nova Análise"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              id="mobile-year-toggle"
              onClick={() => setSimulationYear(simulationYear === '2027_transicao' ? '2033_pleno' : '2027_transicao')}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              {simulationYear === '2027_transicao' ? '2027' : '2033'}
            </button>
          </div>
        </div>

        {/* Action Controls & Presets */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* BOTÃO PRINCIPAL: NOVA ANÁLISE */}
          {onOpenNewAnalysis && (
            <button
              id="new-analysis-btn"
              onClick={onOpenNewAnalysis}
              title="Iniciar uma nova simulação limpa ou a partir de um exemplo"
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer hover:border-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Nova Análise</span>
            </button>
          )}

          {/* Preset Selector */}
          <div className="relative">
            <select
              id="preset-scenario-select"
              onChange={(e) => {
                if (e.target.value) {
                  onSelectPreset(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-100 transition-colors max-w-[190px] sm:max-w-none truncate"
            >
              <option value="" disabled>
                ⚡ Casos Prontos (Farmácia, TI...)
              </option>
              {PRESET_SCENARIOS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.title} ({preset.category})
                </option>
              ))}
            </select>
          </div>

          {/* Year Switcher (2027 vs 2033) */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              id="year-2027-btn"
              onClick={() => setSimulationYear('2027_transicao')}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                simulationYear === '2027_transicao'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-950'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              2027 (Transição)
            </button>
            <button
              id="year-2033-btn"
              onClick={() => setSimulationYear('2033_pleno')}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                simulationYear === '2033_pleno'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-950'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              2033 (Pleno)
            </button>
          </div>

          {/* Wizard / Advanced Mode Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              id="mode-wizard-btn"
              onClick={() => setMode('wizard')}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'wizard'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-950'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Passo a Passo
            </button>
            <button
              id="mode-advanced-btn"
              onClick={() => setMode('advanced')}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'advanced'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-indigo-950'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Avançado
            </button>
          </div>

          {/* Export / Print Button */}
          <div className="flex items-center gap-1.5">
            {onOpenReportModal && (
              <button
                id="view-report-modal-btn"
                onClick={onOpenReportModal}
                title="Visualizar Relatório Completo em Formato Retrato"
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white shadow-sm transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Ver Relatório A4</span>
              </button>
            )}

            <button
              id="print-report-btn"
              onClick={onPrint}
              title="Gerar Relatório em PDF / Imprimir"
              className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200 transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none py-2 border-t border-indigo-50 text-xs sm:text-sm font-bold">
          <button
            id="tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Simulador & Regimes
          </button>

          <button
            id="tab-pre-post-reform"
            onClick={() => setActiveTab('pre_post_reform')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'pre_post_reform'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            Antes x Depois da Reforma
          </button>

          <button
            id="tab-monofasico-st"
            onClick={() => setActiveTab('monofasico_st')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'monofasico_st'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Monofásico & ICMS-ST
          </button>

          <button
            id="tab-charts"
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'charts'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Gráficos & Cargas
          </button>

          <button
            id="tab-factor-r"
            onClick={() => setActiveTab('factor_r')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'factor_r'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60'
            }`}
          >
            <Percent className="w-4 h-4" />
            Calculadora Fator R
          </button>

          <button
            id="tab-b2b-impact"
            onClick={() => setActiveTab('b2b_impact')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'b2b_impact'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Impacto Comercial B2B
          </button>

          <button
            id="tab-guide"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Guia da Reforma 2027
          </button>

          <button
            id="tab-ai-consultant"
            onClick={() => setActiveTab('ai_consultant')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'ai_consultant'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Parecer IA & Consultoria
          </button>
        </nav>
      </div>
    </header>
  );
};
