/**
 * Keepa API を用いた Amazon 価格推移データの取得サービス
 */

const KEEPA_BASE_URL = 'https://api.keepa.com/product';

export const fetchKeepaHistory = async (asin: string) => {
  const apiKey = import.meta.env.VITE_KEEPA_API_KEY;
  if (!apiKey) {
    console.warn('Keepa API Key is missing. Falling back to internal historical simulation.');
    return null;
  }

  try {
    const response = await fetch(`${KEEPA_BASE_URL}?key=${apiKey}&domain=1&asin=${asin}&stats=1`);
    const data = await response.json();
    return data.products?.[0];
  } catch (error) {
    console.error('Keepa API failed:', error);
    return null;
  }
};
