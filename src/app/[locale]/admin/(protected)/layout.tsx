import { getCurrentAgent } from "@/lib/dal";
import { logoutAction } from "@/lib/actions/auth";
import { Link } from "@/i18n/navigation";
import { LayoutDashboard, Building2, Users, CalendarDays, BarChart3, LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const agent = await getCurrentAgent(locale);
  const boundLogout = logoutAction.bind(null, locale);

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/propiedades", label: "Propiedades", icon: Building2 },
    { href: "/admin/leads", label: "Leads", icon: Users },
    { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
    { href: "/admin/analytics", label: "Analítica", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-obsidian flex">
      <aside className="w-64 shrink-0 border-r border-ivory/10 bg-obsidian-light hidden md:flex flex-col">
        <div className="p-6 border-b border-ivory/10">
          <p className="font-heading text-lg text-gradient-gold">FS Inmobiliaria</p>
          <p className="text-ivory/40 text-xs mt-1">Panel de administración</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-ivory/70 hover:bg-ivory/5 hover:text-ivory transition-colors text-sm"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-ivory/10">
          <p className="text-ivory/40 text-xs mb-3 px-1">
            {agent.full_name ?? "Agente"} · {agent.role}
          </p>
          <form action={boundLogout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-ivory/50 hover:bg-ivory/5 hover:text-ivory transition-colors text-sm"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
