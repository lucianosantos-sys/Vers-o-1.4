import React from 'react';
import { SimulationSummary, RegimeResult } from '../types/tax';
import { ANEXO_NAMES } from '../data/taxTables';

interface PrintReportProps {
  summary: SimulationSummary;
}

export const PrintReport: React.FC<PrintReportProps> = ({ summary }) => {
  const {
    input,
    results,
    bestRegime,
    annualSavings,
    monthlySavings,
    prePostComparison,
    sectorSavingsHighlight,
    enquadramento,
    considerB2BCompetitiveFactor,
  } = summary;

  const bestResult = results[bestRegime];
  const anexo = ANEXO_NAMES[input.anexo] || { name: 'Anexo I - Comércio', rate: '4.00%' };
  const { preReform, postReform, deltaMonthly, deltaAnnual, deltaRatePct, substitutionRows } = prePostComparison;

  const isHibrido = bestRegime === 'simples_hibrido';
  const isSimplificado = bestRegime === 'simples_simplificado';

  const fullIbsCbsRate = input.useCustomIbsCbsRate
    ? input.customCbsRatePct + input.customIbsRatePct
    : input.simulationYear === '2027_transicao'
    ? input.cbsRate2027 + input.ibsRate2027
    : input.fullCbsIbsRate || 26.5;

  return (
    <div
      id="printable-report"
      className="hidden print:block p-6 sm:p-8 bg-white text-slate-900 font-sans text-xs max-w-[800px] mx-auto leading-normal"
    >
      {/* 1. CABEÇALHO DO RELATÓRIO EXECUTIVO */}
      <div className="border-b-2 border-indigo-900 pb-3 mb-4 flex justify-between items-start print-avoid-break">
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
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
              {input.simulationYear === '2027_transicao' ? 'Ano: 2027' : 'Ano: 2033'}
            </span>
            <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
              {considerB2BCompetitiveFactor ? 'Critério: Fator B2B' : 'Critério: Menor Guia'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. PARECER EXECUTIVO DE RECOMENDAÇÃO (DESTAQUE) */}
      <div className="border border-emerald-600 bg-emerald-50/80 p-3.5 rounded-lg mb-4 print-avoid-break">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
            🏆 REGIME TRIBUTÁRIO MAIS VANTAJOSO: <span className="underline">{bestResult.name.toUpperCase()}</span>
          </h2>
          <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded">
            Alíquota Efetiva: {bestResult.effectiveRatePct.toFixed(2)}%
          </span>
        </div>

        <p className="text-[11px] text-emerald-950 leading-relaxed font-medium">
          {considerB2BCompetitiveFactor ? (
            isHibrido
              ? `Com ${input.b2bPercentage}% de vendas a Pessoas Jurídicas (B2B), a opção pelo SIMPLES HÍBRIDO garante a transferência de 100% de crédito tributário de IBS e CBS aos seus clientes PJ (${fullIbsCbsRate.toFixed(2)}%), preservando suas margens comerciais e evitando a perda de contratos.`
              : isSimplificado
              ? `Para o perfil da empresa (com forte atuação B2C ou cadeia sem pressão de créditos), o SIMPLES SIMPLIFICADO em guia única garante a maior economia líquida anual (R$ ${annualSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano) com total simplicidade operacional.`
              : `O regime do ${bestResult.name} apresentou a maior eficiência fiscal e melhor rentabilidade líquida para as projeções da empresa.`
          ) : (
            `[Critério de Menor Guia Direta] O regime do ${bestResult.name} garante a menor guia mensal direta a pagar (R$ ${bestResult.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês), gerando economia anual estimada em R$ ${annualSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}.`
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

      {/* 3. ENQUADRAMENTO NO SIMPLES NACIONAL (LC 214/2025 & LC 123/2006) */}
      {enquadramento && (
        <div className="mb-4 print-avoid-break border border-indigo-200 bg-indigo-50/40 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-1.5 border-b border-indigo-200 pb-1">
            <h3 className="font-black text-[11px] text-indigo-950 uppercase tracking-wide">
              1. Verificação de Enquadramento no Simples Nacional (LC 214/2025)
            </h3>
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded ${
                enquadramento.statusBadge.variant === 'success'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : enquadramento.statusBadge.variant === 'warning'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300'
                  : 'bg-rose-100 text-rose-950 border border-rose-300'
              }`}
            >
              {enquadramento.statusBadge.label}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px] mb-2">
            <div>
              <span className="text-slate-500 block font-semibold">Porte da Empresa:</span>
              <span className="font-bold text-slate-900">{enquadramento.porteLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">RBT12 Acumulado:</span>
              <span className="font-bold text-slate-900">
                R$ {enquadramento.annualizedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Sublimite Estadual (3,6M):</span>
              <span className="font-bold text-slate-900">
                {enquadramento.exceededSublimite ? '⚠️ Excedido (Fora do DAS)' : '✓ Regular no DAS'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Teto Nacional (4,8M):</span>
              <span className="font-bold text-slate-900">
                {enquadramento.exceededLimiteMaximo ? '🚫 Desenquadrado' : '✓ Dentro do Limite'}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-700 font-medium leading-tight">
            <strong>Atividade e Enquadramento:</strong> {enquadramento.activityEligibility.anexoName} — {enquadramento.activityEligibility.activityNotes}
          </p>
        </div>
      )}

      {/* 4. DADOS E PREMISSAS DA EMPRESA */}
      <div className="mb-4 print-avoid-break">
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
            <span className="text-slate-500 block font-semibold">RBT12 (Acumulado 12m):</span>
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
            <span className="text-slate-500 block font-semibold">Compras c/ Crédito IBS/CBS:</span>
            <span className="font-bold text-slate-900 text-[11px]">
              R$ {input.monthlyPurchasesInputs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Perfil de Clientes:</span>
            <span className="font-bold text-slate-900">
              {input.b2bPercentage}% PJ (B2B) / {100 - input.b2bPercentage}% Consumidor (B2C)
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Atividade / Anexo:</span>
            <span className="font-bold text-slate-900">
              {anexo.name}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">PIS/COFINS Monofásico:</span>
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

      {/* 5. QUADRO COMPARATIVO CONSOLIDADO DOS REGIMES TRIBUTÁRIOS (TABELA COMPLETA SEM CORTE) */}
      <div className="mb-4 print-avoid-break">
        <h3 className="font-black text-[11px] text-slate-800 uppercase tracking-wide mb-1.5 border-b border-slate-200 pb-0.5">
          3. Comparativo Consolidado de Todos os Regimes Tributários
        </h3>
        <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
          <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
            <tr>
              <th className="p-1.5 border-r border-slate-300 w-[24%]">Regime Tributário</th>
              <th className="p-1.5 border-r border-slate-300 text-right w-[13%]">Guia DAS / IRPJ</th>
              <th className="p-1.5 border-r border-slate-300 text-right w-[13%]">IBS + CBS Líq.</th>
              <th className="p-1.5 border-r border-slate-300 text-right w-[11%]">INSS Folha</th>
              <th className="p-1.5 border-r border-slate-300 text-right w-[13%]">Total Imposto/mês</th>
              <th className="p-1.5 border-r border-slate-300 text-right w-[9%]">Alíq. Efet.</th>
              <th className="p-1.5 text-right w-[17%]">Margem Líquida</th>
            </tr>
          </thead>
          <tbody>
            {(Object.values(results) as RegimeResult[]).map((r) => {
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

      {/* 6. COMPARATIVO ANTES X DEPOIS DA REFORMA TRIBUTÁRIA */}
      <div className="mb-4 print-avoid-break">
        <h3 className="font-black text-[11px] text-slate-800 uppercase tracking-wide mb-1.5 border-b border-slate-200 pb-0.5">
          4. Comparativo Antes x Depois da Reforma Tributária (Sistema Atual vs 2027)
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
                R$ {preReform.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                R$ {preReform.totalAnnualTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                {preReform.effectiveRatePct.toFixed(2)}%
              </td>
              <td className="p-1.5 text-right font-mono">
                {preReform.b2bCreditTransferPct.toFixed(2)}%
              </td>
            </tr>
            <tr className="bg-indigo-50/70 font-bold text-indigo-950 border-b border-slate-200">
              <td className="p-1.5 border-r border-slate-300">
                Reforma 2027 ({bestResult.name})
              </td>
              <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                R$ {postReform.totalMonthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                R$ {postReform.totalAnnualTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                {postReform.effectiveRatePct.toFixed(2)}%
              </td>
              <td className="p-1.5 text-right font-mono text-emerald-800">
                {postReform.b2bCreditTransferPct.toFixed(2)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 7. SUBSTITUIÇÃO DOS TRIBUTOS EXTINTOS E NOVOS */}
      <div className="mb-4 print-avoid-break">
        <h3 className="font-black text-[11px] text-slate-800 uppercase tracking-wide mb-1.5 border-b border-slate-200 pb-0.5">
          5. Detalhamento da Transição dos Tributos Extintos e Novos
        </h3>
        <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
          <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
            <tr>
              <th className="p-1.5 border-r border-slate-300 w-[25%]">Tributo Anterior</th>
              <th className="p-1.5 border-r border-slate-300 w-[30%]">Novo Tributo (LC 214/2025)</th>
              <th className="p-1.5 border-r border-slate-300 text-right w-[15%]">Valor Anterior</th>
              <th className="p-1.5 border-r border-slate-300 text-right w-[15%]">Valor Projetado</th>
              <th className="p-1.5 text-right w-[15%]">Variação Líquida</th>
            </tr>
          </thead>
          <tbody>
            {substitutionRows.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="p-1.5 border-r border-slate-300 font-semibold text-slate-700">
                  {row.oldTaxName}
                </td>
                <td className="p-1.5 border-r border-slate-300 text-slate-900 font-medium">
                  {row.newTaxName}
                </td>
                <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                  R$ {row.preReformAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold">
                  R$ {row.postReformAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className={`p-1.5 text-right font-mono font-bold ${row.difference > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {row.difference > 0 ? '+' : ''}R$ {row.difference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 8. ANÁLISE DE IMPACTO COMERCIAL B2B E RECOMENDAÇÕES PRÁTICAS */}
      <div className="border border-slate-200 bg-slate-50/70 p-3 rounded-lg mb-4 print-avoid-break space-y-2">
        <h3 className="font-black text-[11px] text-slate-900 uppercase tracking-wide">
          6. Recomendações Práticas para a Decisão do Empreendedor
        </h3>
        <div className="grid grid-cols-2 gap-3 text-[10px] leading-relaxed">
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-bold text-indigo-900 block">1. Atenção à Carteira de Clientes PJ:</span>
            <p className="text-slate-600">
              Se sua empresa vende para outras empresas (PJ), seus clientes exigirão notas fiscais com crédito de IBS e CBS. No Simples Híbrido, eles recebem 100% de crédito, evitando exigências de descontos no preço.
            </p>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-bold text-indigo-900 block">2. Segregação Correta no PGDAS-D:</span>
            <p className="text-slate-600">
              Mantenha a segregação de produtos monofásicos (farmácias, autopeças, bebidas) e ICMS-ST para não pagar impostos em duplicidade na guia do DAS.
            </p>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-bold text-indigo-900 block">3. Gestão das Compras com Nota Fiscal:</span>
            <p className="text-slate-600">
              No regime não-cumulativo (Híbrido, Real ou Presumido), todas as compras de mercadorias, insumos e utilidades com nota fiscal idônea geram créditos para abater diretamente o imposto a pagar.
            </p>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <span className="font-bold text-indigo-900 block">4. Planejamento com seu Contador:</span>
            <p className="text-slate-600">
              A opção de recolhimento de IBS/CBS por fora do Simples deve ser manifestada anualmente perante a Receita Federal e os Estados. Revise os números com seu profissional contábil.
            </p>
          </div>
        </div>
      </div>

      {/* 9. TERMO DE RESPONSABILIDADE E ASSINATURAS */}
      <div className="border-t border-slate-300 pt-3 text-[9px] text-slate-500 space-y-3 print-avoid-break">
        <p className="leading-tight">
          * Este relatório foi elaborado com base nos parâmetros inseridos e na legislação tributária (Lei Complementar nº 214/2025, Emenda Constitucional nº 132/2023, Lei Complementar nº 123/2006 e Regulamento do Simples Nacional). Documento destinado à orientação estratégica.
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
              Responsável Técnico Contábil / Tributário
            </span>
            <span className="text-[9px] text-slate-500">CRC / Consultoria Tributária</span>
          </div>
        </div>
      </div>
    </div>
  );
};
