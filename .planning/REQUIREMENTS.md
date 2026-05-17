# Requisitos do Sistema - Banco de Talentos

## 1. Requisitos Funcionais (RF)

### Gestão de Talentos
- **RF01.1 - Tipos de Banco:** Interno, Externo e Misto.
- **RF01.2 - Parsing de CVs:** IA para extração de dados de PDF/Word.
- **RF01.3 - Filtros de Triagem:** Hard/Soft skills, diversidade, formação.

### CRM e Interações
- **RF02.1 - Central de Mensageria:** WhatsApp, LinkedIn e E-mail integrados.
- **RF02.2 - Histórico de Interações:** Log completo e timeline.
- **RF02.3 - Transcrição via IA:** Resumo de áudios e vídeos de reuniões.
- **RF02.4 - Feedback Contínuo:** Facilitação de retorno aos candidatos.

### Workflow de Recrutamento
- **RF03.1 - Pipeline Bidimensional:** Fases (Conversa, Conhecimento, Diretoria, Proposta) e Sub-fases (Agendar, Aceita, etc.).
- **RF03.2 - Metodologia STAR:** Entrevistas estruturadas.
- **RF03.3 - Banco de Perguntas:** Cadastro de perguntas por fase/cargo.
- **RF03.4 - Must-Ask:** Perguntas obrigatórias na interação.

### Calculadora CLT vs. PJ 2026
- **RF04.1 - Motor CLT 2026:** Isenção até R$ 5k, teto INSS R$ 8.4k, 13º, férias, FGTS.
- **RF04.2 - Motor PJ 2026:** Simples Nacional, Fator R, despesas operacionais.
- **RF04.3 - Visão Candidato:** Ganho líquido e total cash.
- **RF04.4 - Visão Interna:** Custo total empresa (1.61x multi).

### Financeiro e Negociação
- **RF05.1 - Linha do Tempo Financeira:** Cenário Atual, Pretendido e Proposto.

## 2. Regras de Negócio (RN)
- **RN01 - Criptografia Financeira:** Dados sensíveis criptografados em repouso.
- **RN02 - Mascaramento em Tela:** RBAC para valores financeiros.
- **RN03 - Consentimento LGPD:** Aceite obrigatório de termos.
- **RN04 - Trava Must-Ask:** Bloqueio de avanço sem perguntas preenchidas.
- **RN05 - Trava de Feedback:** Impede fechamento de vaga com pendências.
- **RN06 - Rastreabilidade Absoluta:** Proibição de exclusão de histórico.

## 3. Requisitos Não Funcionais (RNF)
- **RNF01 - PostgreSQL na AWS:** RDS/Aurora.
- **RNF02 - AWS S3:** Armazenamento de arquivos pesados.
- **RNF03 - Background Jobs:** Redis/RabbitMQ para parsing e transcrição.
- **RNF04 - Integração APIs:** WhatsApp Business, AWS SES.
- **RNF05 - IA (LLM/OCR):** OpenAI/Claude/AWS Textract.
