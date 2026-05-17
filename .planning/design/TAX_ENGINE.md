# Design do Motor de Cálculo Financeiro (2026)

## 1. Visão Geral
O Motor de Cálculo é o núcleo de inteligência do Banco de Talentos, responsável por realizar a equivalência financeira entre modelos CLT e PJ com base na legislação de 2026.

## 2. Arquitetura
- **Localização:** Centralizado no Backend (Service Layer).
- **Entrada:** Objeto `CalculationInput` (Salário Bruto, Benefícios, Despesas PJ).
- **Saída:** Objeto `CalculationResult` (Breakdown detalhado, Líquido, Total Cash, Custo Empresa).
- **Segurança:** RBAC aplicado na serialização da resposta (bloqueio de custo empresa para Candidatos).

## 3. Lógica CLT (2026)
- **INSS:** Teto de R$ 8.475,55 (Tabela Progressiva).
- **IRRF:**
  - Isenção: até R$ 5.000,00.
  - Faixa Transição (R$ 5k - R$ 7.35k): Fórmula `978,62 - (0,133145 * Bruto)`.
  - Acima de R$ 7.35k: Tabela Progressiva.
- **Provisionamento (Total Cash):** Multiplicador de **1,1111x** sobre o líquido (13º + 1/3 Férias).
- **Custo Empresa:** Multiplicador padrão de **1,61x** sobre o bruto (Encargos + Benefícios).

## 4. Lógica PJ (Simples Nacional)
- **Fator R:** Automatizado. Se `Folha / Faturamento >= 28%` -> Anexo III (~6%), senão Anexo V (~15,5%).
- **Cenário Padrão:** O sistema sempre sugere o Fator R como default, permitindo troca manual.
- **Despesas:** Inclui mensalidade do contador e campo para custos de constituição da empresa.

## 5. Decision Log
| Data | Decisão | Rationale |
| :--- | :--- | :--- |
| 16/05/2026 | Abordagem Centralizada | Garante fonte única de verdade e segurança RBAC. |
| 16/05/2026 | Multiplicador 1.1111x | Precisão técnica no provisionamento de 13º e Férias. |
| 16/05/2026 | Fator R por Padrão | Melhora a conversão e percepção de valor do modelo PJ. |

## 6. Documentação de Referência
- [Tabelas Oficiais 2026 (Gemini Shared)](https://gemini.google.com/share/2a1b6d74f610)
