# Roadmap do Projeto - Banco de Talentos

## Milestone 1: Fundação e Segurança
- **Fase 1: Infraestrutura e Dados**
  - Setup do Schema PostgreSQL (RBAC, Enums, Tabelas Core).
  - Implementação de Criptografia em Repouso para campos financeiros.
  - Setup de Auth e Níveis de Acesso (Candidate, RH, Gestor, Director, Admin).
- **Fase 2: Banco de Perguntas e Seed**
  - CRUD de `standard_questions`.
  - População de Seed Data (Perguntas STAR).

## Milestone 2: Fluxo de Recrutamento (ATS)
- **Fase 3: Gestão de Vagas e Candidatos**
  - CRUD de Vagas e Candidatos.
  - Upload de CVs para S3 (sem parsing ainda).
- **Fase 4: Pipeline Bidimensional**
  - Implementação do Kanban com Fases e Sub-fases.
  - Travas de Automação (Must-Ask).

## Milestone 3: Inteligência Financeira
- **Fase 5: Motor de Cálculo 2026**
  - Implementação das regras CLT (IRRF 2026, INSS).
  - Implementação das regras PJ (Fator R, Simples).
- **Fase 6: Histórico e Negociação**
  - Histórico financeiro do candidato (Cenários).
  - Visões de Equivalência (Candidato vs Empresa).

## Milestone 4: CRM e IA
- **Fase 7: Mensageria Omnichannel**
  - Integração WhatsApp/Email/LinkedIn.
  - Timeline de interações.
- **Fase 8: Automação Inteligente**
  - Parsing de CVs via IA.
  - Transcrição e resumo de reuniões.

## Milestone 5: Conformidade e Lançamento
- **Fase 9: LGPD e Auditoria**
  - Consentimento e rastreabilidade absoluta.
  - Mascaramento de dados em tela.
- **Fase 10: Dashboards e Relatórios**
  - Visão estratégica para Diretoria.
