// [SECURE PROXY LINK]
// クライアントサイドでのキー露出を避けるため、自社サーバーのプロキシ経由で取得します。
export const fetchRegionalAveragePrice = async (genreId: string): Promise<number | null> => {
  try {
    // 開発環境と本番環境の両方に対応（同一ドメイン想定）
    const response = await fetch(`/api/estat?genreId=${genreId}`);
    if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
    
    const data = await response.json();
    
    // e-Stat JSON structure traversal
    const values = data?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE;
    if (values && (Array.isArray(values) ? values.length > 0 : values['$'])) {
      // [PRECISION INDEX] 配列の先頭が最新であることを確認済み
      const latest = Array.isArray(values) ? values[0] : values;
      const priceString = latest['$'];
      if (!priceString || priceString === '-') return null;
      
      const rawPrice = parseFloat(priceString);
      if (isNaN(rawPrice)) return null;

      // [UNIT NORMALIZATION] - 各品目の統計単位を互換性のある形式へ変換
      // サーバー側では生データを返し、変換ロジックはフロントエンドで保持（柔軟性のため）
      switch (genreId) {
        case 'rice':    return Math.round(rawPrice / 5);   // e-Stat: 5kg -> Dashboard: 1kg
        case 'tissue':  return Math.round(rawPrice / 10);  // e-Stat: 5箱(1000組想定) -> Dashboard: 100組
        case 'tp':      return Math.round(rawPrice / 12);  // e-Stat: 12ロール -> Dashboard: 1ロール相当の基準
        default:        return rawPrice;
      }
    }

    return null;
  } catch (error) {
    console.error(`e-Stat fetch failed via Proxy [${genreId}]:`, error);
    return null;
  }
};
