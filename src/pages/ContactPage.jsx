import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Clock, ShoppingBag, ExternalLink, Send, CheckCircle2, Navigation, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { MEDIA } from '../data/media';

const TURNSTILE_SITEKEY = "0x4AAAAAAFYX_fBuE8TLzVjn";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Allgemeine Anfrage',
    message: ''
  });

  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Turnstile Widget initialisieren (mit Polling & StrictMode-Schutz nach contact_form_workflow_rules.md)
  useEffect(() => {
    let interval;

    const renderWidget = () => {
      if (turnstileRef.current && window.turnstile && !widgetIdRef.current) {
        try {
          // 1. Container zwingend leeren, um StrictMode-Doppelrender-Fehler zu vermeiden!
          turnstileRef.current.innerHTML = "";

          // 2. Widget rendern
          widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
            sitekey: TURNSTILE_SITEKEY,
            callback: (token) => {
              setTurnstileToken(token);
              setErrorMessage("");
            },
            "expired-callback": () => setTurnstileToken(""),
            "error-callback": (errorCode) => {
              console.warn("Turnstile Widget-Status:", errorCode);
            },
            theme: "light",
          });
          if (interval) clearInterval(interval);
        } catch (e) {
          console.error("Turnstile render error:", e);
        }
      }
    };

    renderWidget();

    // Falls API noch asynchron lädt, kurz pollen
    if (!widgetIdRef.current) {
      interval = setInterval(() => {
        if (window.turnstile) {
          renderWidget();
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch (e) {}
        widgetIdRef.current = null;
      }
    };
  }, [submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    if (!turnstileToken) {
      setErrorMessage("Bitte bestätige kurz den Spam-Schutz (Turnstile).");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          turnstileToken
        })
      });

      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.warn('Nicht-JSON Antwort beim Mailversand:', text.slice(0, 100));
      }

      if (res.ok && data?.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Allgemeine Anfrage',
          message: ''
        });
        setTurnstileToken("");
      } else {
        setErrorMessage(data?.error || `Fehler beim Versenden deiner Nachricht (HTTP ${res.status}). Bitte versuche es erneut.`);
        if (widgetIdRef.current && window.turnstile) {
          try { window.turnstile.reset(widgetIdRef.current); } catch (e) {}
        }
        setTurnstileToken("");
      }
    } catch (err) {
      setErrorMessage('Verbindungsfehler beim Absenden der Nachricht. Bitte versuche es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 sm:py-16 md:py-20 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-10 sm:mb-14 md:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-forest">
            Anfahrt & Kontakt
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-ink mt-2 sm:mt-3 leading-[1.15]">
            Besuche uns <span className="whitespace-nowrap">in Machtsum.</span>
          </h1>
          <p className="text-ink-muted text-base md:text-lg mt-3 sm:mt-4 leading-relaxed">
            Unser 24/7 Selbstbedienungs-Hofladen in der Lindenallee 24 steht dir rund um die Uhr offen. Komm einfach vorbei, parke bequem auf dem Hof und nimm frische Qualität aus der Börde mit nach Hause.
          </p>
        </div>

        {/* 2-Spalten Grid: Kontaktdaten & Anfahrt links, Kontaktformular rechts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Linke Seite: Öffnungszeiten & Kontaktdaten */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            
            {/* 24/7 Öffnungszeiten Card */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-forest text-white shadow-elevated space-y-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-300 font-semibold block">
                  Öffnungszeiten Hofladen
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white">
                Rund um die Uhr an 7 Tagen die Woche.
              </h3>

              <p className="text-white/80 text-sm leading-relaxed">
                Unser Selbstbedienungsladen kennt keine Ladenschlusszeiten. Ob früh morgens um 6:00 Uhr vor der Arbeit oder sonntags um 20:00 Uhr – du bist jederzeit herzlich willkommen.
              </p>

              <div className="pt-4 border-t border-white/15 grid grid-cols-2 gap-4 text-xs text-white/80">
                <div>
                  <strong className="block text-white text-sm">Montag bis Sonntag</strong>
                  <span>0:00 – 24:00 Uhr durchgehend</span>
                </div>
                <div>
                  <strong className="block text-white text-sm">Selbstbedienung</strong>
                  <span>365 Tage im Jahr geöffnet</span>
                </div>
              </div>
            </div>

            {/* Standort & Direktkontakt */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border shadow-subtle space-y-5 sm:space-y-6">
              <h3 className="font-serif text-2xl text-ink">
                Standort & Adressdaten
              </h3>

              <div className="space-y-4 text-sm text-ink-muted">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-forest-tint text-forest shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-ink block font-semibold">Vollmer’s Hofladen</strong>
                    <span>Lindenallee 24</span><br />
                    <span>31177 Harsum (Ortsteil Machtsum)</span><br />
                    <span className="text-xs text-ink-faint">Kostenlose Parkplätze direkt auf dem Hof vorhanden</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 pt-2 border-t border-ink-border">
                  <div className="p-2.5 rounded-xl bg-forest-tint text-forest shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-ink-faint block">Telefon / Mobil:</span>
                    <a href="tel:017621006452" className="text-ink font-semibold hover:text-forest transition-colors">
                      0176 21006452
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 pt-2 border-t border-ink-border">
                  <div className="p-2.5 rounded-xl bg-forest-tint text-forest shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-ink-faint block">E-Mail für Anfragen:</span>
                    <a href="mailto:info@vollmers-hofladen.de" className="text-ink font-semibold hover:text-forest transition-colors">
                      info@vollmers-hofladen.de
                    </a>
                  </div>
                </div>
              </div>

              {/* Google Maps Route & Bewertung */}
              <div className="pt-2 space-y-2.5">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Lindenallee+24+31177+Harsum"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-canvas-muted hover:bg-canvas-subtle border border-ink-border text-ink font-medium text-sm transition-colors"
                >
                  <Navigation className="w-4 h-4 text-forest" />
                  <span>Route mit Google Maps planen</span>
                  <ExternalLink className="w-3.5 h-3.5 text-ink-faint ml-1" />
                </a>

                <a
                  href="https://search.google.com/local/writereview?placeid=ChIJFzdPXqCpukcRi1fq6TYofgQ"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-canvas-card hover:bg-canvas-muted border border-ink-border text-xs font-semibold text-ink transition-colors group"
                >
                  <span className="text-amber-500">★★★★★</span>
                  <span>Google-Bewertung für Vollmer’s schreiben</span>
                  <ExternalLink className="w-3.5 h-3.5 text-ink-muted group-hover:text-forest transition-colors" />
                </a>
              </div>
            </div>

          </div>

          {/* Rechte Seite: Nachricht schreiben */}
          <div className="lg:col-span-6 p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border shadow-subtle">
            <span className="text-xs font-semibold uppercase tracking-widest text-forest block mb-2">
              Schreib uns eine Nachricht
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-ink mb-5 sm:mb-6">
              Hast du Fragen zu unseren Produkten oder Vorbestellungen?
            </h3>

            {submitted ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-forest-tint border border-forest-border text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-forest mx-auto" />
                <h4 className="font-serif text-2xl text-ink">
                  Vielen Dank für deine Nachricht!
                </h4>
                <p className="text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
                  Deine Anfrage wurde erfolgreich übermittelt. Wir melden uns zeitnah bei dir zurück.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors shadow-subtle active:scale-[0.99]"
                >
                  Weitere Nachricht senden
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Dein Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Vor- und Nachname"
                    className="w-full px-4 py-3 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm placeholder:text-ink-faint focus:outline-none focus:border-forest"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                      E-Mail-Adresse *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="deine@mail.de"
                      className="w-full px-4 py-3 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm placeholder:text-ink-faint focus:outline-none focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                      Telefonnummer (optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[0-9+\s()/-]*$/.test(val)) {
                          setFormData({ ...formData, phone: val });
                        }
                      }}
                      placeholder="0176 ..."
                      className="w-full px-4 py-3 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm placeholder:text-ink-faint focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Betreff
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm focus:outline-none focus:border-forest"
                  >
                    <option value="Allgemeine Anfrage">Allgemeine Frage</option>
                    <option value="Vorbestellung Fleisch/Geflügel">Frage zur Vorbestellung (Duroc / Geflügel)</option>
                    <option value="Hofladen Sortiment">Frage zum Hofladen-Sortiment</option>
                    <option value="Regionaler Partner">Partnerschaft / Belieferung</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Deine Nachricht *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Wie können wir dir weiterhelfen?"
                    className="w-full px-4 py-3 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm placeholder:text-ink-faint focus:outline-none focus:border-forest resize-none"
                  ></textarea>
                </div>

                {/* Cloudflare Turnstile Spam-Schutz */}
                <div className="pt-2 pb-1">
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                    <span>Spam-Schutz</span>
                  </label>
                  <div className="overflow-x-auto max-w-full flex justify-start">
                    <div ref={turnstileRef} className="min-h-[65px] flex items-center"></div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !turnstileToken}
                    className="w-full py-4 rounded-xl bg-forest text-white font-medium text-sm hover:bg-forest-hover transition-colors shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Wird sicher gesendet...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Nachricht absenden</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-ink-faint text-center block mt-2">
                    Deine Angaben werden vertraulich behandelt und direkt an unser Hof-Team weitergeleitet.
                  </span>
                </div>
              </form>
            )}

          </div>

        </div>

        {/* Verkaufsstelle & Google Maps Karte */}
        <div className="mt-10 sm:mt-14 rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border shadow-elevated overflow-hidden">
          {/* Karten-Kopfbereich */}
          <div className="p-5 sm:p-8 border-b border-ink-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-canvas-card">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-forest-tint border border-forest-border flex items-center justify-center text-forest shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-forest block">
                  Unsere Verkaufsstelle in Machtsum
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-0.5">
                  Vollmer’s Hofladen • Lindenallee 24
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted mt-1">
                  31177 Harsum (OT Machtsum) — Direkt an der Hofstelle mit kostenlosen Parkplätzen
                </p>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Vollmers+Hofladen+Lindenallee+24+31177+Harsum"
              target="_blank"
              rel="noreferrer noopener"
              className="px-5 py-3 rounded-xl bg-forest text-white hover:bg-forest-hover text-xs sm:text-sm font-semibold transition-colors shadow-subtle flex items-center justify-center gap-2 shrink-0"
            >
              <Navigation className="w-4 h-4" />
              <span>Route zur Verkaufsstelle starten</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Interaktive Google Map mit Verkaufsstellen-Overlay */}
          <div className="relative w-full h-[380px] sm:h-[460px] bg-[#E8E4D9]">
            <iframe
              title="Verkaufsstelle Vollmers Hofladen Lindenallee 24, 31177 Harsum-Machtsum"
              src="https://maps.google.com/maps?q=Vollmers+Hofladen,+Lindenallee+24,+31177+Harsum&hl=de&z=15&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />

            {/* Schwebende Verkaufsstellen-Visitenkarte unten links */}
            <div className="hidden sm:flex absolute bottom-5 left-5 z-10 max-w-sm p-4 rounded-2xl bg-canvas-card/95 backdrop-blur-md border border-ink-border shadow-elevated items-center gap-3.5">
              <img
                src={MEDIA.favicon}
                alt="Vollmer's Hofladen"
                className="w-11 h-11 rounded-full bg-white object-contain border border-ink-border p-1 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest block">
                  24/7 SB-Verkaufsstelle
                </span>
                <strong className="text-sm font-serif text-ink block truncate">
                  Vollmer’s Hofladen
                </strong>
                <span className="text-xs text-ink-muted block">
                  Lindenallee 24, 31177 Harsum (Machtsum)
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
