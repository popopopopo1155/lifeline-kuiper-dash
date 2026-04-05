import { useState, useEffect, useMemo } from 'react';
import { useInventory, ALL_INVENTORY_ITEMS } from './useInventory';
import { usePriceData } from './usePriceData';
import { fetchAveragePrices } from '../api/estat';
import type { AveragePriceData } from '../api/estat';

export const usePriceVictory = () => {
  const { inventory, getCurrentAmount } = useInventory();
  const { data: marketData } = usePriceData();
  const [estatPrices, setEstatPrices] = useState<AveragePriceData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // 1. e-Stat から平均価格を取得 (キャッシュ利用)
  useEffect(() => {
    const cached = localStorage.getItem('estat_prices_cache');
    const cachedTime = localStorage.getItem('estat_prices_updated');
    const now = Date.now();
    const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

    if (cached && cachedTime && (now - Number(cachedTime) < ONE_WEEK)) {
      setEstatPrices(JSON.parse(cached));
      setLastUpdated(new Date(Number(cachedTime)).toISOString());
    } else {
      fetchAveragePrices().then(prices => {
        setEstatPrices(prices);
        setLastUpdated(new Date().toISOString());
        localStorage.setItem('estat_prices_cache', JSON.stringify(prices));
        localStorage.setItem('estat_prices_updated', now.toString());
      });
    }
  }, []);

  // 2. 在庫品目ごとの「勝利額」を計算
  const victoryDetails = useMemo(() => {
    return ALL_INVENTORY_ITEMS.map(item => {
      const estatData = estatPrices.find(p => p.categoryId === item.id.toUpperCase());
      if (!estatData) return null;

      // Master の調達価格（そのカテゴリのサブタイプ内で最も安い単価、またはオーバーライド値を採用）
      const genre = marketData.find(g => g.id === item.id);
      if (!genre) return null;

      // サブタイプ全体の全商品から「最小単価」を Master の能力として抽出
      let minUnitPrice = Infinity;
      genre.subtypes.forEach(s => {
        s.products.forEach(p => {
          const uPrice = (p.price + (p.shipping || 0) - (p.points || 0)) / (p.volume || 1);
          if (uPrice < minUnitPrice) minUnitPrice = uPrice;
        });
      });

      if (minUnitPrice === Infinity) return null;

      // e-Stat の価格を単価に変換 (米 5kg=3450円なら 3450/5000 = 0.69円/g)
      let estatUnitPrice = 0;
      if (item.id === 'rice') estatUnitPrice = estatData.price / 5000;
      else if (item.id === 'eggs') estatUnitPrice = estatData.price / 10; // パック単位
      else if (item.id === 'water') estatUnitPrice = estatData.price / 2000; // 2L単位
      else if (item.id === 'bread') estatUnitPrice = estatData.price / 6; // 6枚単位
      else estatUnitPrice = estatData.price; // その他は直接比較

      const currentStock = getCurrentAmount(item.id);
      const savingsPerUnit = estatUnitPrice - minUnitPrice;
      const totalSavings = savingsPerUnit * currentStock;

      return {
        id: item.id,
        name: item.name,
        totalSavings: Math.max(0, totalSavings), // 負の勝利（損失）は Master に失礼なので 0 扱い
        savingsPerUnit,
        masterUnitPrice: minUnitPrice,
        estatUnitPrice
      };
    }).filter(v => v !== null);
  }, [estatPrices, marketData, inventory, getCurrentAmount]);

  // 3. 総合勝利額の算出
  const totalVictoryAmount = useMemo(() => {
    return victoryDetails.reduce((sum, v) => sum + (v?.totalSavings || 0), 0);
  }, [victoryDetails]);

  return {
    totalVictoryAmount,
    victoryDetails,
    lastUpdated,
    isVictorious: totalVictoryAmount > 0
  };
};
