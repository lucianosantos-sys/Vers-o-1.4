import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("Failed to initialize GoogleGenAI client:", e);
    }
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper for sector legislation context in prompt
function getSectorPromptContext(input: any): string {
  if (!input) return "";
  const segment = input.businessSegment || "geral";
  const monofasicoPct = input.monofasicoPisCofinsPercentage || 0;
  const icmsStPct = input.icmsStPercentage || 0;

  let sectorContext = `\nSegmento da Empresa: ${segment.toUpperCase()}`;
  if (monofasicoPct > 0) {
    sectorContext += `\n- % de Receita com PIS/COFINS Monofásico: ${monofasicoPct}%`;
  }
  if (icmsStPct > 0) {
    sectorContext += `\n- % de Receita com ICMS Substituição Tributária (ST): ${icmsStPct}%`;
  }
  if (segment === "farmacia") {
    sectorContext += `\n- Legislação Farmacêutica: Lei 10.147/2000 (Monofásico), Convênio ICMS 142/2018 (ICMS-ST) e Redução de 60% na CBS/IBS na Reforma (EC 132/2023, Art. 9º).`;
  } else if (segment === "autopecas") {
    sectorContext += `\n- Legislação Autopeças: Lei 10.485/2002 (PIS/COFINS Monofásico em peças e componentes automotivos) e Convênio ICMS 142/2018 (ICMS-ST).`;
  } else if (segment === "bebidas") {
    sectorContext += `\n- Legislação Bebidas: Lei 13.097/2015 (PIS/COFINS Monofásico em bebidas frias), Convênio ICMS 142/2018 (ST) e Incidência de Imposto Seletivo (IS - EC 132/2023).`;
  } else if (segment === "combustiveis") {
    sectorContext += `\n- Legislação Combustíveis: Lei 9.718/1998, LC 192/2022 (Monofásico Ad Rem).`;
  } else if (segment === "industria") {
    sectorContext += `\n- Legislação Industrial: LC 123/2006 (Anexo II - Indústria com IPI), Lei 9.249/1995 (Presunção de 8% IRPJ e 12% CSLL), desoneração de bens de capital e crédito integral e imediato de insumos/máquinas na Reforma 2027 (EC 132/23).`;
  } else if (segment === "material_construcao") {
    sectorContext += `\n- Legislação Materiais de Construção: Convênio ICMS 142/2018 (Anexo XI - Substituição Tributária em tintas, cimento, fios, tubos e louças), LC 123/2006 e Regime Específico de Construção Civil/Bens Imóveis na Reforma 2027 (EC 132/23, Art. 9º).`;
  }
  return sectorContext;
}

// AI Tax Advisory endpoint
app.post("/api/ai/tax-advisory", async (req, res) => {
  try {
    const { summary } = req.body;
    const client = getAiClient();

    if (!client) {
      return res.json({
        fallback: true,
        analysis: generateHeuristicAdvisory(summary),
      });
    }

    const input = summary?.input || {};
    const bestRegime = summary?.bestCommercialRegime;
    const bestRegimeData = summary?.results?.[bestRegime];

    const systemInstruction = `Você é um Consultor Tributário Sênior especializado em Planejamento Tributário Brasileiro, Lei Complementar 123/2006 (Simples Nacional), Legislações Setoriais de PIS/COFINS Monofásico (Leis 10.147/00, 10.485/02, 13.097/15), ICMS-ST (Convênio ICMS 142/2018) e na Reforma Tributária do Consumo 2027 (EC 132/2023, CBS, IBS e Imposto Seletivo).
Seu objetivo é emitir um Parecer Técnico e Executivo detalhado, claro e fundamentado para contadores e diretores financeiros.
Analise a segregação de receitas no PGDAS-D, a comparação entre Simples Simplificado, Simples Híbrido, Lucro Presumido e Lucro Real, o impacto na carteira B2B vs B2C e as regras setoriais específicas.`;

    const prompt = `Gere um Parecer Executivo de Enquadramento Tributário e Planejamento para 2027 com base nestes dados:
Dados da Simulação:
${JSON.stringify(summary, null, 2)}
${getSectorPromptContext(input)}

Estruture o parecer em:
1. DIAGNÓSTICO DO CENÁRIO E BENEFÍCIOS SETORIAIS (PIS/COFINS Monofásico e ICMS-ST se aplicável)
2. REGIME RECOMENDADO E ECONOMIA ANUAL CALCULADA
3. DECISÃO ESTRATÉGICA: SIMPLES SIMPLIFICADO VS HÍBRIDO (Impacto de B2B, Não-Cumulatividade e Créditos)
4. IMPACTOS DA REFORMA 2027 (CBS, IBS, Reduções ou Imposto Seletivo)
5. RECOMENDAÇÕES PRÁTICAS E PLANO DE AÇÃO CONTÁBIL`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }
      ],
    });

    res.json({
      fallback: false,
      analysis: response.text || generateHeuristicAdvisory(summary),
    });
  } catch (error: any) {
    console.error("Gemini API error in advisory:", error);
    res.json({
      fallback: true,
      analysis: generateHeuristicAdvisory(req.body.summary),
    });
  }
});

// AI Custom Question endpoint
app.post("/api/ai/custom-question", async (req, res) => {
  try {
    const { summary, question } = req.body;
    const client = getAiClient();

    if (!client) {
      return res.json({
        fallback: true,
        answer: generateHeuristicQuestionAnswer(question, summary),
      });
    }

    const input = summary?.input || {};
    const systemInstruction = `Você é um Consultor Tributário Sênior especialista no Simples Nacional e na Reforma Tributária 2027 (EC 132/2023, CBS, IBS, PIS/COFINS Monofásico e ICMS-ST).
Responda de forma direta, clara e fundamentada juridicamente e matematicamente à dúvida do usuário sobre o cenário fiscal dele.`;

    const prompt = `Contexto da empresa do usuário:
${JSON.stringify(summary, null, 2)}
${getSectorPromptContext(input)}

Dúvida do usuário:
"${question}"

Responda objetivamente explicando a regra tributária e o impacto prático para o negócio dele.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }
      ],
    });

    res.json({
      fallback: false,
      answer: response.text || generateHeuristicQuestionAnswer(question, summary),
    });
  } catch (error: any) {
    console.error("Gemini API error in custom question:", error);
    res.json({
      fallback: true,
      answer: generateHeuristicQuestionAnswer(req.body.question, req.body.summary),
    });
  }
});

// General tax consultant endpoint (backwards compatibility)
app.post("/api/tax-consultant", async (req, res) => {
  try {
    const { prompt, scenarioData } = req.body;
    const client = getAiClient();

    if (!client) {
      return res.json({
        fallback: true,
        response: generateHeuristicAdvisory({ input: scenarioData, ...scenarioData }),
      });
    }

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Você é um consultor tributário especializado no Simples Nacional e Reforma 2027.\n\nDados:\n${JSON.stringify(scenarioData, null, 2)}\n\nPergunta: ${prompt || "Analise a melhor opção tributária."}`,
            },
          ],
        },
      ],
    });

    res.json({
      fallback: false,
      response: response.text || "Análise concluída.",
    });
  } catch (error: any) {
    res.json({
      fallback: true,
      response: generateHeuristicAdvisory({ input: req.body.scenarioData, ...req.body.scenarioData }),
    });
  }
});

function generateHeuristicAdvisory(summary: any): string {
  if (!summary) {
    return "Por favor, preencha os dados da simulação no formulário para gerar o parecer tributário.";
  }

  const input = summary.input || {};
  const bestRegime = summary.bestCommercialRegime || "simples_simplificado";
  const bestData = summary.results?.[bestRegime];
  const annualSavings = summary.annualSavings || 0;
  const segment = input.businessSegment || "geral";
  const monofasicoPct = input.monofasicoPisCofinsPercentage || 0;
  const icmsStPct = input.icmsStPercentage || 0;

  let sectorNotes = "";
  if (monofasicoPct > 0 || icmsStPct > 0) {
    sectorNotes = `\n\n📌 **Segregação Setorial de Receitas no PGDAS-D:**
- Com a segregação de **${monofasicoPct}% de produtos monofásicos** (Leis 10.147/00, 10.485/02 ou 13.097/15) e **${icmsStPct}% com ICMS-ST** (Convênio 142/18), a empresa economiza mensalmente ao excluir essas parcelas da alíquota efetiva do DAS, evitando a bitributação.`;
  }

  if (segment === "farmacia") {
    sectorNotes += `\n- **Impacto no Setor Farmacêutico (Reforma 2027):** Medicamentos contam com alíquota reduzida em 60% no IBS/CBS (EC 132/23, Art. 9º), tornando o Simples Híbrido altamente eficiente caso haja volume relevante de compras com créditos.`;
  } else if (segment === "bebidas") {
    sectorNotes += `\n- **Impacto no Setor de Bebidas (Reforma 2027):** Incidência de Imposto Seletivo (IS) na produção/importação, exigindo revisão das margens e da estratégia não-cumulativa.`;
  } else if (segment === "industria") {
    sectorNotes += `\n- **Impacto no Setor Industrial & Manufatura (Reforma 2027):** Extinção gradual do IPI e aproveitamento imediato de créditos sobre maquinários (bens de capital), matérias-primas e energia elétrica. O Simples Híbrido é altamente vantajoso se a fábrica vende para clientes corporativos (B2B).`;
  } else if (segment === "material_construcao") {
    sectorNotes += `\n- **Impacto em Materiais de Construção (Reforma 2027):** Fim do ICMS-ST (Anexo XI do Convênio 142/18) e transição para o Regime Específico de Construção Civil/Bens Imóveis com alíquotas favorecidas e exigência de crédito integral por construtoras parceiras.`;
  }

  return `### PARECER EXECUTIVO DE PLANEJAMENTO TRIBUTÁRIO (2027)

**1. Diagnóstico do Cenário Empresarial:**
- **Empresa:** ${input.companyName || "Empresa Analisada"}
- **Segmento:** ${segment.toUpperCase()} | Enquadramento: ${input.anexo?.toUpperCase() || "ANEXO I"}
- **Faturamento Anual Projetado (RBT12):** R$ ${(input.rbt12 || input.monthlyRevenue * 12 || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- **Perfil de Vendas:** ${input.b2bPercentage || 0}% B2B (Empresas) | ${100 - (input.b2bPercentage || 0)}% B2C (Consumidor Final)${sectorNotes}

**2. Regime Tributário Recomendado:**
Recomendamos a opção pelo **${bestData?.name || "Simples Nacional"}**.
Este regime proporciona uma **economia estimada de até R$ ${annualSavings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/ano** em comparação ao regime menos favorável.

**3. Avaliação Estratégica: Simples Simplificado vs Simples Híbrido:**
${
  (input.b2bPercentage || 0) >= 50
    ? `Como ${(input.b2bPercentage || 0)}% do seu faturamento provém de vendas para Pessoas Jurídicas (B2B), a opção pelo **Simples Híbrido** é altamente estratégica. Ela garante aos seus clientes corporativos o direito a **100% de crédito de IBS e CBS**, protegendo a competitividade da empresa e eliminando pressões por descontos comerciais compensatórios.`
    : `Com predominância de vendas para consumidor final B2C (${100 - (input.b2bPercentage || 0)}%), o **Simples Simplificado (Guia Única DAS)** apresenta máxima eficiência de custos e menor complexidade contábil.`
}

**4. Recomendações e Próximos Passos:**
1. Manter rigor na classificação fiscal de NCMs no ERP para garantir o aproveitamento de produtos monofásicos e com ICMS-ST no PGDAS-D.
2. Monitorar a relação de compras de insumos e mercadorias tributadas para apuração dos créditos de CBS e IBS em 2027.
3. Formalizar a opção no portal do Simples Nacional dentro do prazo legal de janeiro de 2027.`;
}

function generateHeuristicQuestionAnswer(question: string, summary: any): string {
  const q = (question || "").toLowerCase();
  if (q.includes("farmacia") || q.includes("medicamento") || q.includes("monofasico") || q.includes("pis") || q.includes("cofins")) {
    return "De acordo com a Lei 10.147/2000 e o Art. 18, § 4º-A, I da LC 123/2006, medicamentos e cosméticos sujeitos à tributação monofásica de PIS/COFINS têm alíquota zero nas etapas de revenda atacadista e varejista. No PGDAS-D, você deve segregar essas receitas para abater a parcela de PIS e COFINS da alíquota do Simples, o que gera uma economia de 10% a 30% no valor da guia DAS.";
  }
  if (q.includes("industria") || q.includes("fabrica") || q.includes("ipi") || q.includes("manufatura") || q.includes("anexo ii")) {
    return "A atividade industrial tributa pelo Anexo II do Simples Nacional (incluindo partilha de IPI) ou no Lucro Presumido com presunção de 8% (IRPJ) e 12% (CSLL). Na Reforma 2027 (EC 132/2023), o IPI é zerado (exceto Zona Franca) e as indústrias obtêm crédito amplo e imediato de IBS/CBS sobre bens de capital (máquinas), energia e insumos, sendo o Simples Híbrido essencial para indústrias com clientes B2B.";
  }
  if (q.includes("construcao") || q.includes("material") || q.includes("tinta") || q.includes("cimento") || q.includes("obra") || q.includes("anexo iv")) {
    return "No comércio de materiais de construção, itens como tintas, cimento, fios e cerâmicas possuem alta incidência de ICMS-ST (Convênio 142/2018 Anexo XI), devendo ser excluídos da parcela de ICMS no DAS. Para serviços e obras civis, a tributação é pelo Anexo IV da LC 123/2006 com INSS patronal de 20% recolhido fora do DAS. Na Reforma, há regime específico com redução de 20% a 40% nas alíquotas do IVA Dual.";
  }
  if (q.includes("autopeca") || q.includes("peça") || q.includes("pneu") || q.includes("veiculo")) {
    return "Conforme a Lei 10.485/2002 e a LC 123/2006, autopeças, pneus e câmaras de ar têm incidência monofásica de PIS/COFINS no fabricante. A revenda é isenta desses tributos federais no DAS. Além disso, a maioria dos itens possui ICMS-ST retido pelo fabricante (Convênio 142/2018), permitindo também a exclusão do ICMS na apuração do Simples.";
  }
  if (q.includes("bebida") || q.includes("cerveja") || q.includes("refrigerante") || q.includes("seletivo")) {
    return "Distribuidoras e comércio de bebidas frias contam com PIS/COFINS Monofásico pela Lei 13.097/2015 e ICMS-ST (Convênio 142/2018). Na Reforma 2027, as bebidas alcoólicas e açucaradas estarão sujeitas ao Imposto Seletivo (IS) na produção, que integrará o custo de aquisição da distribuidora.";
  }
  if (q.includes("b2b") || q.includes("credito") || q.includes("hibrido")) {
    return "No Simples Híbrido, a empresa apura o IBS e a CBS pelo regime normal de débito e crédito (não-cumulativo), transferindo 100% de créditos de IVA para seus clientes PJ. Isso evita que clientes corporativos exijam descontos ou troquem de fornecedor em 2027.";
  }
  return "Com base na legislação vigente (LC 123/2006 e EC 132/2023), o planejamento tributário deve balancear o perfil de clientes (B2B x B2C), a segregação de produtos monofásicos e com ICMS-ST, e a proporção de despesas creditáveis no novo IVA Dual.";
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tax Simulator Server running on http://localhost:${PORT}`);
  });
}

startServer();
