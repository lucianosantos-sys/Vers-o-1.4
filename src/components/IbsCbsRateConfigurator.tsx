import React from 'react';
import { Sliders, Sparkles, Percent, ShieldCheck, HelpCircle } from 'lucide-react';
import { CompanyInput } from '../types/tax';

interface IbsCbsRateConfiguratorProps {
  input: CompanyInput;
  onChange: (updates: Partial<CompanyInput>) => void;
}

export const IbsCbsRateConfigurator: React.FC<IbsCbsRateConfiguratorProps> = ({
  input,
  onChange,
}) => {
  const {
    useCustomIbsCbsRate,
    customCbsRatePct = 8.8,
    customIbsRatePct = 17.7,
    simulationYear,
    cbsRate2027 = 0.9,
    ibsRate2027 = 0.1,
    fullCbsIbsRate = 26.5,
    healthDiscountRatePct = 60,
    businessSegment,
  } = input;

  const currentTotal = useCustomIbsCbsRate
    ? Number((customCbsRatePct + customIbsRatePct).toFixed(2))
    : simulationYear === '2027_transicao'
    ? Number((cbsRate2027 + ibsRate2027).toFixed(2))
    : fullCbsIbsRate;

  const handleSelectPreset = (
    type: 'standard_26_5' | 'transition_2027' | 'health_10_6' | 'zero_rate' | 'custom'
  ) => {
    if (type === 'standard_26_5') {
      onChange({
        useCustomIbsCbsRate: false,
        simulationYear: '2033_pleno',
        fullCbsIbsRate: 26.5,
      });
    } else if (type === 'transition_2027') {
      onChange({
        useCustomIbsCbsRate: false,
        simulationYear: '2027_transicao',
        cbsRate2027: 0.9,
        ibsRate2027: 0.1,
      });
    } else if (type === 'health_10_6') {
      onChange({
        useCustomIbsCbsRate: true,
        customCbsRatePct: 3.52,
        customIbsRatePct: 7.08,
      });
    } else if (type === 'zero_rate') {
      onChange({
        useCustomIbsCbsRate: true,
        customCbsRatePct: 0,
        customIbsRatePct: 0,
      });
    } else if (type === 'custom') {
      onChange({
        useCustomIbsCbsRate: true,
        customCbsRatePct: customCbsRatePct || 8.8,
        customIbsRatePct: customIbsRatePct || 17.7,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              Alíquota IBS / CBS (Sugerida & Personalizada)
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                IVA Dual 2027
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Escolha uma alíquota de referência oficial ou configure alíquotas personalizadas de CBS e IBS.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50/70 p-2 rounded-xl border border-indigo-100">
          <span className="text-xs font-bold text-slate-600">Alíquota Efetiva Total:</span>
          <span className="text-sm font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200">
            {currentTotal.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          type="button"
          onClick={() => handleSelectPreset('standard_26_5')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            !useCustomIbsCbsRate && simulationYear === '2033_pleno'
              ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
              : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Sugerida 2033</span>
          <span className="text-base font-black text-slate-900 mt-1">26,50%</span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5">Alíquota Plena Padrão</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectPreset('transition_2027')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            !useCustomIbsCbsRate && simulationYear === '2027_transicao'
              ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
              : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Teste 2027</span>
          <span className="text-base font-black text-slate-900 mt-1">1,00%</span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5">CBS 0,9% + IBS 0,1%</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectPreset('health_10_6')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            useCustomIbsCbsRate && Math.abs(currentTotal - 10.6) < 0.2
              ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
              : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Saúde / Farma</span>
          <span className="text-base font-black text-slate-900 mt-1">10,60%</span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5">-60% Redução Legal</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectPreset('zero_rate')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            useCustomIbsCbsRate && currentTotal === 0
              ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
              : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Isenção / Zero</span>
          <span className="text-base font-black text-slate-900 mt-1">0,00%</span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5">Cesta Básica Nacional</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectPreset('custom')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            useCustomIbsCbsRate && Math.abs(currentTotal - 10.6) >= 0.2 && currentTotal !== 0
              ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
              : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Personalizada</span>
          <span className="text-base font-black text-slate-900 mt-1">Custom</span>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5">Definir CBS e IBS</span>
        </button>
      </div>

      {/* Custom Inputs Panel (Active when custom or toggled) */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={useCustomIbsCbsRate}
              onChange={(e) => onChange({ useCustomIbsCbsRate: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span>Ativar modo de Alíquotas Personalizadas de CBS e IBS</span>
          </label>
          <span className="text-[11px] text-slate-500 font-medium">
            {useCustomIbsCbsRate ? 'Modo Personalizado Ativo' : 'Utilizando Parâmetro Sugerido'}
          </span>
        </div>

        {useCustomIbsCbsRate && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Alíquota CBS (Federal - Substituto de PIS/COFINS):
                </label>
                <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {customCbsRatePct.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={customCbsRatePct}
                  onChange={(e) => onChange({ customCbsRatePct: parseFloat(e.target.value) || 0 })}
                  className="flex-1 accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="relative w-24">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={customCbsRatePct}
                    onChange={(e) => onChange({ customCbsRatePct: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-3 pr-6 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Referência padrão: 8,80% (ou 0,90% na transição 2027).
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Alíquota IBS (Estadual/Municipal - Substituto de ICMS/ISS):
                </label>
                <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {customIbsRatePct.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.1"
                  value={customIbsRatePct}
                  onChange={(e) => onChange({ customIbsRatePct: parseFloat(e.target.value) || 0 })}
                  className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="relative w-24">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={customIbsRatePct}
                    onChange={(e) => onChange({ customIbsRatePct: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-3 pr-6 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Referência padrão: 17,70% (ou 0,10% na transição 2027).
              </p>
            </div>
          </div>
        )}

        {businessSegment === 'farmacia' && (
          <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Benefício Setorial da Saúde (EC 132/23):</span> Medicamentos possuem alíquota de IBS/CBS reduzida em {healthDiscountRatePct}% por determinação constitucional.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
