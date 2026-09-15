export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      consultations: {
        Row: {
          created_at: string
          date_consultation: string
          diagnostic_id: string | null
          gravite: Database["public"]["Enums"]["gravite_niveau"]
          id: string
          jours_arret: number
          motif: string
          observations: string | null
          pouls: number | null
          prescription: string | null
          soignant_id: string | null
          suite_donnee: string
          temperature: number | null
          tension: string | null
          travailleur_id: string
        }
        Insert: {
          created_at?: string
          date_consultation?: string
          diagnostic_id?: string | null
          gravite?: Database["public"]["Enums"]["gravite_niveau"]
          id?: string
          jours_arret?: number
          motif: string
          observations?: string | null
          pouls?: number | null
          prescription?: string | null
          soignant_id?: string | null
          suite_donnee?: string
          temperature?: number | null
          tension?: string | null
          travailleur_id: string
        }
        Update: {
          created_at?: string
          date_consultation?: string
          diagnostic_id?: string | null
          gravite?: Database["public"]["Enums"]["gravite_niveau"]
          id?: string
          jours_arret?: number
          motif?: string
          observations?: string | null
          pouls?: number | null
          prescription?: string | null
          soignant_id?: string | null
          suite_donnee?: string
          temperature?: number | null
          tension?: string | null
          travailleur_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics_ref"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_travailleur_id_fkey"
            columns: ["travailleur_id"]
            isOneToOne: false
            referencedRelation: "travailleurs"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics_ref: {
        Row: {
          categorie: string
          code: string
          created_at: string
          id: string
          libelle: string
        }
        Insert: {
          categorie: string
          code: string
          created_at?: string
          id?: string
          libelle: string
        }
        Update: {
          categorie?: string
          code?: string
          created_at?: string
          id?: string
          libelle?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nom_complet: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nom_complet?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nom_complet?: string
        }
        Relationships: []
      }
      travailleurs: {
        Row: {
          created_at: string
          date_embauche: string | null
          date_naissance: string | null
          fonction: string
          id: string
          matricule: string
          nom: string
          prenom: string
          service: string
          sexe: string
          statut: Database["public"]["Enums"]["statut_travailleur"]
          telephone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_embauche?: string | null
          date_naissance?: string | null
          fonction: string
          id?: string
          matricule: string
          nom: string
          prenom: string
          service: string
          sexe?: string
          statut?: Database["public"]["Enums"]["statut_travailleur"]
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_embauche?: string | null
          date_naissance?: string | null
          fonction?: string
          id?: string
          matricule?: string
          nom?: string
          prenom?: string
          service?: string
          sexe?: string
          statut?: Database["public"]["Enums"]["statut_travailleur"]
          telephone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      est_soignant: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "infirmier" | "medecin" | "qhse" | "direction"
      gravite_niveau: "benin" | "modere" | "severe" | "urgence"
      statut_travailleur: "actif" | "suspendu" | "sorti"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "infirmier", "medecin", "qhse", "direction"],
      gravite_niveau: ["benin", "modere", "severe", "urgence"],
      statut_travailleur: ["actif", "suspendu", "sorti"],
    },
  },
} as const
