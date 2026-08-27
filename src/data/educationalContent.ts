export interface EducationalTopic {
  id: string;
  title: string;
  shortDesc: string;
  category: 'reforma2027' | 'hibrido_vs_simplificado' | 'b2b_impact' | 'fator_r' | 'anexos' | 'monofasico_st';
  content: string[];
  keyTakeaway: string;
  badge: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const REFORMA_TIMELINE = [
  {
    year: '2026',
    title: 'Ano de Teste & Calibragem',
    desc: 'Início da cobrança teste da CBS (0,9%) e do IBS (0,1%), sem impacto financeiro real na arrecadação (compensável com PIS/COFINS).',
    status: 'Concluído/Fase Inicial',
  },
  {
    year: '2027',
    title: 'Vigência da CBS & Extinção de PIS/COFINS',
    desc: 'Entrada oficial da CBS federal. Extinção definitiva do PIS e da COFINS. Redução a zero das alíquotas de IPI (exceto ZFM). Empresas do Simples escolhem entre DAS Simplificado ou Híbrido.',
    status: 'Ano Chave da Simulação',
  },
  {
    year: '2029 a 2032',
    title: 'Transição Gradual do IBS (Substituição de ICMS e ISS)',
    desc: 'Redução progressiva de ICMS e ISS à razão de 1/10 por ano e aumento correspondente do IBS estadual/municipal.',
    status: 'Transição Federativa',
  },
  {
    year: '2033',
    title: 'Vigência Plena do Novo Sistema Tributário',
    desc: 'Extinção completa do ICMS e do ISS. O sistema opera 100% com o IVA Dual (CBS Federal + IBS Subnacional) e Imposto Seletivo.',
    status: 'Regime Definitivo',
  },
];

export const EDUCATIONAL_TOPICS: EducationalTopic[] = [
  {
    id: 'monofasico_pis_cofins',
    title: 'PIS/COFINS Monofásico em Farmácias, Autopeças e Bebidas',
    shortDesc: 'Como a segregação de receitas no Simples Nacional gera economias imediatas de 10% a 35% na guia do DAS.',
    category: 'monofasico_st',
    badge: 'Segregação no DAS',
    keyTakeaway: 'A revenda de produtos monofásicos deve ser segregada no PGDAS-D com alíquota zero de PIS/COFINS, conforme o Art. 18, § 4º-A, I da LC 123/2006.',
    content: [
      'No regime de **Tributação Monofásica**, o fabricante ou importador recolhe o PIS e a COFINS de toda a cadeia produtiva com alíquota concentrada na origem.',
      'Por determinação legal, os comerciantes atacadistas e varejistas (como drogarias, lojas de autopeças, distribuidoras de bebidas e postos de combustíveis) têm alíquota ZERO nas etapas subsequentes de revenda.',
      'Principais legislações federais aplicáveis:',
      '• **Farmácias & Cosméticos:** Lei Federal nº 10.147/2000 (medicamentos e perfumaria).',
      '• **Autopeças & Veículos:** Lei Federal nº 10.485/2002 e Lei nº 10.865/2004 (peças, pneus e câmaras de ar).',
      '• **Bebidas Frias:** Lei Federal nº 13.097/2015 (cervejas, refrigerantes, águas e energéticos).',
      '• **Combustíveis & Lubrificantes:** Lei nº 9.718/1998 e Lei Complementar nº 192/2022.',
      'Ao emitir a guia mensal do DAS no PGDAS-D, o contador deve marcar a opção "Revenda de mercadorias com tributação monofásica de PIS/COFINS", reduzindo o percentual destes tributos do valor final do DAS.',
    ],
  },
  {
    id: 'icms_st_guia_das',
    title: 'ICMS-ST (Substituição Tributária) no Simples Nacional',
    shortDesc: 'Abatimento da parcela do ICMS para mercadorias com imposto recolhido antecipadamente.',
    category: 'monofasico_st',
    badge: 'ICMS-ST',
    keyTakeaway: 'Produtos com ICMS retido por Substituição Tributária (ST) não pagam a fração de ICMS no DAS, evitando bitributação (Art. 18, § 4º-A, IV da LC 123/06).',
    content: [
      'Na **Substituição Tributária (ICMS-ST)**, disciplinada pelo Convênio ICMS 142/2018 e regulamentos estaduais (RICMS), a indústria ou distribuidor retém antecipadamente o imposto devido por toda a cadeia até o consumidor final.',
      'Como o ICMS já foi recolhido na nota fiscal de compra, a empresa do Simples Nacional não deve recolher novamente a parcela de ICMS dentro do DAS.',
      'Setores com altíssima incidência de ICMS-ST incluem: autopeças, medicamentos, bebidas, ferramentas, materiais elétricos, alimentos e combustíveis.',
      'A não segregação dessa receita gera pagamento indevido de impostos, gerando direito a restituição ou compensação administrativa dos últimos 5 anos.',
    ],
  },
  {
    id: 'reforma_saude_aliquota_reduzida',
    title: 'Reforma 2027: Alíquota Reduzida de 60% para Saúde e Medicamentos',
    shortDesc: 'Tratamento diferenciado da CBS e IBS para o setor farmacêutico e serviços de saúde na EC 132/2023.',
    category: 'reforma2027',
    badge: 'Reforma 2027',
    keyTakeaway: 'Medicamentos e produtos de cuidados básicos de saúde terão redução de 60% na alíquota padrão do IVA Dual (alíquota efetiva de ~10,6%).',
    content: [
      'O Art. 9º da Emenda Constitucional nº 132/2023 e a Lei Complementar da Reforma estabelecem regimes diferenciados para bens essenciais.',
      'Medicamentos, fórmulas nutricionais, dispositivos médicos e produtos de higiene menstrual contam com **redução de 60%** nas alíquotas do IBS e da CBS.',
      'Medicamentos para tratamento de doenças graves e itens da cesta básica nacional terão alíquota ZERO total de IBS e CBS.',
      'Para farmácias e drogarias que analisarem a migração para o Simples Híbrido, essa redução de 60% significa que a alíquota padrão de ~26,5% cai para apenas ~10,6%, tornando o aproveitamento de créditos extremamente vantajoso.',
    ],
  },
  {
    id: 'reforma_imposto_seletivo_bebidas',
    title: 'Imposto Seletivo (IS) na Distribuição de Bebidas e Cigarros',
    shortDesc: 'O novo "Imposto do Pecado" sobre bens prejudiciais à saúde e ao meio ambiente.',
    category: 'reforma2027',
    badge: 'Imposto Seletivo',
    keyTakeaway: 'O Imposto Seletivo incidirá na produção ou importação de bebidas alcoólicas e açucaradas, afetando o custo de entrada e o preço de venda.',
    content: [
      'Previsto no Art. 153, VIII da Constituição Federal (incluído pela EC 132/23), o **Imposto Seletivo (IS)** incidirá sobre produtos prejudiciais à saúde ou ao meio ambiente.',
      'Itens impactados: bebidas alcoólicas (cervejas, destilados, vinhos), bebidas açucaradas (refrigerantes e energéticos), cigarros e combustíveis fósseis.',
      'O Imposto Seletivo é cumulativo (não gera créditos de IVA) e integra a base de cálculo do IBS e da CBS.',
      'Distribuidoras de bebidas devem reavaliar sua formação de preços e a eficiência de créditos tributários no regime Híbrido a partir de 2027.',
    ],
  },
  {
    id: 'o_que_e_hibrido',
    title: 'O que é o Simples Nacional Híbrido?',
    shortDesc: 'A nova opção criada pela Reforma Tributária que separa tributos federais/trabalhistas do IBS e CBS.',
    category: 'hibrido_vs_simplificado',
    badge: 'Conceito Central',
    keyTakeaway: 'O Simples Híbrido permite manter IRPJ/CSLL/CPP no DAS simplificado e apurar IBS/CBS no regime não-cumulativo amplo.',
    content: [
      'Na Reforma Tributária (EC 132/2023), as microempresas e empresas de pequeno porte (ME e EPP) ganharam o direito de escolher a forma de recolhimento dos novos tributos sobre o consumo (IBS e CBS).',
      'No **Simples Híbrido**, a empresa mantém a tributação de IRPJ, CSLL e CPP (INSS Patronal) unificada dentro da guia do DAS do Simples Nacional.',
      'Porém, para o **IBS (estadual/municipal)** e a **CBS (federal)**, a empresa opta por apurar por fora, no regime regular de Débito e Crédito (Não Cumulativo).',
      'Isso significa que a empresa recolhe a alíquota padrão sobre suas vendas, mas toma créditos integrais de IBS/CBS sobre todas as suas compras de insumos, mercadorias, serviços e contas de energia/telefonia.',
    ],
  },
  {
    id: 'simplificado_tradicional',
    title: 'Como funciona o Simples Simplificado (100% DAS)?',
    shortDesc: 'O modelo clássico de guia única continuará existindo, com vantagens e limitações específicas.',
    category: 'hibrido_vs_simplificado',
    badge: 'Regime Tradicional',
    keyTakeaway: 'Excelente para quem vende para consumidor final (B2C), mas gera créditos restritos para empresas compradoras (B2B).',
    content: [
      'No **Simples Simplificado**, a empresa continua pagando tudo em uma única guia mensal (o DAS), exatamente como funciona hoje.',
      'A alíquota calculada na tabela do Simples continuará embutindo a parcela correspondente aos novos tributos (IBS e CBS em substituição ao ICMS, ISS, PIS e COFINS).',
      'A grande vantagem é a **máxima simplicidade operacional** e o baixo custo burocrático de conformidade fiscal.',
      'A desvantagem crítica reside na **transferência de créditos**: o cliente pessoa jurídica que compra do Simples Simplificado só pode aproveitar o crédito correspondente ao percentual recolhido dentro do DAS, e não a alíquota cheia.',
    ],
  },
  {
    id: 'efeito_b2b',
    title: 'A "Guerra do Crédito" no B2B: Por que isso decide o regime?',
    shortDesc: 'Entenda como seus clientes empresariais podem pressionar sua empresa a sair do DAS Simplificado.',
    category: 'b2b_impact',
    badge: 'Impacto Comercial',
    keyTakeaway: 'Clientes PJ que estão no Regime Regular (Lucro Real ou Presumido) buscam fornecedores que entregam 100% de crédito de IBS/CBS.',
    content: [
      'Imagine que uma grande empresa compra R$ 100.000 em produtos ou serviços de um fornecedor.',
      'Se o fornecedor for do **Regime Regular ou Simples Híbrido**, o comprador ganha ~R$ 26.500 de crédito tributário na entrada para abater do seu imposto a pagar.',
      'Se o mesmo fornecedor for do **Simples Simplificado**, o crédito transferido pode ser de apenas R$ 3.000 a R$ 6.000.',
      'O comprador terá uma perda líquida de mais de R$ 20.000 de crédito! Para compensar essa perda, o cliente PJ pode: 1) Exigir um desconto equivalente no preço, ou 2) Trocar de fornecedor.',
      'Portanto, empresas com mais de 50% de faturamento em B2B devem simular com muita atenção a opção pelo Simples Híbrido.',
    ],
  },
  {
    id: 'fator_r_estrategia',
    title: 'Fator R: O segredo da economia entre Anexo V e Anexo III',
    shortDesc: 'Como transformar alíquotas que começam em 15,5% em alíquotas a partir de 6,0% de forma legal.',
    category: 'fator_r',
    badge: 'Planejamento Tributário',
    keyTakeaway: 'Se a Folha de Pagamento + Pró-labore dos últimos 12 meses for igual ou superior a 28% da receita bruta, a empresa migra para o Anexo III.',
    content: [
      'O Fator R é a relação matemática entre a folha de salários (incluindo encargos e pró-labore) dos últimos 12 meses e a receita bruta total acumulada no mesmo período (RBT12).',
      'Fórmula: **Fator R = (Folha de Salários + Pró-labore) / Receita Bruta Total**.',
      'Atividades intelectuais, como desenvolvimento de software, consultoria, engenharia, psicologia e clínicas médicas, são originalmente enquadradas no **Anexo V** (alíquota inicial de 15,50%).',
      'Porém, se o Fator R for **igual ou superior a 28,00%**, a legislação (Art. 18, § 5º-J da LC 123/2006) permite que a empresa seja tributada pelo **Anexo III** (alíquota inicial de apenas 6,00%!).',
      'Muitas vezes, aumentar ligeiramente o pró-labore dos sócios para alcançar os 28% gera uma economia líquida de milhares de reais por ano em impostos da empresa.',
    ],
  },
  {
    id: 'anexo4_inss_patronal',
    title: 'Anexo IV: A armadilha do INSS Patronal de 20% fora do DAS',
    shortDesc: 'Por que o Anexo IV parece barato na alíquota nominal mas pode ser muito caro na folha.',
    category: 'anexos',
    badge: 'Atenção Contábil',
    keyTakeaway: 'Empresas de construção civil, vigilância, limpeza e advocacia não têm o INSS Patronal embutido no DAS e pagam ~28,8% sobre a folha.',
    content: [
      'Ao contrário dos Anexos I, II, III e V, onde a Contribuição Previdenciária Patronal (CPP) já está inclusa dentro do percentual do DAS, as empresas do **Anexo IV** recolhem a CPP separadamente.',
      'Isso significa pagar: 20% de INSS Patronal + ~1% a 3% de RAT ajustado + 5,8% de Terceiros (Salário-Educação, Senai, Sesi, Sebrae, Incra) sobre o total da folha e pró-labore.',
      'Para empresas com muitos funcionários ou folha pesada, o custo total tributário no Anexo IV pode se aproximar ou até superar o Lucro Presumido/Real.',
    ],
  },
  {
    id: 'industria_reforma_bens_capital',
    title: 'Indústria & Manufatura: Fim do IPI e Créditos Imediatos de Bens de Capital',
    shortDesc: 'A transformação da matriz tributária industrial com a desoneração de máquinas, matérias-primas e energia.',
    category: 'reforma2027',
    badge: 'Indústria & IPI',
    keyTakeaway: 'A extinção do IPI e o crédito pleno de IBS/CBS sobre bens de capital e insumos modernizam a indústria no Simples Híbrido.',
    content: [
      'Na indústria (Anexo II do Simples Nacional ou Lucro Presumido com presunção de 8% de IRPJ e 12% de CSLL), a carga sobre a cadeia produtiva sofria com a cumulatividade de resíduos de IPI e ICMS.',
      'A Emenda Constitucional nº 132/2023 extingue o IPI para a quase totalidade dos produtos industriais (mantendo alíquota apenas para produtos com fabricação incentivada na Zona Franca de Manaus).',
      'Na aquisição de máquinas, equipamentos industriais, robótica e instalações fabris, a indústria passa a usufruir de **crédito financeiro imediato e integral de IBS e CBS**, sem ter que esperar 48 meses como no antigo CIAP do ICMS.',
      'Para indústrias que vendem para redes atacadistas e distribuidoras (B2B), a opção pelo Simples Híbrido transfere 100% de crédito, tornando seus produtos altamente competitivos.',
    ],
  },
  {
    id: 'materiais_construcao_regime_especifico',
    title: 'Materiais de Construção: Convênio 142/18 Anexo XI e Regime Específico de Obras',
    shortDesc: 'Como a substituição tributária em tintas, cimento e fios se transforma com o regime específico da EC 132/2023.',
    category: 'monofasico_st',
    badge: 'Construção Civil',
    keyTakeaway: 'O comércio de materiais de acabamento deixa o complexo ICMS-ST e passa a ter regime específico e vendas B2B para construtoras.',
    content: [
      'O comércio de materiais de construção opera historicamente sob forte regime de ICMS-ST (Anexo XI do Convênio ICMS 142/2018), em tintas, vernizes, cimento, condutores elétricos e louças.',
      'No Simples Nacional atual, essas vendas devem ser devidamente segregadas no PGDAS-D para abater a parcela de ICMS próprio, economizando substancialmente na guia DAS.',
      'Na Reforma Tributária 2027, as operações com bens imóveis e serviços de construção civil contam com **Regime Específico** (com redução de 20% a 40% nas alíquotas padrão de IBS e CBS).',
      'Como construtoras e incorporadoras (PJ) operam na não-cumulatividade, a compra de materiais de lojistas no Simples Híbrido permite o repasse integral de créditos de IBS/CBS.',
    ],
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'Indústria & Manufatura',
    question: 'Como a indústria é tributada no Simples Nacional e no Lucro Presumido?',
    answer: 'No Simples Nacional, a fabricação é tributada pelo Anexo II (com partilha de IPI e ICMS). No Lucro Presumido, a presunção é de 8% da receita bruta para IRPJ e 12% para CSLL (Lei 9.249/95, arts. 15 e 20). No Lucro Real, deduzem-se todos os custos de produção (CPV), insumos e depreciação fabril.',
  },
  {
    category: 'Materiais de Construção',
    question: 'Lojas de materiais de construção podem abater ICMS-ST no DAS?',
    answer: 'Sim! Tintas, cimento, fios elétricos, tubos de PVC e cerâmicas que tiveram ICMS retido por Substituição Tributária na indústria (Convênio ICMS 142/2018 Anexo XI) devem ser declarados com segregação de ICMS-ST no PGDAS-D, abatendo a parcela de ICMS da guia DAS.',
  },
  {
    category: 'Monofásico & ST',
    question: 'Farmácias e Autopeças pagam PIS e COFINS no Simples Nacional?',
    answer: 'NÃO devem pagar sobre a parcela de produtos monofásicos. Pela Lei Complementar 123/2006 (Art. 18, § 4º-A, I) combinada com as Leis 10.147/00 e 10.485/02, a receita com venda de produtos monofásicos deve ser segregada no PGDAS-D com alíquota zero de PIS/COFINS, gerando expressiva redução da guia DAS.',
  },
  {
    category: 'Monofásico & ST',
    question: 'Como funciona a exclusão do ICMS-ST no cálculo do Simples?',
    answer: 'Conforme o Convênio ICMS 142/2018 e o Art. 18, § 4º-A, IV da LC 123/06, quando a mercadoria comercializada já teve o ICMS retido por Substituição Tributária pelo fabricante ou distribuidor, a empresa optante pelo Simples Nacional deve deduzir o percentual de ICMS da alíquota efetiva no cálculo da guia mensal.',
  },
  {
    category: 'Reforma 2027',
    question: 'A partir de quando as empresas poderão optar pelo Simples Híbrido?',
    answer: 'A opção pelo recolhimento de IBS e CBS no regime regular (Simples Híbrido) estará disponível para o ano-calendário de 2027, devendo ser manifestada no início do ano letivo fiscal no portal do Simples Nacional.',
  },
  {
    category: 'B2B e Créditos',
    question: 'Se eu vender apenas para Pessoa Física (B2C), vale a pena ser Simples Híbrido?',
    answer: 'Geralmente NÃO. Como pessoas físicas não se aproveitam de créditos tributários, a empresa no Simples Simplificado não sofre desvantagem competitiva e costuma ter uma carga tributária total mais baixa e muito menos burocracia.',
  },
  {
    category: 'Créditos de Insumos',
    question: 'Quais despesas geram crédito no IBS e CBS no Simples Híbrido?',
    answer: 'Pelo princípio do crédito amplo, praticamente todas as aquisições de bens e serviços tributados vinculados à atividade econômica geram créditos: mercadorias para revenda, matérias-primas, energia elétrica, telecomunicações, aluguéis pagos a PJ e serviços tomados.',
  },
  {
    category: 'Lucro Presumido',
    question: 'Quando o Lucro Presumido pode ser melhor que o Simples Nacional?',
    answer: 'O Lucro Presumido costuma se tornar atrativo quando o faturamento da empresa se aproxima do teto do Simples (acima de R$ 3,6 milhões), onde as alíquotas do Simples sobem para faixas de 20% a 33%, ou quando a margem de lucro real é muito superior à margem presumida legal (ex: margem real de 50% em serviços).',
  },
  {
    category: 'Fator R',
    question: 'Posso incluir o pró-labore dos sócios no cálculo do Fator R?',
    answer: 'Sim! Para fins do cálculo do Fator R, são somados: salários dos empregados, pró-labore dos sócios, 13º salário, férias e encargos como FGTS e CPP recolhidos nos últimos 12 meses anteriores ao período de apuração.',
  },
];
