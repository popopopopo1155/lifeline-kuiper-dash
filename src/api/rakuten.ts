/**
 * 楽天商品検索APIを用いたデータ取得サービス
 */

const RAKUTEN_BASE_URL = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';

export const fetchRakutenPrices = async (keyword: string) => {
  const appId = import.meta.env.VITE_RAKUTEN_APP_ID;
  if (!appId) {
    console.warn('Rakuten App ID is missing. Falling back to mock data.');
    return null;
  }

  try {
    const response = await fetch(`${RAKUTEN_BASE_URL}?applicationId=${appId}&keyword=${encodeURIComponent(keyword)}&format=json`);
    const data = await response.json();
    return data.Items || [];
  } catch (error) {
    console.error('Rakuten API failed:', error);
    return null;
  }
};
