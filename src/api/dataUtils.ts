/**
 * 商品名から容量（g, ml, kg, L）や入数（本, ヶ, 枚）を抽出するユーティリティ
 */

export const extractVolume = (name: string): { value: number; unit: string } | null => {
  // 1. kg / L の抽出 (1.5kg, 2L等)
  const kgMatch = name.match(/(\d+\.?\d*)\s*(kg|L|k|ℓ)/i);
  if (kgMatch) {
    return { value: parseFloat(kgMatch[1]), unit: kgMatch[2].toLowerCase() };
  }

  // 2. g / ml の抽出 (500ml, 380g等)
  const gMatch = name.match(/(\d+)\s*(g|ml|mℓ)/i);
  if (gMatch) {
    return { value: parseInt(gMatch[1], 10), unit: gMatch[2].toLowerCase() };
  }

  return null;
};

export const extractQuantity = (name: string): number => {
  // 入数 (24本, 6個, 5枚等)
  const qMatch = name.match(/(\d+)\s*(本|ヶ|個|枚|袋|ロール|R|箱|P|パック)/i);
  if (qMatch) {
    return parseInt(qMatch[1], 10);
  }
  return 1;
};

/**
 * ジャンルに応じた「標準単位」に変換したボリュームを算出して返す
 * 例: 米(1kg単位), 水(1本単位), 洗剤(100g単位)
 */
export const getNormalizedVolume = (name: string, unitType: string): number => {
  const vol = extractVolume(name);
  const qty = extractQuantity(name);

  let totalValue = (vol ? vol.value : 1) * qty;
  const unit = vol ? vol.unit : '';

  switch (unitType) {
    case '1kg':
      if (unit === 'g') return totalValue / 1000;
      return totalValue; // すでにkg前提
    case '100g':
    case '100ml':
      if (unit === 'kg' || unit === 'l') return totalValue * 10; // 1kg -> 100g x 10
      return totalValue / 100; // 500g -> 5.0 (units of 100g)
    case '1bottle':
    case '1roll':
    case '1pack':
    case '1bag':
    case '100sheets':
    case '100組':
      return totalValue / 200; // 9000枚 -> 45 (units of 100組)
    default:
      return totalValue;
  }
};
