import {
  AnexoType,
  CompanyInput,
  DasBreakdown,
  EnquadramentoStatus,
  IbsCbsCalculation,
  PrePostReformComparison,
  RegimeResult,
  RegimeType,
  SegregationSavings,
  SimplesEnquadramento,
  SimulationSummary,
  TaxSubstitutionRow,
} from '../types/tax';
import { ANEXO_TABLES } from '../data/taxTables';

export function calculateFatorR(monthlyRevenue: number, monthlyPayroll: number, monthlyProLabore: number, rbt12: number) {
  const totalMonthlyPayroll = monthlyPayroll + monthlyProLabore;
  const annualizedPayroll = totalMonthlyPayroll * 12;
  const baseRevenue = rbt12 > 0 ? rbt12 : monthlyRevenue * 12;
  
  const factorR = baseRevenue > 0 ? annualizedPayroll / baseRevenue : 0;
  const factorRPct = factorR * 100;
  const isAnexo3Eligible = factorRPct >= 28;

  const targetAnnualPayroll = baseRevenue * 0.28;
  const additionalAnnualPayrollNeeded = Math.max(0, targetAnnualPayroll - annualizedPayroll);
  const additionalPayrollNeededFor28Pct = additionalAnnualPayrollNeeded / 12;

  return {
    factorR,
    factorRPct,
    isAnexo3Eligible,
    additionalPayrollNeededFor28Pct,
  };
}

/**
 * Verificação rigorosa de Enquadramento no Simples Nacional conforme:
 * - Lei Complementar nº 214/2025 (Institui IBS, CBS, IS e nova sistemática do Simples Nacional)
 * - Lei Complementar nº 123/2006 (Estatuto Nacional da Microempresa e EPP, Arts. 3º, 18, 19 e 20)
 * - Emenda Constitucional nº 132/2023 (Reforma Tributária sobre o Consumo)
 */
export function verifySimplesEnquadramento(
  rbt12: number,
  monthlyRevenue: number,
  anexo: AnexoType,
  businessSegment?: string,
  factorRData?: { factorRPct: number; isAnexo3Eligible: boolean }
): SimplesEnquadramento {
  const annualizedRevenue = rbt12 > 0 ? rbt12 : monthlyRevenue * 12;
  const limiteMaximo = 4800000;
  const sublimite = 3600000;
  const limiteME = 360000;

  const percentualLimiteUsado = (annualizedRevenue / limiteMaximo) * 100;
  const percentualSublimiteUsado = (annualizedRevenue / sublimite) * 100;
  const exceededSublimite = annualizedRevenue > sublimite && annualizedRevenue <= limiteMaximo;
  const exceededLimiteMaximo = annualizedRevenue > limiteMaximo;

  let status: EnquadramentoStatus = 'enquadrado_total';
  let isEligibleForSimples = true;
  let porte: 'ME' | 'EPP' | 'MEDIO_GRANDE' = 'ME';
  let porteLabel = 'Microempresa (ME)';

  if (annualizedRevenue <= limiteME) {
    porte = 'ME';
    porteLabel = 'Microempresa (ME) — Faturamento até R$ 360 mil/ano';
    status = 'enquadrado_total';
  } else if (annualizedRevenue <= sublimite) {
    porte = 'EPP';
    porteLabel = 'Empresa de Pequeno Porte (EPP) — Faturamento até R$ 3,6 milhões/ano';
    status = 'enquadrado_total';
  } else if (annualizedRevenue <= limiteMaximo) {
    porte = 'EPP';
    porteLabel = 'Empresa de Pequeno Porte (EPP) — Faixa de Sublimite (R$ 3,6M a R$ 4,8M)';
    status = 'sublimite_excedido';
  } else {
    porte = 'MEDIO_GRANDE';
    porteLabel = 'Empresa de Médio/Grande Porte — Faturamento acima de R$ 4,8 milhões/ano';
    status = 'desenquadrado_receita';
    isEligibleForSimples = false;
  }

  // Análise de Atividade / Anexo
  let anexoName = 'Anexo I — Comércio';
  let anexoDescription = 'Revenda de mercadorias no atacado ou varejo.';
  let hasFactorR = false;
  let factorRStatus = 'Não aplicável para este anexo.';
  let hasExternalCpp = false;
  let legalBasis = 'LC nº 123/2006, Art. 18 e LC nº 214/2025';
  let activityNotes = 'Atividade permitida para adesão ao Simples Nacional.';

  if (anexo === 'anexo_1') {
    anexoName = 'Anexo I — Comércio';
    anexoDescription = 'Comércio varejista e atacadista de mercadorias.';
    activityNotes = 'Atividade plenamente enquadrável no Simples Nacional. Permite segregação de PIS/COFINS monofásicos e ICMS-ST.';
  } else if (anexo === 'anexo_2') {
    anexoName = 'Anexo II — Indústria';
    anexoDescription = 'Transformação industrial, manufatura e fabricação de produtos.';
    activityNotes = 'Atividade enquadrável no Simples Nacional, incluindo microcervejarias e indústrias de transformação (LC 155/2016 e LC 214/2025).';
  } else if (anexo === 'anexo_3') {
    anexoName = 'Anexo III — Serviços Gerais & Manutenção';
    anexoDescription = 'Serviços de instalação, manutenção, reparos, agências e transporte municipal.';
    activityNotes = 'Tributação simplificada com CPP inclusa no DAS. Alíquotas nominais a partir de 6%.';
  } else if (anexo === 'anexo_4') {
    anexoName = 'Anexo IV — Obras, Construção & Advocacia';
    anexoDescription = 'Construção civil, obras de engenharia, vigilância, limpeza e serviços advocatícios.';
    hasExternalCpp = true;
    activityNotes = 'Atenção: CPP não está inclusa no DAS. O INSS Patronal (~28,8%) é recolhido por fora via DCTFWeb/GPS (LC 123/06 art. 18, § 5º-C e LC 214/2025).';
    legalBasis = 'LC nº 123/2006, Art. 18, § 5º-C e LC nº 214/2025';
  } else if (anexo === 'anexo_5') {
    anexoName = 'Anexo V — Serviços Intelectuais, TI & Engenharia (Fator R)';
    anexoDescription = 'Tecnologia da Informação, engenharia, consultorias, perícias e serviços intelectuais.';
    hasFactorR = true;
    const fRPct = factorRData?.factorRPct || 0;
    const isEligibleFatorR = factorRData?.isAnexo3Eligible || false;
    factorRStatus = isEligibleFatorR
      ? `Fator R atingido (${fRPct.toFixed(1)}% ≥ 28%): Enquadramento migrado com sucesso para o Anexo III (alíquota a partir de 6%).`
      : `Fator R insuficiente (${fRPct.toFixed(1)}% < 28%): Tributado no Anexo V (alíquota a partir de 15,50%). Aumentar folha ou pró-labore pode reduzir o imposto.`;
    activityNotes = isEligibleFatorR
      ? 'Fator R ativado! Benefício fiscal do Anexo III aplicado conforme LC 123/06 art. 18 § 5º-J/M e LC 214/2025.'
      : 'Tributação pelo Anexo V. Recomenda-se simular ajuste de pró-labore para atingir 28% e migrar ao Anexo III.';
    legalBasis = 'LC nº 123/2006, Art. 18, § 5º-J/M e LC nº 214/2025';
  }

  // Status badges & notices
  let statusBadge: SimplesEnquadramento['statusBadge'] = {
    label: '100% Enquadrado no Simples',
    variant: 'success',
    title: 'Regular e Totalmente Enquadrado no Simples Nacional',
    description: 'Faturamento dentro do limite nacional e do sublimite estadual. Tributação unificada no DAS (ou híbrido com IBS/CBS por fora conforme LC 214/2025).',
  };

  let sublimiteNotice: string | undefined;
  let limiteMaximoNotice: string | undefined;

  if (status === 'sublimite_excedido') {
    statusBadge = {
      label: 'Excesso de Sublimite Estadual (R$ 3,6M)',
      variant: 'warning',
      title: 'Sublimite Estadual Excedido (LC 123/06 arts. 19/20 & LC 214/2025)',
      description: 'Faturamento anual entre R$ 3,6M e R$ 4,8M. Os tributos federais (IRPJ, CSLL, PIS, COFINS, CPP) continuam no DAS, mas o ICMS e o ISS (e IBS) são recolhidos por fora em guias estaduais/municipais normais.',
    };
    sublimiteNotice = `Receita anual de R$ ${annualizedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ultrapassa o sublimite de R$ 3.600.000,00. Conforme os Arts. 19 e 20 da LC 123/2006 e diretrizes da LC 214/2025, o ICMS estadual e o ISS municipal devem ser apurados e recolhidos fora do Simples Nacional em guias estaduais/municipais normais.`;
  } else if (status === 'desenquadrado_receita') {
    statusBadge = {
      label: 'Desenquadrado do Simples Nacional (> R$ 4,8M)',
      variant: 'danger',
      title: 'Limite Máximo Anual Ultrapassado (LC 123/06 art. 3º, II & LC 214/2025)',
      description: 'Faturamento anual superior a R$ 4.800.000,00. A empresa é impedida por lei de permanecer no Simples Nacional e deve obrigatoriamente optar pelo Lucro Presumido ou Lucro Real.',
    };
    limiteMaximoNotice = `Receita anual de R$ ${annualizedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} excede o teto máximo de R$ 4.800.000,00 fixado pelo Art. 3º, inciso II da Lei Complementar nº 123/2006 e pela Lei Complementar nº 214/2025. O enquadramento no Simples Nacional é legalmente vedado, devendo a empresa migrar para o Lucro Presumido ou Lucro Real.`;
  }

  return {
    status,
    isEligibleForSimples,
    porte,
    porteLabel,
    rbt12: annualizedRevenue,
    monthlyRevenue,
    annualizedRevenue,
    limiteMaximo,
    sublimite,
    percentualLimiteUsado: Math.min(100, percentualLimiteUsado),
    percentualSublimiteUsado: Math.min(100, percentualSublimiteUsado),
    exceededSublimite,
    exceededLimiteMaximo,
    statusBadge,
    sublimiteNotice,
    limiteMaximoNotice,
    activityEligibility: {
      anexo,
      isAllowed: true,
      anexoName,
      anexoDescription,
      hasFactorR,
      factorRStatus,
      hasExternalCpp,
      legalBasis,
      activityNotes,
    },
    legalReferences: {
      leiComplementarSimples: 'Lei Complementar nº 214/2025 & Lei Complementar nº 123/2006',
      reformaConstitucional: 'Emenda Constitucional nº 132/2023',
      regulamentacaoIbsCbs: 'Lei Complementar nº 214/2025 (Regulamentação do IBS, CBS e Simples)',
      artigoEnquadramento: 'Art. 3º, II e Arts. 18, 19 e 20 da LC 123/2006 c/c LC 214/2025',
    },
  };
}

export function getBracketAndEffectiveRate(rbt12: number, anexo: AnexoType) {
  const table = ANEXO_TABLES[anexo];
  const effectiveRbt12 = Math.max(rbt12, 1000);

  let selectedBracket = table[0];
  for (const bracket of table) {
    if (effectiveRbt12 > bracket.limitMin) {
      selectedBracket = bracket;
    }
  }

  // Alíquota Efetiva do Simples Nacional (LC 123/2006 e LC 214/2025): [(RBT12 * Alíquota Nominal) - Parcela a Deduzir] / RBT12
  const effectiveRate = Math.max(
    0.04,
    (effectiveRbt12 * selectedBracket.nominalRate - selectedBracket.deduction) / effectiveRbt12
  );

  return {
    bracket: selectedBracket,
    effectiveRate,
  };
}

export function runFullTaxSimulation(input: CompanyInput): SimulationSummary {
  const {
    monthlyRevenue,
    rbt12,
    monthlyPayroll,
    monthlyProLabore,
    monthlyPurchasesInputs,
    creditEligibilityPct,
    b2bPercentage,
    b2bDisputeDiscountPct,
    lucroRealMarginPct,
    monofasicoPisCofinsPercentage = 0,
    icmsStPercentage = 0,
    isSelectiveTaxApplicable = false,
    healthDiscountRatePct = 60,
    businessSegment = 'geral',
    simulationYear = '2027_transicao',
    cbsRate2027 = 0.9,
    ibsRate2027 = 0.1,
    fullCbsIbsRate = 26.5,
    useCustomIbsCbsRate = false,
    customCbsRatePct = 8.8,
    customIbsRatePct = 17.7,
  } = input;

  const totalPayroll = monthlyPayroll + monthlyProLabore;
  const considerB2BCompetitiveFactor = input.considerB2BCompetitiveFactor !== false;
  const factorRData = calculateFatorR(monthlyRevenue, monthlyPayroll, monthlyProLabore, rbt12);

  // Verificação de Enquadramento no Simples Nacional pela Atividade e Faturamento Total (LC 214/2025 & LC 123/2006)
  const simplesEnquadramento = verifySimplesEnquadramento(
    rbt12,
    monthlyRevenue,
    input.anexo,
    businessSegment,
    factorRData
  );

  // Determina o anexo efetivo aplicado para o Simples:
  let effectiveAnexo = input.anexo;
  let factorREligible = false;
  if (input.anexo === 'anexo_5' && factorRData.isAnexo3Eligible) {
    effectiveAnexo = 'anexo_3';
    factorREligible = true;
  }

  const { bracket, effectiveRate: simplesEffectiveRate } = getBracketAndEffectiveRate(rbt12, effectiveAnexo);

  // Determinação das Alíquotas de CBS e IBS (Sugeridas vs Personalizadas)
  let rawCbsRate = 0;
  let rawIbsRate = 0;

  if (useCustomIbsCbsRate) {
    rawCbsRate = (customCbsRatePct || 0) / 100;
    rawIbsRate = (customIbsRatePct || 0) / 100;
  } else if (simulationYear === '2027_transicao') {
    rawCbsRate = (cbsRate2027 || 0.9) / 100;
    rawIbsRate = (ibsRate2027 || 0.1) / 100;
  } else {
    // Alíquota Plena 2033 (Padrão 26.5% - CBS 8.8% + IBS 17.7%)
    const fullRate = fullCbsIbsRate || 26.5;
    rawCbsRate = (fullRate * 0.35) / 100;
    rawIbsRate = (fullRate * 0.65) / 100;
  }

  // Redução de alíquota do IVA Dual para o setor de Saúde / Medicamentos (Farmácias) - Art. 9º EC 132/2023
  let healthReductionFactor = 1.0;
  if (businessSegment === 'farmacia' && healthDiscountRatePct > 0) {
    healthReductionFactor = 1.0 - (healthDiscountRatePct / 100);
  }
  const effectiveCbsRate = rawCbsRate * healthReductionFactor;
  const effectiveIbsRate = rawIbsRate * healthReductionFactor;
  const standardIbsCbsRate = rawCbsRate + rawIbsRate;
  const totalAppliedIbsCbsRate = effectiveCbsRate + effectiveIbsRate;

  // =========================================================================
  // PROCESSAMENTO DE COMPRAS (CRÉDITOS DE IBS/CBS) - PADRÃO VS RATEIO PERSONALIZADO
  // =========================================================================
  const purchasesReductionMode = input.purchasesReductionMode || 'padrao_segmento';
  const purchasesBreakdown = input.purchasesBreakdown || {
    fullTax: input.monthlyPurchasesInputs,
    reduction30: 0,
    reduction50: 0,
    reduction60: 0,
    reduction70: 0,
    reduction100: 0,
  };

  let effectiveMonthlyPurchases = input.monthlyPurchasesInputs;
  let ibsCbsEligibleCredits = 0;
  let purchasesWeightedCreditRatePct = 0;
  let purchasesTiersSummary = {
    fullTax: { amount: effectiveMonthlyPurchases, credit: 0, factor: 1.0 },
    reduction30: { amount: 0, credit: 0, factor: 0.70 },
    reduction50: { amount: 0, credit: 0, factor: 0.50 },
    reduction60: { amount: 0, credit: 0, factor: 0.40 },
    reduction70: { amount: 0, credit: 0, factor: 0.30 },
    reduction100: { amount: 0, credit: 0, factor: 0.0 },
  };

  if (purchasesReductionMode === 'rateio_personalizado') {
    const cFull = purchasesBreakdown.fullTax || 0;
    const c30 = purchasesBreakdown.reduction30 || 0;
    const c50 = purchasesBreakdown.reduction50 || 0;
    const c60 = purchasesBreakdown.reduction60 || 0;
    const c70 = purchasesBreakdown.reduction70 || 0;
    const c100 = purchasesBreakdown.reduction100 || 0;

    const sumPurchasesBreakdown = cFull + c30 + c50 + c60 + c70 + c100;
    if (sumPurchasesBreakdown > 0) {
      effectiveMonthlyPurchases = sumPurchasesBreakdown;
    }

    const credFull = cFull * standardIbsCbsRate * 1.0;
    const cred30 = c30 * standardIbsCbsRate * 0.70;
    const cred50 = c50 * standardIbsCbsRate * 0.50;
    const cred60 = c60 * standardIbsCbsRate * 0.40;
    const cred70 = c70 * standardIbsCbsRate * 0.30;
    const cred100 = c100 * standardIbsCbsRate * 0.0;

    const totalRawCredits = credFull + cred30 + cred50 + cred60 + cred70 + cred100;
    ibsCbsEligibleCredits = totalRawCredits * (creditEligibilityPct / 100);

    purchasesTiersSummary = {
      fullTax: { amount: cFull, credit: credFull * (creditEligibilityPct / 100), factor: 1.0 },
      reduction30: { amount: c30, credit: cred30 * (creditEligibilityPct / 100), factor: 0.70 },
      reduction50: { amount: c50, credit: cred50 * (creditEligibilityPct / 100), factor: 0.50 },
      reduction60: { amount: c60, credit: cred60 * (creditEligibilityPct / 100), factor: 0.40 },
      reduction70: { amount: c70, credit: cred70 * (creditEligibilityPct / 100), factor: 0.30 },
      reduction100: { amount: c100, credit: 0, factor: 0.0 },
    };

    purchasesWeightedCreditRatePct = effectiveMonthlyPurchases > 0 
      ? (totalRawCredits / effectiveMonthlyPurchases) * 100 
      : standardIbsCbsRate * 100;
  } else {
    // Modo Padrão por Segmento
    const eligiblePurchases = effectiveMonthlyPurchases * (creditEligibilityPct / 100);
    ibsCbsEligibleCredits = eligiblePurchases * totalAppliedIbsCbsRate;
    purchasesWeightedCreditRatePct = totalAppliedIbsCbsRate * 100;
    purchasesTiersSummary = {
      fullTax: { amount: effectiveMonthlyPurchases, credit: ibsCbsEligibleCredits, factor: healthReductionFactor },
      reduction30: { amount: 0, credit: 0, factor: 0.70 },
      reduction50: { amount: 0, credit: 0, factor: 0.50 },
      reduction60: { amount: 0, credit: 0, factor: 0.40 },
      reduction70: { amount: 0, credit: 0, factor: 0.30 },
      reduction100: { amount: 0, credit: 0, factor: 0.0 },
    };
  }

  // =========================================================================
  // PROCESSAMENTO DE VENDAS (DÉBITOS DE IBS/CBS) - PADRÃO VS RATEIO PERSONALIZADO
  // =========================================================================
  const salesReductionMode = input.salesReductionMode || 'padrao_segmento';
  const salesBreakdown = input.salesBreakdown || {
    fullTax: input.monthlyRevenue,
    reduction30: 0,
    reduction50: 0,
    reduction60: 0,
    reduction70: 0,
    reduction100: 0,
  };

  // =========================================================================
  // SEGREGAÇÃO E COMPOSIÇÃO DE RECEITAS POR ANEXO (LC 123/2006 E LEI 9.249/1995)
  // =========================================================================
  const anexoRevs = input.anexoRevenues || {};
  const hasExplicitAnexoRevs = Object.values(anexoRevs).some((v) => (v ?? 0) > 0);

  let rev1 = anexoRevs.anexo_1 ?? 0;
  let rev2 = anexoRevs.anexo_2 ?? 0;
  let rev3 = anexoRevs.anexo_3 ?? 0;
  let rev3_sem_iss = anexoRevs.anexo_3_sem_iss ?? 0;
  let rev4 = anexoRevs.anexo_4 ?? 0;
  let rev4_sem_iss = anexoRevs.anexo_4_sem_iss ?? 0;
  let rev5 = anexoRevs.anexo_5 ?? 0;

  if (!hasExplicitAnexoRevs) {
    if (input.isRevenueSegregated) {
      const sRev = input.salesRevenueMonthly ?? 0;
      const servRev = input.servicesRevenueMonthly ?? 0;
      const salesAnexo = input.salesAnexo || 'anexo_1';
      const servicesAnexo = input.servicesAnexo || 'anexo_3';
      
      if (salesAnexo === 'anexo_2') rev2 = sRev;
      else rev1 = sRev;

      if (servicesAnexo === 'anexo_4') rev4 = servRev;
      else if (servicesAnexo === 'anexo_5') rev5 = servRev;
      else rev3 = servRev;
    } else {
      const mRev = input.monthlyRevenue || 0;
      if (input.anexo === 'anexo_2') rev2 = mRev;
      else if (input.anexo === 'anexo_3') rev3 = mRev;
      else if (input.anexo === 'anexo_4') rev4 = mRev;
      else if (input.anexo === 'anexo_5') rev5 = mRev;
      else rev1 = mRev;
    }
  }

  const sumAnexoRevenues = rev1 + rev2 + rev3 + rev3_sem_iss + rev4 + rev4_sem_iss + rev5;
  let effectiveMonthlyRevenue = sumAnexoRevenues > 0 ? sumAnexoRevenues : input.monthlyRevenue;
  const isRevenueSegregated = (rev1 + rev2 > 0 && (rev3 + rev3_sem_iss + rev4 + rev4_sem_iss + rev5) > 0) || Boolean(input.isRevenueSegregated);

  let ibsCbsGrossDebit = 0;
  let effectiveAppliedSalesIbsCbsRate = totalAppliedIbsCbsRate;
  let salesWeightedDebitRatePct = 0;
  let salesTiersSummary = {
    fullTax: { amount: effectiveMonthlyRevenue, debit: 0, factor: 1.0 },
    reduction30: { amount: 0, debit: 0, factor: 0.70 },
    reduction50: { amount: 0, debit: 0, factor: 0.50 },
    reduction60: { amount: 0, debit: 0, factor: 0.40 },
    reduction70: { amount: 0, debit: 0, factor: 0.30 },
    reduction100: { amount: 0, debit: 0, factor: 0.0 },
  };

  if (salesReductionMode === 'rateio_personalizado') {
    const vFull = salesBreakdown.fullTax || 0;
    const v30 = salesBreakdown.reduction30 || 0;
    const v50 = salesBreakdown.reduction50 || 0;
    const v60 = salesBreakdown.reduction60 || 0;
    const v70 = salesBreakdown.reduction70 || 0;
    const v100 = salesBreakdown.reduction100 || 0;

    const sumSalesBreakdown = vFull + v30 + v50 + v60 + v70 + v100;
    if (sumSalesBreakdown > 0) {
      effectiveMonthlyRevenue = sumSalesBreakdown;
    }

    const debFull = vFull * standardIbsCbsRate * 1.0;
    const deb30 = v30 * standardIbsCbsRate * 0.70;
    const deb50 = v50 * standardIbsCbsRate * 0.50;
    const deb60 = v60 * standardIbsCbsRate * 0.40;
    const deb70 = v70 * standardIbsCbsRate * 0.30;
    const deb100 = v100 * standardIbsCbsRate * 0.0;

    ibsCbsGrossDebit = debFull + deb30 + deb50 + deb60 + deb70 + deb100;
    effectiveAppliedSalesIbsCbsRate = effectiveMonthlyRevenue > 0
      ? ibsCbsGrossDebit / effectiveMonthlyRevenue
      : totalAppliedIbsCbsRate;
    salesWeightedDebitRatePct = effectiveAppliedSalesIbsCbsRate * 100;

    salesTiersSummary = {
      fullTax: { amount: vFull, debit: debFull, factor: 1.0 },
      reduction30: { amount: v30, debit: deb30, factor: 0.70 },
      reduction50: { amount: v50, debit: deb50, factor: 0.50 },
      reduction60: { amount: v60, debit: deb60, factor: 0.40 },
      reduction70: { amount: v70, debit: deb70, factor: 0.30 },
      reduction100: { amount: v100, debit: 0, factor: 0.0 },
    };
  } else {
    // Modo Padrão por Segmento
    ibsCbsGrossDebit = effectiveMonthlyRevenue * totalAppliedIbsCbsRate;
    effectiveAppliedSalesIbsCbsRate = totalAppliedIbsCbsRate;
    salesWeightedDebitRatePct = totalAppliedIbsCbsRate * 100;
    salesTiersSummary = {
      fullTax: { amount: effectiveMonthlyRevenue, debit: ibsCbsGrossDebit, factor: healthReductionFactor },
      reduction30: { amount: 0, debit: 0, factor: 0.70 },
      reduction50: { amount: 0, debit: 0, factor: 0.50 },
      reduction60: { amount: 0, debit: 0, factor: 0.40 },
      reduction70: { amount: 0, debit: 0, factor: 0.30 },
      reduction100: { amount: 0, debit: 0, factor: 0.0 },
    };
  }

  const effectiveSalesRevenue = rev1 + rev2;
  const effectiveServicesRevenue = rev3 + rev3_sem_iss + rev4 + rev4_sem_iss + rev5;
  const totalCalculatedRevenue = effectiveMonthlyRevenue;

  const totalRevForRatio = totalCalculatedRevenue > 0 ? totalCalculatedRevenue : 1;
  const salesSharePct = (effectiveSalesRevenue / totalRevForRatio) * 100;
  const servicesSharePct = (effectiveServicesRevenue / totalRevForRatio) * 100;

  // Anexos do Simples aplicados para Vendas e Serviços
  const salesAnexoApplied = input.salesAnexo || (rev2 > 0 ? 'anexo_2' : (effectiveAnexo === 'anexo_2' ? 'anexo_2' : 'anexo_1'));
  const servicesAnexoApplied = input.servicesAnexo || ((rev4 + rev4_sem_iss) > 0 ? 'anexo_4' : (rev5 > 0 ? (factorRData.isAnexo3Eligible ? 'anexo_3' : 'anexo_5') : (effectiveAnexo === 'anexo_4' ? 'anexo_4' : (effectiveAnexo === 'anexo_5' ? (factorRData.isAnexo3Eligible ? 'anexo_3' : 'anexo_5') : 'anexo_3'))));

  // Tabelas e alíquotas efetivas para cada um dos anexos base
  const rateInfo1 = getBracketAndEffectiveRate(rbt12, 'anexo_1');
  const rateInfo2 = getBracketAndEffectiveRate(rbt12, 'anexo_2');
  const rateInfo3 = getBracketAndEffectiveRate(rbt12, 'anexo_3');
  const rateInfo4 = getBracketAndEffectiveRate(rbt12, 'anexo_4');
  const rateInfo5 = factorRData.isAnexo3Eligible
    ? getBracketAndEffectiveRate(rbt12, 'anexo_3')
    : getBracketAndEffectiveRate(rbt12, 'anexo_5');

  const { bracket: salesBracket, effectiveRate: salesEffectiveRate } = getBracketAndEffectiveRate(rbt12, salesAnexoApplied);
  const { bracket: servicesBracket, effectiveRate: servicesEffectiveRate } = getBracketAndEffectiveRate(rbt12, servicesAnexoApplied);

  // Imposto Seletivo (Reforma 2027) para bebidas alcoólicas e açucaradas
  const selectiveTaxRate = (businessSegment === 'bebidas' && isSelectiveTaxApplicable) ? 0.05 : 0;
  const selectiveTaxAmount = totalCalculatedRevenue * selectiveTaxRate;

  // Volume de vendas B2B e B2C
  const b2bRevenue = totalCalculatedRevenue * (b2bPercentage / 100);

  // Percentuais de segregação de Monofásico e ICMS-ST (incidem sobre a receita de mercadorias/vendas)
  const monofasicoRatio = Math.min(1, Math.max(0, monofasicoPisCofinsPercentage / 100));
  const icmsStRatio = Math.min(1, Math.max(0, icmsStPercentage / 100));

  // Custos Operacionais e Margem sem considerar impostos
  const monthlyOperationalCosts = totalPayroll + effectiveMonthlyPurchases + (input.otherDeductibleExpenses || 0);
  const profitBeforeTaxesMonthly = totalCalculatedRevenue - monthlyOperationalCosts;
  const profitMarginBeforeTaxesPct = totalCalculatedRevenue > 0 ? (profitBeforeTaxesMonthly / totalCalculatedRevenue) * 100 : 0;

  // -------------------------------------------------------------
  // 1. REGIME: SIMPLES NACIONAL SIMPLIFICADO (DAS Único por Anexo com Segregação Legal)
  // -------------------------------------------------------------
  let grossDasAmount = 0;
  let finalIrpj = 0;
  let finalCsll = 0;
  let finalCpp = 0;
  let finalPis = 0;
  let finalCofins = 0;
  let finalIcms = 0;
  let finalIss = 0;
  let finalIpi = 0;
  let totalDeductedPisCofins = 0;
  let deductedIcms = 0;
  let deductedIss = 0;

  // 1. Anexo I - Comércio
  if (rev1 > 0) {
    const gDas = rev1 * rateInfo1.effectiveRate;
    grossDasAmount += gDas;
    finalIrpj += gDas * rateInfo1.bracket.irpjShare;
    finalCsll += gDas * rateInfo1.bracket.csllShare;
    finalCpp += gDas * rateInfo1.bracket.cppShare;

    const pisTheo = gDas * rateInfo1.bracket.pisShare;
    const pisDed = pisTheo * monofasicoRatio;
    finalPis += (pisTheo - pisDed);

    const cofinsTheo = gDas * rateInfo1.bracket.cofinsShare;
    const cofinsDed = cofinsTheo * monofasicoRatio;
    finalCofins += (cofinsTheo - cofinsDed);
    totalDeductedPisCofins += (pisDed + cofinsDed);

    const icmsTheo = gDas * (rateInfo1.bracket.icmsShare || 0);
    const icmsDed = icmsTheo * icmsStRatio;
    finalIcms += (icmsTheo - icmsDed);
    deductedIcms += icmsDed;
  }

  // 2. Anexo II - Indústria
  if (rev2 > 0) {
    const gDas = rev2 * rateInfo2.effectiveRate;
    grossDasAmount += gDas;
    finalIrpj += gDas * rateInfo2.bracket.irpjShare;
    finalCsll += gDas * rateInfo2.bracket.csllShare;
    finalCpp += gDas * rateInfo2.bracket.cppShare;

    const pisTheo = gDas * rateInfo2.bracket.pisShare;
    const pisDed = pisTheo * monofasicoRatio;
    finalPis += (pisTheo - pisDed);

    const cofinsTheo = gDas * rateInfo2.bracket.cofinsShare;
    const cofinsDed = cofinsTheo * monofasicoRatio;
    finalCofins += (cofinsTheo - cofinsDed);
    totalDeductedPisCofins += (pisDed + cofinsDed);

    const icmsTheo = gDas * (rateInfo2.bracket.icmsShare || 0);
    const icmsDed = icmsTheo * icmsStRatio;
    finalIcms += (icmsTheo - icmsDed);
    deductedIcms += icmsDed;

    finalIpi += gDas * (rateInfo2.bracket.ipiShare || 0);
  }

  // 3. Anexo III - Serviços COM ISS
  if (rev3 > 0) {
    const gDas = rev3 * rateInfo3.effectiveRate;
    grossDasAmount += gDas;
    finalIrpj += gDas * rateInfo3.bracket.irpjShare;
    finalCsll += gDas * rateInfo3.bracket.csllShare;
    finalCpp += gDas * rateInfo3.bracket.cppShare;
    finalPis += gDas * rateInfo3.bracket.pisShare;
    finalCofins += gDas * rateInfo3.bracket.cofinsShare;
    finalIss += gDas * (rateInfo3.bracket.issShare || 0);
  }

  // 4. Anexo III - Serviços SEM ISS (Isenção, Imunidade, Exportação, Retenção)
  if (rev3_sem_iss > 0) {
    const gDas = rev3_sem_iss * rateInfo3.effectiveRate;
    grossDasAmount += gDas;
    finalIrpj += gDas * rateInfo3.bracket.irpjShare;
    finalCsll += gDas * rateInfo3.bracket.csllShare;
    finalCpp += gDas * rateInfo3.bracket.cppShare;
    finalPis += gDas * rateInfo3.bracket.pisShare;
    finalCofins += gDas * rateInfo3.bracket.cofinsShare;

    const issTheo = gDas * (rateInfo3.bracket.issShare || 0);
    deductedIss += issTheo; // Parcela de ISS é deduzida do DAS
  }

  // 5. Anexo IV - Obras / Limpeza / Advocacia COM ISS
  if (rev4 > 0) {
    const gDas = rev4 * rateInfo4.effectiveRate;
    grossDasAmount += gDas;
    finalIrpj += gDas * rateInfo4.bracket.irpjShare;
    finalCsll += gDas * rateInfo4.bracket.csllShare;
    // Anexo IV não inclui CPP no DAS
    finalPis += gDas * rateInfo4.bracket.pisShare;
    finalCofins += gDas * rateInfo4.bracket.cofinsShare;
    finalIss += gDas * (rateInfo4.bracket.issShare || 0);
  }

  // 6. Anexo IV - Obras & Serviços SEM ISS (Empreitadas com retenção de ISS)
  if (rev4_sem_iss > 0) {
    const gDas = rev4_sem_iss * rateInfo4.effectiveRate;
    grossDasAmount += gDas;
    finalIrpj += gDas * rateInfo4.bracket.irpjShare;
    finalCsll += gDas * rateInfo4.bracket.csllShare;
    // Anexo IV não inclui CPP no DAS
    finalPis += gDas * rateInfo4.bracket.pisShare;
    finalCofins += gDas * rateInfo4.bracket.cofinsShare;

    const issTheo = gDas * (rateInfo4.bracket.issShare || 0);
    deductedIss += issTheo; // Parcela de ISS é deduzida do DAS
  }

  // 7. Anexo V - TI / Consultoria / Intelectuais (Fator R)
  if (rev5 > 0) {
    const gDas = rev5 * rateInfo5.effectiveRate;
    grossDasAmount += gDas;
    finalIrpj += gDas * rateInfo5.bracket.irpjShare;
    finalCsll += gDas * rateInfo5.bracket.csllShare;
    finalCpp += gDas * rateInfo5.bracket.cppShare;
    finalPis += gDas * rateInfo5.bracket.pisShare;
    finalCofins += gDas * rateInfo5.bracket.cofinsShare;
    finalIss += gDas * (rateInfo5.bracket.issShare || 0);
  }

  const effectiveDasAmount = finalIrpj + finalCsll + finalCpp + finalPis + finalCofins + finalIcms + finalIss + finalIpi;

  const dasBreakdownSimplificado: DasBreakdown = {
    irpj: finalIrpj,
    csll: finalCsll,
    cofins: finalCofins,
    pis: finalPis,
    cpp: finalCpp,
    icms: finalIcms,
    iss: finalIss,
    ipi: finalIpi,
    totalDas: effectiveDasAmount,
    deductedPisCofins: totalDeductedPisCofins,
    deductedIcms: deductedIcms,
    deductedIss: deductedIss,
    grossDasBeforeSegregation: grossDasAmount,
  };

  // No Anexo IV, a CPP não está incluída no DAS (calculada à parte como ~28.8% de encargos patronais proporcionais à receita do Anexo IV).
  const anexo4Revenue = rev4 + rev4_sem_iss;
  const isAnexo4Active = anexo4Revenue > 0 || (effectiveAnexo === 'anexo_4');
  const anexo4Share = totalCalculatedRevenue > 0 ? (anexo4Revenue / totalCalculatedRevenue) : (isAnexo4Active ? 1 : 0);
  const inssPatronalSimplificado = isAnexo4Active ? totalPayroll * 0.20 * (anexo4Share > 0 ? anexo4Share : 1) : 0;
  const ratFapSimplificado = isAnexo4Active ? totalPayroll * 0.03 * (anexo4Share > 0 ? anexo4Share : 1) : 0;
  const terceirosSimplificado = isAnexo4Active ? totalPayroll * 0.058 * (anexo4Share > 0 ? anexo4Share : 1) : 0;
  const totalPayrollTaxesSimplificado = inssPatronalSimplificado + ratFapSimplificado + terceirosSimplificado;

  const totalDirectTaxSimplificado = effectiveDasAmount + totalPayrollTaxesSimplificado;

  // Crédito de IBS/CBS transferido ao cliente B2B no Simples Simplificado:
  const simplesCreditShareRate = totalCalculatedRevenue > 0
    ? ((finalPis + finalCofins + finalIcms + finalIss) / totalCalculatedRevenue)
    : (bracket.cofinsShare + bracket.pisShare + (bracket.icmsShare || 0) + (bracket.issShare || 0)) * simplesEffectiveRate;

  const b2bCreditTransferredSimplificado = b2bRevenue * simplesCreditShareRate;
  const b2bIdealCredit = b2bRevenue * effectiveAppliedSalesIbsCbsRate;
  const b2bCreditLossForClientSimplificado = Math.max(0, b2bIdealCredit - b2bCreditTransferredSimplificado);
  
  // Impacto comercial
  const commercialLossMonthlySimplificado = b2bCreditLossForClientSimplificado * (b2bDisputeDiscountPct / 100);

  // Economia gerada pela segregação legal (LC 123/2006)
  const segregationSavingsSimplificado: SegregationSavings = {
    monofasicoPisCofinsMonthly: totalDeductedPisCofins,
    monofasicoPisCofinsAnnual: totalDeductedPisCofins * 12,
    icmsStMonthly: deductedIcms,
    icmsStAnnual: deductedIcms * 12,
    issExemptMonthly: deductedIss,
    issExemptAnnual: deductedIss * 12,
    totalMonthly: totalDeductedPisCofins + deductedIcms + deductedIss,
    totalAnnual: (totalDeductedPisCofins + deductedIcms + deductedIss) * 12,
  };

  const resultSimplificado: RegimeResult = {
    regime: 'simples_simplificado',
    name: 'Simples Nacional Simplificado',
    description: isRevenueSegregated
      ? 'DAS unificado com segregação mista de Vendas (Comércio) e Serviços + deduções de Monofásico e ICMS-ST.'
      : 'DAS unificado com segregação legal de Monofásico (PIS/COFINS) e ICMS-ST (LC 123/2006).',
    das: dasBreakdownSimplificado,
    ibsCbs: {
      rateApplied: simplesCreditShareRate,
      cbsRateApplied: effectiveCbsRate,
      ibsRateApplied: effectiveIbsRate,
      grossDebit: grossDasAmount * (bracket.cofinsShare + bracket.pisShare),
      eligibleCredits: 0,
      netPayable: 0,
      creditTransferredToB2B: b2bCreditTransferredSimplificado,
      creditTransferRate: simplesCreditShareRate,
      selectiveTaxAmount: 0,
      healthReductionSavings: 0,
      isCustomRateApplied: useCustomIbsCbsRate,
      purchasesReductionMode,
      salesReductionMode,
      purchasesWeightedCreditRatePct,
      salesWeightedDebitRatePct,
      purchasesTiersSummary,
      salesTiersSummary,
    },
    payrollCharges: {
      inssPatronal: inssPatronalSimplificado,
      ratFap: ratFapSimplificado,
      terceiros: terceirosSimplificado,
      totalPayrollTaxes: totalPayrollTaxesSimplificado,
    },
    totalMonthlyTax: totalDirectTaxSimplificado,
    totalAnnualTax: totalDirectTaxSimplificado * 12,
    effectiveRatePct: (totalDirectTaxSimplificado / totalCalculatedRevenue) * 100,
    segregationSavings: segregationSavingsSimplificado,
    b2bCreditLossForClient: b2bCreditLossForClientSimplificado,
    b2bCompensationDiscountPct: b2bDisputeDiscountPct,
    estimatedCommercialLossMonthly: commercialLossMonthlySimplificado,
    totalAdjustedCostMonthly: totalDirectTaxSimplificado + commercialLossMonthlySimplificado,
    totalAdjustedCostAnnual: (totalDirectTaxSimplificado + commercialLossMonthlySimplificado) * 12,
    adjustedEffectiveRatePct: ((totalDirectTaxSimplificado + commercialLossMonthlySimplificado) / totalCalculatedRevenue) * 100,
    competitiveRecalculation: {
      isCompetitiveModeActive: Boolean(considerB2BCompetitiveFactor),
      nominalMonthlyTaxGuide: totalDirectTaxSimplificado,
      compensationDiscountMonthly: commercialLossMonthlySimplificado,
      effectiveTotalCostMonthly: totalDirectTaxSimplificado + commercialLossMonthlySimplificado,
      effectiveAdjustedRatePct: ((totalDirectTaxSimplificado + commercialLossMonthlySimplificado) / totalCalculatedRevenue) * 100,
      netInvoicedRevenueMonthly: Math.max(0, totalCalculatedRevenue - commercialLossMonthlySimplificado),
      recalculatedTaxGuideMonthly: totalCalculatedRevenue > 0
        ? Math.max(0, totalCalculatedRevenue - commercialLossMonthlySimplificado) * (totalDirectTaxSimplificado / totalCalculatedRevenue)
        : 0,
      taxBaseReductionSavings: totalCalculatedRevenue > 0
        ? totalDirectTaxSimplificado - (Math.max(0, totalCalculatedRevenue - commercialLossMonthlySimplificado) * (totalDirectTaxSimplificado / totalCalculatedRevenue))
        : 0,
      recalculatedEffectiveRatePct: totalCalculatedRevenue > 0
        ? ((Math.max(0, totalCalculatedRevenue - commercialLossMonthlySimplificado) * (totalDirectTaxSimplificado / totalCalculatedRevenue) + commercialLossMonthlySimplificado) / totalCalculatedRevenue) * 100
        : 0,
    },
    estimatedNetProfitMonthly: totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxSimplificado - commercialLossMonthlySimplificado,
    estimatedNetProfitAnnual: (totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxSimplificado - commercialLossMonthlySimplificado) * 12,
    profitMarginBeforeTaxesMonthly: profitBeforeTaxesMonthly,
    profitMarginBeforeTaxesPct: profitMarginBeforeTaxesPct,
    profitMarginAfterTaxesMonthly: totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxSimplificado - commercialLossMonthlySimplificado,
    profitMarginAfterTaxesPct: totalCalculatedRevenue > 0 ? ((totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxSimplificado - commercialLossMonthlySimplificado) / totalCalculatedRevenue) * 100 : 0,
    isSimplesIneligible: !simplesEnquadramento.isEligibleForSimples,
    ineligibilityReason: simplesEnquadramento.limiteMaximoNotice,
    hasSublimiteExceeded: simplesEnquadramento.exceededSublimite,
    audit: {
      bracketNumber: bracket.bracket,
      nominalRate: bracket.nominalRate,
      deductionValue: bracket.deduction,
      simplesEffectiveRate,
      factorR: factorRData.factorRPct,
      factorREligible,
      appliedAnexo: effectiveAnexo,
    },
    pros: [
      'Segregação legal de PIS/COFINS Monofásico e ICMS-ST reduz expressivamente a guia do DAS',
      !isAnexo4Active ? 'Isenção de INSS Patronal de 20% sobre a folha' : 'Alíquota inicial reduzida',
      'Ideal quando a maior parte das vendas é para Consumidor Final (B2C)',
      'Máxima agilidade operacional em guia única',
    ],
    cons: [
      'Crédito restrito de IBS/CBS para clientes PJs (B2B)',
      'Não aproveita créditos sobre compras de mercadorias e insumos',
      'Risco comercial na cadeia B2B se os clientes exigirem 100% de crédito',
    ],
  };

  // -------------------------------------------------------------
  // 2. REGIME: SIMPLES NACIONAL HÍBRIDO (IBS/CBS Fora do DAS)
  // -------------------------------------------------------------
  const dasHibridoAmount = finalIrpj + finalCsll + (isAnexo4Active ? 0 : finalCpp);

  const dasBreakdownHibrido: DasBreakdown = {
    irpj: finalIrpj,
    csll: finalCsll,
    cofins: 0,
    pis: 0,
    cpp: isAnexo4Active ? 0 : finalCpp,
    icms: 0,
    iss: 0,
    ipi: 0,
    totalDas: dasHibridoAmount,
    deductedPisCofins: finalPis + finalCofins + totalDeductedPisCofins,
    deductedIcms: finalIcms + finalIss + deductedIcms,
    grossDasBeforeSegregation: grossDasAmount,
  };

  // Saldo a recolher IBS/CBS
  const ibsCbsNetPayable = Math.max(0, ibsCbsGrossDebit - ibsCbsEligibleCredits) + selectiveTaxAmount;

  // Economia pela redução da alíquota de medicamentos/saúde ou rateio
  const standardIbsCbsDebit = totalCalculatedRevenue * standardIbsCbsRate;
  const healthReductionSavings = Math.max(0, standardIbsCbsDebit - ibsCbsGrossDebit);

  // Crédito gerado para o cliente B2B no Simples Híbrido
  const b2bCreditTransferredHibrido = b2bRevenue * effectiveAppliedSalesIbsCbsRate;

  const totalDirectTaxHibrido = dasHibridoAmount + ibsCbsNetPayable + totalPayrollTaxesSimplificado;

  const resultHibrido: RegimeResult = {
    regime: 'simples_hibrido',
    name: 'Simples Nacional Híbrido',
    description: 'DAS reduzido (IRPJ/CSLL/CPP) + IBS e CBS apurados por fora no regime não-cumulativo.',
    das: dasBreakdownHibrido,
    ibsCbs: {
      rateApplied: effectiveAppliedSalesIbsCbsRate,
      cbsRateApplied: effectiveCbsRate,
      ibsRateApplied: effectiveIbsRate,
      grossDebit: ibsCbsGrossDebit,
      eligibleCredits: ibsCbsEligibleCredits,
      netPayable: ibsCbsNetPayable,
      creditTransferredToB2B: b2bCreditTransferredHibrido,
      creditTransferRate: effectiveAppliedSalesIbsCbsRate,
      selectiveTaxAmount,
      healthReductionSavings,
      isCustomRateApplied: useCustomIbsCbsRate,
      purchasesReductionMode,
      salesReductionMode,
      purchasesWeightedCreditRatePct,
      salesWeightedDebitRatePct,
      purchasesTiersSummary,
      salesTiersSummary,
    },
    payrollCharges: {
      inssPatronal: inssPatronalSimplificado,
      ratFap: ratFapSimplificado,
      terceiros: terceirosSimplificado,
      totalPayrollTaxes: totalPayrollTaxesSimplificado,
    },
    totalMonthlyTax: totalDirectTaxHibrido,
    totalAnnualTax: totalDirectTaxHibrido * 12,
    effectiveRatePct: (totalDirectTaxHibrido / totalCalculatedRevenue) * 100,
    segregationSavings: segregationSavingsSimplificado,
    b2bCreditLossForClient: 0,
    b2bCompensationDiscountPct: 0,
    estimatedCommercialLossMonthly: 0,
    totalAdjustedCostMonthly: totalDirectTaxHibrido,
    totalAdjustedCostAnnual: totalDirectTaxHibrido * 12,
    adjustedEffectiveRatePct: (totalDirectTaxHibrido / totalCalculatedRevenue) * 100,
    competitiveRecalculation: {
      isCompetitiveModeActive: Boolean(considerB2BCompetitiveFactor),
      nominalMonthlyTaxGuide: totalDirectTaxHibrido,
      compensationDiscountMonthly: 0,
      effectiveTotalCostMonthly: totalDirectTaxHibrido,
      effectiveAdjustedRatePct: (totalDirectTaxHibrido / totalCalculatedRevenue) * 100,
      netInvoicedRevenueMonthly: totalCalculatedRevenue,
      recalculatedTaxGuideMonthly: totalDirectTaxHibrido,
      taxBaseReductionSavings: 0,
      recalculatedEffectiveRatePct: (totalDirectTaxHibrido / totalCalculatedRevenue) * 100,
    },
    estimatedNetProfitMonthly: totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxHibrido,
    estimatedNetProfitAnnual: (totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxHibrido) * 12,
    profitMarginBeforeTaxesMonthly: profitBeforeTaxesMonthly,
    profitMarginBeforeTaxesPct: profitMarginBeforeTaxesPct,
    profitMarginAfterTaxesMonthly: totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxHibrido,
    profitMarginAfterTaxesPct: totalCalculatedRevenue > 0 ? ((totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxHibrido) / totalCalculatedRevenue) * 100 : 0,
    isSimplesIneligible: !simplesEnquadramento.isEligibleForSimples,
    ineligibilityReason: simplesEnquadramento.limiteMaximoNotice,
    hasSublimiteExceeded: simplesEnquadramento.exceededSublimite,
    audit: {
      bracketNumber: bracket.bracket,
      nominalRate: bracket.nominalRate,
      deductionValue: bracket.deduction,
      simplesEffectiveRate,
      factorR: factorRData.factorRPct,
      factorREligible,
      appliedAnexo: effectiveAnexo,
    },
    pros: [
      'Gera crédito integral de IBS e CBS para clientes B2B (Pessoas Jurídicas)',
      'Permite abater créditos tributários sobre insumos, compras de mercadorias e energia',
      !isAnexo4Active ? 'Mantém a isenção de INSS Patronal de 20% do Simples Nacional' : 'Mantém IRPJ e CSLL simplificados',
      businessSegment === 'farmacia' ? 'Aproveita redução de 60% da alíquota de CBS/IBS para medicamentos' : 'Blindagem comercial na cadeia de fornecimento',
    ],
    cons: [
      'Maior complexidade na escrituração fiscal de IBS/CBS',
      businessSegment === 'bebidas' && isSelectiveTaxApplicable ? 'Incidência de Imposto Seletivo nas bebidas' : 'Exige controle rigoroso de créditos de compras',
    ],
  };

  // -------------------------------------------------------------
  // 3. REGIME: LUCRO PRESUMIDO 2027 (LEI 9.249/1995, ARTS. 15 E 20)
  // -------------------------------------------------------------
  // Base de Presunção do IRPJ: 8% sobre Vendas (Comércio/Indústria) e 32% sobre Serviços (Lei 9.249/95 art. 15)
  const irpjPresumedBaseSales = effectiveSalesRevenue * 0.08;
  const irpjPresumedBaseServices = effectiveServicesRevenue * 0.32;
  const totalIrpjPresumedBase = irpjPresumedBaseSales + irpjPresumedBaseServices;

  // IRPJ: Alíquota básica de 15% + Adicional de 10% sobre o que exceder R$ 20.000/mês (R$ 60.000/trimestre)
  const irpjBaseRateAmount = totalIrpjPresumedBase * 0.15;
  const irpjAdicionalAmount = Math.max(0, (totalIrpjPresumedBase - 20000) * 0.10);
  const totalIRPJPresumido = irpjBaseRateAmount + irpjAdicionalAmount;

  // Base de Presunção da CSLL: 12% sobre Vendas (Comércio/Indústria) e 32% sobre Serviços (Lei 9.249/95 art. 20)
  const csllPresumedBaseSales = effectiveSalesRevenue * 0.12;
  const csllPresumedBaseServices = effectiveServicesRevenue * 0.32;
  const totalCsllPresumedBase = csllPresumedBaseSales + csllPresumedBaseServices;

  // CSLL: Alíquota de 9% sobre a base presumida
  const totalCsllAmount = totalCsllPresumedBase * 0.09;
  const totalCSLLPresumido = totalCsllAmount;

  // CPP Lucro Presumido: Encargos patronais de 28.8% sobre a folha total e pró-labore
  const inssPatronalPresumido = totalPayroll * 0.20;
  const ratFapPresumido = totalPayroll * 0.03;
  const terceirosPresumido = totalPayroll * 0.058;
  const totalPayrollTaxesPresumido = inssPatronalPresumido + ratFapPresumido + terceirosPresumido;

  // IBS e CBS no Lucro Presumido 2027
  const ibsCbsPresumidoNet = Math.max(0, ibsCbsGrossDebit - ibsCbsEligibleCredits) + selectiveTaxAmount;

  const totalDirectTaxPresumido = totalIRPJPresumido + totalCSLLPresumido + totalPayrollTaxesPresumido + ibsCbsPresumidoNet;

  const revenueSegregationAuditData = {
    isSegregated: isRevenueSegregated,
    anexoRevenues: {
      anexo_1: rev1,
      anexo_2: rev2,
      anexo_3: rev3,
      anexo_3_sem_iss: rev3_sem_iss,
      anexo_4: rev4,
      anexo_4_sem_iss: rev4_sem_iss,
      anexo_5: rev5,
    },
    salesRevenueMonthly: effectiveSalesRevenue,
    servicesRevenueMonthly: effectiveServicesRevenue,
    salesSharePct,
    servicesSharePct,
    salesAnexoApplied,
    servicesAnexoApplied,
    irpjPresumedBaseSales,
    irpjPresumedBaseServices,
    totalIrpjPresumedBase,
    csllPresumedBaseSales,
    csllPresumedBaseServices,
    totalCsllPresumedBase,
    irpjBaseRateAmount,
    irpjAdicionalAmount,
    totalIrpjAmount: totalIRPJPresumido,
    totalCsllAmount: totalCSLLPresumido,
  };

  const resultPresumido: RegimeResult = {
    regime: 'lucro_presumido',
    name: 'Lucro Presumido (2027)',
    description: isRevenueSegregated
      ? `Presunção segregada: Vendas (IRPJ 8% / CSLL 12%) e Serviços (IRPJ 32% / CSLL 32%) + IBS/CBS não-cumulativo.`
      : 'Margem presumida (IRPJ/CSLL) + IBS/CBS não-cumulativo + encargos de folha (28,8%).',
    das: {
      irpj: totalIRPJPresumido,
      csll: totalCSLLPresumido,
      cofins: 0,
      pis: 0,
      cpp: totalPayrollTaxesPresumido,
      icms: 0,
      iss: 0,
      ipi: 0,
      totalDas: totalIRPJPresumido + totalCSLLPresumido,
      deductedPisCofins: 0,
      deductedIcms: 0,
      grossDasBeforeSegregation: totalIRPJPresumido + totalCSLLPresumido,
    },
    ibsCbs: {
      rateApplied: effectiveAppliedSalesIbsCbsRate,
      cbsRateApplied: effectiveCbsRate,
      ibsRateApplied: effectiveIbsRate,
      grossDebit: ibsCbsGrossDebit,
      eligibleCredits: ibsCbsEligibleCredits,
      netPayable: ibsCbsPresumidoNet,
      creditTransferredToB2B: b2bRevenue * effectiveAppliedSalesIbsCbsRate,
      creditTransferRate: effectiveAppliedSalesIbsCbsRate,
      selectiveTaxAmount,
      healthReductionSavings,
      isCustomRateApplied: useCustomIbsCbsRate,
      purchasesReductionMode,
      salesReductionMode,
      purchasesWeightedCreditRatePct,
      salesWeightedDebitRatePct,
      purchasesTiersSummary,
      salesTiersSummary,
    },
    payrollCharges: {
      inssPatronal: inssPatronalPresumido,
      ratFap: ratFapPresumido,
      terceiros: terceirosPresumido,
      totalPayrollTaxes: totalPayrollTaxesPresumido,
    },
    totalMonthlyTax: totalDirectTaxPresumido,
    totalAnnualTax: totalDirectTaxPresumido * 12,
    effectiveRatePct: (totalDirectTaxPresumido / totalCalculatedRevenue) * 100,
    segregationSavings: segregationSavingsSimplificado,
    b2bCreditLossForClient: 0,
    b2bCompensationDiscountPct: 0,
    estimatedCommercialLossMonthly: 0,
    totalAdjustedCostMonthly: totalDirectTaxPresumido,
    totalAdjustedCostAnnual: totalDirectTaxPresumido * 12,
    adjustedEffectiveRatePct: (totalDirectTaxPresumido / totalCalculatedRevenue) * 100,
    competitiveRecalculation: {
      isCompetitiveModeActive: Boolean(considerB2BCompetitiveFactor),
      nominalMonthlyTaxGuide: totalDirectTaxPresumido,
      compensationDiscountMonthly: 0,
      effectiveTotalCostMonthly: totalDirectTaxPresumido,
      effectiveAdjustedRatePct: (totalDirectTaxPresumido / totalCalculatedRevenue) * 100,
      netInvoicedRevenueMonthly: totalCalculatedRevenue,
      recalculatedTaxGuideMonthly: totalDirectTaxPresumido,
      taxBaseReductionSavings: 0,
      recalculatedEffectiveRatePct: (totalDirectTaxPresumido / totalCalculatedRevenue) * 100,
    },
    estimatedNetProfitMonthly: totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxPresumido,
    estimatedNetProfitAnnual: (totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxPresumido) * 12,
    profitMarginBeforeTaxesMonthly: profitBeforeTaxesMonthly,
    profitMarginBeforeTaxesPct: profitMarginBeforeTaxesPct,
    profitMarginAfterTaxesMonthly: totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxPresumido,
    profitMarginAfterTaxesPct: totalCalculatedRevenue > 0 ? ((totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxPresumido) / totalCalculatedRevenue) * 100 : 0,
    audit: {
      bracketNumber: 0,
      nominalRate: totalCalculatedRevenue > 0 ? ((totalIRPJPresumido + totalCSLLPresumido) / totalCalculatedRevenue) * 100 : 0,
      deductionValue: 0,
      simplesEffectiveRate: 0,
      appliedAnexo: effectiveAnexo,
    },
    revenueSegregationAudit: revenueSegregationAuditData,
    pros: [
      'Gera crédito integral de IBS/CBS para clientes B2B',
      'Vantajoso quando a margem de lucro real é superior às bases de presunção legal (8%/12% vendas ou 32% serviços)',
      'Permite faturar acima do teto de R$ 4,8 milhões do Simples Nacional',
    ],
    cons: [
      'Encargos de INSS Patronal de ~28,8% sobre folha e pró-labore',
      'Adicional de 10% de IRPJ para lucro presumido total acima de R$ 20 mil/mês',
    ],
  };

  // -------------------------------------------------------------
  // 4. REGIME: LUCRO REAL 2027 (LEIS 9.249/95, 9.430/96 E RIR/2018 ARTS. 257-261 E 311)
  // -------------------------------------------------------------
  // DEDUÇÕES LEGAIS OPERACIONAIS DO LUCRO REAL:
  // 1. Custos dos Produtos Vendidos e Serviços Prestados (CPV/CMV/CSP): Compras de Mercadorias e Insumos
  const purchasesCost = effectiveMonthlyPurchases;
  // 2. Despesas com Pessoal (Salários CLT)
  const payrollSalaries = monthlyPayroll;
  // 3. Encargos Previdenciários e Sociais Patronais (28,8%)
  const payrollCharges = totalPayrollTaxesPresumido;
  // 4. Remuneração dos Administradores / Pró-labore
  const proLabore = monthlyProLabore;
  // 5. Outras Despesas Operacionais e Administrativas Dedutíveis (RIR/2018 art. 311)
  const otherDeductibleExpenses = Math.max(0, input.otherDeductibleExpenses || 0);

  // Total das Deduções Contábeis Operacionais
  const totalDeductibleCostsAndExpenses = purchasesCost + payrollSalaries + payrollCharges + proLabore + otherDeductibleExpenses;

  // Lucro Contábil antes do IRPJ e CSLL (LAIR)
  const accountingLair = totalCalculatedRevenue - totalDeductibleCostsAndExpenses;
  const isTaxLoss = accountingLair <= 0;

  // Método de Apuração do Lucro Real
  const lucroRealMethodUsed = input.lucroRealCalculationMethod || 'deducoes_reais';

  let taxableRealBase = 0;
  if (lucroRealMethodUsed === 'margem_estimada') {
    taxableRealBase = Math.max(0, totalCalculatedRevenue * ((lucroRealMarginPct || 15) / 100));
  } else {
    // Apuração Contábil Legal: se houver prejuízo fiscal (LAIR <= 0), a base é zero e não há IRPJ nem CSLL
    taxableRealBase = Math.max(0, accountingLair);
  }

  // IRPJ no Lucro Real: 15% sobre a base real tributável + adicional de 10% sobre o que exceder R$ 20.000/mês
  const irpjRealBaseAmount = taxableRealBase * 0.15;
  const irpjRealAdicionalAmount = Math.max(0, (taxableRealBase - 20000) * 0.10);
  const totalIRPJReal = irpjRealBaseAmount + irpjRealAdicionalAmount;

  // CSLL no Lucro Real: 9% sobre a base real tributável
  const totalCSLLReal = taxableRealBase * 0.09;

  const totalDirectTaxReal = totalIRPJReal + totalCSLLReal + totalPayrollTaxesPresumido + ibsCbsPresumidoNet;

  const lucroRealAuditData = {
    methodUsed: lucroRealMethodUsed,
    grossRevenue: totalCalculatedRevenue,
    purchasesCost,
    payrollSalaries,
    payrollCharges,
    proLabore,
    otherDeductibleExpenses,
    totalDeductibleCostsAndExpenses,
    accountingLair,
    isTaxLoss,
    taxableRealBase,
    irpjBaseRateAmount: taxableRealBase <= 0 ? 0 : irpjRealBaseAmount,
    irpjAdicionalAmount: taxableRealBase <= 0 ? 0 : irpjRealAdicionalAmount,
    totalIrpjAmount: totalIRPJReal,
    totalCsllAmount: totalCSLLReal,
  };

  const resultReal: RegimeResult = {
    regime: 'lucro_real',
    name: 'Lucro Real (2027)',
    description: isTaxLoss && lucroRealMethodUsed === 'deducoes_reais'
      ? 'Prejuízo Fiscal Contábil apurado: IRPJ e CSLL zerados (RIR/2018) + IBS/CBS não-cumulativo.'
      : 'Tributação sobre o lucro líquido contábil efetivo (LAIR) com deduções legais + IBS/CBS não-cumulativo.',
    das: {
      irpj: totalIRPJReal,
      csll: totalCSLLReal,
      cofins: 0,
      pis: 0,
      cpp: totalPayrollTaxesPresumido,
      icms: 0,
      iss: 0,
      ipi: 0,
      totalDas: totalIRPJReal + totalCSLLReal,
      deductedPisCofins: 0,
      deductedIcms: 0,
      grossDasBeforeSegregation: totalIRPJReal + totalCSLLReal,
    },
    ibsCbs: {
      rateApplied: effectiveAppliedSalesIbsCbsRate,
      cbsRateApplied: effectiveCbsRate,
      ibsRateApplied: effectiveIbsRate,
      grossDebit: ibsCbsGrossDebit,
      eligibleCredits: ibsCbsEligibleCredits,
      netPayable: ibsCbsPresumidoNet,
      creditTransferredToB2B: b2bRevenue * effectiveAppliedSalesIbsCbsRate,
      creditTransferRate: effectiveAppliedSalesIbsCbsRate,
      selectiveTaxAmount,
      healthReductionSavings,
      isCustomRateApplied: useCustomIbsCbsRate,
      purchasesReductionMode,
      salesReductionMode,
      purchasesWeightedCreditRatePct,
      salesWeightedDebitRatePct,
      purchasesTiersSummary,
      salesTiersSummary,
    },
    payrollCharges: {
      inssPatronal: inssPatronalPresumido,
      ratFap: ratFapPresumido,
      terceiros: terceirosPresumido,
      totalPayrollTaxes: totalPayrollTaxesPresumido,
    },
    totalMonthlyTax: totalDirectTaxReal,
    totalAnnualTax: totalDirectTaxReal * 12,
    effectiveRatePct: (totalDirectTaxReal / totalCalculatedRevenue) * 100,
    segregationSavings: segregationSavingsSimplificado,
    b2bCreditLossForClient: 0,
    b2bCompensationDiscountPct: 0,
    estimatedCommercialLossMonthly: 0,
    totalAdjustedCostMonthly: totalDirectTaxReal,
    totalAdjustedCostAnnual: totalDirectTaxReal * 12,
    adjustedEffectiveRatePct: (totalDirectTaxReal / totalCalculatedRevenue) * 100,
    competitiveRecalculation: {
      isCompetitiveModeActive: Boolean(considerB2BCompetitiveFactor),
      nominalMonthlyTaxGuide: totalDirectTaxReal,
      compensationDiscountMonthly: 0,
      effectiveTotalCostMonthly: totalDirectTaxReal,
      effectiveAdjustedRatePct: (totalDirectTaxReal / totalCalculatedRevenue) * 100,
      netInvoicedRevenueMonthly: totalCalculatedRevenue,
      recalculatedTaxGuideMonthly: totalDirectTaxReal,
      taxBaseReductionSavings: 0,
      recalculatedEffectiveRatePct: (totalDirectTaxReal / totalCalculatedRevenue) * 100,
    },
    estimatedNetProfitMonthly: totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxReal,
    estimatedNetProfitAnnual: (totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxReal) * 12,
    profitMarginBeforeTaxesMonthly: profitBeforeTaxesMonthly,
    profitMarginBeforeTaxesPct: profitMarginBeforeTaxesPct,
    profitMarginAfterTaxesMonthly: totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxReal,
    profitMarginAfterTaxesPct: totalCalculatedRevenue > 0 ? ((totalCalculatedRevenue - totalPayroll - effectiveMonthlyPurchases - (input.otherDeductibleExpenses || 0) - totalDirectTaxReal) / totalCalculatedRevenue) * 100 : 0,
    audit: {
      bracketNumber: 0,
      nominalRate: totalCalculatedRevenue > 0 ? ((totalIRPJReal + totalCSLLReal) / totalCalculatedRevenue) * 100 : 0,
      deductionValue: 0,
      simplesEffectiveRate: 0,
      appliedAnexo: effectiveAnexo,
    },
    revenueSegregationAudit: revenueSegregationAuditData,
    lucroRealAudit: lucroRealAuditData,
    pros: [
      isTaxLoss && lucroRealMethodUsed === 'deducoes_reais'
        ? 'Deduções operacionais superam a receita: IRPJ e CSLL zerados no período'
        : 'Se houver margem baixa ou prejuízo fiscal, não há incidência de IRPJ e CSLL',
      'Crédito integral de IBS/CBS aos clientes B2B',
      'Permite abater todas as despesas dedutíveis (insumos, pessoal, encargos e despesas operacionais)',
      'Possibilidade de compensação de prejuízos fiscais acumulados',
    ],
    cons: [
      'Exige contabilidade rigorosa (LALUR, ECD/ECF) e alto custo de compliance',
      'INSS Patronal de ~28,8% sobre folha e pró-labore',
    ],
  };

  const results: Record<RegimeType, RegimeResult> = {
    simples_simplificado: resultSimplificado,
    simples_hibrido: resultHibrido,
    lucro_presumido: resultPresumido,
    lucro_real: resultReal,
  };

  const regimeList = Object.values(results);
  // Se desenquadrado do Simples (> R$ 4,8M), os regimes do Simples não podem ser selecionados como o melhor regime
  const eligibleRegimeList = simplesEnquadramento.isEligibleForSimples
    ? regimeList
    : regimeList.filter((r) => r.regime === 'lucro_presumido' || r.regime === 'lucro_real');

  const sortedByDirectTax = [...eligibleRegimeList].sort((a, b) => a.totalMonthlyTax - b.totalMonthlyTax);
  const sortedByAdjustedCost = [...eligibleRegimeList].sort((a, b) => a.totalAdjustedCostMonthly - b.totalAdjustedCostMonthly);

  const bestDirectRegime = sortedByDirectTax[0].regime;
  const bestCommercialRegime = sortedByAdjustedCost[0].regime;
  const bestRegime = considerB2BCompetitiveFactor ? bestCommercialRegime : bestDirectRegime;

  const worstCost = considerB2BCompetitiveFactor
    ? Math.max(...eligibleRegimeList.map((r) => r.totalAdjustedCostMonthly))
    : Math.max(...eligibleRegimeList.map((r) => r.totalMonthlyTax));
  const bestCost = considerB2BCompetitiveFactor
    ? sortedByAdjustedCost[0].totalAdjustedCostMonthly
    : sortedByDirectTax[0].totalMonthlyTax;

  const monthlySavings = Math.max(0, worstCost - bestCost);
  const annualSavings = monthlySavings * 12;

  let potentialAnnualTaxSavingsWithFactorR = 0;
  if (input.anexo === 'anexo_5' && !factorRData.isAnexo3Eligible) {
    const { effectiveRate: anexo3Rate } = getBracketAndEffectiveRate(rbt12, 'anexo_3');
    const anexo5MonthlyTax = monthlyRevenue * simplesEffectiveRate;
    const anexo3MonthlyTax = monthlyRevenue * anexo3Rate;
    potentialAnnualTaxSavingsWithFactorR = Math.max(0, (anexo5MonthlyTax - anexo3MonthlyTax) * 12);
  }

  const hasMonofasicoOrSt = monofasicoPisCofinsPercentage > 0 || icmsStPercentage > 0;
  const totalSegregationSavingsAnnual = segregationSavingsSimplificado.totalAnnual;

  // -------------------------------------------------------------
  // 5. COMPARATIVO ANTES E DEPOIS DA REFORMA (PRÉ VS PÓS REFORMA)
  // -------------------------------------------------------------
  // Cenário Pré-Reforma: Simples Tradicional Vigente (PIS, COFINS, ICMS/ISS, IRPJ, CSLL, CPP)
  const preReformMonthlyTax = effectiveDasAmount + totalPayrollTaxesSimplificado;
  const preReformEffectiveRate = (preReformMonthlyTax / monthlyRevenue) * 100;

  // Cenário Pós-Reforma: Com base no melhor regime pós-reforma escolhido
  const postReformResult = results[bestCommercialRegime];
  const postReformMonthlyTax = postReformResult.totalMonthlyTax;
  const postReformEffectiveRate = postReformResult.effectiveRatePct;

  const deltaMonthly = postReformMonthlyTax - preReformMonthlyTax;
  const deltaAnnual = deltaMonthly * 12;
  const deltaRatePct = postReformEffectiveRate - preReformEffectiveRate;
  const percentChange = preReformMonthlyTax > 0 ? (deltaMonthly / preReformMonthlyTax) * 100 : 0;

  const substitutionRows: TaxSubstitutionRow[] = [
    {
      oldTaxName: 'PIS / PASEP (Federal)',
      newTaxName: 'CBS (Contribuição sobre Bens e Serviços)',
      preReformAmount: finalPis,
      postReformAmount: postReformResult.regime === 'simples_hibrido' || postReformResult.regime === 'lucro_presumido' || postReformResult.regime === 'lucro_real'
        ? Math.max(0, (effectiveMonthlyRevenue - effectiveMonthlyPurchases) * effectiveCbsRate)
        : finalPis,
      difference: (postReformResult.regime === 'simples_hibrido' || postReformResult.regime === 'lucro_presumido' || postReformResult.regime === 'lucro_real'
        ? Math.max(0, (effectiveMonthlyRevenue - effectiveMonthlyPurchases) * effectiveCbsRate)
        : finalPis) - finalPis,
      explanation: 'O PIS foi extinto pela EC 132/23 e regulamentado pela LC 214/2025, unificado na CBS federal com incidência não-cumulativa plena.',
      status: 'extinct_to_cbs',
    },
    {
      oldTaxName: 'COFINS (Federal)',
      newTaxName: 'CBS (Contribuição sobre Bens e Serviços)',
      preReformAmount: finalCofins,
      postReformAmount: 0, // Unificado na CBS acima
      difference: -finalCofins,
      explanation: 'A COFINS foi extinta e incorporada junto ao PIS na nova CBS federal (LC 214/2025), eliminando regimes cumulativos e monofásicos na revenda.',
      status: 'extinct_to_cbs',
    },
    {
      oldTaxName: 'ICMS (Estadual) + ISS (Municipal)',
      newTaxName: 'IBS (Imposto sobre Bens e Serviços)',
      preReformAmount: finalIcms + finalIss,
      postReformAmount: postReformResult.regime === 'simples_hibrido' || postReformResult.regime === 'lucro_presumido' || postReformResult.regime === 'lucro_real'
        ? Math.max(0, (effectiveMonthlyRevenue - effectiveMonthlyPurchases) * effectiveIbsRate)
        : (finalIcms + finalIss),
      difference: (postReformResult.regime === 'simples_hibrido' || postReformResult.regime === 'lucro_presumido' || postReformResult.regime === 'lucro_real'
        ? Math.max(0, (effectiveMonthlyRevenue - effectiveMonthlyPurchases) * effectiveIbsRate)
        : (finalIcms + finalIss)) - (finalIcms + finalIss),
      explanation: 'O ICMS estadual e o ISS municipal são substituídos pelo IBS subnacional (LC 214/2025), com cobrança no destino e crédito amplo.',
      status: 'extinct_to_ibs',
    },
    {
      oldTaxName: 'IPI (Imposto sobre Produtos Industrializados)',
      newTaxName: 'Imposto Seletivo (IS)',
      preReformAmount: finalIpi,
      postReformAmount: selectiveTaxAmount,
      difference: selectiveTaxAmount - finalIpi,
      explanation: 'O IPI teve alíquotas zeradas (exceto ZFM). Para itens específicos regulamentados pela LC 214/2025 (como bebidas açucaradas e alcoólicas), incide o Imposto Seletivo.',
      status: isSelectiveTaxApplicable ? 'new_tax' : 'extinct_to_cbs',
    },
    {
      oldTaxName: 'IRPJ + CSLL + CPP (Diretos e Folha)',
      newTaxName: 'IRPJ + CSLL + CPP (Preservados)',
      preReformAmount: finalIrpj + finalCsll + finalCpp + totalPayrollTaxesSimplificado,
      postReformAmount: postReformResult.das.irpj + postReformResult.das.csll + postReformResult.das.cpp + postReformResult.payrollCharges.totalPayrollTaxes,
      difference: (postReformResult.das.irpj + postReformResult.das.csll + postReformResult.das.cpp + postReformResult.payrollCharges.totalPayrollTaxes) - (finalIrpj + finalCsll + finalCpp + totalPayrollTaxesSimplificado),
      explanation: 'Os impostos diretos sobre a renda (IRPJ e CSLL) e a Contribuição Patronal Previdenciária (CPP) permanecem inalterados dentro do Simples Nacional (LC 123/2006 e LC 214/2025).',
      status: 'retained_in_das',
    },
  ];

  const prePostComparison: PrePostReformComparison = {
    preReform: {
      pisAmount: finalPis,
      cofinsAmount: finalCofins,
      icmsAmount: finalIcms,
      issAmount: finalIss,
      irpjAmount: finalIrpj,
      csllAmount: finalCsll,
      cppAmount: finalCpp,
      monofasicoDeduction: totalDeductedPisCofins,
      icmsStDeduction: deductedIcms,
      totalMonthlyTax: preReformMonthlyTax,
      totalAnnualTax: preReformMonthlyTax * 12,
      effectiveRatePct: preReformEffectiveRate,
      b2bCreditTransferPct: simplesCreditShareRate * 100,
      description: 'Simples Nacional Atual com PIS/COFINS e ICMS apurados na guia do DAS.',
    },
    postReform: {
      cbsAmount: (monthlyRevenue * effectiveCbsRate),
      ibsAmount: (monthlyRevenue * effectiveIbsRate),
      selectiveTaxAmount,
      irpjAmount: postReformResult.das.irpj,
      csllAmount: postReformResult.das.csll,
      cppAmount: postReformResult.das.cpp,
      eligibleCreditsAmount: ibsCbsEligibleCredits,
      netIbsCbsPayable: ibsCbsNetPayable,
      totalMonthlyTax: postReformMonthlyTax,
      totalAnnualTax: postReformMonthlyTax * 12,
      effectiveRatePct: postReformEffectiveRate,
      b2bCreditTransferPct: postReformResult.ibsCbs.creditTransferRate * 100,
      description: `Opção pós-reforma (LC 214/2025): ${postReformResult.name} com ${useCustomIbsCbsRate ? 'alíquota personalizada' : 'alíquota sugerida'} de IBS/CBS.`,
    },
    deltaMonthly,
    deltaAnnual,
    deltaRatePct,
    percentChange,
    isFavorablePostReform: deltaMonthly <= 0,
    substitutionRows,
    monofasicoStAnalysis: {
      currentSystemDesc: hasMonofasicoOrSt
        ? `No sistema atual (LC 123/2006), sua empresa segrega ${monofasicoPisCofinsPercentage}% da receita monofásica de PIS/COFINS e ${icmsStPercentage}% de ICMS-ST no PGDAS-D, gerando uma economia mensal de R$ ${(totalDeductedPisCofins + deductedIcms).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
        : 'No sistema atual, toda a receita é tributada nas faixas normais do Anexo sem segregação de monofásicos ou ST.',
      newSystemDesc: `Na Reforma Tributária 2027 (Lei Complementar nº 214/2025 e EC 132/2023), PIS, COFINS e ICMS são extintos e substituídos pela CBS e pelo IBS. A lógica de "concentração monofásica" e "Substituição Tributária pré-fixada" é substituída pelo princípio do Crédito Financeiro Amplo: a cada elo da cadeia, quem compra toma crédito do imposto destacado na nota anterior e quem vende recolhe sobre o valor agregado.`,
      keyTransitionTakeaways: [
        'Fim da complexidade da Substituição Tributária (ICMS-ST) nos estados: o imposto passa a pertencer 100% ao estado/município de destino.',
        'Extinção do PIS/COFINS Monofásico: a CBS é não-cumulativa plena (LC 214/2025), acabando com a necessidade de segregação manual de NCMs por alíquota zero.',
        'Se optar pelo Simples Híbrido, a empresa pode tomar créditos de IBS/CBS sobre 100% das suas compras de mercadorias e insumos tributados.',
        businessSegment === 'farmacia' ? 'Medicamentos contam com alíquota reduzida em 60% de CBS e IBS (Art. 9º da EC 132/23 e LC 214/2025).' : 'Empresas no Simples Simplificado continuam podendo recolher em guia única sem créditos amplos.',
      ],
    },
  };

  return {
    input,
    results,
    considerB2BCompetitiveFactor,
    bestRegime,
    bestDirectRegime,
    bestCommercialRegime,
    monthlySavings,
    annualSavings,
    enquadramento: simplesEnquadramento,
    factorRInfo: {
      ...factorRData,
      potentialAnnualTaxSavingsWithFactorR,
    },
    sectorSavingsHighlight: {
      hasMonofasicoOrSt,
      totalSegregationSavingsAnnual,
      monofasicoSavingsAnnual: segregationSavingsSimplificado.monofasicoPisCofinsAnnual,
      icmsStSavingsAnnual: segregationSavingsSimplificado.icmsStAnnual,
      legalNotice:
        hasMonofasicoOrSt
          ? `Economia de R$ ${totalSegregationSavingsAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano garantida pela segregação legal de PIS/COFINS Monofásico (Leis 10.147/00, 10.485/02, 13.097/15) e ICMS-ST (Convênio 142/18) na forma do Art. 18, § 4º-A da LC 123/2006 e diretrizes da LC 214/2025.`
          : 'Nenhuma segregação setorial aplicada. Revenda tributada integralmente.',
    },
    prePostComparison,
  };
}
