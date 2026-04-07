export interface PricePoint {
  date: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  shipping: number;
  points: number;
  volume: number;
  unit: string;
  baseUnit: string;
  store: 'amazon' | 'rakuten' | 'supermarket';
  popularity: number;
  asin?: string;
  rakutenCode?: string;
  affiliateUrl?: string;
  source?: string;
  isVerified?: boolean;
  lastVerified?: string;
  forecastData: number[]; // Future 7 days price points
  lengthPerRoll?: number; // Optional metadata for smart calculation (meters per roll)
  setsPerPack?: number;   // Optional metadata for smart calculation (sets per pack for tissues)
  dosagePerWash?: number; // Optional metadata for smart calculation (use amount per wash for detergent)
}

export interface Subtype {
  id: string;
  name: string;
  baseRegionalAverage?: number; // 算出前のオリジナル価格
  products: Product[];
  regionalAverage: number;
  representativeAsin?: string;
  volatility?: number;
  scarcity?: number;
  lastUpdated?: number;
  isOfficial?: boolean; // 🏛️ 統計同期済みフラグ
}

export type GenreGroup = 'stock' | 'daily';

export interface Genre {
  id: string;
  name: string;
  group: GenreGroup;
  unitType: string;
  subtypes: Subtype[];
  historyData: number[];
  isOfficial?: boolean; // 🏛️ カテゴリー全体の統計同期フラグ
}
