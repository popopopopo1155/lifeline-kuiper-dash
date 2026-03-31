import { useState, useEffect, useCallback } from 'react';
import { mockGenres } from '../data/mockData';
import type { Genre, Subtype, Product } from '../types';
import { getNormalizedVolume } from '../api/dataUtils';

/**
 * 構成案に基づく高度なデータ取得フック (v4.2 真偽判定 & 数値インテリジェンス)
 * 1. ニュースの真偽値を実数値で裏取り (Truth-Checker)
 * 2. 実数値ベースの急騰検知 (Numerical Surge Detection)
 * 3. 前日・平時比 15% 乖離での自動警告
 */
export const usePriceData = () => {
  const [data, setData] = useState(mockGenres);
  const [loading, setLoading] = useState(false);
  const [tokensLeft, setTokensLeft] = useState<number>(60);
  const [newsRisks, setNewsRisks] = useState<any>(null);
  const [numericalRisks, setNumericalRisks] = useState<any[]>([]); // 数値ベースのリスク
  const [isPaused, setIsPaused] = useState(false);
  const [lastTargetId, setLastTargetId] = useState<string | null>(null);

  const displayTokens = Math.max(0, tokensLeft);
  const SERVER_URL = ''; 

  // --- TRUTH-CHECKER LOGIC: ニュースと実勢価格の乖離を監視 ---
  const auditNewsRisks = useCallback((fetchedRisks: any, currentData: Genre[]) => {
    if (!fetchedRisks || !fetchedRisks.activeRisks) return fetchedRisks;

    const storedBaselines = JSON.parse(localStorage.getItem('news_baselines') || '{}');
    const now = Date.now();
    const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14;

    const auditedRisks = fetchedRisks.activeRisks.filter((risk: any) => {
      // 1. 各記事のカテゴリに基づいた現在(同期済みまたは初期)の最安値を取得
      const categoricalPrice = currentData.reduce((min, g) => {
        const matchingSubtype = g.subtypes.find(s => risk.title.includes(g.name) || risk.title.includes(s.name));
        if (matchingSubtype && matchingSubtype.products.length > 0) {
          const pMin = Math.min(...matchingSubtype.products.map(p => (p.price + p.shipping - p.points) / p.volume));
          return pMin < min ? pMin : min;
        }
        return min;
      }, 999999);

      // 初めて見たニュースの場合、ベースラインを記録
      if (!storedBaselines[risk.title]) {
        storedBaselines[risk.title] = { firstSeen: now, baselinePrice: categoricalPrice };
        return true; 
      }

      const { firstSeen, baselinePrice } = storedBaselines[risk.title];
      const elapsed = now - firstSeen;
      const priceChange = (categoricalPrice - baselinePrice) / baselinePrice;

      // 判定ロジック:
      // A. 価格が下がっていれば、即座に「沈静化」として排除 (Truth-check: False)
      if (categoricalPrice < baselinePrice * 0.98) return false;

      // B. 14日経過しても 5% 以上上がっていなければ「煽り」として排除
      if (elapsed > TWO_WEEKS_MS && priceChange < 0.05) return false;

      return true;
    });

    localStorage.setItem('news_baselines', JSON.stringify(storedBaselines));
    return { ...fetchedRisks, activeRisks: auditedRisks };
  }, []);

  // 1. ニュースリスクの取得 + 監査
  const fetchNewsRisks = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/news/risks`);
      if (res.ok) {
        const rawRisks = await res.json();
        
        // 最新データで真偽値を監査
        setData((prevData) => {
          const audited = auditNewsRisks(rawRisks, prevData);
          setNewsRisks(audited);
          
          return prevData.map((genre: Genre) => {
            const modifier = audited.categoryModifiers[genre.id];
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
          });
        });
      }
    } catch (err) {
      console.warn('News risks fetch failed.', err);
    }
  }, [auditNewsRisks]);

  useEffect(() => {
    fetchNewsRisks();
  }, [fetchNewsRisks]);

  // 4. Intelligence Sync (Token Safe & Incremental)
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
        if (genre.group === 'daily') {
          updatedSubtypes.push({ ...subtype, products: [], scarcity: 0.1, volatility: 0.05 });
          continue;
        }

        const query = (genre.id === 'rice' && subtype.id === 'rice-10kg') 
          ? '米 10kg -ふるさと納税 -定期便 -業務用' 
          : `${genre.name} ${subtype.name} 送料無料`;
        
        const [rakutenRes, keepaRes] = await Promise.all([
          fetch(`${SERVER_URL}/api/rakuten?keyword=${encodeURIComponent(query)}`),
          fetch(`${SERVER_URL}/api/keepa?search=${encodeURIComponent(query)}`)
        ]);

        let mergedProducts: Product[] = [];
        if (rakutenRes.ok) {
          const result = await rakutenRes.json();
          if (result.Items) {
            mergedProducts = [...mergedProducts, ...result.Items.map((item: any, index: number) => {
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
                affiliateUrl: p.affiliateUrl || p.itemUrl,
                source: 'Rakuten Live',
                forecastData: Array(7).fill(p.itemPrice)
              };
            })];
          }
        }

        if (keepaRes.ok) {
          const kData = await keepaRes.json();
          if (kData.tokensLeft !== undefined) setTokensLeft(kData.tokensLeft);
          if (kData.products) {
            mergedProducts = [...mergedProducts, ...kData.products
              .filter((kp: any) => kp.currentPrice > 0)
              .filter((kp: any) => {
                const keyword = subtype.name.replace(/[^\w]/g, '').toLowerCase(); 
                return kp.title.toLowerCase().includes(keyword);
              }).map((kp: any) => ({
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
              }))];
          }
        }

        // --- 排他的「最安5件」ロジック ---
        mergedProducts.sort((a, b) => {
          const aU = (a.price + a.shipping - a.points) / Math.max(0.1, a.volume);
          const bU = (b.price + b.shipping - b.points) / Math.max(0.1, b.volume);
          return aU - bU;
        });
        const unique = mergedProducts.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        const finalProducts = unique.slice(0, 5);

        // --- NUMERICAL SURGE DETECTION: 実勢価格と基準値の比較 ---
        if (finalProducts.length > 0) {
          const minLiveUnitPrice = (finalProducts[0].price + finalProducts[0].shipping - finalProducts[0].points) / finalProducts[0].volume;
          const baseline = subtype.regionalAverage;
          const surgeRatio = (minLiveUnitPrice - baseline) / baseline;

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
        // 重複なしでマージ
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

  return { data, loading, tokensLeft: displayTokens, newsRisks, numericalRisks, isPaused, lastTargetId, refreshData };
};
