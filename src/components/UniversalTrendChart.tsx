import React, { useState, useEffect } from 'react';
import type { Genre } from '../types';

interface UniversalTrendChartProps {
  genres: Genre[];
  activeGenreId: string | null;
  newsRisks?: any[];
}

export const UniversalTrendChart: React.FC<UniversalTrendChartProps> = ({ genres, activeGenreId, newsRisks = [] }) => {
  const [selectedId, setSelectedId] = useState<string>(genres[0]?.id || 'rice');

  // ダッシュボード選択と同期（オプショナル）
  useEffect(() => {
    if (activeGenreId) {
      setSelectedId(activeGenreId);
    }
  }, [activeGenreId]);

  const currentGenre = genres.find(g => g.id === selectedId) || genres[0];
  if (!currentGenre) return null;

  const data = currentGenre.historyData;
  const maxPrice = Math.max(...data) * 1.15;
  const minPrice = Math.min(...data) * 0.85;
  const range = maxPrice - minPrice;
  const width = 1000;
  const height = 300;
  
  // 90日間の実績ポイント (全体の 90/97 を占める)
  const totalDays = data.length + 7; // 90 + 7 = 97
  const points = data.map((price: number, i: number) => ({
    x: (i / (totalDays - 1)) * width,
    y: height - ((price - minPrice) / range) * height
  }));

  const pathD = `M ${points.map((p: any) => `${p.x},${p.y}`).join(' L ')}`;

  // 7日間の予測ポイント生成
  const lastPrice = data[data.length - 1];
  
  // リスクに基づく予測勾配の決定
  const getForecastSlope = () => {
    const relevantNews = newsRisks.filter(n => {
      const title = n.title.toLowerCase();
      return title.includes(currentGenre.name.toLowerCase()) || (n.kw && title.includes(n.kw.toLowerCase()));
    });

    let slope = (data[data.length - 1] - data[data.length - 2]) / 2; // トレンド継承
    if (relevantNews.some(n => n.level === 'CRITICAL')) slope += 5;
    if (relevantNews.some(n => n.level === 'HIGH')) slope += 3;
    
    return slope;
  };

  const slope = getForecastSlope();
  const forecastPoints = Array.from({ length: 8 }).map((_, i) => {
    const x = ((data.length - 1 + i) / (totalDays - 1)) * width;
    const price = lastPrice + (slope * i);
    const y = height - ((price - minPrice) / range) * height;
    return { x, y };
  });

  const forecastD = `M ${forecastPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;

  // 市場診断メッセージの動的生成（ニュース連動）
  const getMarketDiagnosis = (history: number[]) => {
    const currentPriceValue = history[history.length - 1];
    const prev = history[history.length - 2] || currentPriceValue;
    const avg = history.reduce((a, b) => a + b, 0) / history.length;
    const trend = (currentPriceValue - prev) / prev;
    
    // ニュースリスクの引用
    const relevantNews = newsRisks.find(n => {
      const title = n.title.toLowerCase();
      return title.includes(currentGenre.name.toLowerCase()) || (n.kw && title.includes(n.kw.toLowerCase()));
    });
    
    if (relevantNews) {
      const levelText = relevantNews.level === 'CRITICAL' ? '重大な' : '警戒すべき';
      return `【AI警告】「${relevantNews.title}」の影響により、${currentGenre.name}市場には${levelText}上昇圧力がかかっています。将来予測は「上向き」であり、備蓄を優先すべきフェーズです。`;
    }

    if (trend > 0.05) {
      return `【急上昇】${currentGenre.name}価格が急騰中。ボラティリティが高まっており、追加の値上げリスクがあります。備蓄が少なければ早めの確保を。`;
    }
    if (currentPriceValue < avg * 0.95) {
      return `【底値圏】過去90日の平均を5%以上下回っています。コストパフォーマンスが非常に高く、まとめ買いに最適なタイミングです。`;
    }
    return `【安定】需給バランスが取れた適正価格を維持しています。大きな変動予測はなく、日常的な買い足しで問題ないフェーズです。`;
  };

  // 感度スコアの計算
  const getSensitivityScore = (history: number[]) => {
    const min = Math.min(...history);
    const max = Math.max(...history);
    const volatility = (max - min) / min;
    
    const hasRisk = newsRisks.some(n => n.title.includes(currentGenre.name));
    
    // 0 to 100 score
    const score = Math.min(100, Math.round((volatility * 200) + (hasRisk ? 40 : 10)));
    return score;
  };

  const sensitivityScore = getSensitivityScore(data);
  const sensitivityLabel = sensitivityScore > 70 ? '上昇感度 高' : (sensitivityScore > 30 ? '上昇感度 中' : '上昇感度 低');
  const sensitivityColor = sensitivityScore > 70 ? '#ef4444' : (sensitivityScore > 30 ? '#f59e0b' : '#3b82f6');

  return (
    <div className="sidebar-box universal-chart-outer" style={{ 
      marginTop: '40px', 
      padding: '24px 16px', 
      background: 'var(--bg-card)',
      borderRadius: '24px',
      border: '1px solid var(--border-main)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div className="chart-header">
        <div>
          <h2 className="chart-title">価格トレンド解析センター <span style={{ fontSize: '12px', background: 'var(--bg-info)', color: 'var(--text-info)', padding: '2px 8px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '8px' }}>PERFECT INTELLIGENCE v6.70</span></h2>
          <p className="chart-subtitle" style={{ color: 'var(--text-sub)' }}>
            AIが市場リスクと連動して「7日間予測」を描画します
          </p>
        </div>
      </div>

      {/* カテゴリー切り替えタブ */}
      <div className="chart-tabs">
        {genres.map(genre => (
          <button
            key={genre.id}
            onClick={() => setSelectedId(genre.id)}
            className={`chart-tab ${selectedId === genre.id ? 'active' : ''}`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      <div className="chart-main-layout">
        <div style={{ position: 'relative', minHeight: '260px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text-main)' }}>
              {currentGenre.name} の推移と予測 (90 + 7日間)
            </div>
          </div>

          <svg width="100%" height="220" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            {[0, 1, 2, 3, 4].map(i => (
              <line 
                key={i} 
                x1="0" y1={(i * height) / 4} 
                x2={width} y2={(i * height) / 4} 
                stroke="var(--border-main)" 
                strokeWidth="1" 
                opacity="0.3"
              />
            ))}
            
            <path
              d={`${pathD} L ${points[points.length-1].x},${height} L 0,${height} Z`}
              fill="url(#universalGradient)"
              opacity="0.1"
            />
            
            <defs>
              <linearGradient id="universalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--price-blue)" />
                <stop offset="100%" stopColor="var(--bg-card)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d={pathD}
              fill="none"
              stroke="var(--price-blue)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* AI予測曲線 */}
            <path
              d={forecastD}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="4"
              strokeDasharray="8,8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: 'var(--text-sub)', fontSize: '10px', fontWeight: '700' }}>
            <span>90日前</span>
            <span style={{ color: 'var(--text-main)' }}>現在</span>
            <span style={{ color: 'var(--text-sub)' }}>7日後予測</span>
          </div>
        </div>

        <div className="chart-insight-box" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-main)', borderRadius: '20px', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '12px' }}>
            市場トレンド展望 <span style={{ color: 'var(--price-blue)' }}>Powered by AI</span>
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-main)', fontWeight: '600', opacity: 0.9 }}>
            {getMarketDiagnosis(data)}
          </div>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-main)' }}>
            <div style={{ width: '100%', height: '4px', background: 'var(--border-main)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${sensitivityScore}%`, height: '100%', background: sensitivityColor, borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', fontWeight: '800', color: sensitivityColor }}>
              <span>{sensitivityLabel}</span>
              <span>変動リスク: {sensitivityScore}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
