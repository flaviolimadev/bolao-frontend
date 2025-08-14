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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bolao_groups: {
        Row: {
          cards_uploaded: boolean | null
          created_at: string
          edition_id: string
          group_number: number
          id: string
          max_quotas: number
          updated_at: string
        }
        Insert: {
          cards_uploaded?: boolean | null
          created_at?: string
          edition_id: string
          group_number: number
          id?: string
          max_quotas?: number
          updated_at?: string
        }
        Update: {
          cards_uploaded?: boolean | null
          created_at?: string
          edition_id?: string
          group_number?: number
          id?: string
          max_quotas?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bolao_groups_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      bolao_quotas: {
        Row: {
          bolao_group_id: string
          created_at: string
          id: string
          quota_numbers: number[]
          sale_id: string
        }
        Insert: {
          bolao_group_id: string
          created_at?: string
          id?: string
          quota_numbers: number[]
          sale_id: string
        }
        Update: {
          bolao_group_id?: string
          created_at?: string
          id?: string
          quota_numbers?: number[]
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bolao_quotas_bolao_group_id_fkey"
            columns: ["bolao_group_id"]
            isOneToOne: false
            referencedRelation: "bolao_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bolao_quotas_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      card_uploads: {
        Row: {
          bolao_group_id: string
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string | null
          id: string
          storage_path: string
          upload_type: string | null
        }
        Insert: {
          bolao_group_id: string
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_url?: string | null
          id?: string
          storage_path: string
          upload_type?: string | null
        }
        Update: {
          bolao_group_id?: string
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string | null
          id?: string
          storage_path?: string
          upload_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_uploads_bolao_group_id_fkey"
            columns: ["bolao_group_id"]
            isOneToOne: false
            referencedRelation: "bolao_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          active: boolean | null
          bot_message: string | null
          created_at: string | null
          id: number
          message_type: string | null
          nomewpp: string | null
          phone: string | null
          user_message: string | null
        }
        Insert: {
          active?: boolean | null
          bot_message?: string | null
          created_at?: string | null
          id?: number
          message_type?: string | null
          nomewpp?: string | null
          phone?: string | null
          user_message?: string | null
        }
        Update: {
          active?: boolean | null
          bot_message?: string | null
          created_at?: string | null
          id?: number
          message_type?: string | null
          nomewpp?: string | null
          phone?: string | null
          user_message?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          created_at: string | null
          id: number
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dados_cliente: {
        Row: {
          atendimento_ia: string | null
          created_at: string | null
          id: number
          nomewpp: string | null
          telefone: string | null
        }
        Insert: {
          atendimento_ia?: string | null
          created_at?: string | null
          id?: number
          nomewpp?: string | null
          telefone?: string | null
        }
        Update: {
          atendimento_ia?: string | null
          created_at?: string | null
          id?: number
          nomewpp?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      editions: {
        Row: {
          bolao_quota_price: number | null
          cards_per_group: number | null
          created_at: string
          draw_date: string | null
          edition_number: number
          id: string
          individual_card_price: number | null
          is_active: boolean | null
          prize_image_url: string | null
          quotas_per_group: number | null
          sales_paused: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          bolao_quota_price?: number | null
          cards_per_group?: number | null
          created_at?: string
          draw_date?: string | null
          edition_number: number
          id?: string
          individual_card_price?: number | null
          is_active?: boolean | null
          prize_image_url?: string | null
          quotas_per_group?: number | null
          sales_paused?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          bolao_quota_price?: number | null
          cards_per_group?: number | null
          created_at?: string
          draw_date?: string | null
          edition_number?: number
          id?: string
          individual_card_price?: number | null
          is_active?: boolean | null
          prize_image_url?: string | null
          quotas_per_group?: number | null
          sales_paused?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          photo_url: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      promotoras: {
        Row: {
          automatic_link_id: string | null
          cpf: string | null
          created_at: string
          id: string
          is_active: boolean | null
          manual_link_id: string | null
          name: string
          phone: string | null
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          automatic_link_id?: string | null
          cpf?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          manual_link_id?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          automatic_link_id?: string | null
          cpf?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          manual_link_id?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      revendedores: {
        Row: {
          automatic_link_id: string | null
          cpf: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          ranking_position: number | null
          updated_at: string
        }
        Insert: {
          automatic_link_id?: string | null
          cpf?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          ranking_position?: number | null
          updated_at?: string
        }
        Update: {
          automatic_link_id?: string | null
          cpf?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          ranking_position?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount: number | null
          created_at: string
          customer_id: string
          edition_id: string
          id: string
          payment_status: string
          quotas_quantity: number | null
          sale_date: string
          sale_type: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          customer_id: string
          edition_id: string
          id?: string
          payment_status?: string
          quotas_quantity?: number | null
          sale_date?: string
          sale_type?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          customer_id?: string
          edition_id?: string
          id?: string
          payment_status?: string
          quotas_quantity?: number | null
          sale_date?: string
          sale_type?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
