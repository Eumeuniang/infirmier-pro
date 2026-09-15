import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  AlertTriangle,
  CalendarDays,
  HeartPulse,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConsultations, useTravailleurs } from "@/lib/donnees";
import { GRAVITE_LABELS, dateFr, type Consultation, type Gravite } from "@/lib/ssmsi";

export const Route = createFileRoute("/_authenticated/tableau-de-bord")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — SSMSI" },
      {
        name: "description",
        content:
          "Indicateurs de santé au travail : consultations, pathologies fréquentes, alertes et tendances.",
      },
      { property: "og:title", content: "Tableau de bord — SSMSI" },
      {
        property: "og:description",
        content: "Suivi en temps réel de l'activité de l'infirmerie d'entreprise.",
      },
    ],
  }),
  component: TableauDeBord,
});

const COULEURS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function Indicateur({
  titre,
  valeur,
  detail,
  icon: Icon,
}: {
  titre: string;
  valeur: string | number;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{titre}</p>
          <p className="mt-1 text-2xl font-semibold">{valeur}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function TableauDeBord() {
  const { data: consultations, isLoading } = useConsultations();
  const { data: travailleurs } = useTravailleurs();

  const stats = useMemo(() => {
    const liste: Consultation[] = consultations ?? [];
    const maintenant = new Date();
    const debutJour = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);

    const duJour = liste.filter((c) => new Date(c.date_consultation) >= debutJour).length;
    const duMois = liste.filter((c) => new Date(c.date_consultation) >= debutMois).length;
    const urgences = liste.filter(
      (c) => c.gravite === "urgence" && new Date(c.date_consultation) >= debutMois,
    );
    const joursArret = liste
      .filter((c) => new Date(c.date_consultation) >= debutMois)
      .reduce((s, c) => s + (c.jours_arret ?? 0), 0);

    const parMois = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      parMois.set(d.toISOString().slice(0, 7), 0);
    }
    liste.forEach((c) => {
      const cle = c.date_consultation.slice(0, 7);
      if (parMois.has(cle)) parMois.set(cle, (parMois.get(cle) ?? 0) + 1);
    });
    const tendance = [...parMois.entries()].map(([cle, total]) => ({
      mois: new Date(cle + "-01").toLocaleDateString("fr-FR", { month: "short" }),
      total,
    }));

    const compte = (cle: (c: Consultation) => string | undefined) => {
      const m = new Map<string, number>();
      liste.forEach((c) => {
        const k = cle(c);
        if (!k) return;
        m.set(k, (m.get(k) ?? 0) + 1);
      });
      return [...m.entries()]
        .map(([nom, total]) => ({ nom, total }))
        .sort((a, b) => b.total - a.total);
    };

    const pathologies = compte((c) => c.diagnostic?.libelle).slice(0, 8);
    const parService = compte((c) => c.travailleur?.service ?? undefined);
    const parGravite = (Object.keys(GRAVITE_LABELS) as Gravite[]).map((g) => ({
      nom: GRAVITE_LABELS[g],
      total: liste.filter((c) => c.gravite === g).length,
    }));

    const troisMois = new Date(maintenant.getTime() - 90 * 86400000);
    const recurrence = new Map<string, { nom: string; id: string; total: number }>();
    liste
      .filter((c) => new Date(c.date_consultation) >= troisMois && c.travailleur)
      .forEach((c) => {
        const t = c.travailleur!;
        const prev = recurrence.get(t.id) ?? {
          nom: `${t.prenom} ${t.nom} (${t.matricule})`,
          id: t.id,
          total: 0,
        };
        prev.total += 1;
        recurrence.set(t.id, prev);
      });
    const repetitions = [...recurrence.values()]
      .filter((r) => r.total >= 4)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      duJour,
      duMois,
      urgences,
      joursArret,
      tendance,
      pathologies,
      parService,
      parGravite,
      repetitions,
      total: liste.length,
    };
  }, [consultations]);

  const actifs = (travailleurs ?? []).filter((t) => t.statut === "actif").length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        titre="Tableau de bord"
        description="Vue d'ensemble de l'activité de l'infirmerie et de la santé des travailleurs."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Indicateur
          titre="Consultations du jour"
          valeur={stats.duJour}
          detail={`${stats.duMois} ce mois-ci`}
          icon={Stethoscope}
        />
        <Indicateur
          titre="Consultations (12 mois)"
          valeur={stats.total}
          detail="Tous services confondus"
          icon={TrendingUp}
        />
        <Indicateur
          titre="Urgences du mois"
          valeur={stats.urgences.length}
          detail="Cas classés urgence"
          icon={AlertTriangle}
        />
        <Indicateur
          titre="Jours d'arrêt (mois)"
          valeur={stats.joursArret}
          detail="Cumul des arrêts prescrits"
          icon={CalendarDays}
        />
        <Indicateur
          titre="Travailleurs actifs"
          valeur={actifs}
          detail={`${travailleurs?.length ?? 0} inscrits au registre`}
          icon={Users}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Tendance des consultations (12 mois)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.tendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mois" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Consultations"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition par gravité</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.parGravite}
                  dataKey="total"
                  nameKey="nom"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {stats.parGravite.map((_, i) => (
                    <Cell key={i} fill={COULEURS[i % COULEURS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pathologies les plus fréquentes</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.pathologies} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="nom" width={150} fontSize={11} />
                <Tooltip />
                <Bar dataKey="total" name="Cas" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consultations par service</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.parService}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="nom" fontSize={10} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" name="Consultations" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            <CardTitle className="text-base">Alertes — consultations répétées (90 jours)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.repetitions.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune récurrence notable détectée.</p>
            )}
            {stats.repetitions.map((r) => (
              <Link
                key={r.id}
                to="/travailleurs/$id"
                params={{ id: r.id }}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent"
              >
                <span>{r.nom}</span>
                <Badge variant="destructive">{r.total} passages</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <HeartPulse className="size-4 text-destructive" />
            <CardTitle className="text-base">Urgences récentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.urgences.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune urgence ce mois-ci.</p>
            )}
            {stats.urgences.slice(0, 5).map((c) => (
              <div key={c.id} className="rounded-md border px-3 py-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">
                    {c.travailleur ? `${c.travailleur.prenom} ${c.travailleur.nom}` : "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {dateFr(c.date_consultation, true)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{c.diagnostic?.libelle ?? c.motif}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
