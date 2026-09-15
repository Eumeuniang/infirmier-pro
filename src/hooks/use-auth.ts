import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/ssmsi";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nouvelleSession) => {
      setSession(nouvelleSession);
      setChargement(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChargement(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  const { data: profil } = useQuery({
    queryKey: ["profil", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [{ data: roleRow }, { data: profilRow }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId!).maybeSingle(),
        supabase.from("profiles").select("nom_complet, email").eq("id", userId!).maybeSingle(),
      ]);
      return {
        role: (roleRow?.role ?? null) as AppRole | null,
        nom: (profilRow?.nom_complet as string | undefined) || session?.user?.email || "",
      };
    },
  });

  return {
    session,
    user: session?.user ?? null,
    role: profil?.role ?? null,
    nom: profil?.nom ?? session?.user?.email ?? "",
    chargement,
  };
}
