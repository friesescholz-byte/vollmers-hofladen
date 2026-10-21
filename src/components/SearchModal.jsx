import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Package, Compass, MapPin } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

export default function SearchModal({ isOpen, onClose, onNavigate, onSelectProduct }) {
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const normalized = query.trim().toLowerCase();

  const matchingProducts = normalized
    ? products.filter(p =>
        p.name.toLowerCase().includes(normalized) ||
        (p.description && p.description.toLowerCase().includes(normalized)) ||
        (p.badge && p.badge.toLowerCase().includes(normalized))
      )
    : [];

  const quickPages = [
    { title: 'Sortiment & Hofladen', page: 'produkte', desc: 'Eier, Nudeln, Duroc, Honig und mehr' },
    { title: 'Eier-Donnerstag', page: 'eier-donnerstag', desc: 'Haustür-Lieferung donnerstags in der Region' },
    { title: 'Termine & Märkte', page: 'termine', desc: 'Weihnachtsmarkt am Sültenpaul & Marktstände' },
    { title: 'Freilandhaltung', page: 'freilandhaltung', desc: 'Mobilstall für Hühner & Duroc-Weide' },
    { title: 'Über uns', page: 'ueber-uns', desc: 'Familie Vollmer, Chronologie & Windmühle' },
    { title: 'Kontakt & 24/7 Hofladen', page: 'kontakt', desc: 'Lindenallee 24, Machtsum • Anfahrt' },
  ].filter(p =>
    !normalized ||
    p.title.toLowerCase().includes(normalized) ||
    p.desc.toLowerCase().includes(normalized)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24 px-3 sm:px-4 bg-ink/50 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-2xl bg-canvas-card rounded-2xl shadow-elevated border border-ink-border overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-ink-border bg-canvas">
          <Search className="w-5 h-5 text-ink-faint mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Produkt, Seite oder Thema suchen (z. B. Eier, Duroc, Öffnungszeiten)..."
            className="w-full bg-transparent text-ink placeholder:text-ink-faint text-base focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-ink-faint hover:text-ink"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-ink-faint bg-canvas-subtle border border-ink-border rounded">
              ESC
            </kbd>
          )}
          <button
            onClick={onClose}
            className="ml-2 p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas-subtle"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Matching Products */}
          {matchingProducts.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint px-2 block mb-2">
                Produkte ({matchingProducts.length})
              </span>
              <div className="space-y-1">
                {matchingProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => {
                      onNavigate('produkte');
                      if (onSelectProduct) onSelectProduct(product);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-canvas-muted text-left transition-colors group"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-11 h-11 rounded-lg object-cover border border-ink-border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-ink group-hover:text-forest transition-colors truncate">
                          {product.name}
                        </span>
                        {product.unit && (
                          <span className="text-xs font-medium text-forest ml-2 shrink-0">
                            {product.unit}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted truncate mt-0.5">
                        {product.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink-faint group-hover:text-forest group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Pages */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint px-2 block mb-2">
              Seiten & Bereiche
            </span>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {quickPages.map(item => (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    onClose();
                  }}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-canvas-muted text-left transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-canvas border border-ink-border text-forest shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-ink group-hover:text-forest transition-colors block">
                      {item.title}
                    </span>
                    <span className="text-xs text-ink-muted block mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick info if nothing found */}
          {normalized && matchingProducts.length === 0 && quickPages.length === 0 && (
            <div className="py-8 text-center text-ink-muted text-sm">
              Keine passenden Einträge für „{query}“ gefunden. Versuche es mit Begriffen wie <em>Eier</em>, <em>Nudeln</em>, <em>Duroc</em> oder <em>Öffnungszeiten</em>.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-canvas border-t border-ink-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] sm:text-xs text-ink-faint">
          <span>Hofladen Lindenallee 24, Machtsum</span>
          <span className="flex items-center gap-1.5 text-forest font-medium">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse"></span>
            24/7 Selbstbedienung geöffnet
          </span>
        </div>
      </div>
    </div>
  );
}
