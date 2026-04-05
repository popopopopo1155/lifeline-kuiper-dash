
import { fetchRegionalAveragePrice, ESTAT_ITEM_MAP } from '../src/api/estat';

// 🏮 [EMERGENCY STATS AUDIT] - 知性の真実性を証明するための検証スクリプト
async function auditAllStats() {
  console.log('--- 🏮 STATS AUDIT START ---');
  for (const [genreId, code] of Object.entries(ESTAT_ITEM_MAP)) {
    try {
      const price = await fetchRegionalAveragePrice(genreId);
      console.log(`[${genreId.toUpperCase()}] e-Stat Mapping: ${code} -> Normalized Price: ¥${price}`);
    } catch (err) {
      console.error(`[${genreId.toUpperCase()}] FAILED:`, err.message);
    }
  }
  console.log('--- 🏮 STATS AUDIT END ---');
}

// 疑似的な環境変数をセットして実行 (実際の API 通信を確認)
auditAllStats();
