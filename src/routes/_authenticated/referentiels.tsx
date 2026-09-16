import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDiagnostics } from "@/lib/donnees";
import { peutSoigner } from "@/lib/ssmsi";

export const Route = createFileRoute("/_authenticated/referentiels")({
  head: () => ({
    meta: [
      { title: "Référentiels — SSMSI" },
      {
        name: "description",
        content: "Référentiel des diagnostics classés par catégorie pathologique.",
      },
      { property: "og:title", content: "Référentiels — SSMSI" },
      { property: "og:description", content: "Codes et libellés utilisés lors des consultations." },
    ],
  }),
  component: PageReferentiels,
});

function PageReferentiels() {
  const { data: diagnostics } = useDiagnostics();
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [ouvert, setOuvert] = useState(false);
  const [code, setCode] = useState("");
  const [libelle, setLibelle] = useState("");
  const [categorie, setCategorie] = useState("");

  const groupes = useMemo(() => {
    const map = new Map<string, { id: string; code: string; libelle: string }[]>();
    (diagnostics ?? []).forEach((d) => {
      map.set(d.categorie, [...(map.get(d.categorie) ?? []), d]);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [diagnostics]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("diagnostics_ref")
        .insert({ code, libelle, categorie });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnostics"] });
      toast.success("Diagnostic ajouté au référentiel");
      setCode("");
      setLibelle("");
      setCategorie("");
      setOuvert(false);
    },
    onError: (e: Error) => toast.error("Ajout impossible", { description: e.message }),
  });

  return (
    <div>
      <PageHeader
        titre="Référentiels"
        description={`${diagnostics?.length ?? 0} diagnostics répartis en ${groupes.length} catégories.`}
        action={
          peutSoigner(role) && (
            <Dialog open={ouvert} onOpenChange={setOuvert}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="size-4" /> Ajouter un diagnostic
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau diagnostic</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    mutation.mutate();
                  }}
                >
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="RESP-04"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Libellé</Label>
                    <Input
                      required
                      value={libelle}
                      onChange={(e) => setLibelle(e.target.value)}
                      placeholder="Sinusite aiguë"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Input
                      required
                      value={categorie}
                      onChange={(e) => setCategorie(e.target.value)}
                      placeholder="Respiratoire"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={mutation.isPending}>
                      Enregistrer
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groupes.map(([categorieNom, items]) => (
          <Card key={categorieNom}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                {categorieNom}
                <Badge variant="secondary">{items.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {items.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>{d.libelle}</span>
                  <span className="font-mono text-xs text-muted-foreground">{d.code}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
