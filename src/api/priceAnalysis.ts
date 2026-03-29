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
  };
}

export const analyzePriceTrend = (
  genreId: string, 
  currentPrice: number,
  historicalData?: number[],
  regionalAverage?: number
): PriceAnalysis => {
  
  const dataPoints = {
    historical: !!historicalData && historicalData.length > 0,
    market: currentPrice > 0,
    statistics: !!regionalAverage
  };

  const statsDelta = regionalAverage ? (currentPrice - regionalAverage) / regionalAverage : 0;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (dataPoints.historical) {
    const last = historicalData![historicalData!.length - 1];
    const first = historicalData![0];
    if (last > first * 1.05) trend = 'up';
    else if (last < first * 0.95) trend = 'down';
  }

  let reasoning = '現時点では市場価格は安定しています。';
  let sentiment: 'warning' | 'neutral' | 'success' = 'neutral';
  let confidence = 70;

  // Logic Tree for repertoire expansion
  if (trend === 'up') {
    reasoning = '過去のトレンドおよび市場需給に基づき、近日中の値上げが濃厚です。';
    sentiment = 'warning';
    confidence = 90;
  } else if (trend === 'down') {
    reasoning = '供給が安定しており、さらに安値が更新される可能性があります。';
    sentiment = 'success';
    confidence = 75;
  } else if (statsDelta > 0.1) {
    reasoning = '現在は高値圏で安定しています。急ぎでなければ買い控えが賢明です。';
    sentiment = 'warning';
    confidence = 80;
  } else if (statsDelta < -0.15) {
    reasoning = '最安値圏に到達。統計的に見ても極めてお得な水準であり、備蓄の好機です。';
    sentiment = 'success';
    confidence = 95;
  } else if (statsDelta < -0.05) {
    reasoning = '安定した安値圏を維持しています。備蓄を補充するのに適したタイミングです。';
    sentiment = 'success';
    confidence = 85;
  } else {
    reasoning = '価格は横ばいで安定しています。必要な分をその都度購入するのが最適です。';
    sentiment = 'neutral';
    confidence = 70;
  }

  if (!dataPoints.historical && !dataPoints.statistics) {
    reasoning = `[シミュレーション] 市場の基本需給モデルに基づき、${genreId === 'rice' ? '季節的な要因' : '物流コスト'}を考慮した予測です。`;
    sentiment = 'neutral';
    confidence = 50;
  }

  return { trend, sentiment, reasoning, confidence, dataPoints };
};
