"use client";

import { useMemo, useState } from "react";
import { Clock, Phone, Mail, Home, X } from "lucide-react";
import TurnosCalendar, { type TurnoEventInput } from "./TurnosCalendar";

export interface AgendaTurno {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  date: string;
  time: string | null;
  status: string;
  propertyTitle: string | null;
}

function formatDateLong(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AgendaBoard({ turnos, events }: { turnos: AgendaTurno[]; events: TurnoEventInput[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTurno, setSelectedTurno] = useState<AgendaTurno | null>(null);

  const turnosByDate = useMemo(() => {
    const map = new Map<string, AgendaTurno[]>();
    for (const turno of turnos) {
      const list = map.get(turno.date) ?? [];
      list.push(turno);
      map.set(turno.date, list);
    }
    return map;
  }, [turnos]);

  const dayTurnos = selectedDate ? (turnosByDate.get(selectedDate) ?? []) : [];

  return (
    <>
      <TurnosCalendar events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {selectedDate && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg text-champagne capitalize">{formatDateLong(selectedDate)}</h2>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-ivory/40 hover:text-champagne transition-colors"
            >
              Cerrar
            </button>
          </div>

          {dayTurnos.length === 0 ? (
            <div className="glass-card rounded-2xl p-6">
              <p className="text-ivory/40 text-sm">No hay turnos agendados este día.</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 space-y-1">
              {dayTurnos.map((turno) => (
                <button
                  key={turno.id}
                  type="button"
                  onClick={() => setSelectedTurno(turno)}
                  className="w-full flex flex-wrap items-center gap-x-6 gap-y-1 py-3 px-2 -mx-2 border-b border-ivory/5 last:border-0 text-sm text-left rounded-lg hover:bg-ivory/5 transition-colors"
                >
                  <span className="flex items-center gap-1.5 text-champagne font-medium w-16">
                    <Clock size={14} />
                    {turno.time ?? "-"}
                  </span>
                  <span className="text-ivory">{turno.name}</span>
                  {turno.propertyTitle && (
                    <span className="flex items-center gap-1.5 text-ivory/50">
                      <Home size={14} />
                      {turno.propertyTitle}
                    </span>
                  )}
                  <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-champagne/10 text-champagne">
                    {turno.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTurno && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedTurno(null)}
        >
          <div
            className="glass-card rounded-2xl p-8 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTurno(null)}
              className="absolute top-4 right-4 text-ivory/40 hover:text-champagne transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="font-heading text-2xl text-ivory mb-1 pr-8">{selectedTurno.name}</h3>
            <p className="text-ivory/40 text-sm mb-6 capitalize">{formatDateLong(selectedTurno.date)}</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-ivory/70">
                <Clock size={16} className="text-champagne shrink-0" />
                {selectedTurno.time ?? "Sin horario"}
              </div>
              {selectedTurno.propertyTitle && (
                <div className="flex items-center gap-2 text-ivory/70">
                  <Home size={16} className="text-champagne shrink-0" />
                  {selectedTurno.propertyTitle}
                </div>
              )}
              <div className="flex items-center gap-2 text-ivory/70">
                <Phone size={16} className="text-champagne shrink-0" />
                {selectedTurno.phone ?? "-"}
              </div>
              <div className="flex items-center gap-2 text-ivory/70">
                <Mail size={16} className="text-champagne shrink-0" />
                {selectedTurno.email}
              </div>
              <div className="pt-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-champagne/10 text-champagne">
                  {selectedTurno.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
