import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS, dateFr, type AppRole } from "@/lib/ssmsi";

export const Route = createFileRoute("/_authenticated/utilisateurs")({
  head: () => ({
    meta: [
      { title: "Utilisateurs — SSMSI" },
      { name: "description", content: "Comptes du personnel et rôles attribués sur la plateforme." },
      { property: "og:title", content: "Utilisateurs — SSMSI" },
      { property: "og:description", content: "Annuaire des comptes de l'infirmerie." },
    ],
  }),
  component: PageUtilisateurs,
});

function PageUtilisateurs() {
  const { role } = useAuth();

  const { data } = useQuery({
    queryKey: ["utilisateurs"],
    queryFn: async () => {
      const [{ data: profils }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id, nom_complet, email, created_at"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const parUtilisateur = new Map<string, AppRole>();
      (roles ?? []).forEach((r: { user_id: string; role: string }) =>
        parUtilisateur.set(r.user_id, r.role as AppRole),
      );
      return (profils ?? []).map((p) => ({
        ...p,
        role: parUtilisateur.get(p.id as string) ?? null,
      }));
    },
  });

  return (
    <div>
      <PageHeader
        titre="Utilisateurs"
        description="Comptes du personnel ayant accès à la plateforme et rôle attribué à l'inscription."
      />

      {role !== "admin" && (
        <p className="mb-4 rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground">
          Seul l'administrateur voit le rôle de chaque compte ; votre vue est limitée à l'annuaire.
        </p>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Inscription</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((u) => (
              <TableRow key={u.id as string}>
                <TableCell className="font-medium">{u.nom_complet || "—"}</TableCell>
                <TableCell>{u.email ?? "—"}</TableCell>
                <TableCell>
                  {u.role ? (
                    <Badge variant="secondary">{ROLE_LABELS[u.role]}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Non visible</span>
                  )}
                </TableCell>
                <TableCell>{dateFr(u.created_at as string)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
