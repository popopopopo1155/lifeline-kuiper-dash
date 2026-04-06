import { useState, useCallback } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import type { Product } from '../types';

export const useLinkChecker = () => {
  const { updateLinkHealth } = useAdmin();
  const [isScanning, setIsScanning] = useState(false);
  const [currentScanningId, setCurrentScanningId] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const checkSingleLink = useCallback(async (product: Product) => {
    setCurrentScanningId(product.id);
    try {
      const url = product.affiliateUrl;
      if (!url) {
        updateLinkHealth(product.id, { status: 'unknown', reason: 'No URL found' });
        return;
      }

      const res = await fetch(`/api/admin/check-link?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        updateLinkHealth(product.id, { status: data.status, reason: data.reason });
      } else {
        updateLinkHealth(product.id, { status: 'unknown', reason: `Server Error: ${res.status}` });
      }
    } catch (error: any) {
      updateLinkHealth(product.id, { status: 'unknown', reason: `Check Failed: ${error.message}` });
    } finally {
      setCurrentScanningId(null);
    }
  }, [updateLinkHealth]);

  const scanLinks = useCallback(async (products: Product[]) => {
    if (isScanning) return;
    setIsScanning(true);
    setProgress({ current: 0, total: products.length });

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      setProgress(prev => ({ ...prev, current: i + 1 }));
      
      await checkSingleLink(product);

      // [STEALTH DELAY] 2〜4秒のランダムな休憩を挟み、ボット検知を回避する
      if (i < products.length - 1) {
        const delay = 2000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setIsScanning(false);
    setProgress({ current: 0, total: 0 });
  }, [isScanning, checkSingleLink]);

  return { scanLinks, isScanning, currentScanningId, progress };
};
