import React, { useState, useEffect } from 'react';
import type { Genre } from '../data/mockData';

interface UniversalTrendChartProps {
  genres: Genre[];
  activeGenreId: string | null;
}

export const UniversalTrendChart: React.FC<UniversalTrendChartProps> = ({ genres, activeGenreId }) => {
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
  const maxPrice = Math.max(...data) * 1.1;
  const minPrice = Math.min(...data) * 0.9;
  const range = maxPrice - minPrice;
  const width = 1000;
  const height = 300;
  
  const points = data.map((p, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((p - minPrice) / range) * height
  }));

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  // 市場診断メッセージの動的生成
  const getMarketDiagnosis = (history: number[]) => {
    const current = history[history.length - 1];
    const prev = history[history.length - 2] || current;
    const avg = history.reduce((a, b) => a + b, 0) / history.length;
    const trend = (current - prev) / prev;
    
    if (trend > 0.05) {
      return `【急上昇】${currentGenre.name}価格が急騰中。ボラティリティが高まっており、追加の値上げリスクがあります。備蓄が少なければ早めの確保を。`;
    }
    if (current < avg * 0.95) {
      return `【底値圏】過去90日の平均を5%以上下回っています。コストパフォーマンスが非常に高く、まとめ買いに最適なタイミングです。`;
    }
    if (trend < -0.03) {
      return `【軟調】価格調整局面に入っています。下落傾向にあるため、数日待つことでより安値で入手できる可能性があります。`;
    }
    return `【安定】需給バランスが取れた適正価格を維持しています。大きな変動予測はなく、日常的な買い足しで問題ないフェーズです。`;
  };

  return (
    <div className="sidebar-box universal-chart-outer" style={{ 
      marginTop: '40px', 
      padding: '24px 16px', 
      background: 'white',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div className="chart-header">
        <div>
          <h2 className="chart-title">
            価格トレンド解析センター
          </h2>
          <p className="chart-subtitle">
            AIが最適な購入タイミングを診断します
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
        {/* チャートエリア */}
        <div style={{ position: 'relative', minHeight: '260px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b' }}>
              {currentGenre.name} の推移 (90日間)
            </div>
          </div>

          <svg width="100%" height="220" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line 
                key={i} 
                x1="0" y1={(i * height) / 4} 
                x2={width} y2={(i * height) / 4} 
                stroke="#f1f5f9" 
                strokeWidth="1" 
              />
            ))}
            
            {/* Gradient Fill */}
            <path
              d={`${pathD} L ${width},${height} L 0,${height} Z`}
              fill="url(#universalGradient)"
              opacity="0.1"
            />
            
            <defs>
              <linearGradient id="universalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#fff" />
              </linearGradient>
            </defs>

            {/* Main Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: '#94a3b8', fontSize: '10px', fontWeight: '700' }}>
            <span>90日前</span>
            <span>現在</span>
            <span style={{ color: '#3b82f6' }}>予測</span>
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="chart-insight-box">
          <div style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a', marginBottom: '12px' }}>
            市場トレンド展望
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#334155', fontWeight: '600' }}>
            {getMarketDiagnosis(data)}
          </div>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', background: '#3b82f6', borderRadius: '10px' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>
              <span>上昇感度 高</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
