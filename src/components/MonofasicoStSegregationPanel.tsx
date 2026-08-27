import React from 'react';
import {
  Percent,
  DollarSign,
  Scale,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { CompanyInput, SimulationSummary } from '../types/tax';

interface MonofasicoStSegregationPanelProps {
  input: CompanyInput;
  summary?: SimulationSummary;
  onChange: (updates: Partial<CompanyInput>) => void;
}

export const MonofasicoStSegregationPanel: React.FC<MonofasicoStSegregationPanelProps> = ({
  input,
  summary,
  onChange,
}) => {
  const {
    monthlyRevenue = 100000,
    monofasicoPisCofinsPercentage = 0,
    icmsStPercentage = 0,
    businessSegment = 'geral',
  } = input;

  const monofasicoRevenueAmount = (monthlyRevenue * monofasicoPisCofinsPercentage) / 100;
  const icmsStRevenueAmount = (monthlyRevenue * icmsStPercentage) / 100;

  const segregationSavings = summary?.results?.simples_simplificado?.segregationSavings;
  const totalMonthlySavings = segregationSavings?.totalMonthly || 0;
  const totalAnnualSavings = segregationSavings?.totalAnnual || 0;

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              Segregação de Monofásicos (PIS/COFINS) & Substituição Tributária (ICMS-ST)
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                LC 123/2006 Art. 18
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Informe a parcela da receita com tributação concentrada na indústria/importador para abater da guia DAS e analisar a substituição dos impostos.
            </p>
          </div>
        </div>

        {totalMonthlySavings > 0 && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-700">Economia no DAS</span>
              <span className="text-xs font-black">
                R$ {totalMonthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês (R$ {totalAnnualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* PIS / COFINS MONOFÁSICO */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              % Receita com PIS/COFINS Monofásico:
            </label>
            <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              {monofasicoPisCofinsPercentage}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={monofasicoPisCofinsPercentage}
              onChange={(e) =>
                onChange({
                  monofasicoPisCofinsPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                })
              }
              className="flex-1 accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="relative w-24">
              <input
                type="number"
                min="0"
                max="100"
                value={monofasicoPisCofinsPercentage}
                onChange={(e) =>
                  onChange({
                    monofasicoPisCofinsPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                  })
                }
                className="w-full pl-3 pr-6 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-200">
            <span>Receita segregada monofásica:</span>
            <span className="font-bold text-slate-900">
              R$ {monofasicoRevenueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
            </span>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
            <span className="font-bold text-slate-700">Base Legal:</span> Leis 10.147/00 (Farma/Cosméticos), 10.485/02 (Autopeças), 13.097/15 (Bebidas), Indústria e Materiais. Alíquota zero nas saídas de revenda.
          </p>
        </div>

        {/* ICMS SUBSTITUIÇÃO TRIBUTÁRIA (ST) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              % Receita com ICMS Substituição Tributária (ST):
            </label>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              {icmsStPercentage}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={icmsStPercentage}
              onChange={(e) =>
                onChange({
                  icmsStPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                })
              }
              className="flex-1 accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="relative w-24">
              <input
                type="number"
                min="0"
                max="100"
                value={icmsStPercentage}
                onChange={(e) =>
                  onChange({
                    icmsStPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                  })
                }
                className="w-full pl-3 pr-6 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-200">
            <span>Receita segregada com ICMS-ST:</span>
            <span className="font-bold text-slate-900">
              R$ {icmsStRevenueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
            </span>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
            <span className="font-bold text-slate-700">Base Legal:</span> Convênio ICMS 142/2018 (Anexo XI - Materiais de Construção, Tintas, Ferragens e Peças) e LC 123/2006. O ICMS foi recolhido anteriormente pelo fabricante ou distribuidor.
          </p>
        </div>
      </div>

      {/* TAX SUBSTITUTION ANALYSIS EXPLANATION BOX */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
        <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Análise da Substituição dos Impostos na Reforma Tributária (2027+)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed font-medium">
          <div className="p-3 bg-white rounded-xl border border-indigo-100">
            <span className="font-bold text-slate-900 block mb-1">
              1. PIS/COFINS Monofásico → CBS Federal
            </span>
            <p>
              Na Reforma, a CBS extingue a sistemática monofásica tradicional. A tributação passa a ser uniforme e não-cumulativa sobre o valor agregado: sua empresa toma crédito da CBS destacada na compra e recolhe sobre a venda, sem bitributação e sem exigir parametrização complexa de NCMs monofásicos.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-indigo-100">
            <span className="font-bold text-slate-900 block mb-1">
              2. ICMS-ST → IBS Estadual/Municipal
            </span>
            <p>
              O regime de Substituição Tributária (ICMS-ST) estadual deixa de existir no IBS. A arrecadação migra para o princípio do destino (onde a mercadoria é consumida), permitindo o aproveitamento amplo de créditos de insumos e mercadorias adquiridas em qualquer estado do país.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
