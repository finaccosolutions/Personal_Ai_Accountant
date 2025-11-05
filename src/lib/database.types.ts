export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          gemini_api_key: string | null;
          use_system_ai: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          gemini_api_key?: string | null;
          use_system_ai?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          gemini_api_key?: string | null;
          use_system_ai?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      banks: {
        Row: {
          id: string;
          user_id: string;
          bank_name: string;
          account_number: string | null;
          account_type: string;
          current_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bank_name: string;
          account_number?: string | null;
          account_type?: string;
          current_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bank_name?: string;
          account_number?: string | null;
          account_type?: string;
          current_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ledgers: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          type: 'income' | 'expense' | 'receivable' | 'payable' | 'asset' | 'liability';
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          type: 'income' | 'expense' | 'receivable' | 'payable' | 'asset' | 'liability';
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          type?: 'income' | 'expense' | 'receivable' | 'payable' | 'asset' | 'liability';
          is_system?: boolean;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          bank_id: string | null;
          transaction_date: string;
          description: string;
          amount: number;
          transaction_type: 'credit' | 'debit';
          ledger_id: string;
          narration: string | null;
          balance_after: number | null;
          is_cash: boolean;
          is_confirmed: boolean;
          related_user_id: string | null;
          related_transaction_id: string | null;
          ai_suggested: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bank_id?: string | null;
          transaction_date: string;
          description: string;
          amount: number;
          transaction_type: 'credit' | 'debit';
          ledger_id: string;
          narration?: string | null;
          balance_after?: number | null;
          is_cash?: boolean;
          is_confirmed?: boolean;
          related_user_id?: string | null;
          related_transaction_id?: string | null;
          ai_suggested?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bank_id?: string | null;
          transaction_date?: string;
          description?: string;
          amount?: number;
          transaction_type?: 'credit' | 'debit';
          ledger_id?: string;
          narration?: string | null;
          balance_after?: number | null;
          is_cash?: boolean;
          is_confirmed?: boolean;
          related_user_id?: string | null;
          related_transaction_id?: string | null;
          ai_suggested?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_learning: {
        Row: {
          id: string;
          user_id: string;
          description_pattern: string;
          ledger_id: string;
          narration_template: string | null;
          usage_count: number;
          last_used_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description_pattern: string;
          ledger_id: string;
          narration_template?: string | null;
          usage_count?: number;
          last_used_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description_pattern?: string;
          ledger_id?: string;
          narration_template?: string | null;
          usage_count?: number;
          last_used_at?: string;
          created_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          transaction_id: string | null;
          related_user_id: string | null;
          reminder_date: string;
          amount: number;
          message: string;
          reminder_type: 'receivable' | 'payable';
          status: 'pending' | 'sent' | 'completed' | 'cancelled';
          send_via: 'sms' | 'whatsapp' | 'email' | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_id?: string | null;
          related_user_id?: string | null;
          reminder_date: string;
          amount: number;
          message: string;
          reminder_type: 'receivable' | 'payable';
          status?: 'pending' | 'sent' | 'completed' | 'cancelled';
          send_via?: 'sms' | 'whatsapp' | 'email' | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_id?: string | null;
          related_user_id?: string | null;
          reminder_date?: string;
          amount?: number;
          message?: string;
          reminder_type?: 'receivable' | 'payable';
          status?: 'pending' | 'sent' | 'completed' | 'cancelled';
          send_via?: 'sms' | 'whatsapp' | 'email' | null;
          sent_at?: string | null;
          created_at?: string;
        };
      };
      bank_statements: {
        Row: {
          id: string;
          user_id: string;
          bank_id: string;
          file_name: string;
          file_type: string;
          upload_date: string;
          statement_period_start: string | null;
          statement_period_end: string | null;
          processed: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          bank_id: string;
          file_name: string;
          file_type: string;
          upload_date?: string;
          statement_period_start?: string | null;
          statement_period_end?: string | null;
          processed?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          bank_id?: string;
          file_name?: string;
          file_type?: string;
          upload_date?: string;
          statement_period_start?: string | null;
          statement_period_end?: string | null;
          processed?: boolean;
        };
      };
    };
  };
};
