import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';

interface AdminContextType {
  isAdmin: boolean;
  toggleAdmin: () => void;
  overrides: Record<string, Partial<Product>>;
  saveOverride: (productId: string, data: Partial<Product>) => void;
  customOrders: Record<string, string[]>; // subtypeId -> array of productIds in order
  saveOrder: (subtypeId: string, productIds: string[]) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, Partial<Product>>>({});
  const [customOrders, setCustomOrders] = useState<Record<string, string[]>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const savedOverrides = localStorage.getItem('manual_overrides');
    if (savedOverrides) {
      try {
        setOverrides(JSON.parse(savedOverrides));
      } catch (e) {
        console.error('Failed to parse overrides', e);
      }
    }

    const savedOrders = localStorage.getItem('manual_orders');
    if (savedOrders) {
      try {
        setCustomOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error('Failed to parse custom orders', e);
      }
    }
  }, []);

  const toggleAdmin = () => setIsAdmin(prev => !prev);

  const saveOverride = (productId: string, data: Partial<Product>) => {
    const newOverrides = {
      ...overrides,
      [productId]: { ...(overrides[productId] || {}), ...data }
    };
    setOverrides(newOverrides);
    localStorage.setItem('manual_overrides', JSON.stringify(newOverrides));
  };

  const saveOrder = (subtypeId: string, productIds: string[]) => {
    const newOrders = {
      ...customOrders,
      [subtypeId]: productIds
    };
    setCustomOrders(newOrders);
    localStorage.setItem('manual_orders', JSON.stringify(newOrders));
  };

  return (
    <AdminContext.Provider value={{ isAdmin, toggleAdmin, overrides, saveOverride, customOrders, saveOrder }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
