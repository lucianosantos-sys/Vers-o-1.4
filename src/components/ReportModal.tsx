import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Building2,
  Download,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Maximize2,
  Calendar,
} from 'lucide-react';
import { SimulationSummary, CompanyInput } from '../types/tax';
import { PrintReport } from './PrintReport';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SimulationSummary;
  onChangeInput: (updated: Partial<CompanyInput>) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  summary,
  onChangeInput,
}) => {
  if (!isOpen) return null;

  const { input, results, bestRegime, annualSavings, considerB2BCompetitiveFactor } = summary;
  const bestResult = results[bestRegime];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-100 rounded-3xl max-w-4xl w-full h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-indigo-950 text-white p-4 sm:px-6 flex items-center justify-between border-b border-indigo-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-800 text-white rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Relatório Executivo Completo (Formato Retrato A4)
                </h3>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Recomendação: {bestResult.name}
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Visualização do relatório sem cortes de campos para impressão ou salvamento em PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-indigo-950 text-xs font-black px-4 py-2 rounded-xl shadow-md shadow-emerald-950/40 transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Gerar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-indigo-300 hover:text-white p-2 rounded-xl hover:bg-indigo-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Company Quick Identification & Competitive Factor Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-500 whitespace-nowrap">Empresa:</label>
              <input
                type="text"
                value={input.companyName}
                onChange={(e) => onChangeInput({ companyName: e.target.value })}
                placeholder="Razão Social / Nome Fantasia"
                className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-500 whitespace-nowrap">CNPJ:</label>
              <input
                type="text"
                value={input.cnpj || ''}
                onChange={(e) => onChangeInput({ cnpj: e.target.value })}
                placeholder="00.000.000/0001-00"
                className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none w-36"
              />
            </div>
          </div>

          {/* Quick toggle for competitive factor directly in report modal */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Fator B2B:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
              <button
                type="button"
                onClick={() => onChangeInput({ considerB2BCompetitiveFactor: true })}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                  considerB2BCompetitiveFactor
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                Considerar
              </button>
              <button
                type="button"
                onClick={() => onChangeInput({ considerB2BCompetitiveFactor: false })}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                  !considerB2BCompetitiveFactor
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                Ignorar
              </button>
            </div>
          </div>

          <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ano: <strong>{input.simulationYear === '2027_transicao' ? '2027 (Transição)' : '2033 (Pleno)'}</strong></span>
          </div>
        </div>

        {/* Scrollable Printable Report Container in Portrait Mode */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200">
          <div className="w-full max-w-[800px] bg-white shadow-xl rounded-xl border border-slate-300 overflow-hidden">
            {/* Direct preview rendering of the report */}
            <div className="p-6 sm:p-8 text-slate-900 font-sans text-xs leading-normal">
              {/* Header */}
              <div className="border-b-2 border-indigo-900 pb-3 mb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-900 text-white font-black px-2 py-0.5 text-xs rounded">
                      SIMULAREFORMA
                    </span>
                    <h1 className="text-base font-black uppercase tracking-tight text-indigo-950">
                      Relatório de Planejamento Tributário — Reforma 2027
                    </h1>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Análise Comparativa: Simples Híbrido • Simples Simplificado • Lucro Presumido • Lucro Real
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Legislação: <strong>Lei Complementar nº 214/2025</strong> • <strong>LC nº 123/2006</strong> • <strong>EC nº 132/2023</strong>
                  </p>
                </div>

                <div className="text-right text-[11px] shrink-0">
                  <span className="font-black text-slate-900 block text-xs">
                    {input.companyName || 'Minha Empresa Ltda'}
                  </span>
                  <span className="text-slate-600 font-medium block">
                    CNPJ: {input.cnpj || '00.000.000/0001-00'}
                  </span>
                  <span className="text-slate-500 text-[10px] block">
                    Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-800 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5">
                    {input.simulationYear === '2027_transicao' ? 'Ano: 2027 (Transição IVA)' : 'Ano: 2033 (IVA Pleno)'}
                  </span>
                </div>
              </div>

              {/* Recommended Box */}
              <div className="border border-emerald-600 bg-emerald-50/90 p-3.5 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                    🏆 REGIME TRIBUTÁRIO MAIS VANTAJOSO: <span className="underline">{bestResult.name.toUpperCase()}</span>
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded">
                      {considerB2BCompetitiveFactor ? 'Com Fator B2B' : 'Apenas Imposto Direto'}
                    </span>
                    <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded">
                      Alíquota Efetiva: {bestResult.effectiveRatePct.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-950 leading-relaxed font-medium">
                  {considerB2BCompetitiveFactor ? (
                    bestRegime === 'simples_hibrido'
                      ? `Com ${input.b2bPercentage}% de vendas a Pessoas Jurídicas (B2B), o SIMPLES HÍBRIDO garante a transferência de 100% de crédito tributário de IBS e CBS aos seus clientes PJ, preservando suas margens comerciais e mantendo a competitividade da empresa.`
                      : `Para o perfil operacional atual, o ${bestResult.name.toUpperCase()} garante a maior eficiência econômica anual (R$ ${annualSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano), considerando a estrutura de compras e vendas B2B da empresa.`
                  ) : (
                    `[Critério de Menor Guia Direta] O regime do ${bestResult.name.toUpperCase()} entrega o menor desembolso tributário direto mensal (R$ ${bestResult.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês), gerando economia anual de R$ ${annualSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}.`
                  )}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-300/70 text-[10px]">
                  <div>
                    <span className="text-emerald-800 block font-semibold">Custo Tributário Mensal:</span>
                    <span className="font-black text-emerald-950 text-xs">
                      R$ {bestResult.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-800 block font-semibold">Economia Anual Estimada:</span>
                    <span className="font-black text-emerald-950 text-xs">
                      R$ {annualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ano
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-800 block font-semibold">Margem Líquida c/ Impostos:</span>
                    <span className="font-black text-emerald-950 text-xs">
                      {bestResult.profitMarginAfterTaxesPct.toFixed(1)}% (R$ {bestResult.profitMarginAfterTaxesMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/mês)
                    </span>
                  </div>
                </div>
              </div>

              {/* Enquadramento Simples Nacional LC 214/2025 */}
              {summary.enquadramento && (
                <div className="mb-4 border border-indigo-200 bg-indigo-50/40 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1.5 border-b border-indigo-200 pb-1">
                    <h3 className="font-black text-[11px] text-indigo-950 uppercase tracking-wide">
                      1. Enquadramento no Simples Nacional (LC 214/2025)
                    </h3>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded ${
                        summary.enquadramento.statusBadge.variant === 'success'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : summary.enquadramento.statusBadge.variant === 'warning'
                          ? 'bg-amber-100 text-amber-950 border border-amber-300'
                          : 'bg-rose-100 text-rose-950 border border-rose-300'
                      }`}
                    >
                      {summary.enquadramento.statusBadge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-[10px] mb-2">
                    <div>
                      <span className="text-slate-500 block font-semibold">Porte:</span>
                      <span className="font-bold text-slate-900">{summary.enquadramento.porteLabel}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">RBT12:</span>
                      <span className="font-bold text-slate-900">
                        R$ {summary.enquadramento.annualizedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Sublimite (3,6M):</span>
                      <span className="font-bold text-slate-900">
                        {summary.enquadramento.exceededSublimite ? '⚠️ Excedido' : '✓ No DAS'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Teto Máximo (4,8M):</span>
                      <span className="font-bold text-slate-900">
                        {summary.enquadramento.exceededLimiteMaximo ? '🚫 Desenquadrado' : '✓ Regular'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-700 font-medium leading-tight">
                    <strong>Atividade:</strong> {summary.enquadramento.activityEligibility.anexoName} — {summary.enquadramento.activityEligibility.activityNotes}
                  </p>
                </div>
              )}

              {/* Data & Financials */}
              <div className="mb-4">
                <h3 className="font-black text-[11px] text-slate-800 uppercase tracking-wide mb-1.5 border-b border-slate-200 pb-0.5">
                  2. Premissas Financeiras e Operacionais da Empresa
                </h3>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg grid grid-cols-4 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-500 block font-semibold">Faturamento Mensal:</span>
                    <span className="font-bold text-slate-900 text-[11px]">
                      R$ {input.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">RBT12 (12 meses):</span>
                    <span className="font-bold text-slate-900 text-[11px]">
                      R$ {input.rbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Folha + Pró-labore:</span>
                    <span className="font-bold text-slate-900 text-[11px]">
                      R$ {(input.monthlyPayroll + input.monthlyProLabore).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Compras Insumos c/ Crédito:</span>
                    <span className="font-bold text-slate-900 text-[11px]">
                      R$ {input.monthlyPurchasesInputs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Perfil da Carteira:</span>
                    <span className="font-bold text-slate-900">
                      {input.b2bPercentage}% PJ (B2B) / {100 - input.b2bPercentage}% Consumidor (B2C)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Segmento:</span>
                    <span className="font-bold text-slate-900 capitalize">
                      {input.businessSegment || 'Geral'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Monofásico PIS/COFINS:</span>
                    <span className="font-bold text-slate-900">
                      {input.monofasicoPisCofinsPercentage}% da receita
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">ICMS-ST Retido:</span>
                    <span className="font-bold text-slate-900">
                      {input.icmsStPercentage}% da receita
                    </span>
                  </div>
                </div>
              </div>

              {/* Complete Table of All 4 Regimes */}
              <div className="mb-4">
                <h3 className="font-black text-[11px] text-slate-800 uppercase tracking-wide mb-1.5 border-b border-slate-200 pb-0.5">
                  2. Comparativo Consolidado de Todos os Regimes Tributários
                </h3>
                <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                  <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-1.5 border-r border-slate-300 w-[22%]">Regime Tributário</th>
                      <th className="p-1.5 border-r border-slate-300 text-right w-[13%]">Guia DAS / IRPJ</th>
                      <th className="p-1.5 border-r border-slate-300 text-right w-[13%]">IBS + CBS Líq.</th>
                      <th className="p-1.5 border-r border-slate-300 text-right w-[11%]">INSS Folha</th>
                      <th className="p-1.5 border-r border-slate-300 text-right w-[14%]">Total Imposto/mês</th>
                      <th className="p-1.5 border-r border-slate-300 text-right w-[9%]">Alíq. Efet.</th>
                      <th className="p-1.5 text-right w-[18%]">Margem Líquida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.values(results) as any[]).map((r) => {
                      const isBest = r.regime === bestRegime;
                      return (
                        <tr
                          key={r.regime}
                          className={`border-b border-slate-200 ${
                            isBest ? 'bg-emerald-50 font-bold text-emerald-950' : 'text-slate-800'
                          }`}
                        >
                          <td className="p-1.5 border-r border-slate-300 font-bold">
                            {r.name} {isBest && '★'}
                          </td>
                          <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                            R$ {r.das.totalDas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                            R$ {r.ibsCbs.netPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                            R$ {r.payrollCharges.totalPayrollTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-1.5 border-r border-slate-300 text-right font-mono font-black">
                            R$ {r.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                            {r.effectiveRatePct.toFixed(2)}%
                          </td>
                          <td className="p-1.5 text-right font-mono font-bold text-emerald-800">
                            {r.profitMarginAfterTaxesPct.toFixed(1)}% (R$ {r.profitMarginAfterTaxesMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 0 })})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Before vs After Reform */}
              <div className="mb-4">
                <h3 className="font-black text-[11px] text-slate-800 uppercase tracking-wide mb-1.5 border-b border-slate-200 pb-0.5">
                  3. Comparativo Antes x Depois da Reforma Tributária (Sistema Atual vs 2027)
                </h3>
                <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                  <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-1.5 border-r border-slate-300">Cenário Tributário</th>
                      <th className="p-1.5 border-r border-slate-300 text-right">Custo Mensal (R$)</th>
                      <th className="p-1.5 border-r border-slate-300 text-right">Custo Anual (R$)</th>
                      <th className="p-1.5 border-r border-slate-300 text-right">Alíquota Efetiva</th>
                      <th className="p-1.5 text-right">Crédito Gerado p/ Clientes PJ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-1.5 border-r border-slate-300 font-semibold text-slate-700">
                        Sistema Atual (PIS / COFINS / ICMS / ISS)
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                        R$ {summary.prePostComparison.preReform.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                        R$ {summary.prePostComparison.preReform.totalAnnualTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                        {summary.prePostComparison.preReform.effectiveRatePct.toFixed(2)}%
                      </td>
                      <td className="p-1.5 text-right font-mono">
                        {summary.prePostComparison.preReform.b2bCreditTransferPct.toFixed(2)}%
                      </td>
                    </tr>
                    <tr className="bg-indigo-50/70 font-bold text-indigo-950 border-b border-slate-200">
                      <td className="p-1.5 border-r border-slate-300">
                        Reforma 2027 ({bestResult.name})
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                        R$ {summary.prePostComparison.postReform.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                        R$ {summary.prePostComparison.postReform.totalAnnualTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                        {summary.prePostComparison.postReform.effectiveRatePct.toFixed(2)}%
                      </td>
                      <td className="p-1.5 text-right font-mono text-emerald-800">
                        {summary.prePostComparison.postReform.b2bCreditTransferPct.toFixed(2)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Strategic Advice */}
              <div className="border border-slate-200 bg-slate-50/80 p-3 rounded-lg mb-4 space-y-2">
                <h3 className="font-black text-[11px] text-slate-900 uppercase tracking-wide">
                  4. Recomendações Práticas para o Empreendedor
                </h3>
                <div className="grid grid-cols-2 gap-3 text-[10px] leading-relaxed">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-bold text-indigo-900 block">1. Atenção à Carteira B2B:</span>
                    <p className="text-slate-600">
                      Clientes pessoas jurídicas que compram de você vão exigir crédito de IBS/CBS. O Simples Híbrido protege sua carteira de vendas sem necessidade de dar descontos.
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-bold text-indigo-900 block">2. Segregação no PGDAS-D:</span>
                    <p className="text-slate-600">
                      Mantenha a segregação de itens monofásicos e com ICMS-ST para evitar o pagamento de tributos em duplicidade na guia mensal.
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-bold text-indigo-900 block">3. Exija Notas nas Compras:</span>
                    <p className="text-slate-600">
                      Todas as compras de mercadorias, insumos e custos operacionais com nota fiscal geram créditos para abater seus impostos no regime não-cumulativo.
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="font-bold text-indigo-900 block">4. Alinhamento Contábil:</span>
                    <p className="text-slate-600">
                      Revise esta análise anualmente com seu contador para protocolar a opção pelo Simples Híbrido ou Simplificado no prazo legal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="border-t border-slate-300 pt-3 text-[9px] text-slate-500 space-y-3">
                <p className="leading-tight">
                  * Este relatório foi gerado automaticamente pela ferramenta de Simulação Tributária Simula 2027 com base nos dados fornecidos pelo usuário.
                </p>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="border-t border-slate-400 pt-1 text-center">
                    <span className="font-bold text-slate-800 block text-[10px]">
                      {input.companyName || 'Representante Legal da Empresa'}
                    </span>
                    <span className="text-[9px] text-slate-500">Empreendedor / Contribuinte</span>
                  </div>
                  <div className="border-t border-slate-400 pt-1 text-center">
                    <span className="font-bold text-slate-800 block text-[10px]">
                      Responsável Técnico Contábil
                    </span>
                    <span className="text-[9px] text-slate-500">CRC / Consultoria Tributária</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="bg-white border-t border-slate-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Formato retrato A4 otimizado sem corte de colunas ou quebras indevidas.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Fechar Visualização
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-100 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
