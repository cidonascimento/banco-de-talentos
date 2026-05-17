# Documento de Requisitos Funcionais (RF) - Sistema de Gestão de Talentos (ATS) e CRM

## 1. Banco de Talentos e Gestão de Currículos
* **RF01.1 - Tipos de Banco:** O sistema deve suportar um pipeline constante [1] dividido em banco de talentos interno (colaboradores atuais para sucessão), externo (novos candidatos) e misto [2, 3].
* **RF01.2 - Upload e Parsing de CVs:** Permitir o upload de currículos (PDF/Word) e utilizar inteligência artificial para extração (parsing) de dados e preenchimento automático do perfil [4].
* **RF01.3 - Filtros de Triagem:** Busca avançada para filtrar candidatos por habilidades específicas (hard/soft skills), formação, idiomas e marcadores de diversidade [5, 6].

## 2. CRM Omnichannel e Gestão de Interações
* **RF02.1 - Central de Mensageria:** O sistema deve permitir que as mensagens saiam do aplicativo, disparando e registrando conversas de WhatsApp, LinkedIn e E-mail centralizadas na plataforma [7, 8].
* **RF02.2 - Histórico de Interações:** Armazenar o log completo de interações (mensagens, ligações, reuniões presenciais e não presenciais) na timeline do candidato.
* **RF02.3 - Transcrição de Reuniões:** Upload, guarda e leitura (extração de resumo via IA) de transcrições de conversas em áudio ou vídeo interagidas com o candidato.
* **RF02.4 - Feedback Contínuo:** Facilitação e envio ágil de feedbacks (positivos ou negativos) aos candidatos para melhorar a marca empregadora (Employer Branding) e evitar a falta de comunicação com candidatos [9-11].

## 3. Gestão do Processo Seletivo (Workflow)
* **RF03.1 - Pipeline Bidimensional (Fases e Sub-fases):** O sistema deve gerenciar o avanço do candidato utilizando uma estrutura bidimensional para controle Kanban e relatórios ágeis:
  * **Fases Principais:** Conversa Inicial, Reunião de Conhecimento, Reunião com a Diretoria, Proposta.
  * **Sub-fases:** Agendar, Agendado, Enviada, Aceita, Recusada, Sem interesse, Fora do perfil.
* **RF03.2 - Entrevistas Estruturadas (STAR):** Suporte para registros baseados na metodologia STAR (Situação, Tarefa, Ação e Resultado) para avaliar objetivamente como o candidato atuou em situações reais e prever comportamentos futuros [12-14].
* **RF03.3 - Base de Perguntas Padrão:** Módulo para o RH cadastrar um banco de perguntas de entrevista, vinculadas às Fases do processo ou ao Cargo.
* **RF03.4 - Roteiro de Perguntas Obrigatórias (Must-Ask):** Na tela de registro da interação, o sistema deve carregar automaticamente o formulário de perguntas padrão daquela fase para o recrutador preencher.

## 4. Calculadora de Equivalência CLT vs. PJ
* **RF04.1 - Motor CLT 2026:** O cálculo deve considerar a nova isenção de Imposto de Renda (IRRF) para remunerações de até R$ 5.000,00 e a redução gradual para salários até R$ 7.350,00 [15-17]. Deve incluir também os descontos de INSS atualizados (teto de R$ 8.475,55) [18], além dos acréscimos proporcionais de 13º salário, férias (com 1/3) e FGTS [19, 20].
* **RF04.2 - Motor PJ 2026:** O cálculo PJ deve prever impostos do Simples Nacional, aplicando o cálculo do Fator R (folha >= 28% do faturamento) para garantir a tributação vantajosa no Anexo III (alíquota inicial próxima a 6%) ao invés do Anexo V (inicial de 15,5%) [21, 22]. Deve computar também as despesas operacionais (ex: contador) [23].
* **RF04.3 - Visão do Candidato (Equivalência Líquida):** Tela focada em exibir o "Líquido Mensal" e "Total Cash", comparando o ganho real de cada modelo sem exibir custos extras da empresa [20, 24]. 
* **RF04.4 - Visão Interna (Custo Empregador):** Tela gerencial que demonstra o Custo Total da Empresa (Salário Bruto + Encargos Patronais de cerca de 1.61x + Benefícios) comparado ao custo do contrato PJ [25, 26].

## 5. Histórico Financeiro e de Negociação do Candidato
* **RF05.1 - Linha do Tempo Financeira:** O sistema deve registrar um histórico para facilitar propostas salariais, contendo por etapa:
  - **Cenário Atual:** Modelo Atual (CLT/PJ), Salário Mensal Atual, Total Cash Atual.
  - **Cenário Pretendido:** Modelo Pretendido (CLT/PJ), Salário Mensal Pretendido, Total Cash Pretendido.
  - **Cenário Proposto:** Modelo Proposto (CLT/PJ), Salário Mensal Proposto, Total Cash Proposto.
  - **Observações:** Campo para notas de negociação (ex: benefícios irrenunciáveis, exigência de exclusividade) [27].

--------------------------------------------------------------------------------