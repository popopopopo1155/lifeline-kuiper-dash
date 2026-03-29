import React, { useState } from 'react';
import { GenreCard } from './GenreCard';
import { SubtypeCard } from './SubtypeCard';
import { Sidebar } from './Sidebar';
import { InventoryControl } from './InventoryControl';
import { usePriceData } from '../hooks/usePriceData';
import { PriceTrendChart } from './PriceTrendChart';
import { useInventory } from '../hooks/useInventory';
import { AIAdvisor } from './AIAdvisor';
import { UniversalTrendChart } from './UniversalTrendChart';
import { QuickNav } from './QuickNav';

export const Dashboard: React.FC = () => {
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: genres, loading } = usePriceData(selectedGenreId);
  const { getDaysLeft } = useInventory();

  const filteredGenres = genres.filter(genre => {
    const searchLower = searchQuery.toLowerCase();
    const genreMatch = genre.name.toLowerCase().includes(searchLower);
    const subtypeMatch = genre.subtypes.some(s => s.name.toLowerCase().includes(searchLower));
    const productMatch = genre.subtypes.some(s => s.products.some(p => p.name.toLowerCase().includes(searchLower)));
    return genreMatch || subtypeMatch || productMatch;
  });

  const selectedGenre = genres.find(g => g.id === selectedGenreId);

  const handleBack = () => {
    setSelectedGenreId(null);
  };

  return (
    <div className="app-wrapper">
      <header className="site-header">
        <a href="#" className="site-title" onClick={() => { setSelectedGenreId(null); }}>生活必需品.com</a>
        <div className="flex items-center gap-2">
          {selectedGenreId && (
            <button 
              onClick={handleBack}
              style={{ padding: '8px 16px', background: '#0055aa', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer', marginRight: '20px', fontWeight: 'bold' }}
            >
              ➔ 戻る
            </button>
          )}
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }} className="mobile-hide">地域:</span>
          <select className="region-selector">
            <option>東京都 世田谷区</option>
            <option>大阪府 大阪市</option>
          </select>
        </div>
      </header>
      
      <QuickNav />

      {loading && (
        <div style={{ position: 'fixed', top: '70px', left: '0', width: '100%', height: '3px', background: '#eee', zIndex: 1000 }}>
          <div style={{ width: '30%', height: '100%', background: '#0055aa', animation: 'loading-bar 1.5s infinite' }}></div>
        </div>
      )}

      <div className="dashboard-grid">
        <main className="main-content">
          {!selectedGenreId ? (
            <section id="products-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>生活必需品一覧</h2>
                <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                  <input 
                    type="text" 
                    placeholder="商品名や種類を検索 (例: あきたこまち, 5kg)..." 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px 12px 40px', 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  />
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                </div>
              </div>
              <div className="heatmap-grid">
                {filteredGenres.map((genre) => {
                  let heroImage = undefined;
                  // (Image mapping logic...)
                  if (genre.id === 'rice') heroImage = '/assets/rice_user.jpg';
                  if (genre.id === 'tp') heroImage = '/assets/tp_premium_icon.png';
                  if (genre.id === 'tissue') heroImage = '/assets/tissue_user_v2.png';
                  if (genre.id === 'detergent') heroImage = '/assets/detergent_user.png';
                  if (genre.id === 'water') heroImage = '/assets/water_user.png';
                  if (genre.id === 'egg') heroImage = '/assets/eggs_user.jpg';
                  if (genre.id === 'milk') heroImage = '/assets/milk_user.png';
                  if (genre.id === 'bread') heroImage = '/assets/bread_user.png';
                  if (genre.id === 'oil') heroImage = '/assets/oil_user.png';
                  
                  return (
                    <GenreCard 
                      key={genre.id} 
                      genre={genre} 
                      daysLeft={getDaysLeft(genre.id)} 
                      onClick={setSelectedGenreId}
                      heroImage={heroImage}
                    />
                  );
                })}
              </div>
            </section>
          ) : (
            <section>
              <h2 className="section-title">
                {selectedGenre?.name} <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>の商品一覧</span>
              </h2>
              <div className="heatmap-grid">
                {selectedGenre?.subtypes.map((subtype) => (
                  <SubtypeCard key={subtype.id} subtype={subtype} />
                ))}
              </div>

              {/* 価格インテリジェンス・推移チャートの追加 */}
              <PriceTrendChart 
                genreName={selectedGenre?.name || ''} 
                data={[2800, 2750, 2900, 2850, 2600, 2550, 2480, 2400, 2350, 2420, 2380]} 
              />
            </section>
          )}

          {!selectedGenreId && (
            <div id="trend-section">
              <UniversalTrendChart 
                genres={genres} 
                activeGenreId={selectedGenreId} 
              />
            </div>
          )}
        </main>

        <aside className="sidebar">
          <div id="ai-section"><AIAdvisor /></div>
          <div id="inventory-section"><InventoryControl /></div>
          <Sidebar />
        </aside>
      </div>

      <footer className="site-footer" style={{ marginTop: '60px', padding: '40px 20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6', fontWeight: 'bold' }}>
          本サイトはAmazon.co.jpおよび楽天の各アフィリエイトプログラムに参加しており、紹介商品から収益を得る場合があります。
          2026年最新の市場データに基づき、あなたに最適な購入タイミングを中立的な立場から診断しています。
        </p>
        <div style={{ marginTop: '20px', fontSize: '11px', color: '#cbd5e1' }}>
          © 2026 生活必需品.com - Intelligent Supply Chain Insight
        </div>
      </footer>
      
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @media (max-width: 768px) {
          .mobile-hide { display: none; }
        }
        .product-row:hover {
          background: #f0f7ff !important;
        }
      `}</style>
    </div>
  );
};
