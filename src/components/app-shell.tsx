import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BookMarked,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  Users,
  UserCog,
  PlusCircle,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS, peutSoigner } from "@/lib/ssmsi";

const NAV = [
  { to: "/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/travailleurs", label: "Travailleurs", icon: Users },
  { to: "/consultations", label: "Consultations", icon: Stethoscope },
  { to: "/referentiels", label: "Référentiels", icon: BookMarked },
  { to: "/utilisateurs", label: "Utilisateurs", icon: UserCog },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { nom, role } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deconnexion = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar px-3 py-5 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-sidebar-foreground">SSMSI</p>
            <p className="text-[11px] text-muted-foreground">Infirmerie d'entreprise</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}

          {peutSoigner(role) && (
            <Link to="/consultations/nouvelle" className="mt-4">
              <Button className="w-full justify-start gap-2" size="sm">
                <PlusCircle className="size-4" />
                Nouvelle consultation
              </Button>
            </Link>
          )}
        </nav>

        <div className="mt-6 border-t pt-4">
          <p className="truncate px-2 text-sm font-medium">{nom}</p>
          <p className="px-2 text-xs text-muted-foreground">
            {role ? ROLE_LABELS[role] : "Rôle non défini"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2 text-muted-foreground"
            onClick={deconnexion}
          >
            <LogOut className="size-4" />
            Se déconnecter
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b bg-background px-4 py-3 md:hidden">
          <span className="font-semibold">SSMSI</span>
          <Button variant="ghost" size="sm" onClick={deconnexion}>
            <LogOut className="size-4" />
          </Button>
        </header>
        <div className="flex gap-1 overflow-x-auto border-b bg-background px-2 py-2 md:hidden">
          {NAV.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs text-muted-foreground"
              activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
            >
              {label}
            </Link>
          ))}
        </div>
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  titre,
  description,
  action,
}: {
  titre: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titre}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
