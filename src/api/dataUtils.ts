/**
 * Keepa CSV形式のデータを価格配列に変換するユーティリティ
 */
export const parseKeepaCsv = (csv: number[] | undefined, typeIndex: number = 0) => {
  if (!csv) return [];
  
  // KeepaのCSVは [時間, 価格, 時間, 価格, ...] という形式
  const prices: number[] = [];
  for (let i = 1; i < csv.length; i += 2) {
    if (csv[i] < 0) continue; // -1などは「在庫なし」
    prices.push(csv[i] / 100); // セント・円単位を整数化
  }

  // 最新の7つ（または必要数）を抽出してスパークラインに使用
  return prices.slice(-7);
};

export const calculateTrend = (prices: number[]) => {
  if (prices.length < 2) return 'stable';
  const first = prices[0];
  const last = prices[prices.length - 1];
  if (last > first * 1.02) return 'rising';
  if (last < first * 0.98) return 'falling';
  return 'stable';
};
