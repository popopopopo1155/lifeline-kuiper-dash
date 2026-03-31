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

export const Dashboard: React.FC = () => {
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: genres, loading, tokensLeft, newsRisks, numericalRisks, isPaused, refreshData } = usePriceData();
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

  const handleResume = () => {
    if (selectedGenreId) {
      refreshData(selectedGenreId);
    } else {
      // 全体検索中に止まった場合はデフォルトで米などを再開対象にするか、
      // 最後に止まったIDをフックに持たせておくと親切
      refreshData('rice');
    }
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
      <Header />
      
      {/* サブアクションバー：戻るボタンと地域選択 */}
      <div className="bg-white border-b border-gray-100 px-8 py-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {selectedGenreId && (
            <button 
              onClick={handleBack}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
            >
              ➔ 戻る
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mobile-hide">Region:</span>
          <select className="region-selector text-xs font-bold border-none bg-gray-50 rounded-lg px-3 py-1.5 text-gray-600 focus:ring-0">
            <option>東京都 世田谷区</option>
            <option>大阪府 大阪市</option>
          </select>
        </div>
      </div>
      
      <QuickNav />

      {loading && (
        <div style={{ position: 'fixed', top: '70px', left: '0', width: '100%', height: '3px', background: '#eee', zIndex: 1000 }}>
          <div style={{ width: '30%', height: '100%', background: '#0055aa', animation: 'loading-bar 1.5s infinite' }}></div>
        </div>
      )}

      <div className="dashboard-grid">
        <main className="main-content">
          {/* リスクアラートバナーの設置 */}
          <RiskAlertBanner newsRisks={newsRisks} numericalRisks={numericalRisks} />

          {!selectedGenreId ? (
            <section id="products-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>生活必需品インテリジェンス</h2>
                <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                  <input 
                    type="text" 
                    placeholder="商品名や種類を検索..." 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px' }}
                  />
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                </div>
              </div>

              <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📦 【ストック品】 ネットまとめ買い推奨
              </h3>
              <div className="heatmap-grid" style={{ marginBottom: '40px' }}>
                {stockGenres.map((genre) => (
                  <GenreCard key={genre.id} genre={genre} daysLeft={getDaysLeft(genre.id)} onClick={setSelectedGenreId} heroImage={getHeroImage(genre.id)} />
                ))}
              </div>

              <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🥚 【デイリー品】 スーパー底値比較・鮮度重視
              </h3>
              <div className="heatmap-grid">
                {dailyGenres.map((genre) => (
                  <GenreCard key={genre.id} genre={genre} daysLeft={getDaysLeft(genre.id)} onClick={setSelectedGenreId} heroImage={getHeroImage(genre.id)} />
                ))}
              </div>
            </section>
          ) : (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>
                  {selectedGenre?.name} <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>の市場データ</span>
                </h2>
                <button 
                  onClick={() => selectedGenreId && refreshData(selectedGenreId)}
                  disabled={loading || tokensLeft <= 0}
                  style={{
                    padding: '10px 20px',
                    background: tokensLeft > 0 ? 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' : '#cbd5e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '900',
                    cursor: loading || tokensLeft <= 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? '🔄 同期中...' : '✨ インテリジェンス同期'}
                </button>
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
              <UniversalTrendChart genres={genres} activeGenreId={selectedGenreId} />
            </div>
          )}
        </main>

        <aside className="sidebar">
          <div id="ai-section"><AIAdvisor /></div>
          <div id="inventory-section"><InventoryControl /></div>
          <Sidebar genres={genres} />
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
