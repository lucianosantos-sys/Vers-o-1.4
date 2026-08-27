export interface TaxLawReference {
  id: string;
  title: string;
  category: 'pis_cofins_monofasico' | 'icms_st' | 'simples_nacional' | 'reforma_2027_cbs_ibs' | 'imposto_seletivo';
  sectors: string[];
  lawNumber: string;
  article: string;
  headline: string;
  summary: string;
  segregationGuideline: string;
  reforma2027Impact: string;
  officialLink?: string;
}

export const LEGISLATION_DATABASE: TaxLawReference[] = [
  // 1. FARMÁCIAS E DROGARIAS (Medicamentos, Cosméticos e Higiene)
  {
    id: 'lei_10147_farmacias',
    title: 'PIS/COFINS Monofásico em Farmácias e Drogarias',
    category: 'pis_cofins_monofasico',
    sectors: ['farmacia', 'cosmeticos'],
    lawNumber: 'Lei Federal nº 10.147/2000 e Decreto nº 3.803/2001',
    article: 'Art. 1º, inciso I e Art. 2º',
    headline: 'Alíquota Zero de PIS/COFINS na revenda de Medicamentos e Cosméticos',
    summary:
      'Institui a tributação concentrada (monofásica) de PIS e COFINS nas indústrias e importadores de medicamentos (Posições 30.03 e 30.04 da NCM), cosméticos, perfumaria e produtos de higiene pessoal. No varejo (farmácias e perfumarias), as saídas ocorrem com alíquota zero (CST 04).',
    segregationGuideline:
      'No Simples Nacional (LC 123/2006 art. 18 § 4º-A, I e Resolução CGSN nº 140/2018 art. 25-A § 8º, I), a farmácia deve segregar a receita de produtos monofásicos no PGDAS-D para abater 100% das parcelas de PIS e COFINS da alíquota do DAS, reduzindo substancialmente o valor a recolher.',
    reforma2027Impact:
      'Na Reforma Tributária (EC 132/2023 e PLP 68/2024), medicamentos constantes na lista da Anvisa/CAMED terão redução de 60% da alíquota padrão de CBS e IBS (ou alíquota zero para medicamentos essenciais e tratamentos especiais/câncer). A monofasia tradicional do PIS/COFINS é substituída pela não-cumulatividade plena com alíquotas diferenciadas.',
  },
  {
    id: 'icms_st_farmacias',
    title: 'ICMS-ST sobre Medicamentos e Produtos Farmacêuticos',
    category: 'icms_st',
    sectors: ['farmacia', 'cosmeticos'],
    lawNumber: 'Convênio ICMS 142/2018 (Anexo XIV) e Convênio ICMS 234/2017',
    article: 'Cláusula Décima Primeira e anexos estaduais',
    headline: 'Retenção Antecipada de ICMS pelo Fabricante/Distribuidor',
    summary:
      'Estabelece o regime de Substituição Tributária (ICMS-ST) para medicamentos, cosméticos e perfumaria. O imposto estadual de toda a cadeia até o consumidor final é retido e recolhido antecipadamente pela indústria farmacêutica ou distribuidor com base no Preço Máximo ao Consumidor (PMC) ou Margem de Valor Agregado (MVA).',
    segregationGuideline:
      'No Simples Nacional (LC 123/2006 art. 18 § 4º-A, IV), a farmácia não paga ICMS dentro da guia do DAS sobre as receitas com ST. A receita é informada no PGDAS-D como "revenda de mercadorias com ICMS recolhido por Substituição Tributária".',
    reforma2027Impact:
      'Com a extinção gradual do ICMS até 2032 e criação do IBS, o regime de Substituição Tributária tradicional é extinto no IBS e CBS, sendo substituído pelo crédito financeiro em cada elo da cadeia com alíquota reduzida de saúde.',
  },

  // 2. AUTOPEÇAS, PNEUS E BATERIAS
  {
    id: 'lei_10485_autopecas',
    title: 'PIS/COFINS Monofásico no Setor Automotivo e Autopeças',
    category: 'pis_cofins_monofasico',
    sectors: ['autopecas'],
    lawNumber: 'Lei Federal nº 10.485/2002 e Lei Federal nº 10.833/2003',
    article: 'Art. 3º e 5º da Lei 10.485/02 e Art. 65 da Lei 10.833/03',
    headline: 'Tributação Monofásica em Autopeças, Pneus, Câmaras e Baterias',
    summary:
      'Determina a incidência concentrada de PIS (1,65% a 2,3%) e COFINS (7,6% a 10,8%) nos fabricantes e importadores de autopeças relacionadas nos Anexos I e II da Lei 10.485/02 e pneumáticos. As vendas realizadas por comerciantes atacadistas e varejistas de autopeças são desoneradas (alíquota 0% de PIS/COFINS).',
    segregationGuideline:
      'Empresas de autopeças e oficinas mecânicas no Simples Nacional devem segregar o faturamento de revenda de peças com tributação monofásica, abatendo PIS e COFINS no cálculo do DAS. Serviços mecânicos (mão de obra) continuam no Anexo III.',
    reforma2027Impact:
      'Na Reforma 2027, o setor de autopeças passa a operar na sistemática não-cumulativa geral de CBS e IBS. No Simples Híbrido, as autopeças vendidas para oficinas e transportadoras (B2B) geram 100% de crédito para os clientes.',
  },
  {
    id: 'icms_st_autopecas',
    title: 'ICMS-ST no Segmento de Peças e Acessórios Automotivos',
    category: 'icms_st',
    sectors: ['autopecas'],
    lawNumber: 'Convênio ICMS 142/2018 (Anexo II) e Protocolo ICMS 41/2008',
    article: 'Anexo II - Segmento de Autopeças',
    headline: 'Substituição Tributária Estadual de Peças Automotivas',
    summary:
      'Aplica o ICMS-ST para centenas de itens da NCM automotiva (motor, freios, suspensão, elétrica, acessórios). A indústria recolhe o ICMS com base na MVA ajustada.',
    segregationGuideline:
      'No PGDAS-D, marcar as saídas de peças com ICMS-ST já retido anteriormente pelo fornecedor, desonerando o ICMS próprio no DAS.',
    reforma2027Impact:
      'Substituição gradual pelo IBS estadual/municipal não-cumulativo no modelo de débito e crédito.',
  },

  // 3. DISTRIBUIDORAS E COMÉRCIO DE BEBIDAS FRIAS
  {
    id: 'lei_13097_bebidas',
    title: 'PIS/COFINS Monofásico em Bebidas Frias (Cervejas, Refrigerantes, Águas)',
    category: 'pis_cofins_monofasico',
    sectors: ['bebidas'],
    lawNumber: 'Lei Federal nº 13.097/2015 e Decreto nº 8.442/2015',
    article: 'Artigos 14 a 36 da Lei 13.097/2015',
    headline: 'Tributação Concentrada em Cervejarias, Refrigerantes e Águas Minerais',
    summary:
      'Institui o novo modelo de tributação concentrada de PIS e COFINS sobre bebidas frias. Os fabricantes e importadores recolhem as contribuições sobre o preço de venda, ficando as etapas de distribuição atacadista e comércio varejista (bares, restaurantes, depósitos, distribuidoras) com alíquota zero nas saídas.',
    segregationGuideline:
      'Distribuidoras de bebidas e depósitos no Simples Nacional devem segregar rigorosamente as receitas de cervejas, chopes, refrigerantes, energéticos e águas, reduzindo PIS/COFINS no DAS.',
    reforma2027Impact:
      'Atenção máxima: Bebidas alcoólicas e açucaradas estarão sujeitas ao **Imposto Seletivo (IS)** previsto no art. 153, VIII da CF/88 (EC 132/2023) incidente na produção ou importação, visando desestimular o consumo.',
  },
  {
    id: 'icms_st_bebidas',
    title: 'ICMS-ST sobre Cervejas, Vinhos e Bebidas Não-Alcoólicas',
    category: 'icms_st',
    sectors: ['bebidas'],
    lawNumber: 'Convênio ICMS 142/2018 (Anexo III) e Convênio ICMS 03/2018',
    article: 'Anexo III - Bebidas Alcoólicas e Não Alcoólicas',
    headline: 'Retenção Integral do ICMS pelas Cervejarias e Fabricantes',
    summary:
      'O ICMS sobre bebidas frias é retido integralmente pelas fábricas com base em pautas fiscais ou PMC estaduais.',
    segregationGuideline:
      'Exclusão de ICMS próprio dentro da guia do DAS nas vendas de mercadorias com ST retido.',
    reforma2027Impact:
      'Integração na CBS e no IBS, além da incidência de Imposto Seletivo.',
  },

  // 4. POSTOS DE COMBUSTÍVEIS E LUBRIFICANTES
  {
    id: 'combustiveis_monofasico',
    title: 'Tributação Monofásica de Combustíveis e Lubrificantes',
    category: 'pis_cofins_monofasico',
    sectors: ['combustiveis'],
    lawNumber: 'Lei nº 9.718/1998, Lei nº 9.990/2000 e LC nº 192/2022',
    article: 'Art. 4º da Lei 9.718/98 e Art. 2º da LC 192/2022',
    headline: 'Monofasia Nacional de Gasolina, Etanol, Diesel e Gás (GLP)',
    summary:
      'Tributação monofásica de PIS/COFINS e ICMS monofásico em valor fixo por litro (ad rem) retido nas refinarias e distribuidoras primárias.',
    segregationGuideline:
      'Postos revendedores varejistas têm exclusão total de PIS, COFINS e ICMS na revenda de combustíveis dentro do DAS (pagando no DAS apenas IRPJ, CSLL e CPP se optantes do Simples).',
    reforma2027Impact:
      'Regime específico de IBS e CBS para combustíveis e lubrificantes com alíquotas uniformes ad rem (por litro/metro cúbico) monofásicas.',
  },

  // 5. INDÚSTRIA E TRANSFORMAÇÃO (IPI, ANEXO II, LEI 9.249/95 E REFORMA)
  {
    id: 'industria_transformacao',
    title: 'Tributação Industrial: Anexo II, IPI e Base Presumida de 8% e 12%',
    category: 'simples_nacional',
    sectors: ['industria'],
    lawNumber: 'Lei Complementar nº 123/2006 (Anexo II) e Lei nº 9.249/1995 (arts. 15 e 20)',
    article: 'Art. 18, § 5º-B (Simples) e Arts. 15/20 da Lei 9.249/95 (Lucro Presumido)',
    headline: 'Tributação da Fabricação e Transformação com IPI e Crédito Pleno de Insumos',
    summary:
      'Empresas industriais no Simples Nacional recolhem pelo Anexo II, incluindo a parcela de IPI (partilha com alíquota inicial de 4,50% com 0,075 de IPI). No Lucro Presumido, a presunção sobre vendas industriais é de 8% para IRPJ e 12% para CSLL. No Lucro Real, deduz-se o Custo dos Produtos Vendidos (CPV - insumos, energia industrial e depreciação fabril).',
    segregationGuideline:
      'Caso a indústria preste também serviços industriais (como facção, usinagem sob encomenda ou montagem), deve segregar o faturamento entre Anexo II (produtos de fabricação própria) e Anexo III (serviços), conforme art. 18 da LC 123/06.',
    reforma2027Impact:
      'Na Reforma Tributária (EC 132/2023), o IPI será reduzido a zero (salvo para produtos com fabricação na Zona Franca de Manaus). A indústria passa a ter desoneração imediata e crédito pleno de CBS/IBS sobre máquinas, equipamentos (bens de capital), matérias-primas e energia elétrica. No Simples Híbrido, indústrias transferem 100% de crédito para seus clientes corporativos B2B.',
  },

  // 6. MATERIAIS DE CONSTRUÇÃO E CONSTRUÇÃO CIVIL (ICMS-ST E REGIME ESPECÍFICO EC 132/23)
  {
    id: 'material_construcao_st',
    title: 'Materiais de Construção: ICMS-ST (Convênio 142/18) e Regime Específico da Reforma',
    category: 'icms_st',
    sectors: ['material_construcao'],
    lawNumber: 'Convênio ICMS nº 142/2018 (Anexo XI) e Emenda Constitucional nº 132/2023',
    article: 'Anexo XI do Convênio 142/18 e Art. 9º, § 1º da EC 132/2023 (PLP 68/2024)',
    headline: 'Substituição Tributária Estadual em Materiais de Acabamento e Regime Diferenciado de Obras',
    summary:
      'O comércio de materiais de construção (tintas, vernizes, cimento, fios, condutores elétricos, tubos de PVC, louças, pisos cerâmicos e metais sanitários) possui forte incidência de ICMS-ST (Anexo XI do Convênio 142/2018), com retenção na fábrica. A parcela de serviços de instalação/obras enquadra-se no Anexo IV (com INSS patronal fora do DAS).',
    segregationGuideline:
      'No PGDAS-D, a revenda de itens de construção com ICMS-ST recolhido na fábrica deve ser segregada para abater o ICMS próprio do DAS. Se houver prestação de serviços de empreitada ou reforma, segrega-se a mão de obra no Anexo IV da LC 123/06.',
    reforma2027Impact:
      'A Reforma Tributária (EC 132/2023) institui o Regime Específico para Construção Civil, Incorporação e Operações com Bens Imóveis com redução de 20% a 40% na alíquota de IBS e CBS. O ICMS-ST é extinto, e lojas de materiais que vendem para construtoras PJ (B2B) passam a gerar créditos integrais de IBS/CBS aos compradores no Simples Híbrido.',
  },

  // 7. REGRA GERAL DA LEI COMPLEMENTAR 123/2006 (SEGREGAÇÃO DAS)
  {
    id: 'lc_123_segregacao',
    title: 'Regra Geral de Segregação de Tributos no Simples Nacional',
    category: 'simples_nacional',
    sectors: ['geral', 'farmacia', 'autopecas', 'bebidas', 'combustiveis', 'cosmeticos', 'industria', 'material_construcao'],
    lawNumber: 'Lei Complementar Federal nº 123/2006',
    article: 'Art. 18, § 4º-A, incisos I e IV',
    headline: 'Base Legal Obrigatória para Dedução de PIS/COFINS e ICMS-ST no DAS',
    summary:
      'O contribuinte do Simples Nacional que revenda mercadorias sujeitas à tributação monofásica de PIS/COFINS ou Substituição Tributária de ICMS deve desconsiderar, no cálculo do valor devido pelo Simples Nacional, os percentuais correspondentes a essas contribuições e impostos.',
    segregationGuideline:
      'Omitir a segregação no PGDAS-D gera bitributação imediata da empresa, pagando em duplicidade tributos que já foram recolhidos pelos fabricantes!',
    reforma2027Impact:
      'Fundamental para a decisão entre Simples Simplificado (com segregação) e Simples Híbrido (recolhendo IBS/CBS não-cumulativo por fora).',
  },
];
