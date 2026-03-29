/**
 * Keepa API を用いた Amazon 価格推移データの取得サービス
 * セキュリティのため、Vercel プロキシ経由で取得します。
 */

const SERVER_URL = ''; // Relative path for the proxy

export const fetchKeepaHistory = async (asin: string) => {
  if (!asin) return null;

  try {
    const response = await fetch(`${SERVER_URL}/api/keepa?asin=${asin}`);
    if (!response.ok) {
      console.warn('Keepa proxy responded with error. Falling back to mock.');
      return null;
    }
    const data = await response.json();
    return data.products?.[0]; // Keepa returns an array of products
  } catch (error) {
    console.error('Keepa fetch failed:', error);
    return null;
  }
};
