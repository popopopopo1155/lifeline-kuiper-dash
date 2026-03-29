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
  const { data: genres, loading } = usePriceData(selectedGenreId);
  const { getDaysLeft } = useInventory();

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
              <h2 className="section-title">生活必需品一覧</h2>
              <div className="heatmap-grid">
                {genres.map((genre) => {
                  let heroImage = undefined;
                  if (genre.id === 'rice') heroImage = '/assets/rice_user.jpg';
                  if (genre.id === 'tp') heroImage = '/assets/tp_premium_icon.png';
                  if (genre.id === 'tissue') heroImage = '/assets/tissue_user_v2.png';
                  if (genre.id === 'detergent') heroImage = '/assets/detergent_user.png';
                  if (genre.id === 'water') heroImage = '/assets/water_user.png';
                  if (genre.id === 'egg') heroImage = '/assets/eggs_user.jpg';
                  if (genre.id === 'milk') heroImage = '/assets/milk_user.png';
                  if (genre.id === 'bread') heroImage = '/assets/bread_user.png';
                  if (genre.id === 'oil') heroImage = '/assets/oil_user.png';
                  if (genre.id === 'seasoning') heroImage = '/assets/seasoning_premium.png';
                  
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

          {/* 万能トレンドチャートの追加（常に下部に表示、またはホーム時のみ） */}
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
