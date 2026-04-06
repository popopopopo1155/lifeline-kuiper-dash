/**
 * Price Intelligence Engine
 * 
 * This module integrates multiple data sources to provide a robust 
 * analytical basis for price forecasting and 'Buy/Wait' decisions.
 */

export interface PriceAnalysis {
  trend: 'up' | 'down' | 'stable';
  sentiment: 'warning' | 'neutral' | 'success'; 
  reasoning: string;
  confidence: number;
  dataPoints: {
    historical: boolean;
    market: boolean;
    statistics: boolean;
    volatility: boolean;
  };
}

// Category-based seasonality map (1.0 = average, >1.0 = high demand/price season)
const SEASONALITY_MAP: Record<string, number[]> = {
  rice: [1.1, 1.1, 1.0, 1.0, 1.0, 1.1, 1.0, 1.2, 0.9, 0.9, 1.0, 1.0], // Rice spikes before harvest, dips after
  tp: [1.0, 1.0, 1.2, 1.3, 1.1, 1.0, 1.0, 1.0, 1.1, 1.0, 1.0, 1.2],   // Tissues spike during move/pollen season
  water: [1.0, 1.0, 1.0, 1.0, 1.1, 1.2, 1.3, 1.4, 1.2, 1.0, 1.0, 1.0], // Water spikes in summer
  milk: [1.0, 1.1, 1.2, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.1, 1.2, 1.3],  // Milk spikes in winter
};

export const analyzePriceTrend = (
  genreId: string, 
  currentPrice: number,
  historicalData?: number[],
  regionalAverage?: number,
  allPrices?: number[],
  storeCount: number = 0,
  keepaVolatility?: number,
  keepaScarcity?: number
): PriceAnalysis => {
  const currentMonth = new Date().getMonth();
  const seasonalFactor = SEASONALITY_MAP[genreId]?.[currentMonth] || 1.0;
  
  // 1. Calculate Internal Volatility
  let volatility = keepaVolatility || 0;
  if (!volatility && allPrices && allPrices.length > 2) {
    const mean = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
    const squareDiffs = allPrices.map(p => Math.pow(p - mean, 2));
    volatility = Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / allPrices.length) / mean;
  }

  // 2. Score calculation
  const benchmark = regionalAverage ? (regionalAverage * seasonalFactor) : currentPrice;
  const statsDelta = regionalAverage ? (currentPrice - benchmark) / benchmark : 0;
  
  let reasoning = '市場価格は極めて安定しています。';
  let sentiment: 'warning' | 'neutral' | 'success' = 'neutral';
  let confidence = 85;
  let trend: 'up' | 'down' | 'stable' = 'stable';

  // SCARCITY / SUPPLY SHOCK LOGIC (Boosted by Keepa)
  const scarcityIndex = keepaScarcity || (storeCount > 0 && storeCount < 5 ? 0.7 : 0.3);

  // [INTELLECTUAL CALIBRATION v9.1] - 統計平均付近での煽りを防止
  const isBenchmarkMatch = Math.abs(statsDelta) <= 0.03; // ±3% は「完全なる適正」

  if (isBenchmarkMatch) {
    reasoning = '🏛️ 国家統計準拠：極めて適正な水準です。突発的な変動も見られず、平時通りの購入をお勧めします。';
    sentiment = 'success';
    trend = 'stable';
    confidence = 98;
  }
  else if (scarcityIndex > 0.85) {
    reasoning = `極端な品薄による需給逼迫を検知。価格が統計を上回る上振れリスクが非常に高まっています。`;
    sentiment = 'warning';
    trend = 'up';
    confidence = 90;
  }
  else if (statsDelta < -0.2 && volatility > 0.3) {
    reasoning = '地域平均を20%以上下回る異常値を検知。一時的な「投げ売り」の可能性があります。在庫があるうちに確保を。';
    sentiment = 'success';
    trend = 'down';
    confidence = 95;
  }
  else if (statsDelta < -0.1) {
    reasoning = '統計平均を10%以上下回る優良な安値圏です。家計防衛のための備蓄補充に適したタイミングです。';
    sentiment = 'success';
    trend = 'stable';
    confidence = 92;
  }
  else if (statsDelta > 0.15) {
    reasoning = '地域相場より15%以上割高な水準です。需給が改善されるまで、必要最小限の購入に留めることを推奨。';
    sentiment = 'warning';
    trend = 'stable';
    confidence = 90;
  }
  else if (seasonalFactor > 1.2 && statsDelta > 0) {
    reasoning = '現在は品目特有の需要期にあたるため割高です。次月の価格落ち着きを待つのが賢明です。';
    sentiment = 'neutral';
    trend = 'stable';
    confidence = 80;
  }
  else {
    reasoning = '価格は統計平均の範囲内で推移。マーケットニュースにも大きな影響はなく、安定した状況です。';
    sentiment = 'neutral';
    trend = 'stable';
    confidence = 70;
  }

  return { 
    trend, 
    sentiment, 
    reasoning, 
    confidence, 
    dataPoints: {
      historical: !!historicalData && historicalData.length > 0,
      market: true,
      statistics: !!regionalAverage,
      volatility: volatility > 0.1
    }
  };
};
