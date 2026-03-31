import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  toggleAdmin: () => void;
  overrides: Record<string, any>;
  saveOverride: (id: string, data: any) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, any>>({});

  useEffect(() => {
    const saved = localStorage.getItem('manual_overrides');
    if (saved) {
      try {
        setOverrides(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse overrides', e);
      }
    }
  }, []);

  const toggleAdmin = () => {
    setIsAdmin(prev => !prev);
    if (!isAdmin) {
      console.log('🛡️ Admin Mode: ACTIVE (Secret mode triggered)');
    }
  };

  const saveOverride = (id: string, data: any) => {
    const newOverrides = { ...overrides, [id]: { ...overrides[id], ...data } };
    setOverrides(newOverrides);
    localStorage.setItem('manual_overrides', JSON.stringify(newOverrides));
  };

  return (
    <AdminContext.Provider value={{ isAdmin, toggleAdmin, overrides, saveOverride }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
