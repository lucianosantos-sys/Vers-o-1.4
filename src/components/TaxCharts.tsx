import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SimulationSummary } from '../types/tax';

interface TaxChartsProps {
  summary: SimulationSummary;
}

export const TaxCharts: React.FC<TaxChartsProps> = ({ summary }) => {
  const { results, input } = summary;

  const comparisonData = [
    {
      name: 'Simples Simplificado',
      shortName: 'Simplificado',
      totalAnual: results.simples_simplificado.totalAnnualTax,
      aliquotaEfetiva: Number(results.simples_simplificado.effectiveRatePct.toFixed(2)),
      das: results.simples_simplificado.das.totalDas * 12,
      ibsCbs: results.simples_simplificado.ibsCbs.netPayable * 12,
      folha: results.simples_simplificado.payrollCharges.totalPayrollTaxes * 12,
      lucroLiquido: results.simples_simplificado.estimatedNetProfitAnnual,
      margemSemImpostos: Number(results.simples_simplificado.profitMarginBeforeTaxesPct.toFixed(1)),
      margemComImpostos: Number(results.simples_simplificado.profitMarginAfterTaxesPct.toFixed(1)),
    },
    {
      name: 'Simples Híbrido',
      shortName: 'Híbrido',
      totalAnual: results.simples_hibrido.totalAnnualTax,
      aliquotaEfetiva: Number(results.simples_hibrido.effectiveRatePct.toFixed(2)),
      das: results.simples_hibrido.das.totalDas * 12,
      ibsCbs: results.simples_hibrido.ibsCbs.netPayable * 12,
      folha: results.simples_hibrido.payrollCharges.totalPayrollTaxes * 12,
      lucroLiquido: results.simples_hibrido.estimatedNetProfitAnnual,
      margemSemImpostos: Number(results.simples_hibrido.profitMarginBeforeTaxesPct.toFixed(1)),
      margemComImpostos: Number(results.simples_hibrido.profitMarginAfterTaxesPct.toFixed(1)),
    },
    {
      name: 'Lucro Presumido',
      shortName: 'Presumido',
      totalAnual: results.lucro_presumido.totalAnnualTax,
      aliquotaEfetiva: Number(results.lucro_presumido.effectiveRatePct.toFixed(2)),
      das: results.lucro_presumido.das.totalDas * 12,
      ibsCbs: results.lucro_presumido.ibsCbs.netPayable * 12,
      folha: results.lucro_presumido.payrollCharges.totalPayrollTaxes * 12,
      lucroLiquido: results.lucro_presumido.estimatedNetProfitAnnual,
      margemSemImpostos: Number(results.lucro_presumido.profitMarginBeforeTaxesPct.toFixed(1)),
      margemComImpostos: Number(results.lucro_presumido.profitMarginAfterTaxesPct.toFixed(1)),
    },
    {
      name: 'Lucro Real',
      shortName: 'Real',
      totalAnual: results.lucro_real.totalAnnualTax,
      aliquotaEfetiva: Number(results.lucro_real.effectiveRatePct.toFixed(2)),
      das: results.lucro_real.das.totalDas * 12,
      ibsCbs: results.lucro_real.ibsCbs.netPayable * 12,
      folha: results.lucro_real.payrollCharges.totalPayrollTaxes * 12,
      lucroLiquido: results.lucro_real.estimatedNetProfitAnnual,
      margemSemImpostos: Number(results.lucro_real.profitMarginBeforeTaxesPct.toFixed(1)),
      margemComImpostos: Number(results.lucro_real.profitMarginAfterTaxesPct.toFixed(1)),
    },
  ];

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* 1. Bar Chart: Total Annual Tax */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Comparativo de Carga Tributária Anual Total (R$)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Total recolhido aos cofres públicos em cada regime tributário no ano.
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="shortName" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
              <YAxis
                tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), 'Imposto Anual']}
                labelStyle={{ fontWeight: 'bold', color: '#1e1b4b' }}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e0e7ff' }}
              />
              <Bar dataKey="totalAnual" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Stacked Bar Chart: Tax Composition Breakdown */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Composição da Carga Tributária por Categoria (Anual)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Separação entre Guia DAS / Guia IRPJ/CSLL, IBS/CBS Líquido e Encargos de Folha (INSS).
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="shortName" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
              <YAxis
                tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatCurrency(Number(value)),
                  name === 'das'
                    ? 'Guia DAS / Guia IRPJ/CSLL'
                    : name === 'ibsCbs'
                    ? 'IBS + CBS Líquido'
                    : 'Encargos Folha (INSS)',
                ]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e0e7ff' }}
              />
              <Legend
                formatter={(val) =>
                  val === 'das'
                    ? 'Guia DAS / Guia IRPJ/CSLL'
                    : val === 'ibsCbs'
                    ? 'IBS + CBS Líquido'
                    : 'Encargos de Folha'
                }
              />
              <Bar dataKey="das" stackId="a" fill="#4f46e5" />
              <Bar dataKey="ibsCbs" stackId="a" fill="#10b981" />
              <Bar dataKey="folha" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Bar Chart: Margens de Lucro (Sem Impostos vs Com Impostos) */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Comparativo de Margem de Lucro (% sobre Faturamento)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Comparativo entre a Margem Operacional sem considerar impostos e a Margem Líquida considerando todos os impostos.
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="shortName" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${Number(value).toFixed(1)}%`,
                  name === 'margemSemImpostos'
                    ? 'Margem sem considerar impostos'
                    : 'Margem considerando impostos',
                ]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e0e7ff' }}
              />
              <Legend
                formatter={(val) =>
                  val === 'margemSemImpostos'
                    ? 'Margem de Lucro sem impostos (%)'
                    : 'Margem de Lucro considerando impostos (%)'
                }
              />
              <Bar dataKey="margemSemImpostos" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="margemComImpostos" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
