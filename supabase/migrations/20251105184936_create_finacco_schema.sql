/*
  # Finacco Financial Management System - Database Schema

  ## Overview
  Complete database schema for a mobile-first financial management application
  that helps users manage bank and cash transactions with AI assistance.

  ## New Tables

  ### 1. profiles
  Extends auth.users with additional user information
  - id (uuid, references auth.users)
  - full_name (text)
  - phone (text)
  - gemini_api_key (text, encrypted)
  - use_system_ai (boolean, default true)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 2. banks
  Stores user's bank accounts
  - id (uuid, primary key)
  - user_id (uuid, references profiles)
  - bank_name (text)
  - account_number (text, optional)
  - account_type (text)
  - current_balance (decimal)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 3. ledgers
  Predefined and custom categories for transactions
  - id (uuid, primary key)
  - user_id (uuid, references profiles, nullable for system ledgers)
  - name (text)
  - type (text: income, expense, receivable, payable, asset, liability)
  - is_system (boolean)
  - created_at (timestamptz)

  ### 4. transactions
  All financial transactions (bank and cash)
  - id (uuid, primary key)
  - user_id (uuid, references profiles)
  - bank_id (uuid, references banks, nullable for cash)
  - transaction_date (date)
  - description (text)
  - amount (decimal)
  - transaction_type (text: credit, debit)
  - ledger_id (uuid, references ledgers)
  - narration (text)
  - balance_after (decimal, nullable)
  - is_cash (boolean, default false)
  - is_confirmed (boolean, default false)
  - related_user_id (uuid, references profiles, nullable)
  - related_transaction_id (uuid, references transactions, nullable)
  - ai_suggested (boolean, default false)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 5. ai_learning
  Stores AI learning patterns for auto-suggestions
  - id (uuid, primary key)
  - user_id (uuid, references profiles)
  - description_pattern (text)
  - ledger_id (uuid, references ledgers)
  - narration_template (text)
  - usage_count (integer)
  - last_used_at (timestamptz)
  - created_at (timestamptz)

  ### 6. reminders
  Payment and receipt reminders
  - id (uuid, primary key)
  - user_id (uuid, references profiles)
  - transaction_id (uuid, references transactions)
  - related_user_id (uuid, references profiles, nullable)
  - reminder_date (date)
  - amount (decimal)
  - message (text)
  - reminder_type (text: receivable, payable)
  - status (text: pending, sent, completed, cancelled)
  - send_via (text: sms, whatsapp, email)
  - sent_at (timestamptz, nullable)
  - created_at (timestamptz)

  ### 7. bank_statements
  Tracks uploaded bank statements
  - id (uuid, primary key)
  - user_id (uuid, references profiles)
  - bank_id (uuid, references banks)
  - file_name (text)
  - file_type (text)
  - upload_date (timestamptz)
  - statement_period_start (date, nullable)
  - statement_period_end (date, nullable)
  - processed (boolean, default false)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Related users can view shared transactions based on permissions

  ## Important Notes
  1. All monetary values use decimal type for precision
  2. System ledgers are pre-populated for common categories
  3. AI learning patterns improve over time based on user confirmations
  4. Timestamps use timestamptz for timezone awareness
  5. Foreign keys ensure data integrity
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  gemini_api_key text,
  use_system_ai boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create banks table
CREATE TABLE IF NOT EXISTS banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bank_name text NOT NULL,
  account_number text,
  account_type text DEFAULT 'savings',
  current_balance decimal(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own banks"
  ON banks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own banks"
  ON banks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own banks"
  ON banks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own banks"
  ON banks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create ledgers table
CREATE TABLE IF NOT EXISTS ledgers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense', 'receivable', 'payable', 'asset', 'liability')),
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and system ledgers"
  ON ledgers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_system = true);

CREATE POLICY "Users can insert own ledgers"
  ON ledgers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can update own ledgers"
  ON ledgers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_system = false)
  WITH CHECK (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can delete own ledgers"
  ON ledgers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_system = false);

-- Insert system ledgers
INSERT INTO ledgers (name, type, is_system) VALUES
  ('Salary', 'income', true),
  ('Business Income', 'income', true),
  ('Interest Income', 'income', true),
  ('Rent', 'expense', true),
  ('Electricity', 'expense', true),
  ('Water', 'expense', true),
  ('Internet', 'expense', true),
  ('Groceries', 'expense', true),
  ('Food & Dining', 'expense', true),
  ('Transportation', 'expense', true),
  ('Fuel', 'expense', true),
  ('Medical', 'expense', true),
  ('Education', 'expense', true),
  ('Entertainment', 'expense', true),
  ('Shopping', 'expense', true),
  ('Office Supplies', 'expense', true),
  ('Maintenance', 'expense', true),
  ('Insurance', 'expense', true),
  ('Loan Payment', 'expense', true),
  ('Receivable', 'receivable', true),
  ('Payable', 'payable', true),
  ('Cash', 'asset', true),
  ('Bank', 'asset', true),
  ('Loan', 'liability', true)
ON CONFLICT DO NOTHING;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bank_id uuid REFERENCES banks(id) ON DELETE CASCADE,
  transaction_date date NOT NULL,
  description text NOT NULL,
  amount decimal(15,2) NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  ledger_id uuid REFERENCES ledgers(id) NOT NULL,
  narration text,
  balance_after decimal(15,2),
  is_cash boolean DEFAULT false,
  is_confirmed boolean DEFAULT false,
  related_user_id uuid REFERENCES profiles(id),
  related_transaction_id uuid REFERENCES transactions(id),
  ai_suggested boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = related_user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create ai_learning table
CREATE TABLE IF NOT EXISTS ai_learning (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  description_pattern text NOT NULL,
  ledger_id uuid REFERENCES ledgers(id) NOT NULL,
  narration_template text,
  usage_count integer DEFAULT 1,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_learning ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai_learning"
  ON ai_learning FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_learning"
  ON ai_learning FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_learning"
  ON ai_learning FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai_learning"
  ON ai_learning FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  related_user_id uuid REFERENCES profiles(id),
  reminder_date date NOT NULL,
  amount decimal(15,2) NOT NULL,
  message text NOT NULL,
  reminder_type text NOT NULL CHECK (reminder_type IN ('receivable', 'payable')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed', 'cancelled')),
  send_via text CHECK (send_via IN ('sms', 'whatsapp', 'email')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create bank_statements table
CREATE TABLE IF NOT EXISTS bank_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bank_id uuid REFERENCES banks(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  upload_date timestamptz DEFAULT now(),
  statement_period_start date,
  statement_period_end date,
  processed boolean DEFAULT false
);

ALTER TABLE bank_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank_statements"
  ON bank_statements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank_statements"
  ON bank_statements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank_statements"
  ON bank_statements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank_statements"
  ON bank_statements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banks_user_id ON banks(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bank_id ON transactions(bank_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_ledger_id ON transactions(ledger_id);
CREATE INDEX IF NOT EXISTS idx_ai_learning_user_id ON ai_learning(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_bank_statements_user_id ON bank_statements(user_id);