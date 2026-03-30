import { useState, useEffect, useCallback } from 'react';
import { mockGenres } from '../data/mockData';
import type { Genre, Subtype, Product } from '../types';
import { getNormalizedVolume } from '../api/dataUtils';

/**
 * 構成案に基づく高度なデータ取得フック (Day 2 精緻化)
 * 1. 1時間限定のKeepaトークンを使い切る「攻め」の同期
 * 2. ニュースに基づいた予測加味ロジックの統合
 */
export const usePriceData = () => {
  const [data, setData] = useState(mockGenres);
  const [loading, setLoading] = useState(false);
  const [tokensLeft, setTokensLeft] = useState<number>(60);
  const [newsRisks, setNewsRisks] = useState<any>(null);
  const [manualItems, setManualItems] = useState<Product[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [lastTargetId, setLastTargetId] = useState<string | null>(null);

  // トークンの表示用クランプ（マイナスを見せない）
  const displayTokens = Math.max(0, tokensLeft);

  const SERVER_URL = ''; 

  // 1. ニュースリスクの取得
  const fetchNewsRisks = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/news/risks`);
      if (res.ok) {
        const risks = await res.json();
        setNewsRisks(risks);
        
        // ニュースリスクに基づいて現在のデータを更新
        setData((prev: Genre[]) => prev.map((genre: Genre) => {
          const catId = genre.id; 
          // マッピング用の簡易変換
          const mapId = catId === 'rice' ? 'rice' : 
                        catId === 'water' ? 'water' :
                        catId === 'tp' ? 'tp' :
                        catId === 'detergent' ? 'detergent' :
                        catId === 'oil' ? 'oil' : 
                        catId === 'tissue' ? 'tissue' :
                        catId === 'egg' ? 'egg' :
                        catId === 'milk' ? 'milk' :
                        catId === 'bread' ? 'bread' : '';

          const modifier = risks.categoryModifiers[mapId];
          const multiplier = modifier ? modifier.multiplier : 1.0;

          return {
            ...genre,
            subtypes: genre.subtypes.map((s: Subtype) => ({
              ...s,
              products: s.products.map((p: Product) => ({
                ...p,
                // 予測データをニュース倍率で補正
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

  // 4. Initial Mount: Batch fetch everything
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchNewsRisks(), fetchManualItems()]);
    };
    init();
  }, [fetchNewsRisks, fetchManualItems]);

  // 3. Intelligence Sync (Token Safe & Incremental)
  const refreshData = async (targetGenreId: string) => {
    if (tokensLeft <= 0) {
      setIsPaused(true);
      setLastTargetId(targetGenreId);
      console.warn('Halted: 0 tokens left.');
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
        // トークンチェック (逐次): 検索には大量に消費するため、最低40枚以上あれば開始可能
        if (tokensLeft < 40) {
          setIsPaused(true);
          setLastTargetId(targetGenreId);
          console.warn('📡 Token Safety Guard: Insufficient tokens for deep search (Balance:', tokensLeft, '). Waiting for 40+ or refill.');
          break; 
        }

        if (genre.group === 'daily') {
          updatedSubtypes.push({ ...subtype, products: [], scarcity: 0.1, volatility: 0.05 });
          continue;
        }

        let query = `${genre.name} ${subtype.name} 送料無料`;
        
        // お米 10kg の場合は、ユーザー指定の最強クエリに差し替え
        if (genre.id === 'rice' && subtype.id === 'rice-10kg') {
          query = '米 10kg -ふるさと納税 -定期便 -業務用';
        }
        
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
                affiliateUrl: p.affiliateUrl,
                source: 'Rakuten Live',
                forecastData: Array(7).fill(p.itemPrice)
              };
            });
            mergedProducts = [...mergedProducts, ...rakutenItems];
          }
        }

        // --- マニュアル検証データの合成 ---
        const relevantManual = manualItems.filter(mi => 
          (mi.id.includes(subtype.id)) || (mi.name.includes(subtype.name))
        );

        // マニュアルデータを最優先でマージ（IDが一致すれば上書き、なければ先頭に追加）
        relevantManual.forEach(mi => {
          const idx = mergedProducts.findIndex(p => p.id === mi.id || p.affiliateUrl === mi.affiliateUrl);
          if (idx !== -1) {
            mergedProducts[idx] = { ...mergedProducts[idx], ...mi, isVerified: true };
          } else {
            mergedProducts.unshift({ ...mi, isVerified: true });
          }
        });

        if (keepaRes.ok) {
          const kData = await keepaRes.json();
          if (kData.tokensLeft !== undefined) setTokensLeft(kData.tokensLeft);
          if (kData.products) {
            const amazonItems = kData.products
              .filter((p: any) => p.currentPrice > 0) // 有効な価格があるものに限定
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

        // 3件最安 + 7件人気のロジック
        mergedProducts.sort((a, b) => {
          const aU = (a.price + a.shipping - a.points) / Math.max(0.1, a.volume);
          const bU = (b.price + b.shipping - b.points) / Math.max(0.1, b.volume);
          return aU - bU;
        });
        const cheapest = mergedProducts.slice(0, 3);
        const productsExcludingCheapest = mergedProducts.slice(3);
        const others = productsExcludingCheapest.sort((a, b) => b.popularity - a.popularity).slice(0, 7);
        
        updatedSubtypes.push({ 
          ...subtype, 
          products: [...cheapest, ...others], 
          lastUpdated: Date.now() 
        });
      }

      setData((prev: Genre[]) => prev.map((g: Genre) => {
        if (g.id === targetGenreId) {
          // IDベースのマッピングで、一部の更新漏れがあっても他を更新するように修正
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
