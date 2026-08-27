import React from 'react';
import {
  Sliders,
  DollarSign,
  Briefcase,
  Layers,
  Settings2,
  HelpCircle,
  TrendingDown,
  Info,
} from 'lucide-react';
import { AnexoType, CompanyInput, SimulationSummary } from '../types/tax';
import { ANEXO_NAMES } from '../data/taxTables';
import { ActivitySegregationPanel } from './ActivitySegregationPanel';
import { IbsCbsRateConfigurator } from './IbsCbsRateConfigurator';
import { SectorLegislationSelector } from './SectorLegislationSelector';
import { ReductionRateioConfigurator } from './ReductionRateioConfigurator';
import { ProfitMarginTargetSimulator } from './ProfitMarginTargetSimulator';

interface AdvancedSimulatorProps {
  input: CompanyInput;
  summary: SimulationSummary;
  onChange: (updated: Partial<CompanyInput>) => void;
}

export const AdvancedSimulator: React.FC<AdvancedSimulatorProps> = ({ input, summary, onChange }) => {
  return (
    <div className="space-y-6">
      {/* 1. Segregação de Atividade & Enquadramento nos Anexos (Topo Prioritário) */}
      <ActivitySegregationPanel input={input} summary={summary} onChange={onChange} />

      {/* 2. Margem de Lucro e Simulador de Metas */}
      <ProfitMarginTargetSimulator input={input} summary={summary} onChange={onChange} />

      {/* 3. Legislação Setorial, Monofásico e ICMS-ST */}
      <SectorLegislationSelector input={input} summary={summary} onChange={onChange} />

      {/* 4. Configuração das Alíquotas IBS/CBS */}
      <IbsCbsRateConfigurator input={input} onChange={onChange} />

      {/* 5. Personalização nas Compras de Insumos (Padrão por Segmento vs Rateio) */}
      <ReductionRateioConfigurator
        type="purchases"
        input={input}
        onChange={onChange}
        defaultCombinedRate={input.fullCbsIbsRate || 26.5}
      />

      {/* 6. Personalização nas Vendas / Faturamento (Padrão por Segmento vs Rateio) */}
      <ReductionRateioConfigurator
        type="sales"
        input={input}
        onChange={onChange}
        defaultCombinedRate={input.fullCbsIbsRate || 26.5}
      />

      {/* Main Parameters */}
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-indigo-50 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-indigo-950 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Parâmetros Financeiros e Operacionais Detalhados
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Ajuste fino de faturamento acumulado, despesas creditáveis, margens e sensibilidade comercial.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Atividade & Anexo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Enquadramento no Simples Nacional
            </label>
            {Object.values(input.anexoRevenues || {}).some((v) => Number(v || 0) > 0) ? (
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-indigo-950">
                  <span>Enquadramento:</span>
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[11px]">
                    Multi-Anexos Ativo
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {Object.entries(input.anexoRevenues || {}).map(([k, v]) => {
                    const numVal = Number(v || 0);
                    if (numVal <= 0) return null;
                    const tag = k === 'anexo_1' ? 'Anexo I' :
                                k === 'anexo_2' ? 'Anexo II' :
                                k === 'anexo_3' ? 'Anexo III' :
                                k === 'anexo_3_sem_iss' ? 'Anexo III s/ ISS' :
                                k === 'anexo_4' ? 'Anexo IV' :
                                k === 'anexo_4_sem_iss' ? 'Anexo IV s/ ISS' : 'Anexo V';
                    return (
                      <span key={k} className="bg-white border border-indigo-200 text-indigo-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {tag}: R$ {numVal.toLocaleString('pt-BR')}
                      </span>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 font-medium pt-1 border-t border-indigo-100">
                  Gerencie as receitas detalhadas no topo da página.
                </p>
              </div>
            ) : (
              <>
                <select
                  value={input.anexo}
                  onChange={(e) => onChange({ anexo: e.target.value as AnexoType })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {(Object.keys(ANEXO_NAMES) as AnexoType[]).map((key) => (
                    <option key={key} value={key}>
                      {ANEXO_NAMES[key].name} ({ANEXO_NAMES[key].tag})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 font-medium">
                  {ANEXO_NAMES[input.anexo].description}
                </p>
              </>
            )}
          </div>

          {/* 2. RBT12 Acumulado */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                RBT12 (Últimos 12 Meses)
              </label>
              <button
                type="button"
                onClick={() => onChange({ rbt12: input.monthlyRevenue * 12 })}
                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Igualar a 12x Faturamento
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                R$
              </span>
              <input
                type="number"
                min="1000"
                step="10000"
                value={input.rbt12}
                onChange={(e) => onChange({ rbt12: Number(e.target.value) || 0 })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Receita bruta acumulada para enquadramento na faixa da tabela.
            </p>
          </div>

          {/* 3. Faturamento Mensal Projetado */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Faturamento Mensal Projetado (R$)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                R$
              </span>
              <input
                type="number"
                min="1000"
                step="5000"
                value={input.monthlyRevenue}
                onChange={(e) => onChange({ monthlyRevenue: Number(e.target.value) || 0 })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Base para apuração dos impostos mensais deste simulador.
            </p>
          </div>

          {/* 4. Folha de Salários */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Folha de Pagamento Salarial (R$/mês)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                R$
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={input.monthlyPayroll}
                onChange={(e) => onChange({ monthlyPayroll: Number(e.target.value) || 0 })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Salários de colaboradores CLT com encargos.
            </p>
          </div>

          {/* 5. Pró-labore */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Pró-labore dos Sócios (R$/mês)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                R$
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={input.monthlyProLabore}
                onChange={(e) => onChange({ monthlyProLabore: Number(e.target.value) || 0 })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Remuneração de sócios (essencial para apuração do Fator R).
            </p>
          </div>

          {/* 6. Compras e Insumos Creditáveis */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Compras / Despesas Creditáveis (R$/mês)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                R$
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={input.monthlyPurchasesInputs}
                onChange={(e) => onChange({ monthlyPurchasesInputs: Number(e.target.value) || 0 })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Mercadorias, insumos, serviços, energia e despesas com crédito.
            </p>
          </div>

          {/* 7. % de Vendas B2B */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                % de Vendas para B2B (PJs)
              </label>
              <span className="text-xs font-black text-indigo-600">{input.b2bPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={input.b2bPercentage}
              onChange={(e) => onChange({ b2bPercentage: Number(e.target.value) })}
              className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 font-medium">
              Percentual faturado para empresas que descontam créditos.
            </p>
          </div>

          {/* 8. % Margem de Desconto de Compensação B2B */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Margem de Desconto de Compensação B2B (%)
              </label>
              <span className="text-xs font-black text-amber-600 font-mono">{input.b2bDisputeDiscountPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={input.b2bDisputeDiscountPct}
              onChange={(e) => onChange({ b2bDisputeDiscountPct: Number(e.target.value) })}
              className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {[
                { label: '100% (Integral)', val: 100 },
                { label: '50% (50/50)', val: 50 },
                { label: '25%', val: 25 },
                { label: '0% (Sem desc)', val: 0 },
              ].map((btn) => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => onChange({ b2bDisputeDiscountPct: btn.val, considerB2BCompetitiveFactor: true })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    input.b2bDisputeDiscountPct === btn.val
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-amber-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Percentual da perda de crédito de IBS/CBS concedido como desconto comercial no Simples Simplificado.
            </p>
          </div>

          {/* 9. Margem Lucro Real */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Margem de Lucro Efetivo (Lucro Real %)
              </label>
              <span className="text-xs font-black text-purple-600">{input.lucroRealMarginPct}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={input.lucroRealMarginPct}
              onChange={(e) => onChange({ lucroRealMarginPct: Number(e.target.value) })}
              className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 font-medium">
              Margem líquida real antes de impostos para apuração no Lucro Real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
