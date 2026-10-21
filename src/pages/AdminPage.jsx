import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Lock, LogOut, Plus, Edit2, Trash2, CheckCircle2,
  XCircle, Upload, AlertCircle, ArrowLeft, Loader2,
  Search, Image as ImageIcon, Save, RefreshCw, Egg, Calendar, MapPin, Clock, Mail, MessageSquare, Package
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { CATEGORIES } from '../data/products';
import { PLACEHOLDER_EVENT_IMAGE } from '../data/events';

// SHA-256 Hash für das Weymann-Architektur-Sicherheitsprinzip (Passwort: Vollmer2026!Admin)
const ADMIN_HASH = "c2f10cc1feec3662f28e52e0d7558b49bbb8403f4e86e81b58bdc3a99d77be70";

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminPage({ onNavigate }) {
  const {
    products,
    events,
    saveProductsToKV,
    saveEventsToKV,
    refreshProducts,
    refreshEvents,
  } = useProducts();

  const [sessionToken, setSessionToken] = useState(() => {
    return sessionStorage.getItem('vollmer_admin_token') || null;
  });

  const [activeTab, setActiveTab] = useState('sortiment'); // 'sortiment' | 'eier-donnerstag' | 'termine'

  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Filter & Search (Sortiment)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal State: Produkte
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [modalForm, setModalForm] = useState({
    id: '',
    name: '',
    category: 'eier-nudeln',
    unit: '',
    badge: '',
    description: '',
    details: '',
    availability: 'Stets im 24/7 SB-Hofladen vorrätig',
    image: '',
    isOutOfStock: false,
    preorderUrl: ''
  });

  // State: Eier-Donnerstag
  const [eggOrders, setEggOrders] = useState([]);
  const [eggLoading, setEggLoading] = useState(false);
  const [editingEggOrder, setEditingEggOrder] = useState(null);
  const [isCreatingEggOrder, setIsCreatingEggOrder] = useState(false);
  const [eggForm, setEggForm] = useState({
    id: '',
    name: '',
    address: '',
    email: '',
    eggCount: 10,
    message: '',
  });

  // State: Termine & Märkte
  const [editingEvent, setEditingEvent] = useState(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    id: '',
    title: '',
    date: '',
    time: '',
    location: '',
    badge: 'Unser Marktstand vor Ort',
    description: '',
    image: '',
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Eier-Donnerstag Liste laden
  const fetchEggOrders = async (tokenOverride) => {
    const token = tokenOverride || sessionToken;
    if (!token) return;
    setEggLoading(true);
    try {
      const res = await fetch('/api/admin/eier-donnerstag', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.orders && Array.isArray(data.orders)) {
          setEggOrders(data.orders);
          try {
            localStorage.setItem('vollmers_egg_orders', JSON.stringify(data.orders));
          } catch (e) {}
          setEggLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Fehler beim Laden der Eier-Donnerstag Liste:', err);
    }

    try {
      const local = JSON.parse(localStorage.getItem('vollmers_egg_orders') || '[]');
      if (Array.isArray(local)) setEggOrders(local);
    } catch (e) {}
    setEggLoading(false);
  };

  useEffect(() => {
    if (sessionToken) {
      fetchEggOrders(sessionToken);
    }
  }, [sessionToken]);

  const saveEggOrders = async (updatedOrders) => {
    try {
      localStorage.setItem('vollmers_egg_orders', JSON.stringify(updatedOrders));
    } catch (e) {}

    const res = await fetch('/api/admin/eier-donnerstag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ orders: updatedOrders }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || 'Konnte Eier-Donnerstag Liste nicht speichern.');
    }
    setEggOrders(updatedOrders);
  };

  // 1. Weymann-Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const inputHash = await sha256(passwordInput);
      if (inputHash !== ADMIN_HASH) {
        setLoginError('Ungültiges Passwort. Zugriff verweigert.');
        setLoginLoading(false);
        return;
      }

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
          if (!ctx) return resolve(e.target.result);
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

  // Universeller Bild-Upload (für Produkte & Termine)
  const handleImageUploadFor = async (e, targetType = 'product') => {
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
      } catch (parseErr) {}

      const finalUrl = (res.ok && data?.success && data?.url) ? data.url : compressedBase64;
      if (targetType === 'event') {
        setEventForm(prev => ({ ...prev, image: finalUrl }));
      } else {
        setModalForm(prev => ({ ...prev, image: finalUrl }));
      }
      showToast('Bild erfolgreich hinterlegt!');
    } catch (err) {
      alert('Upload fehlgeschlagen: ' + err.message);
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // =========================================================================
  // LOGIK A: SORTIMENT
  // =========================================================================
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

  const openEditModal = (product) => {
    setIsCreatingNew(false);
    setEditingProduct(product);
    setModalForm({
      id: product.id,
      name: product.name,
      category: product.category,
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

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!modalForm.name) {
      alert('Bitte Produktname angeben.');
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
          const { price, ...restProduct } = p;
          return {
            ...restProduct,
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

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Möchtest du „${product.name}“ wirklich löschen?`)) return;
    const updated = products.filter(p => p.id !== product.id);
    try {
      await saveProductsToKV(updated, sessionToken);
      showToast(`„${product.name}“ wurde gelöscht.`);
    } catch (err) {
      alert('Fehler beim Löschen: ' + err.message);
    }
  };

  // =========================================================================
  // LOGIK B: EIER-DONNERSTAG
  // =========================================================================
  const openCreateEggOrder = () => {
    setIsCreatingEggOrder(true);
    const newId = 'egg_' + Date.now().toString(36);
    setEditingEggOrder({ id: newId });
    setEggForm({
      id: newId,
      name: '',
      address: '',
      email: '',
      eggCount: 10,
      message: '',
    });
  };

  const openEditEggOrder = (order) => {
    setIsCreatingEggOrder(false);
    setEditingEggOrder(order);
    setEggForm({
      id: order.id,
      name: order.name || '',
      address: order.address || '',
      email: order.email || '',
      eggCount: order.eggCount || 10,
      message: order.message || '',
    });
  };

  const handleSaveEggOrder = async (e) => {
    e.preventDefault();
    if (!eggForm.name.trim() || !eggForm.address.trim() || !eggForm.eggCount) {
      alert('Bitte Name, Adresse und Eieranzahl angeben.');
      return;
    }

    setIsSaving(true);
    const cleanAddress = eggForm.address.trim().toLowerCase().includes('machtsum')
      ? eggForm.address.trim()
      : `${eggForm.address.trim()}, 31177 Machtsum`;

    const normalizedEntry = {
      ...eggForm,
      name: eggForm.name.trim(),
      address: cleanAddress,
      email: eggForm.email.trim(),
      eggCount: Number(eggForm.eggCount) || eggForm.eggCount,
      message: eggForm.message.trim(),
      createdAt: editingEggOrder?.createdAt || new Date().toISOString(),
    };

    const updated = isCreatingEggOrder
      ? [normalizedEntry, ...eggOrders]
      : eggOrders.map(o => (o.id === normalizedEntry.id ? normalizedEntry : o));

    try {
      await saveEggOrders(updated);
      showToast(isCreatingEggOrder ? 'Eintrag zum Eier-Donnerstag hinzugefügt!' : 'Eintrag aktualisiert!');
      setEditingEggOrder(null);
    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEggOrder = async (order) => {
    if (!window.confirm(`Eintrag von „${order.name}“ wirklich aus dem Eier-Donnerstag entfernen?`)) return;
    const updated = eggOrders.filter(o => o.id !== order.id);
    try {
      await saveEggOrders(updated);
      showToast(`Eintrag von „${order.name}“ entfernt.`);
    } catch (err) {
      alert('Fehler beim Löschen: ' + err.message);
    }
  };

  // =========================================================================
  // LOGIK C: TERMINE & MÄRKTE
  // =========================================================================
  const openCreateEvent = () => {
    setIsCreatingEvent(true);
    const newId = 'termin_' + Date.now().toString(36);
    setEditingEvent({ id: newId });
    setEventForm({
      id: newId,
      title: '',
      date: '2026-12-13',
      time: 'Ab 14:00 Uhr',
      location: '',
      badge: 'Unser Marktstand vor Ort',
      description: '',
      image: '',
    });
  };

  const openEditEvent = (ev) => {
    setIsCreatingEvent(false);
    setEditingEvent(ev);
    setEventForm({
      id: ev.id,
      title: ev.title || '',
      date: ev.date || '',
      time: ev.time || '',
      location: ev.location || '',
      badge: ev.badge || '',
      description: ev.description || '',
      image: ev.image || '',
    });
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.date.trim() || !eventForm.location.trim()) {
      alert('Bitte Titel, Datum und Ort des Termins angeben.');
      return;
    }

    setIsSaving(true);
    const entry = {
      ...eventForm,
      title: eventForm.title.trim(),
      date: eventForm.date.trim(),
      time: eventForm.time.trim(),
      location: eventForm.location.trim(),
      badge: eventForm.badge.trim(),
      description: eventForm.description.trim(),
      image: eventForm.image.trim(),
    };

    const updated = isCreatingEvent
      ? [...events, entry]
      : events.map(ev => (ev.id === entry.id ? entry : ev));

    try {
      await saveEventsToKV(updated, sessionToken);
      showToast(isCreatingEvent ? 'Neuer Termin eingetragen!' : 'Termin aktualisiert!');
      setEditingEvent(null);
    } catch (err) {
      alert('Fehler beim Speichern des Termins: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (ev) => {
    if (!window.confirm(`Möchtest du den Termin „${ev.title}“ wirklich löschen?`)) return;
    const updated = events.filter(item => item.id !== ev.id);
    try {
      await saveEventsToKV(updated, sessionToken);
      showToast(`Termin „${ev.title}“ gelöscht.`);
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
              Verwaltung von Sortiment, Eier-Donnerstag und Marktterminen
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
  // VIEW B: DASHBOARD
  // =========================================================================
  const outOfStockCount = products.filter(p => p.isOutOfStock).length;
  const inStockCount = products.length - outOfStockCount;
  const totalEggCount = eggOrders.reduce((sum, o) => sum + (Number(o.eggCount) || 0), 0);

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 rounded-xl bg-canvas-card border border-ink-border text-ink-muted hover:text-ink transition-colors shrink-0"
              title="Zur Website zurückkehren"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink">
                Vollmer’s Hofladen Verwaltung
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                refreshProducts();
                refreshEvents();
                fetchEggOrders();
                showToast('Daten aktualisiert.');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-canvas-card border border-ink-border text-xs font-semibold text-ink-muted hover:text-ink transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Aktualisieren</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl bg-canvas-card border border-ink-border text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>

        {/* Reiter / Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex p-1.5 rounded-2xl bg-canvas-card border border-ink-border shadow-subtle gap-1 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('sortiment')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'sortiment'
                  ? 'bg-forest text-white shadow-subtle'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Sortiment ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('eier-donnerstag')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'eier-donnerstag'
                  ? 'bg-forest text-white shadow-subtle'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <Egg className="w-4 h-4" />
              <span>Eier-Donnerstag ({eggOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('termine')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'termine'
                  ? 'bg-forest text-white shadow-subtle'
                  : 'text-ink-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Termine & Märkte ({events.length})</span>
            </button>
          </div>

          {/* Kontext-Button rechts je nach Tab */}
          {activeTab === 'sortiment' && (
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors shadow-subtle flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Neues Produkt anlegen</span>
            </button>
          )}

          {activeTab === 'eier-donnerstag' && (
            <button
              onClick={openCreateEggOrder}
              className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors shadow-subtle flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Eintrag für Eier-Donnerstag hinzufügen</span>
            </button>
          )}

          {activeTab === 'termine' && (
            <button
              onClick={openCreateEvent}
              className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors shadow-subtle flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Neuen Markt / Termin eintragen</span>
            </button>
          )}
        </div>

        {/* =====================================================================
            TAB 1: SORTIMENT
        ===================================================================== */}
        {activeTab === 'sortiment' && (
          <div className="space-y-6">
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

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 sm:space-y-4">
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl text-ink font-semibold leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-ink-muted mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description || 'Keine Beschreibung hinterlegt.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-ink-border/60 flex items-center justify-between text-xs gap-2">
                      <span className="font-medium text-forest truncate">{product.unit || 'Standard'}</span>
                      <span className="px-2.5 py-1 rounded-lg bg-canvas text-ink-muted text-[11px] border border-ink-border/60 shrink-0">
                        {CATEGORIES.find(c => c.id === product.category)?.label || product.category}
                      </span>
                    </div>

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
                        title="Produkt bearbeiten"
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
          </div>
        )}

        {/* =====================================================================
            TAB 2: EIER-DONNERSTAG (Kompakte & übersichtliche Liste)
        ===================================================================== */}
        {activeTab === 'eier-donnerstag' && (
          <div className="space-y-6">
            {/* Kurz-Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-canvas-card border border-ink-border shadow-subtle">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block">
                  Eingetragene Haushalte
                </span>
                <span className="font-serif text-2xl sm:text-3xl text-ink font-bold block mt-1">
                  {eggOrders.length} {eggOrders.length === 1 ? 'Haushalt' : 'Haushalte'}
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-canvas-card border border-ink-border shadow-subtle">
                <span className="text-xs font-semibold text-forest uppercase tracking-wider block">
                  Gesamtmenge Eier (Donnerstag)
                </span>
                <span className="font-serif text-2xl sm:text-3xl text-forest font-bold block mt-1">
                  {totalEggCount} Eier
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-canvas-card border border-ink-border shadow-subtle">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block">
                  Liefergebiet & Abrechnung
                </span>
                <span className="font-serif text-xl sm:text-2xl text-ink font-bold block mt-1">
                  31177 Machtsum • Bar
                </span>
              </div>
            </div>

            {/* Kompakte Übersichtstabelle / Liste */}
            <div className="rounded-3xl bg-canvas-card border border-ink-border shadow-subtle overflow-hidden">
              <div className="px-5 py-4 border-b border-ink-border bg-canvas flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-ink">
                    Teilnehmerliste Eier-Donnerstag
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Alle eingetragenen Lieferadressen in Machtsum mit Eieranzahl, E-Mail und Nachricht
                  </p>
                </div>
              </div>

              {eggLoading ? (
                <div className="p-10 text-center text-ink-muted text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Lade Einträge...</span>
                </div>
              ) : eggOrders.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <Egg className="w-8 h-8 text-forest mx-auto stroke-[1.5]" />
                  <p className="text-sm text-ink-muted">
                    Noch keine Anmeldungen für den Eier-Donnerstag vorhanden.
                  </p>
                  <button
                    onClick={openCreateEggOrder}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ersten Eintrag manuell anlegen</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-ink-border/70">
                  {/* Tabellenkopf (Desktop) */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-canvas-muted text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    <div className="col-span-3">Name & E-Mail</div>
                    <div className="col-span-3">Adresse (Machtsum)</div>
                    <div className="col-span-2">Anzahl Eier</div>
                    <div className="col-span-3">Nachricht / Hinweis</div>
                    <div className="col-span-1 text-right">Aktion</div>
                  </div>

                  {eggOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 sm:px-6 sm:py-3.5 hover:bg-canvas/60 transition-colors grid grid-cols-1 lg:grid-cols-12 gap-2.5 lg:gap-4 items-center text-xs"
                    >
                      {/* Name & E-Mail */}
                      <div className="lg:col-span-3 min-w-0">
                        <strong className="text-sm text-ink font-semibold block truncate">
                          {order.name}
                        </strong>
                        {order.email && (
                          <a
                            href={`mailto:${order.email}`}
                            className="text-ink-muted hover:text-forest truncate flex items-center gap-1 mt-0.5"
                          >
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{order.email}</span>
                          </a>
                        )}
                      </div>

                      {/* Adresse */}
                      <div className="lg:col-span-3 flex items-center gap-1.5 text-ink font-medium">
                        <MapPin className="w-3.5 h-3.5 text-forest shrink-0" />
                        <span className="truncate">{order.address}</span>
                      </div>

                      {/* Anzahl Eier */}
                      <div className="lg:col-span-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-tint border border-forest-border text-forest font-bold text-xs">
                          <Egg className="w-3.5 h-3.5" />
                          <span>{order.eggCount} Eier</span>
                        </span>
                      </div>

                      {/* Nachricht */}
                      <div className="lg:col-span-3 text-ink-muted">
                        {order.message ? (
                          <p className="line-clamp-2 leading-snug bg-canvas px-2.5 py-1.5 rounded-lg border border-ink-border/60">
                            {order.message}
                          </p>
                        ) : (
                          <span className="text-ink-faint italic">—</span>
                        )}
                      </div>

                      {/* Aktionen */}
                      <div className="lg:col-span-1 flex items-center justify-end gap-1.5 pt-2 lg:pt-0">
                        <button
                          onClick={() => openEditEggOrder(order)}
                          className="p-2 rounded-lg bg-canvas hover:bg-canvas-muted text-ink border border-ink-border transition-colors"
                          title="Eintrag bearbeiten"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEggOrder(order)}
                          className="p-2 rounded-lg bg-canvas hover:bg-red-50 text-red-600 border border-ink-border transition-colors"
                          title="Eintrag löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: TERMINE & MÄRKTE
        ===================================================================== */}
        {activeTab === 'termine' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((ev) => {
                const hasCustomImg = Boolean(ev.image && ev.image.trim());
                return (
                  <div
                    key={ev.id}
                    className="rounded-3xl bg-canvas-card border border-ink-border shadow-subtle overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/9] bg-[#F5F2EA] relative overflow-hidden flex items-center justify-center border-b border-ink-border/60">
                        {hasCustomImg ? (
                          <img
                            src={ev.image}
                            alt={ev.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center">
                            <img
                              src={PLACEHOLDER_EVENT_IMAGE}
                              alt="Vollmer's Logo Platzhalter"
                              className="h-24 w-auto object-contain"
                            />
                            <span className="text-[11px] text-ink-muted mt-2">
                              Standard-Platzhalter (Vollmer’s Logo)
                            </span>
                          </div>
                        )}
                        {ev.badge && (
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-canvas-card/95 text-forest text-[11px] font-semibold border border-ink-border">
                            {ev.badge}
                          </span>
                        )}
                      </div>

                      <div className="p-5 sm:p-6 space-y-3">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-forest">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{ev.date}</span>
                          </span>
                          {ev.time && (
                            <span className="flex items-center gap-1 text-ink-muted">
                              <Clock className="w-3.5 h-3.5 text-forest" />
                              <span>{ev.time}</span>
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif text-2xl text-ink">{ev.title}</h3>

                        <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium">
                          <MapPin className="w-3.5 h-3.5 text-forest shrink-0" />
                          <span>{ev.location}</span>
                        </div>

                        {ev.description && (
                          <p className="text-xs text-ink-muted leading-relaxed pt-2 border-t border-ink-border/60 line-clamp-3">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-5 py-3.5 bg-canvas border-t border-ink-border flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditEvent(ev)}
                        className="px-3.5 py-2 rounded-xl bg-canvas-card hover:bg-canvas-muted text-ink border border-ink-border text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Bearbeiten</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev)}
                        className="px-3.5 py-2 rounded-xl bg-canvas-card hover:bg-red-50 text-red-600 border border-ink-border text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Löschen</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL 1: PRODUKT BEARBEITEN / NEU
        ===================================================================== */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Produktbild
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
                          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Bild hinterlegt</span>
                          </span>
                        </div>
                      </div>
                    ) : null}

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
                        onChange={(e) => handleImageUploadFor(e, 'product')}
                      />
                    </label>
                  </div>
                </div>

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

                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                    Detail-Stichpunkte (jede Zeile ein Aufzählungspunkt)
                  </label>
                  <textarea
                    rows={3}
                    value={modalForm.details}
                    onChange={(e) => setModalForm({ ...modalForm, details: e.target.value })}
                    placeholder="100% gentechnikfreie Fütterung&#10;Aus eigener Haltung..."
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
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Produkt speichern</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL 2: EIER-DONNERSTAG EINTRAG HINZUFÜGEN / BEARBEITEN
        ===================================================================== */}
        {editingEggOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setEditingEggOrder(null)}
          >
            <div
              className="w-full max-w-lg bg-canvas-card rounded-3xl shadow-2xl border border-ink-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-ink-border bg-canvas flex items-center justify-between">
                <h3 className="font-serif text-xl sm:text-2xl text-ink">
                  {isCreatingEggOrder ? 'Eier-Donnerstag Eintrag hinzufügen' : 'Eintrag bearbeiten'}
                </h3>
                <button
                  onClick={() => setEditingEggOrder(null)}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ink"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEggOrder} className="p-5 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={eggForm.name}
                    onChange={(e) => setEggForm({ ...eggForm, name: e.target.value })}
                    placeholder="z.B. Familie Meyer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Straße & Hausnr. (Machtsum) *
                    </label>
                    <input
                      type="text"
                      required
                      value={eggForm.address}
                      onChange={(e) => setEggForm({ ...eggForm, address: e.target.value })}
                      placeholder="z.B. Lindenallee 15"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Anzahl Eier *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={eggForm.eggCount}
                      onChange={(e) => setEggForm({ ...eggForm, eggCount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm font-semibold focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                    E-Mail-Adresse (optional)
                  </label>
                  <input
                    type="email"
                    value={eggForm.email}
                    onChange={(e) => setEggForm({ ...eggForm, email: e.target.value })}
                    placeholder="name@beispiel.de"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                    Nachricht / Ablagehinweis (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={eggForm.message}
                    onChange={(e) => setEggForm({ ...eggForm, message: e.target.value })}
                    placeholder="z.B. Vor die Haustür stellen..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-ink-border flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingEggOrder(null)}
                    className="px-4 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink-muted font-semibold"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-forest text-white font-semibold hover:bg-forest-hover flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Eintrag speichern</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL 3: TERMIN / MARKT HINZUFÜGEN & BEARBEITEN
        ===================================================================== */}
        {editingEvent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setEditingEvent(null)}
          >
            <div
              className="w-full max-w-xl bg-canvas-card rounded-3xl shadow-2xl border border-ink-border overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-ink-border bg-canvas flex items-center justify-between">
                <h3 className="font-serif text-xl sm:text-2xl text-ink">
                  {isCreatingEvent ? 'Neuen Termin / Markt eintragen' : 'Termin bearbeiten'}
                </h3>
                <button
                  onClick={() => setEditingEvent(null)}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ink"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                    Titel der Veranstaltung / des Markts *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="z.B. Weihnachtsmarkt in Machtsum"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Datum *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Uhrzeit *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      placeholder="z.B. Ab 14:00 Uhr"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Ort / Standort *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="z.B. Sültenpaul • Lindenallee am Sportplatz"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Kleines Badge (optional)
                    </label>
                    <input
                      type="text"
                      value={eventForm.badge}
                      onChange={(e) => setEventForm({ ...eventForm, badge: e.target.value })}
                      placeholder="z.B. Unser Marktstand vor Ort"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                {/* Bild oder Vollmer's Logo als Platzhalter */}
                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Bild (optional – ohne Bild wird das Vollmer’s Logo als Platzhalter gezeigt)
                  </label>
                  <div className="p-4 rounded-2xl bg-canvas border border-ink-border space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-16 rounded-xl bg-[#F5F2EA] border border-ink-border flex items-center justify-center overflow-hidden shrink-0">
                        {eventForm.image ? (
                          <img src={eventForm.image} alt="Termin" className="w-full h-full object-cover" />
                        ) : (
                          <img src={PLACEHOLDER_EVENT_IMAGE} alt="Logo Platzhalter" className="h-12 w-auto object-contain" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-ink block">
                          {eventForm.image ? 'Eigenes Veranstaltungsbild ausgewählt' : 'Vollmer’s Logo als Platzhalter aktiv'}
                        </span>
                        {eventForm.image && (
                          <button
                            type="button"
                            onClick={() => setEventForm({ ...eventForm, image: '' })}
                            className="text-[11px] text-red-600 hover:underline mt-1"
                          >
                            Bild entfernen & Logo-Platzhalter nutzen
                          </button>
                        )}
                      </div>
                    </div>

                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors inline-flex items-center gap-2">
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Wird hochgeladen...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Eigenes Bild hochladen</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingImage}
                        onChange={(e) => handleImageUploadFor(e, 'event')}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                    Kurze Beschreibung (zum Aufklappen im Kalender)
                  </label>
                  <textarea
                    rows={3}
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Weitere Infos zu unserem Stand, Angeboten vor Ort..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-ink-border flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink-muted font-semibold"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-forest text-white font-semibold hover:bg-forest-hover flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Termin speichern</span>
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
