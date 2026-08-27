import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  Percent,
  TrendingDown,
  Sliders,
  DollarSign,
  Scale,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { CompanyInput, SimulationSummary } from '../types/tax';

interface B2BImpactAnalysisProps {
  summary: SimulationSummary;
  onChangeInput: (updated: Partial<CompanyInput>) => void;
}

export const B2BImpactAnalysis: React.FC<B2BImpactAnalysisProps> = ({ summary, onChangeInput }) => {
  const { input, results } = summary;
  const [sampleInvoice, setSampleInvoice] = useState<number>(1000);

  const b2bMonthlyRevenue = (input.monthlyRevenue * input.b2bPercentage) / 100;
  const b2cMonthlyRevenue = input.monthlyRevenue - b2bMonthlyRevenue;

  const simplificado = results.simples_simplificado;
  const hibrido = results.simples_hibrido;

  // Alíquota plena de IBS/CBS vigente ou configurada
  const fullIbsCbsRate = input.useCustomIbsCbsRate
    ? input.customCbsRatePct + input.customIbsRatePct
    : input.simulationYear === 2027
    ? input.cbsRate2027 + input.ibsRate2027
    : input.fullCbsIbsRate || 26.5;

  const fullRateDecimal = fullIbsCbsRate / 100;

  // Alíquota de crédito transferida aos clientes no Simples Simplificado
  const simplesCreditRateDecimal = simplificado.ibsCbs.creditTransferRate || 0.0489;
  const simplesCreditRatePct = simplesCreditRateDecimal * 100;

  // 1. Diferencial / Gap nominal de crédito
  const creditGapPct = Math.max(0, fullIbsCbsRate - simplesCreditRatePct);

  // 2. Percentual Matemático Necessário de Desconto no Preço Bruto de Venda para Equiparação ao Custo Líquido do Cliente PJ
  // Fórmula: Desconto = (t_full - t_simples) / (1 - t_simples)
  const requiredDiscountPct =
    1 - simplesCreditRateDecimal > 0
      ? Math.max(0, ((fullRateDecimal - simplesCreditRateDecimal) / (1 - simplesCreditRateDecimal)) * 100)
      : 0;

  // Simulação de Pedido / Fatura Unitária
  const sampleVal = sampleInvoice > 0 ? sampleInvoice : 1000;

  // Cenário Regular / Híbrido
  const sampleRegularCredit = sampleVal * fullRateDecimal;
  const sampleRegularNetCost = sampleVal * (1 - fullRateDecimal);

  // Cenário Simplificado sem desconto
  const sampleSimplesCredit = sampleVal * simplesCreditRateDecimal;
  const sampleSimplesNetCost = sampleVal * (1 - simplesCreditRateDecimal);
  const sampleSimplesOvercost = sampleSimplesNetCost - sampleRegularNetCost;
  const sampleSimplesOvercostPct = sampleRegularNetCost > 0 ? (sampleSimplesOvercost / sampleRegularNetCost) * 100 : 0;

  // Cenário Simplificado com desconto de equiparação
  const sampleDiscountAmount = sampleVal * (requiredDiscountPct / 100);
  const sampleDiscountedPrice = sampleVal - sampleDiscountAmount;
  const sampleDiscountedCredit = sampleDiscountedPrice * simplesCreditRateDecimal;
  const sampleDiscountedNetCost = sampleDiscountedPrice - sampleDiscountedCredit;

  // Impacto financeiro consolidado na carteira B2B da empresa
  const monthlyB2BDiscountTotal = b2bMonthlyRevenue * (requiredDiscountPct / 100);
  const annualB2BDiscountTotal = monthlyB2BDiscountTotal * 12;

  return (
    <div className="space-y-6">
      {/* 1. HEADER & EXPLANATION */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-50 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-7 bg-indigo-600 rounded-full inline-block"></span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Análise de Competitividade Comercial B2B (Cadeia de Suprimentos)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Avalie o gap de créditos fiscais e o percentual de desconto necessário para manter suas vendas a clientes PJ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl shrink-0">
            <Percent className="w-4 h-4 text-indigo-600" />
            <div className="text-right">
              <span className="text-[10px] font-bold text-indigo-700 block uppercase tracking-wider">
                Alíquota IBS/CBS Plena
              </span>
              <span className="text-xs font-black text-indigo-950 font-mono">
                {fullIbsCbsRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          No novo modelo tributário (IBS + CBS), empresas do <strong>Regime Regular (Lucro Real ou Presumido)</strong> buscam fornecedores que emitam notas fiscais com <strong>100% de crédito tributário ({fullIbsCbsRate.toFixed(2)}%)</strong>. Se a sua empresa optar pelo <strong>Simples Simplificado</strong>, seu cliente receberá apenas <strong>{simplesCreditRatePct.toFixed(2)}%</strong> de crédito (proporcional à guia do DAS), tornando a compra <strong>financeiramente mais cara</strong> para ele a menos que você conceda um desconto.
        </p>

        {/* 2. PAINEL DE CONTROLE DE AJUSTE B2B */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/40 border border-indigo-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950">
                Controle de Ajuste da Carteira de Clientes (B2B vs B2C)
              </h3>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-full border border-indigo-200 shadow-2xs">
              {input.b2bPercentage}% Vendas B2B | {100 - input.b2bPercentage}% Vendas B2C
            </span>
          </div>

          {/* Slider Principal B2B */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>0% (Só Consumidor Final B2C)</span>
              <span className="text-indigo-600 font-mono text-sm">{input.b2bPercentage}% B2B</span>
              <span>100% (Só Empresas PJ B2B)</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={input.b2bPercentage}
              onChange={(e) => onChangeInput({ b2bPercentage: Number(e.target.value) })}
              className="w-full accent-indigo-600 h-2.5 bg-slate-200 rounded-lg cursor-pointer transition-all"
            />

            {/* Quick preset buttons */}
            <div className="flex flex-wrap items-center justify-between gap-1 pt-1">
              <span className="text-[11px] font-bold text-slate-500">Atalhos rápidos:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '0% (100% B2C)', val: 0 },
                  { label: '25% B2B', val: 25 },
                  { label: '40% B2B', val: 40 },
                  { label: '50% Misto', val: 50 },
                  { label: '70% B2B', val: 70 },
                  { label: '100% (Só PJ)', val: 100 },
                ].map((btn) => (
                  <button
                    key={btn.val}
                    type="button"
                    onClick={() => onChangeInput({ b2bPercentage: btn.val })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      input.b2bPercentage === btn.val
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards de Divisão de Receita */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-2xs flex justify-between items-center">
              <div>
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                  🏢 Segmento B2B (Clientes Empresas)
                </span>
                <span className="text-base font-black text-slate-900 font-mono">
                  R$ {b2bMonthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                </span>
                <span className="text-[10px] text-slate-500 block">Sensíveis a créditos fiscais de IBS e CBS</span>
              </div>
              <span className="text-lg font-black text-indigo-600 font-mono bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                {input.b2bPercentage}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs flex justify-between items-center">
              <div>
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                  🛒 Segmento B2C (Consumidores Finais)
                </span>
                <span className="text-base font-black text-slate-900 font-mono">
                  R$ {b2cMonthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                </span>
                <span className="text-[10px] text-slate-500 block">Pessoas físicas não tomam créditos</span>
              </div>
              <span className="text-lg font-black text-emerald-600 font-mono bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                {100 - input.b2bPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CARD DESTAQUE: PERCENTUAL NECESSÁRIO DE DESCONTO PARA EQUIPARAÇÃO COMERCIAL */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-amber-50 text-xs font-black uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              Neutralidade de Preço para Clientes PJ
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Desconto Necessário no Simples Simplificado:
            </h3>
            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed font-medium">
              Percentual que a sua empresa precisa conceder de desconto no preço bruto para que o <strong>custo de aquisição líquido do seu cliente PJ</strong> seja exatamente idêntico ao de comprar de um concorrente no regime regular.
            </p>
          </div>

          {/* Big Discount Metric Badge */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 text-slate-900 shadow-xl shrink-0 flex flex-col items-center justify-center text-center border-4 border-amber-300/40">
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
              Desconto Necessário de Venda
            </span>
            <span className="text-3xl sm:text-4xl font-black text-amber-600 font-mono my-0.5">
              {requiredDiscountPct.toFixed(2)}%
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              Gap de crédito: -{creditGapPct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Math explanation banner */}
        <div className="bg-black/20 backdrop-blur-xs p-3.5 rounded-xl text-xs text-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border border-white/10 font-mono">
          <span>
            <strong>Fórmula de Neutralidade:</strong> Desconto = (Alíquota Plena {fullIbsCbsRate.toFixed(2)}% − Crédito DAS {simplesCreditRatePct.toFixed(2)}%) ÷ (1 − {simplesCreditRateDecimal.toFixed(4)})
          </span>
          <span className="bg-white/20 px-2.5 py-0.5 rounded text-[11px] font-bold text-white whitespace-nowrap">
            = {requiredDiscountPct.toFixed(2)}% no preço
          </span>
        </div>

        {/* BOTÃO DE AÇÃO: CALCULAR COM A MARGEM DE DESCONTO DE COMPENSAÇÃO */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
              <div>
                <span className="text-xs font-black text-white uppercase tracking-wider block">
                  Aplicar Margem de Compensação na Apuração Geral
                </span>
                <span className="text-[11px] text-amber-100 font-medium">
                  Selecione o percentual de desconto comercial a ser incorporado nas apurações e memórias de cálculo:
                </span>
              </div>
            </div>

            <span className="bg-white text-amber-800 font-black text-xs px-3 py-1 rounded-lg shadow-xs font-mono self-start sm:self-auto">
              Margem Ativa: {input.b2bDisputeDiscountPct}%
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              id="b2b-analysis-calc-100"
              onClick={() => onChangeInput({ b2bDisputeDiscountPct: 100, considerB2BCompetitiveFactor: true })}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                input.b2bDisputeDiscountPct === 100
                  ? 'bg-white text-amber-900 shadow-md ring-2 ring-amber-200'
                  : 'bg-black/20 hover:bg-black/30 text-white border border-white/20'
              }`}
            >
              <span>100% de Compensação</span>
              <span className="text-[10px] font-normal opacity-80">(Total)</span>
            </button>

            <button
              type="button"
              id="b2b-analysis-calc-50"
              onClick={() => onChangeInput({ b2bDisputeDiscountPct: 50, considerB2BCompetitiveFactor: true })}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                input.b2bDisputeDiscountPct === 50
                  ? 'bg-white text-amber-900 shadow-md ring-2 ring-amber-200'
                  : 'bg-black/20 hover:bg-black/30 text-white border border-white/20'
              }`}
            >
              <span>50% de Compensação</span>
              <span className="text-[10px] font-normal opacity-80">(50/50)</span>
            </button>

            <button
              type="button"
              id="b2b-analysis-calc-25"
              onClick={() => onChangeInput({ b2bDisputeDiscountPct: 25, considerB2BCompetitiveFactor: true })}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                input.b2bDisputeDiscountPct === 25
                  ? 'bg-white text-amber-900 shadow-md ring-2 ring-amber-200'
                  : 'bg-black/20 hover:bg-black/30 text-white border border-white/20'
              }`}
            >
              <span>25% de Compensação</span>
            </button>

            <button
              type="button"
              id="b2b-analysis-calc-0"
              onClick={() => onChangeInput({ b2bDisputeDiscountPct: 0 })}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                input.b2bDisputeDiscountPct === 0
                  ? 'bg-white text-amber-900 shadow-md ring-2 ring-amber-200'
                  : 'bg-black/20 hover:bg-black/30 text-white border border-white/20'
              }`}
            >
              <span>0% (Sem Desconto)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. SIMULADOR INTERATIVO DE PREÇO DE VENDA UNITÁRIO & COMPARAÇÃO DAS NOTAS FISCAIS */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-50 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              Simulador de Preço de Venda da Nota Fiscal para Cliente PJ
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Veja na prática a formação do custo de compra do cliente em cada cenário tributário.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Valor da Nota / Pedido:
            </label>
            <div className="relative w-36 sm:w-44">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                R$
              </span>
              <input
                type="number"
                min="10"
                step="100"
                value={sampleInvoice}
                onChange={(e) => setSampleInvoice(Math.max(1, Number(e.target.value) || 0))}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3 Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CENÁRIO A: REGIME REGULAR OU SIMPLES HÍBRIDO */}
          <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 space-y-3 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                  Cenário 1
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900">
                Regime Regular ou Simples Híbrido
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Transfere 100% de crédito de IBS/CBS ({fullIbsCbsRate.toFixed(2)}%) na nota.
              </p>
            </div>

            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-emerald-200 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Preço na Nota:</span>
                <span className="font-bold text-slate-900">R$ {sampleVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Crédito do Cliente ({fullIbsCbsRate.toFixed(2)}%):</span>
                <span>- R$ {sampleRegularCredit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between text-slate-900 font-black text-sm bg-emerald-50/80 -mx-1 px-1 rounded">
                <span>Custo Líquido PJ:</span>
                <span className="text-emerald-700">R$ {sampleRegularNetCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              100% de competitividade comercial.
            </div>
          </div>

          {/* CENÁRIO B: SIMPLES SIMPLIFICADO SEM DESCONTO */}
          <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/40 space-y-3 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-600 text-white uppercase tracking-wider">
                  Cenário 2
                </span>
                <AlertOctagon className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900">
                Simples Simplificado (Sem Desconto)
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Preço normal com crédito restrito da guia DAS ({simplesCreditRatePct.toFixed(2)}%).
              </p>
            </div>

            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-amber-200 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Preço na Nota:</span>
                <span className="font-bold text-slate-900">R$ {sampleVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-amber-700 font-bold">
                <span>Crédito do Cliente ({simplesCreditRatePct.toFixed(2)}%):</span>
                <span>- R$ {sampleSimplesCredit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between text-slate-900 font-black text-sm bg-amber-100/70 -mx-1 px-1 rounded">
                <span>Custo Líquido PJ:</span>
                <span className="text-amber-800">R$ {sampleSimplesNetCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="text-[11px] text-amber-800 font-bold space-y-0.5">
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                <span>+R$ {sampleSimplesOvercost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} mais caro (+{sampleSimplesOvercostPct.toFixed(1)}%)</span>
              </div>
              <span className="text-[10px] text-slate-500 block font-normal">
                Risco iminente de substituição por outro fornecedor.
              </span>
            </div>
          </div>

          {/* CENÁRIO C: SIMPLES SIMPLIFICADO COM DESCONTO DE EQUIPARAÇÃO */}
          <div className="p-5 rounded-2xl border-2 border-indigo-500 bg-indigo-50/40 space-y-3 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-600 text-white uppercase tracking-wider">
                  Cenário 3
                </span>
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900">
                Simples Simplificado c/ Desconto ({requiredDiscountPct.toFixed(1)}%)
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Desconto concedido para neutralizar o custo do comprador.
              </p>
            </div>

            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-indigo-200 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Preço c/ Desconto:</span>
                <span className="font-bold text-indigo-900">R$ {sampleDiscountedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-indigo-700 font-bold">
                <span>Crédito na DAS ({simplesCreditRatePct.toFixed(2)}%):</span>
                <span>- R$ {sampleDiscountedCredit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between text-slate-900 font-black text-sm bg-indigo-100/70 -mx-1 px-1 rounded">
                <span>Custo Líquido PJ:</span>
                <span className="text-indigo-950">R$ {sampleDiscountedNetCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="text-[11px] text-indigo-950 font-bold space-y-0.5">
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Custo do cliente equiparado ao Regime Regular!
              </span>
              <span className="text-[10px] text-red-600 font-medium block">
                Sua empresa abre mão de R$ {sampleDiscountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} da receita.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. IMPACTO FINANCEIRO CONSOLIDADO NA CARTEIRA B2B MENSAL & ANUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CENÁRIO 1: SIMPLES SIMPLIFICADO */}
        <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
                Opção 1: Simples Simplificado
              </span>
              <AlertOctagon className="w-5 h-5 text-amber-600" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-2">
              Crédito Restrito para Clientes PJ ({simplesCreditRatePct.toFixed(2)}%)
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
              Seus clientes B2B recebem apenas o crédito proporcional aos tributos pagos na guia do DAS (apenas ~{simplesCreditRatePct.toFixed(2)}%), gerando perda de crédito e risco de perda de clientes corporativos.
            </p>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Faturamento B2B Total:</span>
                <span className="font-bold text-slate-900">
                  R$ {b2bMonthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Crédito gerado p/ clientes B2B:</span>
                <span className="font-bold text-slate-800">
                  R$ {simplificado.ibsCbs.creditTransferredToB2B.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                </span>
              </div>
              <div className="flex justify-between text-amber-700 font-bold">
                <span>Perda de crédito sofrida pelos clientes:</span>
                <span>
                  R$ {simplificado.b2bCreditLossForClient.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-red-600 font-black">
                <span>Desconto total p/ manter carteira:</span>
                <span>
                  - R$ {monthlyB2BDiscountTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-600 font-medium">
              ⚠️ <strong>Custo de Equiparação:</strong> Para não perder vendas na carteira B2B sem migrar de regime, a empresa teria que absorver <strong>R$ {annualB2BDiscountTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / ano</strong> em descontos concedidos.
            </p>
          </div>
        </div>

        {/* CENÁRIO 2: SIMPLES HÍBRIDO */}
        <div className="bg-white rounded-2xl border-2 border-indigo-600 p-6 shadow-md flex flex-col justify-between space-y-4 ring-4 ring-indigo-100">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500 text-white uppercase tracking-wider">
                Opção 2: Simples Híbrido
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-2">
              100% de Crédito Integral aos Clientes PJ ({fullIbsCbsRate.toFixed(2)}%)
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
              Como o IBS e a CBS são apurados por fora no regime não-cumulativo, seu cliente se credita do valor total da nota fiscal, sem exigir descontos comerciais!
            </p>

            <div className="space-y-3 bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-xs font-mono">
              <div className="flex justify-between text-slate-700">
                <span>Faturamento B2B Total:</span>
                <span className="font-bold text-slate-900">
                  R$ {b2bMonthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Crédito gerado p/ clientes B2B:</span>
                <span className="font-bold text-indigo-700">
                  R$ {hibrido.ibsCbs.creditTransferredToB2B.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-black">
                <span>Perda de crédito para clientes:</span>
                <span>R$ 0,00 (Zero Perda)</span>
              </div>
              <div className="border-t border-indigo-200 pt-2 flex justify-between text-emerald-800 font-black">
                <span>Desconto comercial necessário:</span>
                <span>R$ 0,00 (Preço Cheio)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-indigo-100">
            <p className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Sua empresa mantém 100% da competitividade na cadeia B2B sem abrir mão da sua margem de lucro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
