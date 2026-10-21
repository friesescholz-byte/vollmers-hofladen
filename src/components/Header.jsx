import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, Clock, MapPin, Phone, ChevronRight, ChevronDown, Egg, Calendar } from 'lucide-react';
import { MEDIA } from '../data/media';

export default function Header({ currentPage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 35);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAboutDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
  };

  const isAboutActive = currentPage === 'ueber-uns' || currentPage === 'freilandhaltung';

  const getBtnClass = (isActive) =>
    `px-3.5 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-1.5 ${
      isActive
        ? 'text-forest bg-forest-tint/90 font-semibold'
        : isScrolled
        ? 'text-ink-muted hover:text-ink hover:bg-canvas-muted'
        : 'text-ink/85 hover:text-forest hover:bg-canvas-card/60 backdrop-blur-xs'
    }`;

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
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            <button
              onClick={() => handleNavClick('home')}
              className={getBtnClass(currentPage === 'home')}
            >
              <span>Startseite</span>
            </button>

            <button
              onClick={() => handleNavClick('produkte')}
              className={getBtnClass(currentPage === 'produkte')}
            >
              <span>Sortiment</span>
            </button>

            {/* Eier-Donnerstag mit schickem Eier-Icon */}
            <button
              onClick={() => handleNavClick('eier-donnerstag')}
              className={getBtnClass(currentPage === 'eier-donnerstag')}
            >
              <Egg className="w-4 h-4 text-forest stroke-[1.75] shrink-0" />
              <span>Eier-Donnerstag</span>
            </button>

            {/* Termine & Märkte */}
            <button
              onClick={() => handleNavClick('termine')}
              className={getBtnClass(currentPage === 'termine')}
            >
              <span>Termine</span>
            </button>

            {/* Über uns Dropdown (inkl. Freilandhaltung) */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setAboutDropdownOpen((prev) => !prev)}
                className={getBtnClass(isAboutActive)}
              >
                <span>Über uns</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    aboutDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {aboutDropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-60 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-1.5 rounded-2xl bg-canvas-card border border-ink-border shadow-elevated space-y-1">
                    <button
                      onClick={() => handleNavClick('ueber-uns')}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        currentPage === 'ueber-uns'
                          ? 'bg-forest text-white'
                          : 'text-ink hover:bg-canvas-muted'
                      }`}
                    >
                      <div>
                        <span className="block text-sm">Über uns & Historie</span>
                        <span className={`text-[11px] font-normal ${currentPage === 'ueber-uns' ? 'text-white/80' : 'text-ink-muted'}`}>
                          Familie Vollmer & Hofgeschichte
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    </button>

                    <button
                      onClick={() => handleNavClick('freilandhaltung')}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        currentPage === 'freilandhaltung'
                          ? 'bg-forest text-white'
                          : 'text-ink hover:bg-canvas-muted'
                      }`}
                    >
                      <div>
                        <span className="block text-sm">Freilandhaltung</span>
                        <span className={`text-[11px] font-normal ${currentPage === 'freilandhaltung' ? 'text-white/80' : 'text-ink-muted'}`}>
                          Hühnermobil & Duroc-Weide
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('kontakt')}
              className={getBtnClass(currentPage === 'kontakt')}
            >
              <span>Kontakt & Anfahrt</span>
            </button>
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

            {/* Mobile Menu Button */}
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 bg-ink/40 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-50 lg:hidden bg-[#FBF9F5] border-b border-ink-border px-4 sm:px-6 pt-3 pb-6 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleNavClick('home')}
                className={`flex items-center justify-between p-3.5 rounded-2xl text-left text-base font-semibold transition-all shadow-subtle ${
                  currentPage === 'home'
                    ? 'bg-forest text-white'
                    : 'bg-white text-ink border border-ink-border/80 hover:border-forest/40 hover:bg-[#F5F2EA]'
                }`}
              >
                <span>Startseite</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>

              <button
                onClick={() => handleNavClick('produkte')}
                className={`flex items-center justify-between p-3.5 rounded-2xl text-left text-base font-semibold transition-all shadow-subtle ${
                  currentPage === 'produkte'
                    ? 'bg-forest text-white'
                    : 'bg-white text-ink border border-ink-border/80 hover:border-forest/40 hover:bg-[#F5F2EA]'
                }`}
              >
                <span>Sortiment & Hofladen</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>

              <button
                onClick={() => handleNavClick('eier-donnerstag')}
                className={`flex items-center justify-between p-3.5 rounded-2xl text-left text-base font-semibold transition-all shadow-subtle ${
                  currentPage === 'eier-donnerstag'
                    ? 'bg-forest text-white'
                    : 'bg-white text-ink border border-ink-border/80 hover:border-forest/40 hover:bg-[#F5F2EA]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Egg className={`w-4 h-4 ${currentPage === 'eier-donnerstag' ? 'text-emerald-300' : 'text-forest'}`} />
                  <span>Eier-Donnerstag</span>
                </span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>

              <button
                onClick={() => handleNavClick('termine')}
                className={`flex items-center justify-between p-3.5 rounded-2xl text-left text-base font-semibold transition-all shadow-subtle ${
                  currentPage === 'termine'
                    ? 'bg-forest text-white'
                    : 'bg-white text-ink border border-ink-border/80 hover:border-forest/40 hover:bg-[#F5F2EA]'
                }`}
              >
                <span>Termine & Märkte</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>

              {/* Über uns Akkordeon (mit Freilandhaltung als Unterpunkt) */}
              <div className="rounded-2xl bg-white border border-ink-border/80 overflow-hidden shadow-subtle">
                <button
                  type="button"
                  onClick={() => setMobileAboutOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between p-3.5 text-left text-base font-semibold transition-colors ${
                    isAboutActive ? 'text-forest' : 'text-ink'
                  }`}
                >
                  <span>Über uns</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${mobileAboutOpen || isAboutActive ? 'rotate-180' : ''}`}
                  />
                </button>
                {(mobileAboutOpen || isAboutActive) && (
                  <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-ink-border/50 bg-[#FBF9F5]">
                    <button
                      onClick={() => handleNavClick('ueber-uns')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                        currentPage === 'ueber-uns'
                          ? 'bg-forest text-white'
                          : 'text-ink hover:bg-canvas-muted'
                      }`}
                    >
                      <span>Über uns & Hofhistorie</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                    <button
                      onClick={() => handleNavClick('freilandhaltung')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                        currentPage === 'freilandhaltung'
                          ? 'bg-forest text-white'
                          : 'text-ink hover:bg-canvas-muted'
                      }`}
                    >
                      <span>Freilandhaltung & Tierwohl</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick('kontakt')}
                className={`flex items-center justify-between p-3.5 rounded-2xl text-left text-base font-semibold transition-all shadow-subtle ${
                  currentPage === 'kontakt'
                    ? 'bg-forest text-white'
                    : 'bg-white text-ink border border-ink-border/80 hover:border-forest/40 hover:bg-[#F5F2EA]'
                }`}
              >
                <span>Kontakt & Anfahrt</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>

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
