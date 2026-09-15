export type AppRole = "admin" | "infirmier" | "medecin" | "qhse" | "direction";
export type Gravite = "benin" | "modere" | "severe" | "urgence";
export type StatutTravailleur = "actif" | "suspendu" | "sorti";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrateur",
  infirmier: "Infirmier",
  medecin: "Médecin du travail",
  qhse: "Responsable QHSE",
  direction: "Direction",
};

export const GRAVITE_LABELS: Record<Gravite, string> = {
  benin: "Bénin",
  modere: "Modéré",
  severe: "Sévère",
  urgence: "Urgence",
};

export const GRAVITE_COULEURS: Record<Gravite, string> = {
  benin: "var(--color-chart-2)",
  modere: "var(--color-chart-4)",
  severe: "var(--color-chart-5)",
  urgence: "var(--color-destructive)",
};

export const STATUT_LABELS: Record<StatutTravailleur, string> = {
  actif: "Actif",
  suspendu: "Suspendu",
  sorti: "Sorti",
};

export const SUITES_DONNEES = [
  "Reprise de poste",
  "Repos 24h",
  "Repos 48h",
  "Orientation médecin du travail",
  "Évacuation hôpital",
  "Poste aménagé",
] as const;

export const SERVICES = [
  "Production",
  "Maintenance",
  "Logistique",
  "Administration",
  "HSE",
  "Qualité",
  "Chantier",
  "Laboratoire",
] as const;

export const FONCTIONS = [
  "Opérateur",
  "Technicien",
  "Chef d'équipe",
  "Cariste",
  "Soudeur",
  "Électricien",
  "Agent administratif",
  "Ingénieur",
] as const;

export interface Travailleur {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  date_naissance: string | null;
  sexe: string;
  service: string;
  fonction: string;
  date_embauche: string | null;
  statut: StatutTravailleur;
  telephone: string | null;
}

export interface DiagnosticRef {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
}

export interface Consultation {
  id: string;
  travailleur_id: string;
  diagnostic_id: string | null;
  date_consultation: string;
  motif: string;
  gravite: Gravite;
  tension: string | null;
  temperature: number | null;
  pouls: number | null;
  prescription: string | null;
  suite_donnee: string;
  jours_arret: number;
  observations: string | null;
  diagnostic?: DiagnosticRef | null;
  travailleur?: Pick<Travailleur, "id" | "nom" | "prenom" | "matricule" | "service"> | null;
}

export const dateFr = (value: string | null | undefined, avecHeure = false) => {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(avecHeure ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

export const moisFr = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });

export const peutSoigner = (role: AppRole | null) =>
  role === "admin" || role === "infirmier" || role === "medecin";
