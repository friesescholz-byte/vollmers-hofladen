import React from 'react';
import { ShieldCheck, Heart, Sun, Feather, Wheat, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { MEDIA } from '../data/media';

function HensImageGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="space-y-3 sm:space-y-4">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-ink-border shadow-subtle aspect-[3/4]">
          <img
            src={MEDIA.heroHensWindmill}
            alt="Hühner vor der Bockwindmühle"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-ink-border shadow-subtle aspect-square">
          <img
            src={MEDIA.hensBoots}
            alt="Hühner umringen Landwirt"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-8">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-ink-border shadow-subtle aspect-square">
          <img
            src={MEDIA.henCloseup}
            alt="Nahaufnahme Huhn"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-ink-border shadow-subtle aspect-[3/4]">
          <img
            src={MEDIA.henGoldenHour}
            alt="Huhn im Abendlicht"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

function DurocImageGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="rounded-2xl overflow-hidden border border-ink-border shadow-subtle aspect-[3/4]">
        <img
          src={MEDIA.durocGrazing}
          alt="Duroc Schwein wühlt im Gras"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="rounded-2xl overflow-hidden border border-ink-border shadow-subtle aspect-[3/4]">
        <img
          src={MEDIA.durocCurious}
          alt="Neugieriges Duroc Schwein frontal"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="col-span-2 rounded-2xl overflow-hidden border border-ink-border shadow-subtle h-48 sm:h-64 bg-[#EBE7DE]">
        <img
          src={MEDIA.durocPastureWide}
          alt="Duroc-Schweine auf der Freilandweide und im gemütlichen Strohbett"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
}

function ChickenImage() {
  return (
    <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-ink-border shadow-elevated aspect-[4/3] sm:aspect-[4/5] bg-[#F5F2EA]">
      <img
        src={MEDIA.broilerChicken}
        alt="Weiße Weidehähnchen auf der grünen Wiese"
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
}

export default function FreeRangePage({ onNavigate }) {
  return (
    <div className="py-10 sm:py-16 md:py-20 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 md:mb-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-forest">
            Echtes Tierwohl <span className="whitespace-nowrap">in Machtsum</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-ink mt-2 sm:mt-3 leading-[1.1]">
            Frische Luft, grünes Gras und Raum zum Leben.
          </h1>
          <p className="text-ink-muted text-base sm:text-lg md:text-xl mt-4 sm:mt-6 leading-relaxed">
            Warum Mobilstallhaltung und Freiland für uns der einzig richtige Weg sind: Wir glauben fest daran, dass hochwertige Lebensmittel nur aus gesunden, glücklichen Tieren entstehen können.
          </p>
        </div>

        {/* Kapitel 1: Die Legehennen im mobilen Hühnerstall */}
        <section className="mb-16 sm:mb-24 md:mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest bg-forest-tint px-3 py-1 rounded-full">
                <Feather className="w-3.5 h-3.5" />
                <span>Kapitel 1 • Legehennen</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.15]">
                Glückliche Hennen im mobilen Weidestall.
              </h2>

              <p className="text-ink-muted text-base leading-relaxed">
                Unsere rund 400 Legehennen leben nicht in stickigen Hallen, sondern in fahrbaren Mobilställen direkt auf unseren Wiesen rund um die historische Bockwindmühle Machtsum. Sobald es hell wird, öffnen sich die Stalltore und die Tiere können den gesamten Tag nach Lust und Laune picken, scharren und Sandbäder nehmen.
              </p>

              {/* MOBIL: Zuerst die Bilder direkt nach dem Intro-Text */}
              <div className="lg:hidden my-6">
                <HensImageGrid />
              </div>

              {/* DANN DIE 3 PUNKTE IN DEN KACHELN */}
              <div className="space-y-4 pt-2">
                <div className="p-5 rounded-2xl bg-canvas-card border border-ink-border">
                  <h4 className="font-semibold text-ink text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-forest"></span>
                    Immer frisches Gras durch Stallversetzung
                  </h4>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    Klassische feste Hühnerställe hinterlassen karge, überdüngte Schlammböden. Unsere Mobilställe ziehen regelmäßig auf frische Weideabschnitte weiter. So haben die Hennen stets zartes Grün und der Boden regeneriert sich auf natürliche Weise.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-canvas-card border border-ink-border">
                  <h4 className="font-semibold text-ink text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-forest"></span>
                    Sicherheit vor Fressfeinden in der Nacht
                  </h4>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    In der Abenddämmerung kehren die Hennen selbstständig in ihren geschützten Stall zurück. Automatische Schließmechanismen schützen die Tiere nachts zuverlässig vor Beutegreifern wie Füchsen oder Mardern.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-canvas-card border border-ink-border">
                  <h4 className="font-semibold text-ink text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-forest"></span>
                    Natürliche Dotterfarbe ohne künstliche Farbstoffe
                  </h4>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    Durch den hohen Anteil an Wiesengras, Kräutern und Insekten sowie einer hochwertigen Getreidemischung aus dem regionalen Landhandel entsteht die kräftige, appetitliche Dotterfarbe ganz von allein.
                  </p>
                </div>
              </div>
            </div>

            {/* DESKTOP: Bilder-Raster in der rechten Spalte */}
            <div className="hidden lg:block lg:col-span-6">
              <HensImageGrid />
            </div>

          </div>
        </section>

        {/* Kapitel 2: Die Duroc-Schweine unter freiem Himmel */}
        <section className="mb-16 sm:mb-24 md:mb-32 p-5 sm:p-10 md:p-16 rounded-2xl sm:rounded-3xl bg-[#F4F1EA] border border-[#E4DEC9]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            
            {/* DESKTOP: Bilder-Raster in der linken Spalte */}
            <div className="hidden lg:block lg:col-span-6">
              <DurocImageGrid />
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta bg-terracotta-tint px-3 py-1 rounded-full">
                <span>Kapitel 2 • Duroc-Schweine</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.15]">
                Wühlen, Suhlen und Ruhen auf dickem Stroh.
              </h2>

              <p className="text-ink-muted text-base leading-relaxed">
                Seit Ende 2023 leben auf unserem Betrieb reinrassige Duroc-Schweine in Freilandhaltung. Die Schweine haben zu jeder Tages- und Nachtzeit freien Zugang zum Außengelände. Der mobile Holzstall ist dick mit weichem Stroh eingestreut und bietet Schutz vor Wind und Wetter.
              </p>

              {/* MOBIL: Zuerst die Bilder direkt nach dem Text */}
              <div className="lg:hidden my-6">
                <DurocImageGrid />
              </div>

              {/* DANN DIE 3 PUNKTE IN DEN KACHELN */}
              <div className="space-y-3.5 text-xs text-ink-muted leading-relaxed">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-canvas-card border border-ink-border">
                  <Wheat className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink text-sm block">Eigenes & regionales Futter</strong>
                    Das Futter unserer Schweine besteht aus Weizen, Gerste und eiweißreichen Ackerbohnen aus eigenem Anbau oder von befreundeten Landwirten aus der direkten Umgebung.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-canvas-card border border-ink-border">
                  <Sun className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink text-sm block">Viel Zeit zum Wachsen bis 150 kg</strong>
                    Im Freiland bewegen sich die Schweine viel mehr und wachsen langsamer als in der Industrie. Erst bei einem Gewicht von ca. 150 kg sind sie schlachtreif – das sorgt für unvergleichliche Zartheit.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-canvas-card border border-ink-border">
                  <Heart className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink text-sm block">Verarbeitung beim Landschlachter in Sehnde</strong>
                    Kurze Transportwege ohne Stress. Die handwerkliche Schlachtung und Wurstherstellung übernimmt ein Meister-Landschlachter im nahegelegenen Sehnde.
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Kapitel 3: Weide-Masthähnchen */}
        <section className="mb-16 sm:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-forest">
                Kapitel 3 • Weidegeflügel
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink leading-[1.15]">
                Weidehähnchen & traditionelle Suppenhühner.
              </h2>
              <p className="text-ink-muted text-base leading-relaxed">
                Um unseren Kunden neben Eiern und Suppenhühnern auch erstklassiges Hähnchenfleisch anbieten zu können, zogen 2021 die ersten Masthähnchen in Weidehaltung bei uns ein. Das langsame Wachstum auf der Wiese verleiht dem Fleisch ein kräftiges Aroma und feste Struktur.
              </p>

              {/* MOBIL: Bild vor dem Button */}
              <div className="lg:hidden my-4">
                <ChickenImage />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('produkte')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-hover transition-colors shadow-subtle"
                >
                  <span>Geflügel im Sortiment ansehen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* DESKTOP: Bild rechts */}
            <div className="hidden lg:block lg:col-span-5">
              <ChickenImage />
            </div>
          </div>
        </section>

        {/* Fazit Box */}
        <div className="p-6 sm:p-12 rounded-2xl sm:rounded-3xl bg-forest text-white text-center shadow-elevated max-w-4xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300 block mb-2">
            Unser Versprechen
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white">
            „Tierwohl kann man nicht behaupten. Man muss es sehen können.“
          </h3>
          <p className="text-white/80 text-sm sm:text-base mt-3 sm:mt-4 max-w-2xl mx-auto leading-relaxed">
            Wenn du unsere Tiere auf der Weide <span className="whitespace-nowrap">in Machtsum</span> besuchst, siehst du mit eigenen Augen, wie Landwirtschaft im Einklang mit der Natur funktioniert.
          </p>
          <div className="mt-6 sm:mt-8">
            <button
              onClick={() => onNavigate('kontakt')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-forest hover:bg-white/90 font-semibold text-sm transition-all shadow-subtle active:scale-[0.99]"
            >
              Anfahrt nach Machtsum planen
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
