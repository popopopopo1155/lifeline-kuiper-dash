import type { Product, Genre } from '../types';

import { getNormalizedVolume } from '../api/dataUtils';

export const calculateUnitPrice = (p: Product) => {
  const normVol = getNormalizedVolume(p.name, p.baseUnit || '');
  return Math.round((p.price + p.shipping - p.points) / (normVol || p.volume || 1));
};

export interface SubtypeMetadata {
  searchOverride?: string;
  requiredKeywords?: string[];
  excludeKeywords?: string[];
  [key: string]: any; // Allowing extra fields if needed
}

const RAKU_AFL_ID = '5025407c.d8994699.5025407d.e9a413e7';
const AMA_AFL_TAG = 'mangaanimeosu-22';

export const wrapRaku = (pcUrl: string) => {
  const encPc = encodeURIComponent(pcUrl);
  return `https://hb.afl.rakuten.co.jp/hgc/${RAKU_AFL_ID}/?pc=${encPc}&m=${encPc}`;
};

export const wrapAma = (url: string) => {
  // ASINの抽出を試みる (B0で始まる10桁の文字列)
  const asinMatch = url.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i) || url.match(/\/([B0-9][A-Z0-9]{9})(?:[/?]|$)/);
  if (asinMatch && asinMatch[1]) {
    return `https://www.amazon.co.jp/gp/product/${asinMatch[1]}/?tag=${AMA_AFL_TAG}`;
  }
  
  // 抽出失敗時は既存のクエリパラメータ付与
  if (url.includes('?')) {
    if (url.includes('tag=')) return url;
    return `${url}&tag=${AMA_AFL_TAG}`;
  }
  return `${url}?tag=${AMA_AFL_TAG}`;
};

export const mockGenres: (Genre & { subtypes: (any & SubtypeMetadata)[] })[] = [
  // --- STOCK GROUP (Bulk/E-commerce Focus) ---
  {
    id: 'rice',
    name: '米',
    group: 'stock',
    unitType: '1kg',
    historyData: [620, 615, 608, 605, 595, 580, 560, 550, 538, 550, 560, 575, 590, 605, 608],
    subtypes: [
      {
        id: 'rice-5kg',
        name: '5kg',
        regionalAverage: 580,
        representativeAsin: 'B076C6T6L7',
        searchOverride: '白米 5kg 送料無料 -定期便 -ふるさと納税',
        requiredKeywords: ['5kg'],
        excludeKeywords: ['定期便', 'ふるさと納税'],
        products: [
          { 
            id: 'rice-5-v1', 
            name: '[国産100%] 小粒米 (中粒米混) 5kg - ¥2,900 (1kg¥580)', 
            price: 2900, shipping: 0, points: 0, volume: 5, unit: 'kg', baseUnit: '1kg',
            store: 'amazon', asin: 'B0CHY6V8C9', popularity: 100,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0CHY6V8C9'),
            forecastData: [2900, 2900, 2900, 2900, 2900, 2900, 2900]
          },
          { 
            id: 'rice-5-v2', 
            name: '令和7年産入り 生活応援米 5kg - ¥2,950 (1kg¥590)', 
            price: 2950, shipping: 0, points: 0, volume: 5, unit: 'kg', baseUnit: '1kg',
            store: 'rakuten', rakutenCode: 'syokutakuouendan:rice-5kg-f01', popularity: 98,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/syokutakuouendan/rice-5kg-f01/'),
            forecastData: [2950, 2950, 2950, 2950, 2950, 2950, 2950]
          },
          { 
            id: 'rice-5-v3', 
            name: '生活応援米 ここごめさん 5kg - ¥2,980 (1kg¥596)', 
            price: 2980, shipping: 0, points: 0, volume: 5, unit: 'kg', baseUnit: '1kg',
            store: 'rakuten', rakutenCode: 'syokutakuouendan:k-10p001', popularity: 95,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/syokutakuouendan/k-10p001/'),
            forecastData: [2980, 2980, 2980, 2980, 2980, 2980, 2980]
          },
          { 
            id: 'rice-5-v4', 
            name: '【食卓応援団】国内産ブレンド米 5kg 精米 - ¥3,132 (1kg¥626)', 
            price: 3132, shipping: 0, points: 0, volume: 5, unit: 'kg', baseUnit: '1kg',
            store: 'amazon', asin: 'B0CHY6V8C9_alt', popularity: 92,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0CHY6V8C9'),
            forecastData: [3132, 3132, 3132, 3132, 3132, 3132, 3132]
          },
          { 
            id: 'rice-5-v5', 
            name: '令和7年新米入 生活応援家計応援米 5kg - ¥3,280 (1kg¥656)', 
            price: 3280, shipping: 0, points: 0, volume: 5, unit: 'kg', baseUnit: '1kg',
            store: 'rakuten', rakutenCode: 'rice-smile:sc-s2805', popularity: 85,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/rice-smile/sc-s2805/'),
            forecastData: [3280, 3280, 3280, 3280, 3280, 3280, 3280]
          }
        ]
      },
      {
        id: 'rice-10kg',
        name: '10kg',
        regionalAverage: 538,
        representativeAsin: 'B0GQ2FV1NC',
        searchOverride: '米 10kg -ふるさと納税 -定期便 -業務用',
        requiredKeywords: ['10kg'],
        excludeKeywords: ['定期便', 'ふるさと納税', '業務用'],
        products: [
          {
            id: 'rice-10kg-v1',
            name: '【食卓応援団】国内産ブレンド米 10kg (5kg×2) 精米 - ¥5,382 (1kg¥538)',
            price: 5382, shipping: 0, points: 0, volume: 10, unit: 'kg', baseUnit: '1kg',
            store: 'amazon', asin: 'B0GQ2FV1NC', popularity: 100,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0GQ2FV1NC'),
            forecastData: [5382, 5382, 5382, 5382, 5382, 5382, 5382]
          },
          {
            id: 'rice-10kg-v2',
            name: '国内産 ほほえみ米 10kg (5kg×2) - ¥5,480 (1kg¥548)',
            price: 5480, shipping: 0, points: 0, volume: 10, unit: 'kg', baseUnit: '1kg',
            store: 'rakuten', rakutenCode: 'ricetanaka:r-005', popularity: 95,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/ricetanaka/r-005/'),
            forecastData: [5480, 5480, 5480, 5480, 5480, 5480, 5480]
          },
          {
            id: 'rice-10kg-v3',
            name: '令和7年産入り 生活応援米 10kg (5kg×2) - ¥5,480 (1kg¥548)',
            price: 5480, shipping: 0, points: 0, volume: 10, unit: 'kg', baseUnit: '1kg',
            store: 'rakuten', rakutenCode: 'okaman:10000029-10', popularity: 92,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/okaman/10000029-1/'),
            forecastData: [5480, 5480, 5480, 5480, 5480, 5480, 5480]
          },
          {
            id: 'rice-10kg-v4',
            name: 'アメリカ・カリフォルニア産 カルローズ米 10kg - ¥5,580 (1kg¥558)',
            price: 5580, shipping: 0, points: 0, volume: 10, unit: 'kg', baseUnit: '1kg',
            store: 'rakuten', rakutenCode: 'skyfarm:karu', popularity: 88,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/skyfarm/karu/'),
            forecastData: [5580, 5580, 5580, 5580, 5580, 5580, 5580]
          },
          {
            id: 'rice-10kg-v5',
            name: '福島県産 ひとめぼれ 10kg (5kg×2) 訳あり - ¥6,799 (1kg¥680)',
            price: 6799, shipping: 0, points: 0, volume: 10, unit: 'kg', baseUnit: '1kg',
            store: 'rakuten', rakutenCode: 'jcrops:4562129938740-2-wake-05', popularity: 80,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/jcrops/4562129938740-2-wake-05/'),
            forecastData: [6799, 6799, 6799, 6799, 6799, 6799, 6799]
          }
        ]
      }
    ]
  },
  {
    id: 'water',
    name: '水',
    group: 'stock',
    unitType: '1bottle',
    historyData: [600, 595, 590, 588, 580, 570, 560, 550, 540, 550, 560, 570, 580, 588, 590],
    subtypes: [
      {
        id: 'water-500ml',
        name: '500ml',
        regionalAverage: 46, // 🏮 [REAL SYNC] Keepa 90d Avg (46円/本)
        representativeAsin: 'B094N6FW9M',
        searchOverride: '水 500ml 送料無料 -定期便 -ふるさと納税 -2L',
        requiredKeywords: ['500ml'],
        excludeKeywords: ['定期便', 'ふるさと納税'],
        products: [
          { 
            id: 'water-500-v1', 
            name: '[500ml×48本] 彩水-ayamizu- - ¥2,280 (1本¥47.5)', 
            price: 2280, shipping: 0, points: 64, volume: 48, unit: 'bottle', baseUnit: '1bottle',
            store: 'rakuten', rakutenCode: 'lifedrinkcompany:ayamizu-500-48', popularity: 99,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/lifedrinkcompany/ayamizu-500-48/'),
            forecastData: [2280, 2280, 2280, 2280, 2280, 2280, 2280]
          },
          { 
            id: 'water-500-v2', 
            name: '[500ml×24本] 楽天オリジナル 天然水 - ¥1,180 (1本¥49.2)', 
            price: 1180, shipping: 0, points: 10, volume: 24, unit: 'bottle', baseUnit: '1bottle',
            store: 'rakuten', rakutenCode: 'rakutenoriginal-daily:ro-b-001', popularity: 95,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/rakutenoriginal-daily/ro-b-001/'),
            forecastData: [1180, 1180, 1180, 1180, 1180, 1180, 1180]
          },
          { 
            id: 'water-500-v3', 
            name: '[500ml×42本] 国産 天然水 水想い - ¥2,078 (1本¥49.5)', 
            price: 2078, shipping: 0, points: 58, volume: 42, unit: 'bottle', baseUnit: '1bottle',
            store: 'rakuten', rakutenCode: 'mizuomoi:4571461293004', popularity: 92,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/mizuomoi/4571461293004/'),
            forecastData: [2078, 2078, 2078, 2078, 2078, 2078, 2078]
          },
          { 
            id: 'water-500-v4', 
            name: '[500ml×24本] 彩水 あやみず - ¥1,190 (1本¥49.6)', 
            price: 1190, shipping: 0, points: 12, volume: 24, unit: 'bottle', baseUnit: '1bottle',
            store: 'amazon', asin: 'B0CMPV8YL1', popularity: 90,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0CMPV8YL1'),
            forecastData: [1190, 1190, 1190, 1190, 1190, 1190, 1190]
          },
          { 
            id: 'water-500-v5', 
            name: '[500ml×24本] 富士山麓 天然水 ラベルレス - ¥1,210 (1本¥50.4)', 
            price: 1210, shipping: 0, points: 12, volume: 24, unit: 'bottle', baseUnit: '1bottle',
            store: 'amazon', asin: 'B0DDTG871Z', popularity: 88,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0DDTG871Z'),
            forecastData: [1210, 1210, 1210, 1210, 1210, 1210, 1210]
          }
        ]
      },
      {
        id: 'water-2l',
        name: '2L',
        regionalAverage: 111, // 🏮 [REAL SYNC] Keepa 90d Avg (111円/本)
        representativeAsin: 'B0C1FS43ZW',
        searchOverride: '水 2L 送料無料 -定期便 -ふるさと納税 -500ml',
        requiredKeywords: ['2L'],
        excludeKeywords: ['定期便', 'ふるさと納税'],
        products: [
          { 
            id: 'water-2l-v1', 
            name: '[2L×9本] by Amazon 天然水ラベルレス - ¥958 (1本¥106.4)', 
            price: 958, shipping: 0, points: 10, volume: 9, unit: 'bottle', baseUnit: '1bottle',
            store: 'amazon', asin: 'B08GZR18S3', popularity: 100,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B08GZR18S3'),
            forecastData: [958, 958, 958, 958, 958, 958, 958]
          },
          { 
            id: 'water-2l-v2', 
            name: '[2L×8本] い･ろ･は･す ラベルレス - ¥890 (1本¥111.2)', 
            price: 890, shipping: 0, points: 9, volume: 8, unit: 'bottle', baseUnit: '1bottle',
            store: 'amazon', asin: 'B08TV9VDR7', popularity: 98,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B08TV9VDR7'),
            forecastData: [890, 890, 890, 890, 890, 890, 890]
          },
          { 
            id: 'water-2l-v3', 
            name: '[2L×8本] 伊藤園 磨かれて、澄みきった日本の水 - ¥958 (1本¥119.7)', 
            price: 958, shipping: 0, points: 10, volume: 8, unit: 'bottle', baseUnit: '1bottle',
            store: 'amazon', asin: 'B0CG5X5MT4', popularity: 95,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0CG5X5MT4'),
            forecastData: [958, 958, 958, 958, 958, 958, 958]
          },
          { 
            id: 'water-2l-v4', 
            name: '[2L×9本] 富士山の天然水 ラベルレス - ¥1,080 (1本¥120.0)', 
            price: 1080, shipping: 0, points: 10, volume: 9, unit: 'bottle', baseUnit: '1bottle',
            store: 'rakuten', rakutenCode: 'inskagu:311615', popularity: 92,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/inskagu/311615/'),
            forecastData: [1080, 1080, 1080, 1080, 1080, 1080, 1080]
          },
          { 
            id: 'water-2l-v5', 
            name: '[2L×9本] アサヒ おいしい水 天然水 ラベルレス - ¥1,086 (1本¥121.0)', 
            price: 1086, shipping: 0, points: 11, volume: 9, unit: 'bottle', baseUnit: '1bottle',
            store: 'amazon', asin: 'B07RWWZT8J', popularity: 90,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B07RWWZT8J'),
            forecastData: [1086, 1086, 1086, 1086, 1086, 1086, 1086]
          }
        ]
      }
    ]
  },
  {
    id: 'tp',
    name: 'トイレットペーパー',
    group: 'stock',
    unitType: '1roll',
    historyData: [900, 880, 890, 898, 920, 950, 930, 920, 910, 898, 880, 898, 920, 940, 950],
    subtypes: [
      {
        id: 'tp-12r',
        name: 'トイレットペーパー (最安まとめ買い)',
        regionalAverage: 110,
        representativeAsin: 'B0CX9913JP',
        searchOverride: 'トイレットペーパー 12ロール 送料無料 -定期便 -ふるさと納税',
        requiredKeywords: ['12', 'ロール'],
        excludeKeywords: ['定期便', 'ふるさと納税'],
        products: [
          {
            id: 'tp-96r-coming-3200',
            name: '[96ロール] カミング 再生紙ダブル - ¥3,200 (1ロール¥33.3)',
            price: 3200, shipping: 0, points: 32, volume: 96, unit: 'roll', baseUnit: '1roll',
            store: 'rakuten', rakutenCode: 'coming:jun1kyuhinrolls-recycle12rw', popularity: 100,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/coming/jun1kyuhinrolls-recycle12rw/'),
            forecastData: [3200, 3200, 3200, 3200, 3200, 3200, 3200]
          },
          {
            id: 'tp-96r-coming-3280',
            name: '[96ロール] カミング エシカルダブル - ¥3,280 (1ロール¥34.2)',
            price: 3280, shipping: 0, points: 32, volume: 96, unit: 'roll', baseUnit: '1roll',
            store: 'rakuten', rakutenCode: 'coming:color-jun1kyuhinrolls-t', popularity: 98,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/coming/color-jun1kyuhinrolls-t/'),
            forecastData: [3280, 3280, 3280, 3280, 3280, 3280, 3280]
          },
          {
            id: 'tp-96r-noshiro-3380',
            name: '[96ロール] 能代製紙 バスターダブル - ¥3,380 (1ロール¥35.2)',
            price: 3380, shipping: 0, points: 33, volume: 96, unit: 'roll', baseUnit: '1roll',
            store: 'rakuten', rakutenCode: 'noshiroseishi:4958968-017-12rw', popularity: 95,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/noshiroseishi/4958968-017-12rw/'),
            forecastData: [3380, 3380, 3380, 3380, 3380, 3380, 3380]
          },
          {
            id: 'tp-96r-daisy-3480',
            name: '[96ロール] Amazon デイジーアロマ - ¥3,480 (1ロール¥36.3)',
            price: 3480, shipping: 0, points: 34, volume: 96, unit: 'roll', baseUnit: '1roll',
            store: 'amazon', asin: 'B0F37JL72Q', popularity: 92,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0F37JL72Q'),
            forecastData: [3349, 3349, 3349, 3349, 3349, 3349, 3349]
          },
          {
            id: 'tp-96r-noshiro-3480',
            name: '[96ロール] 能代製紙 ブランカダブル - ¥3,480 (1ロール¥36.3)',
            price: 3480, shipping: 0, points: 34, volume: 96, unit: 'roll', baseUnit: '1roll',
            store: 'rakuten', rakutenCode: 'noshiroseishi:4958968-004-12r', popularity: 90,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/noshiroseishi/4958968-004-12r/'),
            forecastData: [3480, 3480, 3480, 3480, 3480, 3480, 3480]
          }
        ]
      }
    ]
  },
  {
    id: 'egg',
    name: '卵',
    group: 'daily',
    unitType: '1pack',
    historyData: [260, 265, 270, 275, 280, 290, 300, 310, 315, 305, 295, 285, 275, 260, 240],
    subtypes: [
      {
        id: 'egg-10p',
        name: '10個パック',
        regionalAverage: 240,
        products: []
      }
    ]
  },
  {
    id: 'milk',
    name: '牛乳',
    group: 'daily',
    unitType: '1bottle',
    historyData: [240, 245, 250, 258, 260, 265, 270, 275, 280, 285, 290, 280, 270, 260, 258],
    subtypes: [
      {
        id: 'milk-1l',
        name: '1Lパック',
        regionalAverage: 210,
        products: []
      }
    ]
  },
  {
    id: 'bread',
    name: '食パン',
    group: 'daily',
    unitType: '1bag',
    historyData: [160, 165, 170, 178, 180, 185, 190, 195, 190, 185, 180, 178, 175, 170, 168],
    subtypes: [
      {
        id: 'bread-6',
        name: '6枚切',
        regionalAverage: 160,
        products: []
      }
    ]
  },
  {
    id: 'tissue',
    name: 'ティッシュ',
    group: 'stock',
    unitType: '100組',
    historyData: [350, 345, 340, 338, 330, 320, 310, 305, 300, 310, 320, 330, 338, 345, 350],
    subtypes: [
      {
        id: 'tissue-bulk',
        name: 'ティッシュ (最安まとめ買い)',
        regionalAverage: 65,
        representativeAsin: 'B07HDZH354',
        searchOverride: 'ティッシュ ソフトパック まとめ買い 60 80 90 100',
        requiredKeywords: ['ティッシュ', 'ソフトパック', 'まとめ買い'],
        excludeKeywords: ['定期便', 'ふるさと納税'],
        products: [
          {
            id: 'ts-r-forestway-200-80',
            name: 'Forestway ソフトパック 200組×80個 - ¥4,970 (100組¥31.0)',
            price: 4970, shipping: 0, points: 49, volume: 16000, unit: '組', baseUnit: '100組',
            store: 'rakuten', rakutenCode: 'cocodecow:r859md', popularity: 100,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/cocodecow/r859md/'),
            forecastData: [4970, 4970, 4970, 4970, 4970, 4970, 4970]
          },
          {
            id: 'ts-r-smartlife-200-120',
            name: 'Smart Life Labo ソフトパック 200組×120個 - ¥7,755 (100組¥32.3)',
            price: 7755, shipping: 0, points: 77, volume: 24000, unit: '組', baseUnit: '100組',
            store: 'rakuten', rakutenCode: 'smartlifelabo:fr-5622', popularity: 98,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/smartlifelabo/fr-5622/'),
            forecastData: [7755, 7755, 7755, 7755, 7755, 7755, 7755]
          },
          {
            id: 'ts-a-fleurdoux-200-80',
            name: 'fleurdoux ソフトパック 200組×80個 - ¥5,280 (100組¥33.0)',
            price: 5280, shipping: 0, points: 52, volume: 16000, unit: '組', baseUnit: '100組',
            store: 'amazon', asin: 'B0CBV2RPWC', popularity: 95,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0CBV2RPWC'),
            forecastData: [5280, 5280, 5280, 5280, 5280, 5280, 5280]
          },
          {
            id: 'ts-a-hello-150-100',
            name: 'ハロー ソフトパック 150組×100個 - ¥5,434 (100組¥36.2)',
            price: 5434, shipping: 0, points: 54, volume: 15000, unit: '組', baseUnit: '100組',
            store: 'amazon', asin: 'B0DMNDLC4L', popularity: 92,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0DMNDLC4L'),
            forecastData: [5434, 5434, 5434, 5434, 5434, 5434, 5434]
          },
          {
            id: 'ts-r-smartstyle-200-80',
            name: 'Smart Style 200W × 80個入 - ¥6,200 (100組¥38.7)',
            price: 6200, shipping: 0, points: 62, volume: 16000, unit: '組', baseUnit: '100組',
            store: 'rakuten', rakutenCode: 'coming:smartstyle-tissue200w', popularity: 90,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/coming/smartstyle-tissue200w/'),
            forecastData: [6200, 6200, 6200, 6200, 6200, 6200, 6200]
          }
        ]
      }
    ]
  },
  {
    id: 'detergent',
    name: '洗濯洗剤',
    group: 'stock',
    unitType: '1回',
    historyData: [8.5, 8.4, 8.2, 8.2, 8.5, 8.8, 9.0, 8.5, 8.2, 8.0, 8.2, 8.4, 8.5, 8.8, 9.0],
    subtypes: [
      {
        id: 'detergent-liquid',
        name: '液体 (濃縮)',
        regionalAverage: 12,
        products: [
          {
            id: 'dt-l-r1',
            name: '業務用 液体洗濯洗剤 スクリット 18L B.I.B - ¥5,300 (1回¥7.4)',
            price: 5300, shipping: 0, points: 53, volume: 18000, unit: 'ml', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'kumano-official:5117', popularity: 100,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/kumano-official/5117/'),
            forecastData: [5300, 5300, 5300, 5300, 5300, 5300, 5300]
          },
          {
            id: 'dt-l-a2',
            name: 'カネヨ 抗菌剤入り 衣料用液体洗剤 5kg×4 (業務用) - ¥7,599 (1回¥9.5)',
            price: 7599, shipping: 0, points: 76, volume: 20000, unit: 'ml', baseUnit: '1回',
            store: 'amazon', asin: 'B0GDZJF5V7', popularity: 98,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0GDZJF5V7'),
            forecastData: [7599, 7599, 7599, 7599, 7599, 7599, 7599]
          },
          {
            id: 'dt-l-a3',
            name: 'トップ クリアリキッド 10kg (業務用) - ¥4,100 (1回¥10.3)',
            price: 4100, shipping: 0, points: 41, volume: 10000, unit: 'ml', baseUnit: '1回',
            store: 'amazon', asin: 'B01IES8W2M', popularity: 95,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B01IES8W2M'),
            forecastData: [4100, 4100, 4100, 4100, 4100, 4100, 4100]
          },
          {
            id: 'dt-l-a4',
            name: 'ナノックスOne 詰替 超特大 1.73kg - ¥1,363 (1回¥19.7)',
            price: 1363, shipping: 0, points: 14, volume: 1730, unit: 'ml', baseUnit: '1回',
            store: 'amazon', asin: 'B0CBB3P48C', popularity: 92,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0CBB3P48C'),
            forecastData: [1363, 1363, 1363, 1363, 1363, 1363, 1363]
          },
          {
            id: 'dt-l-a5',
            name: 'アタックZERO 詰め替え 2150g - ¥1,722 (1回¥20.0)',
            price: 1722, shipping: 0, points: 17, volume: 2150, unit: 'ml', baseUnit: '1回',
            store: 'amazon', asin: 'B09T3VFBHG', popularity: 90,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B09T3VFBHG'),
            forecastData: [1722, 1722, 1722, 1722, 1722, 1722, 1722]
          }
        ]
      },
      {
        id: 'detergent-powder',
        name: '粉末',
        regionalAverage: 12,
        products: [
          {
            id: 'dt-p-r1',
            name: 'コーナン オリジナル クリーンランドリー 4.0kg - ¥1,490 (1回¥7.5)',
            price: 1490, shipping: 0, points: 15, volume: 4000, unit: 'g', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'kohnan-eshop:4522831382170', popularity: 100,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/kohnan-eshop/4522831382170/'),
            forecastData: [1490, 1490, 1490, 1490, 1490, 1490, 1490]
          },
          {
            id: 'dt-p-a2',
            name: 'メガテック 衣料用洗剤 4.5kg (業務用) - ¥2,880 (1回¥6.4)',
            price: 2880, shipping: 0, points: 29, volume: 4500, unit: 'g', baseUnit: '1回',
            store: 'amazon', asin: 'B0088B6962', popularity: 98,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0088B6962'),
            forecastData: [2880, 2880, 2880, 2880, 2880, 2880, 2880]
          },
          {
            id: 'dt-p-a3',
            name: 'アタック 業務用 10kg (10kg×1個) - ¥5,480 (1回¥13.7)',
            price: 5480, shipping: 0, points: 55, volume: 10000, unit: 'g', baseUnit: '1回',
            store: 'amazon', asin: 'B086VYPLNV', popularity: 95,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B086VYPLNV'),
            forecastData: [5480, 5480, 5480, 5480, 5480, 5480, 5480]
          },
          {
            id: 'dt-p-r4',
            name: '花王 アタック業務用 10kg (2.5kg×4袋) - ¥4,341 (1回¥10.9)',
            price: 4341, shipping: 0, points: 43, volume: 10000, unit: 'g', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'prolabshop:62-3785-07', popularity: 92,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/prolabshop/62-3785-07/'),
            forecastData: [4341, 4341, 4341, 4341, 4341, 4341, 4341]
          },
          {
            id: 'dt-p-r5',
            name: 'ミツエイ ニュースーパーウォッシュ 4kg - ¥2,236 (1回¥14.0)',
            price: 2236, shipping: 0, points: 22, volume: 4000, unit: 'g', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'rakuten24:4978951060953', popularity: 90,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/rakuten24/4978951060953/'),
            forecastData: [2236, 2236, 2236, 2236, 2236, 2236, 2236]
          }
        ]
      },
      {
        id: 'detergent-gel',
        name: 'ジェルボール',
        regionalAverage: 35,
        products: [
          {
            id: 'dt-g-r1',
            name: 'TOWABOX 洗濯ジェル 50個入 × 3袋セット - ¥3,199 (1回¥21.3)',
            price: 3199, shipping: 0, points: 32, volume: 150, unit: '個', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'towabox:tw-rakuwash', popularity: 100,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/towabox/tw-rakuwash/'),
            forecastData: [3199, 3199, 3199, 3199, 3199, 3199, 3199]
          },
          {
            id: 'dt-g-a2',
            name: 'KIRKLAND ウルトラクリーン 152回分 - ¥3,498 (1回¥23.0)',
            price: 3498, shipping: 0, points: 35, volume: 152, unit: '個', baseUnit: '1回',
            store: 'amazon', asin: 'B0CYZ6442V', popularity: 98,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0CYZ6442V'),
            forecastData: [3498, 3498, 3498, 3498, 3498, 3498, 3498]
          },
          {
            id: 'dt-g-r3',
            name: 'LOUVRICH 微香 柔軟剤入り 105個入 - ¥3,980 (1回¥37.9)',
            price: 3980, shipping: 0, points: 40, volume: 105, unit: '個', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'louvrich:2024111401', popularity: 95,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/louvrich/2024111401/'),
            forecastData: [3980, 3980, 3980, 3980, 3980, 3980, 3980]
          },
          {
            id: 'dt-g-r4',
            name: 'アリエール ジェルボール4D 詰め替えセット (送料無料) - ¥4,979 (1回¥29.3)',
            price: 4979, shipping: 0, points: 50, volume: 170, unit: '個', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'rakuten24:405192', popularity: 92,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/rakuten24/405192/'),
            forecastData: [4979, 4979, 4979, 4979, 4979, 4979, 4979]
          },
          {
            id: 'dt-g-r5',
            name: 'ボールド ジェルボール 4D 詰め替えセット (送料無料) - ¥4,980 (1回¥29.3)',
            price: 4980, shipping: 0, points: 50, volume: 170, unit: '個', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'rakuten24:405433', popularity: 90,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/rakuten24/405433/'),
            forecastData: [4980, 4980, 4980, 4980, 4980, 4980, 4980]
          }
        ]
      }
    ]
  },
  {
    id: 'oil',
    name: '食用油',
    group: 'stock',
    unitType: '1L',
    historyData: [380, 375, 370, 368, 360, 350, 340, 335, 330, 340, 350, 360, 368, 375, 380],
    subtypes: [
      {
        id: 'oil-canola',
        name: 'サラダ油・キャノーラ油 (JOYL/日清/ムソー)',
        regionalAverage: 450,
        searchOverride: '日清 JOYL ムソー キャノーラ油 16.5kg 1000g',
        products: [
          {
            id: 'oil-c-n1',
            name: '日清オイリオ リノール キャノーラ油 16.5kg (一斗缶) - ¥5,800 (1L¥351)',
            price: 5800, shipping: 0, points: 58, volume: 16500, unit: 'ml', baseUnit: '1L',
            store: 'rakuten', rakutenCode: 'magokorooroshi:202323', popularity: 100,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/magokorooroshi/202323/'),
            forecastData: [5800, 5800, 5800, 5800, 5800, 5800, 5800]
          },
          {
            id: 'oil-c-j1',
            name: 'JOYL PRO キャノーラ油 16.5kg (一斗缶) - ¥6,300 (1L¥381)',
            price: 6300, shipping: 0, points: 63, volume: 16500, unit: 'ml', baseUnit: '1L',
            store: 'rakuten', rakutenCode: 'cheeky:u521813', popularity: 98,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/cheeky/u521813/'),
            forecastData: [6300, 6300, 6300, 6300, 6300, 6300, 6300]
          },
          {
            id: 'oil-c-n2',
            name: '日清オイリオ ヘルシーキャノーラ油 1000g×2本 - ¥869 (1L¥434)',
            price: 869, shipping: 0, points: 8, volume: 2000, unit: 'ml', baseUnit: '1L',
            store: 'amazon', asin: 'B09V7HMQ86', popularity: 95,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B09V7HMQ86'),
            forecastData: [869, 869, 869, 869, 869, 869, 869]
          },
          {
            id: 'oil-c-a2',
            name: 'AJINOMOTO さらさらキャノーラ油 1000g×2本 - ¥1,174 (1L¥587)',
            price: 1174, shipping: 0, points: 11, volume: 2000, unit: 'ml', baseUnit: '1L',
            store: 'amazon', asin: 'B09V7DRN74', popularity: 92,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B09V7DRN74'),
            forecastData: [1174, 1174, 1174, 1174, 1174, 1174, 1174]
          },
          {
            id: 'oil-c-m1',
            name: 'ムソー 純正なたねサラダ油 1250g×2本 - ¥2,400 (1L¥960)',
            price: 2400, shipping: 0, points: 24, volume: 2500, unit: 'ml', baseUnit: '1L',
            store: 'amazon', asin: 'B0G5FZ6994', popularity: 88,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0G5FZ6994'),
            forecastData: [2400, 2400, 2400, 2400, 2400, 2400, 2400]
          }
        ]
      },
      {
        id: 'oil-olive',
        name: 'オリーブオイル',
        regionalAverage: 1500,
        searchOverride: 'オリーブオイル 5L 業務用',
        products: [
          {
            id: 'oil-o-a1',
            name: 'ガルシア エキストラバージンオリーブオイル 1000ml - ¥1,850',
            price: 1850, shipping: 0, points: 19, volume: 1000, unit: 'ml', baseUnit: '1L',
            store: 'amazon', asin: 'B005I0DG76', popularity: 100,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B005I0DG76'),
            forecastData: [1850, 1850, 1850, 1850, 1850, 1850, 1850]
          },
          {
            id: 'oil-o-a2',
            name: 'ガルシア エキストラバージンオリーブオイル 2000ml - ¥3,843',
            price: 3843, shipping: 0, points: 38, volume: 2000, unit: 'ml', baseUnit: '1L',
            store: 'amazon', asin: 'B0068XKUEY', popularity: 95,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0068XKUEY'),
            forecastData: [3843, 3843, 3843, 3843, 3843, 3843, 3843]
          },
          {
            id: 'oil-o-a3',
            name: 'by Amazon エキストラバージンオリーブオイル 1000g - ¥1,645',
            price: 1645, shipping: 0, points: 16, volume: 1000, unit: 'ml', baseUnit: '1L',
            store: 'amazon', asin: 'B09T9B69N4', popularity: 92,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B09T9B69N4'),
            forecastData: [1645, 1645, 1645, 1645, 1645, 1645, 1645]
          },
          {
            id: 'oil-o-a4',
            name: 'アルチェネロ 有機エキストラバージンオリーブオイル 500ml - ¥1,610',
            price: 1610, shipping: 0, points: 16, volume: 500, unit: 'ml', baseUnit: '1L',
            store: 'amazon', asin: 'B005T65E36', popularity: 90,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B005T65E36'),
            forecastData: [1610, 1610, 1610, 1610, 1610, 1610, 1610]
          },
          {
            id: 'oil-o-a5',
            name: '日清 BOSCO エキストラバージンオリーブオイル 456g×2本 - ¥1,811',
            price: 1811, shipping: 0, points: 18, volume: 912, unit: 'ml', baseUnit: '1L',
            store: 'amazon', asin: 'B09V7HGCPT', popularity: 88,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B09V7HGCPT'),
            forecastData: [1811, 1811, 1811, 1811, 1811, 1811, 1811]
          }
        ]
      },
      {
        id: 'oil-sesame',
        name: 'ごま油',
        regionalAverage: 280,
        searchOverride: 'かどや ごま油 1650g',
        unitType: '100g',
        products: [
          {
            id: 'oil-s-a1',
            name: 'かどや 純正ごま油 600g - ¥1,064',
            price: 1064, shipping: 0, points: 11, volume: 600, unit: 'g', baseUnit: '100g',
            store: 'amazon', asin: 'B01MRE9JS6', popularity: 100,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B01MRE9JS6'),
            forecastData: [1064, 1064, 1064, 1064, 1064, 1064, 1064]
          },
          {
            id: 'oil-s-a2',
            name: 'マルホン 純正ごま油 1650g - ¥2,918',
            price: 2918, shipping: 0, points: 29, volume: 1650, unit: 'g', baseUnit: '100g',
            store: 'amazon', asin: 'B00DAO732G', popularity: 95,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B00DAO732G'),
            forecastData: [2918, 2918, 2918, 2918, 2918, 2918, 2918]
          },
          {
            id: 'oil-s-r1',
            name: 'かどや 銀印 ごま油 濃口 1650g [楽天] - ¥2,890',
            price: 2890, shipping: 0, points: 29, volume: 1650, unit: 'g', baseUnit: '100g',
            store: 'rakuten', rakutenCode: 'sinnara:10001615', popularity: 92,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/sinnara/10001615/'),
            forecastData: [2890, 2890, 2890, 2890, 2890, 2890, 2890]
          },
          {
            id: 'oil-s-a4',
            name: 'かどや 純正ごま油 300g - ¥675',
            price: 675, shipping: 0, points: 7, volume: 300, unit: 'g', baseUnit: '100g',
            store: 'amazon', asin: 'B078GB9PSZ', popularity: 90,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B078GB9PSZ'),
            forecastData: [675, 675, 675, 675, 675, 675, 675]
          },
          {
            id: 'oil-s-a5',
            name: 'マルホン 太白ごま油 450g - ¥1,180',
            price: 1180, shipping: 0, points: 12, volume: 450, unit: 'g', baseUnit: '100g',
            store: 'amazon', asin: 'B00P0Z2IWC', popularity: 88,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B00P0Z2IWC'),
            forecastData: [1180, 1180, 1180, 1180, 1180, 1180, 1180]
          }
        ]
      }
    ]
  }
];
