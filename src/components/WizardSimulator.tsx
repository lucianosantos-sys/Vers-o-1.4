import React, { useState } from 'react';
import {
  Store,
  Factory,
  Wrench,
  HardHat,
  Cpu,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Pill,
  Car,
  Beer,
  Fuel,
  Sparkles,
  Sliders,
  TrendingUp,
  Scale,
  DollarSign,
  Percent,
  Layers,
  HelpCircle,
  RotateCcw,
  Printer,
  FileText,
  Building2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { AnexoType, BusinessSegment, CompanyInput, RegimeResult, SimulationSummary } from '../types/tax';
import { ActivitySegregationPanel } from './ActivitySegregationPanel';
import { IbsCbsRateConfigurator } from './IbsCbsRateConfigurator';
import { MonofasicoStSegregationPanel } from './MonofasicoStSegregationPanel';
import { ReductionRateioConfigurator } from './ReductionRateioConfigurator';
import { ProfitMarginTargetSimulator } from './ProfitMarginTargetSimulator';
import { B2BImpactAnalysis } from './B2BImpactAnalysis';
import { SimplesEnquadramentoPanel } from './SimplesEnquadramentoPanel';

interface WizardSimulatorProps {
  input: CompanyInput;
  summary?: SimulationSummary;
  onChange: (updated: Partial<CompanyInput>) => void;
  onOpenNewAnalysis?: () => void;
  onOpenReportModal?: () => void;
  onPrint?: () => void;
}

export const WizardSimulator: React.FC<WizardSimulatorProps> = ({
  input,
  summary,
  onChange,
  onOpenNewAnalysis,
  onOpenReportModal,
  onPrint,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const totalPayroll = input.monthlyPayroll + input.monthlyProLabore;
  const operationalCosts = totalPayroll + input.monthlyPurchasesInputs;
  const profitBeforeTaxesMonthly = input.monthlyRevenue - operationalCosts;
  const profitMarginBeforeTaxesPct =
    input.monthlyRevenue > 0 ? (profitBeforeTaxesMonthly / input.monthlyRevenue) * 100 : 0;

  const bestRegimeKey = summary?.bestRegime || 'simples_simplificado';
  const bestRegime = summary?.results?.[bestRegimeKey];
  const considerB2BCompetitiveFactor = summary?.considerB2BCompetitiveFactor ?? (input.considerB2BCompetitiveFactor !== false);

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm p-5 sm:p-8 space-y-6">
      {/* Top Bar with New Analysis Quick Action & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-50 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Descubra o Melhor Regime Tributário para a sua Empresa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Responda 4 perguntas simples sobre o seu negócio e veja o comparativo completo em tempo real (baseado na Lei Complementar nº 214/2025 e LC 123/2006).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenNewAnalysis && (
            <button
              onClick={onOpenNewAnalysis}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Recomeçar simulação do zero ou escolher outro segmento"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Nova Análise</span>
            </button>
          )}

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ver Relatório A4</span>
            </button>
          )}
        </div>
      </div>

      {/* Wizard Progress Bar */}
      <div className="py-2">
        <div className="grid grid-cols-4 gap-2 max-w-3xl mx-auto">
          {[
            { step: 1, title: '1. Atividade', desc: 'Ramo do Negócio' },
            { step: 2, title: '2. Finanças', desc: 'Faturamento & Gastos' },
            { step: 3, title: '3. Benefícios', desc: 'Segregação & Descontos' },
            { step: 4, title: '4. Clientes', desc: 'Vendas B2B x B2C' },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setCurrentStep(item.step as 1 | 2 | 3 | 4)}
                className={`flex flex-col items-center text-center p-2.5 rounded-2xl transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 ring-2 ring-indigo-200'
                    : isCompleted
                    ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mb-1 ${
                    isActive
                      ? 'bg-white text-indigo-700'
                      : isCompleted
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : item.step}
                </span>
                <span className="text-xs font-bold leading-tight">{item.title}</span>
                <span
                  className={`text-[10px] hidden sm:block truncate ${
                    isActive ? 'text-indigo-100' : 'text-slate-500'
                  }`}
                >
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: ACTIVITY & SECTOR SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-indigo-950">
                Passo 1: Qual é o ramo principal da sua empresa?
              </h3>
              <p className="text-xs text-indigo-900 leading-relaxed mt-0.5">
                Selecione abaixo a atividade ou os anexos do Simples Nacional que sua empresa utiliza. Se você vende mais de um tipo de produto ou serviço, pode distribuir o faturamento facilmente.
              </p>
            </div>
          </div>

          <ActivitySegregationPanel input={input} summary={summary} onChange={onChange} />

          {summary?.enquadramento && (
            <SimplesEnquadramentoPanel enquadramento={summary.enquadramento} />
          )}

          <div className="flex justify-between items-center max-w-4xl mx-auto pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              Passo 1 de 4 • Atividade definida
            </span>
            <button
              id="wizard-step1-next"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-100 cursor-pointer"
            >
              Continuar para Finanças
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: REVENUE, PAYROLL & PURCHASES */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-indigo-950">
                Passo 2: Quanto entra e quanto sai por mês na sua empresa?
              </h3>
              <p className="text-xs text-indigo-900 leading-relaxed mt-0.5">
                Informe o faturamento médio mensal, os custos com funcionários e sócios e os gastos com compras de mercadorias.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Faturamento Mensal */}
            {Object.values(input.anexoRevenues || {}).some((v) => Number(v || 0) > 0) ? (
              <div className="md:col-span-2 p-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Faturamento por Atividade (Passo 1)
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white px-3 py-1 rounded-full border border-indigo-200 cursor-pointer shadow-2xs"
                  >
                    Ajustar no Passo 1
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {Object.entries(input.anexoRevenues || {}).map(([key, val]) => {
                    const numVal = Number(val || 0);
                    if (numVal <= 0) return null;
                    const catLabel =
                      key === 'anexo_1'
                        ? 'Comércio (I)'
                        : key === 'anexo_2'
                        ? 'Indústria (II)'
                        : key === 'anexo_3'
                        ? 'Serviços c/ ISS (III)'
                        : key === 'anexo_3_sem_iss'
                        ? 'Serviços Sem ISS'
                        : key === 'anexo_4'
                        ? 'Obras c/ ISS (IV)'
                        : key === 'anexo_4_sem_iss'
                        ? 'Obras Sem ISS'
                        : 'TI / Fator R (V)';
                    return (
                      <div key={key} className="p-2.5 bg-white rounded-xl border border-indigo-100 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 block truncate">{catLabel}</span>
                        <span className="text-xs font-black text-slate-900 font-mono">
                          R$ {numVal.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-indigo-950 bg-white/90 p-3 rounded-xl border border-indigo-100">
                  <span>Faturamento Mensal Total:</span>
                  <span className="font-mono text-sm text-indigo-700 font-black">
                    R$ {input.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl border border-indigo-100 bg-white shadow-2xs">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Faturamento Mensal Médio (R$)
                </label>
                <p className="text-[11px] text-slate-500 font-medium mb-2">
                  Total médio de vendas ou serviços por mês.
                </p>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={input.monthlyRevenue}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      onChange({
                        monthlyRevenue: val,
                        rbt12: val * 12,
                      });
                    }}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  Acumulado anual (RBT12 estimado): R$ {(input.monthlyRevenue * 12).toLocaleString('pt-BR')}
                </p>
              </div>
            )}

            {/* Folha de Pagamento */}
            <div className="p-5 rounded-2xl border border-indigo-100 bg-white shadow-2xs">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Folha de Salários CLT (R$/mês)
              </label>
              <p className="text-[11px] text-slate-500 font-medium mb-2">
                Soma dos salários brutos pagos aos empregados registrados.
              </p>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                  R$
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={input.monthlyPayroll}
                  onChange={(e) => onChange({ monthlyPayroll: Number(e.target.value) || 0 })}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Pró-labore */}
            <div className="p-5 rounded-2xl border border-indigo-100 bg-white shadow-2xs">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Pró-labore dos Sócios (R$/mês)
              </label>
              <p className="text-[11px] text-slate-500 font-medium mb-2">
                Remuneração mensal retirada pelos donos (ajuda a pagar menos no Fator R).
              </p>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                  R$
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={input.monthlyProLabore}
                  onChange={(e) => onChange({ monthlyProLabore: Number(e.target.value) || 0 })}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Compras de Insumos */}
            <div className="p-5 rounded-2xl border border-indigo-100 bg-white shadow-2xs">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Compras de Insumos / Mercadorias (R$/mês)
              </label>
              <p className="text-[11px] text-slate-500 font-medium mb-2">
                Gastos com mercadorias e insumos (geram créditos de IBS/CBS).
              </p>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                  R$
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={input.monthlyPurchasesInputs}
                  onChange={(e) => onChange({ monthlyPurchasesInputs: Number(e.target.value) || 0 })}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Quadro de Rentabilidade */}
            <div className="md:col-span-2 p-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500 text-white rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                    Margem de Lucro da Empresa (Prévia em Tempo Real)
                  </h4>
                  <span className="text-[11px] text-slate-600 font-medium block">
                    Veja quanto sobra no bolso da empresa antes e depois do pagamento dos impostos.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500 font-bold block">
                    Margem Operacional (sem impostos):
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-slate-900">
                      {profitMarginBeforeTaxesPct.toFixed(1)}%
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      R$ {profitBeforeTaxesMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / mês
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-xs text-emerald-800 font-bold block">
                    Margem Líquida Real (com impostos no {bestRegime?.name || 'Melhor Regime'}):
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-emerald-700">
                      {(bestRegime?.profitMarginAfterTaxesPct ?? profitMarginBeforeTaxesPct).toFixed(1)}%
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      R$ {(bestRegime?.profitMarginAfterTaxesMonthly ?? profitBeforeTaxesMonthly).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / mês
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              id="wizard-step2-prev"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Passo 1
            </button>
            <button
              id="wizard-step2-next"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-100 cursor-pointer"
            >
              Continuar para Benefícios & Segregação
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SEGREGAÇÃO DE MONOFÁSICO/ST E ALÍQUOTAS IBS/CBS */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-indigo-950">
                Passo 3: Produtos com impostos já pagos ou benefícios legais
              </h3>
              <p className="text-xs text-indigo-900 leading-relaxed mt-0.5">
                Se você vende remédios, autopeças, cosméticos, bebidas frias ou itens com redução por lei (ex: saúde, educação, cesta básica), informe abaixo para abater o imposto já pago e economizar milhares de reais!
              </p>
            </div>
          </div>

          <MonofasicoStSegregationPanel input={input} summary={summary} onChange={onChange} />

          <ReductionRateioConfigurator
            type="purchases"
            input={input}
            onChange={onChange}
            defaultCombinedRate={input.fullCbsIbsRate || 26.5}
          />

          <ReductionRateioConfigurator
            type="sales"
            input={input}
            onChange={onChange}
            defaultCombinedRate={input.fullCbsIbsRate || 26.5}
          />

          <IbsCbsRateConfigurator input={input} onChange={onChange} />

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              id="wizard-step3-prev"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Passo 2
            </button>
            <button
              id="wizard-step3-next"
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-100 cursor-pointer"
            >
              Continuar para Perfil de Clientes
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: B2B VS B2C PROFILE */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-indigo-950">
                Passo 4: Para quem a sua empresa vende? (Clientes Finais vs Empresas PJ)
              </h3>
              <p className="text-xs text-indigo-900 leading-relaxed mt-0.5">
                Este é o ponto mais importante da Reforma Tributária 2027. Empresas clientes (PJ) vão exigir notas fiscais com crédito integral de IBS e CBS.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Participação das Vendas B2B (Empresas PJ)
                </span>
                <p className="text-xs text-slate-500 font-medium">
                  Empresas clientes que exigem créditos fiscais na nota fiscal.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-indigo-600">{input.b2bPercentage}%</span>
                <span className="block text-[11px] font-bold text-slate-500">
                  {100 - input.b2bPercentage}% Consumidor Final (B2C)
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={input.b2bPercentage}
              onChange={(e) => onChange({ b2bPercentage: Number(e.target.value) })}
              className="w-full accent-indigo-600 h-2.5 bg-slate-200 rounded-lg cursor-pointer"
            />

            {/* Quick shortcuts */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '0% (Só Consumidor B2C)', val: 0 },
                { label: '30% B2B', val: 30 },
                { label: '50% Misto', val: 50 },
                { label: '70% B2B', val: 70 },
                { label: '100% (Só PJ)', val: 100 },
              ].map((btn) => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => onChange({ b2bPercentage: btn.val })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    input.b2bPercentage === btn.val
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  🏢 B2B: R$ {((input.monthlyRevenue * input.b2bPercentage) / 100).toLocaleString('pt-BR')} / mês
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Sensíveis à não-cumulatividade e crédito pleno.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  🛒 B2C: R$ {((input.monthlyRevenue * (100 - input.b2bPercentage)) / 100).toLocaleString('pt-BR')} / mês
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Consumidores finais não aproveitam créditos tributários.
                </p>
              </div>
            </div>
          </div>

          {/* Impacto Comercial B2B Resumido */}
          <B2BImpactAnalysis summary={summary!} onChangeInput={onChange} />

          {/* Critério de Decisão: Considerar Fator Competitivo ou Apenas Imposto Direto */}
          <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                Critério de Avaliação do Resultado
              </span>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {considerB2BCompetitiveFactor
                  ? 'Fator Competitivo ATIVO: Avalia retenção de clientes PJ e créditos tributários de IBS/CBS.'
                  : 'Fator Competitivo DESATIVADO: Avalia estritamente quem paga a menor guia no mês.'}
              </p>
            </div>

            <div className="flex items-center bg-white p-1 rounded-xl border border-indigo-200 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => onChange({ considerB2BCompetitiveFactor: true })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  considerB2BCompetitiveFactor
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                Com Fator Competitivo
              </button>
              <button
                type="button"
                onClick={() => onChange({ considerB2BCompetitiveFactor: false })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !considerB2BCompetitiveFactor
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                Apenas Imposto Direto
              </button>
            </div>
          </div>

          {/* Margem de Lucro e Metas */}
          <ProfitMarginTargetSimulator input={input} summary={summary} onChange={onChange} />

          {/* Verificação Oficial de Enquadramento LC 214/2025 */}
          {summary?.enquadramento && (
            <SimplesEnquadramentoPanel enquadramento={summary.enquadramento} />
          )}

          {/* Conclusão e Ações Finais */}
          <div className="p-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-950">
                    Diagnóstico Completo Concluído!
                  </h3>
                  <p className="text-xs text-emerald-900 font-medium">
                    Regime Recomendado: <strong>{bestRegime?.name}</strong> • Economia Estimada: <strong>R$ {summary?.annualSavings.toLocaleString('pt-BR')}/ano</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {onOpenReportModal && (
                <button
                  onClick={onOpenReportModal}
                  className="flex items-center gap-2 bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Visualizar Relatório Executivo A4
                </button>
              )}

              {onPrint && (
                <button
                  onClick={onPrint}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  Gerar Parecer em PDF / Imprimir
                </button>
              )}

              {onOpenNewAnalysis && (
                <button
                  onClick={onOpenNewAnalysis}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  Nova Simulação
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              id="wizard-step4-prev"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Passo 3
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Simulação ativa e recalculada
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
