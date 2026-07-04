CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES users(id),
  name text NOT NULL,
  cin text,
  registered_office text,
  reporting_framework text NOT NULL DEFAULT 'division_ii_ind_as',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reporting_periods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES companies(id),
  label text NOT NULL,
  period_type text NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'half_yearly', 'annual')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  financial_year text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE trial_balance_uploads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_id uuid NOT NULL REFERENCES reporting_periods(id),
  original_name text NOT NULL,
  stored_path text NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  debit_total numeric(18,2) NOT NULL DEFAULT 0,
  credit_total numeric(18,2) NOT NULL DEFAULT 0,
  variance numeric(18,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ledger_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id uuid NOT NULL REFERENCES trial_balance_uploads(id),
  period_id uuid NOT NULL REFERENCES reporting_periods(id),
  raw_name text NOT NULL,
  normalized_name text NOT NULL,
  parent_group text,
  debit_amount numeric(18,2) NOT NULL DEFAULT 0,
  credit_amount numeric(18,2) NOT NULL DEFAULT 0,
  net_amount numeric(18,2) NOT NULL DEFAULT 0,
  source_row_number integer
);

CREATE TABLE ledger_mapping_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id uuid NOT NULL REFERENCES trial_balance_uploads(id),
  period_id uuid NOT NULL REFERENCES reporting_periods(id),
  ledger_entry_id uuid NOT NULL REFERENCES ledger_entries(id),
  status text NOT NULL CHECK (status IN ('mapped', 'unmapped')),
  schedule_line_id text,
  schedule_label text,
  statement text,
  section text,
  xbrl_element text,
  mapping_source text,
  confidence_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE report_runs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES companies(id),
  period_id uuid NOT NULL REFERENCES reporting_periods(id),
  report_type text NOT NULL CHECK (report_type IN ('standalone', 'consolidated')),
  metadata jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL,
  file_name text,
  output_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

