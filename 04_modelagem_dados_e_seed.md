# Documento de Modelagem Específica e Seed Data

## 1. Modelagem: Histórico Financeiro do Candidato
A tabela `candidate_financial_histories` (relação 1:N com candidatos) conterá:
* `candidate_id` (UUID, Foreign Key)
* `current_model`, `expected_model`, `proposed_model` (Enum: 'CLT', 'PJ')
* Valores monetários: `current_monthly_salary`, `current_total_cash`, `expected_monthly_salary`, `expected_total_cash`, `proposed_monthly_salary`, `proposed_total_cash` (Decimals, **Criptografados em Repouso**)
* `notes` (Texto rico).

## 2. Modelagem: Pipeline de Vagas Bidimensional
Na tabela `job_applications`, os status serão substituídos por 2 campos do tipo Enum do PostgreSQL:
* `current_phase` (Enum):
  - 'CONVERSA_INICIAL'
  - 'REUNIAO_DE_CONHECIMENTO'
  - 'REUNIAO_COM_DIRETORIA'
  - 'PROPOSTA'
* `current_sub_phase` (Enum):
  - 'AGENDAR'
  - 'AGENDADO'
  - 'ENVIADA'
  - 'ACEITA'
  - 'RECUSADA'
  - 'SEM_INTERESSE'
  - 'FORA_DO_PERFIL'

## 3. Modelagem: Banco de Perguntas Padrão e Interações
A tabela `standard_questions` conterá:
* `id` (UUID)
* `phase_target` (Enum mapeando a Fase do funil)
* `question_text` (Texto)
* `is_mandatory` (Boolean - Default True para acionar a Trava)
* `active` (Boolean)

A tabela `candidate_interactions` armazenará:
* `type` (Enum: WhatsApp, Linkedin, Email, Reunião presencial, Reunião não presencial, Ligação)
* `media_s3_url` (String - Link seguro do arquivo na AWS)
* `transcript_text` (Texto - O resumo/transcrição gerado pela IA)

## 4. Seed Data: Perguntas Padrão (Exemplos para o Banco)
A IA deve popular a tabela `standard_questions` com as perguntas mais recomendadas pelo mercado (foco em cultura, habilidades e metodologia STAR) [12, 31-36]:
1. "Me conte sobre você e sua trajetória profissional." (Fase: Conversa Inicial)
2. "Por que você quer trabalhar na nossa empresa e o que te motiva?" (Fase: Conversa Inicial)
3. "Quais são os seus principais pontos fortes e como lida com suas áreas de melhoria?" (Fase: Reunião de Conhecimento)
4. "Como você toma decisões importantes ou lida com cenários de grande pressão?" (Fase: Reunião de Conhecimento / Diretoria)
5. **(STAR)** "Conte-me sobre um momento ou projeto em que a tecnologia foi essencial para o sucesso da equipe." (Fase: Reunião de Conhecimento)
6. "Você usa ou tem curiosidade sobre alguma ferramenta de Inteligência Artificial no seu dia a dia? Como se mantém atualizado?" (Fase: Reunião de Conhecimento)