import { useState, useEffect, useCallback } from 'react';
import { mockGenres } from '../data/mockData';
import type { Genre, Subtype, Product } from '../types';
import { getNormalizedVolume } from '../api/dataUtils';
import { useAdmin } from '../contexts/AdminContext';
import { wrapAma, wrapRaku } from '../data/mockData';
import { fetchRegionalAveragePrice } from '../api/estat';

/**
 * 構成案に基づく高度なデータ取得フック (v5.0 手動ソート対応)
 */
export const usePriceData = () => {
  const [data, setData] = useState(mockGenres);
  const [loading, setLoading] = useState(false);
  const [tokensLeft, setTokensLeft] = useState<number>(60);
  const [newsRisks, setNewsRisks] = useState<any>(null);
  const [numericalRisks, setNumericalRisks] = useState<any[]>([]); 
  const [isPaused, setIsPaused] = useState(false);
  const [lastTargetId, setLastTargetId] = useState<string | null>(null);

  const { overrides, customOrders } = useAdmin();

  const displayTokens = Math.max(0, tokensLeft);
  const SERVER_URL = ''; 

  // --- 🏮 [HARVEST SYNC] - スナップショットから本物の Amazon データを同期する ---
  const fetchSnapshot = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/snapshot`);
      if (res.ok) {
        const snapshot = await res.json();
        setData(prevData => prevData.map(genre => {
          const updatedSubtypes = genre.subtypes.map(s => ({
            ...s,
            products: s.products.map(p => {
              if (p.asin && snapshot[p.asin]) {
                const snap = snapshot[p.asin];
                return {
                  ...p,
                  price: snap.currentPrice || p.price,
                  forecastData: snap.history.length > 0 ? snap.history.slice(-7) : p.forecastData,
                  historyData: snap.history || []
                };
              }
              return p;
            })
          }));

          // 🏮 [CATEGORY TREND SYNC] - 代表的な商品の履歴からカテゴリー全体のトレンドを再構成
          // メインチャートである historyData を、収穫された最新 30 ポイントで上書き
          const representativeAsins = genre.subtypes.flatMap(s => s.products.filter(p => !!p.asin).map(p => p.asin));
          const firstAsin = representativeAsins[0];
          if (firstAsin && snapshot[firstAsin]) {
             return {
               ...genre,
               subtypes: updatedSubtypes,
               historyData: snapshot[firstAsin].history || genre.historyData
             };
          }

          return { ...genre, subtypes: updatedSubtypes };
        }));
        console.log(`🌾 Harvest Synchronized: ${Object.keys(snapshot).length} items loaded.`);
      }
    } catch (err) { console.warn('Snapshot sync failed.', err); }
  }, []);

  // [OFFICIAL STATS SYNC] - 政府統計 API との動的同期
  const fetchOfficialStats = useCallback(async () => {
    for (const genre of data) {
      const statsPrice = await fetchRegionalAveragePrice(genre.id);
      if (statsPrice) {
        setData(prevData => prevData.map(g => {
          if (g.id === genre.id) {
            return {
              ...g,
              subtypes: g.subtypes.map(s => ({
                ...s,
                regionalAverage: statsPrice,
                isOfficial: true // 🏛️ 統計同期済み
              }))
            };
          }
          return g;
        }));
      }
    }
  }, [data]);

  useEffect(() => {
    fetchSnapshot(); // 最初に収穫データを同期
    fetchOfficialStats();
  }, []); // 初回起動時に全域同期を執行

  // 手動オーバーライドとカスタムソートを適用したデータを返す
  const getAppliedData = useCallback((baseData: Genre[]) => {
    return baseData.map(genre => ({
      ...genre,
      subtypes: genre.subtypes.map(subtype => {
        // 1. 各プロダクトにステートレベルのオーバーライドを適用
        let products = subtype.products.map(product => {
          const override = overrides[product.id];
          if (override) {
            return { ...product, ...override };
          }
          return product;
        });

        // 2. カスタムオーダー（指定順序）があれば適用
        const order = customOrders[subtype.id];
        if (order && order.length > 0) {
          products = [...products].sort((a, b) => {
            const indexA = order.indexOf(a.id);
            const indexB = order.indexOf(b.id);
            
            // 両方指定されている場合はその順番
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // 片方のみ指定されている場合は指定されている方を上にする
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            // どちらも指定されていない場合は元の順序（または単価順）
            return 0;
          });
        }

        return { ...subtype, products };
      })
    }));
  }, [overrides, customOrders]);

  // dataステートをオーバーライド込みでラップ
  const augmentedData = getAppliedData(data);

  const auditNewsRisks = useCallback((fetchedRisks: any, currentData: Genre[]) => {
    if (!fetchedRisks || !fetchedRisks.activeRisks) return fetchedRisks;
    const storedBaselines = JSON.parse(localStorage.getItem('news_baselines') || '{}');
    const now = Date.now();
    const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14;

    const auditedRisks = fetchedRisks.activeRisks.filter((risk: any) => {
      const categoricalPrice = currentData.reduce((min, g) => {
        const matchingSubtype = g.subtypes.find(s => risk.title.includes(g.name) || risk.title.includes(s.name));
        if (matchingSubtype && matchingSubtype.products.length > 0) {
          const pMin = Math.min(...matchingSubtype.products.map(p => (p.price + p.shipping - p.points) / p.volume));
          return pMin < min ? pMin : min;
        }
        return min;
      }, 999999);

      if (!storedBaselines[risk.title]) {
        storedBaselines[risk.title] = { firstSeen: now, baselinePrice: categoricalPrice };
        return true; 
      }
      const { firstSeen, baselinePrice } = storedBaselines[risk.title];
      const elapsed = now - firstSeen;
      const priceChange = (categoricalPrice - baselinePrice) / baselinePrice;
      if (categoricalPrice < baselinePrice * 0.98) return false;
      if (elapsed > TWO_WEEKS_MS && priceChange < 0.05) return false;
      return true;
    });

    localStorage.setItem('news_baselines', JSON.stringify(storedBaselines));
    return { ...fetchedRisks, activeRisks: auditedRisks };
  }, []);

  const fetchNewsRisks = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/news/risks`);
      if (res.ok) {
        const rawRisks = await res.json();
        
        setData((prevData) => {
          // IMPORTANT: Use prevData to avoid stale closures
          const audited = auditNewsRisks(rawRisks, prevData);
          setNewsRisks(audited);

          return prevData.map((genre: Genre) => {
            let multiplier = 1.0;
            const categoryId = genre.id.toUpperCase();
            let serverCategoryKey = (categoryId === 'MILK') ? 'DAIRY' : categoryId;
            if (genre.id === 'bread') serverCategoryKey = 'BREAD';
            let modifier = audited.categoryModifiers[serverCategoryKey];
            
            if (modifier) {
               multiplier = modifier.multiplier;
            }

            return {
              ...genre,
              subtypes: genre.subtypes.map((s: Subtype) => {
                const dampingFactor = 0.5;
                const benchmarkMultiplier = 1 + (multiplier - 1) * dampingFactor;
                const stableBase = s.baseRegionalAverage || s.regionalAverage;
                const newPrice = Math.round(stableBase * benchmarkMultiplier);
                
                return {
                  ...s,
                  baseRegionalAverage: stableBase,
                  regionalAverage: newPrice,
                  products: s.products.map((p: Product) => ({
                    ...p,
                    forecastData: p.forecastData.map(val => Math.round(val * multiplier))
                  }))
                };
              })
            };
          });
        });
      }
    } catch (err) { console.warn('News risks fetch failed.', err); }
  }, [auditNewsRisks]);

  useEffect(() => { fetchNewsRisks(); }, [fetchNewsRisks]);

  const refreshData = async (targetGenreId: string) => {
    if (tokensLeft <= 0) { setIsPaused(true); setLastTargetId(targetGenreId); return; }
    setIsPaused(false);
    const genreIndex = data.findIndex(g => g.id === targetGenreId);
    if (genreIndex === -1) return;
    const genre = data[genreIndex];

    setLoading(true);
    try {
      const updatedSubtypes: any[] = [];
      const newNumericalAlerts: any[] = [];
      
      for (const subtype of genre.subtypes) {
        if (tokensLeft < 40) { setIsPaused(true); setLastTargetId(targetGenreId); break; }
        
        const query = (subtype as any).searchOverride || `${genre.name} ${subtype.name} 送料無料`;
        const reqKeywords: string[] = (subtype as any).requiredKeywords || [subtype.name];
        const excKeywords: string[] = (subtype as any).excludeKeywords || [];

        const [rakutenRes, keepaRes] = await Promise.all([
          fetch(`${SERVER_URL}/api/rakuten?keyword=${encodeURIComponent(query)}`),
          fetch(`${SERVER_URL}/api/keepa?search=${encodeURIComponent(query)}`)
        ]);

        let mergedProducts: Product[] = [];
        const processItem = (p: any, store: 'rakuten' | 'amazon') => {
          const title = p.name || p.title;
          const hasAll = reqKeywords.every(k => title.toLowerCase().includes(k.toLowerCase()));
          const hasExclude = excKeywords.some(k => title.toLowerCase().includes(k.toLowerCase()));
          if (!hasAll || hasExclude) return null;

          const volume = getNormalizedVolume(title, genre.unitType);
          const price = p.price || p.currentPrice;
          const shipping = p.shipping || 0;
          const points = p.points || 0;
          const unitPrice = (price + shipping - points) / volume;

          // [MANUAL GUARD] 手動設定されたジャンル(rice等)は、極端な変動データを排除する
          const isManualGenre = genre.id === 'rice';
          if (isManualGenre && unitPrice < (subtype.regionalAverage || 500) * 0.7) return null;

          if (unitPrice > (subtype.regionalAverage || 500) * 3.0) return null;

          return {
            id: p.id || `${store}-${p.itemCode || p.asin}`,
            name: title,
            price,
            shipping,
            points,
            volume,
            store,
            unit: genre.unitType,
            baseUnit: genre.unitType,
            popularity: p.popularity || 100,
            affiliateUrl: store === 'rakuten' ? wrapRaku(p.itemUrl) : wrapAma(p.itemUrl || `https://www.amazon.co.jp/dp/${p.asin}`),
            source: store === 'rakuten' ? 'Rakuten Live' : 'Amazon Pro',
            forecastData: Array(7).fill(price)
          };
        };

        if (rakutenRes.ok) {
          const result = await rakutenRes.json();
          if (result.Items) {
            mergedProducts = [...mergedProducts, ...result.Items
              .map((item: any) => processItem(item.Item, 'rakuten'))
              .filter((p: any) => p !== null)];
          }
        }

        if (keepaRes.ok) {
          const kData = await keepaRes.json();
          if (kData.tokensLeft !== undefined) setTokensLeft(kData.tokensLeft);
          if (kData.products) {
            mergedProducts = [...mergedProducts, ...kData.products
              .filter((kp: any) => kp.currentPrice > 0)
              .map((kp: any) => processItem(kp, 'amazon'))
              .filter((p: any) => p !== null)];
          }
        }

        mergedProducts.sort((a, b) => {
          const aU = (a.price + a.shipping - a.points) / Math.max(0.1, a.volume);
          const bU = (b.price + b.shipping - b.points) / Math.max(0.1, b.volume);
          return aU - bU;
        });
        const unique = mergedProducts.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        const finalProducts = unique.slice(0, 5);

        if (finalProducts.length > 0) {
          const minLiveUnitPrice = (finalProducts[0].price + finalProducts[0].shipping - finalProducts[0].points) / finalProducts[0].volume;
          const baseline = subtype.regionalAverage;
          const surgeRatio = baseline ? (minLiveUnitPrice - baseline) / baseline : 0;

          if (surgeRatio > 0.15) {
            newNumericalAlerts.push({
              title: `市場データ検知: ${genre.name}(${subtype.name})の価格が平時より ${Math.round(surgeRatio * 100)}% 急騰中`,
              level: surgeRatio > 0.3 ? 'CRITICAL' : 'HIGH',
              source: 'Numerical Intelligence',
              timestamp: Date.now()
            });
          }
        }
        updatedSubtypes.push({ ...subtype, products: finalProducts, lastUpdated: Date.now() });
      }

      setNumericalRisks(prev => {
        const combined = [...prev, ...newNumericalAlerts];
        return combined.filter((v, i, a) => a.findIndex(t => t.title === v.title) === i).slice(-5);
      });

      setData((prev: Genre[]) => prev.map((g: Genre) => {
        if (g.id === targetGenreId) {
          return { ...g, subtypes: g.subtypes.map(oldS => updatedSubtypes.find(u => u.id === oldS.id) || oldS) };
        }
        return g;
      }));
    } catch (err) { console.error('Refresh Error:', err); } finally { setLoading(false); }
  };

  return { data: augmentedData, loading, tokensLeft: displayTokens, newsRisks, numericalRisks, isPaused, lastTargetId, refreshData };
};
