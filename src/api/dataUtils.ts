/**
 * 商品名から容量（g, ml, kg, L）や入数（本, ヶ, 枚）を抽出するユーティリティ
 */

export const extractVolume = (name: string): { value: number; unit: string } | null => {
  // 1. kg / L の抽出 (1.5kg, 2L等)
  const kgMatch = name.match(/(\d+\.?\d*)\s*(kg|L|k|ℓ)/i);
  if (kgMatch) {
    return { value: parseFloat(kgMatch[1]), unit: kgMatch[2].toLowerCase() };
  }

  // 2. g / ml / 枚 / 組 の抽出
  const gMatch = name.match(/(\d+(?:\.\d+)?)\s*(g|ml|mℓ|枚|組)/i);
  if (gMatch) {
    return { value: parseFloat(gMatch[1]), unit: gMatch[2].toLowerCase() };
  }

  return null;
};

export const extractQuantity = (name: string): number => {
  // 入数 (24本, 6個, 5枚等)
  const qMatch = name.match(/(\d+)\s*(本|ヶ|個|枚|組|袋|ロール|R|箱|P|パック)/i);
  if (qMatch) {
    return parseInt(qMatch[1], 10);
  }
  return 1;
};

/**
 * ジャンルに応じた「標準単位」に変換したボリュームを算出して返す
 * 例: 米(1kg単位), 水(1本単位), 洗剤(100g単位)
 */
export const getNormalizedVolume = (name: string, unitType: string, pVolume?: number, pUnit?: string): number => {
  // すでに数値がある場合はそれを使用し、なければ解析する
  const volInfo = (pVolume !== undefined && pUnit !== undefined) 
    ? { value: pVolume, unit: pUnit }
    : extractVolume(name);
  
  // 数値が明示されている場合は入数を掛けない（すでに総量であると仮定）
  const qty = (pVolume !== undefined) ? 1 : extractQuantity(name);

  let totalValue = (volInfo ? volInfo.value : 1) * qty;
  const unit = volInfo ? volInfo.unit : '';

  switch (unitType) {
    case '1kg':
    case '1L':
      if (unit === 'g' || unit === 'ml' || unit === 'mℓ') return totalValue / 1000;
      return totalValue; 
    case '100g':
    case '100ml':
      if (unit === 'kg' || unit === 'l') return totalValue * 10; // 1kg -> 100g x 10
      return totalValue / 100; // 500g -> 5.0 (units of 100g)
    case '1bottle':
    case '1roll':
    case '1pack':
    case '1bag':
      return totalValue; // 個数ベース
    case '100sheets':
    case '100組':
      // 1組 = 2枚(sheets)
      if (unit === '枚') return totalValue / 200; 
      return totalValue / 100; // '組'ベースまたは単位なし(通常は150組や200組)
    case '1wash':
    case '1回':
      if (unit === 'g') return totalValue / 20; // 粉末標準: 20g/回
      if (unit === 'ml' || unit === 'mℓ') {
        // 濃縮タイプ(10ml)か通常タイプ(25ml)かを判定
        // 商品名に「ZERO」「濃厚」「コンパクト」等があれば10ml、なければ25mlと仮定
        const isCompact = /ZERO|濃厚|コンパクト|ナノックス|NANOX/i.test(name);
        return totalValue / (isCompact ? 10 : 25);
      }
      return totalValue; // ジェルボール等(単位なし/個)はそのまま個数が回数
    default:
      return totalValue;
  }
};
