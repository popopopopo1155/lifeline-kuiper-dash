const fs = require('fs');

const KEEPA_API_KEY = '5cm303g78tl9pungfs0ccj42mftedb1u6e8ostesfvlld26d4a7uhin9kgtgs5gj';

const asins = [
  'B0C68JY8JH', // AJINOMOTO 6pk
  'B0CLRVFYH4', // Riken 16.5kg
  'B0076JROJ8', // Riken 16.5kg Alt
  'B0C4K6H3F6', // Tsuji 16.5kg
  'B0D4QK158P', // Gran Maestro 5L
  'B07V7BY5NC', // CIVGIS EVOO 3pk (FIXED)
  'B019YVUSFM', // Garcia EVOO 5L
  'B082VJVWS7', // Kirkland EVOO 3L
  'B001HYWMVI', // Kadoya 6pk
  'B002QEL0AW', // Kadoya 1650g
  'B003FSST4I', // Maruhon 1650g
  'B00DAO732G'  // Maruhon Taiko 1650g (FIXED)
];

async function syncKeepa() {
  console.log('🏮 食用油・真のAPI同期 (Keepa / Amazon.co.jp) を開始します...');
  const results = [];

  for (const asin of asins) {
    try {
      // domain=9 is Amazon.co.jp
      const url = `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=9&asin=${asin}&stats=90`;
      const response = await fetch(url);
      const data = await response.json();
      
      const product = data.products?.[0];
      if (product && product.stats) {
        const currentPrice = product.stats.current[0] / 100;
        const avg90 = product.stats.avg90[0] / 100;
        const isBottom = currentPrice <= avg90;
        
        results.push({
          asin,
          title: product.title || 'Unknown Title',
          currentPrice,
          avg90,
          isBottom,
          status: 'SUCCESS'
        });
        console.log(`✅ [${asin}] ${ (product.title || '').substring(0, 20) }...: ¥${currentPrice} (Avg90: ¥${avg90})`);
      } else {
        results.push({ asin, status: 'NOT_FOUND', raw: data });
        console.warn(`❌ [${asin}] 商品または統計データが見つかりませんでした。理由: ${data.error?.message || '不明'}`);
      }
    } catch (error) {
      results.push({ asin, status: 'ERROR', error: error.message });
      console.error(`🚨 [${asin}] 通信エラーが発生しました:`, error.message);
    }
  }

  const outPath = 'tmp/oil_keepa_results.json';
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\n🏮 Keepa同期完了。結果量: ${results.length} 件`);
}

syncKeepa();
