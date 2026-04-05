/**
 * 商品名から容量（g, ml, kg, L）や入数（本, ヶ, 枚）を抽出するユーティリティ
 */

export const extractVolume = (name: string): { value: number; unit: string } | null => {
  // 1. kg / L の抽出 (1.5kg, 2L等)
  const kgMatch = name.match(/(\d+\.?\d*)\s*(kg|L|k|ℓ)/i);
  if (kgMatch) {
    return { value: parseFloat(kgMatch[1]), unit: kgMatch[2].toLowerCase() };
  }

  // 2. g / ml / 枚 / 組 / m の抽出
  const gMatch = name.match(/(\d+(?:\.\d+)?)\s*(g|ml|mℓ|枚|組|m|メートル)/i);
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
 * 例: 米(1kg単位), 水(1本単位), 洗剤(100g単位), TP(100m単位)
 */
export const getNormalizedVolume = (name: string, unitType: string, pVolume?: number, pUnit?: string, lengthPerRoll?: number): number => {
  // 1. 基本ボリューム情報の取得
  const volInfo = (pVolume !== undefined && pUnit !== undefined) 
    ? { value: pVolume, unit: pUnit }
    : extractVolume(name);
  
  // 2. 入数の取得
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
      if (unit === 'kg' || unit === 'l') return totalValue * 10; 
      return totalValue / 100; 
    case '100m':
      // トイレットペーパー専用: 100メートルあたりの単価計算用
      // もし単位が 'm' ならそのまま合計メートルを使用
      if (unit === 'm' || unit === 'メートル') return totalValue / 100;
      
      // 単位が 'ロール' や 'r' の場合、1ロールあたりの長さを推測する
      if (unit === 'ロール' || unit === 'r' || unit === 'roll' || unit === '') {
        // 1. 引数として明示的に「長さ」が渡されている場合は最優先
        let lpr = (lengthPerRoll && lengthPerRoll > 0) ? lengthPerRoll : 0;

        // 2. 渡されていない場合は、名前から「50m」などを探す
        if (lpr === 0) {
          const mMatch = name.match(/(\d+)\s*m/i);
          lpr = mMatch ? parseInt(mMatch[1], 10) : 0;
        }
        
        // 3. 解析も失敗した場合はキーワードから推測
        if (lpr === 0) {
          if (name.includes('3倍') || name.includes('75m')) lpr = 75;
          else if (name.includes('2倍') || name.includes('50m')) lpr = 50;
          else if (name.includes('4倍') || name.includes('100m')) lpr = 100;
          else if (name.includes('ダブル')) lpr = 25; 
          else if (name.includes('シングル')) lpr = 50;
          else lpr = 25; 
        }
        
        const totalMeters = totalValue * lpr;
        return totalMeters / 100; // 100m単位の数値を返す
      }
      return totalValue;
    case '1bottle':
    case '1roll':
    case '1pack':
    case '1bag':
      return totalValue; 
    case '100sheets':
    case '100組':
      if (unit === '枚') return totalValue / 200; 
      return totalValue / 100; 
    case '1wash':
    case '1回':
      if (unit === 'g') return totalValue / 20; 
      if (unit === 'ml' || unit === 'mℓ') {
        const isCompact = /ZERO|濃厚|コンパクト|ナノックス|NANOX/i.test(name);
        return totalValue / (isCompact ? 10 : 25);
      }
      return totalValue; 
    default:
      return totalValue;
  }
};
