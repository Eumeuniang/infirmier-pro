import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — SSMSI Infirmerie" },
      { name: "description", content: "Définissez un nouveau mot de passe pour votre compte SSMSI." },
      { property: "og:title", content: "Nouveau mot de passe — SSMSI Infirmerie" },
      { property: "og:description", content: "Réinitialisation du mot de passe SSMSI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [mdp, setMdp] = useState("");
  const [enCours, setEnCours] = useState(false);

  const valider = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    const { error } = await supabase.auth.updateUser({ password: mdp });
    setEnCours(false);
    if (error) {
      toast.error("Modification impossible", { description: error.message });
      return;
    }
    toast.success("Mot de passe modifié");
    navigate({ to: "/tableau-de-bord", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <form onSubmit={valider} className="w-full max-w-md space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Choisir un nouveau mot de passe</h1>
        <div className="space-y-2">
          <Label htmlFor="mdp">Nouveau mot de passe</Label>
          <Input id="mdp" type="password" required minLength={6} value={mdp} onChange={(e) => setMdp(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={enCours}>
          {enCours ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}
