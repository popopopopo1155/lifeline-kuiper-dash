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

  // 市場診断メッセージの生成
  const getMarketDiagnosis = (id: string) => {
    if (id === 'rice') return '「買い控え」推奨。米価は現在上昇トレンドにあり、2週間後に新米の流通量増加に伴い10%程度の価格調整が入る予測です。';
    if (id === 'tp' || id === 'tissue') return '「最安値圏」です。紙パルプ価格が安定しており、現在は過去1年で最も安い水準です。ストックに余裕がなければ今が買い時です。';
    if (id === 'oil') return '「至急確保」を推奨。原材料高騰により来月より一斉値上げの予報が出ています。未開封で1年保存可能なため、1本予備を推奨。';
    return '「安定」しています。大きな変動は予測されておらず、必要な分を都度購入するスタイルで問題ありません。';
  };

  return (
    <div className="sidebar-box" style={{ 
      marginTop: '40px', 
      padding: '30px', 
      background: 'white',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      width: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            価格トレンド解析センター
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
            全カテゴリーの市場動向を俯瞰し、AIが最適な購入タイミングを診断します
          </p>
        </div>
      </div>

      {/* カテゴリー切り替えタブ */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '30px', 
        overflowX: 'auto', 
        paddingBottom: '10px',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}>
        {genres.map(genre => (
          <button
            key={genre.id}
            onClick={() => setSelectedId(genre.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '800',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: selectedId === genre.id ? '#3b82f6' : '#f1f5f9',
              color: selectedId === genre.id ? 'white' : '#64748b',
              border: 'none',
              boxShadow: selectedId === genre.id ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none'
            }}
          >
            {genre.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>
        {/* チャートエリア */}
        <div style={{ position: 'relative', height: '340px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ fontSize: '14px', fontWeight: '900', color: '#1e293b' }}>
              {currentGenre.name} の価格推移 (90日間)
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontWeight: '700' }}>
                <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span> 市場価格
              </div>
              <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: '700' }}>
                <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', opacity: 0.5 }}></span> 地域底値
              </div>
            </div>
          </div>

          <svg width="100%" height="280" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
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

            {/* Target Price Line (Subtle) */}
            <line 
              x1="0" y1={height * 0.85} 
              x2={width} y2={height * 0.85} 
              stroke="#ef4444" 
              strokeWidth="1.5" 
              strokeDasharray="8,8" 
              opacity="0.4"
            />
          </svg>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>
            <span>90日前</span>
            <span>60日前</span>
            <span>30日前</span>
            <span>現在</span>
            <span style={{ color: '#3b82f6' }}>予測 (7日間)</span>
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div style={{ 
          background: '#f8fafc', 
          borderRadius: '20px', 
          padding: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            市場トレンド展望
          </div>
          <div style={{ fontSize: '12.5px', lineHeight: '1.8', color: '#334155', fontWeight: '600' }}>
            {getMarketDiagnosis(selectedId)}
          </div>
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '8px' }}>将来の変動確率</div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', background: '#3b82f6', borderRadius: '10px' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>
              <span>下落</span>
              <span>上昇感度 高</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
