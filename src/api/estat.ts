/**
 * e-Stat (政府統計) APIを用いた小売物価調査データの取得サービス
 * 「生活必需品」の地域別平均価格をシミュレーション/取得します。
 */

const ESTAT_BASE_URL = 'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData';
// 🏮 [OFFICIAL STATS SOURCES]
// Weekly: 0003421913 (Foods)
// Monthly: 0003412351 (Retail Price Survey - TOKYO)
export const ESTAT_ITEM_MAP: Record<string, { id: string, code: string }> = {
  rice:      { id: '0003421913', code: '01001' }, // うるち米
  bread:     { id: '0003421913', code: '01021' }, // 食パン
  egg:       { id: '0003421913', code: '01341' }, // 鶏卵
  milk:      { id: '0003421913', code: '01303' }, // 牛乳(紙パック入り)
  tp:        { id: '0003412351', code: '04413' }, // トイレットペーパー
  detergent: { id: '0003412351', code: '04441' }, // 洗濯用洗剤
  water:     { id: '0003412351', code: '01982' }, // ミネラルウォーター
  oil:       { id: '0003421913', code: '01601' }, // 食用油 (Weekly)
  tissue:    { id: '0003412351', code: '04412' }, // ティッシュペーパー
};

/**
 * Fetches the latest regional average price from e-Stat.
 * @param genreId Internal genre ID (e.g., 'rice')
 * @returns Average price (number) or null if failed
 */
export const fetchRegionalAveragePrice = async (genreId: string): Promise<number | null> => {
  const appId = import.meta.env.VITE_ESTAT_APP_ID;
  const config = ESTAT_ITEM_MAP[genreId];

  if (!appId || !config) {
    console.warn(`e-Stat integration skipped for ${genreId}: No appId or mapping.`);
    return null;
  }

  const TOKYO_AREA_CODE = '13100';

  try {
    const url = `${ESTAT_BASE_URL}?appId=${appId}&statsDataId=${config.id}&cdCat02=${config.code}&cdArea=${TOKYO_AREA_CODE}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // e-Stat JSON structure traversal
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
        case 'tp':      return Math.round(rawPrice / 12);  // e-Stat: 12ロール -> Dashboard: 1ロール相当の基準
        default:        return rawPrice;
      }
    }

    return null;
  } catch (error) {
    console.error(`e-Stat fetch failed for ${genreId}:`, error);
    return null;
  }
};
