"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TurnoEventInput {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  label: string;
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function TurnosCalendar({
  events,
  selectedDate,
  onSelectDate,
}: {
  events: TurnoEventInput[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  const [cursor, setCursor] = useState(() => new Date());

  const eventsByDate = useMemo(() => {
    const map = new Map<string, TurnoEventInput[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.time.localeCompare(b.time));
    return map;
  }, [events]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-ivory/5 rounded-lg transition-colors text-ivory/60"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <h3 className="font-heading text-xl text-ivory">
            {MONTH_NAMES[month]} {year}
          </h3>
          <button
            onClick={() => setCursor(new Date())}
            className="text-xs px-3 py-1.5 rounded-full border border-ivory/10 text-ivory/50 hover:text-champagne hover:border-champagne/30 transition-colors"
          >
            Hoy
          </button>
        </div>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-ivory/5 rounded-lg transition-colors text-ivory/60"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-ivory/30 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[88px]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = dateKey(year, month, day);
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          const isSelected = selectedDate === key;
          const dayEvents = eventsByDate.get(key) ?? [];

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate(key)}
              className={`min-h-[88px] rounded-lg p-1.5 border text-left transition-colors ${
                isSelected
                  ? "border-champagne bg-champagne/10"
                  : isToday
                    ? "border-champagne/30 bg-champagne/5"
                    : "border-ivory/5 hover:border-ivory/10"
              }`}
            >
              <span className={`text-xs font-medium ${isToday || isSelected ? "text-champagne" : "text-ivory/40"}`}>
                {day}
              </span>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    title={`${event.time} · ${event.label}`}
                    className="text-[10px] leading-tight px-1.5 py-1 rounded bg-champagne/15 text-champagne truncate"
                  >
                    {event.time} · {event.label}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-[10px] text-ivory/30 px-1">+{dayEvents.length - 2} más</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
