import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Target,
  Sliders,
  DollarSign,
  Percent,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  Calculator,
  RefreshCw,
  Info
} from 'lucide-react';
import { CompanyInput, RegimeResult, SimulationSummary } from '../types/tax';
import { runFullTaxSimulation } from '../utils/taxCalculations';

interface ProfitMarginTargetSimulatorProps {
  input: CompanyInput;
  summary?: SimulationSummary;
  onChange: (updated: Partial<CompanyInput>) => void;
}

export const ProfitMarginTargetSimulator: React.FC<ProfitMarginTargetSimulatorProps> = ({
  input,
  summary,
  onChange,
}) => {
  // Current values
  const totalPayroll = input.monthlyPayroll + input.monthlyProLabore;
  const operationalCosts = totalPayroll + input.monthlyPurchasesInputs;
  const profitBeforeTaxesMonthly = input.monthlyRevenue - operationalCosts;
  const profitMarginBeforeTaxesPct = input.monthlyRevenue > 0 ? (profitBeforeTaxesMonthly / input.monthlyRevenue) * 100 : 0;

  const bestRegimeKey = summary?.bestRegime || summary?.bestCommercialRegime || 'simples_simplificado';
  const bestRegime = summary?.results?.[bestRegimeKey];

  const currentMarginWithTaxesPct = bestRegime ? bestRegime.profitMarginAfterTaxesPct : profitMarginBeforeTaxesPct;
  const currentProfitWithTaxesMonthly = bestRegime ? bestRegime.profitMarginAfterTaxesMonthly : profitBeforeTaxesMonthly;

  // Mode: view or interactive target simulator
  const [isSimulatingTarget, setIsSimulatingTarget] = useState(false);
  const [targetMarginPct, setTargetMarginPct] = useState<number>(
    Math.min(95, Math.max(5, Math.round(currentMarginWithTaxesPct + 5)))
  );
  const [targetMethod, setTargetMethod] = useState<'increase_revenue' | 'reduce_costs' | 'both'>('increase_revenue');

  // Calculate required revenue/costs to achieve target margin with taxes
  const targetScenario = useMemo(() => {
    if (!targetMarginPct || targetMarginPct <= 0 || targetMarginPct >= 100) return null;

    const targetFraction = targetMarginPct / 100;
    const currentEffectiveTaxRate = bestRegime ? (bestRegime.effectiveRatePct / 100) : 0.10; // Tax % over revenue
    
    // Profit after taxes = Revenue - Costs - Taxes
    // Taxes ≈ Revenue * TaxRate
    // Profit after taxes ≈ Revenue * (1 - TaxRate) - Costs
    // Target Margin = Profit after taxes / Revenue = (1 - TaxRate) - (Costs / Revenue)
    // Therefore: Target Margin = (1 - TaxRate) - (Costs / Revenue)
    // Costs / Revenue = 1 - TaxRate - Target Margin
    // Required Revenue = Costs / (1 - TaxRate - Target Margin)

    const denominator = 1 - currentEffectiveTaxRate - targetFraction;

    if (denominator <= 0.02) {
      // Unfeasible solely by revenue if tax rate + target margin >= 100%
      return {
        feasible: false,
        message: 'A meta de margem somada à carga tributária excede 100% da receita. Reduza os custos operacionais ou ajuste a meta.',
        requiredRevenue: input.monthlyRevenue * 1.5,
        requiredPurchases: input.monthlyPurchasesInputs * 0.8,
        deltaRevenue: input.monthlyRevenue * 0.5,
        deltaPurchases: input.monthlyPurchasesInputs * -0.2,
      };
    }

    if (targetMethod === 'increase_revenue') {
      const requiredRevenue = Math.max(0, operationalCosts / denominator);
      const deltaRevenue = requiredRevenue - input.monthlyRevenue;
      
      // Run simulation for preview
      const simInput: CompanyInput = {
        ...input,
        monthlyRevenue: requiredRevenue,
        rbt12: Math.max(input.rbt12, requiredRevenue * 12),
      };
      const simSummary = runFullTaxSimulation(simInput);
      const simBest = simSummary.results[simSummary.bestCommercialRegime];

      return {
        feasible: true,
        method: 'increase_revenue',
        requiredRevenue,
        requiredPurchases: input.monthlyPurchasesInputs,
        deltaRevenue,
        deltaPurchases: 0,
        simSummary,
        simBest,
        newProfitMonthly: simBest.profitMarginAfterTaxesMonthly,
        newTaxAmountMonthly: simBest.totalMonthlyTax,
        newEffectiveTaxRatePct: simBest.effectiveRatePct,
        newDasMonthly: simBest.das.totalDas,
        newIbsCbsMonthly: simBest.ibsCbs.netPayable,
      };
    } else if (targetMethod === 'reduce_costs') {
      // Keep revenue, solve for required costs
      // Costs = Revenue * (1 - TaxRate - Target Margin)
      const maxAllowedCosts = Math.max(0, input.monthlyRevenue * denominator);
      const neededCostReduction = Math.max(0, operationalCosts - maxAllowedCosts);
      const newPurchases = Math.max(0, input.monthlyPurchasesInputs - neededCostReduction);
      
      const simInput: CompanyInput = {
        ...input,
        monthlyPurchasesInputs: newPurchases,
      };
      const simSummary = runFullTaxSimulation(simInput);
      const simBest = simSummary.results[simSummary.bestCommercialRegime];

      return {
        feasible: true,
        method: 'reduce_costs',
        requiredRevenue: input.monthlyRevenue,
        requiredPurchases: newPurchases,
        deltaRevenue: 0,
        deltaPurchases: newPurchases - input.monthlyPurchasesInputs,
        neededCostReduction,
        simSummary,
        simBest,
        newProfitMonthly: simBest.profitMarginAfterTaxesMonthly,
        newTaxAmountMonthly: simBest.totalMonthlyTax,
        newEffectiveTaxRatePct: simBest.effectiveRatePct,
        newDasMonthly: simBest.das.totalDas,
        newIbsCbsMonthly: simBest.ibsCbs.netPayable,
      };
    } else {
      // 'both': 50% from revenue increase, 50% from cost reduction
      const reqRev = input.monthlyRevenue * 1.15;
      const allowedCosts = reqRev * (1 - currentEffectiveTaxRate - targetFraction);
      const newPurchases = Math.max(0, input.monthlyPurchasesInputs - (operationalCosts - allowedCosts));

      const simInput: CompanyInput = {
        ...input,
        monthlyRevenue: reqRev,
        rbt12: Math.max(input.rbt12, reqRev * 12),
        monthlyPurchasesInputs: newPurchases,
      };
      const simSummary = runFullTaxSimulation(simInput);
      const simBest = simSummary.results[simSummary.bestCommercialRegime];

      return {
        feasible: true,
        method: 'both',
        requiredRevenue: reqRev,
        requiredPurchases: newPurchases,
        deltaRevenue: reqRev - input.monthlyRevenue,
        deltaPurchases: newPurchases - input.monthlyPurchasesInputs,
        simSummary,
        simBest,
        newProfitMonthly: simBest.profitMarginAfterTaxesMonthly,
        newTaxAmountMonthly: simBest.totalMonthlyTax,
        newEffectiveTaxRatePct: simBest.effectiveRatePct,
        newDasMonthly: simBest.das.totalDas,
        newIbsCbsMonthly: simBest.ibsCbs.netPayable,
      };
    }
  }, [input, bestRegime, operationalCosts, targetMarginPct, targetMethod]);

  const applyScenarioToMainInput = () => {
    if (!targetScenario || !targetScenario.feasible) return;
    onChange({
      monthlyRevenue: Math.round(targetScenario.requiredRevenue),
      rbt12: Math.max(input.rbt12, Math.round(targetScenario.requiredRevenue * 12)),
      monthlyPurchasesInputs: Math.round(targetScenario.requiredPurchases),
    });
  };

  return (
    <div className="rounded-2xl border-2 border-emerald-300 bg-white shadow-xs p-5 sm:p-6 space-y-4">
      {/* Header with icon matching user image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              MARGEM DE LUCRO DA EMPRESA (PRÉVIA EM TEMPO REAL)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Comparativo de rentabilidade operacional antes e depois de todos os impostos.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSimulatingTarget(!isSimulatingTarget)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto ${
            isSimulatingTarget
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <Target className="w-4 h-4 text-emerald-600" />
          {isSimulatingTarget ? 'Ocultar Simulador de Meta' : 'Simular Aumento de Margem'}
        </button>
      </div>

      {/* Main 2-Box Display (Exact Match to User Image) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1: Margem sem impostos */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-xs sm:text-sm font-bold text-slate-600 block">
            Margem de Lucro sem considerar impostos:
          </span>
          <div className="flex items-baseline gap-2.5 pt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {profitMarginBeforeTaxesPct.toFixed(1)}%
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-600">
              R$ {profitBeforeTaxesMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / mês
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium block pt-1">
            Faturamento − Insumos − Folha e Pró-labore
          </span>
        </div>

        {/* Box 2: Margem com impostos */}
        <div className="p-4 sm:p-5 bg-emerald-50/40 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
          <span className="text-xs sm:text-sm font-bold text-emerald-900 block">
            Margem de Lucro considerando impostos:
          </span>
          <div className="flex items-baseline gap-2.5 pt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {currentMarginWithTaxesPct.toFixed(1)}%
            </span>
            <span className="text-sm sm:text-base font-bold text-emerald-800">
              R$ {currentProfitWithTaxesMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / mês
            </span>
          </div>
          <span className="text-xs text-emerald-700 font-medium block pt-1">
            Retenção líquida final ({bestRegime?.name || 'Melhor Regime'})
          </span>
        </div>
      </div>

      {/* Target Profit Margin Simulator Accordion / Panel */}
      {isSimulatingTarget && (
        <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                <Target className="w-5 h-5 text-emerald-400" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Estratégia de Otimização: Aumentar Margem de Lucro Líquida
                </h4>
                <p className="text-xs text-indigo-200">
                  Simule como o aumento da sua margem impacta o faturamento necessário, custos e o valor dos tributos (Guia DAS e IBS/CBS).
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Target % Slider and Strategy Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slider */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                  Qual margem de lucro líquida você deseja alcançar?
                </label>
                <span className="text-xl font-black text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                  {targetMarginPct}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="85"
                step="1"
                value={targetMarginPct}
                onChange={(e) => setTargetMarginPct(Number(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-white/20 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-indigo-300 font-medium">
                <span>Atual: {currentMarginWithTaxesPct.toFixed(1)}%</span>
                <span>Alavancagem: +{(targetMarginPct - currentMarginWithTaxesPct).toFixed(1)}%</span>
                <span>Máx: 85%</span>
              </div>
            </div>

            {/* Strategy Method */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider block">
                Como você planeja atingir esta margem?
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTargetMethod('increase_revenue')}
                  className={`p-2 rounded-lg text-center transition-all cursor-pointer font-bold ${
                    targetMethod === 'increase_revenue'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                  }`}
                >
                  Aumentar Vendas / Preço
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMethod('reduce_costs')}
                  className={`p-2 rounded-lg text-center transition-all cursor-pointer font-bold ${
                    targetMethod === 'reduce_costs'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                  }`}
                >
                  Reduzir Insumos
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMethod('both')}
                  className={`p-2 rounded-lg text-center transition-all cursor-pointer font-bold ${
                    targetMethod === 'both'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                  }`}
                >
                  Estratégia Mista
                </button>
              </div>
            </div>
          </div>

          {/* Results Comparison Grid */}
          {targetScenario && targetScenario.feasible && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Required Revenue */}
                <div className="p-3.5 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-[11px] text-indigo-200 font-bold block">
                    Faturamento Mensal Necessário:
                  </span>
                  <div className="text-lg font-black text-white mt-1">
                    R$ {targetScenario.requiredRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </div>
                  {targetScenario.deltaRevenue !== 0 && (
                    <span className="text-[10px] text-emerald-300 font-semibold block mt-0.5">
                      {targetScenario.deltaRevenue > 0 ? '+' : ''}
                      R$ {targetScenario.deltaRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / mês
                    </span>
                  )}
                </div>

                {/* Tributação Total Projetada */}
                <div className="p-3.5 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-[11px] text-indigo-200 font-bold block">
                    Tributação Total Estimada:
                  </span>
                  <div className="text-lg font-black text-amber-300 mt-1">
                    R$ {targetScenario.newTaxAmountMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / mês
                  </div>
                  <span className="text-[10px] text-indigo-200 font-medium block mt-0.5">
                    Alíquota Efetiva: {targetScenario.newEffectiveTaxRatePct.toFixed(2)}%
                  </span>
                </div>

                {/* Lucro Líquido Final */}
                <div className="p-3.5 bg-emerald-900/40 rounded-xl border border-emerald-500/40">
                  <span className="text-[11px] text-emerald-200 font-bold block">
                    Lucro Líquido no Bolso (Pós-Impostos):
                  </span>
                  <div className="text-lg font-black text-emerald-300 mt-1">
                    R$ {targetScenario.newProfitMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / mês
                  </div>
                  <span className="text-[10px] text-emerald-200 font-semibold block mt-0.5">
                    Margem Efetiva: {targetMarginPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Tax Details in Target Scenario */}
              <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-white block">
                    Comportamento das Guias na Meta de {targetMarginPct}% de Margem:
                  </span>
                  <div className="text-indigo-200 text-[11px] space-x-4">
                    <span>
                      Guia DAS / IRPJ-CSLL:{' '}
                      <strong className="text-white">
                        R$ {targetScenario.newDasMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </strong>
                    </span>
                    <span>
                      IBS/CBS Líquido:{' '}
                      <strong className="text-white">
                        R$ {targetScenario.newIbsCbsMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </strong>
                    </span>
                    <span>
                      Melhor Regime:{' '}
                      <strong className="text-emerald-300">{targetScenario.simBest?.name}</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={applyScenarioToMainInput}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Aplicar Valores ao Simulador
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
