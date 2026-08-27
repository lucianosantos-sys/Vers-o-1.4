import React from 'react';
import {
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Scale,
  ShieldCheck,
  HelpCircle,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { SimulationSummary } from '../types/tax';

interface PrePostReformComparisonProps {
  summary: SimulationSummary;
}

export const PrePostReformComparison: React.FC<PrePostReformComparisonProps> = ({ summary }) => {
  const { prePostComparison, input, results, bestCommercialRegime } = summary;
  const { preReform, postReform, deltaMonthly, deltaAnnual, deltaRatePct, substitutionRows, monofasicoStAnalysis } = prePostComparison;

  const isFavorable = deltaMonthly <= 0;
  const bestRegimeData = results[bestCommercialRegime];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                Comparativo Antes e Depois da Reforma Tributária
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Análise direta entre o Sistema Tributário Atual (PIS, COFINS, ICMS, ISS) e a Reforma 2027 (CBS, IBS e IVA Dual).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
              isFavorable
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {isFavorable ? (
                <TrendingDown className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <TrendingUp className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block">
                  {isFavorable ? 'Cenário Favorable no Novo Modelo' : 'Variação Projetada na Reforma'}
                </span>
                <span className="text-sm font-black">
                  {deltaMonthly > 0 ? '+' : ''}R$ {deltaMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês ({deltaRatePct > 0 ? '+' : ''}{deltaRatePct.toFixed(2)}% na carga)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CENÁRIO 1: PRÉ-REFORMA (ATUAL) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-slate-400"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black px-3 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                Sistema Vigente (Atual)
              </span>
              <span className="text-xs font-bold text-slate-500">PIS + COFINS + ICMS / ISS</span>
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1">
              Simples Nacional Tradicional
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-5">
              Guia unificada DAS com segregação manual de Monofásico e ICMS-ST.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Custo Tributário Mensal</span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">
                  R$ {preReform.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">R$ {(preReform.totalAnnualTax).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Alíquota Efetiva Direta</span>
                <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">
                  {preReform.effectiveRatePct.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Sobre a receita bruta</span>
              </div>
            </div>

            {/* Taxes Breakdown List */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600 font-medium">PIS / PASEP (Federal):</span>
                <span className="font-bold text-slate-800">R$ {preReform.pisAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600 font-medium">COFINS (Federal):</span>
                <span className="font-bold text-slate-800">R$ {preReform.cofinsAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600 font-medium">ICMS (Estadual) / ISS (Municipal):</span>
                <span className="font-bold text-slate-800">R$ {(preReform.icmsAmount + preReform.issAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600 font-medium">IRPJ + CSLL + CPP (Renda & Folha):</span>
                <span className="font-bold text-slate-800">R$ {(preReform.irpjAmount + preReform.csllAmount + preReform.cppAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {preReform.monofasicoDeduction + preReform.icmsStDeduction > 0 && (
                <div className="flex justify-between py-1.5 bg-emerald-50/60 px-2 rounded-lg text-emerald-800 font-bold">
                  <span>Dedução Monofásico + ICMS-ST:</span>
                  <span>- R$ {(preReform.monofasicoDeduction + preReform.icmsStDeduction).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Crédito transferido ao cliente B2B:</span>
              <span className="font-bold text-slate-700">{preReform.b2bCreditTransferPct.toFixed(2)}% (Restrito)</span>
            </div>
          </div>
        </div>

        {/* CENÁRIO 2: PÓS-REFORMA (2027+) */}
        <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden ring-2 ring-indigo-500/10">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-indigo-600"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                Reforma Tributária (2027+)
              </span>
              <span className="text-xs font-bold text-indigo-600">CBS + IBS + IVA Dual</span>
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1">
              {bestRegimeData.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-5">
              Tributação sobre o valor agregado com créditos financeiros plenos e tributação no destino.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <span className="text-[10px] font-bold text-indigo-700 uppercase block">Custo Tributário Mensal</span>
                <span className="text-base sm:text-lg font-black text-indigo-950 mt-0.5 block">
                  R$ {postReform.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-indigo-600 font-medium">R$ {(postReform.totalAnnualTax).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano</span>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <span className="text-[10px] font-bold text-indigo-700 uppercase block">Alíquota Efetiva Direta</span>
                <span className="text-base sm:text-lg font-black text-indigo-950 mt-0.5 block">
                  {postReform.effectiveRatePct.toFixed(2)}%
                </span>
                <span className="text-[10px] text-indigo-600 font-medium">Sobre a receita bruta</span>
              </div>
            </div>

            {/* Taxes Breakdown List */}
            <div className="space-y-2 text-xs border-t border-indigo-50 pt-4">
              <div className="flex justify-between py-1 border-b border-indigo-50">
                <span className="text-slate-600 font-medium">CBS (Contribuição Federal):</span>
                <span className="font-bold text-slate-900">R$ {postReform.cbsAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-indigo-50">
                <span className="text-slate-600 font-medium">IBS (Imposto Estadual/Municipal):</span>
                <span className="font-bold text-slate-900">R$ {postReform.ibsAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {postReform.selectiveTaxAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-indigo-50 text-purple-700">
                  <span className="font-medium">Imposto Seletivo (IS):</span>
                  <span className="font-bold">R$ {postReform.selectiveTaxAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {postReform.eligibleCreditsAmount > 0 && (
                <div className="flex justify-between py-1.5 bg-emerald-50 px-2 rounded-lg text-emerald-800 font-bold">
                  <span>Créditos sobre Insumos/Compras:</span>
                  <span>- R$ {postReform.eligibleCreditsAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-indigo-50">
                <span className="text-slate-600 font-medium">IRPJ + CSLL + CPP (Preservados):</span>
                <span className="font-bold text-slate-900">R$ {(postReform.irpjAmount + postReform.csllAmount + postReform.cppAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-indigo-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-700 font-medium">Crédito transferido ao cliente B2B:</span>
              <span className="font-bold text-indigo-900 bg-indigo-100/70 px-2 py-0.5 rounded">
                {postReform.b2bCreditTransferPct.toFixed(2)}% (Integral / Amplo)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED TAX SUBSTITUTION MATRIX */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Matriz de Substituição e Transição dos Tributos
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Como cada imposto do sistema atual é substituído ou mantido sob a Emenda Constitucional 132/2023.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-indigo-50/70 border-y border-indigo-100 text-indigo-950 font-black">
                <th className="py-3 px-4">Tributo Atual (Pré-Reforma)</th>
                <th className="py-3 px-4">Tributo Substituto (Reforma 2027)</th>
                <th className="py-3 px-3 text-right">Valor Atual</th>
                <th className="py-3 px-3 text-right">Valor Projetado</th>
                <th className="py-3 px-3 text-right">Variação</th>
                <th className="py-3 px-4">Fundamentação e Impacto Prático</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {substitutionRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {row.oldTaxName}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-700">
                    {row.newTaxName}
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-slate-700">
                    R$ {row.preReformAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                    R$ {row.postReformAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      row.difference < 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : row.difference > 0
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-50 text-slate-600'
                    }`}>
                      {row.difference > 0 ? '+' : ''}R$ {row.difference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 leading-relaxed font-medium">
                    {row.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MONOFÁSICO & ICMS-ST TRANSITION EXPLANATION */}
      <div className="bg-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-indigo-900 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
            Como a Substituição Tributária e o Monofásico Funcionam na Reforma
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-indigo-900/60 border border-indigo-800 space-y-2">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
              1. Sistema Atual (Complexidade e Segregação)
            </span>
            <p className="text-xs text-indigo-200 leading-relaxed font-medium">
              {monofasicoStAnalysis.currentSystemDesc}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-900/60 border border-indigo-800 space-y-2">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
              2. Novo Modelo do IVA Dual (Crédito Financeiro Pleno)
            </span>
            <p className="text-xs text-indigo-200 leading-relaxed font-medium">
              {monofasicoStAnalysis.newSystemDesc}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-indigo-800/80">
          <span className="text-xs font-bold text-indigo-200 block mb-2">Principais Diretrizes para o seu Planejamento:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {monofasicoStAnalysis.keyTransitionTakeaways.map((point, pIdx) => (
              <div key={pIdx} className="flex items-start gap-2 text-xs text-indigo-100 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
