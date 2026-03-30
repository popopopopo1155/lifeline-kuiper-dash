import React from 'react';
import type { Genre } from '../types';

interface SidebarProps {
  genres: Genre[];
}

export const Sidebar: React.FC<SidebarProps> = ({ genres }) => {
  // ネットショップ（Stock）の最新安値を取得
  const getMinUnitPrice = (genreId: string) => {
    const genre = genres.find(g => g.id === genreId);
    if (!genre) return '---';
    
    let minPrice: number | null = null;
    genre.subtypes.forEach(s => {
      s.products.forEach(p => {
        const unitPrice = (p.price + p.shipping - p.points) / Math.max(0.1, p.volume);
        if (minPrice === null || unitPrice < minPrice) {
          minPrice = unitPrice;
        }
      });
    });
    
    return minPrice ? `¥${Math.round(minPrice)}` : '---';
  };

  // 生鮮品（Daily）の地域平均を取得
  const getRegionalAvg = (genreId: string) => {
    const genre = genres.find(g => g.id === genreId);
    if (!genre || genre.subtypes.length === 0) return '---';
    return `¥${genre.subtypes[0].regionalAverage}`;
  };

  const stockItems = [
    { id: 'rice', label: 'お米 (1kg)', unit: '1kg' },
    { id: 'tp', label: 'トイレットペーパー', unit: '12R' },
    { id: 'detergent', label: '洗濯洗剤', unit: '100g' },
    { id: 'tissue', label: 'ティッシュ', unit: '1箱' },
    { id: 'water', label: '水 (2L)', unit: '1本' },
    { id: 'oil', label: 'サラダ油', unit: '1000g' },
  ];

  const dailyItems = [
    { id: 'egg', label: '卵 (10個)', unit: '1パック' },
    { id: 'milk', label: '牛乳 (1L)', unit: '1本' },
    { id: 'bread', label: '食パン (6枚)', unit: '1袋' },
  ];

  const PriceRow = ({ label, price, unit }: any) => (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '12px 20px', 
        borderBottom: '1px solid #f8fafc',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ fontSize: '13px', fontWeight: '900', color: '#1e293b' }}>{label}</div>
        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>基準：{unit}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ 
          fontSize: '13px', 
          fontWeight: '900', 
          color: '#059669',
          background: '#f0fdf4',
          padding: '4px 8px',
          borderRadius: '8px',
          border: '1px solid #dcfce7',
        }}>
          {price}以下
        </span>
      </div>
    </div>
  );

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* --- STOCK SECTION --- */}
      <div className="sidebar-box" style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📦 ストック底値基準（ネット最安）
        </div>
        <div>
          {stockItems.map((item, i) => (
            <PriceRow key={i} label={item.label} price={getMinUnitPrice(item.id)} unit={item.unit} />
          ))}
        </div>
      </div>

      {/* --- DAILY SECTION --- */}
      <div className="sidebar-box" style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', fontSize: '12px', fontWeight: '900', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🥚 デイリー底値基準（スーパー推奨）
        </div>
        <div>
          {dailyItems.map((item, i) => (
            <PriceRow key={i} label={item.label} price={getRegionalAvg(item.id)} unit={item.unit} />
          ))}
        </div>
      </div>

      <div className="sidebar-box" style={{ padding: '20px', borderLeft: '4px solid #3b82f6', background: 'rgba(59, 130, 246, 0.03)', borderRadius: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: '900', color: '#1d4ed8' }}>2026年式・賢い買い分け術</p>
        <p style={{ fontSize: '11px', color: '#475569', marginTop: '10px', lineHeight: '1.6', fontWeight: '500' }}>
          重いものやかさばるものはネットの「実質単価」をチェック。生鮮食品は本サイトの「スーパー平均」を下回る時が買い時です。
        </p>
      </div>
    </aside>
  );
};
