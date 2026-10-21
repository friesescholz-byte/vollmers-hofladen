import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Clock, ShieldCheck, Heart, MapPin, Sparkles, ShoppingBag, ExternalLink, ChevronRight, Star, Egg } from 'lucide-react';
import { MEDIA } from '../data/media';
import BeholdInstagramFeed from '../components/BeholdInstagramFeed';
import HofladenHeroButton from '../components/HofladenHeroButton';
import { useProducts } from '../context/ProductContext';

export default function HomePage({ onNavigate, onSelectProduct }) {
  const { products } = useProducts();
  const getProductStock = (id) => products.find(p => p.id === id)?.isOutOfStock;
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Angenehm sanfte Federung (Inertia) für absolut ruhiges, gleichmäßiges Scrollen
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    restDelta: 0.001
  });

  // Sehr dezent & leicht: Minimaler Parallax-Effekt (nur 0% bis 5% sanfte Verschiebung)
  const yAerial = useTransform(smoothProgress, [0, 1], ["0%", "5%"]);

  return (
    <div className="space-y-0">
      
      {/* 1. HERO SECTION (Editorial Agency Design mit sanftem Parallax-Luftbild) */}
      <section ref={heroRef} className="relative pt-24 sm:pt-32 md:pt-36 pb-16 md:pb-24 bg-canvas overflow-hidden">
        
        {/* PARALLAX HINTERGRUND-EBENE (Luftbild des Hofs: rechts schön sichtbar, links im Textbereich abgedeckt) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          <motion.div 
            style={{ y: yAerial }}
            className="absolute -top-[6%] -bottom-[6%] -left-[2%] -right-[2%] w-[104%] h-[112%]"
          >
            <img
              src={MEDIA.heroAerial}
              alt="Luftaufnahme des Vollmer's Hofs in Machtsum"
              className="w-full h-full object-cover object-[center_20%] opacity-[0.40] sm:opacity-[0.48] md:opacity-[0.52] filter saturate-[0.92] contrast-[0.98]"
            />
          </motion.div>

          {/* EDITORIAL GRADIENT-MASKE: 
              Links (wo Text steht) zu 100% mit warmem Canvas geschützt (nicht sichtbar), 
              nach rechts hin offen (deutlich sichtbar).
          */}
          {/* A) Sanfter, zielgerichteter Verlauf: links blickdicht, rechts transparent */}
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas via-38% md:via-canvas/95 md:via-50% to-transparent pointer-events-none" />

          {/* B) Weicher oberer Verlauf für den Header */}
          <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-canvas via-canvas/60 to-transparent pointer-events-none" />

          {/* C) Weicher Auslauf nach unten */}
          <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-canvas via-canvas/80 to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Google Bewertung Micro-Badge */}
          <div className="mb-5 sm:mb-6">
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJFzdPXqCpukcRi1fq6TYofgQ"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-canvas-card border border-ink-border hover:border-forest/40 text-xs text-ink shadow-subtle hover:shadow-elevated transition-all group"
              title="Google Rezension für Vollmer's Hofladen schreiben"
            >
              <span className="text-amber-500 text-xs font-semibold">★★★★★</span>
              <span className="font-medium text-xs text-ink">5.0 auf Google</span>
              <span className="text-[11px] text-forest font-semibold group-hover:underline flex items-center gap-1">
                Bewerten
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </a>
          </div>

          {/* Monumentale Typografie (Mobil perfekt ausbalanciert) */}
          <div className="max-w-4xl">
            <h1 className="font-serif text-[2.4rem] xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-ink leading-[1.08] tracking-tight">
              Frisch vom Hof. <br />
              <span className="italic font-normal text-forest block sm:inline">Echte Freilandhaltung</span>{' '}
              <span className="whitespace-nowrap">in Machtsum.</span>
            </h1>
            <p className="mt-5 sm:mt-8 text-base sm:text-xl text-ink-muted leading-relaxed max-w-2xl font-normal">
              Frische Freilandeier aus mobilen Hühnerställen, Duroc-Weideschweine und regionale Spezialitäten. Täglich rund um die Uhr in unserem 24/7 Selbstbedienungs-Hofladen in Machtsum.
            </p>

            {/* CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
              <HofladenHeroButton
                onClick={() => onNavigate('produkte')}
                text="Sortiment entdecken"
                subtext="24/7 Hofladen"
              />

              {/* Desktop & Mobil: Eier-Donnerstag CTA-Kachel */}
              <button
                type="button"
                onClick={() => onNavigate('eier-donnerstag')}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3.5 px-5 sm:px-6 py-3.5 h-[64px] sm:h-[68px] rounded-2xl bg-canvas-card border border-ink-border text-ink font-semibold text-sm hover:bg-canvas-muted hover:border-forest/50 transition-all shadow-subtle hover:shadow-elevated group text-left"
              >
                <div className="w-9 h-9 rounded-full bg-forest-tint border border-forest-border flex items-center justify-center text-forest group-hover:scale-110 transition-transform shrink-0">
                  <Egg className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-1.5">
                    <span>Machtsumer Eier-Donnerstag</span>
                    <ArrowRight className="w-3.5 h-3.5 text-forest group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <span className="text-[11px] font-normal text-ink-muted">
                    Jetzt anmelden • Lieferung an die Haustür
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Großformatiges Editorial-Bild: 24/7 Hofladen Innenansicht (Querformat) */}
          <div className="mt-10 sm:mt-16 md:mt-20 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-elevated border border-ink-border group">
            <img
              src={MEDIA.hofladenHeroLandscape}
              alt="Innenansicht von Vollmer's 24/7 Selbstbedienungs-Hofladen in Machtsum"
              className="w-full h-[260px] sm:h-[420px] md:h-[620px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            
            {/* Vollmer's Logo oben rechts im Hero-Bild (Transparent mit dezentem Schatten) */}
            <div className="absolute top-3.5 right-3.5 sm:top-8 sm:right-8 z-10 pointer-events-none">
              <img
                src={MEDIA.logoTransparent}
                alt="Vollmer's Hofladen"
                className="w-20 sm:w-36 md:w-44 h-auto object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* 3 Vertrauens-Säulen unter dem Hero: Edle, luftige Karten */}
          <div className="mt-10 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="group p-5 sm:p-6 rounded-2xl bg-canvas-card/85 backdrop-blur-xs border border-ink-border/80 hover:border-forest/40 hover:bg-canvas-card transition-all duration-300 shadow-subtle hover:shadow-elevated">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-forest-tint border border-forest-border flex items-center justify-center text-forest shrink-0 mb-3.5 sm:mb-4 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-semibold text-ink text-base">24/7 SB-Hofladen</h3>
              <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                Jederzeit flexibel einkaufen. An 7 Tagen die Woche, 24 Stunden durchgehend geöffnet.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-canvas-card/85 backdrop-blur-xs border border-ink-border/80 hover:border-forest/40 hover:bg-canvas-card transition-all duration-300 shadow-subtle hover:shadow-elevated">
              <div className="w-11 h-11 rounded-xl bg-forest-tint border border-forest-border flex items-center justify-center text-forest shrink-0 mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-semibold text-ink text-base">100 % Freilandhaltung</h3>
              <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                Mobilställe für Hühner und Weidehaltung für Duroc-Schweine. Echtes Tierwohl vor Ort sichtbar.
              </p>
            </div>

            <div className="group p-6 rounded-2xl bg-canvas-card/85 backdrop-blur-xs border border-ink-border/80 hover:border-forest/40 hover:bg-canvas-card transition-all duration-300 shadow-subtle hover:shadow-elevated">
              <div className="w-11 h-11 rounded-xl bg-forest-tint border border-forest-border flex items-center justify-center text-forest shrink-0 mb-4 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-semibold text-ink text-base">Echte Börde-Region</h3>
              <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                Familiengeführt in Machtsum. Kurze Transportwege, regionale Schlachterei und Partnerbetriebe.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ELEGANTER, ORGANISCHER BÖRDE-ÜBERGANG (Sanfte Konturkurve in die Hofladen-Sektion) */}
      <div className="relative w-full overflow-hidden leading-none pointer-events-none -mb-px bg-canvas">
        <svg
          viewBox="0 0 1440 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-8 sm:h-12 md:h-16 text-[#F4F1EA] block preserve-3d"
          preserveAspectRatio="none"
        >
          {/* Sanft geschwungene Hügelkontur der Börde-Landschaft */}
          <path
            d="M0,32 C360,64 720,8 1080,48 C1260,60 1380,42 1440,36 L1440,68 L0,68 Z"
            fill="currentColor"
          />
          {/* Feine, dezente Konturlinie */}
          <path
            d="M0,32 C360,64 720,8 1080,48 C1260,60 1380,42 1440,36"
            stroke="#E0DACB"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      </div>

      {/* 2. FREILANDHALTUNG ZUM ANFASSEN (Story-Section mit Asymmetrie) */}
      <section className="pt-8 sm:pt-12 pb-16 sm:pb-20 md:pb-28 bg-[#F4F1EA] border-b border-[#E6E1D4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Linke Seite: Text & Philosophie */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-forest">
                Respekt vor dem Tier
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.15]">
                Tiere auf der Wiese, nicht hinter Beton.
              </h2>
              <p className="text-ink-muted text-base md:text-lg leading-relaxed">
                Unsere Hühner und Duroc-Schweine leben unter freiem Himmel in mobilen Weideställen. Durch das regelmäßige Versetzen der Ställe finden sie immer frisches Grünland vor. Das schont die Grasnarbe, verhindert Krankheiten und sorgt für glückliche Tiere.
              </p>

              {/* Mobile Bilder-Raster (erscheint auf Mobilgeräten vor den Kacheln) */}
              <div className="lg:hidden grid grid-cols-2 gap-3 my-4">
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden border border-ink-border shadow-subtle aspect-[3/4]">
                    <img
                      src={MEDIA.henGoldenHour}
                      alt="Huhn im goldenen Abendlicht vor der Bockwindmühle"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-ink-border shadow-subtle aspect-square">
                    <img
                      src={MEDIA.durocGrazing}
                      alt="Duroc Freilandschwein im frischen Weidegras"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="rounded-2xl overflow-hidden border border-ink-border shadow-subtle aspect-square">
                    <img
                      src={MEDIA.henCloseup}
                      alt="Huhn Portrait mit rotem Kamm"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-ink-border shadow-subtle aspect-[3/4]">
                    <img
                      src={MEDIA.durocCurious}
                      alt="Duroc Schwein schaut in die Kamera"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-2">
                <div className="p-4 sm:p-5 rounded-2xl bg-canvas-card border border-ink-border">
                  <span className="text-2xl font-serif text-forest font-bold block">400</span>
                  <span className="font-semibold text-sm text-ink block mt-1">Freiland-Legehennen</span>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    Im mobilen Hühnerstall mit automatischen Toren, die abends vor Fressfeinden schützen.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-canvas-card border border-ink-border">
                  <span className="text-2xl font-serif text-forest font-bold block">150 kg</span>
                  <span className="font-semibold text-sm text-ink block mt-1">Duroc-Schweine</span>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    Langsame, stressfreie Mast mit Weizen, Gerste und Ackerbohnen aus eigenem Anbau.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('freilandhaltung')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-forest text-white text-sm font-medium hover:bg-forest-hover transition-colors shadow-subtle group"
                >
                  <span>Mehr über unsere Haltung erfahren</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>

            {/* Rechte Seite: Asymmetrische Bild-Komposition (nur Desktop) */}
            <div className="hidden lg:grid lg:col-span-6 grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-2xl overflow-hidden border border-ink-border shadow-subtle aspect-[3/4]">
                  <img
                    src={MEDIA.henGoldenHour}
                    alt="Huhn im goldenen Abendlicht vor der Bockwindmühle"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden border border-ink-border shadow-subtle aspect-square">
                  <img
                    src={MEDIA.durocGrazing}
                    alt="Duroc Freilandschwein im frischen Weidegras"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8">
                <div className="rounded-2xl overflow-hidden border border-ink-border shadow-subtle aspect-square">
                  <img
                    src={MEDIA.henCloseup}
                    alt="Huhn Portrait mit rotem Kamm"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden border border-ink-border shadow-subtle aspect-[3/4]">
                  <img
                    src={MEDIA.durocCurious}
                    alt="Duroc Schwein schaut in die Kamera"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. DAS SORTIMENT IM ÜBERBLICK (Editorial Cards) */}
      <section className="py-16 sm:py-20 md:py-28 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-4 sm:gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-forest">
                Erzeugnisse mit Herkunft
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink mt-2 sm:mt-3 leading-[1.15]">
                Vom Ei bis zum Weidefleisch: Qualität, die man schmeckt.
              </h2>
            </div>
            <button
              onClick={() => onNavigate('produkte')}
              className="inline-flex items-center gap-2 text-forest font-semibold text-sm hover:underline self-start md:self-auto"
            >
              <span>Alle 13 Hofladen-Produkte ansehen</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Große Highlight-Karten (Mobil im harmonischen 4/3 Verhältnis) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            
            {/* Card 1: Freilandeier */}
            <div className="group rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border overflow-hidden shadow-subtle hover:shadow-elevated transition-all flex flex-col">
              <div className="aspect-[4/3] sm:aspect-[3/4] overflow-hidden relative bg-[#F5F2EA]">
                <img
                  src={MEDIA.eggsTray}
                  alt="Frische Machtsumer Freilandeier im Hofladen"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-canvas-card/90 backdrop-blur-md text-forest font-semibold text-[11px] px-2.5 py-1 rounded-full border border-ink-border">
                  Täglich frisch
                </span>
                {getProductStock('freilandeier') && (
                  <span className="absolute top-3 right-3 bg-amber-600/95 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-subtle backdrop-blur-sm">
                    Ausverkauft
                  </span>
                )}
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-ink">Freilandeier</h3>
                  <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                    Aus unseren mobilen Hühnerställen. Größen M, L, XL und saisonal Größe S (1 kg Box).
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-ink-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-forest">10er Pack / 1 kg Box</span>
                  <span className="text-xs text-ink-faint">Im SB-Laden</span>
                </div>
              </div>
            </div>

            {/* Card 2: Nudeln */}
            <div className="group rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border overflow-hidden shadow-subtle hover:shadow-elevated transition-all flex flex-col">
              <div className="aspect-[4/3] sm:aspect-[3/4] overflow-hidden relative bg-[#F5F2EA]">
                <img
                  src={MEDIA.prodPastaSpirelli}
                  alt="Machtsumer Freiland-Spirelli Nudeln mit 35% Ei"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-canvas-card/90 backdrop-blur-md text-forest font-semibold text-[11px] px-2.5 py-1 rounded-full border border-ink-border">
                  35 % Hof-Eier
                </span>
                {getProductStock('spirelli-nudeln') && (
                  <span className="absolute top-3 right-3 bg-amber-600/95 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-subtle backdrop-blur-sm">
                    Ausverkauft
                  </span>
                )}
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-ink">Hof-Nudeln</h3>
                  <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                    In der Region Hannover mit unseren Freilandeiern und Hartweizengrieß traditionell hergestellt.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-ink-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-forest">500 g Beutel</span>
                  <span className="text-xs text-ink-faint">Im SB-Laden</span>
                </div>
              </div>
            </div>

            {/* Card 3: Duroc Schwein */}
            <div className="group rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border overflow-hidden shadow-subtle hover:shadow-elevated transition-all flex flex-col">
              <div className="aspect-[4/3] sm:aspect-[3/4] overflow-hidden relative bg-[#F5F2EA]">
                <img
                  src={MEDIA.durocGrazing}
                  alt="Duroc Schwein aus Freilandhaltung auf saftiger Wiese"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-canvas-card/90 backdrop-blur-md text-forest font-semibold text-[11px] px-2.5 py-1 rounded-full border border-ink-border">
                  Weidehaltung & Stroh
                </span>
                {getProductStock('duroc-schwein') && (
                  <span className="absolute top-3 right-3 bg-amber-600/95 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-subtle backdrop-blur-sm">
                    Ausverkauft
                  </span>
                )}
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-ink">Duroc-Freilandschwein</h3>
                  <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                    Besonders saftig & zart marmoriert. Wurst im Glas im SB-Laden, Frischfleisch auf Vorbestellung.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-ink-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-forest">Wurst & Frischfleisch</span>
                  <span className="text-xs text-ink-faint">Landschlachter Sehnde</span>
                </div>
              </div>
            </div>

            {/* Card 4: Eierlikör */}
            <div className="group rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border overflow-hidden shadow-subtle hover:shadow-elevated transition-all flex flex-col">
              <div className="aspect-[4/3] sm:aspect-[3/4] overflow-hidden relative bg-[#F5F2EA]">
                <img
                  src={MEDIA.prodEggLiqueur}
                  alt="Machtsumer Eierlikör in Klassisch und Schoko/Kaffee"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-canvas-card/90 backdrop-blur-md text-forest font-semibold text-[11px] px-2.5 py-1 rounded-full border border-ink-border">
                  Mit 25% Sahne
                </span>
                {getProductStock('eierlikoer') && (
                  <span className="absolute top-3 right-3 bg-amber-600/95 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-subtle backdrop-blur-sm">
                    Ausverkauft
                  </span>
                )}
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-ink">Eierlikör-Kreationen</h3>
                  <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                    Samtig-cremig gerührt im Eichsfeld in den Sorten Klassisch, Schoko und Kaffee. 14 % vol.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-ink-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-forest">0,35 l Flasche</span>
                  <span className="text-xs text-ink-faint">Online vorbestellbar</span>
                </div>
              </div>
            </div>

          </div>

          {/* Banner: Vorbestellung bei Friedhold */}
          <div className="mt-10 sm:mt-12 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-forest text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-elevated">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-xs uppercase tracking-widest text-emerald-300 font-semibold block">
                Frischfleisch & Geflügel
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white">
                Sichere dir frisches Weidefleisch an unseren Schlachttagen.
              </h3>
              <p className="text-white/80 text-sm max-w-xl">
                Bestelle Duroc-Teilstücke, Grillpakete, Weidehähnchen und Suppenhühner bequem über unser digitales Bestellportal vor.
              </p>
            </div>
            <a
              href="https://vollmers-hofladen.friedhold.de"
              target="_blank"
              rel="noreferrer noopener"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-forest hover:bg-white/90 text-sm font-semibold transition-all shrink-0 flex items-center justify-center gap-2 shadow-subtle active:scale-[0.99]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Zum Vorbestell-Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* 4. GOOGLE-BEWERTUNGEN TRUST-SECTION (Sichtbar & Schick) */}
      <section className="py-14 sm:py-20 md:py-24 bg-[#F4F1EA] border-t border-b border-[#E6E1D4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-amber-500 text-2xl mb-4 select-none">
            ★ ★ ★ ★ ★
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.15]">
            Zufrieden mit unserem Hofladen?
          </h2>
          <p className="text-ink-muted text-base sm:text-lg mt-3 max-w-xl mx-auto leading-relaxed">
            Als regionaler Familienbetrieb in Machtsum leben wir von echtem, transparentem Feedback. Wenn dir unsere Freilandeier und Erzeugnisse schmecken, freuen wir uns riesig über deine Bewertung auf Google!
          </p>
          <div className="mt-8 flex justify-center items-center">
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJFzdPXqCpukcRi1fq6TYofgQ"
              target="_blank"
              rel="noreferrer noopener"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-forest text-white text-sm font-semibold hover:bg-forest-hover shadow-subtle hover:shadow-elevated transition-all group"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Jetzt Google-Bewertung schreiben</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* 5. KURZPORTRAIT FAMILIE VOLLMER (Menschlichkeit & Börde-Heimat mit feststehendem Hintergrund) */}
      <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden bg-[#EFECE5]">
        {/* Hintergrundbild (Mobil mit bg-scroll zur Vermeidung von iOS Safari Bugs, ab Tablet sanft bg-fixed) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-scroll sm:bg-fixed opacity-30 pointer-events-none"
          style={{ backgroundImage: `url(${MEDIA.boerdeRootsBg})` }}
          aria-hidden="true"
        />

        {/* Sanfte Verläufe oben und unten zur harmonischen Einbettung */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#F4F1EA] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-5 sm:p-10 md:p-16 rounded-2xl sm:rounded-3xl bg-[#F5F2EA]/95 border border-ink-border/80 shadow-subtle backdrop-blur-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
              
              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden border border-ink-border shadow-elevated aspect-[4/3] sm:aspect-[3/4]">
                  <img
                    src={MEDIA.portraitFelix}
                    alt="Felix Vollmer und Partnerin vor der historischen Machtsumer Windmühle"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-forest">
                  Familienbetrieb Vollmer
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.15]">
                  Verwurzelt <span className="whitespace-nowrap">in Machtsum.</span> Seit Generationen in der Börde.
                </h2>
                <p className="text-ink-muted text-base sm:text-lg leading-relaxed">
                  „Landwirtschaft ist für uns kein anonymer Wirtschaftszweig, sondern gelebte Verantwortung für Boden, Tier und Nachbarschaft. Was 2017 mit einem selbstgezimmerten Hühnerstall begann, ist heute ein moderner Hofladen – getragen von echter Leidenschaft.“
                </p>
                <div className="pt-1">
                  <span className="font-semibold text-ink text-base block">Felix Vollmer</span>
                  <span className="text-xs text-ink-faint block">Landwirt & Gründer von Vollmer’s Hofladen</span>
                </div>
                <div>
                  <button
                    onClick={() => onNavigate('ueber-uns')}
                    className="inline-flex items-center gap-2 text-forest font-semibold text-sm hover:underline"
                  >
                    <span>Unsere ganze Entstehungsgeschichte lesen</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. BEHOLD INSTAGRAM FEED (Neueste 6 Posts von @vollmers_hofladen) */}
      <BeholdInstagramFeed feedId="" />

      {/* 7. ANFAHRT & KONTAKT-TEASER */}
      <section className="py-16 sm:py-20 md:py-28 bg-canvas">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-forest">
            Besuche uns vor Ort
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink mt-2 sm:mt-3 leading-[1.15]">
            Frische Eier und mehr – <span className="whitespace-nowrap">24/7 in Machtsum.</span>
          </h2>
          <p className="text-ink-muted text-base sm:text-lg mt-3 sm:mt-4 leading-relaxed">
            Du findest unseren Hofladen in der <strong>Lindenallee 24, 31177 Harsum (Ortsteil Machtsum)</strong>. Parkplätze direkt auf dem Hof vorhanden.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3.5 sm:gap-4">
            <button
              onClick={() => onNavigate('kontakt')}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-forest text-white font-medium text-sm hover:bg-forest-hover transition-colors shadow-subtle flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <MapPin className="w-4 h-4" />
              <span>Anfahrtskarte & Details</span>
            </button>
            <a
              href="tel:017621006452"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-canvas-card border border-ink-border text-ink font-medium text-sm hover:bg-canvas-muted transition-colors flex items-center justify-center gap-2"
            >
              <span>Fragen? 0176 21006452</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
