#!/bin/bash
# scripts/init-neondb.sql
# Initialize database schema for NeonDB

-- Create tables
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reporting_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    period_name VARCHAR(255) NOT NULL,
    period_type VARCHAR(50) NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly', 'custom')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, period_name)
);

CREATE TABLE IF NOT EXISTS trial_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporting_period_id UUID NOT NULL REFERENCES reporting_periods(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trial_balance_id UUID NOT NULL REFERENCES trial_balances(id) ON DELETE CASCADE,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    debit DECIMAL(18,2),
    credit DECIMAL(18,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mapping_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporting_period_id UUID NOT NULL REFERENCES reporting_periods(id) ON DELETE CASCADE,
    ledger_entry_id UUID NOT NULL REFERENCES ledger_entries(id) ON DELETE CASCADE,
    mapped_account VARCHAR(255),
    mapping_status VARCHAR(50) DEFAULT 'unmapped' CHECK (mapping_status IN ('mapped', 'unmapped', 'draft')),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporting_period_id UUID NOT NULL REFERENCES reporting_periods(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_path VARCHAR(500),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reporting_periods_company_id ON reporting_periods(company_id);
CREATE INDEX IF NOT EXISTS idx_trial_balances_period_id ON trial_balances(reporting_period_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_tb_id ON ledger_entries(trial_balance_id);
CREATE INDEX IF NOT EXISTS idx_mapping_results_period_id ON mapping_results(reporting_period_id);
CREATE INDEX IF NOT EXISTS idx_mapping_results_status ON mapping_results(mapping_status);
CREATE INDEX IF NOT EXISTS idx_report_runs_period_id ON report_runs(reporting_period_id);
CREATE INDEX IF NOT EXISTS idx_report_runs_status ON report_runs(status);
