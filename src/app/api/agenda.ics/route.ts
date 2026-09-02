import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildIcsCalendar, type IcsEvent } from "@/lib/ics";

interface LeadRow {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  appointment_date: string;
  appointment_time: string | null;
  properties: { title: { es?: string } | null; address: string | null } | { title: { es?: string } | null; address: string | null }[] | null;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!process.env.AGENDA_ICS_TOKEN || token !== process.env.AGENDA_ICS_TOKEN) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from("leads")
    .select("id, name, phone, email, appointment_date, appointment_time, properties(title, address)")
    .eq("source", "turno")
    .not("appointment_date", "is", null);

  if (error) {
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }

  const events: IcsEvent[] = ((data ?? []) as LeadRow[])
    .filter((lead) => lead.appointment_date && lead.appointment_time)
    .map((lead) => {
      const property = Array.isArray(lead.properties) ? lead.properties[0] : lead.properties;
      const propertyTitle = property?.title?.es;
      const start = new Date(`${lead.appointment_date}T${lead.appointment_time}:00-03:00`);
      const end = new Date(start.getTime() + 30 * 60 * 1000);

      return {
        uid: `turno-${lead.id}@fsinmobiliaria`,
        start,
        end,
        summary: `Turno: ${lead.name}${propertyTitle ? ` — ${propertyTitle}` : ""}`,
        description: `Tel: ${lead.phone ?? "-"}\nEmail: ${lead.email}`,
        location: property?.address ?? undefined,
      };
    });

  const ics = buildIcsCalendar(events, "Turnos - FS Inmobiliaria");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="agenda-turnos.ics"',
    },
  });
}
