export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      architects: {
        Row: {
          id: string
          email: string
          full_name: string
          business_name: string | null
          tax_id: string | null
          phone: string | null
          address: Json | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          business_name?: string | null
          tax_id?: string | null
          phone?: string | null
          address?: Json | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          business_name?: string | null
          tax_id?: string | null
          phone?: string | null
          address?: Json | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          code: string
          name: string
          client_id: string | null
          client_name: string
          client_email: string | null
          client_phone: string | null
          client_tax_id: string | null
          project_type: 'construction' | 'renovation' | 'design' | 'other'
          status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          total_amount: number
          down_payment_amount: number
          down_payment_percentage: number | null
          installments_count: number
          installment_amount: number | null
          late_fee_percentage: number
          start_date: string | null
          estimated_end_date: string | null
          actual_end_date: string | null
          description: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          client_id?: string | null
          client_name: string
          client_email?: string | null
          client_phone?: string | null
          client_tax_id?: string | null
          project_type?: 'construction' | 'renovation' | 'design' | 'other'
          status?: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          total_amount: number
          down_payment_amount?: number
          down_payment_percentage?: number | null
          installments_count?: number
          installment_amount?: number | null
          late_fee_percentage?: number
          start_date?: string | null
          estimated_end_date?: string | null
          actual_end_date?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          client_id?: string | null
          client_name?: string
          client_email?: string | null
          client_phone?: string | null
          client_tax_id?: string | null
          project_type?: 'construction' | 'renovation' | 'design' | 'other'
          status?: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          total_amount?: number
          down_payment_amount?: number
          down_payment_percentage?: number | null
          installments_count?: number
          installment_amount?: number | null
          late_fee_percentage?: number
          start_date?: string | null
          estimated_end_date?: string | null
          actual_end_date?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      studio_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json | null
          setting_type: 'string' | 'number' | 'boolean' | 'json' | 'percentage'
          display_name: string
          description: string | null
          category: string
          is_editable: boolean
          validation_rules: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: Json | null
          setting_type?: 'string' | 'number' | 'boolean' | 'json' | 'percentage'
          display_name: string
          description?: string | null
          category?: string
          is_editable?: boolean
          validation_rules?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json | null
          setting_type?: 'string' | 'number' | 'boolean' | 'json' | 'percentage'
          display_name?: string
          description?: string | null
          category?: string
          is_editable?: boolean
          validation_rules?: Json
          created_at?: string
          updated_at?: string
        }
      }
      master_cash: {
        Row: {
          id: string
          balance: number
          last_movement_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          balance?: number
          last_movement_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          balance?: number
          last_movement_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_cash: {
        Row: {
          id: string
          balance: number
          total_collected: number
          last_movement_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          balance?: number
          total_collected?: number
          last_movement_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          balance?: number
          total_collected?: number
          last_movement_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_cash: {
        Row: {
          id: string
          project_id: string
          balance: number
          total_received: number
          last_movement_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          balance?: number
          total_received?: number
          last_movement_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          balance?: number
          total_received?: number
          last_movement_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cash_movements: {
        Row: {
          id: string
          movement_type: 'project_income' | 'master_duplication' | 'fee_collection' | 'expense' | 'transfer' | 'adjustment'
          source_type: 'master' | 'admin' | 'project' | 'external' | null
          source_id: string | null
          destination_type: 'master' | 'admin' | 'project' | 'external' | null
          destination_id: string | null
          amount: number
          description: string
          project_id: string | null
          installment_id: string | null
          fee_collection_id: string | null
          metadata: Json
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          movement_type: 'project_income' | 'master_duplication' | 'fee_collection' | 'expense' | 'transfer' | 'adjustment'
          source_type?: 'master' | 'admin' | 'project' | 'external' | null
          source_id?: string | null
          destination_type?: 'master' | 'admin' | 'project' | 'external' | null
          destination_id?: string | null
          amount: number
          description: string
          project_id?: string | null
          installment_id?: string | null
          fee_collection_id?: string | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          movement_type?: 'project_income' | 'master_duplication' | 'fee_collection' | 'expense' | 'transfer' | 'adjustment'
          source_type?: 'master' | 'admin' | 'project' | 'external' | null
          source_id?: string | null
          destination_type?: 'master' | 'admin' | 'project' | 'external' | null
          destination_id?: string | null
          amount?: number
          description?: string
          project_id?: string | null
          installment_id?: string | null
          fee_collection_id?: string | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
        }
      }
      fee_collections: {
        Row: {
          id: string
          project_id: string | null
          amount_collected: number
          collection_reason: string | null
          project_income_base: number | null
          percentage_applied: number | null
          movement_id: string | null
          notes: string | null
          collected_at: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          amount_collected: number
          collection_reason?: string | null
          project_income_base?: number | null
          percentage_applied?: number | null
          movement_id?: string | null
          notes?: string | null
          collected_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          amount_collected?: number
          collection_reason?: string | null
          project_income_base?: number | null
          percentage_applied?: number | null
          movement_id?: string | null
          notes?: string | null
          collected_at?: string
          created_at?: string
        }
      }
      installments: {
        Row: {
          id: string
          project_id: string
          installment_number: number
          amount: number
          due_date: string
          status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          paid_amount: number
          paid_date: string | null
          late_fee_applied: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          installment_number: number
          amount: number
          due_date: string
          status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          paid_amount?: number
          paid_date?: string | null
          late_fee_applied?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          installment_number?: number
          amount?: number
          due_date?: string
          status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          paid_amount?: number
          paid_date?: string | null
          late_fee_applied?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          installment_id: string
          amount: number
          payment_method: 'cash' | 'transfer' | 'check' | 'card' | 'other' | null
          payment_reference: string | null
          movement_id: string | null
          notes: string | null
          paid_at: string
          created_at: string
        }
        Insert: {
          id?: string
          installment_id: string
          amount: number
          payment_method?: 'cash' | 'transfer' | 'check' | 'card' | 'other' | null
          payment_reference?: string | null
          movement_id?: string | null
          notes?: string | null
          paid_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          installment_id?: string
          amount?: number
          payment_method?: 'cash' | 'transfer' | 'check' | 'card' | 'other' | null
          payment_reference?: string | null
          movement_id?: string | null
          notes?: string | null
          paid_at?: string
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          architect_id: string
          name: string
          email: string | null
          phone: string | null
          tax_id: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          architect_id?: string
          name: string
          email?: string | null
          phone?: string | null
          tax_id?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          architect_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          tax_id?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          project_id: string
          contract_type: 'service' | 'financing' | 'amendment'
          status: 'draft' | 'sent' | 'signed' | 'cancelled'
          content: string | null
          terms: Json | null
          architect_signed_at: string | null
          client_signed_at: string | null
          client_signature_ip: string | null
          pdf_url: string | null
          sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          contract_type?: 'service' | 'financing' | 'amendment'
          status?: 'draft' | 'sent' | 'signed' | 'cancelled'
          content?: string | null
          terms?: Json | null
          architect_signed_at?: string | null
          client_signed_at?: string | null
          client_signature_ip?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          contract_type?: 'service' | 'financing' | 'amendment'
          status?: 'draft' | 'sent' | 'signed' | 'cancelled'
          content?: string | null
          terms?: Json | null
          architect_signed_at?: string | null
          client_signed_at?: string | null
          client_signature_ip?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      master_cash_box: {
        Row: {
          id: string
          balance_ars: number
          balance_usd: number
          current_balance_ars: number
          total_received: number
          last_movement_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          balance_ars?: number
          balance_usd?: number
          current_balance_ars?: number
          total_received?: number
          last_movement_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          balance_ars?: number
          balance_usd?: number
          current_balance_ars?: number
          total_received?: number
          last_movement_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exchange_rates: {
        Row: {
          id: string
          from_currency: string
          to_currency: string
          rate: number
          effective_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          from_currency: string
          to_currency: string
          rate: number
          effective_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          from_currency?: string
          to_currency?: string
          rate?: number
          effective_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_agents: {
        Row: {
          id: string
          name: string
          type: string
          config: Json
          status: string
          metrics: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          config?: Json
          status?: string
          metrics?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          config?: Json
          status?: string
          metrics?: Json
          created_at?: string
          updated_at?: string
        }
      }
      pipelines: {
        Row: {
          id: string
          name: string
          config: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          config?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          config?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      providers: {
        Row: {
          id: string
          name: string
          business_name: string | null
          tax_id: string | null
          provider_type: 'contractor' | 'supplier' | 'service' | 'professional'
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          zip_code: string | null
          bank_name: string | null
          account_number: string | null
          account_type: 'checking' | 'savings'
          payment_terms: number
          notes: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          business_name?: string | null
          tax_id?: string | null
          provider_type?: 'contractor' | 'supplier' | 'service' | 'professional'
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          zip_code?: string | null
          bank_name?: string | null
          account_number?: string | null
          account_type?: 'checking' | 'savings'
          payment_terms?: number
          notes?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          business_name?: string | null
          tax_id?: string | null
          provider_type?: 'contractor' | 'supplier' | 'service' | 'professional'
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          zip_code?: string | null
          bank_name?: string | null
          account_number?: string | null
          account_type?: 'checking' | 'savings'
          payment_terms?: number
          notes?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      project_contractors: {
        Row: {
          id: string
          project_id: string
          contractor_id: string
          contract_number: string | null
          contract_date: string
          start_date: string | null
          end_date: string | null
          estimated_end_date: string | null
          budget_amount: number
          currency: string
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          progress_percentage: number
          contract_file_url: string | null
          notes: string | null
          payment_frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom'
          payment_interval_days: number
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          contractor_id: string
          contract_number?: string | null
          contract_date?: string
          start_date?: string | null
          end_date?: string | null
          estimated_end_date?: string | null
          budget_amount?: number
          currency?: string
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          progress_percentage?: number
          contract_file_url?: string | null
          notes?: string | null
          payment_frequency?: 'weekly' | 'biweekly' | 'monthly' | 'custom'
          payment_interval_days?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          contractor_id?: string
          contract_number?: string | null
          contract_date?: string
          start_date?: string | null
          end_date?: string | null
          estimated_end_date?: string | null
          budget_amount?: number
          currency?: string
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          progress_percentage?: number
          contract_file_url?: string | null
          notes?: string | null
          payment_frequency?: 'weekly' | 'biweekly' | 'monthly' | 'custom'
          payment_interval_days?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      contractor_budgets: {
        Row: {
          id: string
          project_contractor_id: string
          category: 'materials' | 'labor' | 'equipment' | 'services' | 'other'
          description: string
          quantity: number
          unit: string | null
          unit_price: number
          total_amount: number
          order_index: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_contractor_id: string
          category: 'materials' | 'labor' | 'equipment' | 'services' | 'other'
          description: string
          quantity?: number
          unit?: string | null
          unit_price: number
          total_amount?: number
          order_index?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_contractor_id?: string
          category?: 'materials' | 'labor' | 'equipment' | 'services' | 'other'
          description?: string
          quantity?: number
          unit?: string | null
          unit_price?: number
          total_amount?: number
          order_index?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contractor_payments: {
        Row: {
          id: string
          project_contractor_id: string
          budget_item_id: string | null
          payment_type: 'advance' | 'progress' | 'final' | 'adjustment'
          amount: number
          currency: string
          payment_date: string
          due_date: string | null
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          payment_method: string | null
          reference: string | null
          receipt_file_url: string | null
          notes: string | null
          movement_id: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          paid_at: string | null
          paid_by: string | null
        }
        Insert: {
          id?: string
          project_contractor_id: string
          budget_item_id?: string | null
          payment_type: 'advance' | 'progress' | 'final' | 'adjustment'
          amount: number
          currency?: string
          payment_date?: string
          due_date?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          payment_method?: string | null
          reference?: string | null
          receipt_file_url?: string | null
          notes?: string | null
          movement_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          paid_at?: string | null
          paid_by?: string | null
        }
        Update: {
          id?: string
          project_contractor_id?: string
          budget_item_id?: string | null
          payment_type?: 'advance' | 'progress' | 'final' | 'adjustment'
          amount?: number
          currency?: string
          payment_date?: string
          due_date?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          movement_id?: string | null
          payment_method?: string | null
          reference?: string | null
          receipt_file_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          paid_at?: string | null
          paid_by?: string | null
        }
      }
      contractor_progress: {
        Row: {
          id: string
          project_contractor_id: string
          progress_date: string
          percentage_complete: number
          title: string | null
          description: string | null
          photos: Json | null
          documents: Json | null
          notes: string | null
          is_milestone: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          project_contractor_id: string
          progress_date?: string
          percentage_complete: number
          title?: string | null
          description?: string | null
          photos?: Json | null
          documents?: Json | null
          notes?: string | null
          is_milestone?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          project_contractor_id?: string
          progress_date?: string
          percentage_complete?: number
          title?: string | null
          description?: string | null
          photos?: Json | null
          documents?: Json | null
          notes?: string | null
          is_milestone?: boolean
          created_at?: string
          created_by?: string | null
        }
      }
      inter_project_loans: {
        Row: {
          id: string
          loan_code: string
          lender_project_id: string | null
          borrower_project_id: string | null
          amount: number
          currency: 'ARS' | 'USD'
          interest_rate: number
          loan_date: string
          due_date: string
          loan_status: 'draft' | 'pending' | 'active' | 'paid' | 'overdue' | 'cancelled'
          outstanding_balance: number
          total_paid: number
          description: string | null
          notes: string | null
          payment_terms: string | null
          contract_file_url: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
        }
        Insert: {
          id?: string
          loan_code: string
          lender_project_id?: string | null
          borrower_project_id?: string | null
          amount: number
          currency?: 'ARS' | 'USD'
          interest_rate?: number
          loan_date?: string
          due_date: string
          loan_status?: 'draft' | 'pending' | 'active' | 'paid' | 'overdue' | 'cancelled'
          outstanding_balance: number
          total_paid?: number
          description?: string | null
          notes?: string | null
          payment_terms?: string | null
          contract_file_url?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
        }
        Update: {
          id?: string
          loan_code?: string
          lender_project_id?: string | null
          borrower_project_id?: string | null
          amount?: number
          currency?: 'ARS' | 'USD'
          interest_rate?: number
          loan_date?: string
          due_date?: string
          loan_status?: 'draft' | 'pending' | 'active' | 'paid' | 'overdue' | 'cancelled'
          outstanding_balance?: number
          total_paid?: number
          description?: string | null
          notes?: string | null
          payment_terms?: string | null
          contract_file_url?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
        }
      }
      loan_installments: {
        Row: {
          id: string
          loan_id: string
          installment_number: number
          amount: number
          due_date: string
          payment_status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          paid_amount: number
          paid_date: string | null
          interest_amount: number
          late_fee_amount: number
          payment_movement_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          loan_id: string
          installment_number: number
          amount: number
          due_date: string
          payment_status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          paid_amount?: number
          paid_date?: string | null
          interest_amount?: number
          late_fee_amount?: number
          payment_movement_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          loan_id?: string
          installment_number?: number
          amount?: number
          due_date?: string
          payment_status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
          paid_amount?: number
          paid_date?: string | null
          interest_amount?: number
          late_fee_amount?: number
          payment_movement_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bank_accounts: {
        Row: {
          id: string
          account_type: 'master_ars' | 'master_usd' | 'project_ars' | 'project_usd'
          account_name: string
          project_id: string | null
          currency: 'ARS' | 'USD'
          balance: number
          available_balance: number
          bank_name: string | null
          account_number: string | null
          account_holder: string | null
          is_active: boolean
          last_movement_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_type: 'master_ars' | 'master_usd' | 'project_ars' | 'project_usd'
          account_name: string
          project_id?: string | null
          currency: 'ARS' | 'USD'
          balance?: number
          available_balance?: number
          bank_name?: string | null
          account_number?: string | null
          account_holder?: string | null
          is_active?: boolean
          last_movement_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_type?: 'master_ars' | 'master_usd' | 'project_ars' | 'project_usd'
          account_name?: string
          project_id?: string | null
          currency?: 'ARS' | 'USD'
          balance?: number
          available_balance?: number
          bank_name?: string | null
          account_number?: string | null
          account_holder?: string | null
          is_active?: boolean
          last_movement_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bank_account_transfers: {
        Row: {
          id: string
          from_account_id: string
          to_account_id: string
          amount: number
          from_currency: 'ARS' | 'USD'
          to_currency: 'ARS' | 'USD'
          exchange_rate: number | null
          converted_amount: number | null
          transfer_type: string
          related_loan_id: string | null
          related_installment_id: string | null
          related_movement_id: string | null
          description: string
          notes: string | null
          reference_number: string | null
          transfer_date: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          from_account_id: string
          to_account_id: string
          amount: number
          from_currency: 'ARS' | 'USD'
          to_currency: 'ARS' | 'USD'
          exchange_rate?: number | null
          converted_amount?: number | null
          transfer_type: string
          related_loan_id?: string | null
          related_installment_id?: string | null
          related_movement_id?: string | null
          description: string
          notes?: string | null
          reference_number?: string | null
          transfer_date?: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          from_account_id?: string
          to_account_id?: string
          amount?: number
          from_currency?: 'ARS' | 'USD'
          to_currency?: 'ARS' | 'USD'
          exchange_rate?: number | null
          converted_amount?: number | null
          transfer_type?: string
          related_loan_id?: string | null
          related_installment_id?: string | null
          related_movement_id?: string | null
          description?: string
          notes?: string | null
          reference_number?: string | null
          transfer_date?: string
          created_at?: string
          created_by?: string | null
        }
      }
    }
    Views: {
      contractor_financial_summary: {
        Row: {
          project_contractor_id: string
          project_id: string
          contractor_id: string
          budget_amount: number
          total_paid: number
          total_pending: number
          balance_due: number
          payment_progress_percentage: number
          total_payments: number
          overdue_payments: number
          next_payment_due_date: string | null
          next_payment_amount: number | null
        }
      }
      active_loans_summary: {
        Row: {
          id: string
          loan_code: string
          amount: number
          currency: 'ARS' | 'USD'
          loan_status: 'active' | 'overdue'
          outstanding_balance: number
          total_paid: number
          loan_date: string
          due_date: string
          lender_project_name: string
          borrower_project_name: string
          total_installments: number
          paid_installments: number
          pending_installments: number
          overdue_installments: number
          next_payment_due: string | null
        }
      }
      bank_accounts_balance: {
        Row: {
          id: string
          account_name: string
          account_type: 'master_ars' | 'master_usd' | 'project_ars' | 'project_usd'
          currency: 'ARS' | 'USD'
          balance: number
          available_balance: number
          is_active: boolean
          project_name: string | null
          total_outgoing: number
          total_incoming: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}