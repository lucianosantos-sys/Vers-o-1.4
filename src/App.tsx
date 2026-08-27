import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { WizardSimulator } from './components/WizardSimulator';
import { AdvancedSimulator } from './components/AdvancedSimulator';
import { RegimeComparisonCards } from './components/RegimeComparisonCards';
import { CalculationAuditModal } from './components/CalculationAuditModal';
import { PrePostReformComparison } from './components/PrePostReformComparison';
import { MonofasicoStSegregationPanel } from './components/MonofasicoStSegregationPanel';
import { SectorLegislationSelector } from './components/SectorLegislationSelector';
import { IbsCbsRateConfigurator } from './components/IbsCbsRateConfigurator';
import { FatorRCalculator } from './components/FatorRCalculator';
import { B2BImpactAnalysis } from './components/B2BImpactAnalysis';
import { TaxCharts } from './components/TaxCharts';
import { ReformGuide } from './components/ReformGuide';
import { AiTaxAdvisory } from './components/AiTaxAdvisory';
import { PrintReport } from './components/PrintReport';
import { NewAnalysisModal } from './components/NewAnalysisModal';
import { ReportModal } from './components/ReportModal';
import { CompanyInput, RegimeType, SimulationYear } from './types/tax';
import { PRESET_SCENARIOS } from './data/taxTables';
import { runFullTaxSimulation } from './utils/taxCalculations';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [mode, setMode] = useState<'wizard' | 'advanced'>('wizard');
  const [simulationYear, setSimulationYear] = useState<SimulationYear>('2027_transicao');
  const [auditModalRegime, setAuditModalRegime] = useState<RegimeType | null>(null);
  const [isNewAnalysisModalOpen, setIsNewAnalysisModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Initial State: Realistic Default Profile
  const [input, setInput] = useState<CompanyInput>({
    companyName: 'Minha Empresa Ltda',
    cnpj: '00.000.000/0001-00',
    anexo: 'anexo_1',
    anexoRevenues: {
      anexo_1: 100000,
      anexo_2: 0,
      anexo_3: 0,
      anexo_3_sem_iss: 0,
      anexo_4: 0,
      anexo_4_sem_iss: 0,
      anexo_5: 0,
    },
    businessSegment: 'farmacia',
    monofasicoPisCofinsPercentage: 75,
    icmsStPercentage: 80,
    rbt12: 1200000,
    monthlyRevenue: 100000,
    monthlyPayroll: 18000,
    monthlyProLabore: 6000,
    monthlyPurchasesInputs: 45000,
    creditEligibilityPct: 85,
    b2bPercentage: 40,
    b2bDisputeDiscountPct: 15,
    lucroRealMarginPct: 12,
    simulationYear: '2027_transicao',
    cbsRate2027: 0.9,
    ibsRate2027: 0.1,
    fullCbsIbsRate: 26.5,
    issRate: 5.0,
    icmsEffectiveRate: 18.0,
    useCustomIbsCbsRate: false,
    customCbsRatePct: 8.8,
    customIbsRatePct: 17.7,
    healthDiscountRatePct: 60,
  });

  const handleUpdateInput = (updated: Partial<CompanyInput>) => {
    setInput((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (preset && preset.input) {
      setInput((prev) => ({
        ...prev,
        ...preset.input,
      }));
      setActiveTab('simulator');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetAnalysis = (newValues?: Partial<CompanyInput>) => {
    if (newValues) {
      setInput((prev) => ({
        ...prev,
        ...newValues,
      }));
    }
    setActiveTab('simulator');
    setMode('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  // Run Real-Time Calculation Engine
  const summary = useMemo(() => {
    return runFullTaxSimulation({
      ...input,
      simulationYear,
    });
  }, [input, simulationYear]);

  return (
    <div className="min-h-screen bg-indigo-50/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mode={mode}
        setMode={setMode}
        simulationYear={simulationYear}
        setSimulationYear={setSimulationYear}
        onSelectPreset={handleSelectPreset}
        onPrint={handlePrint}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenNewAnalysis={() => setIsNewAnalysisModalOpen(true)}
        currentInput={input}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* TAB 1: SIMULATOR & COMPARATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Input Section (Wizard or Advanced) */}
            {mode === 'wizard' ? (
              <WizardSimulator
                input={input}
                summary={summary}
                onChange={handleUpdateInput}
                onOpenNewAnalysis={() => setIsNewAnalysisModalOpen(true)}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onPrint={handlePrint}
              />
            ) : (
              <AdvancedSimulator input={input} summary={summary} onChange={handleUpdateInput} />
            )}

            {/* Live Comparison Output Cards */}
            <RegimeComparisonCards
              summary={summary}
              onOpenAudit={(regime) => setAuditModalRegime(regime)}
              onChange={handleUpdateInput}
            />
          </div>
        )}

        {/* TAB 2: BEFORE VS AFTER REFORM COMPARISON */}
        {activeTab === 'pre_post_reform' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <PrePostReformComparison summary={summary} />
            <IbsCbsRateConfigurator input={input} onChange={handleUpdateInput} />
          </div>
        )}

        {/* TAB 3: MONOFASICO & ICMS-ST SEGREGAÇÃO + LEGISLAÇÃO */}
        {activeTab === 'monofasico_st' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SectorLegislationSelector input={input} summary={summary} onChange={handleUpdateInput} />
            <MonofasicoStSegregationPanel input={input} summary={summary} onChange={handleUpdateInput} />
            <IbsCbsRateConfigurator input={input} onChange={handleUpdateInput} />
          </div>
        )}

        {/* TAB 4: CHARTS & CARGAS */}
        {activeTab === 'charts' && (
          <div className="animate-in fade-in duration-200">
            <TaxCharts summary={summary} />
          </div>
        )}

        {/* TAB 5: FATOR R CALCULATOR */}
        {activeTab === 'factor_r' && (
          <div className="animate-in fade-in duration-200">
            <FatorRCalculator summary={summary} onChangeInput={handleUpdateInput} />
          </div>
        )}

        {/* TAB 6: B2B COMMERCIAL IMPACT */}
        {activeTab === 'b2b_impact' && (
          <div className="animate-in fade-in duration-200">
            <B2BImpactAnalysis summary={summary} onChangeInput={handleUpdateInput} />
          </div>
        )}

        {/* TAB 7: EDUCATIONAL REFORM GUIDE */}
        {activeTab === 'guide' && (
          <div className="animate-in fade-in duration-200">
            <ReformGuide />
          </div>
        )}

        {/* TAB 8: AI TAX ADVISORY */}
        {activeTab === 'ai_consultant' && (
          <div className="animate-in fade-in duration-200">
            <AiTaxAdvisory summary={summary} />
          </div>
        )}
      </main>

      {/* Audit / Math Calculation Dialog */}
      <CalculationAuditModal
        regimeResult={auditModalRegime ? summary.results[auditModalRegime] : null}
        input={input}
        onClose={() => setAuditModalRegime(null)}
      />

      {/* New Analysis Selector Dialog */}
      <NewAnalysisModal
        isOpen={isNewAnalysisModalOpen}
        onClose={() => setIsNewAnalysisModalOpen(false)}
        onConfirmReset={handleResetAnalysis}
        onSelectPreset={handleSelectPreset}
      />

      {/* On-screen Portrait Report Preview & Print Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        summary={summary}
        onChangeInput={handleUpdateInput}
      />

      {/* Hidden Printable Report for window.print() */}
      <PrintReport summary={summary} />

      {/* Footer */}
      <footer className="bg-white border-t border-indigo-100 px-8 py-4 flex flex-col sm:flex-row justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-auto print:hidden gap-2">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span>
          Simulador Simples Nacional 2027 — Versão 2.6.0
        </span>
        <span className="text-slate-400">Ref: Lei Complementar 123/06 & Reforma Tributária EC 132/23</span>
      </footer>
    </div>
  );
}
