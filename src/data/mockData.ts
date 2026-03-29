export type Product = {
  id: string;
  name: string;
  price: number;
  shipping: number;
  points: number;
  volume: number;
  unit: string;
  baseUnit: string;
  store: 'amazon' | 'rakuten' | 'supermarket';
  affiliateUrl: string;
  popularity: number;
  forecastData: number[]; // Future 7 days price points
};

export type Subtype = {
  id: string;
  name: string;
  products: Product[];
  regionalAverage: number;
  representativeAsin?: string;
  volatility?: number; // 0.0 - 1.0
  scarcity?: number;   // 0.0 - 1.0 (based on sales rank)
};

export type Genre = {
  id: string;
  name: string;
  subtypes: Subtype[];
  historyData: number[]; // Past 90 days price points
};

export const calculateUnitPrice = (p: Product) => {
  return Math.round((p.price + p.shipping - p.points) / p.volume);
};

export const mockGenres: Genre[] = [
  {
    id: 'rice',
    name: '米',
    historyData: [2800, 2750, 2900, 2850, 2700, 2600, 2550, 2480, 2450, 2420, 2400, 2380, 2400, 2450, 2500], // Simplified 90d (15 nodes)
    subtypes: [
      {
        id: 'rice-2kg',
        name: '米2kg',
        regionalAverage: 650,
        products: [
          { id: 'r2-1', name: '会津産 コシヒカリ 2kg', price: 1280, shipping: 0, points: 12, volume: 2, unit: 'kg', baseUnit: '1kg', store: 'amazon', affiliateUrl: 'https://www.amazon.co.jp/', popularity: 90, forecastData: [1280, 1280, 1280, 1300, 1350, 1400, 1500] },
          { id: 'r2-2', name: '無洗米 ななつぼし 2kg', price: 1180, shipping: 0, points: 11, volume: 2, unit: 'kg', baseUnit: '1kg', store: 'rakuten', affiliateUrl: 'https://www.rakuten.co.jp/', popularity: 85, forecastData: [1180, 1180, 1180, 1180, 1180, 1200, 1250] },
        ]
      },
      {
        id: 'rice-5kg',
        name: '米5kg',
        regionalAverage: 510,
        representativeAsin: 'B0GFHVZYH7', // by Amazon 国産ブレンド米 5kg
        products: [
          { id: 'r5-1', name: '栃木県産 コシヒカリ 5kg', price: 2480, shipping: 0, points: 24, volume: 5, unit: 'kg', baseUnit: '1kg', store: 'amazon', affiliateUrl: 'https://www.amazon.co.jp/', popularity: 95, forecastData: [2480, 2480, 2550, 2600, 2600, 2700, 2800] },
          { id: 'r5-2', name: '秋田県産 あきたこまち 5kg', price: 2380, shipping: 0, points: 23, volume: 5, unit: 'kg', baseUnit: '1kg', store: 'rakuten', affiliateUrl: 'https://www.rakuten.co.jp/', popularity: 80, forecastData: [2380, 2380, 2380, 2400, 2400, 2450, 2500] },
          { id: 'r5-3', name: '特売スーパー米 5kg', price: 2200, shipping: 0, points: 0, volume: 5, unit: 'kg', baseUnit: '1kg', store: 'supermarket', affiliateUrl: 'https://www.google.com/search?q=supermarket+rice', popularity: 50, forecastData: [2200, 2200, 2300, 2350, 2400, 2500, 2600] },
          { id: 'r5-4', name: '山形県産 つや姫 5kg', price: 2880, shipping: 0, points: 28, volume: 5, unit: 'kg', baseUnit: '1kg', store: 'amazon', affiliateUrl: 'https://www.amazon.co.jp/', popularity: 88, forecastData: [2880, 2880, 2880, 2880, 2880, 2900, 3000] },
          { id: 'r5-5', name: '新潟県産 魚沼コシヒカリ 5kg', price: 3480, shipping: 0, points: 34, volume: 5, unit: 'kg', baseUnit: '1kg', store: 'rakuten', affiliateUrl: 'https://www.rakuten.co.jp/', popularity: 75, forecastData: [3480, 3480, 3480, 3500, 3600, 3700, 3800] },
          { id: 'r5-6', name: '北海道産 ゆめぴりか 5kg', price: 2580, shipping: 0, points: 25, volume: 5, unit: 'kg', baseUnit: '1kg', store: 'amazon', affiliateUrl: 'https://www.amazon.co.jp/', popularity: 92, forecastData: [2580, 2580, 2580, 2600, 2600, 2600, 2600] },
          { id: 'r5-7', name: '熊本県産 森のくまさん 5kg', price: 2180, shipping: 500, points: 21, volume: 5, unit: 'kg', baseUnit: '1kg', store: 'rakuten', affiliateUrl: 'https://www.rakuten.co.jp/', popularity: 65, forecastData: [2180, 2180, 2200, 2250, 2300, 2400, 2500] },
          { id: 'r5-8', name: '千葉県産 ふさおとめ 5kg', price: 1980, shipping: 0, points: 19, volume: 5, unit: 'kg', baseUnit: '1kg', store: 'amazon', affiliateUrl: 'https://www.amazon.co.jp/', popularity: 40, forecastData: [1980, 1980, 2000, 2100, 2200, 2300, 2400] },
          { id: 'r5-9', name: '宮城県産 ひとめぼれ 5kg', price: 2280, shipping: 0, points: 22, volume: 5, unit: 'kg', baseUnit: '1kg', store: 'rakuten', affiliateUrl: 'https://www.rakuten.co.jp/', popularity: 70, forecastData: [2280, 2280, 2280, 2300, 2350, 2400, 2500] },
          { id: 'r5-10', name: '岩手県産 銀河のしずく 5kg', price: 2680, shipping: 0, points: 26, volume: 5, unit: 'kg', baseUnit: '1kg', store: 'amazon', affiliateUrl: 'https://www.amazon.co.jp/', popularity: 82, forecastData: [2680, 2680, 2700, 2750, 2800, 2900, 3000] },
        ]
      },
      {
        id: 'rice-10kg',
        name: '米10kg',
        regionalAverage: 480,
        products: [
          { id: 'r10-1', name: 'ブレンド米 10kg', price: 4200, shipping: 0, points: 42, volume: 10, unit: 'kg', baseUnit: '1kg', store: 'amazon', affiliateUrl: 'https://www.amazon.co.jp/', popularity: 90, forecastData: [4200, 4200, 4200, 4100, 4000, 3950, 3900] },
        ]
      },
      {
        id: 'rice-20kg',
        name: '米20kg',
        regionalAverage: 450,
        products: [
          { id: 'r20-1', name: '山形県産 はえぬき 20kg (10kgx2)', price: 8200, shipping: 0, points: 82, volume: 20, unit: 'kg', baseUnit: '1kg', store: 'amazon', affiliateUrl: 'https://www.amazon.co.jp/', popularity: 85, forecastData: [8200, 8200, 8100, 8000, 7900, 7800, 7700] },
        ]
      }
    ]
  },
  {
    id: 'tp',
    name: 'トイレットペーパー',
    historyData: [900, 880, 890, 898, 920, 950, 930, 920, 910, 898, 880, 898, 920, 940, 950],
    subtypes: [
      {
        id: 'tp-8r',
        name: '8ロール(1.5倍巻)',
        regionalAverage: 110,
        representativeAsin: 'B07WCSL63X', // by Amazon 2倍巻
        products: [
          { id: 'tp-1', name: 'エリエール 1.5倍巻 8R', price: 898, shipping: 0, points: 8, volume: 8, unit: 'ロール', baseUnit: '1ロール', store: 'amazon', affiliateUrl: 'https://www.amazon.co.jp/', popularity: 99, forecastData: [898, 920, 950, 980, 1050, 1100, 1150] },
        ]
      }
    ]
  },
  { 
    id: 'tissue', 
    name: 'ティッシュペーパー', 
    historyData: [400, 410, 420, 428, 430, 440, 450, 440, 430, 428, 420, 428, 435, 440, 450],
    subtypes: [
      {
        id: 'tissue-5p',
        name: '5箱パック',
        regionalAverage: 85,
        products: [
          { id: 'ti-1', name: 'スコッティ ティシュー 5箱', price: 428, shipping: 0, points: 4, volume: 5, unit: '箱', baseUnit: '1箱', store: 'supermarket', affiliateUrl: 'https://www.google.com/', popularity: 90, forecastData: [428, 428, 430, 440, 450, 450, 450] },
        ]
      }
    ] 
  },
  { 
    id: 'detergent', 
    name: '洗濯洗剤', 
    historyData: [380, 390, 398, 420, 450, 480, 460, 440, 420, 398, 380, 398, 410, 420, 450],
    subtypes: [
      {
        id: 'det-main',
        name: '液体洗剤 本体',
        regionalAverage: 350,
        products: [
          { id: 'de-1', name: 'アタックZERO 本体', price: 398, shipping: 0, points: 3, volume: 1, unit: '本', baseUnit: '1本', store: 'amazon', affiliateUrl: 'https://www.amazon.co.jp/', popularity: 95, forecastData: [398, 398, 398, 420, 450, 450, 480] },
        ]
      }
    ] 
  },
  { 
    id: 'water', 
    name: '水', 
    historyData: [600, 595, 590, 588, 580, 570, 560, 550, 540, 550, 560, 570, 580, 588, 590],
    subtypes: [
      {
        id: 'water-2l',
        name: '2L ペットボトル',
        regionalAverage: 90,
        representativeAsin: 'B08TV9VDR7', // い・ろ・は・す ラベルレス
        products: [
          { id: 'wa-1', name: '天然水 2L x 6本', price: 588, shipping: 0, points: 5, volume: 6, unit: '本', baseUnit: '1本', store: 'supermarket', affiliateUrl: 'https://www.google.com/', popularity: 99, forecastData: [588, 588, 580, 570, 560, 550, 540] },
        ]
      }
    ]
  },
  {
    id: 'egg',
    name: '卵',
    historyData: [220, 230, 240, 250, 258, 260, 270, 280, 290, 300, 310, 300, 290, 280, 270],
    subtypes: [
      {
        id: 'egg-10p',
        name: '10個パック',
        regionalAverage: 240,
        products: [
          { id: 'eg-1', name: 'こだわり卵 10個', price: 258, shipping: 0, points: 0, volume: 1, unit: 'パック', baseUnit: '1パック', store: 'supermarket', affiliateUrl: 'https://www.google.com/', popularity: 80, forecastData: [258, 260, 270, 280, 290, 300, 310] },
        ]
      }
    ] 
  },
  { 
    id: 'milk', 
    name: '牛乳', 
    historyData: [240, 245, 250, 258, 260, 265, 270, 275, 280, 285, 290, 280, 270, 260, 258],
    subtypes: [
      {
        id: 'milk-1l',
        name: '成分無調整 1L',
        regionalAverage: 210,
        products: [
          { id: 'mi-1', name: '明治おいしい牛乳 1L', price: 258, shipping: 0, points: 2, volume: 1, unit: '本', baseUnit: '1本', store: 'supermarket', affiliateUrl: 'https://www.google.com/', popularity: 95, forecastData: [258, 258, 260, 265, 270, 275, 280] },
        ]
      }
    ] 
  },
  { 
    id: 'bread', 
    name: '食パン', 
    historyData: [160, 165, 170, 178, 180, 185, 190, 195, 190, 185, 180, 178, 175, 170, 168],
    subtypes: [
      {
        id: 'bread-6',
        name: '6枚切',
        regionalAverage: 160,
        products: [
          { id: 'br-1', name: '超熟 6枚切', price: 165, shipping: 0, points: 0, volume: 1, unit: '袋', baseUnit: '袋', store: 'supermarket', affiliateUrl: 'https://www.google.com/', popularity: 98, forecastData: [165, 165, 165, 165, 165, 165, 165] },
        ]
      }
    ] 
  },
  { 
    id: 'oil', 
    name: '食用油', 
    historyData: [320, 330, 340, 348, 350, 360, 370, 380, 400, 390, 380, 370, 360, 348, 340],
    subtypes: [
      {
        id: 'oil-1k',
        name: 'キャノーラ油 1kg',
        regionalAverage: 380,
        products: [
          { id: 'oi-1', name: '日清キャノーラ油 1000g', price: 348, shipping: 0, points: 3, volume: 1, unit: '本', baseUnit: '1本', store: 'supermarket', affiliateUrl: 'https://www.google.com/', popularity: 92, forecastData: [348, 348, 350, 360, 370, 380, 400] },
        ]
      }
    ] 
  },
];
