# SSMSI — Plateforme de suivi médico-professionnel

Application web en français pour l'infirmerie d'entreprise : suivi des travailleurs, consultations infirmières, dossiers individuels et pilotage sanitaire.

## Ce qui sera construit

### 1. Comptes et rôles
- Création de compte / connexion par e-mail et mot de passe.
- Cinq rôles : Administrateur, Infirmier, Médecin du travail, Responsable QHSE, Direction.
- Le rôle est choisi à l'inscription puis validé côté serveur (stocké séparément du profil pour éviter toute élévation de privilèges).
- Droits : Infirmier et Médecin saisissent les consultations ; QHSE et Direction consultent les statistiques sans accéder au détail médical nominatif ; Administrateur gère les utilisateurs et les référentiels.

### 2. Travailleurs (CRUD)
- Liste avec recherche (nom, matricule), filtres par service, fonction, statut.
- Fiche : matricule unique, nom/prénom, date de naissance, sexe, service, fonction, date d'embauche, statut (actif, suspendu, sorti), contact.
- Création, modification, désactivation.

### 3. Consultation infirmière rapide
- Formulaire en une page : travailleur (recherche par matricule), motif, diagnostic issu d'un référentiel catégorisé (respiratoire, digestif, traumatique, dermatologique, TMS, infectieux…), gravité (bénin / modéré / sévère / urgence), constantes simples (tension, température, pouls), prescription, suite donnée (reprise, repos, évacuation, orientation médecin du travail), durée d'arrêt éventuelle.
- Enregistrement rapide et retour immédiat à la liste du jour.

### 4. Dossier individuel du travailleur
- En-tête identité + indicateurs (nombre de consultations, dernière visite, jours d'arrêt cumulés).
- Frise chronologique des consultations, avec détail dépliable et filtres par période et catégorie.

### 5. Tableau de bord
- Cartes d'indicateurs : consultations du jour / du mois, urgences, arrêts en cours, travailleurs actifs.
- Graphiques interactifs : tendance des consultations dans le temps, top pathologies, répartition par service, répartition par gravité.
- Alertes : consultations répétées d'un même travailleur, pic de pathologies sur un service, urgences récentes.

### 6. Données de test
Jeu de démonstration complet inséré dès la mise en place : ~60 travailleurs répartis sur plusieurs services, référentiel de diagnostics, et plusieurs centaines de consultations réparties sur les 12 derniers mois pour que les graphiques et alertes soient parlants dès l'ouverture.

## Design
Interface sobre et professionnelle, tout en français : fond clair, accent bleu-sarcelle médical, typographie nette, tableaux denses lisibles, navigation latérale (Tableau de bord, Travailleurs, Consultations, Référentiels, Utilisateurs).

## Détails techniques
- Lovable Cloud activé : base de données, authentification, sécurité par ligne.
- Tables : `profiles`, `user_roles` (+ énumération de rôles et fonction `has_role`), `travailleurs`, `diagnostics_ref`, `consultations`.
- Politiques d'accès par rôle ; données médicales nominatives réservées au personnel soignant et à l'administrateur ; agrégats accessibles à QHSE/Direction via vues ou fonctions serveur.
- Routes : `/` (accueil public + connexion), `/auth`, puis zone protégée `/tableau-de-bord`, `/travailleurs`, `/travailleurs/$id`, `/consultations`, `/consultations/nouvelle`, `/referentiels`, `/utilisateurs`.
- Graphiques avec Recharts ; données seedées par migration SQL.
