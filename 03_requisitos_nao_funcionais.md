# Documento de Requisitos Não Funcionais (RNF)

## 1. Infraestrutura Cloud (AWS) e Banco de Dados
* **RNF01 - Banco de Dados Principal (PostgreSQL):** A aplicação utilizará banco de dados **PostgreSQL hospedado na AWS (Amazon RDS ou Aurora)**. A modelagem utilizará os recursos robustos do Postgres, como campos `JSONB` e Enums nativos para gerenciar as fases do pipeline.
* **RNF02 - Cloud Storage (AWS S3):** Para garantir desempenho do banco principal, arquivos pesados como currículos em PDF/Word, fotos e gravações/transcrições de reuniões devem ser armazenados em buckets do **Amazon S3**. O banco salvará apenas as chaves (URLs/referências).
* **RNF03 - Filas e Background Jobs:** Tarefas pesadas como o parsing de currículos, envios em massa de feedbacks e transcrição de reuniões remotas devem rodar assincronamente (ex: Redis/RabbitMQ/Sidekiq).

## 2. Integrações (APIs)
* **RNF04 - Mensageria Integrada:** Conexão com API Oficial do WhatsApp (WhatsApp Business) e serviços de E-mail (ex: AWS SES/SendGrid).
* **RNF05 - IA e Transcrição (LLMs e OCR):** Integração com modelos de Inteligência Artificial (OpenAI, Claude ou AWS Textract/Transcribe) para leitura de PDFs e sumarização/transcrição de arquivos de áudio de conversas.
* **RNF06 - LinkedIn:** Integração para captação dos perfis ou espelhamento via LinkedIn Recruiter.

--------------------------------------------------------------------------------