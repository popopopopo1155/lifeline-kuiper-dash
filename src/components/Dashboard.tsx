import React, { useState } from 'react';
import { GenreCard } from './GenreCard';
import Header from './Header';
import { SubtypeCard } from './SubtypeCard';
import { Sidebar } from './Sidebar';
import { InventoryControl } from './InventoryControl';
import { usePriceData } from '../hooks/usePriceData';
import { PriceTrendChart } from './PriceTrendChart';
import { useInventory } from '../hooks/useInventory';
import { AIAdvisor } from './AIAdvisor';
import { UniversalTrendChart } from './UniversalTrendChart';
import { QuickNav } from './QuickNav';
import RiskAlertBanner from './RiskAlertBanner';

import { usePriceVictory } from '../hooks/usePriceVictory';

export const Dashboard: React.FC = () => {
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: genres, loading, newsRisks, numericalRisks } = usePriceData();
  const { getDaysLeft } = useInventory();
  const { totalVictoryAmount, lastUpdated } = usePriceVictory();

  const filteredGenres = genres.filter(genre => {
    const searchLower = searchQuery.toLowerCase();
    const genreMatch = genre.name.toLowerCase().includes(searchLower);
    const subtypeMatch = genre.subtypes.some(s => s.name.toLowerCase().includes(searchLower));
    return genreMatch || subtypeMatch;
  });

  const selectedGenre = genres.find(g => g.id === selectedGenreId);

  const handleBack = () => {
    setSelectedGenreId(null);
  };


  const stockGenres = filteredGenres.filter(g => g.group === 'stock');
  const dailyGenres = filteredGenres.filter(g => g.group === 'daily');

  const getHeroImage = (id: string) => {
    if (id === 'rice') return '/assets/rice_user.jpg';
    if (id === 'tp') return '/assets/tp_premium_icon.png';
    if (id === 'tissue') return '/assets/tissue_user_v2.png';
    if (id === 'detergent') return '/assets/detergent_user.png';
    if (id === 'water') return '/assets/water_user.png';
    if (id === 'egg') return '/assets/eggs_user.jpg';
    if (id === 'milk') return '/assets/milk_user.png';
    if (id === 'bread') return '/assets/bread_user.png';
    if (id === 'oil') return '/assets/oil_user.png';
    return undefined;
  };

  return (
    <div className="app-wrapper">
      <Header onBack={handleBack} showBack={!!selectedGenreId} />
      
      
      <QuickNav />

      {loading && (
        <div style={{ position: 'fixed', top: '70px', left: '0', width: '100%', height: '3px', background: '#eee', zIndex: 1000 }}>
          <div style={{ width: '30%', height: '100%', background: '#0055aa', animation: 'loading-bar 1.5s infinite' }}></div>
        </div>
      )}

      <div className="dashboard-grid" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginTop: '20px' }}>
        <main className="main-content" style={{ flex: 1, minWidth: 0 }}>
           {/* リスクアラートバナーの設置 */}
           <RiskAlertBanner newsRisks={newsRisks} numericalRisks={numericalRisks} />

           {/* 🏮 [VICTORY SUMMARY] Masterの勝利を刻む */}
           {totalVictoryAmount > 0 && (
             <div className="victory-summary-card glass-card animate-pulse-subtle" style={{
               padding: '20px 24px',
               marginBottom: '24px',
               background: 'linear-gradient(135deg, rgba(0, 85, 170, 0.1), rgba(0, 170, 255, 0.05))',
               border: '1px solid rgba(0, 85, 170, 0.2)',
               borderRadius: '24px'
             }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h4 style={{ fontSize: '12px', color: 'var(--text-sub)', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                     Current Victory Amount (Savings vs National Avg)
                   </h4>
                   <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                     <span style={{ fontSize: '20px', opacity: 0.6 }}>¥</span>
                     {totalVictoryAmount.toLocaleString()}
                   </div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '11px', color: 'var(--text-sub)', opacity: 0.7 }}>
                     Source: e-Stat (Statistics Bureau of Japan)
                   </div>
                   <div style={{ fontSize: '11px', color: 'var(--text-sub)', opacity: 0.7 }}>
                     Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : '---'}
                   </div>
                 </div>
               </div>
             </div>
           )}

           {!selectedGenreId ? (
             <section id="products-section">
              <div className="sidebar-box glass-card" style={{ 
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '24px',
                padding: '24px',
                marginBottom: '20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' 
              }}>
                <h2 className="section-title" style={{ margin: 0 }}>生活必需品インテリジェンス</h2>
                <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                  <input 
                    type="text" 
                    placeholder="商品名や種類を検索..." 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', border: '1px solid var(--border-main)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '14px' }}
                  />
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                </div>
              </div>

              <h3 style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📦 【ストック品】 ネットまとめ買い推奨
              </h3>
              <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
                {stockGenres.map((genre) => (
                  <GenreCard key={genre.id} genre={genre} daysLeft={getDaysLeft(genre.id)} onClick={setSelectedGenreId} heroImage={getHeroImage(genre.id)} />
                ))}
              </div>

              <h3 style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🥚 【デイリー品】 スーパー底値比較・鮮度重視
              </h3>
              <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {dailyGenres.map((genre) => (
                  <GenreCard key={genre.id} genre={genre} daysLeft={getDaysLeft(genre.id)} onClick={setSelectedGenreId} heroImage={getHeroImage(genre.id)} />
                ))}
              </div>
            </section>
          ) : (
            <section>
              <div style={{ marginBottom: '20px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>
                  {selectedGenre?.name} <span style={{ fontSize: '14px', color: 'var(--text-sub)', fontWeight: 'normal' }}>の市場データ</span>
                </h2>
              </div>

              <div className="heatmap-grid" style={{ marginBottom: '30px' }}>
                {selectedGenre?.subtypes.map((subtype) => (
                  <SubtypeCard 
                    key={subtype.id} 
                    subtype={subtype} 
                    group={selectedGenre.group} 
                    unitType={selectedGenre.unitType} 
                  />
                ))}
              </div>

              <PriceTrendChart 
                genreName={selectedGenre?.name || ''} 
                data={selectedGenre?.historyData || []} 
              />
            </section>
          )}

          {!selectedGenreId && (
            <div id="trend-section" style={{ marginTop: '40px' }}>
              <UniversalTrendChart 
                genres={genres} 
                activeGenreId={selectedGenreId} 
                newsRisks={newsRisks?.activeRisks || []}
              />
            </div>
          )}
        </main>

        <aside className="sidebar">
          <div id="ai-section" style={{ marginBottom: '24px' }}><AIAdvisor /></div>
          <div id="inventory-section" style={{ marginBottom: '24px' }}><InventoryControl /></div>
          <Sidebar genres={genres} />
        </aside>
      </div>

      <footer className="site-footer" style={{ marginTop: '60px', padding: '40px 20px', borderTop: '1px solid var(--border-main)', textAlign: 'center' }}>
        <div className="sidebar-box glass-card" style={{ 
          overflow: 'hidden', 
          borderRadius: '24px',
        }}>
          <div style={{ padding: '20px', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-main)' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-sub)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6', fontWeight: 'bold' }}>
              本サイトはAmazon.co.jpおよび楽天の各アフィリエイトプログラムに参加しており、紹介商品から収益を得る場合があります。
              2026年最新の市場データに基づき、あなたに最適な購入タイミングを中立的な立場から診断しています。
            </p>
            <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--signal-gray)' }}>
              © 2026 生活必需品.com - Intelligent Supply Chain Insight
            </div>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @media (max-width: 768px) {
          .mobile-hide { display: none; }
        }
      `}</style>
    </div>
  );
};
