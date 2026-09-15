
create type public.app_role as enum ('admin','infirmier','medecin','qhse','direction');
create type public.gravite_niveau as enum ('benin','modere','severe','urgence');
create type public.statut_travailleur as enum ('actif','suspendu','sorti');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nom_complet text not null default '',
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_select_auth" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.est_soignant(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','infirmier','medecin'))
$$;

create policy "roles_select_own" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare r public.app_role;
begin
  insert into public.profiles (id, nom_complet, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nom_complet',''), new.email);
  begin
    r := coalesce(new.raw_user_meta_data->>'role','infirmier')::public.app_role;
  exception when others then r := 'infirmier'::public.app_role;
  end;
  insert into public.user_roles (user_id, role) values (new.id, r) on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create table public.travailleurs (
  id uuid primary key default gen_random_uuid(),
  matricule text not null unique,
  nom text not null,
  prenom text not null,
  date_naissance date,
  sexe text not null default 'M',
  service text not null,
  fonction text not null,
  date_embauche date,
  statut public.statut_travailleur not null default 'actif',
  telephone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.travailleurs to authenticated;
grant all on public.travailleurs to service_role;
alter table public.travailleurs enable row level security;
create policy "trav_select" on public.travailleurs for select to authenticated using (true);
create policy "trav_insert" on public.travailleurs for insert to authenticated with check (public.est_soignant(auth.uid()));
create policy "trav_update" on public.travailleurs for update to authenticated using (public.est_soignant(auth.uid())) with check (public.est_soignant(auth.uid()));
create policy "trav_delete" on public.travailleurs for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.diagnostics_ref (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  libelle text not null,
  categorie text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.diagnostics_ref to authenticated;
grant all on public.diagnostics_ref to service_role;
alter table public.diagnostics_ref enable row level security;
create policy "diag_select" on public.diagnostics_ref for select to authenticated using (true);
create policy "diag_write" on public.diagnostics_ref for all to authenticated using (public.est_soignant(auth.uid())) with check (public.est_soignant(auth.uid()));

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  travailleur_id uuid not null references public.travailleurs(id) on delete cascade,
  diagnostic_id uuid references public.diagnostics_ref(id) on delete set null,
  soignant_id uuid references auth.users(id) on delete set null,
  date_consultation timestamptz not null default now(),
  motif text not null,
  gravite public.gravite_niveau not null default 'benin',
  tension text,
  temperature numeric(4,1),
  pouls integer,
  prescription text,
  suite_donnee text not null default 'Reprise de poste',
  jours_arret integer not null default 0,
  observations text,
  created_at timestamptz not null default now()
);
create index idx_consult_trav on public.consultations(travailleur_id);
create index idx_consult_date on public.consultations(date_consultation);
grant select, insert, update, delete on public.consultations to authenticated;
grant all on public.consultations to service_role;
alter table public.consultations enable row level security;
create policy "consult_select" on public.consultations for select to authenticated using (true);
create policy "consult_insert" on public.consultations for insert to authenticated with check (public.est_soignant(auth.uid()));
create policy "consult_update" on public.consultations for update to authenticated using (public.est_soignant(auth.uid())) with check (public.est_soignant(auth.uid()));
create policy "consult_delete" on public.consultations for delete to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.diagnostics_ref (code, libelle, categorie) values
('RESP-01','Rhinopharyngite aiguë','Respiratoire'),
('RESP-02','Bronchite aiguë','Respiratoire'),
('RESP-03','Crise d''asthme','Respiratoire'),
('DIG-01','Gastro-entérite aiguë','Digestif'),
('DIG-02','Gastrite / brûlures gastriques','Digestif'),
('DIG-03','Colique abdominale','Digestif'),
('TRAU-01','Plaie superficielle','Traumatique'),
('TRAU-02','Entorse de cheville','Traumatique'),
('TRAU-03','Contusion / hématome','Traumatique'),
('TRAU-04','Corps étranger oculaire','Traumatique'),
('TRAU-05','Brûlure thermique','Traumatique'),
('DERM-01','Dermatose de contact','Dermatologique'),
('DERM-02','Mycose cutanée','Dermatologique'),
('TMS-01','Lombalgie','TMS'),
('TMS-02','Cervicalgie','TMS'),
('TMS-03','Tendinite de l''épaule','TMS'),
('INF-01','Paludisme simple','Infectieux'),
('INF-02','Fièvre typhoïde','Infectieux'),
('INF-03','Infection urinaire','Infectieux'),
('CARD-01','Hypertension artérielle','Cardio-métabolique'),
('CARD-02','Palpitations','Cardio-métabolique'),
('GEN-01','Céphalées','Général'),
('GEN-02','Asthénie','Général'),
('GEN-03','Stress / anxiété','Psycho-social');

insert into public.travailleurs (matricule,nom,prenom,date_naissance,sexe,service,fonction,date_embauche,statut,telephone)
select
  'MAT-' || lpad(g::text,4,'0'),
  (array['Diop','Ndiaye','Fall','Sow','Ba','Sarr','Gueye','Faye','Mbaye','Diallo','Sy','Cissé','Kane','Thiam','Camara','Seck','Diouf','Toure','Niang','Badji'])[1+((g*7)%20)],
  (array['Amadou','Fatou','Moussa','Aïssatou','Ibrahima','Mariama','Cheikh','Awa','Ousmane','Khady','Modou','Ndeye','Babacar','Bineta','Lamine','Sokhna','Malick','Coumba','Saliou','Rama'])[1+((g*11)%20)],
  date '1972-01-01' + ((g*137)%9000),
  case when g%3=0 then 'F' else 'M' end,
  (array['Production','Maintenance','Logistique','Administration','HSE','Qualité','Chantier','Laboratoire'])[1+(g%8)],
  (array['Opérateur','Technicien','Chef d''équipe','Cariste','Soudeur','Électricien','Agent administratif','Ingénieur'])[1+((g*3)%8)],
  date '2012-01-01' + ((g*97)%4500),
  case when g%20=0 then 'sorti'::public.statut_travailleur when g%17=0 then 'suspendu'::public.statut_travailleur else 'actif'::public.statut_travailleur end,
  '77' || lpad(((g*123457)%10000000)::text,7,'0')
from generate_series(1,60) g;

insert into public.consultations (travailleur_id, diagnostic_id, date_consultation, motif, gravite, tension, temperature, pouls, prescription, suite_donnee, jours_arret, observations)
select
  t.id,
  d.id,
  now() - ((random()*360)::int || ' days')::interval - ((random()*10)::int || ' hours')::interval,
  'Consultation infirmière - ' || d.libelle,
  (case when s.g % 40 = 0 then 'urgence' when s.g % 11 = 0 then 'severe' when s.g % 4 = 0 then 'modere' else 'benin' end)::public.gravite_niveau,
  (110 + (random()*40)::int)::text || '/' || (70 + (random()*20)::int)::text,
  round((36.2 + random()*2.2)::numeric,1),
  62 + (random()*40)::int,
  (array['Paracétamol 1g x3/j','Ibuprofène 400mg x2/j','Antiseptique local + pansement','Repos et hydratation','Antispasmodique','Artéméther-luméfantrine'])[1+(s.g%6)],
  (array['Reprise de poste','Repos 24h','Orientation médecin du travail','Évacuation hôpital','Poste aménagé'])[1+(s.g%5)],
  case when s.g % 11 = 0 then 3 when s.g % 4 = 0 then 1 else 0 end,
  null
from (select g, 1+((g*13)%60) tn, 1+((g*7)%24) dn from generate_series(1,450) g) s
join (select id, row_number() over (order by matricule) rn from public.travailleurs) t on t.rn = s.tn
join (select id, libelle, row_number() over (order by code) rn from public.diagnostics_ref) d on d.rn = s.dn;
