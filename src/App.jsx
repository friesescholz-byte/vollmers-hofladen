import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import LegalModal from './components/LegalModal';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import EggThursdayPage from './pages/EggThursdayPage';
import EventsPage from './pages/EventsPage';
import FreeRangePage from './pages/FreeRangePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';

import { ProductProvider } from './context/ProductContext';

const VALID_PAGES = [
  'produkte',
  'eier-donnerstag',
  'termine',
  'freilandhaltung',
  'ueber-uns',
  'kontakt',
  'admin',
];

export default function App() {
  // Sync state with URL hash & path
  const getInitialPage = () => {
    if (window.location.pathname === '/admin') {
      return 'admin';
    }
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (VALID_PAGES.includes(hash)) {
      return hash;
    }
    return 'home';
  };

  const getInitialLegal = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (['impressum', 'datenschutz', 'barrierefreiheit'].includes(hash)) {
      return hash;
    }
    return null;
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState(getInitialLegal);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['impressum', 'datenschutz', 'barrierefreiheit'].includes(hash)) {
        setLegalModalType(hash);
        return;
      }
      if (VALID_PAGES.includes(hash)) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (pageId) => {
    setCurrentPage(pageId);
    if (pageId === 'home') {
      window.history.pushState(null, '', ' ');
    } else {
      window.location.hash = pageId;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  return (
    <ProductProvider>
      <div className="min-h-screen flex flex-col bg-canvas text-ink overflow-x-hidden w-full">
        
        {/* Header (nur auf öffentlichen Seiten anzeigen, im Adminbereich ausgeblendet) */}
        {currentPage !== 'admin' && (
          <Header
            currentPage={currentPage}
            onNavigate={navigateTo}
          />
        )}

        {/* Main Pages: Auf Unterseiten passender Abstand zum fixierten Header */}
        <main className={`flex-1 ${currentPage === 'home' || currentPage === 'admin' ? '' : 'pt-16 sm:pt-20'}`}>
          {currentPage === 'home' && (
            <HomePage
              onNavigate={navigateTo}
              onSelectProduct={handleSelectProduct}
            />
          )}
          {currentPage === 'produkte' && (
            <ProductsPage
              selectedProductFromSearch={selectedProduct}
            />
          )}
          {currentPage === 'eier-donnerstag' && (
            <EggThursdayPage
              onNavigate={navigateTo}
            />
          )}
          {currentPage === 'termine' && (
            <EventsPage
              onNavigate={navigateTo}
            />
          )}
          {currentPage === 'freilandhaltung' && (
            <FreeRangePage
              onNavigate={navigateTo}
            />
          )}
          {currentPage === 'ueber-uns' && (
            <AboutPage
              onNavigate={navigateTo}
            />
          )}
          {currentPage === 'kontakt' && (
            <ContactPage />
          )}
          {currentPage === 'admin' && (
            <AdminPage
              onNavigate={navigateTo}
            />
          )}
        </main>

        {/* Footer (nur auf öffentlichen Seiten anzeigen) */}
        {currentPage !== 'admin' && (
          <Footer
            onNavigate={navigateTo}
            onOpenLegal={(type) => setLegalModalType(type)}
          />
        )}

        {/* Globale Lupe / Such-Modal (Regel 9) */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={navigateTo}
          onSelectProduct={handleSelectProduct}
        />

        {/* Impressum, Datenschutz & Barrierefreiheit Modal */}
        <LegalModal
          isOpen={!!legalModalType}
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      </div>
    </ProductProvider>
  );
}
