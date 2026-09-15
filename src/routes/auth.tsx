import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS, type AppRole } from "@/lib/ssmsi";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — SSMSI Infirmerie" },
      {
        name: "description",
        content:
          "Accédez à la plateforme SSMSI : suivi médico-professionnel et surveillance sanitaire de l'infirmerie.",
      },
      { property: "og:title", content: "Connexion — SSMSI Infirmerie" },
      {
        property: "og:description",
        content: "Espace sécurisé du personnel de l'infirmerie d'entreprise.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nomComplet, setNomComplet] = useState("");
  const [role, setRole] = useState<AppRole>("infirmier");
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/tableau-de-bord", replace: true });
    });
  }, [navigate]);

  const connexion = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
    setEnCours(false);
    if (error) {
      toast.error("Connexion impossible", { description: error.message });
      return;
    }
    navigate({ to: "/tableau-de-bord", replace: true });
  };

  const inscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nom_complet: nomComplet, role },
      },
    });
    setEnCours(false);
    if (error) {
      toast.error("Inscription impossible", { description: error.message });
      return;
    }
    if (data.session) {
      navigate({ to: "/tableau-de-bord", replace: true });
    } else {
      toast.success("Compte créé", {
        description: "Vérifiez votre boîte mail pour confirmer votre adresse.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-6" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight">SSMSI</p>
            <p className="text-xs text-muted-foreground">
              Suivi médico-professionnel et surveillance sanitaire
            </p>
          </div>
        </div>

        <Tabs defaultValue="connexion">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connexion">Connexion</TabsTrigger>
            <TabsTrigger value="inscription">Créer un compte</TabsTrigger>
          </TabsList>

          <TabsContent value="connexion">
            <form className="mt-4 space-y-4" onSubmit={connexion}>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@entreprise.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mdp">Mot de passe</Label>
                <Input
                  id="mdp"
                  type="password"
                  required
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={enCours}>
                {enCours ? "Connexion…" : "Se connecter"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="inscription">
            <form className="mt-4 space-y-4" onSubmit={inscription}>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom complet</Label>
                <Input
                  id="nom"
                  required
                  value={nomComplet}
                  onChange={(e) => setNomComplet(e.target.value)}
                  placeholder="Awa Ndiaye"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email2">Adresse e-mail</Label>
                <Input
                  id="email2"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mdp2">Mot de passe</Label>
                <Input
                  id="mdp2"
                  type="password"
                  required
                  minLength={6}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_LABELS) as AppRole[]).map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={enCours}>
                {enCours ? "Création…" : "Créer le compte"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
