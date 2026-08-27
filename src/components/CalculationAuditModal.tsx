import React from 'react';
import { X, FileSpreadsheet, Calculator, Info, ShieldCheck, Scale, AlertCircle, Sparkles } from 'lucide-react';
import { RegimeResult, CompanyInput } from '../types/tax';
import { ANEXO_NAMES } from '../data/taxTables';

interface CalculationAuditModalProps {
  regimeResult: RegimeResult | null;
  input: CompanyInput;
  onClose: () => void;
}

export const CalculationAuditModal: React.FC<CalculationAuditModalProps> = ({
  regimeResult,
  input,
  onClose,
}) => {
  if (!regimeResult) return null;

  const anexoInfo = ANEXO_NAMES[regimeResult.audit.appliedAnexo];
  const { segregationSavings } = regimeResult;
  const hasMonofasicoOrSt = input.monofasicoPisCofinsPercentage > 0 || input.icmsStPercentage > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-indigo-900 flex items-center justify-between bg-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-800 text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Memória de Cálculo: {regimeResult.name}
              </h2>
              <p className="text-xs text-indigo-200 font-medium">
                Detalhamento matemático da apuração tributária (LC 123/2006 e Reforma 2027)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-indigo-300 hover:text-white hover:bg-indigo-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Base Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-xs font-medium">
            <div>
              <span className="text-slate-500 font-medium block">RBT12 Acumulado:</span>
              <span className="font-bold text-slate-900">
                R$ {input.rbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Faturamento Mensal:</span>
              <span className="font-bold text-slate-900">
                R$ {input.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Segmento Setorial:</span>
              <span className="font-bold text-indigo-700 capitalize">{input.businessSegment}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Enquadramento Aplicado:</span>
              <span className="font-bold text-indigo-700">{anexoInfo.name}</span>
            </div>
          </div>

          {/* SEGREGAÇÃO SETORIAL (LEGISLAÇÃO MONOFÁSICO & ICMS-ST) */}
          {hasMonofasicoOrSt && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 text-white border border-emerald-800/40 space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Segregação Legal Aplicada (Art. 18, § 4º-A da LC 123/2006)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 font-bold block">PIS/COFINS Monofásico ({input.monofasicoPisCofinsPercentage}% da receita):</span>
                  <span className="text-emerald-400 font-black text-sm block mt-0.5">
                    - R$ {segregationSavings.monofasicoPisCofinsMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Fundamento: Leis 10.147/00 (Medicamentos), 10.485/02 (Autopeças), 13.097/15 (Bebidas).
                  </span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-slate-400 font-bold block">ICMS-ST Retido na Fonte ({input.icmsStPercentage}% da receita):</span>
                  <span className="text-emerald-400 font-black text-sm block mt-0.5">
                    - R$ {segregationSavings.icmsStMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Fundamento: Convênio ICMS 142/2018 e LC 123/2006 art. 18 § 4º-A, IV.
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                <span className="text-emerald-200">Economia Anual pela segregação no PGDAS-D:</span>
                <span className="text-emerald-400 font-black text-sm">
                  R$ {segregationSavings.totalAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ano
                </span>
              </div>
            </div>
          )}

          {/* LUCRO PRESUMIDO AUDIT (SEGREGAÇÃO DE VENDAS E SERVIÇOS - LEI 9.249/95) */}
          {regimeResult.regime === 'lucro_presumido' && regimeResult.revenueSegregationAudit && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                1. Base de Cálculo Segregada de IRPJ e CSLL (Lei 9.249/1995, arts. 15 e 20)
              </h3>

              <div className="bg-slate-900 text-white p-5 rounded-2xl text-xs space-y-3 border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-indigo-300 font-bold uppercase tracking-wider">
                    {regimeResult.revenueSegregationAudit.isSegregated ? 'Segregação Ativa (Comércio/Vendas + Serviços)' : 'Segregação Padrão por Atividade Principal'}
                  </span>
                  <span className="text-slate-400 font-mono">
                    Receita Total: R$ {regimeResult.revenueSegregationAudit.salesRevenueMonthly + regimeResult.revenueSegregationAudit.servicesRevenueMonthly > 0 ? (regimeResult.revenueSegregationAudit.salesRevenueMonthly + regimeResult.revenueSegregationAudit.servicesRevenueMonthly).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : input.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Composição por Anexos */}
                {regimeResult.revenueSegregationAudit.anexoRevenues && Object.values(regimeResult.revenueSegregationAudit.anexoRevenues).some((v) => Number(v || 0) > 0) && (
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 space-y-1.5 font-mono text-[11px]">
                    <span className="text-indigo-300 font-bold block uppercase tracking-wider text-[10px]">
                      Composição do Faturamento por Categoria / Anexo:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(regimeResult.revenueSegregationAudit.anexoRevenues).map(([k, v]) => {
                        const numVal = Number(v || 0);
                        if (numVal <= 0) return null;
                        const label = k === 'anexo_1' ? 'Anexo I (Comércio)' :
                                      k === 'anexo_2' ? 'Anexo II (Indústria)' :
                                      k === 'anexo_3' ? 'Anexo III (c/ ISS)' :
                                      k === 'anexo_3_sem_iss' ? 'Anexo III (s/ ISS)' :
                                      k === 'anexo_4' ? 'Anexo IV (c/ ISS)' :
                                      k === 'anexo_4_sem_iss' ? 'Anexo IV (s/ ISS)' : 'Anexo V (Fator R)';
                        return (
                          <div key={k} className="p-1.5 bg-slate-900 rounded border border-slate-800">
                            <span className="text-slate-400 block text-[10px] truncate">{label}</span>
                            <span className="text-emerald-400 font-bold">R$ {numVal.toLocaleString('pt-BR')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* IRPJ APURAÇÃO */}
                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                    <div className="flex justify-between items-center text-amber-300 font-bold">
                      <span>Apuração do IRPJ (Presunção Legal)</span>
                      <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md font-mono">Art. 15</span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span>• Vendas (8% de R$ {regimeResult.revenueSegregationAudit.salesRevenueMonthly.toLocaleString('pt-BR')}):</span>
                        <span className="text-white font-bold">R$ {regimeResult.revenueSegregationAudit.irpjPresumedBaseSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Serviços (32% de R$ {regimeResult.revenueSegregationAudit.servicesRevenueMonthly.toLocaleString('pt-BR')}):</span>
                        <span className="text-white font-bold">R$ {regimeResult.revenueSegregationAudit.irpjPresumedBaseServices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-700 pt-1 text-indigo-300 font-bold">
                        <span>Base Presumida Total IRPJ:</span>
                        <span>R$ {regimeResult.revenueSegregationAudit.totalIrpjPresumedBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-slate-300 pt-0.5">
                        <span>Alíquota Básica (15%):</span>
                        <span>R$ {regimeResult.revenueSegregationAudit.irpjBaseRateAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-amber-300">
                        <span>Adicional IRPJ (10% &gt; R$ 20k/mês):</span>
                        <span>R$ {regimeResult.revenueSegregationAudit.irpjAdicionalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-700 pt-1 text-emerald-400 font-black text-xs">
                        <span>IRPJ Total Devido:</span>
                        <span>R$ {regimeResult.revenueSegregationAudit.totalIrpjAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* CSLL APURAÇÃO */}
                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
                    <div className="flex justify-between items-center text-cyan-300 font-bold">
                      <span>Apuração da CSLL (Presunção Legal)</span>
                      <span className="text-xs bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded-md font-mono">Art. 20</span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span>• Vendas (12% de R$ {regimeResult.revenueSegregationAudit.salesRevenueMonthly.toLocaleString('pt-BR')}):</span>
                        <span className="text-white font-bold">R$ {regimeResult.revenueSegregationAudit.csllPresumedBaseSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Serviços (32% de R$ {regimeResult.revenueSegregationAudit.servicesRevenueMonthly.toLocaleString('pt-BR')}):</span>
                        <span className="text-white font-bold">R$ {regimeResult.revenueSegregationAudit.csllPresumedBaseServices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-700 pt-1 text-indigo-300 font-bold">
                        <span>Base Presumida Total CSLL:</span>
                        <span>R$ {regimeResult.revenueSegregationAudit.totalCsllPresumedBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-slate-300 pt-0.5">
                        <span>Alíquota CSLL (9% sobre a base):</span>
                        <span className="text-emerald-400 font-black text-xs">R$ {regimeResult.revenueSegregationAudit.totalCsllAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="pt-2 text-[10px] text-slate-400 italic">
                        * A presunção de 12% para vendas e 32% para serviços reflete o art. 20 da Lei 9.249/1995.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LUCRO REAL AUDIT (DEDUÇÕES LEGAIS E CONTÁBEIS - RIR/2018 E LEI 9.249/95) */}
          {regimeResult.regime === 'lucro_real' && regimeResult.lucroRealAudit && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                1. Demonstração das Deduções Legais e Apuração do IRPJ/CSLL (RIR/2018 Dec. 9.580/2018)
              </h3>

              <div className="bg-slate-900 text-white p-5 rounded-2xl text-xs space-y-3 border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-indigo-300 font-bold uppercase tracking-wider">
                    {regimeResult.lucroRealAudit.methodUsed === 'deducoes_reais'
                      ? 'Método Legal por Deduções Reais (DRE Contábil / LAIR)'
                      : 'Método por Margem Operacional Estimada'}
                  </span>
                  <span className="text-slate-400 font-mono">
                    Receita Bruta: R$ {regimeResult.lucroRealAudit.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Tabela de DRE e Deduções */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-800/90 text-slate-300">
                      <tr>
                        <th className="p-2.5">Rubrica Contábil / Fiscal</th>
                        <th className="p-2.5">Fundamentação Legal</th>
                        <th className="p-2.5 text-right">Valor Mensal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      <tr className="bg-slate-900/40">
                        <td className="p-2.5 font-bold text-white">(+) Receita Bruta Operacional</td>
                        <td className="p-2.5 text-slate-400">Total de faturamento auferido</td>
                        <td className="p-2.5 text-right font-bold text-emerald-400">
                          + R$ {regimeResult.lucroRealAudit.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">(-) Custos das Mercadorias / Insumos (CPV/CMV)</td>
                        <td className="p-2.5 text-slate-400">RIR/2018 art. 290 e Lei 9.249/95</td>
                        <td className="p-2.5 text-right text-rose-400">
                          - R$ {regimeResult.lucroRealAudit.purchasesCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">(-) Salários de Empregados CLT</td>
                        <td className="p-2.5 text-slate-400">RIR/2018 art. 311 (Despesa necessária)</td>
                        <td className="p-2.5 text-right text-rose-400">
                          - R$ {regimeResult.lucroRealAudit.payrollSalaries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">(-) Encargos Previdenciários e Sociais (28,8%)</td>
                        <td className="p-2.5 text-slate-400">INSS Patronal (20%), RAT (3%) e Terceiros (5,8%)</td>
                        <td className="p-2.5 text-right text-rose-400">
                          - R$ {regimeResult.lucroRealAudit.payrollCharges.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">(-) Remuneração de Administradores (Pró-labore)</td>
                        <td className="p-2.5 text-slate-400">RIR/2018 art. 357</td>
                        <td className="p-2.5 text-right text-rose-400">
                          - R$ {regimeResult.lucroRealAudit.proLabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">(-) Outras Despesas Operacionais / Administrativas</td>
                        <td className="p-2.5 text-slate-400">RIR/2018 art. 311 (Aluguéis, água, luz, internet, etc)</td>
                        <td className="p-2.5 text-right text-rose-400">
                          - R$ {regimeResult.lucroRealAudit.otherDeductibleExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr className="bg-indigo-950/80 font-bold border-t border-indigo-700">
                        <td className="p-2.5 text-indigo-200">(=) Lucro Contábil / LAIR (Base Real Efetiva)</td>
                        <td className="p-2.5 text-indigo-300">
                          {regimeResult.lucroRealAudit.isTaxLoss ? '⚠️ PREJUÍZO FISCAL CONTÁBIL' : 'Base Tributável Positiva'}
                        </td>
                        <td className={`p-2.5 text-right font-black ${regimeResult.lucroRealAudit.isTaxLoss ? 'text-amber-400' : 'text-emerald-400'}`}>
                          R$ {regimeResult.lucroRealAudit.accountingLair.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Resultado da Tributação no Lucro Real */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-slate-400 font-bold block text-[11px]">IRPJ no Lucro Real:</span>
                    <div className="text-xs font-mono space-y-0.5 mt-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Base de Cálculo Real:</span>
                        <span className="font-bold">R$ {regimeResult.lucroRealAudit.taxableRealBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Alíquota Normal (15%):</span>
                        <span>R$ {regimeResult.lucroRealAudit.irpjBaseRateAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-amber-300">
                        <span>Adicional IRPJ (10% &gt; R$ 20k/mês):</span>
                        <span>R$ {regimeResult.lucroRealAudit.irpjAdicionalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-700 pt-1 text-emerald-400 font-bold">
                        <span>Total IRPJ Real:</span>
                        <span>R$ {regimeResult.lucroRealAudit.totalIrpjAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-slate-400 font-bold block text-[11px]">CSLL no Lucro Real:</span>
                    <div className="text-xs font-mono space-y-0.5 mt-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Base de Cálculo Real:</span>
                        <span className="font-bold">R$ {regimeResult.lucroRealAudit.taxableRealBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Alíquota CSLL (9%):</span>
                        <span>R$ {regimeResult.lucroRealAudit.totalCsllAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-700 pt-1 text-emerald-400 font-bold">
                        <span>Total CSLL Real:</span>
                        <span>R$ {regimeResult.lucroRealAudit.totalCsllAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      {regimeResult.lucroRealAudit.isTaxLoss && (
                        <div className="text-[10px] text-amber-300 pt-1 font-sans">
                          * Havendo prejuízo fiscal, não há incidência de IRPJ e CSLL (RIR/2018).
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIMPLES NACIONAL DAS AUDIT */}
          {(regimeResult.regime === 'simples_simplificado' || regimeResult.regime === 'simples_hibrido') && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                1. Fórmula da Alíquota Efetiva do Simples Nacional (LC 123/2006)
              </h3>

              <div className="bg-indigo-950 text-emerald-300 p-5 rounded-2xl font-mono text-xs space-y-2 border border-indigo-900 shadow-inner">
                <div>Alíquota Efetiva = [(RBT12 × Alíquota Nominal) - Parcela a Deduzir] ÷ RBT12</div>
                <div className="text-indigo-200">
                  = [(R$ {input.rbt12.toLocaleString('pt-BR')} × {(regimeResult.audit.nominalRate * 100).toFixed(2)}%) - R$ {regimeResult.audit.deductionValue.toLocaleString('pt-BR')}] ÷ R$ {input.rbt12.toLocaleString('pt-BR')}
                </div>
                <div className="text-white font-black text-sm">
                  = {(regimeResult.audit.simplesEffectiveRate * 100).toFixed(4)}% (Faixa {regimeResult.audit.bracketNumber})
                </div>
              </div>

              {/* Segregação de Tributos da Guia DAS */}
              <div className="border border-indigo-100 rounded-2xl overflow-hidden mt-3 shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-indigo-50/70 text-indigo-950 font-bold border-b border-indigo-100">
                    <tr>
                      <th className="p-3">Tributo</th>
                      <th className="p-3">Destinação / Fundamentação</th>
                      <th className="p-3 text-right">No DAS Simplificado</th>
                      <th className="p-3 text-right">No DAS Híbrido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-50">
                    <tr>
                      <td className="p-3 font-semibold text-slate-800">IRPJ</td>
                      <td className="p-3 text-slate-500 font-medium">Imposto de Renda PJ (Federal)</td>
                      <td className="p-3 text-right font-bold">
                        R$ {regimeResult.das.irpj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        R$ {regimeResult.das.irpj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800">CSLL</td>
                      <td className="p-3 text-slate-500 font-medium">Contribuição Social sobre Lucro (Federal)</td>
                      <td className="p-3 text-right font-bold">
                        R$ {regimeResult.das.csll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        R$ {regimeResult.das.csll.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-800">CPP (Previdenciária)</td>
                      <td className="p-3 text-slate-500 font-medium">INSS Patronal da Empresa</td>
                      <td className="p-3 text-right font-bold">
                        R$ {regimeResult.das.cpp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        R$ {regimeResult.das.cpp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="p-3 font-semibold text-slate-800">PIS / COFINS</td>
                      <td className="p-3 text-slate-500 font-medium">
                        {input.monofasicoPisCofinsPercentage > 0
                          ? `Dedução de ${input.monofasicoPisCofinsPercentage}% (Monofásico Lei 10.147/10.485/13.097)`
                          : 'Tributado integralmente no DAS'}
                      </td>
                      <td className="p-3 text-right font-bold">
                        R$ {(regimeResult.das.cofins + regimeResult.das.pis).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-400">
                        R$ 0,00 (Apura por fora)
                      </td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="p-3 font-semibold text-slate-800">ICMS</td>
                      <td className="p-3 text-slate-500 font-medium">
                        {input.icmsStPercentage > 0
                          ? `Dedução de ${input.icmsStPercentage}% (ICMS-ST Convênio 142/2018)`
                          : 'Tributado sobre vendas de mercadorias no DAS'}
                      </td>
                      <td className="p-3 text-right font-bold">
                        R$ {regimeResult.das.icms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-400">
                        R$ 0,00 (Apura por fora)
                      </td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="p-3 font-semibold text-slate-800">ISS</td>
                      <td className="p-3 text-slate-500 font-medium">
                        {(regimeResult.das.deductedIss && regimeResult.das.deductedIss > 0)
                          ? `Dedução de R$ ${regimeResult.das.deductedIss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por receitas de serviços SEM ISS (isento/exportação/retenção na fonte)`
                          : 'Tributado sobre prestação de serviços no DAS'}
                      </td>
                      <td className="p-3 text-right font-bold">
                        R$ {regimeResult.das.iss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-400">
                        R$ 0,00 (Apura por fora)
                      </td>
                    </tr>
                    <tr className="bg-indigo-50 font-black text-indigo-950">
                      <td colSpan={2} className="p-3">Total da Guia DAS Mensal (com segregação):</td>
                      <td className="p-3 text-right text-emerald-600">
                        R$ {regimeResult.das.totalDas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right text-emerald-600">
                        R$ {regimeResult.das.totalDas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* IBS / CBS CALCULATION SECTION */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              2. Apuração do IVA Dual (IBS Estadual/Municipal + CBS Federal)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Débito Bruto sobre Vendas:</span>
                <p className="text-base font-black text-slate-900 mt-1">
                  R$ {regimeResult.ibsCbs.grossDebit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-slate-500 font-semibold block">
                  {input.salesReductionMode === 'rateio_personalizado'
                    ? `Rateio Personalizado (Alíquota ponderada: ${(regimeResult.ibsCbs.rateApplied * 100).toFixed(2)}%)`
                    : `Alíquota efetiva aplicada: ${(regimeResult.ibsCbs.rateApplied * 100).toFixed(2)}%`}
                </span>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-700 font-medium">(-) Créditos de Insumos/Compras:</span>
                <p className="text-base font-black text-emerald-700 mt-1">
                  R$ {regimeResult.ibsCbs.eligibleCredits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-emerald-600 font-semibold block">
                  {input.purchasesReductionMode === 'rateio_personalizado'
                    ? `Rateio em 6 faixas (Base: R$ ${input.monthlyPurchasesInputs.toLocaleString('pt-BR')})`
                    : `Sobre R$ ${input.monthlyPurchasesInputs.toLocaleString('pt-BR')} de despesas`}
                </span>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200">
                <span className="text-xs text-indigo-700 font-medium">(=) IBS + CBS Líquido a Pagar:</span>
                <p className="text-base font-black text-indigo-900 mt-1">
                  R$ {regimeResult.ibsCbs.netPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-indigo-600 font-semibold">
                  Saldo a recolher na guia do IBS/CBS
                </span>
              </div>
            </div>
          </div>

          {/* PAYROLL TAXES AUDIT */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-600" />
              3. Encargos Previdenciários de Folha de Pagamento
            </h3>

            <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div>
                <span className="font-black text-slate-900 block">
                  INSS Patronal (CPP) + RAT + Terceiros
                </span>
                <p className="text-slate-500 font-medium mt-0.5">
                  {regimeResult.audit.appliedAnexo === 'anexo_4'
                    ? 'No Anexo IV, a CPP não está inclusa no DAS. Recolhe 28,8% sobre folha e pró-labore à parte.'
                    : regimeResult.regime === 'lucro_presumido' || regimeResult.regime === 'lucro_real'
                    ? 'Nos regimes de Lucro Presumido e Real, a empresa paga 28,8% de encargos patronais integrais.'
                    : 'Nos Anexos I, II, III e V do Simples, a empresa tem isenção dos 20% patronais (incluso no DAS).'}
                </p>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className="text-base font-black text-slate-900">
                  R$ {regimeResult.payrollCharges.totalPayrollTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                </span>
              </div>
            </div>
          </div>

          {/* PROFIT MARGINS AUDIT */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              4. Análise de Margem de Lucro (Sem Impostos vs Com Impostos)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Margem de Lucro sem considerar impostos:</span>
                <p className="text-lg font-black text-slate-900 mt-1">
                  {regimeResult.profitMarginBeforeTaxesPct.toFixed(2)}%
                </p>
                <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                  R$ {regimeResult.profitMarginBeforeTaxesMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês (R$ {(regimeResult.profitMarginBeforeTaxesMonthly * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ano)
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Calculado: Faturamento (R$ {input.monthlyRevenue.toLocaleString('pt-BR')}) - Insumos (R$ {input.monthlyPurchasesInputs.toLocaleString('pt-BR')}) - Folha/Pró-labore (R$ {(input.monthlyPayroll + input.monthlyProLabore).toLocaleString('pt-BR')})
                </span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-800 font-medium block">Margem de Lucro considerando impostos:</span>
                <p className="text-lg font-black text-emerald-700 mt-1">
                  {regimeResult.profitMarginAfterTaxesPct.toFixed(2)}%
                </p>
                <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">
                  R$ {regimeResult.profitMarginAfterTaxesMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês (R$ {regimeResult.estimatedNetProfitAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ano)
                </span>
                <span className="text-[10px] text-emerald-700/80 mt-1 block">
                  Lucro Líquido final retido após dedução da carga direta e impacto comercial.
                </span>
              </div>
            </div>
          </div>

          {/* B2B COMPENSATION DISCOUNT & TAX GUIDE RECALCULATION AUDIT */}
          {input.b2bPercentage > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                5. Recálculo das Guias de Impostos sob Modo Competitivo B2B
              </h3>

              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200 space-y-3.5 text-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2.5 border-b border-indigo-200/70">
                  <div>
                    <span className="font-black text-indigo-950 block">
                      Cenário B2B: {input.b2bPercentage}% das Vendas para Pessoas Jurídicas (PJ)
                    </span>
                    <span className="text-indigo-700 font-medium text-[11px]">
                      Base B2B Mensal: R$ {((input.monthlyRevenue * input.b2bPercentage) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-bold text-[11px]">
                    Margem de Compensação Ativa: {input.b2bDisputeDiscountPct}%
                  </div>
                </div>

                {/* 3 Cards de Apuração do Recálculo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
                    <span className="text-slate-500 font-medium block">Guia Nominal Direta:</span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5 font-mono">
                      R$ {regimeResult.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400">Guia DAS / DARF mensal direta</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs">
                    <span className="text-amber-700 font-medium block">Compensação Comercial B2B:</span>
                    <span className="text-sm font-black text-amber-600 block mt-0.5 font-mono">
                      {regimeResult.estimatedCommercialLossMonthly > 0
                        ? `+ R$ ${regimeResult.estimatedCommercialLossMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : 'R$ 0,00 (Crédito Pleno)'}
                    </span>
                    <span className="text-[10px] text-amber-600/80">
                      {regimeResult.estimatedCommercialLossMonthly > 0
                        ? `Margem de ${input.b2bDisputeDiscountPct}% da perda de crédito`
                        : 'Cliente PJ toma 100% dos créditos'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-indigo-200 shadow-2xs">
                    <span className="text-indigo-900 font-medium block">(=) Custo Total Recalculado:</span>
                    <span className="text-sm font-black text-indigo-950 block mt-0.5 font-mono">
                      R$ {regimeResult.totalAdjustedCostMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold">
                      Alíquota Recalculada: {regimeResult.adjustedEffectiveRatePct.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Detalhamento Especial para o Simples Simplificado */}
                {regimeResult.regime === 'simples_simplificado' && regimeResult.competitiveRecalculation && (
                  <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2">
                    <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider block">
                      Memória do Recálculo da Guia DAS sob Desconto em Nota Fiscal (NF-e)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                      <div className="p-2 bg-amber-50/50 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">Faturamento Original:</span>
                        <span className="font-bold font-mono">
                          R$ {input.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="p-2 bg-amber-50/50 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">Receita Líquida Faturada:</span>
                        <span className="font-bold text-amber-900 font-mono">
                          R$ {regimeResult.competitiveRecalculation.netInvoicedRevenueMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="text-[10px] text-emerald-700 block">Guia DAS Recalculada (Base Menor):</span>
                        <span className="font-black text-emerald-900 font-mono">
                          R$ {regimeResult.competitiveRecalculation.recalculatedTaxGuideMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[9px] text-emerald-700 block mt-0.5">
                          Economia de R$ {regimeResult.competitiveRecalculation.taxBaseReductionSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} na guia
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Fechar Memória de Cálculo
          </button>
        </div>
      </div>
    </div>
  );
};
