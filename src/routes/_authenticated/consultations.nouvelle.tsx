import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDiagnostics, useTravailleurs } from "@/lib/donnees";
import { GRAVITE_LABELS, SUITES_DONNEES, peutSoigner, type Gravite } from "@/lib/ssmsi";

export const Route = createFileRoute("/_authenticated/consultations/nouvelle")({
  head: () => ({
    meta: [
      { title: "Nouvelle consultation — SSMSI" },
      {
        name: "description",
        content: "Saisie rapide d'une consultation infirmière avec diagnostic et suite donnée.",
      },
      { property: "og:title", content: "Nouvelle consultation — SSMSI" },
      { property: "og:description", content: "Enregistrer un passage à l'infirmerie en une page." },
    ],
  }),
  component: NouvelleConsultation,
});

function NouvelleConsultation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const { data: travailleurs } = useTravailleurs();
  const { data: diagnostics } = useDiagnostics();

  const [travailleurId, setTravailleurId] = useState("");
  const [diagnosticId, setDiagnosticId] = useState("");
  const [motif, setMotif] = useState("");
  const [gravite, setGravite] = useState<Gravite>("benin");
  const [tension, setTension] = useState("");
  const [temperature, setTemperature] = useState("");
  const [pouls, setPouls] = useState("");
  const [prescription, setPrescription] = useState("");
  const [suite, setSuite] = useState<string>(SUITES_DONNEES[0]);
  const [joursArret, setJoursArret] = useState("0");
  const [observations, setObservations] = useState("");

  const parCategorie = useMemo(() => {
    const map = new Map<string, typeof diagnostics>();
    (diagnostics ?? []).forEach((d) => {
      map.set(d.categorie, [...(map.get(d.categorie) ?? []), d]);
    });
    return [...map.entries()];
  }, [diagnostics]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("consultations").insert({
        travailleur_id: travailleurId,
        diagnostic_id: diagnosticId || null,
        soignant_id: user?.id ?? null,
        motif,
        gravite,
        tension: tension || null,
        temperature: temperature ? Number(temperature) : null,
        pouls: pouls ? Number(pouls) : null,
        prescription: prescription || null,
        suite_donnee: suite,
        jours_arret: Number(joursArret) || 0,
        observations: observations || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["consultations-travailleur", travailleurId] });
      toast.success("Consultation enregistrée");
      navigate({ to: "/consultations" });
    },
    onError: (e: Error) => toast.error("Enregistrement impossible", { description: e.message }),
  });

  if (!peutSoigner(role)) {
    return (
      <p className="text-sm text-muted-foreground">
        Seuls l'infirmier, le médecin du travail et l'administrateur peuvent saisir une
        consultation.
      </p>
    );
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        titre="Nouvelle consultation"
        description="Saisie rapide d'un passage à l'infirmerie."
      />

      <Card>
        <CardContent className="p-6">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!travailleurId) {
                toast.error("Sélectionnez un travailleur");
                return;
              }
              mutation.mutate();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Travailleur</Label>
                <Select value={travailleurId} onValueChange={setTravailleurId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rechercher par matricule ou nom" />
                  </SelectTrigger>
                  <SelectContent>
                    {(travailleurs ?? [])
                      .filter((t) => t.statut !== "sorti")
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.matricule} — {t.prenom} {t.nom} ({t.service})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Diagnostic</Label>
                <Select value={diagnosticId} onValueChange={setDiagnosticId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir dans le référentiel" />
                  </SelectTrigger>
                  <SelectContent>
                    {parCategorie.map(([categorie, items]) => (
                      <SelectGroup key={categorie}>
                        <SelectLabel>{categorie}</SelectLabel>
                        {(items ?? []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.libelle}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Motif de la visite</Label>
                <Input
                  required
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Douleurs lombaires depuis ce matin"
                />
              </div>

              <div className="space-y-2">
                <Label>Gravité</Label>
                <Select value={gravite} onValueChange={(v) => setGravite(v as Gravite)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(GRAVITE_LABELS) as Gravite[]).map((g) => (
                      <SelectItem key={g} value={g}>
                        {GRAVITE_LABELS[g]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Suite donnée</Label>
                <Select value={suite} onValueChange={setSuite}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUITES_DONNEES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tension artérielle</Label>
                <Input
                  value={tension}
                  onChange={(e) => setTension(e.target.value)}
                  placeholder="120/80"
                />
              </div>
              <div className="space-y-2">
                <Label>Température (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="37.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Pouls (bpm)</Label>
                <Input
                  type="number"
                  value={pouls}
                  onChange={(e) => setPouls(e.target.value)}
                  placeholder="72"
                />
              </div>
              <div className="space-y-2">
                <Label>Jours d'arrêt</Label>
                <Input
                  type="number"
                  min="0"
                  value={joursArret}
                  onChange={(e) => setJoursArret(e.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Prescription</Label>
                <Textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Paracétamol 1g x3/j pendant 3 jours"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Observations</Label>
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Enregistrement…" : "Enregistrer la consultation"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/consultations" })}>
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
