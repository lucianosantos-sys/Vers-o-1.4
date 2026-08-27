import React, { useState } from 'react';
import {
  Store,
  Factory,
  Wrench,
  HardHat,
  Cpu,
  Layers,
  Sparkles,
  Pill,
  Car,
  Beer,
  Fuel,
  Info,
  Scale,
  Percent,
  CheckCircle2,
  TrendingUp,
  Plus,
  Trash2,
  ShieldCheck,
  Building2,
  Receipt,
  HelpCircle,
} from 'lucide-react';
import { AnexoCategoryKey, AnexoType, BusinessSegment, CompanyInput, SimulationSummary } from '../types/tax';
import { ANEXO_NAMES, ANEXO_REVENUE_CATEGORIES } from '../data/taxTables';

interface ActivitySegregationPanelProps {
  input: CompanyInput;
  summary?: SimulationSummary;
  onChange: (updated: Partial<CompanyInput>) => void;
  compact?: boolean;
}

export const ActivitySegregationPanel: React.FC<ActivitySegregationPanelProps> = ({
  input,
  summary,
  onChange,
  compact = false,
}) => {
  const [activeCategoryModal, setActiveCategoryModal] = useState<AnexoCategoryKey | null>(null);

  // Map of revenues per category
  const anexoRevs = input.anexoRevenues || {};
  
  // Calculate total monthly revenue from all categories
  const currentTotalRevenue = Object.entries(anexoRevs).reduce((acc: number, [_, val]) => acc + (Number(val) || 0), 0);

  // If map is completely empty or 0, initialize fallback from monthlyRevenue & anexo
  const effectiveTotalRevenue = currentTotalRevenue > 0 ? currentTotalRevenue : (input.monthlyRevenue || 0);

  const sectorPresets: {
    id: BusinessSegment;
    label: string;
    sub: string;
    icon: React.ReactNode;
    defaultMonofasico: number;
    defaultIcmsSt: number;
  }[] = [
    {
      id: 'farmacia',
      label: 'Farmácia / Drogaria',
      sub: 'Medicamentos & cosméticos monofásicos',
      icon: <Pill className="w-4 h-4 text-indigo-600" />,
      defaultMonofasico: 75,
      defaultIcmsSt: 80,
    },
    {
      id: 'autopecas',
      label: 'Autopeças & Acessórios',
      sub: 'Peças e pneus (Lei 10.485/02)',
      icon: <Car className="w-4 h-4 text-indigo-600" />,
      defaultMonofasico: 70,
      defaultIcmsSt: 75,
    },
    {
      id: 'bebidas',
      label: 'Distribuidora de Bebidas',
      sub: 'Bebidas frias + Imposto Seletivo',
      icon: <Beer className="w-4 h-4 text-indigo-600" />,
      defaultMonofasico: 85,
      defaultIcmsSt: 90,
    },
    {
      id: 'combustiveis',
      label: 'Posto de Combustíveis',
      sub: 'Combustíveis e lubrificantes',
      icon: <Fuel className="w-4 h-4 text-indigo-600" />,
      defaultMonofasico: 95,
      defaultIcmsSt: 100,
    },
    {
      id: 'cosmeticos',
      label: 'Perfumaria & Cosméticos',
      sub: 'Higiene e maquiagens',
      icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
      defaultMonofasico: 65,
      defaultIcmsSt: 70,
    },
    {
      id: 'industria',
      label: 'Indústria & Manufatura',
      sub: 'Fabricação com IPI (Anexo II)',
      icon: <Factory className="w-4 h-4 text-indigo-600" />,
      defaultMonofasico: 10,
      defaultIcmsSt: 25,
    },
    {
      id: 'material_construcao',
      label: 'Materiais de Construção',
      sub: 'Tintas, cimento, fios (Conv. 142/18)',
      icon: <HardHat className="w-4 h-4 text-indigo-600" />,
      defaultMonofasico: 15,
      defaultIcmsSt: 65,
    },
    {
      id: 'geral',
      label: 'Comércio Geral / Outros',
      sub: 'Revenda de mercadorias em geral',
      icon: <Store className="w-4 h-4 text-indigo-600" />,
      defaultMonofasico: 0,
      defaultIcmsSt: 0,
    },
  ];

  const handleCategoryRevenueChange = (key: AnexoCategoryKey, val: number) => {
    const safeVal = Math.max(0, val);
    const newAnexoRevenues: Record<AnexoCategoryKey, number> = {
      anexo_1: input.anexoRevenues?.anexo_1 || 0,
      anexo_2: input.anexoRevenues?.anexo_2 || 0,
      anexo_3: input.anexoRevenues?.anexo_3 || 0,
      anexo_3_sem_iss: input.anexoRevenues?.anexo_3_sem_iss || 0,
      anexo_4: input.anexoRevenues?.anexo_4 || 0,
      anexo_4_sem_iss: input.anexoRevenues?.anexo_4_sem_iss || 0,
      anexo_5: input.anexoRevenues?.anexo_5 || 0,
      [key]: safeVal,
    };

    const newTotal = Object.values(newAnexoRevenues).reduce((acc: number, v: number) => acc + (v || 0), 0);
    
    // Derive sales vs services
    const salesTotal = (newAnexoRevenues.anexo_1 || 0) + (newAnexoRevenues.anexo_2 || 0);
    const servicesTotal = (newAnexoRevenues.anexo_3 || 0) + (newAnexoRevenues.anexo_3_sem_iss || 0) +
                          (newAnexoRevenues.anexo_4 || 0) + (newAnexoRevenues.anexo_4_sem_iss || 0) +
                          (newAnexoRevenues.anexo_5 || 0);

    // Primary dominant anexo
    let dominantAnexo: AnexoType = 'anexo_1';
    let maxVal = -1;
    for (const cat of ANEXO_REVENUE_CATEGORIES) {
      const v = newAnexoRevenues[cat.key] || 0;
      if (v > maxVal) {
        maxVal = v;
        dominantAnexo = cat.anexoType;
      }
    }

    onChange({
      anexoRevenues: newAnexoRevenues,
      isRevenueSegregated: salesTotal > 0 && servicesTotal > 0,
      salesRevenueMonthly: salesTotal,
      servicesRevenueMonthly: servicesTotal,
      monthlyRevenue: newTotal > 0 ? newTotal : input.monthlyRevenue,
      rbt12: (newTotal > 0 ? newTotal : input.monthlyRevenue) * 12,
      anexo: dominantAnexo,
      salesAnexo: (newAnexoRevenues.anexo_2 || 0) > (newAnexoRevenues.anexo_1 || 0) ? 'anexo_2' : 'anexo_1',
      servicesAnexo: ((newAnexoRevenues.anexo_4 || 0) + (newAnexoRevenues.anexo_4_sem_iss || 0)) > 0 ? 'anexo_4' : ((newAnexoRevenues.anexo_5 || 0) > 0 ? 'anexo_5' : 'anexo_3'),
    });
  };

  const applyPresetDistribution = (preset: 'comercio' | 'industria' | 'servicos_iss' | 'servicos_sem_iss' | 'obras_iv' | 'ti_v' | 'misto_comercio_servico' | 'misto_industria_obras') => {
    const base = effectiveTotalRevenue > 0 ? effectiveTotalRevenue : 100000;
    let newRevs: Record<AnexoCategoryKey, number> = {
      anexo_1: 0,
      anexo_2: 0,
      anexo_3: 0,
      anexo_3_sem_iss: 0,
      anexo_4: 0,
      anexo_4_sem_iss: 0,
      anexo_5: 0,
    };
    let targetSegment = input.businessSegment;

    switch (preset) {
      case 'comercio':
        newRevs.anexo_1 = base;
        targetSegment = targetSegment === 'industria' ? 'geral' : targetSegment;
        break;
      case 'industria':
        newRevs.anexo_2 = base;
        targetSegment = 'industria';
        break;
      case 'servicos_iss':
        newRevs.anexo_3 = base;
        break;
      case 'servicos_sem_iss':
        newRevs.anexo_3_sem_iss = base;
        break;
      case 'obras_iv':
        newRevs.anexo_4 = base;
        break;
      case 'ti_v':
        newRevs.anexo_5 = base;
        break;
      case 'misto_comercio_servico':
        newRevs.anexo_1 = Math.round(base * 0.6);
        newRevs.anexo_3 = Math.round(base * 0.4);
        break;
      case 'misto_industria_obras':
        newRevs.anexo_2 = Math.round(base * 0.6);
        newRevs.anexo_4 = Math.round(base * 0.4);
        targetSegment = 'industria';
        break;
    }

    const newTotal = Object.values(newRevs).reduce((acc, v) => acc + v, 0);
    const salesTotal = newRevs.anexo_1 + newRevs.anexo_2;
    const servicesTotal = newRevs.anexo_3 + newRevs.anexo_3_sem_iss + newRevs.anexo_4 + newRevs.anexo_4_sem_iss + newRevs.anexo_5;

    let dominantAnexo: AnexoType = 'anexo_1';
    let maxVal = -1;
    for (const cat of ANEXO_REVENUE_CATEGORIES) {
      const v = newRevs[cat.key] || 0;
      if (v > maxVal) {
        maxVal = v;
        dominantAnexo = cat.anexoType;
      }
    }

    onChange({
      anexoRevenues: newRevs,
      isRevenueSegregated: salesTotal > 0 && servicesTotal > 0,
      salesRevenueMonthly: salesTotal,
      servicesRevenueMonthly: servicesTotal,
      monthlyRevenue: newTotal,
      rbt12: newTotal * 12,
      anexo: dominantAnexo,
      businessSegment: targetSegment,
      salesAnexo: newRevs.anexo_2 > 0 ? 'anexo_2' : 'anexo_1',
      servicesAnexo: (newRevs.anexo_4 + newRevs.anexo_4_sem_iss) > 0 ? 'anexo_4' : (newRevs.anexo_5 > 0 ? 'anexo_5' : 'anexo_3'),
    });
  };

  const getCategoryIcon = (key: AnexoCategoryKey) => {
    switch (key) {
      case 'anexo_1':
        return <Store className="w-4 h-4 text-indigo-600" />;
      case 'anexo_2':
        return <Factory className="w-4 h-4 text-amber-600" />;
      case 'anexo_3':
        return <Wrench className="w-4 h-4 text-emerald-600" />;
      case 'anexo_3_sem_iss':
        return <ShieldCheck className="w-4 h-4 text-teal-600" />;
      case 'anexo_4':
        return <HardHat className="w-4 h-4 text-rose-600" />;
      case 'anexo_4_sem_iss':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'anexo_5':
        return <Cpu className="w-4 h-4 text-violet-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5 sm:p-6 space-y-6">
      {/* HEADER: SEGREGAÇÃO DE RECEITAS POR ANEXO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-50 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-8 bg-indigo-600 rounded-full inline-block"></span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-indigo-950 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Segregação de Receitas por Anexo & ISS
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Lance o faturamento mensal conforme cada atividade/Anexo do Simples Nacional (com opção de serviços sem ISS).
            </p>
          </div>
        </div>

        {/* Total Badge in Header */}
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl shrink-0">
          <Receipt className="w-4 h-4 text-indigo-600" />
          <div className="text-right">
            <span className="text-[10px] font-bold text-indigo-700 block uppercase tracking-wider">Total Consolidado</span>
            <span className="text-xs font-black text-indigo-950 font-mono">
              R$ {effectiveTotalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
            </span>
          </div>
        </div>
      </div>

      {/* QUICK PRESET BUTTONS FOR RAPID SCENARIO CREATION */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Atalhos de Distribuição Rápida de Receita:
          </label>
          <span className="text-[11px] text-slate-400">Preenchimento com 1 clique</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { id: 'comercio', label: '100% Comércio', tag: 'Anexo I', color: 'hover:border-indigo-400' },
            { id: 'industria', label: '100% Indústria', tag: 'Anexo II (IPI)', color: 'hover:border-amber-400' },
            { id: 'servicos_iss', label: '100% Serviços c/ ISS', tag: 'Anexo III', color: 'hover:border-emerald-400' },
            { id: 'servicos_sem_iss', label: 'Serviços SEM ISS', tag: 'Isento / Exportação', color: 'hover:border-teal-400' },
            { id: 'obras_iv', label: '100% Obras/Construção', tag: 'Anexo IV', color: 'hover:border-rose-400' },
            { id: 'ti_v', label: '100% TI / Fator R', tag: 'Anexo V', color: 'hover:border-violet-400' },
            { id: 'misto_comercio_servico', label: 'Misto: 60% I + 40% III', tag: 'Comércio + Serviço', color: 'hover:border-blue-400' },
            { id: 'misto_industria_obras', label: 'Misto: 60% II + 40% IV', tag: 'Indústria + Obras', color: 'hover:border-purple-400' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => applyPresetDistribution(btn.id as any)}
              className={`p-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white text-left text-xs transition-all cursor-pointer ${btn.color} hover:shadow-2xs`}
            >
              <span className="font-bold text-[11px] text-slate-800 block truncate">{btn.label}</span>
              <span className="text-[9px] text-slate-400 block truncate font-medium">{btn.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* INPUTS DE RECEITA POR ANEXO */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>Composição do Faturamento Mensal por Anexo:</span>
          </label>
          <span className="text-xs text-slate-500 font-medium">
            Preencha os valores para calcular impostos por categoria
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {ANEXO_REVENUE_CATEGORIES.map((category) => {
            const currentVal = anexoRevs[category.key] || 0;
            const pctShare = effectiveTotalRevenue > 0 ? (currentVal / effectiveTotalRevenue) * 100 : 0;
            const isActive = currentVal > 0;

            return (
              <div
                key={category.key}
                className={`p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-500/10 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Top Badge & Title */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                      {getCategoryIcon(category.key)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {category.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 block">
                        {category.subDescription}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${category.badgeColor}`}>
                    {category.badge}
                  </span>
                </div>

                {/* Input Field */}
                <div className="space-y-1.5">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                      R$
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="0,00"
                      value={currentVal === 0 ? '' : currentVal}
                      onChange={(e) => handleCategoryRevenueChange(category.key, Number(e.target.value) || 0)}
                      className={`w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
                        isActive
                          ? 'bg-white border-indigo-300 text-indigo-950 font-mono shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 font-mono'
                      }`}
                    />
                  </div>

                  {/* Percentage & Quick Add */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-mono font-semibold ${isActive ? 'text-indigo-700' : 'text-slate-400'}`}>
                      {pctShare.toFixed(1)}% do faturamento
                    </span>

                    {/* Quick increment buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCategoryRevenueChange(category.key, currentVal + 10000)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 rounded text-[10px] font-bold transition-all cursor-pointer"
                        title="Adicionar +R$ 10.000"
                      >
                        +10k
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCategoryRevenueChange(category.key, currentVal + 50000)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 rounded text-[10px] font-bold transition-all cursor-pointer"
                        title="Adicionar +R$ 50.000"
                      >
                        +50k
                      </button>
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => handleCategoryRevenueChange(category.key, 0)}
                          className="px-1.5 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[10px] font-bold transition-all cursor-pointer"
                          title="Zerar valor"
                        >
                          <Trash2 className="w-2.5 h-2.5 inline" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SPECIAL SECTORS (MONOFÁSICO & ICMS-ST PRESETS) */}
      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Segmento Especializado da Atividade (PIS/COFINS Monofásico & ICMS-ST):
          </label>
          <span className="text-[11px] text-indigo-600 font-semibold">
            Reduz tributos sobre mercadorias
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sectorPresets.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                onChange({
                  businessSegment: sec.id,
                  monofasicoPisCofinsPercentage: sec.defaultMonofasico,
                  icmsStPercentage: sec.defaultIcmsSt,
                  isSelectiveTaxApplicable: sec.id === 'bebidas',
                  healthDiscountRatePct: sec.id === 'farmacia' ? 60 : 0,
                });
              }}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                input.businessSegment === sec.id
                  ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 font-bold text-indigo-950 shadow-2xs'
                  : 'bg-white/70 border-slate-200 text-slate-700 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                {sec.icon}
                <span className="font-bold text-[11px] truncate">{sec.label}</span>
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight font-medium line-clamp-1">
                {sec.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* CONSOLIDATED TOTAL BAR & PROPORTIONAL BREAKDOWN */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Faturamento Consolidado & Enquadramento nos Regimes:
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
              R$ {effectiveTotalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (RBT12: R$ {(effectiveTotalRevenue * 12).toLocaleString('pt-BR', { maximumFractionDigits: 0 })})
            </span>
          </div>
        </div>

        {/* Multi-Anexo Proportional Stacked Bar */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono">
            {ANEXO_REVENUE_CATEGORIES.map((cat) => {
              const val = anexoRevs[cat.key] || 0;
              if (val <= 0) return null;
              const pct = effectiveTotalRevenue > 0 ? (val / effectiveTotalRevenue) * 100 : 0;
              return (
                <span key={cat.key} className="text-slate-200">
                  <strong className="text-indigo-300">{cat.shortLabel}:</strong> {pct.toFixed(1)}% (R$ {val.toLocaleString('pt-BR')})
                </span>
              );
            })}
          </div>

          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
            {ANEXO_REVENUE_CATEGORIES.map((cat) => {
              const val = anexoRevs[cat.key] || 0;
              if (val <= 0) return null;
              const pct = effectiveTotalRevenue > 0 ? (val / effectiveTotalRevenue) * 100 : 0;
              
              let barColor = 'bg-indigo-500';
              if (cat.key === 'anexo_2') barColor = 'bg-amber-500';
              if (cat.key === 'anexo_3') barColor = 'bg-emerald-500';
              if (cat.key === 'anexo_3_sem_iss') barColor = 'bg-teal-400';
              if (cat.key === 'anexo_4') barColor = 'bg-rose-500';
              if (cat.key === 'anexo_4_sem_iss') barColor = 'bg-purple-500';
              if (cat.key === 'anexo_5') barColor = 'bg-violet-500';

              return (
                <div
                  key={cat.key}
                  title={`${cat.title}: R$ ${val.toLocaleString('pt-BR')} (${pct.toFixed(1)}%)`}
                  className={`h-full ${barColor} transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
