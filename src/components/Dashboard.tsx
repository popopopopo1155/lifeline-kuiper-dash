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
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: genres, loading, newsRisks, numericalRisks } = usePriceData();
  const { getDaysLeft } = useInventory();

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

          {!selectedGenreId ? (
            <section id="products-section">
              <div className="sidebar-box glass-card" style={{ 
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '24px',
                padding: '16px 24px 24px 24px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '16px' }}>
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
                <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-sub)', fontWeight: 'bold' }}>
                  本管制塔は、e-Stat政府統計およびリアルタイムな地政学ニュースを Gemini が統合解析し、
                  物価変動の予兆を Master に提示します。市場平均との乖離を 24時間 監視し、
                  「今買うべきか、待つべきか」という最良の経済判断を 🏮 最小単位で支援します。
                </p>
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
          
          <div className="sidebar-box glass-card" style={{ padding: '20px', marginBottom: '24px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-sub)', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              🏮 最近の戦略分析
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/journal/rice-truth" className="text-link" style={{ fontSize: '13px', color: 'var(--text-main)', textDecoration: 'none', display: 'block', padding: '8px 0', borderBottom: '1px solid var(--border-main)' }}>
                  お米の真実：¥787/kg という絶対座標の解剖学
                </Link>
              </li>
              <li>
                <Link to="/journal/inflation-shield" className="text-link" style={{ fontSize: '13px', color: 'var(--text-main)', textDecoration: 'none', display: 'block', padding: '8px 0' }}>
                  2026年インフレの嵐：資産を『盾』に変える知能
                </Link>
              </li>
            </ul>
          </div>

          <div id="inventory-section" style={{ marginBottom: '24px' }}><InventoryControl /></div>
          <Sidebar genres={genres} />
        </aside>
      </div>

      
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
