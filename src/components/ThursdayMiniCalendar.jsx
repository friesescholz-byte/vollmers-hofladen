import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function getNextThursdayISO() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = today.getDay(); // 0=So, 1=Mo, ..., 4=Do
  const diff = (4 - day + 7) % 7;
  const nextThu = new Date(today);
  nextThu.setDate(today.getDate() + diff);
  const y = nextThu.getFullYear();
  const m = String(nextThu.getMonth() + 1).padStart(2, '0');
  const d = String(nextThu.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatThursdayDE(isoStr) {
  if (!isoStr) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoStr.trim());
  if (!match) return isoStr;
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  return `Donnerstag, ${d}. ${MONTH_NAMES[m]} ${y}`;
}

export default function ThursdayMiniCalendar({ value, onChange, allowPast = false }) {
  const initialDate = useMemo(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m] = value.split('-').map(Number);
      return { year: y, month: m - 1 };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, []);

  const [viewYear, setViewYear] = useState(initialDate.year);
  const [viewMonth, setViewMonth] = useState(initialDate.month);

  const todayMidnight = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Tage des aktuellen Monats berechnen (Montag = Spalte 0)
  const calendarCells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // JS getDay(): 0=So, 1=Mo ... 6=Sa -> Umrechnen auf 0=Mo ... 6=So
    const startOffset = (firstOfMonth.getDay() + 6) % 7;

    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(viewYear, viewMonth, day);
      const isThursday = dateObj.getDay() === 4;
      const isSelectable = isThursday && (allowPast || dateObj.getTime() >= todayMidnight);
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        iso,
        isThursday,
        isSelectable,
      });
    }
    return cells;
  }, [viewYear, viewMonth, todayMidnight, allowPast]);

  return (
    <div className="p-4 rounded-2xl bg-canvas border border-ink-border space-y-3">
      {/* Kopfzeile mit Monatswechsel */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-forest" />
          <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-canvas-card border border-ink-border text-ink-muted hover:text-ink hover:bg-canvas-muted transition-colors"
            title="Vorheriger Monat"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-canvas-card border border-ink-border text-ink-muted hover:text-ink hover:bg-canvas-muted transition-colors"
            title="Nächster Monat"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Wochentage */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((wd, idx) => (
          <div
            key={wd}
            className={`text-[10px] font-bold uppercase tracking-wider py-1 ${
              idx === 3 ? 'text-forest bg-forest-tint/70 rounded-md' : 'text-ink-faint'
            }`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Kalendertage (Nur Donnerstage sind klickbar & hervorgehoben) */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarCells.map((cell, i) => {
          if (!cell) {
            return <div key={`empty_${i}`} className="h-8" />;
          }

          const isSelected = value === cell.iso;

          if (cell.isSelectable) {
            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => onChange(cell.iso)}
                className={`h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  isSelected
                    ? 'bg-forest text-white shadow-subtle ring-2 ring-forest/25 scale-105'
                    : 'bg-forest-tint text-forest border border-forest-border hover:bg-forest hover:text-white'
                }`}
                title={`Donnerstag, ${cell.day}. ${MONTH_NAMES[viewMonth]} auswählen`}
              >
                {cell.day}
              </button>
            );
          }

          return (
            <div
              key={cell.iso}
              className={`h-8 flex items-center justify-center text-xs select-none ${
                cell.isThursday ? 'text-ink-faint line-through opacity-50' : 'text-ink-faint/45'
              }`}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      {/* Ausgewählter Donnerstag Anzeige */}
      <div className="pt-2 border-t border-ink-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-1">
        <span className="text-ink-muted">Gewählter Liefertag:</span>
        <span className="font-semibold text-forest truncate">
          {value ? formatThursdayDE(value) : 'Bitte Donnerstag wählen'}
        </span>
      </div>
    </div>
  );
}
