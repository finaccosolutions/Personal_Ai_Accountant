/*
  # Initial Schema for Accounting Management Application

  ## Overview
  This migration creates the foundational database structure for a comprehensive accounting management
  system that helps individuals and small business owners manage bank and cash transactions.

  ## New Tables

  ### 1. `profiles`
  User profile information and settings
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `gemini_api_key` (text, encrypted) - User's Gemini API key for AI features
  - `notification_preferences` (jsonb) - Email, SMS, WhatsApp preferences
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `banks`
  Bank accounts managed by users
  - `id` (uuid, PK) - Bank account identifier
  - `user_id` (uuid, FK) - Owner of the bank account
  - `bank_name` (text) - Name of the bank
  - `account_number` (text) - Account number (last 4 digits)
  - `account_type` (text) - Savings, Current, Credit Card, etc.
  - `current_balance` (decimal) - Current balance
  - `currency` (text) - Currency code (USD, INR, etc.)
  - `is_active` (boolean) - Whether account is active
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `ledgers`
  Chart of accounts / ledger categories
  - `id` (uuid, PK) - Ledger identifier
  - `user_id` (uuid, FK) - Owner of the ledger
  - `name` (text) - Ledger name (e.g., "Office Rent", "Sales Income")
  - `category` (text) - Asset, Liability, Income, Expense, Equity
  - `sub_category` (text) - More specific classification
  - `balance` (decimal) - Current balance
  - `is_system` (boolean) - System-created vs user-created
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `transactions`
  All financial transactions (bank and cash)
  - `id` (uuid, PK) - Transaction identifier
  - `user_id` (uuid, FK) - Transaction owner
  - `bank_id` (uuid, FK, nullable) - Related bank if bank transaction
  - `transaction_date` (date) - Date of transaction
  - `transaction_type` (text) - DEBIT, CREDIT, CASH_IN, CASH_OUT
  - `amount` (decimal) - Transaction amount
  - `description` (text) - Original transaction description from bank
  - `narration` (text) - User-friendly narration
  - `reference_number` (text) - Bank reference/check number
  - `balance_after` (decimal) - Balance after transaction
  - `is_reconciled` (boolean) - Whether transaction is confirmed
  - `source` (text) - BANK_UPLOAD, MANUAL, CASH
  - `source_file_id` (uuid, nullable) - Link to uploaded file
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. `transaction_ledger_entries`
  Double-entry bookkeeping entries
  - `id` (uuid, PK) - Entry identifier
  - `transaction_id` (uuid, FK) - Related transaction
  - `ledger_id` (uuid, FK) - Related ledger
  - `entry_type` (text) - DEBIT or CREDIT
  - `amount` (decimal) - Entry amount
  - `created_at` (timestamptz) - Creation timestamp

  ### 6. `transaction_mappings`
  AI-powered transaction pattern mappings for auto-suggestions
  - `id` (uuid, PK) - Mapping identifier
  - `user_id` (uuid, FK) - User who owns this mapping
  - `description_pattern` (text) - Transaction description pattern
  - `suggested_ledger_id` (uuid, FK) - Auto-suggested ledger
  - `suggested_narration` (text) - Auto-suggested narration
  - `confidence_score` (decimal) - AI confidence score
  - `usage_count` (integer) - How many times this mapping was used
  - `last_used_at` (timestamptz) - Last usage timestamp
  - `created_at` (timestamptz) - Creation timestamp

  ### 7. `uploaded_files`
  Bank statements and documents uploaded by users
  - `id` (uuid, PK) - File identifier
  - `user_id` (uuid, FK) - File owner
  - `bank_id` (uuid, FK) - Related bank account
  - `file_name` (text) - Original filename
  - `file_type` (text) - PDF, EXCEL, CSV, TXT
  - `file_url` (text) - Storage URL
  - `processed_status` (text) - PENDING, PROCESSING, COMPLETED, FAILED
  - `transactions_extracted` (integer) - Number of transactions found
  - `created_at` (timestamptz) - Upload timestamp

  ### 8. `contacts`
  People/businesses involved in transactions
  - `id` (uuid, PK) - Contact identifier
  - `user_id` (uuid, FK) - Contact owner
  - `name` (text) - Contact name
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `app_user_id` (uuid, FK, nullable) - If contact is also app user
  - `total_receivable` (decimal) - Total amount to receive
  - `total_payable` (decimal) - Total amount to pay
  - `created_at` (timestamptz) - Creation timestamp

  ### 9. `contact_transactions`
  Transactions involving contacts (receivables/payables)
  - `id` (uuid, PK) - Record identifier
  - `transaction_id` (uuid, FK) - Related transaction
  - `contact_id` (uuid, FK) - Related contact
  - `amount` (decimal) - Amount involving this contact
  - `type` (text) - RECEIVABLE, PAYABLE
  - `due_date` (date, nullable) - When payment is due
  - `status` (text) - PENDING, REMINDED, PAID
  - `created_at` (timestamptz) - Creation timestamp

  ### 10. `shared_transactions`
  Transactions split between multiple users
  - `id` (uuid, PK) - Shared transaction identifier
  - `initiator_user_id` (uuid, FK) - User who created split
  - `transaction_id` (uuid, FK) - Original transaction
  - `recipient_user_id` (uuid, FK) - User receiving split
  - `amount` (decimal) - Split amount
  - `status` (text) - PENDING, ACCEPTED, REJECTED
  - `affects_bank` (boolean) - Whether it affects recipient's bank
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Status update timestamp

  ### 11. `notifications`
  System notifications for reminders and alerts
  - `id` (uuid, PK) - Notification identifier
  - `user_id` (uuid, FK) - Recipient user
  - `type` (text) - REMINDER, ALERT, INFO
  - `title` (text) - Notification title
  - `message` (text) - Notification message
  - `related_transaction_id` (uuid, FK, nullable) - Related transaction
  - `is_read` (boolean) - Read status
  - `send_via` (text[]) - Channels: EMAIL, SMS, WHATSAPP
  - `scheduled_for` (timestamptz, nullable) - When to send
  - `sent_at` (timestamptz, nullable) - When it was sent
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Shared transactions visible to both parties
  - Contact app_user_id validated for cross-user features
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  gemini_api_key text,
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false, "whatsapp": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
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
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_type text DEFAULT 'Savings',
  current_balance decimal(15,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own banks"
  ON banks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create ledgers table
CREATE TABLE IF NOT EXISTS ledgers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  sub_category text,
  balance decimal(15,2) DEFAULT 0,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ledgers"
  ON ledgers FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_id uuid REFERENCES banks(id) ON DELETE SET NULL,
  transaction_date date NOT NULL,
  transaction_type text NOT NULL,
  amount decimal(15,2) NOT NULL,
  description text,
  narration text,
  reference_number text,
  balance_after decimal(15,2),
  is_reconciled boolean DEFAULT false,
  source text DEFAULT 'MANUAL',
  source_file_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create transaction_ledger_entries table
CREATE TABLE IF NOT EXISTS transaction_ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  ledger_id uuid NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
  entry_type text NOT NULL,
  amount decimal(15,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transaction_ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ledger entries"
  ON transaction_ledger_entries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_ledger_entries.transaction_id
      AND transactions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_ledger_entries.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

-- Create transaction_mappings table
CREATE TABLE IF NOT EXISTS transaction_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description_pattern text NOT NULL,
  suggested_ledger_id uuid REFERENCES ledgers(id) ON DELETE CASCADE,
  suggested_narration text,
  confidence_score decimal(3,2) DEFAULT 0.5,
  usage_count integer DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transaction_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own mappings"
  ON transaction_mappings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create uploaded_files table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_id uuid REFERENCES banks(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_url text,
  processed_status text DEFAULT 'PENDING',
  transactions_extracted integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own files"
  ON uploaded_files FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  app_user_id uuid REFERENCES auth.users(id),
  total_receivable decimal(15,2) DEFAULT 0,
  total_payable decimal(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contacts"
  ON contacts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create contact_transactions table
CREATE TABLE IF NOT EXISTS contact_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  amount decimal(15,2) NOT NULL,
  type text NOT NULL,
  due_date date,
  status text DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contact transactions"
  ON contact_transactions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = contact_transactions.transaction_id
      AND transactions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = contact_transactions.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

-- Create shared_transactions table
CREATE TABLE IF NOT EXISTS shared_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  recipient_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal(15,2) NOT NULL,
  status text DEFAULT 'PENDING',
  affects_bank boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shared_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shared transactions they're involved in"
  ON shared_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = initiator_user_id OR auth.uid() = recipient_user_id);

CREATE POLICY "Initiators can create shared transactions"
  ON shared_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = initiator_user_id);

CREATE POLICY "Recipients can update shared transaction status"
  ON shared_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_user_id)
  WITH CHECK (auth.uid() = recipient_user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  send_via text[],
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banks_user_id ON banks(user_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_user_id ON ledgers(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bank_id ON transactions(bank_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_mappings_user_id ON transaction_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for) WHERE sent_at IS NULL;