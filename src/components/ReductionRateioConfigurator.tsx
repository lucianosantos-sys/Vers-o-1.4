import React from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { CompanyInput, ReductionMode, ReductionTierBreakdown } from '../types/tax';

interface ReductionRateioConfiguratorProps {
  type: 'purchases' | 'sales';
  input: CompanyInput;
  onChange: (updated: Partial<CompanyInput>) => void;
  defaultCombinedRate?: number; // % (ex: 26.5 ou 1.0)
}

export const ReductionRateioConfigurator: React.FC<ReductionRateioConfiguratorProps> = ({
  type,
  input,
  onChange,
  defaultCombinedRate = 26.5,
}) => {
  const isPurchases = type === 'purchases';

  // Mode and Breakdown
  const currentMode: ReductionMode = isPurchases
    ? input.purchasesReductionMode || 'padrao_segmento'
    : input.salesReductionMode || 'padrao_segmento';

  const defaultBaseAmount = isPurchases ? input.monthlyPurchasesInputs : input.monthlyRevenue;

  const currentBreakdown: ReductionTierBreakdown = isPurchases
    ? input.purchasesBreakdown || {
        fullTax: input.monthlyPurchasesInputs || 0,
        reduction30: 0,
        reduction50: 0,
        reduction60: 0,
        reduction70: 0,
        reduction100: 0,
      }
    : input.salesBreakdown || {
        fullTax: input.monthlyRevenue || 0,
        reduction30: 0,
        reduction50: 0,
        reduction60: 0,
        reduction70: 0,
        reduction100: 0,
      };

  const handleModeChange = (newMode: ReductionMode) => {
    if (isPurchases) {
      if (newMode === 'rateio_personalizado' && !input.purchasesBreakdown) {
        onChange({
          purchasesReductionMode: newMode,
          purchasesBreakdown: {
            fullTax: input.monthlyPurchasesInputs || 0,
            reduction30: 0,
            reduction50: 0,
            reduction60: 0,
            reduction70: 0,
            reduction100: 0,
          },
        });
      } else {
        onChange({ purchasesReductionMode: newMode });
      }
    } else {
      if (newMode === 'rateio_personalizado' && !input.salesBreakdown) {
        onChange({
          salesReductionMode: newMode,
          salesBreakdown: {
            fullTax: input.monthlyRevenue || 0,
            reduction30: 0,
            reduction50: 0,
            reduction60: 0,
            reduction70: 0,
            reduction100: 0,
          },
        });
      } else {
        onChange({ salesReductionMode: newMode });
      }
    }
  };

  const handleTierChange = (field: keyof ReductionTierBreakdown, value: number) => {
    const safeVal = Math.max(0, isNaN(value) ? 0 : value);
    const updated = { ...currentBreakdown, [field]: safeVal };
    const sum =
      (updated.fullTax || 0) +
      (updated.reduction30 || 0) +
      (updated.reduction50 || 0) +
      (updated.reduction60 || 0) +
      (updated.reduction70 || 0) +
      (updated.reduction100 || 0);

    if (isPurchases) {
      onChange({
        purchasesBreakdown: updated,
        monthlyPurchasesInputs: sum > 0 ? sum : input.monthlyPurchasesInputs,
      });
    } else {
      onChange({
        salesBreakdown: updated,
        monthlyRevenue: sum > 0 ? sum : input.monthlyRevenue,
      });
    }
  };

  const fillAllFullTax = () => {
    const base = defaultBaseAmount > 0 ? defaultBaseAmount : 10000;
    const updated: ReductionTierBreakdown = {
      fullTax: base,
      reduction30: 0,
      reduction50: 0,
      reduction60: 0,
      reduction70: 0,
      reduction100: 0,
    };
    if (isPurchases) {
      onChange({ purchasesBreakdown: updated, monthlyPurchasesInputs: base });
    } else {
      onChange({ salesBreakdown: updated, monthlyRevenue: base });
    }
  };

  const fillEqualShare = () => {
    const base = defaultBaseAmount > 0 ? defaultBaseAmount : 60000;
    const share = Math.round((base / 6) * 100) / 100;
    const updated: ReductionTierBreakdown = {
      fullTax: share,
      reduction30: share,
      reduction50: share,
      reduction60: share,
      reduction70: share,
      reduction100: share,
    };
    if (isPurchases) {
      onChange({ purchasesBreakdown: updated, monthlyPurchasesInputs: share * 6 });
    } else {
      onChange({ salesBreakdown: updated, monthlyRevenue: share * 6 });
    }
  };

  const resetTiers = () => {
    const updated: ReductionTierBreakdown = {
      fullTax: 0,
      reduction30: 0,
      reduction50: 0,
      reduction60: 0,
      reduction70: 0,
      reduction100: 0,
    };
    if (isPurchases) {
      onChange({ purchasesBreakdown: updated });
    } else {
      onChange({ salesBreakdown: updated });
    }
  };

  // Calculations for current state
  const totalSumBreakdown =
    (currentBreakdown.fullTax || 0) +
    (currentBreakdown.reduction30 || 0) +
    (currentBreakdown.reduction50 || 0) +
    (currentBreakdown.reduction60 || 0) +
    (currentBreakdown.reduction70 || 0) +
    (currentBreakdown.reduction100 || 0);

  const rawBaseRate = (input.useCustomIbsCbsRate ? (input.customCbsRatePct + input.customIbsRatePct) : defaultCombinedRate) / 100;

  const rawWeightedValue =
    (currentBreakdown.fullTax || 0) * 1.0 +
    (currentBreakdown.reduction30 || 0) * 0.7 +
    (currentBreakdown.reduction50 || 0) * 0.5 +
    (currentBreakdown.reduction60 || 0) * 0.4 +
    (currentBreakdown.reduction70 || 0) * 0.3 +
    (currentBreakdown.reduction100 || 0) * 0.0;

  const effectiveWeightedRatePct =
    totalSumBreakdown > 0 ? (rawWeightedValue / totalSumBreakdown) * (rawBaseRate * 100) : rawBaseRate * 100;

  const tiersConfig = [
    {
      id: 'fullTax',
      key: 'fullTax' as keyof ReductionTierBreakdown,
      label: isPurchases ? 'Compras com imposto cheio' : 'Vendas com imposto cheio',
      reductionPct: '0% de redução',
      taxFactor: '100% da alíquota',
      desc: 'Bens e serviços gerais da cadeia produtiva',
      color: 'border-slate-300 focus-within:border-indigo-500 bg-white',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'reduction30',
      key: 'reduction30' as keyof ReductionTierBreakdown,
      label: isPurchases ? 'Compras com redução de 30%' : 'Vendas com redução de 30%',
      reductionPct: '30% de redução',
      taxFactor: '70% da alíquota',
      desc: 'Serviços de profissões intelectuais regulamentadas',
      color: 'border-blue-200 focus-within:border-blue-500 bg-blue-50/20',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'reduction50',
      key: 'reduction50' as keyof ReductionTierBreakdown,
      label: isPurchases ? 'Compras com redução de 50%' : 'Vendas com redução de 50%',
      reductionPct: '50% de redução',
      taxFactor: '50% da alíquota',
      desc: 'Regimes diferenciados específicos',
      color: 'border-amber-200 focus-within:border-amber-500 bg-amber-50/20',
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'reduction60',
      key: 'reduction60' as keyof ReductionTierBreakdown,
      label: isPurchases ? 'Compras com redução de 60%' : 'Vendas com redução de 60%',
      reductionPct: '60% de redução',
      taxFactor: '40% da alíquota',
      desc: 'Saúde, medicamentos, produtos agropecuários e educação',
      color: 'border-emerald-200 focus-within:border-emerald-500 bg-emerald-50/20',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'reduction70',
      key: 'reduction70' as keyof ReductionTierBreakdown,
      label: isPurchases ? 'Compras com redução de 70%' : 'Vendas com redução de 70%',
      reductionPct: '70% de redução',
      taxFactor: '30% da alíquota',
      desc: 'Regimes especiais e regimes setoriais incentivados',
      color: 'border-violet-200 focus-within:border-violet-500 bg-violet-50/20',
      badgeColor: 'bg-violet-100 text-violet-700',
    },
    {
      id: 'reduction100',
      key: 'reduction100' as keyof ReductionTierBreakdown,
      label: isPurchases ? 'Compras com redução de 100%' : 'Vendas com redução de 100%',
      reductionPct: '100% de redução',
      taxFactor: 'Alíquota Zero (Isenção)',
      desc: 'Cesta Básica Nacional e insumos essenciais',
      color: 'border-rose-200 focus-within:border-rose-500 bg-rose-50/20',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-2xl ${
              isPurchases ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            {isPurchases ? <ShoppingBag className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              {isPurchases ? 'Compras que geram crédito' : 'Vendas / Faturamento que geram débito'}
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  currentMode === 'rateio_personalizado'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {currentMode === 'rateio_personalizado' ? 'Rateio Personalizado' : 'Padrão por Segmento'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPurchases
                ? 'Valor em reais das compras mensais por categoria de redução. Se não souber, deixe no padrão ou preencha as faixas.'
                : 'Valor em reais do faturamento mensal por faixa de benefício ou alíquota reduzida da Reforma Tributária.'}
            </p>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold self-start md:self-auto">
          <button
            type="button"
            onClick={() => handleModeChange('padrao_segmento')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              currentMode === 'padrao_segmento'
                ? 'bg-white text-indigo-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Manter padrão por segmento
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('rateio_personalizado')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              currentMode === 'rateio_personalizado'
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Fazer rateio personalizado
          </button>
        </div>
      </div>

      {/* Mode: Padrão por Segmento Notice */}
      {currentMode === 'padrao_segmento' ? (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Modo Padrão Ativo: Simulação Automática Baseada no Segmento</span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              O simulador aplica automaticamente as alíquotas e reduções legais do segmento selecionado (ex:{' '}
              <strong>
                {input.businessSegment === 'farmacia'
                  ? 'Redução de 60% em Medicamentos / Saúde'
                  : input.businessSegment === 'cosmeticos'
                  ? 'Produtos de Higiene e Cosméticos'
                  : 'Atividade Geral'}
              </strong>
              ). O montante base mensal é de{' '}
              <strong className="text-slate-900">
                R$ {defaultBaseAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleModeChange('rateio_personalizado')}
            className="shrink-0 px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            Personalizar Rateio
          </button>
        </div>
      ) : (
        /* Mode: Rateio Personalizado with 6 Boxes (Exact Image Match) */
        <div className="space-y-4 animate-in fade-in">
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Preencha o valor em reais (R$) para cada categoria de redução:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fillAllFullTax}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
              >
                100% Imposto Cheio
              </button>
              <button
                type="button"
                onClick={fillEqualShare}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Ratear igualmente
              </button>
              <button
                type="button"
                onClick={resetTiers}
                className="px-2 py-1 text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                title="Zerar todos os campos"
              >
                <RotateCcw className="w-3 h-3" />
                Zerar
              </button>
            </div>
          </div>

          {/* 6 Category Input Boxes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {tiersConfig.map((tier) => {
              const val = currentBreakdown[tier.key] || 0;
              const sharePct = totalSumBreakdown > 0 ? (val / totalSumBreakdown) * 100 : 0;

              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl border p-4 transition-all ${tier.color} relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block leading-tight">
                        {tier.label}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5 line-clamp-1">
                        {tier.desc}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${tier.badgeColor}`}
                    >
                      {tier.reductionPct}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="relative rounded-xl border border-slate-300 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-100 bg-white transition-all">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                        R$
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={val === 0 ? '' : val}
                        placeholder="0,00"
                        onChange={(e) => handleTierChange(tier.key, parseFloat(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 text-sm font-bold text-slate-900 placeholder:text-slate-300 bg-transparent rounded-xl outline-none"
                      />
                    </div>
                    {totalSumBreakdown > 0 && val > 0 && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1.5 px-0.5">
                        <span>Participação: {sharePct.toFixed(1)}%</span>
                        <span className="text-slate-700 font-semibold">{tier.taxFactor}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary / Audit Footer */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-200 text-xs font-bold uppercase tracking-wider">
                <Scale className="w-4 h-4 text-purple-300" />
                <span>
                  Resumo do Rateio:{' '}
                  {isPurchases ? 'Créditos de Insumos' : 'Débitos de Faturamento'}
                </span>
              </div>
              <div className="text-xs text-indigo-100">
                Soma total distribuída nas 6 faixas:{' '}
                <strong className="text-white text-sm">
                  R$ {totalSumBreakdown.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>{' '}
                {isPurchases ? '/mês de compras' : '/mês de vendas'}
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/10">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-purple-200 block">
                  Alíquota Efetiva Média Ponderada
                </span>
                <span className="text-lg font-black text-emerald-400">
                  {effectiveWeightedRatePct.toFixed(2)}%
                </span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-purple-200 block">
                  {isPurchases ? 'Crédito Bruto Estimado' : 'Débito Bruto Estimado'}
                </span>
                <span className="text-sm font-bold text-white">
                  R${' '}
                  {(rawWeightedValue * rawBaseRate).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
