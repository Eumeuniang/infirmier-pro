import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Consultation, DiagnosticRef, Travailleur } from "@/lib/ssmsi";

const SELECT_CONSULT =
  "id, travailleur_id, diagnostic_id, date_consultation, motif, gravite, tension, temperature, pouls, prescription, suite_donnee, jours_arret, observations, diagnostic:diagnostics_ref(id, code, libelle, categorie), travailleur:travailleurs(id, nom, prenom, matricule, service)";

export function useTravailleurs() {
  return useQuery({
    queryKey: ["travailleurs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travailleurs")
        .select("*")
        .order("nom", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Travailleur[];
    },
  });
}

export function useTravailleur(id: string) {
  return useQuery({
    queryKey: ["travailleur", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travailleurs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as Travailleur | null;
    },
  });
}

export function useDiagnostics() {
  return useQuery({
    queryKey: ["diagnostics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diagnostics_ref")
        .select("*")
        .order("categorie", { ascending: true })
        .order("libelle", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as DiagnosticRef[];
    },
  });
}

export function useConsultations(limite = 1000) {
  return useQuery({
    queryKey: ["consultations", limite],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultations")
        .select(SELECT_CONSULT)
        .order("date_consultation", { ascending: false })
        .limit(limite);
      if (error) throw error;
      return (data ?? []) as unknown as Consultation[];
    },
  });
}

export function useConsultationsTravailleur(travailleurId: string) {
  return useQuery({
    queryKey: ["consultations-travailleur", travailleurId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultations")
        .select(SELECT_CONSULT)
        .eq("travailleur_id", travailleurId)
        .order("date_consultation", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Consultation[];
    },
  });
}
