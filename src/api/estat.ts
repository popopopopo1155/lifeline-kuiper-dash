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
    
    const text = await response.text();
    console.log(`📡 Raw e-Stat JSON [${genreId}]:`, text.substring(0, 100));
    const data = JSON.parse(text);
    
    // [NESTED PATH AUDIT] - 階層構造の揺れを吸収しながら VALUE を抽出
    const statisticalData = data?.GET_STATS_DATA?.STATISTICAL_DATA;
    const values = statisticalData?.DATA_INF?.VALUE;

    if (values) {
      // 配列であればそのまま、オブジェクトであれば配列化して統一
      const rawValues = Array.isArray(values) ? values : [values];
      
      // [CHRONO REVERSE] - e-Stat は降順(最新から)のため、昇順(古い順)に変換
      // 数値が配列の深い場所にあっても確実に parseFloat できるように防衛
      const history = rawValues
        .map((v: any) => {
          const val = v?.['$'];
          return val ? parseFloat(val) : NaN;
        })
        .filter((v: number) => !isNaN(v))
        .reverse()
        .slice(-20); // 最新 20 期間分を安定して使用

      if (history.length === 0) return null;

      const normalize = (val: number) => {
        if (genreId === 'rice') return Math.round(val / 5);
        if (genreId === 'tissue') return Math.round(val / 10);
        if (genreId === 'tp') return Math.round(val / 12);
        return Math.round(val);
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
