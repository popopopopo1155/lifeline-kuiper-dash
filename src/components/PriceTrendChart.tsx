import React from 'react';

interface PriceTrendChartProps {
  genreName: string;
  data: number[];
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ genreName, data }) => {
  // 簡易的なSVGチャートの実装
  const maxPrice = Math.max(...data) * 1.1;
  const minPrice = Math.min(...data) * 0.9;
  const range = maxPrice - minPrice;
  const width = 800;
  const height = 200;
  
  const points = data.map((p, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((p - minPrice) / range) * height
  }));

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="price-card" style={{ marginTop: '30px', padding: '20px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>
          {genreName} の市場価格推移 <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>(過去90日・主要モール平均)</span>
        </h3>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
            <span style={{ width: '10px', height: '10px', background: '#0055aa', borderRadius: '50%' }}></span> 市場平均
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#ef4444' }}>
            <span style={{ width: '10px', height: '10px', border: '1px dashed #ef4444', borderRadius: '50%' }}></span> 底値ライン
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
        <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* 背景のグリッド線 */}
          {[0, 1, 2, 3].map(i => (
            <line 
              key={i} 
              x1="0" y1={(i * height) / 3} 
              x2={width} y2={(i * height) / 3} 
              stroke="#f0f0f0" 
              strokeWidth="1" 
            />
          ))}
          
          {/* メインの推移線 */}
          <path
            d={pathD}
            fill="none"
            stroke="#0055aa"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* グラデーション埋め */}
          <path
            d={`${pathD} L ${width},${height} L 0,${height} Z`}
            fill="url(#trendGradient)"
            opacity="0.1"
          />
          
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0055aa" />
              <stop offset="100%" stopColor="#fff" />
            </linearGradient>
          </defs>

          {/* 底値ライン（ダミー） */}
          <line x1="0" y1={height * 0.8} x2={width} y2={height * 0.8} stroke="#ef4444" strokeWidth="1" strokeDasharray="5,5" />
        </svg>

        {/* X軸のラベル */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#999', fontSize: '11px' }}>
          <span>90日前</span>
          <span>60日前</span>
          <span>30日前</span>
          <span>現在</span>
          <span style={{ color: '#0055aa', fontWeight: 'bold' }}>予測 (7日間)</span>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f7ff', borderRadius: '8px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0055aa' }}>MEMO</div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#0055aa' }}>市場トレンド展望: 「買い時」です</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            現在の価格は過去90日間の平均より 8% 安く、底値域にあります。来週以降、物流コストの影響で微増する予測が出ているため、在庫が少なければ今週中の購入をおすすめします。
          </div>
        </div>
      </div>
    </div>
  );
};
