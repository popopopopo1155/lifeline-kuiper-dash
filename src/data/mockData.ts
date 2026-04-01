import type { Product, Genre } from '../types';

export const calculateUnitPrice = (p: Product) => {
  return Math.round((p.price + p.shipping - p.points) / p.volume);
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
    historyData: [2800, 2750, 2900, 2850, 2700, 2600, 2550, 2480, 2450, 2420, 2400, 2380, 2400, 2450, 2500],
    subtypes: [
      {
        id: 'rice-5kg',
        name: '5kg',
        regionalAverage: 580, // 🏮 [REAL SYNC] Keepa 90d Avg (580円/kg)
        representativeAsin: 'B08Y5ZW24P',
        searchOverride: '米 5kg -ふるさと納税 -定期便 -業務用',
        requiredKeywords: ['5kg'],
        excludeKeywords: ['定期便', 'ふるさと納税', '業務用'],
        products: [
          { 
            id: 'rice-5kg-v1', 
            name: '令和7年産入り 生活応援米 5kg', 
            price: 2950, 
            shipping: 0, 
            points: 29, 
            volume: 5, 
            unit: 'kg',
            baseUnit: '1kg',
            store: 'rakuten', 
            rakutenCode: 'okaman:10000029-1',
            popularity: 98,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/okaman/10000029-1/'),
            forecastData: [2950, 2950, 2950, 2950, 2950, 2950, 2950]
          },
          { 
            id: 'rice-5kg-v2', 
            name: '生活応援米こごめさん 5kg', 
            price: 2980, 
            shipping: 0, 
            points: 30, 
            volume: 5, 
            unit: 'kg',
            baseUnit: '1kg',
            store: 'rakuten', 
            rakutenCode: 'yamamotoyasuo-saketen:kogomesan5',
            popularity: 95,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/yamamotoyasuo-saketen/kogomesan5/'),
            forecastData: [2980, 2980, 2980, 2980, 2980, 2980, 2980]
          },
          { 
            id: 'rice-5kg-v3', 
            name: '【食卓応援団】国内産ブレンド米 5kg 精米', 
            price: 3132, 
            shipping: 0, 
            points: 0, 
            volume: 5, 
            unit: 'kg',
            baseUnit: '1kg',
            store: 'amazon', 
            asin: 'B0GQ2FV1NC',
            popularity: 92,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0GQ2FV1NC?th=1&psc=1'),
            forecastData: [3132, 3132, 3132, 3132, 3132, 3132, 3132]
          },
          { 
            id: 'rice-5kg-v4', 
            name: '【国産100％】小粒米（中粒米混） 5kg', 
            price: 2900, 
            shipping: 300, 
            points: 0, 
            volume: 5, 
            unit: 'kg',
            baseUnit: '1kg',
            store: 'amazon', 
            asin: 'B08Y5ZW24P',
            popularity: 88,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B08Y5ZW24P'),
            forecastData: [2900, 2900, 2900, 2900, 2900, 2900, 2900]
          },
          { 
            id: 'rice-5kg-v5', 
            name: '令和7年新米入 生活応援 家計応援米 5kg', 
            price: 3280, 
            shipping: 0, 
            points: 33, 
            volume: 5, 
            unit: 'kg',
            baseUnit: '1kg',
            store: 'rakuten', 
            rakutenCode: 'rice-smile:sc-s2805',
            popularity: 85,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/rice-smile/sc-s2805/'),
            forecastData: [3280, 3280, 3280, 3280, 3280, 3280, 3280]
          }
        ]
      },
      {
        id: 'rice-10kg',
        name: '10kg',
        regionalAverage: 538, // 🏮 [REAL SYNC] Keepa 90d Avg (538円/kg)
        representativeAsin: 'B0GQ2FV1NC',
        searchOverride: '米 10kg -ふるさと納税 -定期便 -業務用',
        requiredKeywords: ['10kg'],
        excludeKeywords: ['定期便', 'ふるさと納税', '業務用'],
        products: [
          {
            id: 'rice-10kg-v1',
            name: '【食卓応援団】国内産ブレンド米 10kg (5kg ×2) 精米',
            price: 5382,
            shipping: 0,
            points: 0,
            volume: 10,
            unit: 'kg',
            baseUnit: '1kg',
            store: 'amazon',
            asin: 'B0GQ2FV1NC',
            popularity: 98,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/dp/B0GQ2FV1NC'),
            forecastData: [5382, 5382, 5382, 5382, 5382, 5382, 5382]
          },
          {
            id: 'rice-10kg-v2',
            name: '国内産 ほほえみ米 10kg (5kg×2)',
            price: 5480,
            shipping: 0,
            points: 55,
            volume: 10,
            unit: 'kg',
            baseUnit: '1kg',
            store: 'rakuten',
            rakutenCode: 'ricetanaka:r-005',
            popularity: 95,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/ricetanaka/r-005/'),
            forecastData: [5480, 5480, 5480, 5480, 5480, 5480, 5480]
          },
          {
            id: 'rice-10kg-v3',
            name: '令和7年産入り 生活応援米 10kg (5kg×2)',
            price: 5480,
            shipping: 0,
            points: 55,
            volume: 10,
            unit: 'kg',
            baseUnit: '1kg',
            store: 'rakuten',
            rakutenCode: 'okaman:10000029-10',
            popularity: 92,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/okaman/10000029-1/'),
            forecastData: [5480, 5480, 5480, 5480, 5480, 5480, 5480]
          },
          {
            id: 'rice-10kg-v4',
            name: 'アメリカ・カリフォルニア産 カルローズ米 10kg',
            price: 5580,
            shipping: 0,
            points: 56,
            volume: 10,
            unit: 'kg',
            baseUnit: '1kg',
            store: 'rakuten',
            rakutenCode: 'skyfarm:karu',
            popularity: 88,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/skyfarm/karu/'),
            forecastData: [5580, 5580, 5580, 5580, 5580, 5580, 5580]
          },
          {
            id: 'rice-10kg-v5',
            name: '福島県産 ひとめぼれ 10kg (5kg×2) 訳あり',
            price: 6799,
            shipping: 0,
            points: 68,
            volume: 10,
            unit: 'kg',
            baseUnit: '1kg',
            store: 'rakuten',
            rakutenCode: 'jcrops:4562129938740-2-wake-05',
            popularity: 80,
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
        name: '12ロール',
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
            forecastData: [3480, 3480, 3480, 3480, 3480, 3480, 3480]
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
    unitType: '1box',
    historyData: [350, 345, 340, 338, 330, 320, 310, 305, 300, 310, 320, 330, 338, 345, 350],
    subtypes: [
      {
        id: 'tissue-5p',
        name: '5個パック',
        regionalAverage: 350,
        representativeAsin: 'B0054M8A6E',
        searchOverride: 'ティッシュ 5個パック 送料無料',
        requiredKeywords: ['5個', 'パック'],
        excludeKeywords: [],
        products: []
      }
    ]
  },
  {
    id: 'detergent',
    name: '洗濯洗剤',
    group: 'stock',
    unitType: '100g',
    historyData: [80, 82, 85, 88, 90, 85, 80, 78, 75, 78, 80, 82, 85, 88, 90],
    subtypes: [
      {
        id: 'detergent-refill',
        name: '詰め替え用',
        regionalAverage: 450,
        products: []
      }
    ]
  },
  {
    id: 'oil',
    name: '食用油',
    group: 'stock',
    unitType: '1bottle',
    historyData: [380, 375, 370, 368, 360, 350, 340, 335, 330, 340, 350, 360, 368, 375, 380],
    subtypes: [
      {
        id: 'oil-1l',
        name: '1Lボトル',
        regionalAverage: 380,
        products: []
      }
    ]
  }
];
