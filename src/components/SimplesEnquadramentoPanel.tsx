import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Scale,
  Building2,
  TrendingUp,
  Info,
  Layers,
  FileCheck,
} from 'lucide-react';
import { SimplesEnquadramento } from '../types/tax';

interface SimplesEnquadramentoPanelProps {
  enquadramento: SimplesEnquadramento;
  className?: string;
  isCompact?: boolean;
}

export const SimplesEnquadramentoPanel: React.FC<SimplesEnquadramentoPanelProps> = ({
  enquadramento,
  className = '',
  isCompact = false,
}) => {
  const {
    status,
    isEligibleForSimples,
    porteLabel,
    annualizedRevenue,
    monthlyRevenue,
    limiteMaximo,
    sublimite,
    percentualLimiteUsado,
    percentualSublimiteUsado,
    statusBadge,
    sublimiteNotice,
    limiteMaximoNotice,
    activityEligibility,
    legalReferences,
  } = enquadramento;

  const remainingToSublimite = Math.max(0, sublimite - annualizedRevenue);
  const remainingToLimiteMaximo = Math.max(0, limiteMaximo - annualizedRevenue);

  const getStatusColor = () => {
    switch (statusBadge.variant) {
      case 'success':
        return {
          border: 'border-emerald-200',
          bg: 'bg-emerald-50/70',
          headerBg: 'bg-emerald-700',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          progressColor: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        };
      case 'warning':
        return {
          border: 'border-amber-200',
          bg: 'bg-amber-50/70',
          headerBg: 'bg-amber-700',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          progressColor: 'bg-amber-500',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        };
      case 'danger':
      default:
        return {
          border: 'border-rose-200',
          bg: 'bg-rose-50/70',
          headerBg: 'bg-rose-700',
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
          progressColor: 'bg-rose-500',
          icon: <XCircle className="w-5 h-5 text-rose-600" />,
        };
    }
  };

  const colors = getStatusColor();

  if (isCompact) {
    return (
      <div
        id="simples-enquadramento-compact"
        className={`rounded-2xl border p-4 shadow-sm transition-all ${colors.border} ${colors.bg} ${className}`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            {colors.icon}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs uppercase tracking-wider text-slate-900">
                  Enquadramento no Simples Nacional:
                </span>
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${colors.badgeBg}`}
                >
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Base Legal: <strong>{legalReferences.leiComplementarSimples}</strong> • Porte: {porteLabel}
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-500 block font-semibold">Faturamento Anual (RBT12):</span>
            <span className="font-black text-slate-900 text-sm">
              R$ {annualizedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {sublimiteNotice && (
          <div className="mt-3 p-2.5 bg-amber-100/90 border border-amber-300 rounded-xl text-xs text-amber-950 font-medium flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>{sublimiteNotice}</span>
          </div>
        )}

        {limiteMaximoNotice && (
          <div className="mt-3 p-2.5 bg-rose-100/90 border border-rose-300 rounded-xl text-xs text-rose-950 font-medium flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <span>{limiteMaximoNotice}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      id="simples-enquadramento-full-panel"
      className={`rounded-3xl border bg-white shadow-md overflow-hidden ${colors.border} ${className}`}
    >
      {/* Header Banner */}
      <div className="bg-indigo-950 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-800 text-white rounded-2xl shadow-inner">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black tracking-tight text-white">
                Verificação de Enquadramento no Simples Nacional
              </h3>
              <span className="bg-indigo-800 text-indigo-200 border border-indigo-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Lei Complementar nº 214/2025
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Auditoria de faturamento total (RBT12) e enquadramento da atividade econômica (CNAE / Anexos).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <span
            className={`text-xs font-black px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-xs ${colors.badgeBg}`}
          >
            {colors.icon}
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Status Description Box */}
        <div className={`p-4 rounded-2xl border ${colors.border} ${colors.bg}`}>
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">{colors.icon}</div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900">{statusBadge.title}</h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {statusBadge.description}
              </p>
              {sublimiteNotice && (
                <div className="mt-2.5 p-3 bg-amber-100 border border-amber-300 rounded-xl text-xs text-amber-950 font-medium">
                  <strong>Atenção Sublimite:</strong> {sublimiteNotice}
                </div>
              )}
              {limiteMaximoNotice && (
                <div className="mt-2.5 p-3 bg-rose-100 border border-rose-300 rounded-xl text-xs text-rose-950 font-semibold">
                  <strong>Desenquadramento Obrigatório:</strong> {limiteMaximoNotice}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Faturamento Termômetro & Limites */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-slate-800">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Termômetro de Faturamento Anual (RBT12 vs Limites Legais)
            </span>
            <span className="text-slate-600">
              R$ {annualizedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (
              {((annualizedRevenue / limiteMaximo) * 100).toFixed(1)}% do Teto Nacional)
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="relative w-full h-8 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center">
            {/* Filled progress */}
            <div
              className={`h-full transition-all duration-500 ${
                annualizedRevenue > limiteMaximo
                  ? 'bg-rose-500'
                  : annualizedRevenue > sublimite
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (annualizedRevenue / limiteMaximo) * 100)}%`,
              }}
            />

            {/* Sublimite line indicator (75% of 4.8M = 3.6M) */}
            <div
              className="absolute top-0 bottom-0 border-r-2 border-dashed border-amber-700 z-10"
              style={{ left: '75%' }}
              title="Sublimite Estadual: R$ 3.600.000,00 (75%)"
            >
              <span className="absolute -top-1 -right-12 bg-amber-700 text-white text-[9px] font-black px-1 rounded shadow-xs">
                Sublimite R$ 3,6M
              </span>
            </div>

            {/* Current Value inside bar if space */}
            <span className="absolute left-3 text-xs font-black text-white drop-shadow-sm pointer-events-none">
              R$ {annualizedRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* 3 Metric Limit Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            {/* ME Limit */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-slate-500 font-bold block text-[11px]">1. Faixa Microempresa (ME)</span>
              <span className="font-black text-slate-800 text-sm block mt-0.5">Até R$ 360.000,00</span>
              <span className="text-[10px] text-slate-500 font-medium">
                {annualizedRevenue <= 360000
                  ? '✓ Empresa classificada como ME'
                  : 'Superado (Classificada como EPP)'}
              </span>
            </div>

            {/* Sublimite Limit */}
            <div
              className={`border p-3 rounded-xl ${
                annualizedRevenue > sublimite
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-slate-500 font-bold block text-[11px]">
                2. Sublimite Estadual (ICMS/ISS/IBS)
              </span>
              <span className="font-black text-slate-800 text-sm block mt-0.5">
                R$ 3.600.000,00
              </span>
              <span className="text-[10px] font-medium block">
                {annualizedRevenue > sublimite ? (
                  <span className="text-amber-800 font-bold">
                    ⚠️ Excedido em R${' '}
                    {(annualizedRevenue - sublimite).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">
                    ✓ Margem de R${' '}
                    {remainingToSublimite.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                )}
              </span>
            </div>

            {/* Teto Nacional Limit */}
            <div
              className={`border p-3 rounded-xl ${
                annualizedRevenue > limiteMaximo
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-slate-500 font-bold block text-[11px]">
                3. Teto Nacional (LC 123/06 & LC 214/25)
              </span>
              <span className="font-black text-slate-800 text-sm block mt-0.5">
                R$ 4.800.000,00
              </span>
              <span className="text-[10px] font-medium block">
                {annualizedRevenue > limiteMaximo ? (
                  <span className="text-rose-800 font-bold">
                    🚫 Desenquadrado (Excedeu em R${' '}
                    {(annualizedRevenue - limiteMaximo).toLocaleString('pt-BR', { maximumFractionDigits: 0 })})
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">
                    ✓ Margem de R${' '}
                    {remainingToLimiteMaximo.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Activity & CNAE Verification */}
        <div className="border-t border-slate-200 pt-5 space-y-3">
          <h5 className="text-xs font-black uppercase tracking-wide text-slate-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            Enquadramento da Atividade Econômica & Regras do Anexo
          </h5>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Anexo e Segmento Selecionado
                </span>
                <span className="text-sm font-black text-indigo-950 block mt-0.5">
                  {activityEligibility.anexoName}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  {activityEligibility.anexoDescription}
                </span>
              </div>

              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3 py-1 rounded-xl shrink-0">
                Atividade Permitida no Simples
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">
                  Diretrizes da Atividade:
                </span>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {activityEligibility.activityNotes}
                </p>
              </div>

              {activityEligibility.hasFactorR ? (
                <div className="p-3 bg-white rounded-xl border border-indigo-200">
                  <span className="font-bold text-indigo-900 block mb-1">
                    Regra do Fator R (LC 123/06 art. 18 § 5º-J/M & LC 214/25):
                  </span>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {activityEligibility.factorRStatus}
                  </p>
                </div>
              ) : activityEligibility.hasExternalCpp ? (
                <div className="p-3 bg-white rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-1">
                    Encargos de Folha (Anexo IV):
                  </span>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    A Contribuição Previdenciária Patronal (CPP ~28,8%) não está inclusa no DAS do Anexo IV e deve ser recolhida à parte via DCTFWeb.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">
                    Benefício da CPP Unificada:
                  </span>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    A Contribuição Patronal Previdenciária (INSS 20% + RAT + Terceiros) está 100% inclusa na alíquota única do DAS, isentando a folha de encargos patronais adicionais.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legal Basis Footer Badge */}
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-700 shrink-0" />
            <span className="text-indigo-950 font-medium">
              Base Legal: <strong>{legalReferences.leiComplementarSimples}</strong> •{' '}
              {legalReferences.reformaConstitucional} • {legalReferences.artigoEnquadramento}
            </span>
          </div>
          <span className="text-[11px] font-bold text-indigo-800 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0">
            Regulamentação Oficial 2025/2027
          </span>
        </div>
      </div>
    </div>
  );
};
