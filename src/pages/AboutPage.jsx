import React from 'react';
import { Heart, Compass, CheckCircle2, MapPin, ArrowRight } from 'lucide-react';
import { MEDIA } from '../data/media';

export default function AboutPage({ onNavigate }) {
  const milestones = [
    {
      year: '2017',
      title: 'Der erste eigene Mobilstall',
      description: 'Hühner für den Eigenbedarf gab es auf unserem Hof schon immer. Aus einer Laune und Begeisterung für das Federvieh zimmerten wir 2017 einen kleinen mobilen Hühnerstall selbst, um auch Nachbarn und Freunde im Dorf mit echten Freilandeiern zu versorgen.'
    },
    {
      year: '2018',
      title: 'Das Eierhäuschen auf dem Hof',
      description: 'Die Nachfrage nach unseren Eiern stieg rasant. 2018 zog der erste große professionelle Mobilstall bei uns ein – kurz darauf folgte bereits der zweite. Auf dem Hof entstand unser kleines Eierhäuschen auf Vertrauensbasis.'
    },
    {
      year: '2021',
      title: 'Eröffnung des 24/7 Hofladens & Weidehähnchen',
      description: 'Da bald auch hausgemachte Eiernudeln und regionaler Honig dazugehörten, eröffneten wir im Januar 2021 unseren festen Selbstbedienungsladen. Im selben Jahr zogen auch die ersten Masthähnchen in Weidehaltung bei uns ein.'
    },
    {
      year: '2023',
      title: 'Einzug der Duroc-Freilandschweine',
      description: 'Unsere Leidenschaft für Freilandhaltung führte zur nächsten Idee: Im Dezember 2023 bezogen die ersten Duroc-Schweine ihr Weidegelände mit dickem Strohbett. Seither bieten wir auch erstklassiges Freilandfleisch und Wurstspezialitäten an.'
    },
    {
      year: 'Heute',
      title: 'Fester Bestandteil der Hildesheimer Börde',
      description: 'Mit rund 400 Legehennen, Duroc-Schweinen, Weidehähnchen und einem beliebten 24/7 Hofladen verbinden wir traditionelle Landwirtschaft mit modernem, transparentem Direktvertrieb.'
    }
  ];

  return (
    <div className="py-10 sm:py-16 md:py-20 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 md:mb-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-forest">
            Familientradition & Leidenschaft
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-ink mt-2 sm:mt-3 leading-[1.1]">
            Aus einer Idee im Hühnerstall zum modernen Hofladen.
          </h1>
          <p className="text-ink-muted text-base sm:text-lg md:text-xl mt-4 sm:mt-6 leading-relaxed">
            Unser Familienbetrieb liegt in Machtsum, umgeben von der fruchtbaren Hildesheimer Börde. Hier verbinden wir konventionellen Ackerbau mit kompromissloser Freilandhaltung.
          </p>
        </div>

        {/* Hero Portrait: Felix & Partnerin mit Hühnern vor der Windmühle */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-ink-border shadow-elevated bg-[#F4F1EA] mb-16 sm:mb-20 md:mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            <div className="lg:col-span-6 p-5 sm:p-10 md:p-16 space-y-4 sm:space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-forest block">
                Wer wir sind
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink leading-tight">
                Felix Vollmer & Familie: Landwirtschaft mit Herz und Gesicht.
              </h2>
              <p className="text-ink-muted text-sm sm:text-base leading-relaxed">
                „Wir wollten nie die Größten sein, sondern die Ehrlichsten. Wenn Kunden zu uns nach Machtsum kommen, sollen sie die Hühner auf der Wiese picken sehen und genau wissen, wer hinter den Lebensmitteln auf ihrem Tisch steht.“
              </p>
              <div className="pt-1">
                <span className="font-semibold text-ink text-base block">Felix Vollmer</span>
                <span className="text-xs text-ink-faint block">Betriebsleiter & Landwirt</span>
              </div>
            </div>

            <div className="lg:col-span-6 h-[280px] sm:h-[450px] lg:h-[600px] overflow-hidden">
              <img
                src={MEDIA.portraitFelix}
                alt="Felix Vollmer und Partnerin vor der historischen Machtsumer Bockwindmühle"
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        </div>

        {/* Chronologie / Zeitstrahl */}
        <section className="mb-16 sm:mb-24 md:mb-32">
          <div className="max-w-3xl mb-8 sm:mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-forest">
              Unsere Meilensteine
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink mt-2">
              Der Weg von 2017 bis heute.
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border shadow-subtle flex flex-col sm:flex-row gap-4 sm:gap-8 items-start hover:shadow-elevated transition-shadow"
              >
                <div className="px-3.5 py-1.5 rounded-xl bg-forest-tint border border-forest-border text-forest font-serif text-xl sm:text-2xl md:text-3xl font-bold shrink-0 self-start">
                  {m.year}
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="font-serif text-xl sm:text-2xl text-ink">
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fotostrecke: Alltag auf dem Hof */}
        <section className="mb-16 sm:mb-24">
          <div className="max-w-3xl mb-8 sm:mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-forest">
              Bilder aus unserem Alltag
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink mt-2">
              Nah am Tier, nah an der Natur.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-ink-border shadow-subtle aspect-[4/3] sm:aspect-[4/5]">
              <img
                src={MEDIA.felixWithHens}
                alt="Felix Vollmer füttert Hühner"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-ink-border shadow-subtle aspect-[4/3] sm:aspect-[4/5]">
              <img
                src={MEDIA.hensBoots}
                alt="Hühnerschar um Landwirt"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-ink-border shadow-subtle aspect-[4/3] sm:aspect-[4/5]">
              <img
                src={MEDIA.henGoldenHour}
                alt="Hühner vor Bockwindmühle"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* CTA Box */}
        <div className="p-6 sm:p-12 rounded-2xl sm:rounded-3xl bg-forest text-white text-center shadow-elevated">
          <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white">
            Besuche uns in Machtsum und lerne uns kennen.
          </h3>
          <p className="text-white/80 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            Unser 24/7 Selbstbedienungsladen steht dir rund um die Uhr offen. Wir freuen uns über jeden, der regionale Landwirtschaft unterstützt!
          </p>
          <div className="mt-6 sm:mt-8">
            <button
              onClick={() => onNavigate('kontakt')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-forest hover:bg-white/90 font-semibold text-sm transition-all shadow-subtle active:scale-[0.99]"
            >
              Standort & Öffnungszeiten ansehen
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
