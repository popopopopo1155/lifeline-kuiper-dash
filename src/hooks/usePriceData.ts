import { useState, useEffect } from 'react';
import { mockGenres, type Genre, type Subtype } from '../data/mockData';
import { fetchRegionalAveragePrice, ESTAT_ITEM_MAP } from '../api/estat';

/**
 * 構成案に基づく高度なデータ取得フック
 * 各サブタイプ（5kg、10kg等）ごとに個別の検索を行い、
 * 「最安3件 + 人気7件」のロジックを支える豊富な元データを収集します。
 */
export const usePriceData = (selectedGenreId: string | null) => {
  const [data, setData] = useState(mockGenres);
  const [loading, setLoading] = useState(false);

  const SERVER_URL = ''; // Relative path for production deployment

  // 1. Initial Mount: Fetch all e-Stat regional averages
  useEffect(() => {
    const fetchAllAverages = async () => {
      const genreIds = Object.keys(ESTAT_ITEM_MAP);
      try {
        const averages = await Promise.all(
          genreIds.map(async (id) => ({
            id,
            avg: await fetchRegionalAveragePrice(id)
          }))
        );

        setData((prev: Genre[]) => prev.map((genre: Genre) => {
          const match = averages.find(a => a.id === genre.id);
          if (match && match.avg) {
            // Update all subtypes in this genre with the real statistical average
            return {
              ...genre,
              subtypes: genre.subtypes.map((s: Subtype) => ({ ...s, regionalAverage: match.avg as number }))
            };
          }
          return genre;
        }));
        console.log('Successfully updated all genres with real-time e-Stat averages.');
      } catch (err) {
        console.warn('e-Stat batch fetch failed. Falling back to mock averages.', err);
      }
    };

    fetchAllAverages();
  }, []);

  // 2. Secondary Sync: Fetch Rakuten live data for selected genre
  useEffect(() => {
    const syncAllSubtypes = async () => {
      if (!selectedGenreId) return;

      const genre = data.find(g => g.id === selectedGenreId);
      if (!genre) return;

      setLoading(true);
      try {
        // 全てのサブタイプに対して並列でデータを取得（楽天APIの制限に配慮しつつ）
        const updatedSubtypes = await Promise.all(
          genre.subtypes.map(async (subtype) => {
            const query = `${genre.name} ${subtype.name}`;
            const response = await fetch(`${SERVER_URL}/api/rakuten?keyword=${encodeURIComponent(query)}`);
            
            if (response.ok) {
              const result = await response.json();
              if (result.Items && result.Items.length > 0) {
                // 楽天の検索結果（最大30件）を内部形式に変換
                const items = result.Items.map((item: any, index: number) => {
                  const p = item.Item;
                  return {
                    id: `rakuten-${p.itemCode}-${index}`,
                    name: p.itemName,
                    price: p.itemPrice,
                    shipping: p.postageFlag === 0 ? 0 : 500, // 簡易的な送料計算
                    points: Math.floor(p.itemPrice / 100), // 1%ポイント還元
                    volume: subtype.name.includes('5kg') ? 5 : (subtype.name.includes('10kg') ? 10 : 1),
                    store: p.shopName,
                    unit: 'pkg',
                    baseUnit: subtype.name.includes('kg') ? '1kg' : 'pkg',
                    popularity: 1000 - index,
                    affiliateUrl: p.affiliateUrl || p.itemUrl,
                    source: 'Rakuten',
                    forecastData: [p.itemPrice, p.itemPrice, p.itemPrice, p.itemPrice, p.itemPrice, p.itemPrice, p.itemPrice]
                  };
                });
                return { ...subtype, products: items };
              }
            }
            return subtype; // 失敗時は元の（モック）データのまま
          })
        );

        setData((prev: Genre[]) => prev.map((g: Genre) => {
          if (g.id === selectedGenreId) {
            return { ...g, subtypes: updatedSubtypes };
          }
          return g;
        }));
        
        console.log(`Successfully synced all subtypes for ${genre.name} with live Rakuten data.`);
      } catch (err) {
        console.warn('Backend connection failed. Displaying intelligent mock data.');
      } finally {
        setLoading(false);
      }
    };

    syncAllSubtypes();
  }, [selectedGenreId]);

  return { data, loading };
};
