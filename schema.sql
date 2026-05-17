-- Schema for Banco de Talentos (ATS & CRM)
-- Focus: RBAC and Financial Data Encryption

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
CREATE TYPE user_role AS ENUM ('CANDIDATO', 'GESTOR_DE_AREA', 'RECURSOS_HUMANOS', 'DIRETORIA', 'MASTER');

CREATE TYPE job_phase AS ENUM (
    'CONVERSA_INICIAL',
    'REUNIAO_DE_CONHECIMENTO',
    'REUNIAO_COM_DIRETORIA',
    'PROPOSTA'
);

CREATE TYPE job_sub_phase AS ENUM (
    'AGENDAR',
    'AGENDADO',
    'ENVIADA',
    'ACEITA',
    'RECUSADA',
    'SEM_INTERESSE',
    'FORA_DO_PERFIL'
);

CREATE TYPE interaction_type AS ENUM (
    'WHATSAPP',
    'LINKEDIN',
    'EMAIL',
    'REUNIAO_PRESENCIAL',
    'REUNIAO_NAO_PRESENCIAL',
    'LIGACAO'
);

CREATE TYPE financial_model AS ENUM ('CLT', 'PJ');

-- 2. Tables

-- RBAC: Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'CANDIDATO',
    department TEXT, -- For GESTOR_DE_AREA visibility (RN02)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id), -- Optional link if candidate has portal access
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    resume_s3_key TEXT, -- RF01.2 & RNF02
    parsing_data JSONB, -- Extracted skills, education, etc.
    lgpd_consent BOOLEAN DEFAULT FALSE, -- RN03
    lgpd_consent_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    department TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    status TEXT DEFAULT 'OPEN', -- OPEN, CLOSED, CANCELLED
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Applications (Bidimensional Pipeline)
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    job_id UUID NOT NULL REFERENCES jobs(id),
    current_phase job_phase NOT NULL DEFAULT 'CONVERSA_INICIAL',
    current_sub_phase job_sub_phase NOT NULL DEFAULT 'AGENDAR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

-- Standard Questions (Must-Ask logic)
CREATE TABLE standard_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_target job_phase NOT NULL,
    question_text TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE, -- RN04
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Interactions (CRM)
CREATE TABLE candidate_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES job_applications(id),
    type interaction_type NOT NULL,
    content TEXT, -- Summary or message content
    media_s3_url TEXT, -- Link to audio/video/doc in S3
    transcript_text TEXT, -- IA summary/transcript (RF02.3)
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial History (Encrypted Data)
-- Using BYTEA for encrypted decimals to ensure RN01 compliance
CREATE TABLE candidate_financial_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    application_id UUID REFERENCES job_applications(id),
    
    current_model financial_model,
    expected_model financial_model,
    proposed_model financial_model,
    
    -- Encrypted fields (Encrypted at application level or via pgcrypto)
    -- Storing as BYTEA to hold the ciphertext
    current_monthly_salary_enc BYTEA,
    current_total_cash_enc BYTEA,
    expected_monthly_salary_enc BYTEA,
    expected_total_cash_enc BYTEA,
    proposed_monthly_salary_enc BYTEA,
    proposed_total_cash_enc BYTEA,
    
    notes TEXT, -- Rich text for negotiation notes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for Performance & RBAC
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_jobs_department ON jobs(department);
CREATE INDEX idx_job_applications_phase ON job_applications(current_phase, current_sub_phase);
CREATE INDEX idx_financial_candidate ON candidate_financial_histories(candidate_id);

-- 4. Audit Log (RN06 - Rastreabilidade Absoluta)
-- Prevents deletion by logic (we could add triggers or a separate log table)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE (though we avoid delete)
    changed_data JSONB,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for clarity
COMMENT ON COLUMN candidate_financial_histories.current_monthly_salary_enc IS 'Encrypted monthly salary using AES or similar application-level encryption.';
COMMENT ON COLUMN users.department IS 'Used to filter visibility for GESTOR_DE_AREA (RBAC).';
