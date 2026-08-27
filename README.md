# 📊 Simulador Tributário 2027: Simples Híbrido x Simplificado

Aplicação completa para planejamento e simulação tributária da **Reforma Tributária 2027 (EC 132/2023)** e **Simples Nacional (LC 123/2006)**, incluindo segregação de **PIS/COFINS Monofásico**, **ICMS-ST**, regimes Híbrido, Simplificado, Lucro Presumido e Lucro Real.

---

## 🚀 Como Rodar no VS Code no seu Computador (Desktop)

Siga este passo a passo simples para executar o projeto localmente no seu computador:

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** instalado em seu computador:
- Baixe a versão LTS recomendada em: [https://nodejs.org/](https://nodejs.org/) (versão 18, 20 ou 22).
- Ao instalar o Node.js, o **npm** será instalado automaticamente.

---

### 2. Baixar os Arquivos do Projeto
Se você está no Google AI Studio:
1. No menu superior direito, clique em **Export** / **Settings**.
2. Escolha **Export to ZIP** (ou conecte com seu **GitHub**).
3. Extraia o arquivo ZIP em uma pasta do seu computador (ex: `C:\Projetos\simulador-tributario-2027` ou `~/simulador-tributario-2027`).

---

### 3. Abrir a Pasta no VS Code
1. Abra o **Visual Studio Code**.
2. Clique no menu **File (Arquivo)** > **Open Folder (Abrir Pasta...)**.
3. Selecione a pasta onde você descompactou o projeto.

---

### 4. Abrir o Terminal no VS Code
- No VS Code, abra o terminal integrado pressionando o atalho:
  - **Windows / Linux:** `Ctrl + '` (ou `Ctrl + ~` / Menu **Terminal** > **New Terminal**)
  - **Mac:** `Cmd + ~` (ou Menu **Terminal** > **New Terminal**)

---

### 5. Instalar as Dependências
No terminal integrado do VS Code, digite o comando abaixo e pressione `Enter`:

```bash
npm install
```

> Esse comando irá baixar e instalar todas as bibliotecas listadas no `package.json` (React, Express, Tailwind CSS, Recharts, Lucide Icons, etc.).

---

### 6. Configurar as Variáveis de Ambiente (Opcional)
Se você for utilizar a função de **Parecer com Inteligência Artificial (Google Gemini)**:
1. Crie uma cópia do arquivo `.env.example` e renomeie para `.env`.
2. Adicione sua chave de API do Gemini no arquivo `.env`:
```env
GEMINI_API_KEY=sua_chave_gemini_aqui
```
*(Se não configurar a chave, o simulador, os comparativos, cálculos matemáticos, tabelas e relatórios em PDF continuarão funcionando 100% normalmente).*

---

### 7. Iniciar a Aplicação
No terminal do VS Code, execute:

```bash
npm run dev
```

Você verá a seguinte mensagem no terminal:
```bash
Server running on http://localhost:3000
```

---

### 8. Acessar no Navegador
Abra o seu navegador de preferência (Google Chrome, Edge, Safari, Firefox) e acesse:

👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Comandos Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm install` | Instala todas as dependências do projeto |
| `npm run dev` | Inicia o servidor local de desenvolvimento na porta `3000` |
| `npm run build` | Compila o frontend e o servidor otimizados para produção na pasta `dist/` |
| `npm start` | Executa a versão compilada de produção |
| `npm run lint` | Valida todos os tipos e regras TypeScript (`tsc --noEmit`) |

---

## 📋 Funcionalidades Incluídas
- **Simulação em Modo Assistente (Wizard)** ou **Modo Avançado**
- **Comparativo Antes x Depois da Reforma**: Análise lado a lado do Sistema Vigente vs Reforma 2027
- **Alíquotas IBS/CBS**: Sugeridas oficiais (transição e plena) e 100% personalizáveis
- **Segregação de Monofásicos & ICMS-ST**: PIS/COFINS monofásico e substituição tributária com presets para Farmácias, Autopeças, Bebidas, etc.
- **Análise Comercial B2B**: Impacto da transferência de créditos de IBS/CBS nas vendas PJ
- **Auditoria de Cálculos**: Modal detalhando a matemática exata de cada regime
- **Relatório Executivo PDF**: Pronto para impressão com um clique
