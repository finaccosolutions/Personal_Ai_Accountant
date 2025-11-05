import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          gemini_api_key: string | null;
          notification_preferences: Record<string, boolean>;
          created_at: string;
          updated_at: string;
        };
      };
      banks: {
        Row: {
          id: string;
          user_id: string;
          bank_name: string;
          account_number: string;
          account_type: string;
          current_balance: number;
          currency: string;
          is_active: boolean;
          created_at: string;
        };
      };
      ledgers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          sub_category: string | null;
          balance: number;
          is_system: boolean;
          created_at: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          bank_id: string | null;
          transaction_date: string;
          transaction_type: string;
          amount: number;
          description: string | null;
          narration: string | null;
          reference_number: string | null;
          balance_after: number | null;
          is_reconciled: boolean;
          source: string;
          source_file_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
