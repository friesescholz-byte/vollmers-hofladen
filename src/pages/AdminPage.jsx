import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck, Lock, LogOut, Plus, Edit2, Trash2, CheckCircle2,
  XCircle, Upload, AlertCircle, ArrowLeft, Loader2,
  Search, Image as ImageIcon, Save, RefreshCw, Calendar, MapPin, Clock, Mail, Package,
  Filter, Check, X, ChevronDown, User, Info
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { CATEGORIES } from '../data/products';
import { PLACEHOLDER_EVENT_IMAGE } from '../data/events';
import { DELIVERY_TOWNS } from '../data/deliveryTowns';
import EggIcon from '../components/EggIcon';
import ThursdayMiniCalendar, { getNextThursdayISO, formatThursdayDE } from '../components/ThursdayMiniCalendar';
import { formatEventDateDisplay } from './EventsPage';

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
  const [eggFilterStatus, setEggFilterStatus] = useState('all'); // 'all' | 'pending' | 'accepted' | 'rejected'
  const [eggFilterThursday, setEggFilterThursday] = useState('all');
  const [eggFilterTown, setEggFilterTown] = useState('all');
  const [eggSearch, setEggSearch] = useState('');

  const [eggForm, setEggForm] = useState({
    id: '',
    name: '',
    street: '',
    townId: 'machtsum',
    address: '',
    email: '',
    eggCount: 10,
    deliveryDate: getNextThursdayISO(),
    message: '',
    status: 'accepted',
  });

  // State: Termine & Märkte
  const [editingEvent, setEditingEvent] = useState(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    id: '',
    title: '',
    date: '',
    endDate: '',
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
      street: '',
      townId: 'machtsum',
      address: '',
      email: '',
      eggCount: 50,
      deliveryDate: getNextThursdayISO(),
      message: '',
      status: 'accepted',
    });
  };

  const openEditEggOrder = (order) => {
    setIsCreatingEggOrder(false);
    setEditingEggOrder(order);

    let derivedTownId = order.townId || 'machtsum';
    let derivedStreet = order.street || '';
    if (!derivedStreet && order.address) {
      if (order.address.includes(',')) {
        derivedStreet = order.address.split(',')[0].trim();
      } else {
        derivedStreet = order.address.trim();
      }
    }

    setEggForm({
      id: order.id,
      name: order.name || '',
      street: derivedStreet,
      townId: derivedTownId,
      address: order.address || '',
      email: order.email || '',
      eggCount: order.eggCount || 10,
      deliveryDate: order.deliveryDate || getNextThursdayISO(),
      message: order.message || '',
      status: order.status || 'pending',
    });
  };

  const handleUpdateEggStatus = async (order, newStatus) => {
    try {
      showToast('Status wird aktualisiert...');
      const res = await fetch('/api/admin/eier-donnerstag/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ id: order.id, status: newStatus }),
      });

      const updated = eggOrders.map(o => (o.id === order.id ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o));
      setEggOrders(updated);
      try { localStorage.setItem('vollmers_egg_orders', JSON.stringify(updated)); } catch (e) {}

      if (newStatus === 'accepted') {
        showToast(`Anfrage von „${order.name}“ angenommen & Bestätigungs-Mail versendet!`);
      } else if (newStatus === 'rejected') {
        showToast(`Anfrage von „${order.name}“ abgelehnt & Info-Mail versendet.`);
      } else {
        showToast(`Status für „${order.name}“ auf ausstehend gesetzt.`);
      }
    } catch (err) {
      alert('Fehler beim Aktualisieren: ' + err.message);
    }
  };

  const handleSaveEggOrder = async (e) => {
    e.preventDefault();
    if (!eggForm.name.trim() || !eggForm.eggCount) {
      alert('Bitte Name und Eieranzahl angeben.');
      return;
    }

    setIsSaving(true);
    const selectedT = DELIVERY_TOWNS.find(t => t.id === eggForm.townId) || DELIVERY_TOWNS[0];
    const fullAddr = eggForm.street.trim()
      ? `${eggForm.street.trim()}, ${selectedT.zip} ${selectedT.name}`
      : eggForm.address.trim() || `${selectedT.zip} ${selectedT.name}`;

    const normalizedEntry = {
      ...eggForm,
      name: eggForm.name.trim(),
      street: eggForm.street.trim(),
      townId: selectedT.id,
      town: selectedT.name,
      zip: selectedT.zip,
      address: fullAddr,
      email: eggForm.email.trim(),
      eggCount: Number(eggForm.eggCount) || eggForm.eggCount,
      deliveryDate: eggForm.deliveryDate ? String(eggForm.deliveryDate).trim() : getNextThursdayISO(),
      message: eggForm.message.trim(),
      status: eggForm.status || 'accepted',
      createdAt: editingEggOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      endDate: '',
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
      endDate: ev.endDate || '',
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
      endDate: eventForm.endDate ? eventForm.endDate.trim() : '',
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

  const pendingEggOrders = useMemo(() => {
    return eggOrders.filter(o => !o.status || o.status === 'pending');
  }, [eggOrders]);

  const acceptedEggOrders = useMemo(() => {
    return eggOrders.filter(o => o.status === 'accepted');
  }, [eggOrders]);

  const rejectedEggOrders = useMemo(() => {
    return eggOrders.filter(o => o.status === 'rejected');
  }, [eggOrders]);

  const acceptedEggCount = useMemo(() => {
    return acceptedEggOrders.reduce((sum, o) => sum + (Number(o.eggCount) || 0), 0);
  }, [acceptedEggOrders]);

  const availableThursdays = useMemo(() => {
    const dates = Array.from(new Set(eggOrders.map(o => o.deliveryDate).filter(Boolean)));
    return dates.sort();
  }, [eggOrders]);

  const thursdaysStats = useMemo(() => {
    const stats = {};
    eggOrders.forEach(o => {
      const d = o.deliveryDate || 'Ohne Datum';
      if (!stats[d]) stats[d] = { totalEggs: 0, acceptedEggs: 0, households: 0 };
      const eggs = Number(o.eggCount) || 0;
      stats[d].totalEggs += eggs;
      stats[d].households += 1;
      if (o.status === 'accepted') stats[d].acceptedEggs += eggs;
    });
    return stats;
  }, [eggOrders]);

  const filteredEggOrders = useMemo(() => {
    return eggOrders.filter(o => {
      const status = o.status || 'pending';
      if (eggFilterStatus !== 'all' && status !== eggFilterStatus) return false;
      if (eggFilterThursday !== 'all' && o.deliveryDate !== eggFilterThursday) return false;
      if (eggFilterTown !== 'all') {
        const matchesTown = (o.townId && o.townId === eggFilterTown) ||
          (o.town && o.town.toLowerCase() === eggFilterTown.toLowerCase()) ||
          (o.address && o.address.toLowerCase().includes(eggFilterTown.toLowerCase()));
        if (!matchesTown) return false;
      }
      if (eggSearch.trim()) {
        const q = eggSearch.toLowerCase();
        const matchesQuery = (o.name && o.name.toLowerCase().includes(q)) ||
          (o.address && o.address.toLowerCase().includes(q)) ||
          (o.email && o.email.toLowerCase().includes(q)) ||
          (o.message && o.message.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }
      return true;
    });
  }, [eggOrders, eggFilterStatus, eggFilterThursday, eggFilterTown, eggSearch]);

  const filteredEggCount = useMemo(() => {
    return filteredEggOrders.reduce((sum, o) => sum + (Number(o.eggCount) || 0), 0);
  }, [filteredEggOrders]);

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
              <EggIcon className="w-4 h-4" />
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors shadow-subtle flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Neues Produkt anlegen</span>
            </button>
          )}

          {activeTab === 'eier-donnerstag' && (
            <button
              onClick={openCreateEggOrder}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors shadow-subtle flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Eintrag für Eier-Donnerstag hinzufügen</span>
            </button>
          )}

          {activeTab === 'termine' && (
            <button
              onClick={openCreateEvent}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-hover transition-colors shadow-subtle flex items-center justify-center gap-2"
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
            TAB 2: EIER-DONNERSTAG (Ausstehende Anfragen, Filter & Tour-Übersicht)
        ===================================================================== */}
        {activeTab === 'eier-donnerstag' && (
          <div className="space-y-6">
            
            {/* KPI Übersichtskarten */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-canvas-card border border-ink-border shadow-subtle">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block">
                  Eingetragene Haushalte
                </span>
                <span className="font-serif text-2xl sm:text-3xl text-ink font-bold block mt-1">
                  {eggOrders.length} {eggOrders.length === 1 ? 'Haushalt' : 'Haushalte'}
                </span>
                <span className="text-[11px] text-ink-faint block mt-0.5">
                  Über alle Ortschaften hinweg
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-canvas-card border border-ink-border shadow-subtle">
                <span className="text-xs font-semibold text-forest uppercase tracking-wider block">
                  Bestätigte Eier (Gesamt)
                </span>
                <span className="font-serif text-2xl sm:text-3xl text-forest font-bold block mt-1">
                  {acceptedEggCount} Eier
                </span>
                <span className="text-[11px] text-ink-faint block mt-0.5">
                  {acceptedEggOrders.length} angenommene Lieferungen
                </span>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border shadow-subtle ${
                pendingEggOrders.length > 0
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-canvas-card border-ink-border'
              }`}>
                <span className={`text-xs font-semibold uppercase tracking-wider block ${
                  pendingEggOrders.length > 0 ? 'text-amber-800' : 'text-ink-muted'
                }`}>
                  Ausstehende Anfragen
                </span>
                <span className={`font-serif text-2xl sm:text-3xl font-bold block mt-1 ${
                  pendingEggOrders.length > 0 ? 'text-amber-900' : 'text-ink'
                }`}>
                  {pendingEggOrders.length} {pendingEggOrders.length === 1 ? 'Anfrage' : 'Anfragen'}
                </span>
                <span className="text-[11px] text-ink-faint block mt-0.5">
                  {pendingEggOrders.length > 0 ? 'Warten auf Annahme/Ablehnung' : 'Alle Anfragen bearbeitet'}
                </span>
              </div>
            </div>

            {/* SEKTION 1: AUSSTEHENDE ANFRAGEN (Pending) GANZ OBEN */}
            {pendingEggOrders.length > 0 ? (
              <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/80 border-2 border-amber-300 shadow-elevated space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping shrink-0" />
                    <h2 className="font-serif text-xl sm:text-2xl text-amber-950 font-bold">
                      Ausstehende Lieferanfragen ({pendingEggOrders.length})
                    </h2>
                  </div>
                  <span className="text-xs text-amber-800 font-medium">
                    ⚡ Klicke auf „Annehmen“ oder „Ablehnen“ – Kunde erhält automatisch die passende E-Mail.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingEggOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200 shadow-subtle flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <strong className="text-base text-ink font-semibold block">
                              {order.name}
                            </strong>
                            {order.email && (
                              <a
                                href={`mailto:${order.email}`}
                                className="text-xs text-ink-muted hover:text-forest flex items-center gap-1 mt-0.5"
                              >
                                <Mail className="w-3 h-3 shrink-0" />
                                <span>{order.email}</span>
                              </a>
                            )}
                          </div>
                          <span className="px-3 py-1 rounded-full bg-forest-tint text-forest font-bold text-xs shrink-0 flex items-center gap-1 border border-forest-border">
                            <EggIcon className="w-3.5 h-3.5" />
                            <span>{order.eggCount} Eier</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-ink font-medium">
                          <MapPin className="w-3.5 h-3.5 text-forest shrink-0" />
                          <span>{order.address}</span>
                          {order.town && (
                            <span className="px-2 py-0.5 rounded-md bg-canvas-muted text-ink-muted text-[10px] font-bold uppercase tracking-wider">
                              {order.town}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-forest font-semibold">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{order.deliveryDate ? formatThursdayDE(order.deliveryDate) : 'Nächster Donnerstag'}</span>
                        </div>

                        {order.message && (
                          <div className="p-2.5 rounded-xl bg-canvas text-xs text-ink-muted leading-relaxed border border-ink-border/50">
                            <strong className="block text-[10px] uppercase font-bold text-ink-faint mb-0.5">
                              Hinweis / Nachricht:
                            </strong>
                            <span>{order.message}</span>
                          </div>
                        )}
                      </div>

                      {/* Schnell-Aktionen */}
                      <div className="pt-2 border-t border-ink-border/50 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateEggStatus(order, 'accepted')}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-forest text-white hover:bg-forest-hover text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-subtle"
                        >
                          <Check className="w-4 h-4" />
                          <span>Annehmen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateEggStatus(order, 'rejected')}
                          className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Ablehnen</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Alles aktuell:</strong> Keine ausstehenden Lieferanfragen vorhanden. Alle Anfragen wurden bearbeitet.</span>
              </div>
            )}

            {/* SEKTION 2: FILTER & TOUR-ÜBERSICHT */}
            <div className="p-4 sm:p-5 rounded-3xl bg-canvas-card border border-ink-border shadow-subtle space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Suche */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={eggSearch}
                    onChange={(e) => setEggSearch(e.target.value)}
                    placeholder="Haushalt, Straße, Ortschaft, E-Mail suchen..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-canvas border border-ink-border text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-forest"
                  />
                </div>

                {/* Filter Dropdowns: Donnerstag & Ortschaft */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Ortschaft Filter */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold uppercase text-ink-muted hidden sm:inline">Ort:</span>
                    <select
                      value={eggFilterTown}
                      onChange={(e) => setEggFilterTown(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-canvas border border-ink-border text-xs font-medium text-ink focus:outline-none focus:border-forest"
                    >
                      <option value="all">Alle Ortschaften ({eggOrders.length})</option>
                      {DELIVERY_TOWNS.map((t) => {
                        const count = eggOrders.filter(
                          (o) =>
                            o.townId === t.id ||
                            (o.town && o.town.toLowerCase() === t.name.toLowerCase()) ||
                            (o.address && o.address.toLowerCase().includes(t.name.toLowerCase()))
                        ).length;
                        return (
                          <option key={t.id} value={t.id}>
                            {t.name} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Liefer-Donnerstag Filter */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold uppercase text-ink-muted hidden sm:inline">Donnerstag:</span>
                    <select
                      value={eggFilterThursday}
                      onChange={(e) => setEggFilterThursday(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-canvas border border-ink-border text-xs font-medium text-ink focus:outline-none focus:border-forest"
                    >
                      <option value="all">Alle Liefertage ({totalEggCount} Eier)</option>
                      {availableThursdays.map((date) => {
                        const stats = thursdaysStats[date] || { totalEggs: 0, households: 0 };
                        return (
                          <option key={date} value={date}>
                            {formatThursdayDE(date)} — {stats.totalEggs} Eier ({stats.households} Haushalte)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-ink-border/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mr-1">Status:</span>
                <button
                  type="button"
                  onClick={() => setEggFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    eggFilterStatus === 'all'
                      ? 'bg-forest text-white shadow-subtle'
                      : 'bg-canvas text-ink-muted hover:text-ink border border-ink-border/60'
                  }`}
                >
                  Alle ({eggOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEggFilterStatus('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    eggFilterStatus === 'pending'
                      ? 'bg-amber-600 text-white shadow-subtle'
                      : 'bg-canvas text-amber-800 hover:text-amber-900 border border-amber-300'
                  }`}
                >
                  <span>⏳ Ausstehend ({pendingEggOrders.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEggFilterStatus('accepted')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    eggFilterStatus === 'accepted'
                      ? 'bg-emerald-700 text-white shadow-subtle'
                      : 'bg-canvas text-emerald-800 hover:text-emerald-900 border border-emerald-300'
                  }`}
                >
                  <span>✅ Angenommen ({acceptedEggOrders.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEggFilterStatus('rejected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    eggFilterStatus === 'rejected'
                      ? 'bg-red-700 text-white shadow-subtle'
                      : 'bg-canvas text-red-800 hover:text-red-900 border border-red-300'
                  }`}
                >
                  <span>❌ Abgelehnt ({rejectedEggOrders.length})</span>
                </button>
              </div>

              {/* Aktive Tour-Zusammenfassung (wie viele Eier an welchem Donnerstag) */}
              {eggFilterThursday !== 'all' ? (
                <div className="p-3.5 rounded-2xl bg-forest-tint border border-forest-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-forest shrink-0" />
                    <span>
                      Liefer-Tour am <strong>{formatThursdayDE(eggFilterThursday)}</strong>:
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-forest font-bold text-sm">
                    <span>
                      🥚 {thursdaysStats[eggFilterThursday]?.totalEggs || 0} Eier gesamt ({thursdaysStats[eggFilterThursday]?.households || 0} Haushalte)
                    </span>
                    <span className="text-emerald-700 font-semibold text-xs">
                      davon {thursdaysStats[eggFilterThursday]?.acceptedEggs || 0} Eier bestätigt
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* SEKTION 3: DIE GESAMT-TABELLE / LISTE */}
            <div className="rounded-3xl bg-canvas-card border border-ink-border shadow-subtle overflow-hidden">
              <div className="px-5 py-4 border-b border-ink-border bg-canvas flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-ink">
                    Alle Einträge ({filteredEggOrders.length})
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {filteredEggCount} Eier insgesamt in der aktuellen Filteransicht
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-forest">
                    Summe gefiltert: <strong>{filteredEggCount} Eier</strong>
                  </span>
                </div>
              </div>

              {eggLoading ? (
                <div className="p-10 text-center text-ink-muted text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Lade Einträge...</span>
                </div>
              ) : filteredEggOrders.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <EggIcon className="w-8 h-8 text-forest mx-auto" />
                  <p className="text-sm text-ink-muted">
                    Keine Einträge für die aktuellen Filterkriterien gefunden.
                  </p>
                  <button
                    onClick={() => {
                      setEggFilterStatus('all');
                      setEggFilterThursday('all');
                      setEggFilterTown('all');
                      setEggSearch('');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-canvas border border-ink-border text-ink text-xs font-semibold hover:bg-canvas-muted"
                  >
                    <span>Filter zurücksetzen</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-ink-border/70">
                  {/* Tabellenkopf (Desktop) */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-6 py-3 bg-canvas-muted text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    <div className="col-span-3">Kunde & E-Mail</div>
                    <div className="col-span-3">Adresse & Ortschaft</div>
                    <div className="col-span-2">Liefertermin</div>
                    <div className="col-span-1">Menge</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Aktion</div>
                  </div>

                  {filteredEggOrders.map((order) => {
                    const status = order.status || 'pending';
                    return (
                      <div
                        key={order.id}
                        className={`p-4 sm:px-6 sm:py-3.5 hover:bg-canvas/60 transition-colors grid grid-cols-1 lg:grid-cols-12 gap-2.5 lg:gap-3 items-center text-xs ${
                          status === 'pending' ? 'bg-amber-50/20' : ''
                        }`}
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
                          {order.message && (
                            <span className="text-[11px] text-ink-faint truncate block italic mt-0.5">
                              "{order.message}"
                            </span>
                          )}
                        </div>

                        {/* Adresse */}
                        <div className="lg:col-span-3 flex items-start gap-1.5 text-ink font-medium min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="block truncate">{order.address}</span>
                            {order.town && (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-canvas border border-ink-border text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                                {order.town}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Gewählter Donnerstag */}
                        <div className="lg:col-span-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-canvas border border-ink-border text-ink font-semibold text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-forest shrink-0" />
                            <span className="truncate">
                              {order.deliveryDate ? formatThursdayDE(order.deliveryDate) : 'Nächster Do.'}
                            </span>
                          </span>
                        </div>

                        {/* Anzahl Eier */}
                        <div className="lg:col-span-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-forest-tint border border-forest-border text-forest font-bold text-xs whitespace-nowrap">
                            <EggIcon className="w-3 h-3" />
                            <span>{order.eggCount} Eier</span>
                          </span>
                        </div>

                        {/* Status & Status-Umschaltung */}
                        <div className="lg:col-span-2 flex items-center gap-2">
                          {status === 'pending' ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateEggStatus(order, 'accepted')}
                                className="px-2.5 py-1 rounded-lg bg-forest text-white hover:bg-forest-hover font-semibold text-[11px] flex items-center gap-1 shadow-subtle"
                                title="Anfrage annehmen und Bestätigung senden"
                              >
                                <Check className="w-3 h-3" />
                                <span>Annehmen</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateEggStatus(order, 'rejected')}
                                className="px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-semibold text-[11px] border border-red-200"
                                title="Anfrage ablehnen und Information senden"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : status === 'accepted' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateEggStatus(order, 'pending')}
                              className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] flex items-center gap-1 hover:opacity-80"
                              title="Klicken zum Zurücksetzen auf Ausstehend"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Angenommen</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateEggStatus(order, 'pending')}
                              className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold text-[11px] flex items-center gap-1 hover:opacity-80"
                              title="Klicken zum Zurücksetzen auf Ausstehend"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Abgelehnt</span>
                            </button>
                          )}
                        </div>

                        {/* Aktionen */}
                        <div className="lg:col-span-1 flex items-center justify-end gap-1.5 pt-2 lg:pt-0">
                          <button
                            onClick={() => openEditEggOrder(order)}
                            className="p-1.5 rounded-lg bg-canvas hover:bg-canvas-muted text-ink border border-ink-border transition-colors"
                            title="Eintrag bearbeiten"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEggOrder(order)}
                            className="p-1.5 rounded-lg bg-canvas hover:bg-red-50 text-red-600 border border-ink-border transition-colors"
                            title="Eintrag löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                const dateInfo = formatEventDateDisplay(ev.date, ev.endDate);
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
                            <span>{dateInfo?.formattedFull || ev.date}</span>
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
              className="w-full max-w-lg bg-canvas-card rounded-3xl shadow-2xl border border-ink-border overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
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

              <form onSubmit={handleSaveEggOrder} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
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
                      Lieferort (Ortschaft) *
                    </label>
                    <select
                      value={eggForm.townId}
                      onChange={(e) => setEggForm({ ...eggForm, townId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest"
                    >
                      {DELIVERY_TOWNS.map((town) => (
                        <option key={town.id} value={town.id}>
                          {town.name} ({town.zip})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Straße & Hausnummer *
                    </label>
                    <input
                      type="text"
                      required
                      value={eggForm.street || eggForm.address}
                      onChange={(e) => setEggForm({ ...eggForm, street: e.target.value, address: e.target.value })}
                      placeholder="z.B. Lindenallee 15"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Anzahl Eier *
                    </label>
                    <input
                      type="number"
                      min={50}
                      step={10}
                      required
                      value={eggForm.eggCount}
                      onChange={(e) => setEggForm({ ...eggForm, eggCount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm font-semibold focus:outline-none focus:border-forest"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink uppercase tracking-wider mb-1">
                      Status der Anfrage
                    </label>
                    <select
                      value={eggForm.status || 'accepted'}
                      onChange={(e) => setEggForm({ ...eggForm, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm font-semibold focus:outline-none focus:border-forest"
                    >
                      <option value="pending">⏳ Ausstehend (In Prüfung)</option>
                      <option value="accepted">✅ Angenommen (Bestätigt)</option>
                      <option value="rejected">❌ Abgelehnt (Kapazität erschöpft)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Gewünschter Liefer-Donnerstag *
                  </label>
                  <ThursdayMiniCalendar
                    value={eggForm.deliveryDate}
                    onChange={(dateStr) => setEggForm({ ...eggForm, deliveryDate: dateStr })}
                  />
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
                    Nachricht oder Hinweis (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={eggForm.message}
                    onChange={(e) => setEggForm({ ...eggForm, message: e.target.value })}
                    placeholder="Schreibe uns eine Nachricht oder einen Hinweis..."
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
                      Datum (oder Startdatum) *
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-ink uppercase tracking-wider">
                        Bis Datum (optional – für Zeiträume)
                      </label>
                      {eventForm.endDate && (
                        <button
                          type="button"
                          onClick={() => setEventForm({ ...eventForm, endDate: '' })}
                          className="text-[11px] font-semibold text-red-600 hover:underline"
                        >
                          Nur 1 Tag
                        </button>
                      )}
                    </div>
                    <input
                      type="date"
                      min={eventForm.date || undefined}
                      value={eventForm.endDate || ''}
                      onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-ink-border text-ink text-sm focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
