import React from 'react';
import { MapPin, Phone, Mail, Clock, ShoppingBag, ArrowUpRight } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import { MEDIA } from '../data/media';

export default function Footer({ onNavigate, onOpenLegal }) {
  return (
    <footer className="bg-[#182019] text-white border-t border-[#232F25] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          
          {/* Spalte 1: Brand & Portrait */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={MEDIA.favicon}
                alt="Vollmers Hofladen Hahn-Icon"
                className="w-12 h-12 rounded-full bg-white object-contain border border-white/20 p-1.5"
              />
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight block leading-tight">
                  Vollmer’s Hofladen
                </span>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold block">
                  Machtsumer Freilandeier & Weidehaltung
                </span>
              </div>
            </div>

            <p className="text-white/70 text-sm leading-relaxed max-w-sm pt-2">
              Aus Überzeugung für Tierwohl und Qualität: Frische Freilandeier aus dem Hühnermobil, Duroc-Weideschwein, Weidehähnchen und erlesene Spezialitäten aus der Region in unserem 24/7 Selbstbedienungsladen.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://www.instagram.com/vollmers_hofladen/"
                target="_blank"
                rel="noreferrer noopener"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                title="Instagram @vollmers_hofladen"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://vollmers-hofladen.friedhold.de"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Friedhold Vorbestellung</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            {/* Google Bewertung Card */}
            <div className="pt-3">
              <a
                href="https://search.google.com/local/writereview?placeid=ChIJFzdPXqCpukcRi1fq6TYofgQ"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/40 transition-all group w-full max-w-sm"
              >
                <div className="flex items-center text-amber-400 text-sm tracking-wide">
                  ★★★★★
                </div>
                <div className="text-left flex-1">
                  <span className="text-xs font-semibold text-white block">Google Bewertung</span>
                  <span className="text-[11px] text-white/60 block">Erfahrung bei Vollmer’s teilen</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </a>
            </div>
          </div>

          {/* Spalte 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Startseite
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('produkte')}
                  className="hover:text-white transition-colors"
                >
                  Sortiment & Hofladen
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('eier-donnerstag')}
                  className="hover:text-white transition-colors"
                >
                  Eier-Donnerstag
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('termine')}
                  className="hover:text-white transition-colors"
                >
                  Termine & Märkte
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('freilandhaltung')}
                  className="hover:text-white transition-colors"
                >
                  Freilandhaltung
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ueber-uns')}
                  className="hover:text-white transition-colors"
                >
                  Über uns & Historie
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('kontakt')}
                  className="hover:text-white transition-colors"
                >
                  Kontakt & Anfahrt
                </button>
              </li>
            </ul>
          </div>

          {/* Spalte 3: Hofladen 24/7 Öffnungszeiten */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Öffnungszeiten
            </h4>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <Clock className="w-4 h-4" />
                <span>24 Stunden geöffnet</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Unser Selbstbedienungs-Hofladen in Machtsum steht dir an <strong>7 Tagen die Woche, rund um die Uhr</strong> zur Verfügung.
              </p>
            </div>
          </div>

          {/* Spalte 4: Kontakt & Standorte */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Standorte & Kontakt
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70 leading-relaxed">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Felix Vollmer Landwirtschaft<br />
                  Lindenallee 24<br />
                  31177 Harsum (OT Machtsum)
                </span>
              </li>
              <li className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:017621006452" className="hover:text-white transition-colors">
                  0176 21006452
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:info@vollmers-hofladen.de" className="hover:text-white transition-colors">
                  info@vollmers-hofladen.de
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/50 gap-4 text-center md:text-left">
          <p>© {new Date().getFullYear()} Vollmer’s Hofladen. Alle Rechte vorbehalten.</p>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-5 text-[11px] sm:text-xs">
            <button
              onClick={() => onOpenLegal('impressum')}
              className="hover:text-white transition-colors"
            >
              Impressum
            </button>
            <span className="text-white/20">•</span>
            <button
              onClick={() => onOpenLegal('datenschutz')}
              className="hover:text-white transition-colors"
            >
              Datenschutz
            </button>
            <span className="text-white/20">•</span>
            <button
              onClick={() => onOpenLegal('barrierefreiheit')}
              className="hover:text-white transition-colors"
            >
              Barrierefreiheitserklärung
            </button>
            <span className="text-white/20">•</span>
            <a
              href="https://scholz-friese-webdesign.de/"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-white transition-colors text-white/40 hover:underline"
            >
              by Scholz & Friese Webdesign
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
