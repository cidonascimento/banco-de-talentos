-- Seed Data for standard_questions
-- Based on STAR methodology and market recommendations

INSERT INTO standard_questions (phase_target, question_text, is_mandatory) VALUES
('CONVERSA_INICIAL', 'Me conte sobre você e sua trajetória profissional.', TRUE),
('CONVERSA_INICIAL', 'Por que você quer trabalhar na nossa empresa e o que te motiva?', TRUE),
('REUNIAO_DE_CONHECIMENTO', 'Quais são os seus principais pontos fortes e como lida com suas áreas de melhoria?', TRUE),
('REUNIAO_DE_CONHECIMENTO', 'Como você toma decisões importantes ou lida com cenários de grande pressão?', TRUE),
('REUNIAO_DE_CONHECIMENTO', 'Conte-me sobre um momento ou projeto em que a tecnologia foi essencial para o sucesso da equipe. (STAR)', TRUE),
('REUNIAO_DE_CONHECIMENTO', 'Você usa ou tem curiosidade sobre alguma ferramenta de Inteligência Artificial no seu dia a dia? Como se mantém atualizado?', TRUE);

-- Create some default roles for testing
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin Master', 'admin@bancodetalentos.com.br', 'pbkdf2:sha256:default_hash', 'MASTER'),
('Diretor Financeiro', 'diretoria@bancodetalentos.com.br', 'pbkdf2:sha256:default_hash', 'DIRETORIA'),
('Recrutador Sênior', 'rh@bancodetalentos.com.br', 'pbkdf2:sha256:default_hash', 'RECURSOS_HUMANOS');
