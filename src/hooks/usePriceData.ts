import { useState, useEffect, useCallback } from 'react';
import { mockGenres } from '../data/mockData';
import type { Genre, Subtype, Product } from '../types';
import { getNormalizedVolume } from '../api/dataUtils';

/**
 * 構成案に基づく高度なデータ取得フック (v4.0 信頼性強化版)
 * 1. 全カテゴリー「最安5件」に統一
 * 2. Amazon 商品名の厳格フィルタ (Description Guard)
 * 3. 楽天 v3 リンクの完全同期
 */
export const usePriceData = () => {
  const [data, setData] = useState(mockGenres);
  const [loading, setLoading] = useState(false);
  const [tokensLeft, setTokensLeft] = useState<number>(60);
  const [newsRisks, setNewsRisks] = useState<any>(null);
  const [manualItems, setManualItems] = useState<Product[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [lastTargetId, setLastTargetId] = useState<string | null>(null);

  const displayTokens = Math.max(0, tokensLeft);
  const SERVER_URL = ''; 

  // 1. ニュースリスクの取得
  const fetchNewsRisks = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/news/risks`);
      if (res.ok) {
        const risks = await res.json();
        setNewsRisks(risks);
        
        setData((prev: Genre[]) => prev.map((genre: Genre) => {
          const mapId = genre.id; 
          const modifier = risks.categoryModifiers[mapId];
          const multiplier = modifier ? modifier.multiplier : 1.0;

          return {
            ...genre,
            subtypes: genre.subtypes.map((s: Subtype) => ({
              ...s,
              products: s.products.map((p: Product) => ({
                ...p,
                forecastData: p.forecastData.map(val => Math.round(val * multiplier))
              }))
            }))
          };
        }));
      }
    } catch (err) {
      console.warn('News risks fetch failed.', err);
    }
  }, []);

  // 3. マニュアルデータの取得
  const fetchManualItems = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/manual/items`);
      if (res.ok) {
        const items = await res.json();
        setManualItems(items);
      }
    } catch (err) {
      console.warn('Manual items fetch failed.');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchNewsRisks(), fetchManualItems()]);
    };
    init();
  }, [fetchNewsRisks, fetchManualItems]);

  // 4. Intelligence Sync (Token Safe & Incremental)
  const refreshData = async (targetGenreId: string) => {
    if (tokensLeft <= 0) {
      setIsPaused(true);
      setLastTargetId(targetGenreId);
      return;
    }

    setIsPaused(false);
    const genreIndex = data.findIndex(g => g.id === targetGenreId);
    if (genreIndex === -1) return;
    const genre = data[genreIndex];

    setLoading(true);
    try {
      const updatedSubtypes: any[] = [];
      
      for (const subtype of genre.subtypes) {
        if (tokensLeft < 40) {
          setIsPaused(true);
          setLastTargetId(targetGenreId);
          break; 
        }

        if (genre.group === 'daily') {
          updatedSubtypes.push({ ...subtype, products: [], scarcity: 0.1, volatility: 0.05 });
          continue;
        }

        const query = (genre.id === 'rice' && subtype.id === 'rice-10kg') 
          ? '米 10kg -ふるさと納税 -定期便 -業務用' 
          : `${genre.name} ${subtype.name} 送料無料`;
        
        let mergedProducts: Product[] = [];
        
        const [rakutenRes, keepaRes] = await Promise.all([
          fetch(`${SERVER_URL}/api/rakuten?keyword=${encodeURIComponent(query)}`),
          fetch(`${SERVER_URL}/api/keepa?search=${encodeURIComponent(query)}`)
        ]);

        if (rakutenRes.ok) {
          const result = await rakutenRes.json();
          if (result.Items) {
            const rakutenItems = result.Items.map((item: any, index: number) => {
              const p = item.Item;
              return {
                id: `rakuten-${p.itemCode}`,
                name: p.itemName,
                price: p.itemPrice,
                shipping: 0, 
                points: Math.floor(p.itemPrice * (p.pointRate || 1) / 100),
                volume: getNormalizedVolume(p.itemName, genre.unitType),
                store: 'rakuten' as const,
                unit: genre.unitType,
                baseUnit: genre.unitType,
                popularity: 1000 - index,
                affiliateUrl: p.affiliateUrl || p.itemUrl, // v3 互換
                source: 'Rakuten Live',
                forecastData: Array(7).fill(p.itemPrice)
              };
            });
            mergedProducts = [...mergedProducts, ...rakutenItems];
          }
        }

        if (keepaRes.ok) {
          const kData = await keepaRes.json();
          if (kData.tokensLeft !== undefined) setTokensLeft(kData.tokensLeft);
          if (kData.products) {
            const amazonItems = kData.products
              .filter((kp: any) => kp.currentPrice > 0)
              // --- Description Guard: 商品名にサブタイプ名（5kg, 10kg 等）が含まれているか厳格にチェック ---
              .filter((kp: any) => {
                // サブタイプ名（例: "5kg"）が商品名に含まれていない不整合品を除外
                const keyword = subtype.name.replace(/[^\w]/g, '').toLowerCase(); 
                return kp.title.toLowerCase().includes(keyword);
              })
              .map((kp: any) => ({
                id: `amazon-${kp.asin}`,
                name: kp.title,
                price: kp.currentPrice,
                shipping: 0,
                points: 0,
                volume: getNormalizedVolume(kp.title, genre.unitType),
                store: 'amazon' as const,
                unit: genre.unitType,
                baseUnit: genre.unitType,
                popularity: 5000 - (kp.stats?.salesRank || 100000) / 100,
                affiliateUrl: kp.affiliateUrl,
                source: 'Amazon Pro',
                forecastData: Array(7).fill(kp.currentPrice)
              }));
            mergedProducts = [...mergedProducts, ...amazonItems];
          }
        }

        // --- マニュアルデータの合成 ---
        const relevantManual = manualItems.filter(mi => 
          (mi.id.includes(subtype.id)) || (mi.name.includes(subtype.name))
        );
        relevantManual.forEach(mi => {
          const idx = mergedProducts.findIndex(p => p.id === mi.id);
          if (idx !== -1) mergedProducts[idx] = { ...mergedProducts[idx], ...mi, isVerified: true };
          else mergedProducts.unshift({ ...mi, isVerified: true });
        });

        // --- 排他的「最安5件」ロジックに統一 ---
        mergedProducts.sort((a, b) => {
          const aU = (a.price + a.shipping - a.points) / Math.max(0.1, a.volume);
          const bU = (b.price + b.shipping - b.points) / Math.max(0.1, b.volume);
          return aU - bU;
        });

        // 重複を除外 (ASIN or ID)
        const unique = mergedProducts.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        
        updatedSubtypes.push({ 
          ...subtype, 
          products: unique.slice(0, 5), // バカ正直に最安5件だけを出す
          lastUpdated: Date.now() 
        });
      }

      setData((prev: Genre[]) => prev.map((g: Genre) => {
        if (g.id === targetGenreId) {
          const newSubtypes = g.subtypes.map(oldS => {
            const upS = updatedSubtypes.find(u => u.id === oldS.id);
            return upS ? upS : oldS;
          });
          return { ...g, subtypes: newSubtypes };
        }
        return g;
      }));

    } catch (err) {
      console.error('Refresh Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, tokensLeft: displayTokens, newsRisks, isPaused, lastTargetId, refreshData };
};
