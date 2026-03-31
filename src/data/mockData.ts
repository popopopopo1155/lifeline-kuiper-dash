import type { Product, Genre } from '../types';

export const calculateUnitPrice = (p: Product) => {
  return Math.round((p.price + p.shipping - p.points) / p.volume);
};

export interface SubtypeMetadata extends any {
  searchOverride?: string;
  requiredKeywords?: string[];
  excludeKeywords?: string[];
}

const RAKU_AFL_ID = '5025407c.d8994699.5025407d.e9a413e7';
const AMA_AFL_TAG = 'hitsujuhin-22';

const wrapRaku = (pcUrl: string) => {
  const encPc = encodeURIComponent(pcUrl);
  return `https://hb.afl.rakuten.co.jp/hgc/${RAKU_AFL_ID}/?pc=${encPc}&m=${encPc}`;
};

const wrapAma = (baseUrl: string) => {
  const connector = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${connector}tag=${AMA_AFL_TAG}`;
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
        regionalAverage: 510,
        representativeAsin: 'B0GQ2FV1NC',
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
        regionalAverage: 480,
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
        regionalAverage: 80,
        representativeAsin: 'B0BLXFYWHD',
        searchOverride: '水 500ml 24本 送料無料 -ふるさと納税 -定期便',
        requiredKeywords: ['500ml', '24'],
        excludeKeywords: ['定期便', 'ふるさと納税'],
        products: [
          { 
            id: 'water-500-c1', 
            name: '天然水 500ml×24本', 
            price: 1580, 
            shipping: 0, 
            points: 16, 
            volume: 24, 
            unit: 'bottle',
            baseUnit: '1bottle',
            store: 'amazon', 
            asin: 'B0BLXFYWHD',
            popularity: 95,
            affiliateUrl: wrapAma('https://www.amazon.co.jp/gp/product/B0BLXFYWHD/'),
            forecastData: [1580, 1580, 1580, 1580, 1580, 1580, 1580]
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
            id: 'tp-12r-c1', 
            name: 'スコッティ 12ロール 3倍巻', 
            price: 380, 
            shipping: 500, 
            points: 4, 
            volume: 12, 
            unit: 'roll',
            baseUnit: '1roll',
            store: 'rakuten', 
            rakutenCode: 'miraiyuki:10103759',
            popularity: 85,
            affiliateUrl: wrapRaku('https://item.rakuten.co.jp/miraiyuki/10103759/'),
            forecastData: [380, 380, 380, 380, 380, 380, 380]
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
  }
];
