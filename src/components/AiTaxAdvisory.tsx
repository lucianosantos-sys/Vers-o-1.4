import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  RefreshCw,
  FileCheck,
  Send,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { SimulationSummary } from '../types/tax';

interface AiTaxAdvisoryProps {
  summary: SimulationSummary;
}

export const AiTaxAdvisory: React.FC<AiTaxAdvisoryProps> = ({ summary }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [reportText, setReportText] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAiReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/tax-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      });

      if (!response.ok) {
        throw new Error('Falha ao obter parecer da IA.');
      }

      const data = await response.json();
      setReportText(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar parecer tributário.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/custom-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, question: customQuestion }),
      });

      if (!response.ok) {
        throw new Error('Falha ao processar dúvida com a IA.');
      }

      const data = await response.json();
      setCustomAnswer(data.answer);
    } catch (err: any) {
      setError(err.message || 'Erro ao consultar a IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (reportText) {
      navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Card */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Consultor Tributário IA (Gemini 2.5)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Parecer consultivo automatizado com fundamentação na Reforma Tributária (EC 132/2023).
              </p>
            </div>
          </div>

          <button
            id="btn-generate-ai-advisory"
            type="button"
            onClick={handleGenerateAiReport}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-emerald-100 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analisando Cenários com IA...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                Gerar Parecer Completo da IA
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Parecer Gerado */}
      {reportText && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">
                Parecer Executivo de Enquadramento Tributário 2027
              </h3>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-indigo-700 text-xs font-bold hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>

          <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100 text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
            {reportText}
          </div>
        </div>
      )}

      {/* Ask custom question */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
          <h3 className="text-sm font-black text-slate-900">
            Tire Dúvidas Específicas sobre esta Simulação
          </h3>
        </div>

        <form onSubmit={handleAskQuestion} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: 'O que acontece se eu contratar mais 2 funcionários?' ou 'Como funciona o crédito no Anexo III?'"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !customQuestion.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Perguntar
            </button>
          </div>
        </form>

        {customAnswer && (
          <div className="mt-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 leading-relaxed font-medium animate-in fade-in">
            <span className="font-bold text-emerald-900 block mb-1">Resposta do Consultor:</span>
            {customAnswer}
          </div>
        )}
      </div>
    </div>
  );
};
