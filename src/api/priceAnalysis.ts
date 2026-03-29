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
  storeCount: number = 0
): PriceAnalysis => {
  const currentMonth = new Date().getMonth();
  const seasonalFactor = SEASONALITY_MAP[genreId]?.[currentMonth] || 1.0;
  
  // 1. Calculate Volatility (Price Dispersion)
  let volatility = 0;
  if (allPrices && allPrices.length > 2) {
    const mean = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
    const squareDiffs = allPrices.map(p => Math.pow(p - mean, 2));
    volatility = Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / allPrices.length) / mean;
  }

  // 2. Trend detection
  let trendIndicator = 0; // -1 to 1
  if (historicalData && historicalData.length > 1) {
    const last = historicalData[historicalData.length - 1];
    const first = historicalData[0];
    trendIndicator = (last - first) / first;
  }

  // 3. Score calculation
  const statsDelta = regionalAverage ? (currentPrice - (regionalAverage * seasonalFactor)) / (regionalAverage * seasonalFactor) : 0;
  
  let reasoning = '市場価格は安定しています。';
  let sentiment: 'warning' | 'neutral' | 'success' = 'neutral';
  let confidence = 70;
  let trend: 'up' | 'down' | 'stable' = 'stable';

  // SCARCITY ALERT: Significant store count drop
  const isScarce = storeCount > 0 && storeCount < 5;

  if (isScarce && statsDelta > -0.05) {
    reasoning = `市場の取り扱い店舗が${storeCount}件まで減少。品薄による急激な値上がりのリスクが極めて高い状態です。`;
    sentiment = 'warning';
    trend = 'up';
    confidence = 95;
  } 
  else if (volatility > 0.3 && statsDelta < -0.1) {
    reasoning = '市場の価格差が拡大中。一部店舗で突出した安値を検知しました。売り切れる前に確保を推奨します。';
    sentiment = 'success';
    trend = 'down';
    confidence = 88;
  }
  else if (trendIndicator > 0.05) {
    reasoning = `過去の推移、および物価統計に基づき、近日中の値上げが濃厚です（上昇率: ${(trendIndicator * 100).toFixed(1)}%）。`;
    sentiment = 'warning';
    trend = 'up';
    confidence = 90;
  }
  else if (seasonalFactor > 1.2 && statsDelta > 0) {
    reasoning = '現在は品目特有の需要期（高値シーズン）にあたります。備蓄に余裕があれば、次月の落ち着きを待つのも手です。';
    sentiment = 'neutral';
    trend = 'stable';
    confidence = 80;
  }
  else if (statsDelta < -0.15) {
    reasoning = '地域平均を15%以上下回る最安水準に到達。統計的に見て、これ以上の安値更新は考えにくい「底値」です。';
    sentiment = 'success';
    trend = 'stable';
    confidence = 95;
  }
  else if (statsDelta < -0.05) {
    reasoning = '安定した安値圏を維持。季節的な変動も考慮し、備蓄を補充するのに最適なタイミングと言えます。';
    sentiment = 'success';
    trend = 'stable';
    confidence = 85;
  }
  else if (statsDelta > 0.1) {
    reasoning = '地域相場より10%以上割高な水準です。需給バランスが改善されるまで、必要最小限の購入に留めてください。';
    sentiment = 'warning';
    trend = 'stable';
    confidence = 85;
  }
  else {
    reasoning = '価格は統計平均の範囲内で安定。突発的な変動要因も見られず、平時通りの購入サイクルで問題ありません。';
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
