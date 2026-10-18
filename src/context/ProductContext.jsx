import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products.js';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('initial');

  const fetchProducts = async () => {
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
          setProducts(data.products);
          setSource(data.source || 'kv');
          try {
            localStorage.setItem('vollmers_cached_products', JSON.stringify(data.products));
          } catch (e) {}
          return;
        }
      }
    } catch (err) {
      console.warn('Fehler beim Abruf der Produkte aus der KV:', err);
    } finally {
      // Fallback auf LocalStorage Cache falls vorhanden
      try {
        const cached = localStorage.getItem('vollmers_cached_products');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
            setSource('local-cache');
          }
        }
      } catch (e) {}
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const saveProductsToKV = async (updatedProducts, token) => {
    // Vorab lokal cachen, damit keine Änderungen verloren gehen
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
      if (res.status === 405) {
        throw new Error('API-Endpunkt antwortet mit 405 (Method Not Allowed). Das Backend muss mit Routing aktualisiert werden.');
      }
      throw new Error(`Server antwortete mit HTTP ${res.status}: ${text.slice(0, 100) || res.statusText || 'Ungültige Serverantwort'}`);
    }

    if (!res.ok || !data?.success) {
      throw new Error(data?.error || `Fehler beim Speichern in der Cloudflare KV (HTTP ${res.status}).`);
    }

    setProducts(updatedProducts);
    setSource('kv');
    return data;
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      source,
      refreshProducts: fetchProducts,
      saveProductsToKV
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
