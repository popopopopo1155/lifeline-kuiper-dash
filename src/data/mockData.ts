import type { Product, Genre } from '../types';

export const calculateUnitPrice = (p: Product) => {
  return Math.round((p.price + p.shipping - p.points) / p.volume);
};

export const mockGenres: Genre[] = [
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
        representativeAsin: 'B0B7B7D4N3',
        products: [
          { 
            id: 'rice-5kg-c1', 
            name: '国内産 100% ブレンド米 5kg', 
            price: 2950, 
            shipping: 0, 
            points: 0, 
            volume: 5, 
            unit: 'kg',
            baseUnit: '1kg',
            store: 'rakuten', 
            rakutenCode: 'jcrops:10008581',
            popularity: 85,
            affiliateUrl: 'https://hb.afl.rakuten.co.jp/hgc/5025407c.d8994699.5025407d.e9a413e7/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fjcrops%2F10008581%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fjcrops%2F10008581%2F',
            forecastData: [2950, 2950, 2950, 2950, 2950, 2950, 2950]
          },
          { 
            id: 'rice-5kg-c2', 
            name: 'あきたこまち 5kg', 
            price: 3050, 
            shipping: 0, 
            points: 0, 
            volume: 5, 
            unit: 'kg',
            baseUnit: '1kg',
            store: 'amazon', 
            asin: 'B0B7B7D4N3',
            popularity: 90,
            affiliateUrl: 'https://www.amazon.co.jp/gp/product/B0B7B7D4N3/?tag=hitsujuhin-22',
            forecastData: [3050, 3050, 3050, 3050, 3050, 3050, 3050]
          },
          { 
            id: 'rice-5kg-c3', 
            name: 'ヒノヒカリ 5kg', 
            price: 3150, 
            shipping: 0, 
            points: 0, 
            volume: 5, 
            unit: 'kg',
            baseUnit: '1kg',
            store: 'rakuten', 
            rakutenCode: 'rice-wholesale:5kg-01',
            popularity: 88,
            affiliateUrl: 'https://hb.afl.rakuten.co.jp/hgc/5025407c.d8994699.5025407d.e9a413e7/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Frice-wholesale%2F100055%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Frice-wholesale%2F100055%2F',
            forecastData: [3150, 3150, 3150, 3150, 3150, 3150, 3150]
          }
        ]
      },
      {
        id: 'rice-10kg',
        name: '10kg',
        regionalAverage: 480,
        representativeAsin: 'B07QL13VYC',
        products: [
          {
            id: 'rice-10kg-c1',
            name: '国内産 100% ブレンド米 10kg',
            price: 5480,
            shipping: 0,
            points: 0,
            volume: 10,
            unit: 'kg',
            baseUnit: '1kg',
            store: 'rakuten',
            rakutenCode: 'rice-shop:item-01',
            popularity: 85,
            affiliateUrl: 'https://hb.afl.rakuten.co.jp/hgc/5025407c.d8994699.5025407d.e9a413e7/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Frice-shop%2Fitem-01%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Frice-shop%2Fitem-01%2F',
            forecastData: [5480, 5480, 5480, 5480, 5480, 5480, 5480]
          },
          {
            id: 'rice-10kg-c2',
            name: 'あきたこまち 10kg',
            price: 5580,
            shipping: 0,
            points: 0,
            volume: 10,
            unit: 'kg',
            baseUnit: '1kg',
            store: 'amazon',
            asin: 'B07QL13VYC',
            popularity: 90,
            affiliateUrl: 'https://www.amazon.co.jp/gp/product/B07QL13VYC/?tag=hitsujuhin-22',
            forecastData: [5580, 5580, 5580, 5580, 5580, 5580, 5580]
          },
          {
            id: 'rice-10kg-c3',
            name: '複数原料米 10kg 送料無料',
            price: 5680,
            shipping: 0,
            points: 0,
            volume: 10,
            unit: 'kg',
            baseUnit: '1kg',
            store: 'rakuten',
            rakutenCode: 'rice-wholesale:100055',
            popularity: 88,
            affiliateUrl: 'https://hb.afl.rakuten.co.jp/hgc/5025407c.d8994699.5025407d.e9a413e7/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Frice-wholesale%2F100055%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Frice-wholesale%2F100055%2F',
            forecastData: [5680, 5680, 5680, 5680, 5680, 5680, 5680]
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
        products: [
          { 
            id: 'water-500-c1', 
            name: '天然水 500ml×24本', 
            price: 1580, 
            shipping: 0, 
            points: 0, 
            volume: 24, 
            unit: 'bottle',
            baseUnit: '1bottle',
            store: 'amazon', 
            asin: 'B0BLXFYWHD',
            popularity: 85,
            affiliateUrl: 'https://www.amazon.co.jp/gp/product/B0BLXFYWHD/?tag=hitsujuhin-22',
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
        products: [
          { 
            id: 'tp-12r-c1', 
            name: 'スコッティ 12ロール 3倍巻', 
            price: 380, 
            shipping: 500, 
            points: 0, 
            volume: 12, 
            unit: 'roll',
            baseUnit: '1roll',
            store: 'rakuten', 
            rakutenCode: 'miraiyuki:10103759',
            popularity: 85,
            affiliateUrl: 'https://hb.afl.rakuten.co.jp/hgc/5025407c.d8994699.5025407d.e9a413e7/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmiraiyuki%2F10103759%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fmura-saki%2F10103759%2F',
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
