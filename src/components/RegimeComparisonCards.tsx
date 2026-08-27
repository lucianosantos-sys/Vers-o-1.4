import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  ChevronDown,
  ChevronUp,
  Calculator,
  ShieldCheck,
  Scale,
  Sparkles,
  Receipt,
  ArrowRight,
  Info,
  Layers,
  TrendingDown,
  Coins,
} from 'lucide-react';
import { CompanyInput, RegimeResult, RegimeType, SimulationSummary } from '../types/tax';

interface RegimeComparisonCardsProps {
  summary: SimulationSummary;
  onOpenAudit: (regime: RegimeType) => void;
  onChange?: (updated: Partial<CompanyInput>) => void;
}

export const RegimeComparisonCards: React.FC<RegimeComparisonCardsProps> = ({
  summary,
  onOpenAudit,
  onChange,
}) => {
  const [expandedRegime, setExpandedRegime] = useState<RegimeType | null>(null);
  const [recalcPerspective, setRecalcPerspective] = useState<'financeiro' | 'nfe'>('financeiro');
  const [showRecalcPanel, setShowRecalcPanel] = useState<boolean>(true);

  const {
    results,
    bestRegime: activeBestRegime,
    bestCommercialRegime,
    bestDirectRegime,
    annualSavings,
    monthlySavings,
    input,
    considerB2BCompetitiveFactor,
  } = summary;

  const bestResult = results[activeBestRegime];

  const regimeList = [
    results.simples_simplificado,
    results.simples_hibrido,
    results.lucro_presumido,
    results.lucro_real,
  ];

  const hasB2B = input.b2bPercentage > 0;

  return (
    <div className="space-y-6">
      {/* EXECUTIVE VERDICT HERO CARD */}
      <div className="bg-indigo-950 text-white rounded-2xl p-6 sm:p-7 border border-indigo-900 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-800 text-indigo-200 border border-indigo-700 uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                Veredito do Simulador
              </span>

              {hasB2B && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-900 text-emerald-300 border border-emerald-500/30">
                  <Building2 className="w-3.5 h-3.5" />
                  {input.b2bPercentage}% Vendas B2B
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  considerB2BCompetitiveFactor
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {considerB2BCompetitiveFactor ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Critério: Com Fator Competitivo
                  </>
                ) : (
                  <>
                    <Calculator className="w-3.5 h-3.5 text-slate-400" />
                    Critério: Apenas Imposto Direto
                  </>
                )}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Regime Recomendado: <span className="text-emerald-400">{bestResult.name}</span>
            </h2>

            <p className="text-xs sm:text-sm text-indigo-200 max-w-3xl leading-relaxed font-medium">
              {considerB2BCompetitiveFactor ? (
                activeBestRegime === 'simples_hibrido' ? (
                  `Com ${input.b2bPercentage}% de vendas para PJ (B2B), a opção pelo Simples Híbrido preserva 100% dos créditos de IBS/CBS aos seus clientes corporativos (${(input.fullCbsIbsRate || 26.5).toFixed(1)}%), blindando seu faturamento contra exigências de descontos no preço e mantendo os tributos sobre a renda no Simples.`
                ) : activeBestRegime === 'simples_simplificado' ? (
                  `O Simples Simplificado em guia única (DAS) entrega a maior rentabilidade líquida para o seu perfil, mesmo ponderando a fatia de vendas B2B, com economia anual de R$ ${annualSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}.`
                ) : (
                  `O regime ${bestResult.name} apresentou a maior eficiência econômica consolidada considerando a estrutura operacional e de compras com créditos da empresa.`
                )
              ) : (
                `[Apenas Imposto Direto] Comparando puramente o valor da guia a recolher (DAS / DARF), o regime do ${bestResult.name} oferece o menor desembolso tributário direto mensal (R$ ${bestResult.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês), sem ponderar retenção de clientes PJ por créditos tributários.`
              )}
            </p>
          </div>

          {/* Savings Highlight Box */}
          <div className="bg-indigo-900/90 backdrop-blur-sm border border-indigo-700/80 rounded-2xl p-5 flex flex-col justify-center min-w-[250px] text-right shadow-lg shrink-0">
            <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
              {considerB2BCompetitiveFactor ? 'Economia Anual Estimada' : 'Economia Tributária Direta'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mt-0.5">
              R$ {annualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-indigo-300 font-medium mt-0.5">
              ~ R$ {monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} / mês
            </span>
          </div>
        </div>

        {/* INTERACTIVE TOGGLE: CONSIDERAR FATOR COMPETITIVO OU NÃO */}
        {onChange && (
          <div className="mt-5 pt-4 border-t border-indigo-900/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-900/50 p-3.5 rounded-xl border border-indigo-800">
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-black text-white block">
                    Modo Fator Competitivo B2B (Cadeia PJ)
                  </span>
                  <span className="text-[11px] text-indigo-200">
                    {considerB2BCompetitiveFactor
                      ? 'Ativado: Analisa o risco comercial de perda de créditos de IBS/CBS para clientes PJ.'
                      : 'Desativado: Avalia apenas o valor bruto da guia de imposto (quem paga menos imposto no mês).'}
                  </span>
                </div>
              </div>

              <div className="flex items-center bg-indigo-950 p-1 rounded-xl border border-indigo-700 shrink-0">
                <button
                  type="button"
                  id="toggle-competitive-factor-on"
                  onClick={() => onChange({ considerB2BCompetitiveFactor: true })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    considerB2BCompetitiveFactor
                      ? 'bg-emerald-500 text-indigo-950 shadow-sm'
                      : 'text-indigo-300 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Modo Competitivo Ativado
                </button>

                <button
                  type="button"
                  id="toggle-competitive-factor-off"
                  onClick={() => onChange({ considerB2BCompetitiveFactor: false })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    !considerB2BCompetitiveFactor
                      ? 'bg-emerald-500 text-indigo-950 shadow-sm'
                      : 'text-indigo-300 hover:text-white'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  Apenas Imposto Direto
                </button>
              </div>
            </div>

            {/* BOTÕES DE CÁLCULO COM MARGEM DE DESCONTO DE COMPENSAÇÃO (QUANDO MODO ATIVADO) */}
            {considerB2BCompetitiveFactor && (
              <div className="bg-indigo-900/80 p-4 rounded-xl border border-emerald-500/40 space-y-3 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-white uppercase tracking-wider block">
                        Calcular com Margem de Desconto de Compensação Comercial
                      </span>
                      <span className="text-[11px] text-indigo-200">
                        Compensa a perda de créditos de IBS/CBS dos seus clientes PJ no Simples Nacional Simplificado.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto bg-indigo-950 px-3 py-1 rounded-lg border border-indigo-700">
                    <span className="text-[10px] text-indigo-300 font-bold uppercase">Margem Ativa:</span>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      {input.b2bDisputeDiscountPct}% de Compensação
                    </span>
                  </div>
                </div>

                {/* Botões Rápidos de Margem de Compensação */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-indigo-200">Selecione a margem:</span>

                  <button
                    type="button"
                    id="btn-compensation-100"
                    onClick={() => onChange({ b2bDisputeDiscountPct: 100 })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      input.b2bDisputeDiscountPct === 100
                        ? 'bg-emerald-500 text-indigo-950 shadow-md ring-2 ring-emerald-300'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-700 hover:bg-indigo-800 hover:text-white'
                    }`}
                  >
                    <span>100% (Compensação Integral)</span>
                    <span className="text-[10px] font-normal opacity-80 hidden sm:inline">• Neutralidade Total</span>
                  </button>

                  <button
                    type="button"
                    id="btn-compensation-50"
                    onClick={() => onChange({ b2bDisputeDiscountPct: 50 })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      input.b2bDisputeDiscountPct === 50
                        ? 'bg-emerald-500 text-indigo-950 shadow-md ring-2 ring-emerald-300'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-700 hover:bg-indigo-800 hover:text-white'
                    }`}
                  >
                    <span>50% (Compensação Parcial)</span>
                    <span className="text-[10px] font-normal opacity-80 hidden sm:inline">• Divisão 50/50</span>
                  </button>

                  <button
                    type="button"
                    id="btn-compensation-25"
                    onClick={() => onChange({ b2bDisputeDiscountPct: 25 })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      input.b2bDisputeDiscountPct === 25
                        ? 'bg-emerald-500 text-indigo-950 shadow-md ring-2 ring-emerald-300'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-700 hover:bg-indigo-800 hover:text-white'
                    }`}
                  >
                    <span>25% (Conservador)</span>
                  </button>

                  <button
                    type="button"
                    id="btn-compensation-0"
                    onClick={() => onChange({ b2bDisputeDiscountPct: 0 })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      input.b2bDisputeDiscountPct === 0
                        ? 'bg-emerald-500 text-indigo-950 shadow-md ring-2 ring-emerald-300'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-700 hover:bg-indigo-800 hover:text-white'
                    }`}
                  >
                    <span>0% (Sem Desconto)</span>
                    <span className="text-[10px] font-normal opacity-80 hidden sm:inline">• Cliente Absorve</span>
                  </button>
                </div>

                {/* Slider de ajuste fino da Margem de Desconto */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] font-bold text-indigo-200 whitespace-nowrap">
                    Ajuste fino da margem:
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={input.b2bDisputeDiscountPct}
                    onChange={(e) => onChange({ b2bDisputeDiscountPct: Number(e.target.value) })}
                    className="w-full accent-emerald-400 h-2 bg-indigo-950 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-black text-emerald-400 font-mono w-12 text-right">
                    {input.b2bDisputeDiscountPct}%
                  </span>
                </div>

                {/* Resumo da apuração com a margem de compensação */}
                <div className="bg-indigo-950/90 p-3 rounded-lg border border-indigo-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-indigo-200">
                    📉 <strong>Impacto no Simples Simplificado:</strong> Desconto comercial de compensação estimado em{' '}
                    <strong className="text-amber-300">
                      R$ {results.simples_simplificado.estimatedCommercialLossMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                    </strong>{' '}
                    (R$ {(results.simples_simplificado.estimatedCommercialLossMonthly * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano).
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 whitespace-nowrap bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/30">
                    Crédito Integral no Híbrido / Lucro Presumido / Real
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress bar visual */}
        <div className="mt-4">
          <div className="w-full bg-indigo-900/90 h-10 rounded-xl flex items-center px-4 relative overflow-hidden border border-indigo-800">
            <div className="bg-emerald-500 h-full absolute left-0 top-0 transition-all opacity-90" style={{ width: '100%' }}></div>
            <span className="relative z-10 font-black text-xs text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              Economia de R$ {annualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano na estratégia selecionada ({bestResult.name})
            </span>
          </div>
        </div>
      </div>

      {/* DEMONSTRATIVO DE RECÁLCULO DAS GUIAS DE IMPOSTOS (MODO COMPETITIVO ATIVADO) */}
      {considerB2BCompetitiveFactor && hasB2B && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-emerald-500/40 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Recálculo das Guias de Impostos (Modo Competitivo Ativado)
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase px-2 py-0.5 rounded-md border border-emerald-200">
                    Margem: {input.b2bDisputeDiscountPct}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Demonstrativo comparativo entre a <strong>Guia Nominal Direta</strong> emitida e o <strong>Custo Recalculado</strong> após concessão do desconto de compensação de créditos aos clientes PJ.
                </p>
              </div>
            </div>

            {/* Toggle de Perspectiva de Recálculo */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto shrink-0">
              <button
                type="button"
                id="btn-recalc-perspective-financeiro"
                onClick={() => setRecalcPerspective('financeiro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  recalcPerspective === 'financeiro'
                    ? 'bg-white text-indigo-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                Compensação Financeira
              </button>
              <button
                type="button"
                id="btn-recalc-perspective-nfe"
                onClick={() => setRecalcPerspective('nfe')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  recalcPerspective === 'nfe'
                    ? 'bg-white text-indigo-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Desconto em Nota (NF-e)
              </button>
            </div>
          </div>

          {/* Comparativo de Guias em Tabela / Grid Responsivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {regimeList.map((regime) => {
              const isSelectedBest = regime.regime === activeBestRegime;
              const isSimplificado = regime.regime === 'simples_simplificado';
              const recalc = regime.competitiveRecalculation;

              return (
                <div
                  key={`recalc-card-${regime.regime}`}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelectedBest
                      ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-black text-slate-800 truncate">
                      {regime.name}
                    </span>
                    {isSelectedBest && (
                      <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                        Ideal
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Linha 1: Guia Nominal Direta */}
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Guia Nominal Direta:</span>
                      <span className="font-bold text-slate-800 font-mono">
                        R$ {regime.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Linha 2: Desconto de Compensação B2B */}
                    <div className="flex justify-between items-center">
                      <span className={isSimplificado && regime.estimatedCommercialLossMonthly > 0 ? 'text-amber-700 font-bold' : 'text-slate-500'}>
                        {isSimplificado ? `Compensação B2B (${input.b2bDisputeDiscountPct}%):` : 'Compensação B2B:'}
                      </span>
                      <span className={`font-mono font-bold ${
                        isSimplificado && regime.estimatedCommercialLossMonthly > 0
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}>
                        {isSimplificado && regime.estimatedCommercialLossMonthly > 0
                          ? `+ R$ ${regime.estimatedCommercialLossMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : 'R$ 0,00 (100% Crédito)'}
                      </span>
                    </div>

                    {/* Visão Alternativa: Desconto em NF-e (se ativo) */}
                    {recalcPerspective === 'nfe' && isSimplificado && recalc && recalc.taxBaseReductionSavings > 0 && (
                      <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 space-y-1 text-[11px]">
                        <div className="flex justify-between text-amber-800">
                          <span>Receita Líquida na NF-e:</span>
                          <span className="font-bold font-mono">
                            R$ {recalc.netInvoicedRevenueMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-emerald-800">
                          <span>Nova Guia DAS Reduzida:</span>
                          <span className="font-bold font-mono">
                            R$ {recalc.recalculatedTaxGuideMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-[10px]">
                          <span>Economia na Guia:</span>
                          <span className="font-medium text-emerald-700 font-mono">
                            - R$ {recalc.taxBaseReductionSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Linha 3: Total Recalculado / Custo Efetivo */}
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="font-black text-slate-900">
                        {recalcPerspective === 'nfe' && isSimplificado ? 'Custo Final Ajustado:' : '(=) Custo Total Recalculado:'}
                      </span>
                      <span className="font-black text-slate-900 font-mono text-sm">
                        R$ {regime.totalAdjustedCostMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Alíquota Efetiva Ajustada */}
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Alíquota Efetiva Final:</span>
                      <span className={`font-black ${isSelectedBest ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {regime.adjustedEffectiveRatePct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nota Técnica Explicativa do Recálculo */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span>
                <strong>Entenda o Recálculo das Guias:</strong> No <em>Simples Simplificado</em>, como o cliente PJ não pode tomar 100% de crédito de IBS/CBS, a empresa concede uma margem de desconto comercial ({input.b2bDisputeDiscountPct}%) para compensar a perda, elevando o custo efetivo total. Já no <em>Simples Híbrido</em>, <em>Lucro Presumido</em> e <em>Lucro Real</em>, a guia emitida já transfere 100% dos créditos de IBS/CBS, dispensando concessões comerciais.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4 REGIME COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {regimeList.map((regimeData) => {
          const isBest = regimeData.regime === activeBestRegime;
          const isExpanded = expandedRegime === regimeData.regime;

          return (
            <div
              key={regimeData.regime}
              className={`rounded-2xl transition-all duration-200 flex flex-col justify-between relative ${
                isBest
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 shadow-xl lg:scale-[1.02]'
                  : 'bg-white text-slate-900 border border-indigo-100 hover:border-indigo-300 shadow-xs'
              }`}
            >
              {isBest && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-400 text-indigo-950 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm z-20 whitespace-nowrap">
                  Melhor Opção ({considerB2BCompetitiveFactor ? 'Estratégica' : 'Menor Guia'})
                </div>
              )}

              {/* Header */}
              <div className={`p-5 sm:p-6 border-b ${isBest ? 'border-indigo-500/60' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isBest
                        ? 'bg-indigo-800 text-indigo-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isBest ? 'Recomendado' : 'Comparativo'}
                  </span>

                  <button
                    onClick={() => onOpenAudit(regimeData.regime)}
                    title="Ver memória de cálculo detalhada"
                    className={`p-1 transition-colors cursor-pointer ${isBest ? 'text-indigo-200 hover:text-white' : 'text-slate-400 hover:text-indigo-600'}`}
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>

                <h3 className={`text-base font-black leading-tight ${isBest ? 'text-white' : 'text-slate-900'}`}>
                  {regimeData.name}
                </h3>
                {regimeData.isSimplesIneligible && (
                  <span className="inline-block bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black px-2 py-0.5 rounded-md mt-1">
                    🚫 Desenquadrado do Simples (&gt; R$ 4,8M/ano)
                  </span>
                )}
                {regimeData.hasSublimiteExceeded && !regimeData.isSimplesIneligible && (
                  <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md mt-1">
                    ⚠️ Sublimite Excedido (ICMS/ISS/IBS fora do DAS)
                  </span>
                )}
                <p className={`text-xs mt-1 min-h-[32px] line-clamp-2 font-medium ${isBest ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {regimeData.description}
                </p>
              </div>

              {/* Core Financial Metrics */}
              <div className="p-5 sm:p-6 space-y-4 flex-1">
                {/* Imposto Mensal Total / Recálculo */}
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider block ${isBest ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {considerB2BCompetitiveFactor && regimeData.estimatedCommercialLossMonthly > 0
                      ? 'Guia Nominal Direta'
                      : 'Guia Tributária Mensal'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className={`text-2xl font-black ${isBest ? 'text-white' : 'text-slate-800'}`}>
                      R$ {regimeData.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs font-bold ${isBest ? 'text-indigo-200' : 'text-slate-500'}`}>/mês</span>
                  </div>
                  <div className={`flex items-center justify-between text-xs mt-1 font-semibold ${isBest ? 'text-indigo-200' : 'text-slate-500'}`}>
                    <span>Alíquota Direta:</span>
                    <span className={`font-black ${isBest ? 'text-emerald-300' : 'text-slate-800'}`}>
                      {regimeData.effectiveRatePct.toFixed(2)}%
                    </span>
                  </div>
                  <div className={`flex items-center justify-between text-xs mt-0.5 ${isBest ? 'text-indigo-200' : 'text-slate-500'}`}>
                    <span>Total Anual:</span>
                    <span className={`font-bold ${isBest ? 'text-white' : 'text-slate-700'}`}>
                      R$ {regimeData.totalAnnualTax.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Tributos Decompostos (DAS / IBS-CBS / Folha) */}
                <div className={`rounded-xl p-3.5 space-y-1.5 text-xs ${
                  isBest
                    ? 'bg-indigo-700/60 text-indigo-100 border border-indigo-500/50'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/60'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="truncate pr-1">Guia DAS / Guia IRPJ/CSLL:</span>
                    <span className={`font-bold shrink-0 ${isBest ? 'text-white' : 'text-slate-800'}`}>
                      R$ {regimeData.das.totalDas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>IBS + CBS Líquido:</span>
                    <span className={`font-bold ${isBest ? 'text-white' : 'text-slate-800'}`}>
                      R$ {regimeData.ibsCbs.netPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Encargos Folha (INSS):</span>
                    <span className={`font-bold ${isBest ? 'text-white' : 'text-slate-800'}`}>
                      R$ {regimeData.payrollCharges.totalPayrollTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Margens de Lucro: Sem Impostos vs Com Impostos */}
                <div className={`rounded-xl p-3.5 space-y-2 text-xs ${
                  isBest
                    ? 'bg-indigo-900/60 text-indigo-100 border border-indigo-500/40'
                    : 'bg-emerald-50/60 text-slate-700 border border-emerald-200/60'
                }`}>
                  <span className={`text-[10px] font-black uppercase tracking-wider block ${isBest ? 'text-emerald-300' : 'text-emerald-800'}`}>
                    Margem de Lucro da Empresa
                  </span>

                  <div className="flex justify-between items-center text-[11px] sm:text-xs">
                    <span className={isBest ? 'text-indigo-200' : 'text-slate-600'}>
                      Sem considerar impostos:
                    </span>
                    <span className={`font-bold ${isBest ? 'text-white' : 'text-slate-900'}`}>
                      {regimeData.profitMarginBeforeTaxesPct.toFixed(1)}% <span className="text-[10px] font-normal opacity-80">(R$ {regimeData.profitMarginBeforeTaxesMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 0 })})</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] sm:text-xs">
                    <span className={isBest ? 'text-emerald-200 font-bold' : 'text-emerald-900 font-bold'}>
                      Considerando impostos:
                    </span>
                    <span className={`font-black ${isBest ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      {regimeData.profitMarginAfterTaxesPct.toFixed(1)}% <span className="text-[10px] font-semibold opacity-90">(R$ {regimeData.profitMarginAfterTaxesMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 0 })})</span>
                    </span>
                  </div>
                </div>

                {/* Impacto B2B / Custo Ajustado */}
                {input.b2bPercentage > 0 && (
                  <div className={`border-t pt-3 ${isBest ? 'border-indigo-500/50' : 'border-slate-100'}`}>
                    <div className={`flex justify-between items-center text-xs ${isBest ? 'text-indigo-200' : 'text-slate-500'}`}>
                      <span>Crédito gerado p/ PJ:</span>
                      <span className={`font-bold ${isBest ? 'text-white' : 'text-slate-800'}`}>
                        {regimeData.ibsCbs.creditTransferRate > 0
                          ? `${(regimeData.ibsCbs.creditTransferRate * 100).toFixed(2)}%`
                          : 'Zero'}
                      </span>
                    </div>

                    {regimeData.estimatedCommercialLossMonthly > 0 ? (
                      <div className="mt-1.5 pt-1.5 border-t border-dashed border-amber-300/40 space-y-1">
                        <div className={`flex justify-between items-center text-xs font-bold ${isBest ? 'text-amber-300' : 'text-amber-700'}`}>
                          <span>Compensação B2B ({input.b2bDisputeDiscountPct}%):</span>
                          <span>
                            + R$ {regimeData.estimatedCommercialLossMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                          </span>
                        </div>
                        <div className={`flex justify-between items-center text-xs font-black ${isBest ? 'text-white' : 'text-indigo-950'}`}>
                          <span>(=) Custo Total Recalculado:</span>
                          <span>
                            R$ {regimeData.totalAdjustedCostMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                          </span>
                        </div>
                        <div className={`flex justify-between items-center text-[10px] ${isBest ? 'text-indigo-200' : 'text-slate-500'}`}>
                          <span>Carga Efetiva Recalculada:</span>
                          <span className="font-bold">{regimeData.adjustedEffectiveRatePct.toFixed(2)}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className={`flex justify-between items-center text-[11px] mt-1 ${isBest ? 'text-emerald-300' : 'text-emerald-700'}`}>
                        <span>Compensação Comercial:</span>
                        <span className="font-bold">R$ 0,00 (100% Crédito)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Expandable Pros & Cons / Audit Footer */}
              <div className={`p-4 border-t rounded-b-2xl ${
                isBest ? 'bg-indigo-700/40 border-indigo-500/50' : 'bg-slate-50 border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setExpandedRegime(isExpanded ? null : regimeData.regime)}
                  className={`w-full flex items-center justify-between text-xs font-bold py-1 cursor-pointer ${
                    isBest ? 'text-indigo-100 hover:text-white' : 'text-slate-700 hover:text-indigo-600'
                  }`}
                >
                  <span>{isExpanded ? 'Ocultar detalhes' : 'Ver Vantagens & Riscos'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className={`mt-3 pt-3 border-t text-xs space-y-2.5 animate-in fade-in ${
                    isBest ? 'border-indigo-500/50 text-indigo-100' : 'border-slate-200 text-slate-600'
                  }`}>
                    <div>
                      <span className={`font-bold block mb-1 ${isBest ? 'text-emerald-300' : 'text-emerald-700'}`}>
                        Vantagens:
                      </span>
                      <ul className="space-y-1">
                        {regimeData.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isBest ? 'text-emerald-300' : 'text-emerald-600'}`} />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className={`font-bold block mb-1 ${isBest ? 'text-amber-300' : 'text-amber-700'}`}>
                        Pontos de Atenção:
                      </span>
                      <ul className="space-y-1">
                        {regimeData.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isBest ? 'text-amber-300' : 'text-amber-600'}`} />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onOpenAudit(regimeData.regime)}
                  className={`w-full mt-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isBest
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                      : 'border border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Memória de Cálculo Completa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
