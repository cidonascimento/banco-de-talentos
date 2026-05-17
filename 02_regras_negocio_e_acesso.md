# Documento de Regras de Negócio, Acesso e Automação (RN)

## 1. Níveis de Acesso (RBAC)
O controle de acesso é estrito e atende à conformidade exigida de sistemas ATS modernos:
* **Candidato:** Acesso apenas ao próprio portal para envio de dados, preenchimento de formulários simplificados [28] e visão da Calculadora CLT/PJ restrita aos ganhos líquidos.
* **Gestor de Área:** Visão departamental. Pode visualizar apenas as informações e as remunerações dos candidatos das suas respectivas vagas.
* **Recursos Humanos (RH):** Acesso total à operação de recrutamento, funil, banco de currículos e perfis comportamentais.
* **Diretoria:** Acesso total à plataforma (dashboards, custos totais na Calculadora Interna e aprovações estratégicas).
* **Master (Admin):** Acesso total para configurações globais.

## 2. Conformidade e Segurança (LGPD)
* **RN01 - Criptografia Financeira:** Dados sensíveis de Salário e Total Cash (Atual, Pretendido e Proposto) devem obrigatoriamente usar criptografia em repouso.
* **RN02 - Mascaramento em Tela:** Valores financeiros ficam ocultos/mascarados para o Gestor de Área quando não pertencerem às vagas de seu setor.
* **RN03 - Consentimento LGPD:** Todo candidato deve aceitar termos claros sobre coleta de dados, finalidade e tempo de armazenamento no banco da empresa [29, 30].

## 3. Travas de Automação (Gatilhos de Workflow)
* **RN04 - Trava de Perguntas Obrigatórias:** Bloquear o avanço do candidato para a próxima Fase/Sub-fase caso as perguntas marcadas como obrigatórias (Must-Ask) não tenham sido preenchidas na etapa corrente.
* **RN05 - Trava de Feedback:** Impedir o fechamento de uma vaga caso haja candidatos com status pendente no funil; envio automático de retornos aos reprovados.
* **RN06 - Rastreabilidade Absoluta:** O sistema não permite a exclusão do histórico de interações (mensagens, áudios transcritos), garantindo uma fonte única de verdade do processo.

--------------------------------------------------------------------------------