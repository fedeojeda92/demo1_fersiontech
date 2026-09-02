import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/tenant";
import { getCurrentAgent } from "@/lib/dal";
import { disconnectGoogleCalendarAction } from "@/lib/actions/auth";
import { isGoogleCalendarConfigured } from "@/lib/googleCalendar";
import CopyIcsLink from "@/components/admin/CopyIcsLink";
import AgendaBoard, { type AgendaTurno } from "@/components/admin/AgendaBoard";
import { type TurnoEventInput } from "@/components/admin/TurnosCalendar";
import { CalendarCheck2, CalendarX2 } from "lucide-react";

interface TurnoRow {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  appointment_date: string;
  appointment_time: string | null;
  status: string;
  properties: { title: { es?: string } } | { title: { es?: string } }[] | null;
}

export default async function AdminAgendaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ google?: string }>;
}) {
  const { locale } = await params;
  const { google: googleStatus } = await searchParams;
  const agent = await getCurrentAgent(locale);
  const boundDisconnect = disconnectGoogleCalendarAction.bind(null, locale);

  const supabase = await createClient();
  const tenantId = await getTenantId();

  const { data } = await supabase
    .from("leads")
    .select("id, name, phone, email, appointment_date, appointment_time, status, properties(title)")
    .eq("tenant_id", tenantId)
    .eq("source", "turno")
    .not("appointment_date", "is", null)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  const turnos = (data ?? []) as TurnoRow[];

  const agendaTurnos: AgendaTurno[] = turnos.map((t) => {
    const property = Array.isArray(t.properties) ? t.properties[0] : t.properties;
    return {
      id: t.id,
      name: t.name,
      phone: t.phone,
      email: t.email,
      date: t.appointment_date,
      time: t.appointment_time,
      status: t.status,
      propertyTitle: property?.title?.es ?? null,
    };
  });

  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const icsUrl = `${protocol}://${host}/api/agenda.ics?token=${process.env.AGENDA_ICS_TOKEN ?? ""}`;

  const calendarEvents: TurnoEventInput[] = turnos
    .filter((t): t is TurnoRow & { appointment_time: string } => Boolean(t.appointment_time))
    .map((t) => {
      const property = Array.isArray(t.properties) ? t.properties[0] : t.properties;
      return {
        id: t.id,
        date: t.appointment_date,
        time: t.appointment_time,
        label: property?.title?.es ? `${t.name} — ${property.title.es}` : t.name,
      };
    });

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl text-ivory mb-2">Agenda</h1>
      <p className="text-ivory/40 text-sm mb-6">Turnos agendados por los interesados, ordenados por fecha.</p>

      {googleStatus === "connected" && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          Google Calendar conectado correctamente.
        </div>
      )}
      {googleStatus === "error" && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-ember/10 border border-ember/20 text-ember text-sm">
          No pudimos conectar Google Calendar. Probá de nuevo.
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 mb-6">
        <p className="text-sm text-ivory mb-2">Sincronización automática con Google Calendar</p>
        {!isGoogleCalendarConfigured() ? (
          <p className="text-xs text-ivory/40">
            Todavía no está configurado en el servidor (faltan <code>GOOGLE_CLIENT_ID</code> /{" "}
            <code>GOOGLE_CLIENT_SECRET</code> en <code>.env.local</code>). Mientras tanto, usá el feed .ics de abajo.
          </p>
        ) : agent.google_email ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ivory/40 flex items-center gap-2">
              <CalendarCheck2 size={16} className="text-emerald-400 shrink-0" />
              Conectado como <span className="text-ivory">{agent.google_email}</span> — los turnos nuevos crean el
              evento automáticamente con notificación push.
            </p>
            <form action={boundDisconnect}>
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-2 bg-ivory/5 text-ivory/60 rounded-lg text-xs hover:bg-ivory/10 hover:text-ivory transition-colors shrink-0"
              >
                <CalendarX2 size={14} />
                Desconectar
              </button>
            </form>
          </div>
        ) : (
          <div>
            <p className="text-xs text-ivory/40 mb-3">
              Conectá tu cuenta de Google para que cada turno agendado cree el evento solo en tu calendario, con
              notificación push al toque (en vez de esperar la sincronización del feed .ics de abajo).
            </p>
            <a
              href={`/api/auth/google/connect?locale=${locale}`}
              className="inline-flex items-center gap-2 px-3 py-2 bg-champagne/10 text-champagne rounded-lg text-xs hover:bg-champagne/20 transition-colors"
            >
              <CalendarCheck2 size={14} />
              Conectar Google Calendar
            </a>
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6 mb-8">
        <p className="text-sm text-ivory mb-2">Ver esta agenda en tu celular/computadora</p>
        <p className="text-xs text-ivory/40 mb-3">
          Copiá este enlace y agregalo como calendario &ldquo;por URL&rdquo; en Google Calendar, Apple Calendar u Outlook.
          Los turnos nuevos van a aparecer solos (con un delay de sincronización de horas, no es instantáneo).
        </p>
        <CopyIcsLink url={icsUrl} />
      </div>

      <AgendaBoard turnos={agendaTurnos} events={calendarEvents} />
    </div>
  );
}
