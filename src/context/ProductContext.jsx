import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products.js';
import { DEFAULT_EVENTS } from '../data/events.js';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('initial');

  const stripLegacyPrices = (list) =>
    list.map(({ price, ...rest }) => rest);

  const fetchProducts = async () => {
    let loadedFromServer = false;
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const text = await res.text();
        let data = null;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn('Antwort von /api/products ist kein JSON:', text.slice(0, 50));
        }

        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          const cleaned = stripLegacyPrices(data.products);
          setProducts(cleaned);
          setSource(data.source || 'kv');
          loadedFromServer = true;
          try {
            localStorage.setItem('vollmers_cached_products', JSON.stringify(cleaned));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Fehler beim Abruf der Produkte aus der KV:', err);
    } finally {
      if (!loadedFromServer) {
        try {
          const cached = localStorage.getItem('vollmers_cached_products');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProducts(stripLegacyPrices(parsed));
              setSource('local-cache');
            }
          }
        } catch (e) {}
      }
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    let loadedEvents = false;
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.events && Array.isArray(data.events)) {
          setEvents(data.events);
          loadedEvents = true;
          try {
            localStorage.setItem('vollmers_cached_events', JSON.stringify(data.events));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Fehler beim Abruf der Termine:', err);
    } finally {
      if (!loadedEvents) {
        try {
          const cached = localStorage.getItem('vollmers_cached_events');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              setEvents(parsed);
            }
          }
        } catch (e) {}
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchEvents();
  }, []);

  const saveProductsToKV = async (updatedProducts, token) => {
    try {
      localStorage.setItem('vollmers_cached_products', JSON.stringify(updatedProducts));
    } catch (e) {}

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ products: updatedProducts })
    });

    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Server antwortete mit HTTP ${res.status}: ${text.slice(0, 100) || res.statusText || 'Ungültige Serverantwort'}`);
    }

    if (!res.ok || !data?.success) {
      throw new Error(data?.error || `Fehler beim Speichern (HTTP ${res.status}).`);
    }

    setProducts(updatedProducts);
    setSource('kv');
    return data;
  };

  const saveEventsToKV = async (updatedEvents, token) => {
    try {
      localStorage.setItem('vollmers_cached_events', JSON.stringify(updatedEvents));
    } catch (e) {}

    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ events: updatedEvents })
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || `Fehler beim Speichern der Termine (HTTP ${res.status}).`);
    }

    setEvents(updatedEvents);
    return data;
  };

  return (
    <ProductContext.Provider value={{
      products,
      events,
      loading,
      source,
      refreshProducts: fetchProducts,
      refreshEvents: fetchEvents,
      saveProductsToKV,
      saveEventsToKV
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
