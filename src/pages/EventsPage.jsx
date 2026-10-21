import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { PLACEHOLDER_EVENT_IMAGE } from '../data/events';

const MONTHS_SHORT = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];
const WEEKDAYS_DE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

function parseEventDate(dateStr) {
  if (!dateStr) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (match) {
    const year = Number(match[1]);
    const monthIdx = Number(match[2]) - 1;
    const day = Number(match[3]);
    const d = new Date(year, monthIdx, day);
    return {
      day: String(day).padStart(2, '0'),
      monthShort: MONTHS_SHORT[monthIdx] || '',
      year: String(year),
      weekday: WEEKDAYS_DE[d.getDay()] || '',
      formattedFull: `${WEEKDAYS_DE[d.getDay()]}, ${day}. ${
        ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][monthIdx]
      } ${year}`,
      sortKey: d.getTime(),
    };
  }
  return {
    day: '•',
    monthShort: 'TERMIN',
    year: '',
    weekday: '',
    formattedFull: dateStr,
    sortKey: Number.MAX_SAFE_INTEGER,
  };
}

export default function EventsPage({ onNavigate }) {
  const { events } = useProducts();
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sortedEvents = [...(events || [])].sort((a, b) => {
    const da = parseEventDate(a.date)?.sortKey || 0;
    const db = parseEventDate(b.date)?.sortKey || 0;
    return da - db;
  });

  return (
    <div className="py-10 sm:py-16 md:py-20 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-10 sm:mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-forest">
            <Calendar className="w-4 h-4 stroke-[1.75]" />
            <span>Märkte & Veranstaltungen</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-ink mt-2 sm:mt-3 leading-[1.12]">
            Aktuelle <span className="italic font-normal text-forest">Termine & Märkte.</span>
          </h1>
          <p className="text-ink-muted text-base md:text-lg mt-3 sm:mt-4 leading-relaxed">
            Hier findest du alle kommenden Märkte, Hof-Aktionen und Veranstaltungen in der Region, auf denen wir mit unserem Stand und unseren Hof-Spezialitäten vertreten sind.
          </p>
        </div>

        {/* Moderner Kalender / Termin-Liste */}
        {sortedEvents.length === 0 ? (
          <div className="p-10 sm:p-14 rounded-3xl bg-canvas-card border border-ink-border text-center space-y-3">
            <Calendar className="w-10 h-10 text-forest mx-auto stroke-[1.5]" />
            <h3 className="font-serif text-2xl text-ink">Aktuell sind keine neuen Markttermine eingetragen</h3>
            <p className="text-sm text-ink-muted max-w-md mx-auto">
              Unser 24/7 SB-Hofladen in der Lindenallee 24 in Machtsum hat natürlich trotzdem rund um die Uhr für dich geöffnet!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedEvents.map((event) => {
              const dateInfo = parseEventDate(event.date);
              const isExpanded = !!expandedIds[event.id];
              const hasCustomImage = Boolean(event.image && event.image.trim());

              return (
                <div
                  key={event.id}
                  className="rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border shadow-subtle hover:shadow-elevated transition-all overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                    
                    {/* 1. Kalenderblatt (Datum-Spalte) */}
                    <div className="lg:col-span-2 bg-forest text-white p-5 sm:p-6 flex lg:flex-col items-center justify-between lg:justify-center text-center gap-3 border-b lg:border-b-0 lg:border-r border-white/10">
                      <div className="flex lg:flex-col items-baseline lg:items-center gap-2 lg:gap-0">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                          {dateInfo?.monthShort}
                        </span>
                        <span className="font-serif text-3xl sm:text-5xl font-bold leading-none text-white lg:my-1">
                          {dateInfo?.day}
                        </span>
                        {dateInfo?.year && (
                          <span className="text-xs text-white/70 font-medium">
                            {dateInfo.year}
                          </span>
                        )}
                      </div>
                      {dateInfo?.weekday && (
                        <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-medium text-emerald-200">
                          {dateInfo.weekday}
                        </span>
                      )}
                    </div>

                    {/* 2. Bild / Vollmer's Logo Platzhalter */}
                    <div className="lg:col-span-3 aspect-[16/9] lg:aspect-auto bg-[#F5F2EA] relative overflow-hidden flex items-center justify-center border-b lg:border-b-0 lg:border-r border-ink-border/70 min-h-[190px]">
                      {hasCustomImage ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#FBF9F5] to-[#EFECE3]">
                          <img
                            src={PLACEHOLDER_EVENT_IMAGE}
                            alt="Vollmer's Hofladen Logo"
                            className="max-h-28 w-auto object-contain drop-shadow-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* 3. Termin-Infos & Aufklappbare Beschreibung */}
                    <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-forest uppercase tracking-wider">
                            {dateInfo?.formattedFull}
                          </span>
                          {event.badge && (
                            <span className="px-2.5 py-0.5 rounded-full bg-forest-tint border border-forest-border text-forest text-[11px] font-semibold">
                              {event.badge}
                            </span>
                          )}
                        </div>

                        <h2 className="font-serif text-2xl sm:text-3xl text-ink leading-snug">
                          {event.title}
                        </h2>

                        {/* Zeit & Ort */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-1 text-xs sm:text-sm text-ink-muted">
                          {event.time && (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-forest-tint text-forest flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4 stroke-[1.75]" />
                              </div>
                              <span className="font-medium text-ink">{event.time}</span>
                            </div>
                          )}

                          {event.location && (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-forest-tint text-forest flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 stroke-[1.75]" />
                              </div>
                              <span className="font-medium text-ink">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Aufklappbare Beschreibung */}
                      {event.description && (
                        <div className="pt-3 border-t border-ink-border/70">
                          <button
                            type="button"
                            onClick={() => toggleExpand(event.id)}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-forest hover:text-forest-hover transition-colors focus:outline-none group"
                          >
                            <span>{isExpanded ? 'Beschreibung einklappen' : 'Kurze Beschreibung aufklappen'}</span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : 'group-hover:translate-y-0.5'
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="mt-3 p-4 rounded-2xl bg-canvas border border-ink-border text-xs sm:text-sm text-ink-muted leading-relaxed animate-in fade-in duration-200">
                              {event.description}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hinweis unten: 24/7 Hofladen immer offen */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-forest block">
              Unabhängig von Marktterminen
            </span>
            <h3 className="font-serif text-2xl text-ink">
              Unser SB-Hofladen in Machtsum hat 24/7 für dich geöffnet.
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted">
              Lindenallee 24, 31177 Harsum (OT Machtsum) — Täglich frische Freilandeier, Nudeln, Wurst & Honig.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('kontakt')}
              className="px-5 py-3 rounded-xl bg-forest text-white hover:bg-forest-hover text-xs font-semibold transition-colors flex items-center gap-2 shrink-0"
            >
              <span>Anfahrt & Standort</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
