import { useState, useEffect } from 'react';

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  dailyPerPerson: number;
}

export const ALL_INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'rice', name: '米', unit: 'kg', dailyPerPerson: 0.15 },
  { id: 'tp', name: 'トイレットペーパー', unit: 'ロール', dailyPerPerson: 0.5 },
  { id: 'dishsoap', name: '食器用洗剤', unit: '本', dailyPerPerson: 0.01 },
  { id: 'eggs', name: '卵', unit: 'パック', dailyPerPerson: 0.05 },
  { id: 'milk', name: '牛乳', unit: '本', dailyPerPerson: 0.2 },
  { id: 'tissue', name: 'ティッシュ', unit: '箱', dailyPerPerson: 0.1 },
  { id: 'bread', name: '食パン', unit: '袋', dailyPerPerson: 0.2 },
  { id: 'water', name: '水', unit: '本', dailyPerPerson: 0.5 },
  { id: 'oil', name: 'サラダ油', unit: '本', dailyPerPerson: 0.02 },
];

const STORAGE_KEY_SETTINGS = 'lifeline_household_size';
const STORAGE_KEY_INVENTORY = 'lifeline_inventory_data_v2';

interface StockData {
  amount: number;
  updatedAt: number;
}

const INVENTORY_UPDATE_EVENT = 'lifeline_inventory_sync';

export const useInventory = () => {
  const [householdSize, setHouseholdSizeLocal] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? Number(saved) : 1;
  });

  const [inventory, setInventoryLocal] = useState<Record<string, StockData>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_INVENTORY);
    if (saved) return JSON.parse(saved);
    
    const initial: Record<string, StockData> = {};
    const now = Date.now();
    ALL_INVENTORY_ITEMS.forEach(item => {
      initial[item.id] = { 
        amount: item.dailyPerPerson * (householdSize || 1) * 100,
        updatedAt: now 
      };
    });
    return initial;
  });

  // 同期用イベントリスナー
  useEffect(() => {
    const syncState = () => {
      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      const savedInv = localStorage.getItem(STORAGE_KEY_INVENTORY);
      if (savedSettings) setHouseholdSizeLocal(Number(savedSettings));
      if (savedInv) setInventoryLocal(JSON.parse(savedInv));
    };

    window.addEventListener(INVENTORY_UPDATE_EVENT, syncState);
    return () => window.removeEventListener(INVENTORY_UPDATE_EVENT, syncState);
  }, []);

  const setHouseholdSize = (size: number) => {
    setHouseholdSizeLocal(size); // Direct state update
    localStorage.setItem(STORAGE_KEY_SETTINGS, size.toString());
    window.dispatchEvent(new Event(INVENTORY_UPDATE_EVENT));
  };

  const getCurrentAmount = (id: string) => {
    const data = inventory[id];
    const item = ALL_INVENTORY_ITEMS.find(i => i.id === id);
    if (!data || !item) return 0;

    const msInDay = 24 * 60 * 60 * 1000;
    const elapsedDays = (Date.now() - data.updatedAt) / msInDay;
    const consumed = elapsedDays * (item.dailyPerPerson * householdSize);
    return Math.max(0, data.amount - consumed);
  };

  const updateStock = (id: string, val: number) => {
    const updated = {
      ...inventory,
      [id]: { amount: Math.max(0, val), updatedAt: Date.now() }
    };
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(updated));
    window.dispatchEvent(new Event(INVENTORY_UPDATE_EVENT));
  };

  const updateAllStocks = (newStocks: Record<string, number>) => {
    const now = Date.now();
    const next = { ...inventory };
    Object.entries(newStocks).forEach(([id, val]) => {
      next[id] = { amount: Math.max(0, val), updatedAt: now };
    });
    localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(next));
    window.dispatchEvent(new Event(INVENTORY_UPDATE_EVENT));
  };

  const getDaysLeft = (id: string) => {
    const item = ALL_INVENTORY_ITEMS.find(i => i.id === id);
    if (!item) return Infinity;
    const currentAmount = getCurrentAmount(id);
    const dailyConsumption = item.dailyPerPerson * householdSize;
    if (dailyConsumption === 0) return Infinity;
    return Math.floor(currentAmount / dailyConsumption);
  };

  return {
    householdSize,
    setHouseholdSize,
    inventory,
    updateStock,
    updateAllStocks,
    getDaysLeft,
    getCurrentAmount
  };
};
