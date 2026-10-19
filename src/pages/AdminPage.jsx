import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, LogOut, Plus, Edit2, Trash2, CheckCircle2, 
  XCircle, Upload, AlertCircle, ArrowLeft, Loader2, Sparkles, 
  Search, Eye, ExternalLink, Image as ImageIcon, Save, RefreshCw
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { CATEGORIES } from '../data/products';

// SHA-256 Hash für das Weymann-Architektur-Sicherheitsprinzip (Passwort: Vollmer2026!Admin)
const ADMIN_HASH = "c2f10cc1feec3662f28e52e0d7558b49bbb8403f4e86e81b58bdc3a99d77be70";

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminPage({ onNavigate }) {
  const { products, loading, source, saveProductsToKV, refreshProducts } = useProducts();

  const [sessionToken, setSessionToken] = useState(() => {
    return sessionStorage.getItem('vollmer_admin_token') || null;
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal State (Edit / Create)
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [modalForm, setModalForm] = useState({
    id: '',
    name: '',
    category: 'eier-nudeln',
    price: '',
    unit: '',
    badge: '',
    description: '',
    details: '',
    availability: 'Stets im 24/7 SB-Hofladen vorrätig',
    image: '',
    isOutOfStock: false,
    preorderUrl: ''
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // 1. Weymann-Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      // Client-seitige kryptografische Hash-Prüfung
      const inputHash = await sha256(passwordInput);
      if (inputHash !== ADMIN_HASH) {
        setLoginError('Ungültiges Passwort. Zugriff verweigert.');
        setLoginLoading(false);
        return;
      }

      // Server-seitige Verifizierung gegen Worker / API
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const token = data.token || 'vollmer_session_' + Date.now();
        sessionStorage.setItem('vollmer_admin_token', token);
        setSessionToken(token);
        setPasswordInput('');
        showToast('Erfolgreich angemeldet.');
      } else {
        setLoginError(data.error || 'Server-Authentifizierung fehlgeschlagen.');
      }
    } catch (err) {
      // Fallback bei Offline-Betrieb (Hash bereits geprüft)
      const token = 'vollmer_session_' + Date.now();
      sessionStorage.setItem('vollmer_admin_token', token);
      setSessionToken(token);
      setPasswordInput('');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('vollmer_admin_token');
    setSessionToken(null);
  };

  // 2. Schneller Toggle "Ausverkauft" / "Verfügbar"
  const handleToggleStock = async (product) => {
    const updated = products.map(p => {
      if (p.id === product.id) {
        return {
          ...p,
          isOutOfStock: !p.isOutOfStock,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    try {
      await saveProductsToKV(updated, sessionToken);
      showToast(`Status für „${product.name}“ auf ${!product.isOutOfStock ? 'AUSVERKAUFT' : 'VERFÜGBAR'} gesetzt.`);
    } catch (err) {
      alert('Fehler beim Aktualisieren: ' + err.message);
    }
  };

  // 3. Modal öffnen (Bearbeiten oder Neu)
  const openEditModal = (product) => {
    setIsCreatingNew(false);
    setEditingProduct(product);
    setModalForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      unit: product.unit || '',
      badge: product.badge || '',
      description: product.description || '',
      details: Array.isArray(product.details) ? product.details.join('\n') : (product.details || ''),
      availability: product.availability || '',
      image: product.image || '',
      isOutOfStock: !!product.isOutOfStock,
      preorderUrl: product.preorderUrl || ''
    });
  };

  const openCreateModal = () => {
    setIsCreatingNew(true);
    const newId = 'produkt_' + Date.now().toString(36);
    setEditingProduct({ id: newId });
    setModalForm({
      id: newId,
      name: '',
      category: 'eier-nudeln',
      price: '',
      unit: '',
      badge: '',
      description: '',
      details: '',
      availability: 'Stets im 24/7 SB-Hofladen vorrätig',
      image: '',
      isOutOfStock: false,
      preorderUrl: ''
    });
  };

  // Client-seitige Bildkomprimierung (max 1600px, WebP Qualität 0.82)
  const compressImage = (file, maxWidth = 1600, quality = 0.82) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Bilddatei ist fehlerhaft oder konnte nicht geöffnet werden.'));
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(e.target.result);
          }
          ctx.drawImage(img, 0, 0, width, height);

          try {
            let dataUrl = canvas.toDataURL('image/webp', quality);
            if (!dataUrl.startsWith('data:image/webp')) {
              dataUrl = canvas.toDataURL('image/jpeg', quality);
            }
            resolve(dataUrl);
          } catch (err) {
            resolve(e.target.result);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // 4. Direkt-Upload nach Cloudflare R2 mit Fallback
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);

    try {
      showToast('Bild wird optimiert und hochgeladen...');
      const compressedBase64 = await compressImage(file, 1600, 0.82);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          filename: file.name,
          base64: compressedBase64
        })
      });

      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.warn('Nicht-JSON Antwort beim Upload:', text.slice(0, 100));
      }

      if (res.ok && data?.success && data?.url) {
        setModalForm(prev => ({ ...prev, image: data.url }));
        showToast('Bild erfolgreich hochgeladen!');
      } else if (!res.ok && (res.status === 405 || res.status === 500 || res.status === 404)) {
        // Fallback: Bei Backend-Verbindungsproblemen direkt das optimierte Bild lokal hinterlegen
        setModalForm(prev => ({ ...prev, image: compressedBase64 }));
        showToast('Bild übernommen (lokales Backup verwendet).');
      } else {
        alert('Upload-Fehler: ' + (data?.error || `HTTP ${res.status}`));
      }
    } catch (err) {
      console.error('Fehler beim Upload:', err);
      alert('Upload fehlgeschlagen: ' + err.message);
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // 5. Änderungen speichern (in Cloudflare KV)
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!modalForm.name || !modalForm.price) {
      alert('Bitte Produktname und Preis angeben.');
      return;
    }

    setIsSaving(true);

    const detailsArray = modalForm.details
      ? modalForm.details.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    let updatedProducts;
    if (isCreatingNew) {
      const newProd = {
        ...modalForm,
        details: detailsArray,
        updatedAt: new Date().toISOString()
      };
      updatedProducts = [newProd, ...products];
    } else {
      updatedProducts = products.map(p => {
        if (p.id === modalForm.id) {
          return {
            ...p,
            ...modalForm,
            details: detailsArray,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });
    }

    try {
      await saveProductsToKV(updatedProducts, sessionToken);
      showToast(isCreatingNew ? 'Neues Produkt angelegt!' : 'Produkt erfolgreich aktualisiert!');
      setEditingProduct(null);
    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 6. Produkt löschen
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Möchtest du „${product.name}“ wirklich löschen?`)) {
      return;
    }

    const updated = products.filter(p => p.id !== product.id);
    try {
      await saveProductsToKV(updated, sessionToken);
      showToast(`„${product.name}“ wurde gelöscht.`);
    } catch (err) {
      alert('Fehler beim Löschen: ' + err.message);
    }
  };

  // Filtered Products
  const visibleProducts = products.filter(p => {
    const matchesCat = filterCategory === 'all' || p.category === filterCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // =========================================================================
  // VIEW A: LOGIN SCREEN (Weymann-Prinzip)
  // =========================================================================
  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-canvas-card rounded-3xl p-6 sm:p-10 border border-ink-border shadow-elevated">
          
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-forest-tint border border-forest-border flex items-center justify-center mx-auto text-forest mb-3.5 sm:mb-4 shadow-subtle">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-forest block mb-1">
              Geschützter Bereich
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-ink">
              Vollmer’s Hofladen Admin
            </h1>
            <p className="text-xs text-ink-muted mt-1.5 sm:mt-2">
              Verwaltung von Sortiment, Preisen, Ausverkauft-Status und Bildern
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Admin-Passwort
              </label>
              <input
                type="password"
                required
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Passwort eingeben..."
                className="w-full px-4 py-3.5 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm placeholder:text-ink-faint focus:outline-none focus:border-forest"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading || !passwordInput}
              className="w-full py-3.5 sm:py-4 rounded-xl bg-forest text-white font-semibold text-sm hover:bg-forest-hover transition-colors shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Prüfe Zugangsdaten...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Anmelden</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 pt-6 border-t border-ink-border text-center">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-forest transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Zurück zur Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: DASHBOARD / PRODUCT MANAGER
  // =========================================================================
  const outOfStockCount = products.filter(p => p.isOutOfStock).length;
  const inStockCount = products.length - outOfStockCount;

  return (
    <div className="min-h-screen bg-canvas text-ink py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-forest text-white text-sm font-semibold shadow-elevated flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-ink-border">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="p-2 rounded-xl bg-canvas-card border border-ink-border text-ink-muted hover:text-ink transition-colors shrink-0"
                title="Zur Website zurückkehren"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink">
                Hofladen Sortimentsverwaltung
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={refreshProducts}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-canvas-card border border-ink-border text-xs font-semibold text-ink-muted hover:text-ink transition-colors flex items-center justify-center gap-2"
              title="Daten neu laden"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Aktualisieren</span>
            </button>

            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors shadow-subtle flex items-center justify-center gap-2 order-first sm:order-none"
            >
              <Plus className="w-4 h-4" />
              <span>Neues Produkt anlegen</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-canvas-card border border-ink-border text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
              title="Abmelden"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-canvas-card border border-ink-border shadow-subtle">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block">
              Gesamtes Sortiment
            </span>
            <span className="font-serif text-2xl sm:text-3xl text-ink font-bold block mt-1">
              {products.length} Artikel
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-canvas-card border border-ink-border shadow-subtle">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
              Aktuell Verfügbar
            </span>
            <span className="font-serif text-2xl sm:text-3xl text-emerald-800 font-bold block mt-1">
              {inStockCount} Artikel
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-canvas-card border border-ink-border shadow-subtle">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
              Als Ausverkauft markiert
            </span>
            <span className="font-serif text-2xl sm:text-3xl text-amber-800 font-bold block mt-1">
              {outOfStockCount} Artikel
            </span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 sm:p-4 rounded-2xl bg-canvas-card border border-ink-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Produkt suchen..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-canvas border border-ink-border text-base sm:text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-forest"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar touch-scroll pb-1 sm:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  filterCategory === cat.id
                    ? 'bg-forest text-white'
                    : 'bg-canvas text-ink-muted hover:text-ink border border-ink-border/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProducts.map(product => (
            <div 
              key={product.id}
              className={`rounded-3xl bg-canvas-card border overflow-hidden shadow-subtle flex flex-col transition-all ${
                product.isOutOfStock 
                  ? 'border-amber-300/80 bg-amber-50/20' 
                  : 'border-ink-border'
              }`}
            >
              {/* Image & Status Badge */}
              <div className="aspect-[16/10] sm:aspect-[4/3] relative overflow-hidden bg-[#F5F2EA]">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform ${product.isOutOfStock ? 'opacity-70 grayscale-[30%]' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-ink-faint">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs">Kein Bild hinterlegt</span>
                  </div>
                )}

                {/* Stock Status Badge */}
                <div className="absolute top-3 left-3">
                  {product.isOutOfStock ? (
                    <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-[11px] font-bold shadow-subtle flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Ausverkauft</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-bold shadow-subtle flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verfügbar</span>
                    </span>
                  )}
                </div>

                {product.badge && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-canvas-card/90 backdrop-blur-sm text-forest font-semibold text-[10px] border border-ink-border">
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Info Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 sm:space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-lg sm:text-xl text-ink font-semibold leading-snug">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-xs text-ink-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {product.description || 'Keine Beschreibung hinterlegt.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-ink-border/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-forest text-sm block">{product.price}</span>
                    <span className="text-ink-faint">{product.unit || 'Standard'}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-canvas text-ink-muted text-[11px] border border-ink-border/60">
                    {CATEGORIES.find(c => c.id === product.category)?.label || product.category}
                  </span>
                </div>

                {/* Actions: Quick Stock Toggle & Edit */}
                <div className="pt-2 border-t border-ink-border/60 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStock(product)}
                    className={`flex-1 min-h-[42px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      product.isOutOfStock
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                    }`}
                  >
                    {product.isOutOfStock ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Auf Verfügbar setzen</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Als Ausverkauft markieren</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(product)}
                    className="w-10 h-10 shrink-0 rounded-xl bg-canvas hover:bg-canvas-muted text-ink border border-ink-border transition-colors flex items-center justify-center"
                    title="Produkt bearbeiten & Bild tauschen"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(product)}
                    className="w-10 h-10 shrink-0 rounded-xl bg-canvas hover:bg-red-50 text-red-600 border border-ink-border transition-colors flex items-center justify-center"
                    title="Produkt löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Modal: Produkt bearbeiten / neu anlegen */}
        {editingProduct && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setEditingProduct(null)}
          >
            <div 
              className="w-full max-w-2xl bg-canvas-card rounded-3xl shadow-2xl border border-ink-border overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-ink-border bg-canvas flex items-center justify-between">
                <h3 className="font-serif text-xl sm:text-2xl text-ink">
                  {isCreatingNew ? 'Neues Produkt anlegen' : 'Produkt bearbeiten'}
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas-subtle"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* Name */}
                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                    Produktname *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.name}
                    onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    placeholder="z.B. Machtsumer Freilandeier"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm focus:outline-none focus:border-forest"
                  />
                </div>

                {/* Kategorie & Preis & Einheit */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Kategorie *
                    </label>
                    <select
                      value={modalForm.category}
                      onChange={(e) => setModalForm({ ...modalForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm focus:outline-none focus:border-forest"
                    >
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Preis *
                    </label>
                    <input
                      type="text"
                      required
                      value={modalForm.price}
                      onChange={(e) => setModalForm({ ...modalForm, price: e.target.value })}
                      placeholder="z.B. 3,80 €"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm focus:outline-none focus:border-forest"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Einheit / Packung
                    </label>
                    <input
                      type="text"
                      value={modalForm.unit}
                      onChange={(e) => setModalForm({ ...modalForm, unit: e.target.value })}
                      placeholder="z.B. 500 g Beutel"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                {/* Badge & Verfügbarkeitstext */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Badge / Tag (optional)
                    </label>
                    <input
                      type="text"
                      value={modalForm.badge}
                      onChange={(e) => setModalForm({ ...modalForm, badge: e.target.value })}
                      placeholder="z.B. Bestseller, 35% Ei"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm focus:outline-none focus:border-forest"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Verfügbarkeitshinweis
                    </label>
                    <input
                      type="text"
                      value={modalForm.availability}
                      onChange={(e) => setModalForm({ ...modalForm, availability: e.target.value })}
                      placeholder="Stets im 24/7 SB-Hofladen vorrätig"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                {/* Status Toggle: Ausverkauft */}
                <div className="p-3.5 rounded-2xl bg-canvas border border-ink-border flex items-center justify-between">
                  <div>
                    <strong className="text-ink text-sm block">Bestandsstatus</strong>
                    <span className="text-ink-muted text-xs">
                      {modalForm.isOutOfStock ? 'Dieses Produkt wird als „Ausverkauft“ gekennzeichnet.' : 'Dieses Produkt ist regulär im Hofladen verfügbar.'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalForm.isOutOfStock}
                      onChange={(e) => setModalForm({ ...modalForm, isOutOfStock: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-emerald-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {/* Direkt-Upload Bild über Cloudflare R2 Pipeline */}
                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Produktbild (Direkter Upload in Cloudflare R2)
                  </label>
                  
                  <div className="p-4 rounded-2xl bg-canvas border border-ink-border space-y-3">
                    {modalForm.image ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={modalForm.image}
                          alt="Vorschau"
                          className="w-20 h-20 rounded-xl object-cover border border-ink-border shadow-subtle shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] text-ink-muted block truncate font-mono">
                            {modalForm.image}
                          </span>
                          <span className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>In Cloudflare R2 gespeichert</span>
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
                      <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors shadow-subtle inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Wird hochgeladen...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Neues Bild vom Gerät hochladen</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingImage}
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Beschreibung */}
                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                    Produktbeschreibung
                  </label>
                  <textarea
                    rows={3}
                    value={modalForm.description}
                    onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                    placeholder="Ausführliche Beschreibung des Produkts..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-sm focus:outline-none focus:border-forest resize-none"
                  ></textarea>
                </div>

                {/* Highlights / Details (eine Zeile = ein Bullet Point) */}
                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                    Detail-Stichpunkte (jede Zeile ein Aufzählungspunkt)
                  </label>
                  <textarea
                    rows={3}
                    value={modalForm.details}
                    onChange={(e) => setModalForm({ ...modalForm, details: e.target.value })}
                    placeholder="100% gentechnikfreie Fütterung&#10;Aus eigener Schlachtung&#10;..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-base sm:text-xs focus:outline-none focus:border-forest font-mono resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-ink-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink-muted text-xs font-semibold hover:bg-canvas-muted text-center"
                  >
                    Abbrechen
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors shadow-subtle flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Wird gespeichert...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Produkt speichern</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
