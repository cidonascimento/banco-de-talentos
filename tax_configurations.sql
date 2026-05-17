-- Tax configurations for 2026 rules
-- Used by the Financial Engine to avoid hardcoding values

CREATE TABLE tax_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value DECIMAL NOT NULL,
    category TEXT NOT NULL, -- 'INSS', 'IRRF', 'MULT', 'PJ'
    valid_from DATE NOT NULL DEFAULT '2026-01-01',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Data for 2026
INSERT INTO tax_configurations (key, value, category, description) VALUES
-- INSS
('INSS_CEILING', 8475.55, 'INSS', 'Teto máximo de contribuição previdenciária 2026'),
('INSS_MAX_CONTRIBUTION', 988.09, 'INSS', 'Valor máximo de contribuição efetiva para o teto'),

-- IRRF
('IRRF_EXEMPTION_LIMIT', 5000.00, 'IRRF', 'Limite de isenção total de IRRF 2026'),
('IRRF_TRANSITION_CEILING', 7350.00, 'IRRF', 'Limite superior da faixa de transição com redutor'),
('IRRF_REDUCER_FIXED', 978.62, 'IRRF', 'Valor fixo do redutor na faixa de transição'),
('IRRF_REDUCER_COEFF', 0.133145, 'IRRF', 'Coeficiente multiplicador do redutor (0.133145)'),

-- Multipliers / Indices (Granular)
('INSS_PATRONAL', 0.20, 'CORP', 'INSS Patronal (20%)'),
('RAT', 0.02, 'CORP', 'RAT/FAP (estimado 2%)'),
('TERCEIROS', 0.058, 'CORP', 'Outras Entidades/Terceiros (5.8%)'),
('FGTS', 0.08, 'CORP', 'FGTS Mensal (8%)'),
('FGTS_FINE_PROVISION', 0.032, 'CORP', 'Provisão Multa FGTS (40% de 8% = 3.2%)'),

-- Provision Rates
('PROVISION_13TH', 0.0833, 'PROV', 'Provisão 13º Salário (1/12)'),
('PROVISION_VACATION', 0.0833, 'PROV', 'Provisão Férias (1/12)'),
('PROVISION_VACATION_1_3', 0.0278, 'PROV', 'Provisão 1/3 Férias (1/3 de 1/12)'),

-- PJ / Simples Nacional
('SIMPLES_ANEXO_III_INITIAL', 0.06, 'PJ', 'Alíquota inicial Anexo III (6%)'),
('SIMPLES_ANEXO_V_INITIAL', 0.155, 'PJ', 'Alíquota inicial Anexo V (15.5%)'),
('FATOR_R_THRESHOLD', 0.28, 'PJ', 'Limite de 28% para enquadramento no Fator R');
