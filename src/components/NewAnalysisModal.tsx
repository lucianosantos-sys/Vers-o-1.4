import React from 'react';
import {
  RotateCcw,
  Sparkles,
  Store,
  Pill,
  Car,
  Beer,
  Wrench,
  Factory,
  CheckCircle2,
  X,
  FilePlus,
  ArrowRight,
} from 'lucide-react';
import { CompanyInput, SimulationYear } from '../types/tax';
import { PRESET_SCENARIOS } from '../data/taxTables';

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (newValues?: Partial<CompanyInput>) => void;
  onSelectPreset: (presetId: string) => void;
}

export const NewAnalysisModal: React.FC<NewAnalysisModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  const handleStartBlank = () => {
    onConfirmReset({
      companyName: 'Minha Empresa Ltda',
      cnpj: '00.000.000/0001-00',
      anexo: 'anexo_1',
      anexoRevenues: {
        anexo_1: 50000,
        anexo_2: 0,
        anexo_3: 0,
        anexo_3_sem_iss: 0,
        anexo_4: 0,
        anexo_4_sem_iss: 0,
        anexo_5: 0,
      },
      businessSegment: 'geral',
      monofasicoPisCofinsPercentage: 0,
      icmsStPercentage: 0,
      rbt12: 600000,
      monthlyRevenue: 50000,
      monthlyPayroll: 8000,
      monthlyProLabore: 3000,
      monthlyPurchasesInputs: 20000,
      creditEligibilityPct: 85,
      b2bPercentage: 30,
      b2bDisputeDiscountPct: 15,
      lucroRealMarginPct: 12,
      simulationYear: '2027_transicao',
      cbsRate2027: 0.9,
      ibsRate2027: 0.1,
      fullCbsIbsRate: 26.5,
      issRate: 5.0,
      icmsEffectiveRate: 18.0,
      useCustomIbsCbsRate: false,
      customCbsRatePct: 8.8,
      customIbsRatePct: 17.7,
      healthDiscountRatePct: 60,
    });
    onClose();
  };

  const handleChoosePreset = (presetId: string) => {
    onSelectPreset(presetId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-indigo-100 overflow-hidden space-y-0 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 text-white flex justify-between items-start">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold uppercase tracking-wider">
              <RotateCcw className="w-3.5 h-3.5 text-indigo-300" />
              Reiniciar Simulação
            </div>
            <h3 className="text-xl font-black tracking-tight text-white">
              Iniciar uma Nova Análise Tributária
            </h3>
            <p className="text-xs text-indigo-200 font-medium">
              Escolha como deseja começar sua nova simulação para a Reforma 2027.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Options */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Option 1: Start Clean */}
          <div
            onClick={handleStartBlank}
            className="p-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <FilePlus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Nova Análise Limpa (Preencher Passo a Passo)
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Reinicia com valores padrão recomendados para você preencher os dados da sua empresa.
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              Começar
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Option 2: Choose a Quick Real Case Preset */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Ou selecione um exemplo prático pronto:
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">1 clique para carregar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'farmacia_drogaria',
                  title: 'Farmácia / Drogaria',
                  sub: 'PIS/COFINS Monofásico + ICMS-ST',
                  icon: <Pill className="w-4 h-4 text-rose-600" />,
                  bg: 'bg-rose-50 border-rose-200 hover:border-rose-400',
                },
                {
                  id: 'autopecas_distribuidora',
                  title: 'Autopeças & Oficina',
                  sub: 'Peças com ICMS-ST e Monofásico',
                  icon: <Car className="w-4 h-4 text-blue-600" />,
                  bg: 'bg-blue-50 border-blue-200 hover:border-blue-400',
                },
                {
                  id: 'distribuidora_bebidas',
                  title: 'Distribuidora de Bebidas',
                  sub: 'Bebidas frias + Imposto Seletivo',
                  icon: <Beer className="w-4 h-4 text-amber-600" />,
                  bg: 'bg-amber-50 border-amber-200 hover:border-amber-400',
                },
                {
                  id: 'servicos_ti_fator_r',
                  title: 'Prestador de Serviços / TI',
                  sub: 'Anexo III vs V e Fator R',
                  icon: <Wrench className="w-4 h-4 text-emerald-600" />,
                  bg: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
                },
                {
                  id: 'industria_confeccao',
                  title: 'Indústria / Confecção',
                  sub: 'Fabricação, IPI e Anexo II',
                  icon: <Factory className="w-4 h-4 text-purple-600" />,
                  bg: 'bg-purple-50 border-purple-200 hover:border-purple-400',
                },
                {
                  id: 'comercio_varejista_b2c',
                  title: 'Comércio Varejista (Loja)',
                  sub: 'Venda direta a consumidor final',
                  icon: <Store className="w-4 h-4 text-indigo-600" />,
                  bg: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleChoosePreset(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between hover:shadow-sm ${item.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-2xs">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {item.sub}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
