# Banco de Talentos - ATS & CRM de Última Geração (Calculadora 2026)

Bem-vindo ao **Banco de Talentos**, um ecossistema completo de Gestão de Candidatos (ATS) e CRM omnichannel projetado com foco em transparência, automação e inteligência financeira para 2026.

Este documento consolida a arquitetura, as fórmulas fiscais de 2026 e o funcionamento do **Motor de Equivalência Financeira CLT vs PJ** desenvolvido e otimizado com maestria técnica.

---

## 📊 Motor de Equivalência CLT vs PJ 2026

O núcleo de inteligência financeira do projeto resolve a conciliação real do **Total Cash** recebido pelo colaborador e do **Custo Total** suportado pela empresa, considerando as regras fiscais vigentes para 2026 no Brasil.

### 1. Parâmetros Fiscais Aplicados (2026)
*   **Isenção de IRRF:** Limite de isenção de IRRF fixado em **R$ 5.000,00** mensais.
*   **Transição de Alíquotas de IRRF:**
    *   Salários entre **R$ 5.000,01** e **R$ 7.350,00** passam por uma fórmula de amortização contínua para evitar saltos tributários abruptos:
        $$\text{IRRF} = \max(0, 978,62 - (0,133145 \times \text{Salário Bruto}))$$
    *   Salários acima de **R$ 7.350,00** entram na alíquota nominal de **27,5%** com dedução de **R$ 893,36**.
*   **Teto do INSS:** Fixado em **R$ 8.475,55** (contribuição individual máxima de **R$ 988,09** a 14%).
*   **Fator R (Simples Nacional):** Aplicado no PJ para garantir o enquadramento no **Anexo III (alíquota de 6% sobre faturamento bruto)** em vez do Anexo V (15,5%), condicionando o Pró-Labore a exatamente **28%** do faturamento mensal.

---

### 2. Lógica Matemática do Total Cash e Equivalência
O motor compara a renda real anual acumulada dividida de forma linear por 12 (**Total Cash** ou **Líquido + Provisões**).

#### 💼 Modelo CLT (Líquido + Provisões)
Para um salário bruto $S$ e benefícios mensais $B$:
1.  **Descontos:**
    *   $\text{INSS} = \min(S \times 0.14, 988,09)$
    *   $\text{IRRF}$ calculado de acordo com as regras de transição/alíquotas de 2026.
2.  **Líquido Mensal Real (Pago em conta):**
    *   $$\text{Líquido Mensal} = S - \text{INSS} - \text{IRRF} + B$$
3.  **Provisões Diferidas (Diluídas em 1/12):**
    *   **13º Salário:** $S \times \frac{1}{12} \approx S \times 8,33\%$
    *   **1/3 de Férias:** $S \times \frac{1}{3} \times \frac{1}{12} \approx S \times 2,78\%$
    *   **FGTS (Depósito):** $S \times 8\%$
    *   **Bônus/PLR Anual:** $\frac{\text{Bônus Anual}}{12}$
4.  **CLT Total Cash:**
    *   $$\text{CLT Total Cash} = \text{Líquido Mensal} + \text{Provisões}$$

#### 🏢 Modelo PJ (Líquido + Provisões)
Para um faturamento bruto $F$ e despesas mensais operacionais $D$:
1.  **Deduções:**
    *   $\text{DAS (Anexo III - 6%)} = F \times 6\%$
    *   $\text{Pró-labore} = F \times 28\%$
    *   $\text{INSS Pró-labore (11%)} = \min(\text{Pró-labore} \times 11\%, 988,09)$
    *   $\text{IRRF Pró-labore (7,5% se aplicável)}$
2.  **Líquido Mensal Real (Faturamento Líquido):**
    *   $$\text{Líquido Mensal PJ} = F - \text{DAS} - \text{INSS Pró-labore} - \text{IRRF Pró-labore} - D$$
3.  **Provisões Diferidas (Diluídas em 1/12):**
    *   **Bônus/PLR Anual PJ:** $\frac{\text{Bônus Anual PJ}}{12}$
4.  **PJ Total Cash:**
    *   $$\text{PJ Total Cash} = \text{Líquido Mensal PJ} + \text{Provisões PJ}$$

---

### 3. Solucionador Numérico Bidirecional (Algoritmo de Convergência)
A calculadora não utiliza índices ou aproximações médias. Ela emprega um algoritmo de **Busca Binária de Alta Precisão (erro menor que $10^{-6}$)** para encontrar a equivalência perfeita em tempo real:

*   **CLT Base $\rightarrow$ PJ Equivalente:** O algoritmo busca o faturamento bruto PJ ($F$) onde o $\text{PJ Total Cash}(F)$ seja exatamente igual ao $\text{CLT Total Cash}$ do salário inserido.
*   **PJ Base $\rightarrow$ CLT Equivalente:** O algoritmo busca o salário bruto CLT ($S$) onde o $\text{CLT Total Cash}(S)$ seja exatamente igual ao $\text{PJ Total Cash}$ do faturamento PJ inserido.

---

### 4. Custo Total da Empresa (Visão RH/Diretoria)
Além do salário e benefícios diretos, a calculadora expõe de forma transparente linha a linha todos os encargos patronais da empresa para o modelo CLT:
*   **INSS Patronal:** $S \times 20\%$
*   **RAT + Terceiros:** $S \times (2\% + 5.8\%) = S \times 7,8\%$
*   **FGTS Completo (Depósito + Provisão de Multa Rescisória):** $S \times (8\% + 3,2\%) = S \times 11,2\%$
*   **Provisão de 13º e Férias Patronal com reflexo de encargos:** Cálculo completo das provisões acrescidas de todos os encargos trabalhistas correspondentes.

---

## 🎨 Interface do Usuário (UI/UX Premium)

Desenvolvida com a metodologia **`html-tailwind`** e estilização **Vanilla CSS** moderna seguindo o padrão **UI/UX Pro Max**:

1.  **Destaques de Topo Sincronizados:** O topo das colunas de resultado exibe em destaque o **Salário Base / Faturamento PJ** ao lado do valor consolidado de **Líquido + Provisões** (Total Cash).
2.  **Visão Dupla Dinâmica:**
    *   **Visão Candidato:** Exibe o Líquido Mensal, o accordion de Provisões detalhado (FGTS, 13º, Férias e Bônus) e as deduções do seu holerite.
    *   **Visão Interna (RH/Diretoria):** Revela a estrutura completa de Custos da Empresa linha por linha abaixo do card CLT.
3.  **Entradas com Máscara Bancária:** Todos os inputs contam com máscara monetária de digitação em tempo real (baseada em centavos). A digitação é extremamente fluida, com foco em brilho neon ativo.
4.  **Abas Internas Interativas:** Barra de entrada dividida entre a aba de **Benefícios** e **Custos PJ** (contador mensal e bônus PJ), com funcionamento perfeito e transições de opacidade.
5.  **Acessibilidade e Harmonia de Cores:** Design Dark Mode em tons de Slate (`#0f172a`), com realces em Azul Ciano (`#38bdf8`) para elementos CLT/Base e Verde Esmeralda (`#10b981`) para elementos PJ, garantindo excelente contraste visual (norma WCAG AAA).

---

## 💻 Como Rodar Localmente

A calculadora é uma aplicação web estática purificada (HTML5 + CSS3 + JS Vanilla), ideal para carregamento instantâneo.

1.  **Iniciar Servidor de Desenvolvimento:**
    Você pode utilizar qualquer servidor estático leve para rodar o projeto. Por exemplo, utilizando `serve` (NodeJS):
    ```bash
    npx -y serve -p 3000 public/calculator
    ```
2.  **Acessar a Aplicação:**
    Abra o seu navegador e navegue até [http://localhost:3000](http://localhost:3000).

---

## 📁 Estrutura de Arquivos da Calculadora
*   `public/calculator/index.html`: Estrutura semântica HTML5, accordions e sidebar de dados.
*   `public/calculator/style.css`: Tokens de design system, glassmorphic cards, efeitos de hover e responsividade.
*   `public/calculator/script.js`: Motor matemático, solucionador de busca binária e manipuladores de eventos/máscaras.
