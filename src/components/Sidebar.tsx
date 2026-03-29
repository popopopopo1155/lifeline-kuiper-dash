import React from 'react';

export const Sidebar: React.FC = () => {
  const bottomPrices = [
    { label: 'お米 (1kg)', price: '¥480以下', unit: '1kg' },
    { label: 'トイレットペーパー', price: '¥95以下', unit: '12R' },
    { label: '洗濯洗剤', price: '¥85以下', unit: '100g' },
    { label: '卵 (10個)', price: '¥198以下', unit: '1パック' },
    { label: '牛乳 (1L)', price: '¥210以下', unit: '1本' },
    { label: 'ティッシュ', price: '¥65以下', unit: '1箱' },
    { label: '食パン (6枚)', price: '¥148以下', unit: '1袋' },
    { label: '水 (2L)', price: '¥98以下', unit: '1本' },
    { label: 'サラダ油', price: '¥348以下', unit: '1000g' },
  ];

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="sidebar-box" style={{ 
        padding: '0', 
        overflow: 'hidden', 
        background: 'white',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="sidebar-header" style={{ 
          padding: '20px 24px', 
          background: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0',
          fontSize: '14px',
          fontWeight: '900',
          color: '#0f172a',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          基準底値カタログ
        </div>
        <div style={{ padding: '8px 0' }}>
          {bottomPrices.map((item, i) => (
            <div 
              key={i} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '16px 24px', 
                borderBottom: i === bottomPrices.length - 1 ? 'none' : '1px solid #f8fafc',
                transition: 'background 0.2s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>
                  基準：{item.unit}あたり
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: '900', 
                  color: '#059669',
                  background: '#f0fdf4',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '1px solid #dcfce7',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.05)'
                }}>
                  {item.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-box" style={{ 
        padding: '20px', 
        borderLeft: '4px solid #3b82f6', 
        background: 'rgba(59, 130, 246, 0.03)',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
      }}>
        <p style={{ fontSize: '13px', fontWeight: '900', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          賢い買い物のコツ
        </p>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '10px', lineHeight: '1.7', fontWeight: '500' }}>
          実質単価が「底値」を下回っている時は、物流在庫が潤沢なサインです。保存の効くものはまとめ買いを推奨します。
        </p>
      </div>

      <div className="sidebar-box" style={{ 
        padding: '20px', 
        borderLeft: '4px solid #ef4444', 
        background: 'rgba(239, 68, 68, 0.03)',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
      }}>
        <p style={{ fontSize: '13px', fontWeight: '900', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px' }}>
          値上げ予報レポート
        </p>
        <p style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '10px', lineHeight: '1.7', fontWeight: '500' }}>
          来月より原材料高騰の影響で紙類・油類が上昇予測です。今月中に予備を1つ確保することを推奨。
        </p>
      </div>
    </aside>
  );
};
