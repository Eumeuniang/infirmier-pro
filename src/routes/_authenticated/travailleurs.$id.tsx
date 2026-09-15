import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Stethoscope, Clock } from "lucide-react";

import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useConsultationsTravailleur, useTravailleur } from "@/lib/donnees";
import { GRAVITE_LABELS, STATUT_LABELS, dateFr, type Gravite } from "@/lib/ssmsi";

export const Route = createFileRoute("/_authenticated/travailleurs/$id")({
  head: () => ({
    meta: [
      { title: "Dossier du travailleur — SSMSI" },
      {
        name: "description",
        content: "Historique chronologique des consultations et indicateurs individuels.",
      },
      { property: "og:title", content: "Dossier du travailleur — SSMSI" },
      { property: "og:description", content: "Suivi médical individuel du travailleur." },
    ],
  }),
  component: DossierTravailleur,
});

const couleurGravite = (g: Gravite) =>
  g === "urgence"
    ? "bg-destructive"
    : g === "severe"
      ? "bg-chart-5"
      : g === "modere"
        ? "bg-chart-4"
        : "bg-chart-2";

function DossierTravailleur() {
  const { id } = Route.useParams();
  const { data: travailleur, isLoading } = useTravailleur(id);
  const { data: consultations } = useConsultationsTravailleur(id);
  const [periode, setPeriode] = useState("365");
  const [categorie, setCategorie] = useState("toutes");

  const categories = useMemo(
    () => [...new Set((consultations ?? []).map((c) => c.diagnostic?.categorie).filter(Boolean))],
    [consultations],
  ) as string[];

  const liste = useMemo(() => {
    const limite = new Date(Date.now() - Number(periode) * 86400000);
    return (consultations ?? []).filter(
      (c) =>
        new Date(c.date_consultation) >= limite &&
        (categorie === "toutes" || c.diagnostic?.categorie === categorie),
    );
  }, [consultations, periode, categorie]);

  const total = consultations?.length ?? 0;
  const arrets = (consultations ?? []).reduce((s, c) => s + (c.jours_arret ?? 0), 0);
  const derniere = consultations?.[0]?.date_consultation ?? null;

  if (isLoading) return <Skeleton className="h-96" />;
  if (!travailleur) return <p className="text-sm text-muted-foreground">Travailleur introuvable.</p>;

  return (
    <div>
      <Link to="/travailleurs">
        <Button variant="ghost" size="sm" className="mb-3 gap-2 text-muted-foreground">
          <ArrowLeft className="size-4" /> Retour au registre
        </Button>
      </Link>

      <PageHeader
        titre={`${travailleur.prenom} ${travailleur.nom}`}
        description={`${travailleur.matricule} · ${travailleur.fonction} · ${travailleur.service}`}
        action={<Badge variant="secondary">{STATUT_LABELS[travailleur.statut]}</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Consultations</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-semibold">
              <Stethoscope className="size-5 text-primary" />
              {total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Dernière visite</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium">
              <Clock className="size-4 text-primary" />
              {dateFr(derniere, true)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Jours d'arrêt cumulés</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-semibold">
              <CalendarDays className="size-5 text-primary" />
              {arrets}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Identité</p>
            <p className="mt-1 text-sm">
              Né(e) le {dateFr(travailleur.date_naissance)} · {travailleur.sexe === "F" ? "F" : "M"}
            </p>
            <p className="text-sm text-muted-foreground">{travailleur.telephone ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h2 className="mr-auto text-lg font-semibold">Historique chronologique</h2>
        <Select value={periode} onValueChange={setPeriode}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">3 derniers mois</SelectItem>
            <SelectItem value="365">12 derniers mois</SelectItem>
            <SelectItem value="3650">Tout l'historique</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categorie} onValueChange={setCategorie}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toutes">Toutes catégories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 space-y-3 border-l-2 border-border pl-6">
        {liste.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune consultation sur cette période.</p>
        )}
        {liste.map((c) => (
          <div key={c.id} className="relative rounded-lg border bg-card p-4">
            <span
              className={`absolute -left-[31px] top-5 size-3 rounded-full ring-4 ring-background ${couleurGravite(c.gravite)}`}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{c.diagnostic?.libelle ?? c.motif}</p>
              <span className="text-xs text-muted-foreground">
                {dateFr(c.date_consultation, true)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">{c.diagnostic?.categorie ?? "Non classé"}</Badge>
              <Badge variant={c.gravite === "urgence" ? "destructive" : "secondary"}>
                {GRAVITE_LABELS[c.gravite]}
              </Badge>
              <Badge variant="outline">{c.suite_donnee}</Badge>
              {c.jours_arret > 0 && <Badge variant="outline">{c.jours_arret} j d'arrêt</Badge>}
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div>
                <dt className="inline text-muted-foreground">Motif : </dt>
                <dd className="inline">{c.motif}</dd>
              </div>
              <div>
                <dt className="inline text-muted-foreground">Constantes : </dt>
                <dd className="inline">
                  {c.tension ?? "—"} · {c.temperature ?? "—"} °C · {c.pouls ?? "—"} bpm
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="inline text-muted-foreground">Prescription : </dt>
                <dd className="inline">{c.prescription ?? "—"}</dd>
              </div>
              {c.observations && (
                <div className="sm:col-span-2">
                  <dt className="inline text-muted-foreground">Observations : </dt>
                  <dd className="inline">{c.observations}</dd>
                </div>
              )}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
