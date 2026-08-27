import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Scale,
  Sparkles,
} from 'lucide-react';
import { EDUCATIONAL_TOPICS, FAQ_ITEMS, REFORMA_TIMELINE } from '../data/educationalContent';

export const ReformGuide: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const categories = [
    { id: 'all', label: 'Todos os Tópicos' },
    { id: 'monofasico_st', label: '⚖️ PIS/COFINS & ICMS-ST (Farmácias/Autopeças/Bebidas)' },
    { id: 'reforma2027', label: '📜 Reforma 2027 (Saúde & Seletivo)' },
    { id: 'hibrido_vs_simplificado', label: '⚡ Híbrido vs Simplificado' },
    { id: 'b2b_impact', label: '🏢 Guerra de Créditos B2B' },
    { id: 'fator_r', label: '🎯 Fator R (Anexo V x III)' },
  ];

  const filteredTopics =
    selectedCategory === 'all'
      ? EDUCATIONAL_TOPICS
      : EDUCATIONAL_TOPICS.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Guia Didático da Legislação e Reforma Tributária 2027
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Entenda a legislação de PIS/COFINS Monofásico, ICMS-ST, EC 132/2023 e as escolhas do Simples Nacional.
            </p>
          </div>
        </div>
      </div>

      {/* TIMELINE SECTION */}
      <div className="bg-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-indigo-900">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
            Linha do Tempo da Transição Tributária (2026 - 2033)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REFORMA_TIMELINE.map((item) => (
            <div
              key={item.year}
              className="p-5 rounded-2xl bg-indigo-900/80 border border-indigo-700/80 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-400 text-indigo-950 uppercase tracking-wider">
                  {item.status}
                </span>
                <h4 className="text-xl font-black text-white mt-2.5">{item.year}</h4>
                <p className="text-xs font-bold text-emerald-400 mb-1.5">{item.title}</p>
                <p className="text-xs text-indigo-200 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOPIC FILTER TABS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Tópicos Explicativos & Conceitos Chave
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                    {topic.badge}
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-900 mb-1.5 tracking-tight">{topic.title}</h4>
                <p className="text-xs text-slate-500 mb-3 font-medium">{topic.shortDesc}</p>

                <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-medium">
                  {topic.content.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold flex items-start gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{topic.keyTakeaway}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ ACCORDION */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            Perguntas Frequentes (FAQ Tributário & Setorial)
          </h3>
        </div>

        <div className="space-y-2.5 divide-y divide-indigo-50">
          {FAQ_ITEMS.map((faq, fIdx) => {
            const isOpen = openFaqIndex === fIdx;
            return (
              <div key={fIdx} className="pt-2.5">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                  className="w-full flex items-center justify-between text-left py-2.5 text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 uppercase">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 animate-in fade-in font-medium">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
