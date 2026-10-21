import React, { useState } from 'react';
import { MapPin, CheckCircle2, Banknote, AlertCircle, Loader2, Home, Info, Send } from 'lucide-react';
import { MEDIA } from '../data/media';
import { DELIVERY_TOWNS } from '../data/deliveryTowns';
import EggIcon from '../components/EggIcon';
import ThursdayMiniCalendar, { getNextThursdayISO, formatThursdayDE } from '../components/ThursdayMiniCalendar';

const PRESET_QUANTITIES = [50, 70, 100, 150];

export default function EggThursdayPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    street: '',
    townId: 'machtsum',
    eggCount: 50,
    deliveryDate: getNextThursdayISO(),
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedTown = DELIVERY_TOWNS.find((t) => t.id === formData.townId) || DELIVERY_TOWNS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.street.trim() || !formData.eggCount || !formData.deliveryDate) {
      setErrorMessage('Bitte fülle alle Pflichtfelder (Name, E-Mail-Adresse, Ortschaft, Straße/Hausnummer und Eiermenge) aus.');
      return;
    }

    if (Number(formData.eggCount) < 50) {
      setErrorMessage('Die Mindestanzahl für den Eier-Donnerstag beträgt 50 Eier.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddress = `${formData.street.trim()}, ${selectedTown.zip} ${selectedTown.name}`;
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        street: formData.street.trim(),
        townId: selectedTown.id,
        town: selectedTown.name,
        zip: selectedTown.zip,
        address: fullAddress,
        eggCount: Number(formData.eggCount) || formData.eggCount,
        deliveryDate: formData.deliveryDate,
        message: formData.message.trim(),
      };

      const res = await fetch('/api/eier-donnerstag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setSubmittedOrder(data.order || payload);
        setFormData({
          name: '',
          email: '',
          street: '',
          townId: 'machtsum',
          eggCount: 50,
          deliveryDate: getNextThursdayISO(),
          message: '',
        });
      } else {
        setErrorMessage(data?.error || 'Deine Anfrage konnte nicht übermittelt werden. Bitte versuche es erneut.');
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
            <EggIcon className="w-4 h-4" />
            <span>Haustür-Lieferung für Machtsum & Umgebung</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-ink mt-2 sm:mt-3 leading-[1.12]">
            Der regionale <span className="italic font-normal text-forest">Eier-Donnerstag.</span>
          </h1>
          <p className="text-ink-muted text-base md:text-lg mt-3 sm:mt-4 leading-relaxed">
            Donnerstags bringen wir dir unsere tagesfrischen Freilandeier aus dem Hühnermobil direkt bis vor die Haustür. Unser Lieferservice gilt für Machtsum, Hönnersum, Achtum, Einum, Harsum, Algermissen, Clauen und Rautenberg.
          </p>
        </div>

        {/* Hauptbereich: 2-Spalten-Layout (Links Ablauf & Infos, Rechts Anfrage) */}
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
                  <span>Donnerstags frisch</span>
                  <span>8 Ortschaften im Umkreis</span>
                </div>
                <h3 className="font-serif text-2xl text-ink">
                  Vom Hühnermobil direkt an deine Haustür.
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Keine Wege, kein Vergessen: Wähle deinen gewünschten Donnerstag im Kalender, deine Ortschaft und die Anzahl der Eier. Wir planen deine Lieferung fest in unsere Tour ein.
                </p>
              </div>
            </div>

            {/* Ablauf & Hinweise */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-forest text-white shadow-elevated space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-300 font-semibold block">
                  Einfach & Verlässlich
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white mt-1">
                  So läuft deine Anfrage ab
                </h3>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-white/15 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-white block">Unverbindliche Anfrage stellen</strong>
                    <span className="text-white/75 text-xs leading-relaxed block mt-0.5">
                      Wähle deinen Donnerstag, deine Ortschaft, Straße und Wunschmenge an Eiern aus.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-white/15 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-white block">Bestätigung durch den Hofladen</strong>
                    <span className="text-white/75 text-xs leading-relaxed block mt-0.5">
                      Da unsere Freilandhühner täglich limitierte Mengen legen, prüfen wir die Kapazitäten und senden dir zeitnah eine verbindliche Bestätigung per E-Mail.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-white/15 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-white block">Lieferung & Barzahlung an der Haustür</strong>
                    <span className="text-white/75 text-xs leading-relaxed block mt-0.5">
                      Am Donnerstag liefern wir die Eier zu dir. Die Bezahlung erfolgt bequem und bar an der Haustür.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/15 flex items-center gap-3 text-xs text-emerald-200">
                <Banknote className="w-4 h-4 shrink-0" />
                <span>Hinweis: Die Bezahlung erfolgt vorerst ausschließlich in bar an der Haustür.</span>
              </div>
            </div>

            {/* Liefergebiete Übersicht */}
            <div className="p-5 sm:p-6 rounded-2xl bg-canvas-card border border-ink-border shadow-subtle space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest block">
                Belieferte Ortschaften (8 Dörfer)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DELIVERY_TOWNS.map((t) => (
                  <span
                    key={t.id}
                    className="px-2.5 py-1 rounded-lg bg-canvas text-ink-muted border border-ink-border text-xs font-medium"
                  >
                    {t.name} ({t.zip})
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Rechte Spalte: Anmeldeformular */}
          <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border shadow-subtle">
            <div className="mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-forest">
                Lieferanfrage
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink mb-2">
              Eier für Donnerstag anfragen
            </h2>

            <p className="text-xs sm:text-sm text-ink-muted mb-6 leading-relaxed">
              Trage hier deine Wunschmenge und Adresse ein. Da unsere Freilandhühner naturgemäß begrenzte Mengen legen, bestätigen wir deine Anfrage vorab kurz per E-Mail.
            </p>

            {submittedOrder ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-forest-tint border border-forest-border space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-forest text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest block">
                    Anfrage erfolgreich eingegangen
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-ink">
                    Vielen Dank, {submittedOrder.name}!
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Deine Lieferanfrage für den Eier-Donnerstag ist bei uns eingegangen. Unser Hof-Team prüft kurz die Eier-Mengen und sendet dir eine Bestätigungs-E-Mail an <strong>{submittedOrder.email}</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-canvas-card border border-ink-border space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-ink-border/60">
                    <span className="text-ink-muted">Gewünschter Liefertag:</span>
                    <span className="font-semibold text-forest">{formatThursdayDE(submittedOrder.deliveryDate)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-ink-border/60">
                    <span className="text-ink-muted">Lieferadresse:</span>
                    <span className="font-semibold text-ink">{submittedOrder.address}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-ink-border/60">
                    <span className="text-ink-muted">Menge:</span>
                    <span className="font-semibold text-forest">{submittedOrder.eggCount} Freilandeier</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-ink-border/60">
                    <span className="text-ink-muted">Status:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                      <span>⏳ Ausstehend (Bestätigung folgt per E-Mail)</span>
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-muted">Bezahlung:</span>
                    <span className="font-semibold text-ink">Bar an der Haustür bei Lieferung</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmittedOrder(null)}
                  className="px-5 py-3 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors"
                >
                  Weitere Anfrage stellen
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

                {/* Mini-Kalender: Welcher Donnerstag soll geliefert werden? */}
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                    Gewünschten Liefer-Donnerstag auswählen *
                  </label>
                  <ThursdayMiniCalendar
                    value={formData.deliveryDate}
                    onChange={(iso) => setFormData({ ...formData, deliveryDate: iso })}
                  />
                </div>

                {/* Eiermenge Auswahl */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                      Gewünschte Anzahl Eier *
                    </label>
                    <span className="text-[11px] font-semibold text-forest bg-forest-tint px-2.5 py-0.5 rounded-full border border-forest-border">
                      Mindestens 50 Eier
                    </span>
                  </div>
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
                          <EggIcon className="w-3.5 h-3.5" />
                          <span>{qty} Eier</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <span className="text-xs text-ink-muted">Oder individuelle Anzahl:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={50}
                        max={1000}
                        step={10}
                        required
                        value={formData.eggCount}
                        onChange={(e) => setFormData({ ...formData, eggCount: e.target.value })}
                        className="w-24 px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm font-semibold focus:outline-none focus:border-forest"
                      />
                      <span className="text-xs text-ink-faint">Stück (mind. 50)</span>
                    </div>
                  </div>
                </div>

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
                      E-Mail-Adresse (für Bestätigung) *
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

                {/* Ortschaft Dropdown & Straße */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                      Ortschaft / PLZ *
                    </label>
                    <select
                      value={formData.townId}
                      onChange={(e) => setFormData({ ...formData, townId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm font-medium focus:outline-none focus:border-forest"
                    >
                      {DELIVERY_TOWNS.map((town) => (
                        <option key={town.id} value={town.id}>
                          {town.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-7">
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                      Straße & Hausnummer *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="z. B. Lindenallee 12"
                      className="w-full px-4 py-3 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm placeholder:text-ink-faint focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                {/* Nachricht / Hinweis */}
                <div>
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Schreibe uns eine Nachricht oder Hinweis (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Schreibe uns eine Nachricht oder einen Hinweis..."
                    className="w-full px-4 py-3 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm placeholder:text-ink-faint focus:outline-none focus:border-forest resize-none"
                  />
                </div>

                {/* Hinweis Barzahlung & Prüfung */}
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-canvas border border-ink-border flex items-start gap-3 text-xs text-ink-muted">
                    <Banknote className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                    <span>
                      <strong>Bezahlung:</strong> Barzahlung direkt an der Haustür bei Lieferung am Donnerstag.
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Unverbindliche Anfrage:</strong> Wir prüfen unsere Eier-Mengen für den gewählten Donnerstag und senden dir eine verbindliche Bestätigung per E-Mail.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-forest text-white font-semibold text-sm hover:bg-forest-hover transition-colors shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Anfrage wird gesendet...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Unverbindliche Lieferanfrage senden</span>
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
