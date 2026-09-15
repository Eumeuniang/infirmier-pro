import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useConsultations } from "@/lib/donnees";
import { GRAVITE_LABELS, dateFr, peutSoigner, type Gravite } from "@/lib/ssmsi";

export const Route = createFileRoute("/_authenticated/consultations/")({
  head: () => ({
    meta: [
      { title: "Consultations — SSMSI" },
      {
        name: "description",
        content: "Journal des consultations infirmières : diagnostic, gravité et suite donnée.",
      },
      { property: "og:title", content: "Consultations — SSMSI" },
      { property: "og:description", content: "Historique complet des passages à l'infirmerie." },
    ],
  }),
  component: PageConsultations,
});

function PageConsultations() {
  const { data: consultations, isLoading } = useConsultations();
  const { role } = useAuth();
  const [recherche, setRecherche] = useState("");
  const [gravite, setGravite] = useState("toutes");

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return (consultations ?? []).filter((c) => {
      const texte =
        `${c.travailleur?.nom ?? ""} ${c.travailleur?.prenom ?? ""} ${c.travailleur?.matricule ?? ""} ${c.diagnostic?.libelle ?? ""} ${c.motif}`.toLowerCase();
      return (!q || texte.includes(q)) && (gravite === "toutes" || c.gravite === gravite);
    });
  }, [consultations, recherche, gravite]);

  return (
    <div>
      <PageHeader
        titre="Consultations"
        description={`${liste.length} consultation(s) affichée(s).`}
        action={
          peutSoigner(role) && (
            <Link to="/consultations/nouvelle">
              <Button className="gap-2">
                <Plus className="size-4" /> Nouvelle consultation
              </Button>
            </Link>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher un travailleur ou un diagnostic…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>
        <Select value={gravite} onValueChange={setGravite}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toutes">Toutes gravités</SelectItem>
            {(Object.keys(GRAVITE_LABELS) as Gravite[]).map((g) => (
              <SelectItem key={g} value={g}>
                {GRAVITE_LABELS[g]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Travailleur</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Diagnostic</TableHead>
              <TableHead>Gravité</TableHead>
              <TableHead>Suite donnée</TableHead>
              <TableHead className="text-right">Arrêt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                  Chargement…
                </TableCell>
              </TableRow>
            )}
            {liste.slice(0, 200).map((c) => (
              <TableRow key={c.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {dateFr(c.date_consultation, true)}
                </TableCell>
                <TableCell>
                  {c.travailleur ? (
                    <Link
                      to="/travailleurs/$id"
                      params={{ id: c.travailleur.id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {c.travailleur.prenom} {c.travailleur.nom}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{c.travailleur?.service ?? "—"}</TableCell>
                <TableCell>{c.diagnostic?.libelle ?? c.motif}</TableCell>
                <TableCell>
                  <Badge variant={c.gravite === "urgence" ? "destructive" : "secondary"}>
                    {GRAVITE_LABELS[c.gravite]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{c.suite_donnee}</TableCell>
                <TableCell className="text-right text-sm">
                  {c.jours_arret > 0 ? `${c.jours_arret} j` : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {liste.length > 200 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Seules les 200 consultations les plus récentes sont affichées. Affinez la recherche pour
          voir les autres.
        </p>
      )}
    </div>
  );
}
