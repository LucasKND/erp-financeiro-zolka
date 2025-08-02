export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      accounts_payable: {
        Row: {
          amount: number
          category: string
          company_id: string
          created_at: string
          created_by: string
          description: string
          due_date: string
          id: string
          status: string
          supplier_name: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          company_id: string
          created_at?: string
          created_by: string
          description: string
          due_date: string
          id?: string
          status?: string
          supplier_name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string
          due_date?: string
          id?: string
          status?: string
          supplier_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          amount: number
          client_name: string
          company_id: string
          created_at: string
          created_by: string
          description: string
          due_date: string
          id: string
          is_recurring: boolean
          recurring_period: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_name: string
          company_id: string
          created_at?: string
          created_by: string
          description: string
          due_date: string
          id?: string
          is_recurring?: boolean
          recurring_period?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_name?: string
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string
          due_date?: string
          id?: string
          is_recurring?: boolean
          recurring_period?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_client_access: {
        Row: {
          admin_user_id: string
          client_company_id: string
          created_at: string
          id: string
        }
        Insert: {
          admin_user_id: string
          client_company_id: string
          created_at?: string
          id?: string
        }
        Update: {
          admin_user_id?: string
          client_company_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_client_access_client_company_id_fkey"
            columns: ["client_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          account_payable_id: string | null
          account_receivable_id: string | null
          amount: number
          company_id: string
          created_at: string
          created_by: string
          date: string
          id: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          account_payable_id?: string | null
          account_receivable_id?: string | null
          amount: number
          company_id: string
          created_at?: string
          created_by: string
          date: string
          id?: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          account_payable_id?: string | null
          account_receivable_id?: string | null
          amount?: number
          company_id?: string
          created_at?: string
          created_by?: string
          date?: string
          id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_account_payable_id_fkey"
            columns: ["account_payable_id"]
            isOneToOne: true
            referencedRelation: "accounts_payable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_account_receivable_id_fkey"
            columns: ["account_receivable_id"]
            isOneToOne: true
            referencedRelation: "accounts_receivable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          access_code: string
          company_type: string | null
          created_at: string
          id: string
          name: string
          parent_bpo_id: string | null
          updated_at: string
        }
        Insert: {
          access_code: string
          company_type?: string | null
          created_at?: string
          id?: string
          name: string
          parent_bpo_id?: string | null
          updated_at?: string
        }
        Update: {
          access_code?: string
          company_type?: string | null
          created_at?: string
          id?: string
          name?: string
          parent_bpo_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_parent_bpo_id_fkey"
            columns: ["parent_bpo_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_card_labels: {
        Row: {
          card_id: string
          created_at: string
          id: string
          label_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          label_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          label_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_card_labels_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "crm_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_card_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "crm_labels"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_cards: {
        Row: {
          column_id: string
          company_id: string
          contact_name: string | null
          created_at: string
          created_by: string
          description: string | null
          email: string | null
          id: string
          phone: string | null
          position: number
          project_summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          column_id: string
          company_id: string
          contact_name?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          position?: number
          project_summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          column_id?: string
          company_id?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          position?: number
          project_summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "crm_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_checklist_items: {
        Row: {
          checklist_id: string
          completed: boolean
          created_at: string
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          checklist_id: string
          completed?: boolean
          created_at?: string
          id?: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          checklist_id?: string
          completed?: boolean
          created_at?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "crm_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_checklists: {
        Row: {
          card_id: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          title?: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_checklists_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "crm_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_columns: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          id?: string
          name: string
          position: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      crm_labels: {
        Row: {
          color: string
          company_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color: string
          company_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_id: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_company: {
        Args: { target_company_id: string }
        Returns: boolean
      }
      create_client_company: {
        Args: {
          client_name: string
          client_access_code: string
          admin_user_id: string
        }
        Returns: string
      }
      get_accounts_payable_totals: {
        Args: { company_uuid: string }
        Returns: {
          total_open: number
          total_overdue: number
          total_paid: number
          count_open: number
          count_overdue: number
          count_paid: number
        }[]
      }
      get_accounts_receivable_totals: {
        Args: { company_uuid: string }
        Returns: {
          total_open: number
          total_overdue: number
          total_received: number
          count_open: number
          count_overdue: number
          count_received: number
        }[]
      }
      get_cash_flow_data: {
        Args: { company_uuid: string; months_back?: number }
        Returns: {
          month_name: string
          entradas: number
          saidas: number
          saldo: number
        }[]
      }
      get_company_balance: {
        Args: { company_uuid: string }
        Returns: {
          total_balance: number
          total_receivable: number
          total_payable: number
        }[]
      }
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      initialize_crm_data: {
        Args: { company_uuid: string }
        Returns: undefined
      }
      is_admin_bpo: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_financeiro: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_proprietario: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: "financeiro" | "proprietario" | "admin_bpo" | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["financeiro", "proprietario", "admin_bpo", "cliente"],
    },
  },
} as const
