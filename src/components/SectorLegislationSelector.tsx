import React, { useState } from 'react';
import {
  Pill,
  Car,
  Beer,
  Fuel,
  Sparkles,
  Store,
  Factory,
  HardHat,
  BookOpen,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { BusinessSegment, CompanyInput, SimulationSummary } from '../types/tax';
import { LEGISLATION_DATABASE } from '../data/legislationDatabase';

interface SectorLegislationSelectorProps {
  input: CompanyInput;
  summary: SimulationSummary;
  onChange: (updated: Partial<CompanyInput>) => void;
}

export const SectorLegislationSelector: React.FC<SectorLegislationSelectorProps> = ({
  input,
  summary,
  onChange,
}) => {
  const [showLawDetails, setShowLawDetails] = useState<boolean>(false);
  const [selectedLawFilter, setSelectedLawFilter] = useState<string>('all');

  const sectors: {
    id: BusinessSegment;
    label: string;
    sub: string;
    icon: React.ReactNode;
    defaultMonofasico: number;
    defaultIcmsSt: number;
    badge: string;
    lawsSummary: string;
    defaultAnexo?: string;
  }[] = [
    {
      id: 'farmacia',
      label: 'Farmácias & Drogarias',
      sub: 'Medicamentos, cosméticos, perfumaria e correlatos.',
      icon: <Pill className="w-6 h-6 text-indigo-600" />,
      defaultMonofasico: 75,
      defaultIcmsSt: 80,
      badge: 'Lei 10.147/00 + Conv. 142/18',
      lawsSummary: 'PIS/COFINS Monofásico + ICMS-ST + Redução 60% CBS/IBS (EC 132/23)',
    },
    {
      id: 'autopecas',
      label: 'Autopeças & Acessórios',
      sub: 'Peças automotivas, pneumáticos, câmaras e baterias.',
      icon: <Car className="w-6 h-6 text-indigo-600" />,
      defaultMonofasico: 70,
      defaultIcmsSt: 75,
      badge: 'Lei 10.485/02 + Conv. 142/18',
      lawsSummary: 'PIS/COFINS Monofásico na revenda + ICMS-ST estadual',
    },
    {
      id: 'bebidas',
      label: 'Distribuidoras de Bebidas',
      sub: 'Cervejas, chopes, refrigerantes, energéticos e águas.',
      icon: <Beer className="w-6 h-6 text-indigo-600" />,
      defaultMonofasico: 85,
      defaultIcmsSt: 90,
      badge: 'Lei 13.097/15 + Conv. 142/18',
      lawsSummary: 'Bebidas Frias Monofásicas + ICMS-ST + Imposto Seletivo 2027',
    },
    {
      id: 'combustiveis',
      label: 'Postos & Combustíveis',
      sub: 'Gasolina, etanol, diesel, lubrificantes e GLP.',
      icon: <Fuel className="w-6 h-6 text-indigo-600" />,
      defaultMonofasico: 95,
      defaultIcmsSt: 100,
      badge: 'Lei 9.718/98 + LC 192/22',
      lawsSummary: 'Monofasia integral de PIS/COFINS e ICMS ad rem',
    },
    {
      id: 'cosmeticos',
      label: 'Perfumaria & Cosméticos',
      sub: 'Produtos de beleza, maquiagens e higiene pessoal.',
      icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
      defaultMonofasico: 65,
      defaultIcmsSt: 70,
      badge: 'Lei 10.147/00 + Conv. 142/18',
      lawsSummary: 'Monofásico de cosméticos + Substituição Tributária',
    },
    {
      id: 'industria',
      label: 'Indústria & Manufatura',
      sub: 'Fábricas, confecções, alimentos, metalurgia e transformação.',
      icon: <Factory className="w-6 h-6 text-indigo-600" />,
      defaultMonofasico: 10,
      defaultIcmsSt: 25,
      badge: 'Anexo II + Lei 9.249/95 + IPI',
      lawsSummary: 'Presunção IRPJ 8% / CSLL 12% + Crédito pleno de bens de capital',
      defaultAnexo: 'anexo_2',
    },
    {
      id: 'material_construcao',
      label: 'Materiais de Construção',
      sub: 'Tintas, cimento, fios, tubos, cerâmica, louças e ferragens.',
      icon: <HardHat className="w-6 h-6 text-indigo-600" />,
      defaultMonofasico: 15,
      defaultIcmsSt: 65,
      badge: 'Conv. 142/18 Anexo XI + EC 132/23',
      lawsSummary: 'ICMS-ST expressivo no DAS + Regime específico na Reforma',
      defaultAnexo: 'anexo_1',
    },
    {
      id: 'geral',
      label: 'Comércio Geral / Outros',
      sub: 'Vestuário, alimentos gerais, eletrônicos e serviços.',
      icon: <Store className="w-6 h-6 text-indigo-600" />,
      defaultMonofasico: 0,
      defaultIcmsSt: 0,
      badge: 'Regra Geral',
      lawsSummary: 'Tributação padrão sobre mercadorias sem monofasia/ST',
    },
  ];

  const handleSelectSector = (sec: (typeof sectors)[0]) => {
    let targetAnexo = input.anexo;
    if (sec.id === 'industria') {
      targetAnexo = 'anexo_2';
    } else if (sec.id === 'material_construcao') {
      targetAnexo = input.anexo === 'anexo_4' ? 'anexo_4' : 'anexo_1';
    } else if (sec.id !== 'geral') {
      targetAnexo = 'anexo_1';
    }

    onChange({
      businessSegment: sec.id,
      anexo: targetAnexo,
      monofasicoPisCofinsPercentage: sec.defaultMonofasico,
      icmsStPercentage: sec.defaultIcmsSt,
      isSelectiveTaxApplicable: sec.id === 'bebidas',
      healthDiscountRatePct: sec.id === 'farmacia' ? 60 : 0,
    });
  };

  const { sectorSavingsHighlight, results } = summary;
  const currentSegregation = results.simples_simplificado.segregationSavings;

  const relevantLaws = LEGISLATION_DATABASE.filter(
    (l) => input.businessSegment === 'geral' || l.sectors.includes(input.businessSegment) || l.sectors.includes('geral')
  );

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-50 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              Legislação Setorial Especializada (Monofásico, ICMS-ST & Reforma 2027)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Avaliação de impacto tributário para Farmácias, Autopeças, Bebidas, Combustíveis e Cosméticos.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowLawDetails(!showLawDetails)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          {showLawDetails ? 'Ocultar Fundamentação Legal' : 'Ver Base Legal & Artigos'}
          {showLawDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* SECTOR CARDS GRID */}
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
          Selecione o Segmento de Atuação da Empresa:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sectors.map((sec) => {
            const isSelected = input.businessSegment === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleSelectSector(sec)}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 ring-4 ring-indigo-100 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
                      {sec.icon}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {sec.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-1">{sec.label}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{sec.sub}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-indigo-50 text-[11px] font-bold text-indigo-700">
                  {sec.lawsSummary}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEGREGAÇÃO REAL-TIME IMPACT BANNER */}
      {input.monofasicoPisCofinsPercentage > 0 || input.icmsStPercentage > 0 ? (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-800/40">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Economia por Segregação Legal (LC 123/2006 Art. 18 § 4º-A)
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Dedução Garantida de R$ {currentSegregation.totalAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ano no DAS
              </h3>
              <p className="text-xs text-emerald-200/90 font-medium max-w-2xl leading-relaxed">
                Ao preencher a segregação no PGDAS-D, sua empresa não recolhe PIS/COFINS e ICMS que já foram pagos de forma concentrada na fábrica.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[280px]">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">PIS/COFINS Monofásico</span>
                <span className="text-sm font-black text-emerald-400">
                  - R$ {currentSegregation.monofasicoPisCofinsMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">ICMS-ST Retido</span>
                <span className="text-sm font-black text-emerald-400">
                  - R$ {currentSegregation.icmsStMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Nenhuma segregação aplicada. Selecione um segmento especializado acima ou ajuste os percentuais de produtos monofásicos e ICMS-ST abaixo.
          </span>
        </div>
      )}

      {/* FINE-TUNING SLIDERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* 1. % Monofásico PIS/COFINS */}
        <div className="p-5 rounded-2xl border border-indigo-100 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                % Vendas Monofásicas de PIS/COFINS
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Leis 10.147/00 (Medicamentos/Cosméticos), 10.485/02 (Autopeças), 13.097/15 (Bebidas)
              </span>
            </div>
            <span className="text-lg font-black text-indigo-600">
              {input.monofasicoPisCofinsPercentage}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={input.monofasicoPisCofinsPercentage}
            onChange={(e) => onChange({ monofasicoPisCofinsPercentage: Number(e.target.value) })}
            className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>0% (Tributado)</span>
            <span className="font-bold text-indigo-700">
              R$ {((input.monthlyRevenue * input.monofasicoPisCofinsPercentage) / 100).toLocaleString('pt-BR')} / mês monofásico
            </span>
            <span>100% (Total Monofásico)</span>
          </div>
        </div>

        {/* 2. % ICMS-ST */}
        <div className="p-5 rounded-2xl border border-indigo-100 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                % Vendas com ICMS Retido por ST
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Convênio ICMS 142/2018 (ICMS antecipado por Substituição Tributária)
              </span>
            </div>
            <span className="text-lg font-black text-indigo-600">
              {input.icmsStPercentage}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={input.icmsStPercentage}
            onChange={(e) => onChange({ icmsStPercentage: Number(e.target.value) })}
            className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>0% (Tributado no DAS)</span>
            <span className="font-bold text-indigo-700">
              R$ {((input.monthlyRevenue * input.icmsStPercentage) / 100).toLocaleString('pt-BR')} / mês com ST
            </span>
            <span>100% (Total ST)</span>
          </div>
        </div>
      </div>

      {/* REFORMA 2027 SECTOR HIGHLIGHTS */}
      {input.businessSegment === 'farmacia' && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="text-xs space-y-1 font-medium">
            <span className="font-black text-indigo-950 block">
              Reforma Tributária 2027: Redução de 60% na Alíquota do IVA Dual para Medicamentos
            </span>
            <p className="text-slate-600 leading-relaxed">
              Conforme o art. 9º da Emenda Constitucional nº 132/2023 e lista da Anvisa/CAMED, produtos farmacêuticos e de saúde recebem alíquota favorecida de CBS e IBS (60% de desconto sobre a alíquota padrão ou alíquota zero para medicamentos essenciais/câncer).
            </p>
          </div>
        </div>
      )}

      {input.businessSegment === 'bebidas' && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs space-y-1 font-medium">
            <span className="font-black text-amber-950 block">
              Reforma Tributária 2027: Incidência do Imposto Seletivo (IS) sobre Bebidas
            </span>
            <p className="text-amber-800 leading-relaxed">
              O Art. 153, VIII da CF/88 (EC 132/2023) estabelece o Imposto Seletivo sobre produção e importação de bebidas alcoólicas e bebidas açucaradas, com impacto nos custos de aquisição e nas margens de revenda.
            </p>
          </div>
        </div>
      )}

      {input.businessSegment === 'industria' && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-start gap-3">
          <Factory className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div className="text-xs space-y-1 font-medium">
            <span className="font-black text-indigo-950 block">
              Setor Industrial na Reforma Tributária: Desoneração de Bens de Capital e Fim do IPI
            </span>
            <p className="text-slate-700 leading-relaxed">
              Pela EC 132/2023 e PLP 68/2024, indústrias e manufaturas passam a tomar créditos integrais e imediatos de IBS/CBS sobre maquinários (bens de capital), matérias-primas e energia elétrica. No Simples Híbrido, indústrias transferem 100% de crédito para seus clientes distribuidores e atacadistas (B2B), eliminando o desestímulo de compra.
            </p>
          </div>
        </div>
      )}

      {input.businessSegment === 'material_construcao' && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
          <HardHat className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
          <div className="text-xs space-y-1 font-medium">
            <span className="font-black text-amber-950 block">
              Materiais de Construção: Fim do ICMS-ST e Regime Específico de Construção Civil
            </span>
            <p className="text-amber-900 leading-relaxed">
              Com o Convênio ICMS 142/2018 (Anexo XI), a revenda de tintas, cimento, fios e cerâmicas possui forte incidência de ICMS-ST no DAS. Na Reforma 2027, o setor imobiliário e construtivo conta com Regime Específico (redução de 20% a 40% na alíquota do IVA Dual), e construtoras PJ exigem nota com crédito pleno de IBS/CBS nas compras de materiais.
            </p>
          </div>
        </div>
      )}

      {/* EXPANDABLE LEGAL BASIS ACCORDION */}
      {showLawDetails && (
        <div className="space-y-4 pt-4 border-t border-indigo-100 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900">
              Legislação e Fundamentação Jurídica Aplicável ao Setor
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantLaws.map((law) => (
              <div
                key={law.id}
                className="p-5 rounded-2xl border border-indigo-100 bg-white shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                    {law.lawNumber}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">{law.article}</span>
                </div>

                <h4 className="text-sm font-black text-slate-900">{law.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{law.summary}</p>

                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-[11px] text-indigo-950 font-medium space-y-1">
                  <span className="font-bold text-indigo-700 block">Como Declarar no PGDAS-D / SPED:</span>
                  <p>{law.segregationGuideline}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-[11px] text-emerald-950 font-medium space-y-1">
                  <span className="font-bold text-emerald-800 block">Impacto na Reforma Tributária 2027:</span>
                  <p>{law.reforma2027Impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
