import React from 'react';
import type { Genre } from '../types';

interface SidebarProps {
  genres: Genre[];
}

export const Sidebar: React.FC<SidebarProps> = ({ genres }) => {
  // [OFFICIAL MARKET SYNC] - 政府統計（e-Stat）由来の平均価格を取得
  const getStatsAvg = (genreId: string) => {
    const genre = genres.find(g => g.id === genreId);
    if (!genre || genre.subtypes.length === 0) return '---';
    
    const avg = genre.subtypes[0].regionalAverage;
    const isOfficial = genre.subtypes[0].isOfficial;

    return {
      price: avg ? `¥${Math.round(avg)}` : '---',
      isOfficial
    };
  };

  const stockItems = [
    { id: 'rice', label: 'お米 (1kg)', unit: '1kg' },
    { id: 'tp', label: 'トイレットペーパー', unit: '100m' },
    { id: 'detergent', label: '洗濯洗剤', unit: '100g' },
    { id: 'tissue', label: 'ティッシュ', unit: '100組' },
    { id: 'water', label: '水 (2L)', unit: '1本' },
    { id: 'oil', label: 'サラダ油', unit: '1000g' },
  ];

  const dailyItems = [
    { id: 'egg', label: '卵 (10個)', unit: '1パック' },
    { id: 'milk', label: '牛乳 (1L)', unit: '1本' },
    { id: 'bread', label: '食パン (6枚)', unit: '1袋' },
  ];

  const PriceRow = ({ label, stats, unit }: any) => (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '12px 20px', 
        borderBottom: '1px solid var(--border-main)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text-main)' }}>{label}</div>
          {stats.isOfficial && <span title="国家統計同期済み" style={{ fontSize: '10px', cursor: 'help' }}>🏛️</span>}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: '700' }}>基準：{unit}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ 
          fontSize: '13px', 
          fontWeight: '900', 
          color: 'var(--text-info)',
          background: 'rgba(56, 189, 248, 0.1)',
          padding: '4px 10px',
          borderRadius: '8px',
          border: '1px solid var(--price-blue)',
        }}>
          {stats.price}
        </span>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* --- OFFICIAL STATS SECTION --- */}
      <div className="sidebar-box glass-card" style={{ borderRadius: '24px', overflow: 'hidden', background: 'var(--bg-card)' }}>
        <div style={{ padding: '16px 20px', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-main)', fontSize: '11px', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏛️ 国家統計・市場平均単価
        </div>
        <div>
          {stockItems.map((item, i) => (
            <PriceRow key={i} label={item.label} stats={getStatsAvg(item.id)} unit={item.unit} />
          ))}
        </div>
      </div>

      {/* --- DAILY STATS SECTION --- */}
      <div className="sidebar-box glass-card" style={{ borderRadius: '24px', overflow: 'hidden', background: 'var(--bg-card)' }}>
        <div style={{ padding: '16px 20px', background: 'rgba(255, 247, 237, 0.5)', borderBottom: '1px solid #fed7aa', fontSize: '11px', fontWeight: '900', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🥚 スーパー推奨（デイリー平均）
        </div>
        <div>
          {dailyItems.map((item, i) => (
            <PriceRow key={i} label={item.label} stats={getStatsAvg(item.id)} unit={item.unit} />
          ))}
        </div>
      </div>

      <div className="sidebar-box glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--price-blue)', borderRadius: '16px', background: 'var(--bg-card)' }}>
        <p style={{ fontSize: '13px', fontWeight: '900', color: 'var(--price-blue)' }}>🏛️ 知能化された市場指標</p>
        <p style={{ fontSize: '11px', color: 'var(--text-sub)', marginTop: '10px', lineHeight: '1.6', fontWeight: '500' }}>
          サイドバーの数値は総務省・農水省の統計に基づく「日本の平均価格」です。メインカードの価格がこれを下回っていれば、市場平均より賢く買い物できている証です。
        </p>
      </div>
    </div>
  );
};
