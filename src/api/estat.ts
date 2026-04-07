// [SECURE PROXY LINK]
// クライアントサイドでのキー露出を避けるため、自社サーバーのプロキシ経由で取得します。
export interface PriceDataResponse {
  latest: number;
  history: number[];
}

// [STATISTICAL INHERITANCE] - 統計データを時系列（履歴）で取得
export const fetchRegionalPriceData = async (genreId: string): Promise<PriceDataResponse | null> => {
  try {
    const response = await fetch(`/api/estat?genreId=${genreId}`);
    if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
    
    const data = await response.json();
    const values = data?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE;

    if (values && (Array.isArray(values) ? values.length > 0 : values['$'])) {
      const rawValues = Array.isArray(values) ? values : [values];
      
      // [CHRONO REVERSE] - e-Stat は降順(最新から)のため、昇順(古い順)に変換してグラフ表示に適合させる
      const history = rawValues
        .map((v: any) => parseFloat(v['$']))
        .filter((v: number) => !isNaN(v))
        .reverse()
        .slice(-15); // 最新 15 期間分を使用

      // [UNIT NORMALIZATION] - 各品目の単位換算（お米 5kg -> 1kgなど）を履歴全体に適用
      const normalize = (val: number) => {
        switch (genreId) {
          case 'rice':    return Math.round(val / 5);
          case 'tissue':  return Math.round(val / 10);
          case 'tp':      return Math.round(val / 12);
          default:        return Math.round(val);
        }
      };

      const normalizedHistory = history.map(normalize);
      const latest = normalizedHistory[normalizedHistory.length - 1];

      return { latest, history: normalizedHistory };
    }

    return null;
  } catch (error) {
    console.error(`e-Stat fetch failed via Proxy [${genreId}]:`, error);
    return null;
  }
};
