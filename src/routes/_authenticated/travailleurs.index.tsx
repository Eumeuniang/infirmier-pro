import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTravailleurs } from "@/lib/donnees";
import {
  FONCTIONS,
  SERVICES,
  STATUT_LABELS,
  dateFr,
  peutSoigner,
  type StatutTravailleur,
  type Travailleur,
} from "@/lib/ssmsi";

export const Route = createFileRoute("/_authenticated/travailleurs/")({
  head: () => ({
    meta: [
      { title: "Travailleurs — SSMSI" },
      {
        name: "description",
        content: "Registre des travailleurs : matricule, service, fonction et statut.",
      },
      { property: "og:title", content: "Travailleurs — SSMSI" },
      { property: "og:description", content: "Gestion du registre du personnel suivi." },
    ],
  }),
  component: PageTravailleurs,
});

const VIDE = {
  matricule: "",
  nom: "",
  prenom: "",
  date_naissance: "",
  sexe: "M",
  service: SERVICES[0],
  fonction: FONCTIONS[0],
  date_embauche: "",
  statut: "actif" as StatutTravailleur,
  telephone: "",
};

function FormulaireTravailleur({
  travailleur,
  onClose,
}: {
  travailleur?: Travailleur;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [valeurs, setValeurs] = useState({
    ...VIDE,
    ...(travailleur
      ? {
          matricule: travailleur.matricule,
          nom: travailleur.nom,
          prenom: travailleur.prenom,
          date_naissance: travailleur.date_naissance ?? "",
          sexe: travailleur.sexe,
          service: travailleur.service,
          fonction: travailleur.fonction,
          date_embauche: travailleur.date_embauche ?? "",
          statut: travailleur.statut,
          telephone: travailleur.telephone ?? "",
        }
      : {}),
  });

  const set = (cle: string, valeur: string) => setValeurs((v) => ({ ...v, [cle]: valeur }));

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...valeurs,
        date_naissance: valeurs.date_naissance || null,
        date_embauche: valeurs.date_embauche || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = travailleur
        ? await supabase.from("travailleurs").update(payload).eq("id", travailleur.id)
        : await supabase.from("travailleurs").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travailleurs"] });
      toast.success(travailleur ? "Fiche mise à jour" : "Travailleur enregistré");
      onClose();
    },
    onError: (e: Error) => toast.error("Enregistrement impossible", { description: e.message }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Matricule</Label>
          <Input
            required
            value={valeurs.matricule}
            onChange={(e) => set("matricule", e.target.value)}
            placeholder="MAT-0061"
          />
        </div>
        <div className="space-y-2">
          <Label>Téléphone</Label>
          <Input value={valeurs.telephone} onChange={(e) => set("telephone", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Nom</Label>
          <Input required value={valeurs.nom} onChange={(e) => set("nom", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Prénom</Label>
          <Input required value={valeurs.prenom} onChange={(e) => set("prenom", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Date de naissance</Label>
          <Input
            type="date"
            value={valeurs.date_naissance}
            onChange={(e) => set("date_naissance", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Sexe</Label>
          <Select value={valeurs.sexe} onValueChange={(v) => set("sexe", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculin</SelectItem>
              <SelectItem value="F">Féminin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Service</Label>
          <Select value={valeurs.service} onValueChange={(v) => set("service", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SERVICES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Fonction</Label>
          <Select value={valeurs.fonction} onValueChange={(v) => set("fonction", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONCTIONS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date d'embauche</Label>
          <Input
            type="date"
            value={valeurs.date_embauche}
            onChange={(e) => set("date_embauche", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={valeurs.statut} onValueChange={(v) => set("statut", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUT_LABELS) as StatutTravailleur[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function PageTravailleurs() {
  const { data: travailleurs, isLoading } = useTravailleurs();
  const { role } = useAuth();
  const [recherche, setRecherche] = useState("");
  const [service, setService] = useState("tous");
  const [statut, setStatut] = useState("tous");
  const [ouvert, setOuvert] = useState(false);
  const [edition, setEdition] = useState<Travailleur | null>(null);

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return (travailleurs ?? []).filter((t) => {
      const correspond =
        !q ||
        `${t.nom} ${t.prenom} ${t.matricule} ${t.fonction}`.toLowerCase().includes(q);
      return (
        correspond &&
        (service === "tous" || t.service === service) &&
        (statut === "tous" || t.statut === statut)
      );
    });
  }, [travailleurs, recherche, service, statut]);

  return (
    <div>
      <PageHeader
        titre="Travailleurs"
        description={`${liste.length} fiche(s) affichée(s) sur ${travailleurs?.length ?? 0}.`}
        action={
          peutSoigner(role) && (
            <Dialog open={ouvert} onOpenChange={setOuvert}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="size-4" /> Nouveau travailleur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nouveau travailleur</DialogTitle>
                </DialogHeader>
                <FormulaireTravailleur onClose={() => setOuvert(false)} />
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher par nom, matricule, fonction…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>
        <Select value={service} onValueChange={setService}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les services</SelectItem>
            {SERVICES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous statuts</SelectItem>
            {(Object.keys(STATUT_LABELS) as StatutTravailleur[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUT_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matricule</TableHead>
              <TableHead>Nom et prénom</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Fonction</TableHead>
              <TableHead>Embauche</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
            {!isLoading && liste.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                  Aucun travailleur ne correspond à ces critères.
                </TableCell>
              </TableRow>
            )}
            {liste.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.matricule}</TableCell>
                <TableCell>
                  <Link
                    to="/travailleurs/$id"
                    params={{ id: t.id }}
                    className="font-medium text-primary hover:underline"
                  >
                    {t.prenom} {t.nom}
                  </Link>
                </TableCell>
                <TableCell>{t.service}</TableCell>
                <TableCell>{t.fonction}</TableCell>
                <TableCell>{dateFr(t.date_embauche)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      t.statut === "actif"
                        ? "default"
                        : t.statut === "suspendu"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {STATUT_LABELS[t.statut]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {peutSoigner(role) && (
                    <Button variant="ghost" size="sm" onClick={() => setEdition(t)}>
                      <Pencil className="size-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!edition} onOpenChange={(o) => !o && setEdition(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la fiche</DialogTitle>
          </DialogHeader>
          {edition && (
            <FormulaireTravailleur travailleur={edition} onClose={() => setEdition(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
