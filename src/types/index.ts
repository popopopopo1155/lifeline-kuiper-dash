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
}

export interface Subtype {
  id: string;
  name: string;
  products: Product[];
  regionalAverage: number;
  representativeAsin?: string;
  volatility?: number;
  scarcity?: number;
  lastUpdated?: number;
}

export type GenreGroup = 'stock' | 'daily';

export interface Genre {
  id: string;
  name: string;
  group: GenreGroup;
  unitType: string;
  subtypes: Subtype[];
  historyData: number[];
}
