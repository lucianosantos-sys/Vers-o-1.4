import React, { useState } from 'react';
import {
  Percent,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { CompanyInput, SimulationSummary } from '../types/tax';

interface FatorRCalculatorProps {
  summary: SimulationSummary;
  onChangeInput: (updated: Partial<CompanyInput>) => void;
}

export const FatorRCalculator: React.FC<FatorRCalculatorProps> = ({ summary, onChangeInput }) => {
  const { input, factorRInfo } = summary;
  const { factorRPct, isAnexo3Eligible, additionalPayrollNeededFor28Pct, potentialAnnualTaxSavingsWithFactorR } = factorRInfo;

  const [simulatedExtraProLabore, setSimulatedExtraProLabore] = useState<number>(
    Math.ceil(additionalPayrollNeededFor28Pct)
  );

  const totalCurrentPayroll = input.monthlyPayroll + input.monthlyProLabore;
  const currentAnnualPayroll = totalCurrentPayroll * 12;
  const baseRevenue = input.rbt12 > 0 ? input.rbt12 : input.monthlyRevenue * 12;

  const simulatedTotalMonthlyPayroll = totalCurrentPayroll + simulatedExtraProLabore;
  const simulatedFactorR = (simulatedTotalMonthlyPayroll * 12) / baseRevenue;
  const simulatedFactorRPct = simulatedFactorR * 100;

  // Custo adicional de INSS (11%) e IRPF médio (~15%) sobre o pró-labore extra
  const estimatedPersonalCostMonthly = simulatedExtraProLabore * 0.26;
  const estimatedPersonalCostAnnual = estimatedPersonalCostMonthly * 12;

  // Economia líquida do planejamento
  const netAnnualBenefit = Math.max(0, potentialAnnualTaxSavingsWithFactorR - estimatedPersonalCostAnnual);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Percent className="w-5 h-5 text-indigo-600" />
                Calculadora & Estratégia do Fator R (Anexo III vs Anexo V)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Planejamento tributário para TI, consultoria, engenharia, saúde e serviços intelectuais.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                isAnexo3Eligible
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {isAnexo3Eligible ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Fator R ≥ 28% (Enquadrada no Anexo III)
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Fator R &lt; 28% (Tributada no Anexo V)
                </>
              )}
            </span>
          </div>
        </div>

        {/* GAUGE / PROGRESS BAR */}
        <div className="mt-6 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
          <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-700">
            <span>Fator R Atual: {factorRPct.toFixed(2)}%</span>
            <span className="text-indigo-600 font-black">Meta para Anexo III: 28,00%</span>
          </div>

          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden relative">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAnexo3Eligible ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, (factorRPct / 40) * 100)}%` }}
            />
            {/* 28% Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-indigo-950 z-10"
              style={{ left: `${(28 / 40) * 100}%` }}
              title="Linha de corte de 28%"
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-1">
            <span>0%</span>
            <span className="font-bold text-slate-700">28% (Marco Legal)</span>
            <span>40%+</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-indigo-100 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Folha + Pró-labore Anual:</span>
              <p className="font-bold text-slate-900 mt-0.5">
                R$ {currentAnnualPayroll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Receita Bruta 12m (RBT12):</span>
              <p className="font-bold text-slate-900 mt-0.5">
                R$ {baseRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Alíquota Inicial Comparada:</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {isAnexo3Eligible ? 'Anexo III: a partir de 6,00%' : 'Anexo V: a partir de 15,50%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE PRO-LABORE OPTIMIZER */}
      {!isAnexo3Eligible && (
        <div className="bg-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-indigo-900">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-300" />
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Simulador de Otimização Tributária de Pró-labore
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-indigo-200 mb-6 leading-relaxed max-w-3xl font-medium">
            Ao aumentar o pró-labore oficial dos sócios, a despesa com folha sobe e ultrapassa os 28% da receita, permitindo migrar sua empresa legalmente do <strong>Anexo V para o Anexo III</strong> do Simples Nacional!
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Slider de Pró-labore Adicional */}
            <div className="bg-indigo-900/80 p-5 rounded-2xl border border-indigo-700/80 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                  Aumento de Pró-labore Mensal Sugerido
                </label>
                <span className="text-lg font-black text-emerald-400">
                  + R$ {simulatedExtraProLabore.toLocaleString('pt-BR')} / mês
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={Math.max(20000, Math.ceil(additionalPayrollNeededFor28Pct * 2))}
                step="250"
                value={simulatedExtraProLabore}
                onChange={(e) => setSimulatedExtraProLabore(Number(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-indigo-950 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-xs text-indigo-300 font-medium">
                <span>R$ 0</span>
                <span className="text-emerald-300 font-bold">
                  Mínimo para 28%: R$ {Math.ceil(additionalPayrollNeededFor28Pct).toLocaleString('pt-BR')}
                </span>
                <span>R$ {(Math.ceil(additionalPayrollNeededFor28Pct * 2)).toLocaleString('pt-BR')}</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onChangeInput({
                      monthlyProLabore: input.monthlyProLabore + simulatedExtraProLabore,
                    });
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-900/30 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aplicar este Pró-labore na Simulação Principal
                </button>
              </div>
            </div>

            {/* Resultado do Planejamento */}
            <div className="bg-indigo-900/80 p-5 rounded-2xl border border-indigo-700/80 space-y-3.5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Impacto Financeiro do Planejamento (Anual)
              </span>

              <div className="flex justify-between text-xs border-b border-indigo-800 pb-2">
                <span className="text-indigo-200">Economia em Impostos da Empresa (DAS):</span>
                <span className="font-bold text-emerald-400">
                  - R$ {potentialAnnualTaxSavingsWithFactorR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-xs border-b border-indigo-800 pb-2">
                <span className="text-indigo-200">Encargo Pessoal sobre Pró-labore (INSS/IRPF est.):</span>
                <span className="font-semibold text-amber-400">
                  + R$ {estimatedPersonalCostAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-sm pt-1">
                <span className="font-bold text-white">Ganho Líquido Real Anual no Bolso:</span>
                <span className="font-black text-emerald-400 text-base">
                  R$ {netAnnualBenefit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ano
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
