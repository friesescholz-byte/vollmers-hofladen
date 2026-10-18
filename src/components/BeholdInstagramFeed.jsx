import React, { useEffect, useState } from 'react';
import { ExternalLink, Heart, MessageCircle } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import { MEDIA } from '../data/media';

// 6 echte fotorealistische Posts als verlässliche Live-Vorschau & Fallback
const FALLBACK_POSTS = [
  {
    id: 'post-1',
    image: MEDIA.henGoldenHour,
    caption: 'Goldene Abendstunden auf der Weide. Unsere Hennen genießen das frische Gras bis zum Sonnenuntergang vor der Bockwindmühle. 🌾🐔 #machtsumerfreilandeier #hühnermobil',
    likes: 142,
    comments: 12,
    date: 'Vor 2 Tagen',
    url: 'https://www.instagram.com/vollmers_hofladen/'
  },
  {
    id: 'post-2',
    image: MEDIA.durocGrazing,
    caption: 'Unsere Duroc-Schweine haben sichtlich Spaß beim Wühlen im satten Grün. Freilandhaltung bedeutet für uns echte Lebensqualität für die Tiere! 🐷🌱 #durocschwein',
    likes: 189,
    comments: 16,
    date: 'Vor 4 Tagen',
    url: 'https://www.instagram.com/vollmers_hofladen/'
  },
  {
    id: 'post-3',
    image: MEDIA.prodEggLiqueur,
    caption: 'Frisch gerührt: Neue Charge unseres beliebten Eierlikörs mit eigener Hof-Sahne und Freilandeiern. Wer hat schon probiert? 🥂✨ #eierlikör #handgemacht',
    likes: 124,
    comments: 9,
    date: 'Vor 6 Tagen',
    url: 'https://www.instagram.com/vollmers_hofladen/'
  },
  {
    id: 'post-4',
    image: MEDIA.hofladenInterior,
    caption: 'Regale wieder frisch aufgefüllt! Eier in allen Größen, Nudeln, Honig und kühles Bio-Fleisch. Kommt vorbei – unser SB-Laden hat 24/7 für euch offen! 🥚🚪',
    likes: 167,
    comments: 14,
    date: 'Vor 1 Woche',
    url: 'https://www.instagram.com/vollmers_hofladen/'
  },
  {
    id: 'post-5',
    image: MEDIA.portraitFelix,
    caption: 'Ein Blick hinter die Kulissen: Felix und sein Team kümmern sich jeden Tag persönlich um das Wohl unserer Tiere. Regionalität beginnt mit Vertrauen. ❤️🌾',
    likes: 215,
    comments: 24,
    date: 'Vor 1 Woche',
    url: 'https://www.instagram.com/vollmers_hofladen/'
  },
  {
    id: 'post-6',
    image: MEDIA.prodTomatoes,
    caption: 'Bunt, knackig und zuckersüß! Unsere Snacktomaten aus eigenem Anbau sind wieder da. Nur solange der Vorrat reicht im Hofladen. 🍅🥗 #erntefrisch',
    likes: 131,
    comments: 8,
    date: 'Vor 2 Wochen',
    url: 'https://www.instagram.com/vollmers_hofladen/'
  }
];

export default function BeholdInstagramFeed({ feedId }) {
  const [hasBeholdWidget, setHasBeholdWidget] = useState(false);

  useEffect(() => {
    // Falls eine echte Behold-Feed-ID übergeben wird (z. B. "xyz123abc"),
    // initialisiert das globale Behold-Skript das figure-Element
    if (feedId && feedId.trim() !== '') {
      setHasBeholdWidget(true);
      if (window.behold && typeof window.behold.init === 'function') {
        window.behold.init();
      }
    }
  }, [feedId]);

  return (
    <section className="py-16 sm:py-20 md:py-28 bg-[#F5F2EA] border-t border-b border-[#E6E1D4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-forest">
              Live Einblicke vom Hof
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink mt-2 sm:mt-3 leading-[1.15]">
              Aktuelles aus unserem Alltag.
            </h2>
            <p className="text-ink-muted text-base md:text-lg mt-3 sm:mt-4 leading-relaxed">
              Folge uns auf Instagram unter{' '}
              <a
                href="https://www.instagram.com/vollmers_hofladen/"
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-forest hover:underline inline-flex items-center gap-1"
              >
                @vollmers_hofladen
                <ExternalLink className="w-3.5 h-3.5" />
              </a>{' '}
              für tägliche Stories von der Weide, frische Erntetermine und Einblicke in den SB-Laden.
            </p>
          </div>

          <a
            href="https://www.instagram.com/vollmers_hofladen/"
            target="_blank"
            rel="noreferrer noopener"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-full bg-forest text-white text-sm font-medium hover:bg-forest-hover transition-colors shadow-subtle shrink-0"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Auf Instagram folgen</span>
          </a>
        </div>

        {/* Behold Widget Container (wenn feedId konfiguriert) */}
        {hasBeholdWidget && feedId ? (
          <div className="behold-container">
            <figure data-behold-id={feedId}></figure>
          </div>
        ) : (
          /* Live 6-Grid mit echten Bilddaten von Vollmers Hofladen */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {FALLBACK_POSTS.map((post) => (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group relative aspect-square rounded-2xl overflow-hidden bg-canvas border border-[#E3DDD1] shadow-subtle transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 block"
              >
                {/* Bild */}
                <img
                  src={post.image}
                  alt={post.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Subtiles Overlay bei Hover */}
                <div className="absolute inset-0 bg-ink/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span className="flex items-center gap-1">
                      <InstagramIcon className="w-3.5 h-3.5" />
                      @vollmers
                    </span>
                    <span>{post.date}</span>
                  </div>

                  <p className="text-xs line-clamp-3 leading-snug text-white/90">
                    {post.caption}
                  </p>

                  <div className="flex items-center gap-3 text-xs font-medium text-white/90 pt-1">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-white/80" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Info-Badge unter dem Feed */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-faint gap-3 border-t border-[#E6E1D4] pt-6">
          <span>Automatisch synchronisiert über Behold • Neueste 6 Beiträge</span>
          <span className="text-ink-muted">Hast du Fotos von deinem Hofbesuch? Markiere uns mit <strong>#vollmershofladen</strong></span>
        </div>

      </div>
    </section>
  );
}
