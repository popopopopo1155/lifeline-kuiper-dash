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
  if (url.includes('?')) {
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
    historyData: [220, 230, 240, 250, 258, 260, 270, 280, 290, 300, 310, 300, 290, 280, 270],
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
            name: '業務用 液体洗濯洗剤 スクリット 18L B.I.B - ¥4,580 (1回¥4.3)',
            price: 4580, shipping: 0, points: 46, volume: 18000, unit: 'ml', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'kumano-official:5117', popularity: 100,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/kumano-official/5117/'),
            forecastData: [4580, 4580, 4580, 4580, 4580, 4580, 4580]
          },
          {
            id: 'dt-l-a2',
            name: 'カネヨ 抗菌剤入り 衣料用液体洗剤 5kg×4 (業務用) - ¥4,950 (1回¥4.1)',
            price: 4950, shipping: 0, points: 50, volume: 20000, unit: 'ml', baseUnit: '1回',
            store: 'amazon', asin: 'B0GDZJF5V7', popularity: 98,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0GDZJF5V7'),
            forecastData: [4950, 4950, 4950, 4950, 4950, 4950, 4950]
          },
          {
            id: 'dt-l-a3',
            name: 'トップ クリアリキッド 10kg (業務用) - ¥3,380 (1回¥6.8)',
            price: 3380, shipping: 0, points: 34, volume: 10000, unit: 'ml', baseUnit: '1回',
            store: 'amazon', asin: 'B01IES8W2M', popularity: 95,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B01IES8W2M'),
            forecastData: [3380, 3380, 3380, 3380, 3380, 3380, 3380]
          },
          {
            id: 'dt-l-a4',
            name: 'ナノックスOne 詰替 超特大 1.73kg - ¥1,420 (1回¥8.2)',
            price: 1420, shipping: 0, points: 14, volume: 1730, unit: 'ml', baseUnit: '1回',
            store: 'amazon', asin: 'B0CBB3P48C', popularity: 92,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0CBB3P48C'),
            forecastData: [1420, 1420, 1420, 1420, 1420, 1420, 1420]
          },
          {
            id: 'dt-l-a5',
            name: 'アタックZERO 詰め替え 2150g - ¥2,100 (1回¥10.0)',
            price: 2100, shipping: 0, points: 21, volume: 2150, unit: 'ml', baseUnit: '1回',
            store: 'amazon', asin: 'B09T3VFBHG', popularity: 90,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B09T3VFBHG'),
            forecastData: [2100, 2100, 2100, 2100, 2100, 2100, 2100]
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
            name: 'コーナン オリジナル クリーンランドリー 4.0kg - ¥768 (1回¥3.8)',
            price: 768, shipping: 0, points: 8, volume: 4000, unit: 'g', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'kohnan-eshop:4522831382170', popularity: 100,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/kohnan-eshop/4522831382170/'),
            forecastData: [768, 768, 768, 768, 768, 768, 768]
          },
          {
            id: 'dt-p-a2',
            name: 'メガテック 衣料用洗剤 4.5kg (業務用) - ¥1,580 (1回¥3.5)',
            price: 1580, shipping: 0, points: 16, volume: 4500, unit: 'g', baseUnit: '1回',
            store: 'amazon', asin: 'B07N8P6T96', popularity: 98,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B07N8P6T96'),
            forecastData: [1580, 1580, 1580, 1580, 1580, 1580, 1580]
          },
          {
            id: 'dt-p-a3',
            name: 'アタック 10kg 高活性バイオEX (業務用) - ¥3,330 (1回¥6.7)',
            price: 3330, shipping: 0, points: 33, volume: 10000, unit: 'g', baseUnit: '1回',
            store: 'amazon', asin: 'B086VYPLNV', popularity: 95,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B086VYPLNV'),
            forecastData: [3330, 3330, 3330, 3330, 3330, 3330, 3330]
          },
          {
            id: 'dt-p-a4',
            name: 'トップ プラチナクリア 10kg (業務用/限定版) - ¥3,560 (1回¥7.1)',
            price: 3560, shipping: 0, points: 36, volume: 10000, unit: 'g', baseUnit: '1回',
            store: 'amazon', asin: 'B0D8Z25PZC', popularity: 92,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0D8Z25PZC'),
            forecastData: [3560, 3560, 3560, 3560, 3560, 3560, 3560]
          },
          {
            id: 'dt-p-r5',
            name: 'ミツエイ ニュースーパーウォッシュ 4kg - ¥1,280 (1回¥6.4)',
            price: 1280, shipping: 0, points: 13, volume: 4000, unit: 'g', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'rakuten24:4978951060953', popularity: 90,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/rakuten24/4978951060953/'),
            forecastData: [1280, 1280, 1280, 1280, 1280, 1280, 1280]
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
            name: 'TOWABOX 洗濯ジェル 150個入 (大容量) - ¥3,199 (1回¥21.3)',
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
            name: 'LOUVRICH 微香 柔軟剤入り 105個入 - ¥2,790 (1回¥26.5)',
            price: 2790, shipping: 0, points: 28, volume: 105, unit: '個', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'louvrich:2024111401', popularity: 95,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/louvrich/2024111401/'),
            forecastData: [2790, 2790, 2790, 2790, 2790, 2790, 2790]
          },
          {
            id: 'dt-g-r4',
            name: 'アリエール ジェルボール4D 110個袋 - ¥3,800 (1回¥34.5)',
            price: 3800, shipping: 0, points: 38, volume: 110, unit: '個', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'platanusstore:4987176292865', popularity: 92,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/platanusstore/4987176292865/'),
            forecastData: [3800, 3800, 3800, 3800, 3800, 3800, 3800]
          },
          {
            id: 'dt-g-r5',
            name: 'ボールド ジェルボール 4D 100個袋 - ¥3,780 (1回¥37.8)',
            price: 3780, shipping: 0, points: 38, volume: 100, unit: '個', baseUnit: '1回',
            store: 'rakuten', rakutenCode: 'shopypp:3799-003791', popularity: 90,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/shopypp/3799-003791/'),
            forecastData: [3780, 3780, 3780, 3780, 3780, 3780, 3780]
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
        id: 'oil-1l',
        name: 'サラダ油 1L',
        regionalAverage: 380,
        products: [
          {
            id: 'oil-rakuten-nisshin-1l',
            name: '日清キャノーラ油 1000g × 8本 - ¥2,880 (1L¥360)',
            price: 2880, shipping: 0, points: 28, volume: 8000, unit: 'ml', baseUnit: '1L',
            store: 'rakuten', rakutenCode: 'rakuten24:4902380188841', popularity: 100,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/rakuten24/4902380188841/'),
            forecastData: [2880, 2880, 2880, 2880, 2880, 2880, 2880]
          },
          {
            id: 'oil-amazon-showa-1l',
            name: '昭和キャノーラ油 1000g × 4本 - ¥1,580 (1L¥395)',
            price: 1580, shipping: 0, points: 16, volume: 4000, unit: 'ml', baseUnit: '1L',
            store: 'amazon', asin: 'B0058X6PME', popularity: 95,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0058X6PME'),
            forecastData: [1580, 1580, 1580, 1580, 1580, 1580, 1580]
          }
        ]
      }
    ]
  }
];
