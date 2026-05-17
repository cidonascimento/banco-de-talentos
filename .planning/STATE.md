# Estado do Projeto - Banco de Talentos

## Últimas Ações
- Inicialização do projeto via GSD framework.
- Criação do `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md` e `config.json`.
- **Implementação Completa do Motor de Equivalência Financeira CLT vs PJ 2026** (Fase 5 do Roadmap).
- Desenvolvimento do Frontend Premium responsivo com suporte a Visão do Candidato e Visão Interna (RH/Diretoria).
- Acoplamento de Bônus Anual PJ, Provisões de 13º/Férias/FGTS e cálculo exato de custos de empresa (INSS Patronal, RAT, Terceiros).
- Adicionadas máscaras de moeda BRL em tempo real nos inputs e correções de usabilidade e transições.

## Próximos Passos
1. [ ] Implementar Schema PostgreSQL (Tabelas Core + RBAC + Financial Hist).
2. [ ] Configurar Enums nativos para Fases e Sub-fases.
3. [ ] Garantir criptografia de campos sensíveis (salário, etc).
4. [ ] Conectar o motor da Calculadora com a persistência de simulações do banco de dados (Milestone 3).

## Bloqueios / Riscos
- Definição final das chaves simétricas de criptografia para histórico salarial no banco de dados.

---
*Atualizado em: 2026-05-16*
