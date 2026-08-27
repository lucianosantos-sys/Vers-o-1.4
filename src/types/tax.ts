export type AnexoType = 'anexo_1' | 'anexo_2' | 'anexo_3' | 'anexo_4' | 'anexo_5';

export type AnexoCategoryKey =
  | 'anexo_1'           // Comércio / Revenda de Mercadorias (Anexo I)
  | 'anexo_2'           // Indústria / Fabricação com IPI (Anexo II)
  | 'anexo_3'           // Serviços em Geral com ISS (Anexo III)
  | 'anexo_3_sem_iss'   // Serviços Gerais SEM ISS / Retenção / Exportação / Isenção (Anexo III)
  | 'anexo_4'           // Obras / Construção / Limpeza / Advocacia com ISS (Anexo IV)
  | 'anexo_4_sem_iss'   // Obras / Construção SEM ISS / Retenção na Fonte (Anexo IV)
  | 'anexo_5';          // TI / Consultoria / Intelectuais - Fator R (Anexo V)

export interface AnexoRevenueMap {
  anexo_1?: number;
  anexo_2?: number;
  anexo_3?: number;
  anexo_3_sem_iss?: number;
  anexo_4?: number;
  anexo_4_sem_iss?: number;
  anexo_5?: number;
}

export type RegimeType = 'simples_simplificado' | 'simples_hibrido' | 'lucro_presumido' | 'lucro_real';

export type SimulationYear = '2027_transicao' | '2033_pleno' | 'personalizado';

export type BusinessSegment =
  | 'geral'
  | 'farmacia'
  | 'autopecas'
  | 'bebidas'
  | 'combustiveis'
  | 'cosmeticos'
  | 'industria'
  | 'material_construcao';

export type ReductionMode = 'padrao_segmento' | 'rateio_personalizado';

export interface ReductionTierBreakdown {
  fullTax: number; // Compras / Vendas com imposto cheio (0% de redução)
  reduction30: number; // Compras / Vendas com redução de 30% (70% do imposto)
  reduction50: number; // Compras / Vendas com redução de 50% (50% do imposto)
  reduction60: number; // Compras / Vendas com redução de 60% (40% do imposto - Saúde, agro, educação)
  reduction70: number; // Compras / Vendas com redução de 70% (30% do imposto)
  reduction100: number; // Compras / Vendas com redução de 100% (Alíquota Zero / Cesta Básica)
}

export interface CompanyInput {
  companyName: string;
  cnpj?: string;
  anexo: AnexoType;
  businessSegment: BusinessSegment; // Segmento específico de atividade
  rbt12: number; // Receita Bruta Total dos últimos 12 meses (R$)
  monthlyRevenue: number; // Faturamento Mensal Projetado (R$)
  monthlyPayroll: number; // Folha de Pagamento com Salários + Encargos (R$/mês)
  monthlyProLabore: number; // Pró-labore dos Sócios (R$/mês)
  monthlyPurchasesInputs: number; // Compras de Mercadorias e Insumos com Crédito de IBS/CBS (R$/mês)
  creditEligibilityPct: number; // % das despesas que geram crédito amplo de IBS/CBS (0 a 100%, padrão 85%)
  b2bPercentage: number; // % de Vendas para Pessoas Jurídicas / B2B (0 a 100%)
  b2bDisputeDiscountPct: number; // % de desconto comercial médio se o cliente B2B não tiver crédito amplo
  considerB2BCompetitiveFactor?: boolean; // Considerar Fator Competitivo B2B (risco de desconto e perda de crédito para PJ) na recomendação final
  lucroRealMarginPct: number; // Margem de Lucro Líquido Real estimada antes dos tributos (padrão 15%)
  
  // SEGREGAÇÃO E COMPOSIÇÃO DE RECEITAS POR ANEXO (LC 123/2006 E LEI 9.249/1995)
  anexoRevenues?: AnexoRevenueMap; // Receitas faturadas em cada Anexo / categoria (R$/mês)
  isRevenueSegregated?: boolean; // Ativa segregação de faturamento
  salesRevenueMonthly?: number; // Receita de Vendas de Mercadorias/Produtos (R$/mês) - Presunção IRPJ 8% e CSLL 12%
  servicesRevenueMonthly?: number; // Receita de Prestação de Serviços (R$/mês) - Presunção IRPJ 32% e CSLL 32%
  salesAnexo?: AnexoType; // Anexo do Simples Nacional para a parcela de Vendas (padrão: Anexo I ou II)
  servicesAnexo?: AnexoType; // Anexo do Simples Nacional para a parcela de Serviços (padrão: Anexo III, IV ou V)

  // APURAÇÃO E DEDUÇÕES DO LUCRO REAL (RIR/2018 E LEI 9.249/1995)
  lucroRealCalculationMethod?: 'deducoes_reais' | 'margem_estimada'; // Padrão: 'deducoes_reais' (apuração contábil DRE)
  otherDeductibleExpenses?: number; // Outras despesas operacionais dedutíveis no Lucro Real (aluguéis, utilidades, serviços tomados, etc. - RIR/2018 art. 311)
  
  // PARÂMETROS ESPECÍFICOS DE LEGISLAÇÃO SETORIAL (PIS/COFINS MONOFÁSICO & ICMS-ST)
  monofasicoPisCofinsPercentage: number; // % da receita com incidência monofásica de PIS/COFINS (Leis 10.147/00, 10.485/02, 13.097/15)
  icmsStPercentage: number; // % da receita com ICMS retido por Substituição Tributária (Convênio ICMS 142/2018)
  isSelectiveTaxApplicable: boolean; // Incidência de Imposto Seletivo (Reforma 2027: bebidas alcoólicas, etc.)
  healthDiscountRatePct: number; // % de redução da alíquota do IVA Dual para saúde/medicamentos (padrão 60% na EC 132/2023)

  // PERSONALIZAÇÃO / RATEIO DE REDUÇÃO NAS COMPRAS DE INSUMOS
  purchasesReductionMode?: ReductionMode; // 'padrao_segmento' ou 'rateio_personalizado'
  purchasesBreakdown?: ReductionTierBreakdown;

  // PERSONALIZAÇÃO / RATEIO DE REDUÇÃO NAS VENDAS / FATURAMENTO
  salesReductionMode?: ReductionMode; // 'padrao_segmento' ou 'rateio_personalizado'
  salesBreakdown?: ReductionTierBreakdown;

  simulationYear: SimulationYear; // 2027 (transição CBS 0.9% + IBS 0.1%), 2033 (pleno 26.5%) ou personalizado
  cbsRate2027: number; // CBS padrão de transição 2027 (padrão 0.9%)
  ibsRate2027: number; // IBS padrão de transição 2027 (padrão 0.1%)
  fullCbsIbsRate: number; // Alíquota estimada IBS+CBS plena (sugerida 26.5%)
  
  // CONFIGURAÇÃO PERSONALIZADA DE ALÍQUOTA IBS / CBS
  useCustomIbsCbsRate: boolean; // Ativa modo de alíquota personalizada
  customCbsRatePct: number; // Alíquota CBS personalizada (ex: 8.8%)
  customIbsRatePct: number; // Alíquota IBS personalizada (ex: 17.7%)
  
  issRate: number; // ISS Municipal (2% a 5%, padrão 5%)
  icmsEffectiveRate: number; // ICMS Estadual médio (padrão 18%)
}

export interface AnexoBracket {
  bracket: number;
  limitMin: number;
  limitMax: number;
  nominalRate: number; // Alíquota nominal da tabela (%)
  deduction: number; // Parcela a deduzir (R$)
  // Repartição dos tributos dentro do DAS (% sobre a alíquota)
  irpjShare: number;
  csllShare: number;
  cofinsShare: number;
  pisShare: number;
  cppShare: number;
  icmsShare?: number;
  issShare?: number;
  ipiShare?: number;
}

export interface DasBreakdown {
  irpj: number;
  csll: number;
  cofins: number;
  pis: number;
  cpp: number;
  icms: number;
  iss: number;
  ipi: number;
  totalDas: number;
  // Detalhes da segregação legal no PGDAS-D
  deductedPisCofins: number;
  deductedIcms: number;
  deductedIss?: number;
  grossDasBeforeSegregation: number;
}

export interface IbsCbsCalculation {
  rateApplied: number; // % total IBS + CBS aplicada
  cbsRateApplied: number; // % CBS aplicada
  ibsRateApplied: number; // % IBS aplicada
  grossDebit: number; // Débito sobre faturamento
  eligibleCredits: number; // Crédito sobre insumos/compras
  netPayable: number; // Saldo a recolher (Débito - Crédito)
  creditTransferredToB2B: number; // Crédito gerado para o cliente B2B
  creditTransferRate: number; // % efetiva de crédito para o cliente
  selectiveTaxAmount?: number; // Imposto Seletivo calculado
  healthReductionSavings?: number; // Economia pela redução da alíquota de saúde/medicamentos
  isCustomRateApplied: boolean;
  // Detalhes do Rateio Personalizado nas Compras e Vendas
  purchasesReductionMode?: ReductionMode;
  salesReductionMode?: ReductionMode;
  purchasesWeightedCreditRatePct?: number; // Alíquota média ponderada de crédito nas compras (%)
  salesWeightedDebitRatePct?: number; // Alíquota média ponderada de débito nas vendas (%)
  purchasesTiersSummary?: {
    fullTax: { amount: number; credit: number; factor: number };
    reduction30: { amount: number; credit: number; factor: number };
    reduction50: { amount: number; credit: number; factor: number };
    reduction60: { amount: number; credit: number; factor: number };
    reduction70: { amount: number; credit: number; factor: number };
    reduction100: { amount: number; credit: number; factor: number };
  };
  salesTiersSummary?: {
    fullTax: { amount: number; debit: number; factor: number };
    reduction30: { amount: number; debit: number; factor: number };
    reduction50: { amount: number; debit: number; factor: number };
    reduction60: { amount: number; debit: number; factor: number };
    reduction70: { amount: number; debit: number; factor: number };
    reduction100: { amount: number; debit: number; factor: number };
  };
}

export interface SegregationSavings {
  monofasicoPisCofinsMonthly: number;
  monofasicoPisCofinsAnnual: number;
  icmsStMonthly: number;
  icmsStAnnual: number;
  issExemptMonthly?: number;
  issExemptAnnual?: number;
  totalMonthly: number;
  totalAnnual: number;
}

export interface RegimeResult {
  regime: RegimeType;
  name: string;
  description: string;
  das: DasBreakdown;
  ibsCbs: IbsCbsCalculation;
  payrollCharges: {
    inssPatronal: number;
    ratFap: number;
    terceiros: number;
    totalPayrollTaxes: number;
  };
  totalMonthlyTax: number;
  totalAnnualTax: number;
  effectiveRatePct: number; // Carga tributária direta (%)
  // Elegibilidade e Enquadramento no Simples Nacional (LC 123/2006 e LC 214/2025)
  isSimplesIneligible?: boolean;
  ineligibilityReason?: string;
  hasSublimiteExceeded?: boolean;
  // Economia pela segregação legal (LC 123/06 art 18 § 4º-A e LC 214/2025)
  segregationSavings: SegregationSavings;
  // Análise de Impacto Comercial B2B
  b2bCreditLossForClient: number; // Perda de crédito dos clientes B2B
  b2bCompensationDiscountPct?: number; // % da margem de desconto de compensação comercial aplicada (0 a 100%)
  estimatedCommercialLossMonthly: number; // Impacto financeiro de descontos ou perda de margem B2B
  totalAdjustedCostMonthly: number; // Custo Tributário + Impacto Comercial B2B
  totalAdjustedCostAnnual: number;
  adjustedEffectiveRatePct: number;
  // Detalhamento do Recálculo das Guias sob o Modo Competitivo B2B
  competitiveRecalculation?: {
    isCompetitiveModeActive: boolean;
    nominalMonthlyTaxGuide: number; // Guia Tributária DAS/DARF nominal direta
    compensationDiscountMonthly: number; // Margem de desconto comercial concedido
    effectiveTotalCostMonthly: number; // Custo apurado total (Guia + Desconto)
    effectiveAdjustedRatePct: number; // Alíquota efetiva ajustada
    // Se desconto incondicional for aplicado na Nota Fiscal (NF-e):
    netInvoicedRevenueMonthly: number; // Faturamento faturado líquido na NF-e
    recalculatedTaxGuideMonthly: number; // Guia DAS recalculada sobre a receita faturada líquida
    taxBaseReductionSavings: number; // Economia na guia decorrente da base menor de cálculo
    recalculatedEffectiveRatePct: number; // Alíquota efetiva recalculada
  };
  estimatedNetProfitMonthly: number;
  estimatedNetProfitAnnual: number;
  // Margens de Lucro
  profitMarginBeforeTaxesMonthly: number; // Lucro operacional antes dos tributos (R$/mês)
  profitMarginBeforeTaxesPct: number; // Margem de lucro sem considerar impostos (%)
  profitMarginAfterTaxesMonthly: number; // Lucro líquido após tributos e B2B (R$/mês)
  profitMarginAfterTaxesPct: number; // Margem de lucro considerando impostos (%)
  // Auditoria de cálculo
  audit: {
    bracketNumber: number;
    nominalRate: number;
    deductionValue: number;
    simplesEffectiveRate: number;
    factorR?: number;
    factorREligible?: boolean;
    appliedAnexo: AnexoType;
  };
  revenueSegregationAudit?: {
    isSegregated: boolean;
    anexoRevenues?: AnexoRevenueMap;
    salesRevenueMonthly: number;
    servicesRevenueMonthly: number;
    salesSharePct: number;
    servicesSharePct: number;
    salesAnexoApplied: AnexoType;
    servicesAnexoApplied: AnexoType;
    irpjPresumedBaseSales: number; // 8% sobre vendas
    irpjPresumedBaseServices: number; // 32% sobre serviços
    totalIrpjPresumedBase: number;
    csllPresumedBaseSales: number; // 12% sobre vendas
    csllPresumedBaseServices: number; // 32% sobre serviços
    totalCsllPresumedBase: number;
    irpjBaseRateAmount: number; // 15%
    irpjAdicionalAmount: number; // 10%
    totalIrpjAmount: number;
    totalCsllAmount: number; // 9%
  };
  lucroRealAudit?: {
    methodUsed: 'deducoes_reais' | 'margem_estimada';
    grossRevenue: number;
    purchasesCost: number; // CMV / CSP (insumos e mercadorias)
    payrollSalaries: number; // Salários CLT
    payrollCharges: number; // INSS Patronal + RAT + Terceiros (28.8%)
    proLabore: number; // Pró-labore dos sócios
    otherDeductibleExpenses: number; // Aluguéis, serviços tomados, etc. (RIR/2018 art. 311)
    totalDeductibleCostsAndExpenses: number;
    accountingLair: number; // LAIR (Lucro Antes do IRPJ e CSLL)
    isTaxLoss: boolean; // Prejuízo fiscal (base zero)
    taxableRealBase: number; // Base de cálculo efetiva
    irpjBaseRateAmount: number; // 15%
    irpjAdicionalAmount: number; // 10%
    totalIrpjAmount: number;
    totalCsllAmount: number; // 9%
  };
  pros: string[];
  cons: string[];
  alert?: string;
}

export interface TaxSubstitutionRow {
  oldTaxName: string;
  newTaxName: string;
  preReformAmount: number;
  postReformAmount: number;
  difference: number;
  explanation: string;
  status: 'extinct_to_cbs' | 'extinct_to_ibs' | 'retained_in_das' | 'new_tax';
}

export interface PrePostReformComparison {
  preReform: {
    pisAmount: number;
    cofinsAmount: number;
    icmsAmount: number;
    issAmount: number;
    irpjAmount: number;
    csllAmount: number;
    cppAmount: number;
    monofasicoDeduction: number;
    icmsStDeduction: number;
    totalMonthlyTax: number;
    totalAnnualTax: number;
    effectiveRatePct: number;
    b2bCreditTransferPct: number;
    description: string;
  };
  postReform: {
    cbsAmount: number;
    ibsAmount: number;
    selectiveTaxAmount: number;
    irpjAmount: number;
    csllAmount: number;
    cppAmount: number;
    eligibleCreditsAmount: number;
    netIbsCbsPayable: number;
    totalMonthlyTax: number;
    totalAnnualTax: number;
    effectiveRatePct: number;
    b2bCreditTransferPct: number;
    description: string;
  };
  deltaMonthly: number; // postReform - preReform
  deltaAnnual: number;
  deltaRatePct: number; // postRate - preRate
  percentChange: number; // % de variação no custo tributário
  isFavorablePostReform: boolean;
  substitutionRows: TaxSubstitutionRow[];
  monofasicoStAnalysis: {
    currentSystemDesc: string;
    newSystemDesc: string;
    keyTransitionTakeaways: string[];
  };
}

export type EnquadramentoStatus =
  | 'enquadrado_total' // RBT12 <= 3.6M (Recolhimento 100% no DAS)
  | 'sublimite_excedido' // 3.6M < RBT12 <= 4.8M (ICMS/ISS/IBS por fora do DAS - LC 123/06 art. 19/20 e LC 214/25)
  | 'desenquadrado_receita' // RBT12 > 4.8M (Obrigatoriedade de Lucro Presumido ou Real)
  | 'atividade_vedada'; // Atividade restrita / proibida no Simples

export interface SimplesEnquadramento {
  status: EnquadramentoStatus;
  isEligibleForSimples: boolean;
  porte: 'ME' | 'EPP' | 'MEDIO_GRANDE';
  porteLabel: string;
  rbt12: number;
  monthlyRevenue: number;
  annualizedRevenue: number;
  limiteMaximo: number; // R$ 4.800.000,00
  sublimite: number; // R$ 3.600.000,00
  percentualLimiteUsado: number; // (RBT12 / 4.8M) * 100
  percentualSublimiteUsado: number; // (RBT12 / 3.6M) * 100
  exceededSublimite: boolean;
  exceededLimiteMaximo: boolean;
  statusBadge: {
    label: string;
    variant: 'success' | 'warning' | 'danger';
    title: string;
    description: string;
  };
  sublimiteNotice?: string;
  limiteMaximoNotice?: string;
  activityEligibility: {
    anexo: AnexoType;
    isAllowed: boolean;
    anexoName: string;
    anexoDescription: string;
    hasFactorR: boolean;
    factorRStatus: string;
    hasExternalCpp: boolean;
    legalBasis: string;
    activityNotes: string;
  };
  legalReferences: {
    leiComplementarSimples: string; // Lei Complementar nº 214/2025 & Lei Complementar nº 123/2006
    reformaConstitucional: string; // Emenda Constitucional nº 132/2023
    regulamentacaoIbsCbs: string; // LC 214/2025 (IBS, CBS e Imposto Seletivo)
    artigoEnquadramento: string;
  };
}

export interface SimulationSummary {
  input: CompanyInput;
  results: Record<RegimeType, RegimeResult>;
  considerB2BCompetitiveFactor: boolean;
  bestRegime: RegimeType; // Regime recomendado ativo (dependendo da consideração do fator competitivo)
  bestDirectRegime: RegimeType;
  bestCommercialRegime: RegimeType;
  monthlySavings: number;
  annualSavings: number;
  enquadramento: SimplesEnquadramento;
  factorRInfo: {
    factorR: number;
    factorRPct: number;
    isAnexo3Eligible: boolean;
    additionalPayrollNeededFor28Pct: number;
    potentialAnnualTaxSavingsWithFactorR: number;
  };
  sectorSavingsHighlight: {
    hasMonofasicoOrSt: boolean;
    totalSegregationSavingsAnnual: number;
    monofasicoSavingsAnnual: number;
    icmsStSavingsAnnual: number;
    legalNotice: string;
  };
  prePostComparison: PrePostReformComparison;
}

export interface PresetScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  input: Partial<CompanyInput>;
}
