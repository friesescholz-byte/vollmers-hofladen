import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Clock, MapPin, Phone, ChevronRight } from 'lucide-react';
import { MEDIA } from '../data/media';

export default function Header({ currentPage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 35);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Startseite' },
    { id: 'produkte', label: 'Produkte & Hofladen' },
    { id: 'freilandhaltung', label: 'Freilandhaltung' },
    { id: 'ueber-uns', label: 'Über uns' },
    { id: 'kontakt', label: 'Kontakt & Anfahrt' },
  ];

  const handleNavClick = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        mobileMenuOpen
          ? 'bg-[#FBF9F5] border-b border-ink-border shadow-elevated'
          : isScrolled
          ? 'bg-canvas/92 backdrop-blur-md border-b border-ink-border/80 shadow-subtle'
          : 'bg-transparent border-b border-transparent shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ease-out ${
            isScrolled ? 'h-16' : 'h-18 sm:h-22'
          }`}
        >
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center group text-left focus:outline-none py-1"
            aria-label="Vollmer's Hofladen Startseite"
          >
            <img
              src={MEDIA.logoTransparent}
              alt="Vollmer's Hofladen"
              className={`w-auto object-contain transition-all duration-300 ease-out group-hover:scale-105 ${
                isScrolled ? 'h-9 sm:h-11 max-h-11' : 'h-11 sm:h-14 md:h-16 max-h-16'
              }`}
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-forest bg-forest-tint/90 font-semibold'
                      : isScrolled
                      ? 'text-ink-muted hover:text-ink hover:bg-canvas-muted'
                      : 'text-ink/85 hover:text-forest hover:bg-canvas-card/60 backdrop-blur-xs'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Aktionen (Rechts): Vorbestell-Button & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Online-Shop / Vorbestellung */}
            <a
              href="https://vollmers-hofladen.friedhold.de"
              target="_blank"
              rel="noreferrer noopener"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-all shadow-subtle hover:shadow-elevated"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
              <span>Vorbestellen</span>
            </a>

            {/* Mobile Menu Button (Kräftiger Kontrast & sofort erkennbar) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2.5 rounded-xl transition-all border shadow-subtle ${
                mobileMenuOpen
                  ? 'bg-forest text-white border-forest'
                  : 'text-ink bg-white/95 hover:bg-white border-ink-border hover:border-forest/60'
              }`}
              aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[2.25]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2.25]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (100% blickdicht, kontraststark & perfekt lesbar) */}
      {mobileMenuOpen && (
        <>
          {/* Abdunkelnder Backdrop für maximalen Lesekontrast */}
          <div
            className="fixed inset-0 top-16 bg-ink/40 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-50 lg:hidden bg-[#FBF9F5] border-b border-ink-border px-4 sm:px-6 pt-3 pb-6 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl text-left text-base font-semibold transition-all shadow-subtle ${
                      isActive
                        ? 'bg-forest text-white'
                        : 'bg-white text-ink border border-ink-border/80 hover:border-forest/40 hover:bg-[#F5F2EA]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-ink-faint" />
                    )}
                  </button>
                );
              })}

              <div className="pt-3 border-t border-ink-border space-y-2.5">
                <a
                  href="https://vollmers-hofladen.friedhold.de"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-forest text-white font-semibold text-sm shadow-subtle active:scale-[0.99] transition-transform"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Online-Shop & Vorbestellung</span>
                </a>

                {/* Mobile Schnellkontakt */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:017621006452"
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-white border border-ink-border text-ink text-xs font-semibold hover:bg-canvas-muted shadow-subtle"
                  >
                    <Phone className="w-4 h-4 text-forest" />
                    <span>Anrufen</span>
                  </a>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Lindenallee+24+31177+Harsum"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-white border border-ink-border text-ink text-xs font-semibold hover:bg-canvas-muted shadow-subtle"
                  >
                    <MapPin className="w-4 h-4 text-forest" />
                    <span>Route (Maps)</span>
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-ink-border text-xs text-ink-muted flex items-center gap-2.5 shadow-subtle">
                  <Clock className="w-4 h-4 text-forest shrink-0" />
                  <span>SB-Hofladen in Machtsum hat <strong>24/7 durchgehend geöffnet</strong></span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
