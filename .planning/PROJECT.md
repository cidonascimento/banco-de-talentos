# Banco de Talentos - ATS & CRM de Última Geração

Sistema de Gestão de Talentos (ATS) e CRM focado em transparência, automação e conformidade financeira (2026).

## Contexto
O projeto visa modernizar o processo de recrutamento, integrando um CRM omnichannel com uma calculadora de equivalência CLT vs. PJ atualizada para as regras de 2026. O sistema garante rastro absoluto de interações e segurança rigorosa de dados financeiros.

## Core Value
Proporcionar uma experiência de recrutamento fluida e transparente, permitindo que candidatos e empresas tomem decisões financeiras baseadas em dados reais e atualizados.

## O Que é Isso?
- Um **ATS** com pipeline bidimensional (Fases e Sub-fases).
- Um **CRM Omnichannel** (WhatsApp, LinkedIn, Email).
- Uma **Calculadora CLT vs. PJ 2026** (com Fator R e isenção de IR até R$ 5k).
- Um **Módulo de Entrevistas Estruturadas** (Metodologia STAR).
- Um **Banco de Talentos** com parsing de currículos via IA.

## Quem é Isso?
- **Candidatos**: Buscam transparência e agilidade no processo.
- **RH / Recrutadores**: Precisam de automação, filtros avançados e gestão de funil.
- **Gestores de Área**: Precisam de visibilidade sobre o pipeline de suas vagas.
- **Diretoria**: Busca insights estratégicos e controle de custos totais.

## O Que "Pronto" Parece?
- Pipeline de recrutamento funcional com automações de trava (Must-Ask).
- Motor de cálculo financeiro 2026 validado e gerando comparativos.
- Histórico financeiro criptografado e acessível via RBAC.
- Integração de mensageria centralizada com transcrição de reuniões via IA.

## Requisitos

### Ativos
- [ ] Implementação do Schema PostgreSQL (RBAC + Financial Encryption).
- [x] Motor de Cálculo CLT/PJ 2026 (RF04).
- [ ] Pipeline Bidimensional e Gestão de Vagas (RF03).
- [ ] Integração de IA para Parsing de CVs e Transcrições (RF01, RF02).
- [ ] Sistema de Travas de Automação (RN04, RN05).

## Decisões Principais
| Decisão | Motivação | Status |
| :--- | :--- | :--- |
| **PostgreSQL na AWS** | Robustez, suporte a JSONB e Enums nativos. | Pendente |
| **AWS S3 para Mídia** | Performance e custo de armazenamento de arquivos pesados. | Pendente |
| **Criptografia em Repouso** | Conformidade LGPD e segurança de dados sensíveis. | Pendente |
| **RBAC Estrito** | Garantia de privacidade e separação de deveres. | Pendente |
| **Motor Equivalência Bidirecional** | Busca binária de precisão para conciliar receita real líquida. | Concluído |

---
*Última atualização: 2026-05-16 após finalização da Calculadora de Equivalência*
