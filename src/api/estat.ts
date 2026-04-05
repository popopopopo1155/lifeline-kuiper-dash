/**
 * e-Stat (政府統計) APIを用いた小売物価調査データの取得サービス
 * 「生活必需品」の地域別平均価格をシミュレーション/取得します。
 */

const ESTAT_BASE_URL = 'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData';
const RETAIL_PRICE_STATS_ID = '0003421913';
const TOKYO_AREA_CODE = '13100'; // 東京都区部

export const ESTAT_ITEM_MAP: Record<string, string> = {
  rice: '01001',      // うるち米
  bread: '01021',     // 食パン
  egg: '01341',       // 鶏卵
  milk: '01303',      // 牛乳(紙パック入り)
  tp: '04413',        // トイレットペーパー
  detergent: '04441', // 洗濯用洗剤
  water: '01982',     // ミネラルウォーター
  oil: '01601',       // 食用油
  tissue: '04412',    // ティッシュペーパー
};

/**
 * Fetches the latest regional average price from e-Stat (Retail Price Survey).
 * @param genreId Internal genre ID (e.g., 'rice')
 * @returns Average price (number) or null if failed
 */
export const fetchRegionalAveragePrice = async (genreId: string): Promise<number | null> => {
  const appId = import.meta.env.VITE_ESTAT_APP_ID;
  const itemCode = ESTAT_ITEM_MAP[genreId];

  if (!appId || !itemCode) {
    console.warn(`e-Stat integration skipped for ${genreId}: No appId or mapping.`);
    return null;
  }

  try {
    const url = `${ESTAT_BASE_URL}?appId=${appId}&statsDataId=${RETAIL_PRICE_STATS_ID}&cdCat02=${itemCode}&cdArea=${TOKYO_AREA_CODE}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const values = data?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE;
    if (values && (Array.isArray(values) ? values.length > 0 : values['$'])) {
      const latest = Array.isArray(values) ? values[values.length - 1] : values;
      const priceString = latest['$'];
      if (!priceString || priceString === '-') return null;
      
      const rawPrice = parseFloat(priceString);
      if (isNaN(rawPrice)) return null;

      // 🏮 [UNIT NORMALIZATION] - 各品目の統計単位を Dashboard の基準単位へ変換
      switch (genreId) {
        case 'rice':    return Math.round(rawPrice / 5);   // e-Stat: 5kg -> Dashboard: 1kg
        case 'tissue':  return Math.round(rawPrice / 10);  // e-Stat: 5箱(1000組想定) -> Dashboard: 100組
        case 'tp':      return Math.round(rawPrice / 12);  // e-Stat: 12ロール -> Dashboard: 1ロール相当の基準 (※100m換算は別途)
        default:        return rawPrice;
      }
    }

    return null;
  } catch (error) {
    console.error(`e-Stat fetch failed for ${genreId}:`, error);
    return null;
  }
};
