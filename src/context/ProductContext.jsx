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
        const data = await res.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          setSource(data.source || 'kv');
          return;
        }
      }
    } catch (err) {
      console.warn('Fehler beim Abruf der Produkte aus der KV, nutze Standarddaten:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const saveProductsToKV = async (updatedProducts, token) => {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ products: updatedProducts })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Fehler beim Speichern in der Cloudflare KV.');
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
