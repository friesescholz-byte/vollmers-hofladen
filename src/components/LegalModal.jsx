import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Eye, CheckCircle2, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

export default function LegalModal({ isOpen, type = 'impressum', onClose }) {
  const [activeTab, setActiveTab] = useState(type || 'impressum');

  useEffect(() => {
    if (type) {
      setActiveTab(type);
    }
  }, [type]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-[#FBF9F5] rounded-3xl shadow-2xl border border-ink-border overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-ink"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header mit Titel & Tabs */}
        <div className="px-4 sm:px-8 pt-5 sm:pt-6 pb-3 sm:pb-4 border-b border-ink-border bg-[#F5F2EA]">
          <div className="flex items-center justify-between gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-forest-tint border border-forest-border flex items-center justify-center text-forest shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-3xl text-ink font-normal leading-tight">
                  Rechtliche Informationen
                </h3>
                <p className="text-[11px] sm:text-xs text-ink-muted">
                  Vollmer’s Hofladen & Landwirtschaft • Stand: Oktober 2026
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-canvas-subtle transition-colors shrink-0"
              aria-label="Modal schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-1 overflow-x-auto no-scrollbar touch-scroll pb-1">
            <button
              onClick={() => setActiveTab('impressum')}
              className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'impressum'
                  ? 'bg-forest text-white shadow-subtle'
                  : 'bg-white/80 hover:bg-white text-ink-muted hover:text-ink border border-ink-border/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Impressum</span>
            </button>

            <button
              onClick={() => setActiveTab('datenschutz')}
              className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'datenschutz'
                  ? 'bg-forest text-white shadow-subtle'
                  : 'bg-white/80 hover:bg-white text-ink-muted hover:text-ink border border-ink-border/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Datenschutzerklärung</span>
            </button>

            <button
              onClick={() => setActiveTab('barrierefreiheit')}
              className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'barrierefreiheit'
                  ? 'bg-forest text-white shadow-subtle'
                  : 'bg-white/80 hover:bg-white text-ink-muted hover:text-ink border border-ink-border/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Erklärung zur Barrierefreiheit</span>
            </button>
          </div>
        </div>

        {/* Modal Body mit strukturiertem Scroll-Inhalt */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 sm:space-y-8 text-xs sm:text-sm text-ink-muted leading-relaxed select-text">
          
          {/* =========================================================================
              TAB 1: IMPRESSUM
             ========================================================================= */}
          {activeTab === 'impressum' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-forest block mb-1">
                  Anbieterkennzeichnung
                </span>
                <h4 className="font-serif text-2xl text-ink">Impressum</h4>
                <p className="text-xs text-ink-faint mt-0.5">
                  Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz) und § 18 Abs. 2 MStV
                </p>
              </div>

              {/* Betrieb & Inhaber */}
              <div className="p-5 rounded-2xl bg-[#F5F2EA] border border-ink-border space-y-2">
                <span className="text-xs font-semibold text-forest uppercase tracking-wider block">
                  Betreiber & Anschrift
                </span>
                <p className="text-ink font-semibold text-base leading-snug">
                  Felix Vollmer Landwirtschaft<br />
                  <span className="text-ink-muted font-normal text-sm">
                    Inhaber: Felix Vollmer<br />
                    Lindenallee 24<br />
                    31177 Harsum (Ortsteil Machtsum)<br />
                    Niedersachsen, Deutschland
                  </span>
                </p>
              </div>

              {/* Kontakt */}
              <div className="space-y-2">
                <h5 className="font-semibold text-ink text-base">Kontakt:</h5>
                <ul className="space-y-1.5 text-ink-muted">
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-forest shrink-0" />
                    <span>Telefon: </span>
                    <a href="tel:017621006452" className="text-ink font-medium hover:text-forest hover:underline">
                      0176 21006452
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-forest shrink-0" />
                    <span>E-Mail: </span>
                    <a href="mailto:info@vollmers-hofladen.de" className="text-ink font-medium hover:text-forest hover:underline">
                      info@vollmers-hofladen.de
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-forest shrink-0" />
                    <span>Internetadresse: </span>
                    <a href="https://www.vollmers-hofladen.de" className="text-ink font-medium hover:text-forest hover:underline">
                      www.vollmers-hofladen.de
                    </a>
                  </li>
                </ul>
              </div>

              {/* Steuer / Einstufung */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">Umsatzsteuer:</h5>
                <p>
                  Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: <em>Entfällt</em> (Landwirtschaftlicher Erzeugerbetrieb / Besteuerung nach Durchschnittssätzen gemäß § 24 UStG bzw. Kleinunternehmerregelung).
                </p>
              </div>

              {/* Verantwortlich für den redaktionellen Inhalt */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">
                  Verantwortlich für redaktionelle Inhalte gemäß § 18 Abs. 2 MStV:
                </h5>
                <p className="text-ink">
                  Felix Vollmer<br />
                  Lindenallee 24<br />
                  31177 Harsum (Ortsteil Machtsum)
                </p>
              </div>

              {/* Betriebshaftpflicht */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">Angaben zur Betriebshaftpflichtversicherung:</h5>
                <p>
                  <strong>Versicherer:</strong> VGH Versicherungen, Schiffgraben 4, 30159 Hannover<br />
                  <strong>Räumlicher Geltungsbereich:</strong> Deutschland
                </p>
              </div>

              {/* EU-Streitschlichtung & Verbraucherstreitbeilegung */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">Verbraucherstreitbeilegung & Universalschlichtungsstelle:</h5>
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie unter{' '}
                  <a 
                    href="https://ec.europa.eu/consumers/odr/" 
                    target="_blank" 
                    rel="noreferrer noopener" 
                    className="text-forest hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>https://ec.europa.eu/consumers/odr/</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  finden. Unsere E-Mail-Adresse finden Sie oben im Impressum.
                </p>
                <p>
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>

              {/* Haftung für Inhalte & Links */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">Haftung für Inhalte und Links:</h5>
                <p>
                  Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
                <p>
                  Unser Angebot enthält Links zu externen Websites Dritter (insbesondere zu unserem Vorbestellsystem bei Friedhold sowie zu unserem Instagram-Profil), auf deren Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte übernehmen wir keine Gewähr. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
              </div>

              {/* Urheberrecht & Webdesign */}
              <div className="p-4 rounded-xl bg-canvas-card border border-ink-border text-xs space-y-1">
                <span className="font-semibold text-ink block">Konzeption & Webdesign:</span>
                <p>
                  Erstellt von der Design- & Digitalagentur{' '}
                  <a 
                    href="https://scholz-friese-webdesign.de/" 
                    target="_blank" 
                    rel="noreferrer noopener" 
                    className="text-forest font-semibold hover:underline"
                  >
                    Scholz & Friese Webdesign
                  </a>. Bild- und Videomaterial: Vollmer’s Hofladen Machtsum & Scholz & Friese.
                </p>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: DATENSCHUTZERKLÄRUNG
             ========================================================================= */}
          {activeTab === 'datenschutz' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-forest block mb-1">
                  Transparenz & DSGVO-Konformität
                </span>
                <h4 className="font-serif text-2xl text-ink">Datenschutzerklärung</h4>
                <p className="text-xs text-ink-faint mt-0.5">
                  Informationen über die Verarbeitung Ihrer Daten nach Art. 13 & 14 DSGVO sowie § 25 TDDDG
                </p>
              </div>

              {/* 1. Verantwortliche Stelle */}
              <div className="space-y-3">
                <h5 className="font-semibold text-ink text-base">1. Name und Anschrift des Verantwortlichen</h5>
                <p>
                  Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und sonstiger datenschutzrechtlicher Bestimmungen ist:
                </p>
                <div className="p-4 rounded-2xl bg-[#F5F2EA] border border-ink-border text-ink">
                  <strong>Felix Vollmer Landwirtschaft</strong><br />
                  Lindenallee 24, 31177 Harsum (Ortsteil Machtsum)<br />
                  Telefon: 0176 21006452<br />
                  E-Mail: info@vollmers-hofladen.de
                </div>
              </div>

              {/* 2. Hosting & Cloudflare */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">2. Hosting, Content Delivery Network (Cloudflare Pages & R2)</h5>
                <p>
                  Wir hosten unsere Website über <strong>Cloudflare Pages</strong> und nutzen das Objektspeichersystem <strong>Cloudflare R2</strong> zur schnellen Bereitstellung optimierter Bildmedien. Anbieter ist die Cloudflare Inc., 101 Townsend St, San Francisco, CA 94107, USA.
                </p>
                <p>
                  Cloudflare stellt ein weltweites Content Delivery Network (CDN) bereit, das die Ladezeiten optimiert und unsere Website vor Cyberangriffen (z. B. DDoS-Attacken) schützt. Beim Aufruf von Seiten werden Anfragen über die Server von Cloudflare geroutet, wobei technische Verbindungsdaten (einschließlich Ihrer IP-Adresse) verarbeitet werden.
                </p>
                <p>
                  <strong>Rechtsgrundlage:</strong> Unser berechtigtes Interesse an einer sicheren, stabilen und schnellen Bereitstellung unseres Onlineangebots (Art. 6 Abs. 1 lit. f DSGVO). Die Datenübermittlung in die USA erfolgt auf Grundlage des <em>EU-US Data Privacy Framework (DPF)</em> sowie gültiger EU-Standardvertragsklauseln (SCC).
                </p>
              </div>

              {/* 3. Server-Logfiles */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">3. Erhebung von Zugriffsdaten (Server-Logfiles)</h5>
                <p>
                  Beim reinen informatorischen Besuch unserer Website werden durch den Webserver automatisch allgemeine Informationen erhoben und in sogenannten Server-Logfiles gespeichert:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Browsertyp und Browserversion</li>
                  <li>Verwendetes Betriebssystem</li>
                  <li>Referrer URL (die zuvor besuchte Seite)</li>
                  <li>Hostname des zugreifenden Rechners / IP-Adresse</li>
                  <li>Uhrzeit und Datum der Serveranfrage</li>
                </ul>
                <p>
                  Diese Daten werden ausschließlich zur Sicherstellung eines fehlerfreien Betriebs der Website, zur Lastverteilung und zur Abwehr von Sicherheitsbedrohungen verarbeitet. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
                </p>
              </div>

              {/* 4. Cookies & Consent-Management */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">4. Einsatz von Cookies & Cookie-Einstellungen</h5>
                <p>
                  Unsere Website verwendet Cookies und ähnliche Technologien. Cookies sind kleine Textdateien, die Ihr Internet-Browser auf Ihrem Endgerät ablegt.
                </p>
                <p>
                  <strong>Technisch notwendige Cookies:</strong> Diese sind für grundlegende Funktionen der Website (z. B. Seitennavigation, Sicherheitsfeatures) zwingend erforderlich und können nicht deaktiviert werden. Rechtsgrundlage ist § 25 Abs. 2 Nr. 2 TDDDG i.V.m. Art. 6 Abs. 1 lit. f DSGVO.
                </p>
                <p>
                  <strong>Optionale Analyse- und Marketing-Cookies (Google Analytics, Meta Pixel, Google Maps):</strong> Diese Cookies ermöglichen es uns, die Webseitennutzung zu analysieren, gezielte Werbemaßnahmen auszuspielen und interaktive Karten darzustellen. Sie werden <strong>ausschließlich nach Ihrer ausdrücklichen Einwilligung</strong> geladen. Rechtsgrundlage ist § 25 Abs. 1 TDDDG i.V.m. Art. 6 Abs. 1 lit. a DSGVO. Sie können Ihre Einwilligung jederzeit für die Zukunft über Ihren Browser oder unsere Cookie-Einstellungen widerrufen.
                </p>
              </div>

              {/* 5. Kontaktformular & Kommunikation */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">5. Kontaktformular, E-Mail- und Telefon-Kontakt</h5>
                <p>
                  Wenn Sie uns per Kontaktformular (auf der Seite „Kontakt & Anfahrt“), per E-Mail oder telefonisch Anfragen zukommen lassen, verarbeiten wir Ihre Angaben (Name, E-Mail-Adresse, Telefonnummer, Betreff und Nachrichtentext), um Ihre Anfrage zu beantworten und eventuelle Rückfragen zu klären.
                </p>
                <p>
                  <strong>Rechtsgrundlage:</strong> Die Verarbeitung erfolgt zur Durchführung vorvertraglicher Maßnahmen oder zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) sowie auf Basis unseres berechtigten Interesses an einer professionellen Bearbeitung von Kundenanfragen (Art. 6 Abs. 1 lit. f DSGVO). Die Daten werden nach abschließender Erledigung Ihrer Anfrage gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
                </p>
              </div>

              {/* 6. Google Analytics */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">6. Google Analytics (mit IP-Anonymisierung)</h5>
                <p>
                  Soweit Sie eingewilligt haben, nutzt diese Website Google Analytics, einen Webanalysedienst der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland („Google“). Mutterkonzern ist Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA.
                </p>
                <p>
                  Google Analytics verwendet Cookies, die eine Analyse der Benutzung unserer Website durch Sie ermöglichen. Wir nutzen Google Analytics mit der Funktion <strong>IP-Anonymisierung</strong>: Ihre IP-Adresse wird von Google innerhalb von Mitgliedstaaten der Europäischen Union oder in anderen Vertragsstaaten des Abkommens über den Europäischen Wirtschaftsraum vor einer Übermittlung gekürzt.
                </p>
                <p>
                  <strong>Zweck & Rechtsgrundlage:</strong> Analyse des Nutzerverhaltens zur stetigen Verbesserung unseres Angebots. Rechtsgrundlage ist Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG. Google ist unter dem <em>EU-US Data Privacy Framework</em> zertifiziert.
                </p>
                <p>
                  <strong>Widerruf & Deaktivierung:</strong> Sie können Ihre erteilte Einwilligung jederzeit widerrufen oder die Speicherung von Cookies durch eine entsprechende Einstellung Ihrer Browser-Software verhindern. Zudem können Sie das Browser-Add-on zur Deaktivierung von Google Analytics herunterladen und installieren:{' '}
                  <a 
                    href="https://tools.google.com/dlpage/gaoptout?hl=de" 
                    target="_blank" 
                    rel="noreferrer noopener" 
                    className="text-forest hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <span>Google Opt-Out Add-on</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>.
                </p>
              </div>

              {/* 7. Meta Pixel (Facebook & Instagram Pixel) */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">7. Meta Pixel (ehemals Facebook-Pixel & Conversion-Tracking)</h5>
                <p>
                  Auf Grundlage Ihrer Einwilligung nutzen wir das „Meta-Pixel“ der Meta Platforms Ireland Limited, 4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Irland (bzw. Meta Platforms Inc., 1 Hacker Way, Menlo Park, CA 94025, USA).
                </p>
                <p>
                  Mit Hilfe des Meta-Pixels ist es Meta möglich, die Besucher unseres Onlineangebotes als Zielgruppe für die Darstellung von Werbeanzeigen (sog. „Facebook-Ads“ oder „Instagram-Ads“) zu bestimmen. Wir setzen das Meta-Pixel ein, um sicherzustellen, dass unsere Anzeigen nur solchen Nutzern angezeigt werden, die ein Interesse an unserem regionalen Hofladen und unseren Produkten gezeigt haben. Zudem können wir damit die Wirksamkeit von Werbeanzeigen für statistische Zwecke nachvollziehen (Conversion-Tracking).
                </p>
                <p>
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG (Einwilligung). Die Datenübermittlung in die USA erfolgt im Rahmen des <em>EU-US Data Privacy Frameworks</em>.
                </p>
                <p>
                  <strong>Widerspruch:</strong> Sie können der Erfassung durch das Meta-Pixel und der Verwendung Ihrer Daten zur Darstellung von Facebook/Instagram-Ads jederzeit widersprechen, indem Sie Ihre Präferenzen für nutzungsbasierte Werbung in den Einstellungen Ihres Facebook- bzw. Instagram-Kontos anpassen.
                </p>
              </div>

              {/* 8. Google Maps */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">8. Google Maps (Interaktive Anfahrtskarte)</h5>
                <p>
                  Diese Website bindet den Kartendienst Google Maps ein (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland). Dies ermöglicht es Ihnen, unseren Standort in der Lindenallee 24 in 31177 Harsum (Machtsum) bequem auf einer interaktiven Karte zu finden und eine Anfahrtsroute zu planen.
                </p>
                <p>
                  Beim Laden der Karte baut Ihr Browser eine direkte Verbindung zu den Servern von Google auf. Hierbei wird mindestens Ihre IP-Adresse verarbeitet und an Google übertragen.
                </p>
                <p>
                  <strong>Rechtsgrundlage:</strong> Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG bzw. unser berechtigtes Interesse an einer ansprechenden Darstellung unseres Standorts (Art. 6 Abs. 1 lit. f DSGVO). Google ist unter dem <em>EU-US Data Privacy Framework</em> zertifiziert.
                </p>
              </div>

              {/* 9. Externe Links, Instagram & Friedhold */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">9. Vorbestellportal (Friedhold) & Behold Instagram Widget</h5>
                <p>
                  <strong>Friedhold Vorbestellportal:</strong> Zur bequemen Online-Vorbestellung von frischem Fleisch und Geflügel verlinken wir auf das Portal <code>vollmers-hofladen.friedhold.de</code>. Anbieter ist die Friedhold Technologies GmbH. Bei der Nutzung des Portals verarbeitet Friedhold Ihre Bestelldaten eigenverantwortlich gemäß deren Datenschutzerklärung.
                </p>
                <p>
                  <strong>Behold Instagram Feed:</strong> Auf unserer Website zeigen wir aktuelle Eindrücke unseres Instagram-Profils über den Dienst Behold (Behold Labs Inc., USA). Behold fungiert als datenschutzfreundlicher Cache-Proxy, ruft Bilder serverseitig ab und setzt keine Tracking-Cookies von Meta auf Ihrem Rechner.
                </p>
              </div>

              {/* 10. Betroffenenrechte */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">10. Ihre Rechte als betroffene Person</h5>
                <p>
                  Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit folgende Rechte bezüglich Ihrer personenbezogenen Daten:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-canvas-card border border-ink-border">
                    <strong className="text-ink block">Recht auf Auskunft (Art. 15 DSGVO)</strong>
                    Auskunft über Herkunft, Empfänger und Zweck der gespeicherten Daten.
                  </div>
                  <div className="p-3 rounded-xl bg-canvas-card border border-ink-border">
                    <strong className="text-ink block">Recht auf Berichtigung (Art. 16 DSGVO)</strong>
                    Unverzügliche Korrektur unrichtiger oder unvollständiger Daten.
                  </div>
                  <div className="p-3 rounded-xl bg-canvas-card border border-ink-border">
                    <strong className="text-ink block">Recht auf Löschung (Art. 17 DSGVO)</strong>
                    Löschung Ihrer bei uns gespeicherten personenbezogenen Daten.
                  </div>
                  <div className="p-3 rounded-xl bg-canvas-card border border-ink-border">
                    <strong className="text-ink block">Recht auf Einschränkung (Art. 18 DSGVO)</strong>
                    Einschränkung der Verarbeitung unter bestimmten Voraussetzungen.
                  </div>
                  <div className="p-3 rounded-xl bg-canvas-card border border-ink-border">
                    <strong className="text-ink block">Datenübertragbarkeit (Art. 20 DSGVO)</strong>
                    Erhalt Ihrer Daten in einem strukturierten, maschinenlesbaren Format.
                  </div>
                  <div className="p-3 rounded-xl bg-canvas-card border border-ink-border">
                    <strong className="text-ink block">Widerspruch & Widerruf (Art. 21 / 7 Abs. 3)</strong>
                    Jederzeitiger Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft.
                  </div>
                </div>
              </div>

              {/* 11. Aufsichtsbehörde */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">11. Beschwerderecht bei der Aufsichtsbehörde</h5>
                <p>
                  Im Falle von Verstößen gegen die DSGVO steht Ihnen ein Beschwerderecht bei einer zuständigen Datenschutzaufsichtsbehörde zu. Die für unseren Betrieb in Niedersachsen zuständige Behörde ist:
                </p>
                <div className="p-4 rounded-xl bg-[#F5F2EA] border border-ink-border text-xs text-ink">
                  <strong>Die Landesbeauftragte für den Datenschutz Niedersachsen (LfD Niedersachsen)</strong><br />
                  Prinzenstraße 5, 30159 Hannover<br />
                  Telefon: 0511 120-4500 • E-Mail: poststelle@lfd.niedersachsen.de<br />
                  Website:{' '}
                  <a 
                    href="https://www.lfd.niedersachsen.de" 
                    target="_blank" 
                    rel="noreferrer noopener" 
                    className="text-forest hover:underline font-medium"
                  >
                    https://www.lfd.niedersachsen.de
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: ERKLÄRUNG ZUR BARRIEREFREIHEIT
             ========================================================================= */}
          {activeTab === 'barrierefreiheit' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-forest block mb-1">
                  Digitale Zugänglichkeit & Inklusion
                </span>
                <h4 className="font-serif text-2xl text-ink">Erklärung zur Barrierefreiheit</h4>
                <p className="text-xs text-ink-faint mt-0.5">
                  Erfüllung der Anforderungen nach BITV 2.0, EN 301 549 und dem Barrierefreiheitsstärkungsgesetz (BFSG)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F2EA] border border-ink-border text-xs leading-relaxed">
                <strong>Stand dieser Erklärung:</strong> Oktober 2026<br />
                <em>Geltungsbereich: Diese Erklärung gilt für den Internetauftritt unter <a href="https://www.vollmers-hofladen.de" className="text-forest underline">www.vollmers-hofladen.de</a>.</em>
              </div>

              <div className="space-y-2">
                <p>
                  Felix Vollmer Landwirtschaft legt großen Wert darauf, dass die angebotenen digitalen Dienste und Informationen für alle Menschen – unabhängig von individuellen Einschränkungen oder technischen Gegebenheiten – uneingeschränkt zugänglich und nutzbar sind.
                </p>
                <p>
                  Diese Website wurde unter Berücksichtigung der Richtlinien der <strong>Barrierefreie-Informationstechnik-Verordnung (BITV 2.0)</strong>, der europäischen Norm <strong>EN 301 549</strong> sowie der internationalen <strong>Web Content Accessibility Guidelines (WCAG 2.1 / 2.2 Konformitätsstufe AA)</strong> gestaltet.
                </p>
              </div>

              {/* 1. Stand der Vereinbarkeit */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">1. Stand der Vereinbarkeit mit den Anforderungen</h5>
                <p>
                  Dieser Webauftritt ist <strong>größtenteils mit den Anforderungen der BITV 2.0 und den WCAG 2.1 Stufe AA vereinbar</strong>.
                </p>
                <div className="space-y-2 pt-1">
                  <span className="font-semibold text-xs text-ink block">Bereits erfolgreich umgesetzte Maßnahmen:</span>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Optimierte Kontraste im Light-Mode:</strong> Ausdrücklicher Verzicht auf kontrastarme Hellgrau-Schriften oder kitschige Blend-Effekte. Hochgradig lesbare Typografie (dunkler Text auf warmem Naturpapier-Hintergrund #FBF9F5).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Tastaturbedienbarkeit:</strong> Alle interaktiven Elemente (Buttons, Links, Modals, Suchmaske) können ohne Maus mit der Tastatur (Tab / Shift+Tab / Enter / Space) angesteuert und bedient werden. Modals lassen sich mit der <code>Escape</code>-Taste schließen.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Aussagekräftige Alt-Texte:</strong> Alle relevanten Inhaltsbilder (z. B. Hühnermobil, Duroc-Schweine, Hofladen, Felix Vollmer) sind mit beschreibenden Alternativtexten für Screenreader ausgestattet.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Klare semantische HTML-Struktur:</strong> Durchgehende Verwendung standardkonformer Überschriften-Hierarchien (H1 bis H4) sowie semantischer Tags (<code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;footer&gt;</code>, <code>&lt;section&gt;</code>).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Responsive Skalierbarkeit:</strong> Layout und Schriftgrößen passen sich stufenlos an Zoomstufen bis mindestens 200% an, ohne dass Inhalte überlappen oder Funktionalitäten verloren gehen.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 2. Bekannte Einschränkungen */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">2. Bekannte Einschränkungen & Ausnahmen</h5>
                <p>
                  Trotz unserer sorgfältigen Bemühungen können bei einzelnen Inhalten noch vorübergehende Hürden auftreten:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Externe Einbindungen Dritter:</strong> Externe Module wie Google Maps oder das externe Vorbestellsystem bei Friedhold unterliegen den technischen Systemen der jeweiligen Drittanbieter.</li>
                  <li><strong>Historische Bilddokumente:</strong> Einzelne historische Aufnahmen aus der Gründungszeit besitzen möglicherweise noch knappe Bildbeschreibungen.</li>
                </ul>
              </div>

              {/* 3. Feedback und Ansprechpartner */}
              <div className="space-y-3 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">3. Barriere melden & Feedback</h5>
                <p>
                  Sind Ihnen Mängel beim barrierefreien Zugang zu Inhalten auf unserer Website aufgefallen oder haben Sie Vorschläge zur Verbesserung? Bitte wenden Sie sich jederzeit gerne an uns:
                </p>
                <div className="p-4 rounded-2xl bg-[#F5F2EA] border border-ink-border text-xs space-y-2 text-ink">
                  <strong>Felix Vollmer Landwirtschaft</strong><br />
                  Ansprechpartner: Felix Vollmer<br />
                  Lindenallee 24, 31177 Harsum (Ortsteil Machtsum)<br />
                  Telefon: <a href="tel:017621006452" className="text-forest font-semibold hover:underline">0176 21006452</a><br />
                  E-Mail: <a href="mailto:info@vollmers-hofladen.de" className="text-forest font-semibold hover:underline">info@vollmers-hofladen.de</a>
                </div>
              </div>

              {/* 4. Durchsetzungsverfahren */}
              <div className="space-y-2 pt-2 border-t border-ink-border/60">
                <h5 className="font-semibold text-ink text-base">4. Schlichtungs- und Durchsetzungsverfahren</h5>
                <p>
                  Sollten Sie auf Mitteilungen oder Anfragen zur Barrierefreiheit innerhalb von vier Wochen keine zufriedenstellende Antwort erhalten, können Sie sich an die Schlichtungsstelle des Landes Niedersachsen wenden:
                </p>
                <div className="p-4 rounded-xl bg-canvas-card border border-ink-border text-xs space-y-1 text-ink">
                  <strong>Schlichtungsstelle nach § 9d NBGG beim Landesbeauftragten für Menschen mit Behinderungen Niedersachsen</strong><br />
                  Hannah-Arendt-Platz 2, 30159 Hannover<br />
                  Telefon: 0511 120-4010 • E-Mail: <a href="mailto:schlichtungsstelle@ms.niedersachsen.de" className="text-forest underline">schlichtungsstelle@ms.niedersachsen.de</a><br />
                  Website:{' '}
                  <a 
                    href="https://www.behindertenbeauftragter-niedersachsen.de" 
                    target="_blank" 
                    rel="noreferrer noopener" 
                    className="text-forest font-medium hover:underline inline-flex items-center gap-1"
                  >
                    <span>www.behindertenbeauftragter-niedersachsen.de</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-3.5 bg-[#F5F2EA] border-t border-ink-border flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
          <span>Vollmer’s Hofladen • Rechtssicher & DSGVO-konform</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors shadow-subtle"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
