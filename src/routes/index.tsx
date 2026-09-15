import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, BarChart3, ClipboardList, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SSMSI — Suivi médico-professionnel de l'infirmerie" },
      {
        name: "description",
        content:
          "Plateforme de suivi des travailleurs, des consultations infirmières et de la surveillance sanitaire en entreprise.",
      },
      { property: "og:title", content: "SSMSI — Suivi médico-professionnel de l'infirmerie" },
      {
        property: "og:description",
        content:
          "Consultations infirmières, dossiers individuels et indicateurs sanitaires en un seul outil.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Accueil,
});

const ATOUTS = [
  {
    icon: ClipboardList,
    titre: "Consultation rapide",
    texte: "Saisie en moins d'une minute avec référentiel de diagnostics et suite donnée.",
  },
  {
    icon: Users,
    titre: "Dossier du travailleur",
    texte: "Historique chronologique complet, arrêts cumulés et pathologies récurrentes.",
  },
  {
    icon: BarChart3,
    titre: "Pilotage sanitaire",
    texte: "Indicateurs, tendances et répartition par service pour la Direction et le QHSE.",
  },
  {
    icon: ShieldCheck,
    titre: "Accès par rôle",
    texte: "Infirmier, médecin du travail, QHSE, Direction et administrateur.",
  },
];

function Accueil() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="size-5" />
          </div>
          <span className="font-semibold">SSMSI</span>
        </div>
        <Link to="/auth">
          <Button size="sm">Accéder à la plateforme</Button>
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        <section className="py-14">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Infirmerie d'entreprise
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            Système de Suivi Médico-Professionnel et de Surveillance Sanitaire
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Centralisez les consultations infirmières, les dossiers des travailleurs et les
            indicateurs de santé au travail dans une interface claire, pensée pour le terrain.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth">
              <Button size="lg">Se connecter</Button>
            </Link>
            <Link to="/tableau-de-bord">
              <Button size="lg" variant="outline">
                Voir le tableau de bord
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {ATOUTS.map(({ icon: Icon, titre, texte }) => (
            <div key={titre} className="rounded-xl border bg-card p-5">
              <Icon className="size-5 text-primary" />
              <h2 className="mt-3 font-medium">{titre}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{texte}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
