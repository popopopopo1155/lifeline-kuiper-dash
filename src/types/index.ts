export interface PricePoint {
  date: string;
  price: number;
}

export type Product = {
  id: string;
  name: string;
  category: 'rice' | 'paper' | 'detergent' | 'food';
  unit: string;
  baseUnit: string; // e.g., "1kg", "1 roll", "100ml"
  currentPrice: number;
  lastPrice: number;
  historicalLowest: number;
  history: PricePoint[];
  forecast: 'up' | 'down' | 'stable';
  forecastRate?: number;
  image?: string;
  quantity: number; // For unit calculations
  historicalAverageUnitPrice: number;
  storePrices: {
    amazon?: number;
    rakuten?: number;
    supermarket?: number;
  };
}
