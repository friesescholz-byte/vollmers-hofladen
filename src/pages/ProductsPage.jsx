import React, { useState } from 'react';
import { ShoppingBag, ExternalLink, Info, Check, Sparkles, Filter, X, XCircle } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { MEDIA } from '../data/media';
import { useProducts } from '../context/ProductContext';

export default function ProductsPage({ selectedProductFromSearch }) {
  const { products } = useProducts();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeProductModal, setActiveProductModal] = useState(selectedProductFromSearch || null);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="py-10 sm:py-16 md:py-20 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-10 sm:mb-14 md:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-forest">
            Unser Hofladen-Sortiment
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-ink mt-2 sm:mt-3 leading-[1.15]">
            Ehrliche Erzeugnisse aus eigener Freilandhaltung.
          </h1>
          <p className="text-ink-muted text-base md:text-lg mt-3 sm:mt-4 leading-relaxed">
            Ob täglich frische Freilandeier, hausgemachte Nudeln, saftiges Duroc-Fleisch oder handverlesene Spezialitäten unserer regionalen Partner – in unserem 24/7 SB-Hofladen in Machtsum findest du Qualität mit Gesicht.
          </p>
        </div>

        {/* Kategorien Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-10 no-scrollbar touch-pan-x">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-forest text-white shadow-subtle'
                    : 'bg-canvas-card border border-ink-border text-ink-muted hover:text-ink hover:bg-canvas-muted'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Produkte Grid (Auf Mobilgeräten mit augenfreundlicherem 4/3 Bildausschnitt) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="group rounded-2xl sm:rounded-3xl bg-canvas-card border border-ink-border overflow-hidden shadow-subtle hover:shadow-elevated transition-all flex flex-col cursor-pointer"
              onClick={() => setActiveProductModal(product)}
            >
              {/* Bild */}
              <div className="aspect-[4/3] sm:aspect-[3/4] overflow-hidden relative bg-[#F5F2EA]">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
                    product.isOutOfStock ? 'opacity-75 grayscale-[25%]' : ''
                  }`}
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-canvas-card/90 backdrop-blur-md text-forest font-semibold text-[11px] px-2.5 py-1 rounded-full border border-ink-border shadow-subtle">
                    {product.badge}
                  </span>
                )}
                {product.isOutOfStock && (
                  <span className="absolute top-3 right-3 bg-amber-600/95 text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-subtle flex items-center gap-1 backdrop-blur-sm">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Zurzeit vergriffen</span>
                  </span>
                )}
              </div>

              {/* Text */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-2xl text-ink group-hover:text-forest transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-xs text-ink-muted mt-2 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-ink-border flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-forest block">
                      {product.price}
                    </span>
                    <span className="text-[11px] text-ink-faint block">
                      {product.unit}
                    </span>
                  </div>

                  <span className="text-xs font-medium text-ink-muted group-hover:text-forest flex items-center gap-1 transition-colors">
                    <span>Details</span>
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Friedhold Online-Shop Banner */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-forest text-white shadow-elevated flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-xs uppercase tracking-widest text-emerald-300 font-semibold block">
              Frischfleisch & Schlachttage
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white">
              Online vorbestellen & frisch abholen.
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Duroc-Frischfleisch, Bratwürste, Weidehähnchen und Eierlikör kannst du ganz einfach über unser digitales Bestellportal vorbestellen. So garantieren wir maximale Frische und null Lebensmittelverschwendung.
            </p>
          </div>

          <a
            href="https://vollmers-hofladen.friedhold.de"
            target="_blank"
            rel="noreferrer noopener"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white text-forest hover:bg-white/90 font-semibold text-sm transition-all shadow-subtle shrink-0 flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Friedhold Vorbestellung öffnen</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* FAQ zum Einkauf im SB-Hofladen */}
        <div className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-ink-border">
          <h2 className="font-serif text-2xl sm:text-3xl text-ink text-center mb-8 sm:mb-10">
            Häufige Fragen zum Hofladen-Einkauf
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-canvas-card border border-ink-border space-y-2">
              <h4 className="font-semibold text-ink text-sm">Wie funktioniert die Bezahlung?</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Unser Hofladen basiert auf Vertrauensbasis. Du suchst dir deine Produkte aus, rechnest anhand der Preistafel zusammen und wirfst den Betrag in bar in unsere Kasse.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-canvas-card border border-ink-border space-y-2">
              <h4 className="font-semibold text-ink text-sm">Wann ist der Hofladen geöffnet?</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Rund um die Uhr, an 7 Tagen die Woche (24/7). Du kannst morgens vor der Arbeit oder sonntags zum Kuchenbacken spontan vorbeikommen.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-canvas-card border border-ink-border space-y-2">
              <h4 className="font-semibold text-ink text-sm">Wie bleibt das Fleisch frisch?</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Im Hofladen steht eine Kühltruhe für vakuumierte Spezialitäten und Wurstgläser bereit. Größere Frischfleischmengen werden an Schlachttagen zur Abholung bereitgestellt.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Produkt-Detail Modal (Auf Mobilgeräten platzsparend & sofort lesbar) */}
      {activeProductModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setActiveProductModal(null)}
        >
          <div 
            className="w-full max-w-xl bg-canvas-card rounded-2xl sm:rounded-3xl shadow-elevated border border-ink-border overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-52 sm:h-80 md:h-96 bg-[#F5F2EA] flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={activeProductModal.image}
                alt={activeProductModal.name}
                className="w-full h-full object-contain p-4"
              />
              <button
                onClick={() => setActiveProductModal(null)}
                className="absolute top-3.5 right-3.5 p-2 rounded-full bg-ink/70 text-white hover:bg-ink transition-colors shadow-subtle z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-8 space-y-4 sm:space-y-5 overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-forest block">
                    {activeProductModal.badge}
                  </span>
                  <h3 className="font-serif text-3xl text-ink mt-1">
                    {activeProductModal.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-forest block">
                    {activeProductModal.price}
                  </span>
                  <span className="text-xs text-ink-faint">
                    {activeProductModal.unit}
                  </span>
                </div>
              </div>

              {activeProductModal.isOutOfStock && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Dieses Produkt ist im 24/7 Hofladen zurzeit leider ausverkauft. Wir füllen das Regal schnellstmöglich wieder auf!</span>
                </div>
              )}

              <p className="text-sm text-ink-muted leading-relaxed">
                {activeProductModal.description}
              </p>

              {/* Details & Besonderheiten */}
              <div className="space-y-2 pt-2 border-t border-ink-border">
                <span className="text-xs font-semibold text-ink uppercase tracking-wider block">
                  Besonderheiten:
                </span>
                <ul className="space-y-1.5 text-xs text-ink-muted">
                  {activeProductModal.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-canvas-muted border border-ink-border flex items-center justify-between text-xs">
                <span className="text-ink-muted">Verfügbarkeit:</span>
                <span className="font-semibold text-forest">
                  {activeProductModal.availability}
                </span>
              </div>

              {activeProductModal.preorderUrl && (
                <a
                  href={activeProductModal.preorderUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-hover transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Jetzt online vorbestellen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
