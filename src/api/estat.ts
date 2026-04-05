import axios from 'axios';

// e-Stat API v3.0 定数
const ESTAT_BASE_URL = 'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData';
const ESTAT_APP_ID = import.meta.env.VITE_ESTAT_APP_ID;

// 統計表ID: 小売物価統計調査（動向編）- 全国平均価格
// ※最新の情報を動的に取得するため、月次データのテーブルIDを固定、または最新を狙う
const ESTAT_STATS_DATA_ID = '0003427144'; 

// e-Stat 品目コードマッピング (小売物価統計調査)
const ITEM_MAPPING: Record<string, string> = {
  RICE: '1001',      // うるち米 (非コシヒカリ/コシヒカリの調整が必要だがまずは代表コード)
  BREAD: '1011',     // 食パン
  EGG: '1611',       // 鶏卵 (Lサイズ/10個)
  WATER: '7004',     // ミネラルウォーター
  DETERGENT: '8021', // 洗濯用合成洗剤 (参考値)
};

export interface AveragePriceData {
  categoryId: string;
  price: number; // 単位あたりの価格
  unit: string;
  lastUpdated: string;
}

/**
 * e-Stat から日本の平均価格（小売物価統計）を取得する
 */
export const fetchAveragePrices = async (): Promise<AveragePriceData[]> => {
  if (!ESTAT_APP_ID) {
    console.warn('🏮 [ESTAT] App ID missing. Using fallbacks.');
    return getFallbackPrices();
  }

  try {
    const response = await axios.get(ESTAT_BASE_URL, {
      params: {
        appId: ESTAT_APP_ID,
        statsDataId: ESTAT_STATS_DATA_ID,
        lang: 'J',
        metaGetFlg: 'Y',
        cntGetFlg: 'N',
        // 全国平均(コード: 00000)を指定して絞り込む（API仕様に依存）
        cdArea: '00000' 
      },
      timeout: 15000 
    });

    const data = response.data.GET_STATS_DATA;
    if (data.RESULT.STATUS !== 0) {
      throw new Error(`e-Stat API Error: ${data.RESULT.ERROR_MSG}`);
    }

    const statisticalData = data.STATISTICAL_DATA.DATA_INF.VALUE;
    const results: AveragePriceData[] = [];

    // e-Stat のネストされたデータを解析し、必要な品目だけを抽出
    Object.keys(ITEM_MAPPING).forEach(categoryId => {
      const itemCode = ITEM_MAPPING[categoryId];
      // 品目コード(cdCat01)が一致する最新価格を検索
      const priceEntry = statisticalData.find((d: any) => d['@cat01'] === itemCode);
      
      if (priceEntry) {
        results.push({
          categoryId,
          price: parseFloat(priceEntry['$']),
          unit: '円', 
          lastUpdated: priceEntry['@time'] || new Date().toISOString()
        });
      }
    });

    return results;
  } catch (error: any) {
    console.error('❌ e-Stat Fetch Failed:', error.message);
    return getFallbackPrices(); // 失敗時は「信頼できる暫定値」を返す
  }
};

/**
 * e-Stat が不安定、または ID がない場合のフォールバック（最新の公表値に基づく）
 */
function getFallbackPrices(): AveragePriceData[] {
  const now = new Date().toISOString();
  return [
    { categoryId: 'RICE', price: 3450, unit: '5kg', lastUpdated: now }, // 2024-2025 平均
    { categoryId: 'EGG', price: 298, unit: '10個', lastUpdated: now },
    { categoryId: 'WATER', price: 110, unit: '2L', lastUpdated: now },
    { categoryId: 'BREAD', price: 185, unit: '6枚', lastUpdated: now },
  ];
}
