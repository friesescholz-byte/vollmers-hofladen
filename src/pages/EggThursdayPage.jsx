import React, { useState } from 'react';
import { Egg, MapPin, CheckCircle2, Banknote, Calendar, ArrowRight, AlertCircle, Loader2, Home, Sparkles } from 'lucide-react';
import { MEDIA } from '../data/media';

const PRESET_QUANTITIES = [6, 10, 20, 30];

export default function EggThursdayPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    eggCount: 10,
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.address.trim() || !formData.eggCount) {
      setErrorMessage('Bitte fülle Name, E-Mail-Adresse, Straße/Hausnummer und die gewünschte Eieranzahl aus.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim().toLowerCase().includes('machtsum')
          ? formData.address.trim()
          : `${formData.address.trim()}, 31177 Machtsum`,
        eggCount: Number(formData.eggCount) || formData.eggCount,
        message: formData.message.trim(),
      };

      const res = await fetch('/api/eier-donnerstag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      // Zusätzlich lokal zwischenspeichern als Fallback
      try {
        const existingLocal = JSON.parse(localStorage.getItem('vollmers_egg_orders') || '[]');
        const savedOrder = data?.order || {
          id: 'egg_' + Date.now(),
          ...payload,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('vollmers_egg_orders', JSON.stringify([savedOrder, ...existingLocal]));
      } catch (err) {}

      if (res.ok && data?.success) {
        setSubmittedOrder(data.order || payload);
        setFormData({
          name: '',
          email: '',
          address: '',
          eggCount: 10,
          message: '',
        });
      } else {
        setErrorMessage(data?.error || 'Anmeldung konnte nicht übertragen werden. Bitte versuche es erneut.');
      }
    } catch (err) {
      setErrorMessage('Verbindungsfehler. Bitte prüfe deine Internetverbindung und versuche es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 sm:py-16 md:py-20 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Redaktioneller Kopfbereich */}
        <div className="max-w-3xl mb-10 sm:mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-forest">
            <Egg className="w-4 h-4 stroke-[1.75]" />
            <span>Haustür-Service für unser Dorf</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-ink mt-2 sm:mt-3 leading-[1.12]">
            Der Machtsumer <span className="italic font-normal text-forest">Eier-Donnerstag.</span>
          </h1>
          <p className="text-ink-muted text-base md:text-lg mt-3 sm:mt-4 leading-relaxed">
            Jeden Donnerstag bringen wir dir unsere frischen Freilandeier aus dem Hühnermobil direkt bis vor die Haustür – exklusiv für alle Haushalte in Machtsum.
          </p>
        </div>

        {/* Hauptbereich: 2-Spalten-Layout (Links Ablauf & Infos, Rechts Anmeldung) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Linke Spalte: So funktioniert's & Bild */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            
            {/* Bildkarte */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-ink-border bg-canvas-card shadow-subtle">
              <div className="aspect-[16/10] overflow-hidden bg-[#F5F2EA]">
                <img
                  src={MEDIA.eggsTray}
                  alt="Frische Machtsumer Freilandeier für den Eier-Donnerstag"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-forest uppercase tracking-wider">
                  <span>Jeden Donnerstag frisch</span>
                  <span>Nur in 31177 Machtsum</span>
                </div>
                <h3 className="font-serif text-2xl text-ink">
                  Direkt vom Hühnermobil an deine Haustür.
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Keine Wege, kein Vergessen: Trage dich einfach über das Formular ein und teile uns mit, wie viele Eier wir dir donnerstags vorbeibringen dürfen.
                </p>
              </div>
            </div>

            {/* 3 Schritte + Bezahlhinweis */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-forest text-white shadow-elevated space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-300 font-semibold block">
                  Einfach & Nachbarschaftlich
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white mt-1">
                  So läuft der Eier-Donnerstag ab
                </h3>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-white/15 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-white block">Eiermenge & Adresse eintragen</strong>
                    <span className="text-white/75 text-xs leading-relaxed block mt-0.5">
                      Wähle deine gewünschte Eieranzahl und gib deine Adresse in Machtsum sowie einen kurzen Ablagehinweis an.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-white/15 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-white block">Lieferung am Donnerstag</strong>
                    <span className="text-white/75 text-xs leading-relaxed block mt-0.5">
                      Wir liefern unsere tagesfrischen Freilandeier jeden Donnerstag auf unserer Dorfrunde direkt zu dir nach Hause.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-white/15 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-white block">Barzahlung an der Haustür</strong>
                    <span className="text-white/75 text-xs leading-relaxed block mt-0.5">
                      Bezahlt wird ganz unkompliziert in bar direkt an der Haustür.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/15 flex items-center gap-3 text-xs text-emerald-200">
                <Banknote className="w-4 h-4 shrink-0" />
                <span>Hinweis: Die Bezahlung erfolgt vorerst ausschließlich in bar an der Haustür.</span>
              </div>
            </div>

          </div>

          {/* Rechte Spalte: Anmeldeformular */}
          <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border shadow-subtle">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-forest">
                Jetzt eintragen
              </span>
              <span className="px-3 py-1 rounded-full bg-forest-tint border border-forest-border text-forest text-[11px] font-semibold flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                <span>Liefergebiet: Nur in Machtsum</span>
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink mb-6">
              Anmeldung zum Eier-Donnerstag
            </h2>

            {submittedOrder ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-forest-tint border border-forest-border space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-forest text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif text-2xl sm:text-3xl text-ink">
                    Deine Anmeldung ist eingetragen!
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Vielen Dank, <strong>{submittedOrder.name}</strong>! Wir haben dich für den Machtsumer Eier-Donnerstag vorgemerkt.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-canvas-card border border-ink-border space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-ink-border/60">
                    <span className="text-ink-muted">Lieferadresse:</span>
                    <span className="font-semibold text-ink">{submittedOrder.address}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-ink-border/60">
                    <span className="text-ink-muted">Gewünschte Menge:</span>
                    <span className="font-semibold text-forest">{submittedOrder.eggCount} Freilandeier</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-muted">Bezahlung:</span>
                    <span className="font-semibold text-ink">Bar an der Haustür</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmittedOrder(null)}
                  className="px-5 py-3 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors"
                >
                  Weitere Anmeldung eintragen
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Name & E-Mail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                      Vor- und Nachname *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="z. B. Familie Müller"
                      className="w-full px-4 py-3 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm placeholder:text-ink-faint focus:outline-none focus:border-forest"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                      E-Mail-Adresse *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="deine@email.de"
                      className="w-full px-4 py-3 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm placeholder:text-ink-faint focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                {/* Adresse (nur in Machtsum) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                      Straße & Hausnummer (in Machtsum) *
                    </label>
                    <span className="text-[11px] text-ink-faint">PLZ 31177 Machtsum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="z. B. Lindenallee 12"
                      className="w-full px-4 py-3 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm placeholder:text-ink-faint focus:outline-none focus:border-forest"
                    />
                    <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-canvas-muted border border-ink-border text-xs font-semibold text-ink-muted shrink-0">
                      <Home className="w-3.5 h-3.5 text-forest" />
                      <span>31177 Machtsum</span>
                    </div>
                  </div>
                </div>

                {/* Eiermenge Auswahl */}
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                    Gewünschte Anzahl Eier *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                    {PRESET_QUANTITIES.map((qty) => {
                      const isSelected = Number(formData.eggCount) === qty;
                      return (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setFormData({ ...formData, eggCount: qty })}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-forest text-white border-forest shadow-subtle'
                              : 'bg-canvas text-ink border-ink-border hover:border-forest/50'
                          }`}
                        >
                          <Egg className="w-3.5 h-3.5" />
                          <span>{qty} Eier</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-muted shrink-0">Oder individuelle Anzahl:</span>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      required
                      value={formData.eggCount}
                      onChange={(e) => setFormData({ ...formData, eggCount: e.target.value })}
                      className="w-28 px-3.5 py-2 rounded-xl bg-canvas border border-ink-border text-ink text-sm font-semibold focus:outline-none focus:border-forest"
                    />
                    <span className="text-xs text-ink-faint">Stück</span>
                  </div>
                </div>

                {/* Kleine Nachricht */}
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Kleine Nachricht / Ablagehinweis (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="z. B. Bitte vor die Haustür auf die Holzbank stellen / Größe M oder L bevorzugt..."
                    className="w-full px-4 py-3 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm placeholder:text-ink-faint focus:outline-none focus:border-forest resize-none"
                  />
                </div>

                {/* Hinweis Barzahlung */}
                <div className="p-3.5 rounded-xl bg-canvas border border-ink-border flex items-center gap-3 text-xs text-ink-muted">
                  <Banknote className="w-4 h-4 text-forest shrink-0" />
                  <span>
                    <strong>Bezahlung:</strong> Barzahlung direkt an der Haustür bei Lieferung am Donnerstag.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-forest text-white font-semibold text-sm hover:bg-forest-hover transition-colors shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Wird eingetragen...</span>
                    </>
                  ) : (
                    <>
                      <Egg className="w-4 h-4" />
                      <span>Jetzt für den Eier-Donnerstag anmelden</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
