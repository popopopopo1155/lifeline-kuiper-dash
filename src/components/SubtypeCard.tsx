import React, { useState } from 'react';
import type { Subtype, GenreGroup, Product } from '../types';
import { analyzePriceTrend } from '../api/priceAnalysis';
import { useAdmin } from '../contexts/AdminContext';
import { useLinkChecker } from '../hooks/useLinkChecker';
import { ArrowUp, ArrowDown, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getNormalizedVolume } from '../api/dataUtils';
import { DailyBottomPriceControl } from './DailyBottomPriceControl';
import { wrapAma, wrapRaku } from '../data/mockData';

interface SubtypeCardProps {
  subtype: Subtype;
  group: GenreGroup;
  unitType: string;
}

export const SubtypeCard: React.FC<SubtypeCardProps> = ({ subtype, group, unitType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { isAdmin, saveOverride, saveOrder, linkHealth } = useAdmin();
  const { scanLinks, isScanning, progress } = useLinkChecker();

  const handleMove = (productId: string, direction: number) => {
    const currentOrder = subtype.products.map(p => p.id);
    const index = currentOrder.indexOf(productId);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    
    saveOrder(subtype.id, newOrder);
  };
  
  const handleLinkConvert = () => {
    if (!editingProduct || !editingProduct.affiliateUrl) return;
    const url = editingProduct.affiliateUrl.trim();
    if (url.includes('amazon.co.jp')) {
      const converted = wrapAma(url);
      setEditingProduct({ ...editingProduct, affiliateUrl: converted });
    } else if (url.includes('rakuten.co.jp')) {
      const converted = wrapRaku(url);
      setEditingProduct({ ...editingProduct, affiliateUrl: converted });
    }
  };

  const displayProducts = [...subtype.products].slice(0, 10);
  const bestProduct = displayProducts[0];
  
  const bestNormalizedVol = bestProduct ? getNormalizedVolume(bestProduct.name, unitType, bestProduct.volume, bestProduct.unit, bestProduct.lengthPerRoll, bestProduct.setsPerPack, bestProduct.dosagePerWash) : 1;
  const minPrice = bestProduct 
    ? Math.round((bestProduct.price + bestProduct.shipping - bestProduct.points) / Math.max(0.1, bestNormalizedVol || 1)) 
    : 0;
  
  const allUnitPrices = subtype.products.map((p: Product) => {
    const normVol = getNormalizedVolume(p.name, unitType, p.volume, p.unit, p.lengthPerRoll, p.setsPerPack, p.dosagePerWash);
    return Math.round((p.price + p.shipping - p.points) / Math.max(0.1, normVol || 1));
  });

  const analysis = analyzePriceTrend(
    subtype.id, 
    minPrice, 
    bestProduct?.forecastData || [], 
    subtype.regionalAverage,
    allUnitPrices,
    subtype.products.length,
    subtype.volatility,
    subtype.scarcity
  );

  const isDaily = group === 'daily';

  return (
    <div className="price-card subtype-card-outer" style={{ 
      height: 'auto', 
      display: 'flex', 
      flexDirection: 'column',
      padding: 'clamp(12px, 3vw, 20px)',
      borderRadius: '24px',
      background: 'var(--bg-card)',
      position: 'relative',
      zIndex: isExpanded ? 30 : 1,
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      border: analysis.sentiment === 'warning' 
        ? '2px solid var(--signal-red)' 
        : (analysis.sentiment === 'success' ? '2px solid var(--signal-green)' : '1px solid var(--border-main)')
    }}>
      <div className="product-name" style={{ borderBottom: '1px solid var(--border-main)', paddingBottom: '12px', marginBottom: '12px', fontSize: '18px', fontWeight: '900', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-main)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             {subtype.name}
             <div className={`status-chip status-${analysis.sentiment === 'warning' ? 'wait' : (analysis.sentiment === 'success' ? 'buy' : 'regular')}`} style={{ fontSize: '10px' }}>
                {analysis.sentiment === 'warning' ? '要警戒' : (analysis.sentiment === 'success' ? '底値更新' : '安定')}
             </div>
        </div>
        <div style={{ 
          fontSize: '11px', 
          color: subtype.products.length > 0 ? 'var(--price-blue)' : 'var(--text-sub)', 
          background: subtype.products.length > 0 ? 'var(--bg-app)' : 'var(--border-main)', 
          padding: '4px 10px', 
          borderRadius: '12px',
          fontWeight: '900',
          border: `1px solid ${subtype.products.length > 0 ? 'var(--price-blue)' : 'var(--border-main)'}`
        }}>
           {isDaily ? '🏠 地場価格優先' : `📊 市場データ: ${subtype.products.length}件`}
        </div>
      </div>
      
      <div className="unit-price-box" style={{ 
        marginBottom: '16px',
        padding: '16px', 
        background: 'var(--bg-app)', 
        borderRadius: '16px', 
        textAlign: 'center',
        border: '1px solid var(--border-main)',
        position: 'relative'
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 'bold', marginBottom: '4px' }}>
          {isDaily ? '近隣スーパー目安価格' : '現在市場・最安実質単価'}
        </div>
        <div style={{ fontSize: '32px', color: 'var(--text-main)', fontWeight: '900', letterSpacing: '-0.02em', position: 'relative', display: 'inline-block' }}>
          ¥{isDaily ? subtype.regionalAverage : minPrice}
          <span style={{ fontSize: '14px', color: 'var(--text-sub)', fontWeight: '700' }}>/{unitType}</span>
        </div>
        
        {!isDaily && subtype.regionalAverage > 0 && minPrice > 0 && (
          <div style={{ 
            marginTop: '8px', 
            fontSize: '11px', 
            display: 'inline-block',
            padding: '3px 10px', 
            borderRadius: '20px',
            background: minPrice < subtype.regionalAverage ? 'var(--bg-success)' : 'var(--bg-warning)',
            color: minPrice < subtype.regionalAverage ? 'var(--text-success)' : 'var(--text-warning)',
            fontWeight: '900'
          }}>
            {minPrice < subtype.regionalAverage ? '📉 スーパーよりお得' : '🛑 スーパー推奨'}
          </div>
        )}
      </div>

      <div style={{ 
        marginBottom: '16px',
        background: analysis.sentiment === 'warning' ? 'var(--bg-warning)' : (analysis.sentiment === 'success' ? 'var(--bg-success)' : 'var(--bg-info)'),
        borderRadius: '12px',
        padding: '12px',
        fontSize: '13px',
        color: analysis.sentiment === 'warning' ? 'var(--text-warning)' : (analysis.sentiment === 'success' ? 'var(--text-success)' : 'var(--text-info)'),
        fontWeight: 'bold',
        lineHeight: '1.5',
        border: `1px solid ${analysis.sentiment === 'warning' ? 'var(--signal-red)' : (analysis.sentiment === 'success' ? 'var(--signal-green)' : 'var(--price-blue)')}`
      }}>
        {analysis.reasoning}
      </div>

      {isDaily ? (
        <DailyBottomPriceControl 
          subtypeId={subtype.id}
          subtypeName={subtype.name}
          regionalAverage={subtype.regionalAverage}
          unitType={unitType}
        />
      ) : (
        <>
          <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.8, color: 'var(--text-sub)' }}>
                実効最安値: ¥{minPrice.toLocaleString()}/{unitType}
              </span>
              {subtype.lastUpdated && (
                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '2px', color: 'var(--text-sub)' }}>
                  🕒 {new Date(subtype.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 更新
                </div>
              )}
            </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              width: '100%', padding: '12px', background: 'var(--bg-white)', color: 'var(--text-main)', border: '1px solid var(--border-main)', borderRadius: '12px', fontSize: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isExpanded ? '項目を閉じる ▲' : `最安値リストを表示 ➔`}
          </button>

          {isAdmin && isExpanded && (
            <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-main)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} className={isScanning ? 'animate-pulse text-blue-500' : ''} />
                  リンク健康診断 {isScanning && `(${progress.current}/${progress.total})`}
                </span>
                <button 
                  onClick={() => scanLinks(subtype.products)}
                  disabled={isScanning}
                  style={{
                    padding: '4px 12px', fontSize: '11px', fontWeight: '900', background: isScanning ? 'var(--border-main)' : 'var(--price-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: isScanning ? 'default' : 'pointer'
                  }}
                >
                  {isScanning ? '隠密スキャン中...' : '一括健康診断を開始'}
                </button>
              </div>
              {isScanning && (
                <div style={{ height: '4px', background: 'var(--border-main)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--price-blue)', width: `${(progress.current / progress.total) * 100}%`, transition: 'width 0.3s' }} />
                </div>
              )}
            </div>
          )}

          {isExpanded && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {displayProducts.map((p, idx) => (
                <div 
                  key={p.id}
                  style={{ 
                    padding: '12px', background: p.isVerified ? 'var(--bg-info)' : 'var(--bg-card)', border: p.isVerified ? '2px solid var(--price-blue)' : '1px solid var(--border-main)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'default', transition: 'border-color 0.2s', position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {p.name.length > 35 ? p.name.substring(0, 35) + '...' : p.name}
                      {idx === 0 && !p.isVerified && (
                        <span style={{ fontSize: '10px', background: '#fbbf24', color: '#78350f', padding: '1px 6px', borderRadius: '4px', fontWeight: '900' }}>⭐ 最安</span>
                      )}
                      {p.isVerified && (
                        <span style={{ fontSize: '10px', background: 'var(--price-blue)', color: 'white', padding: '1px 8px', borderRadius: '4px', fontWeight: '900' }}>✅ 検証済</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', padding: '2px 4px', background: p.store === 'amazon' ? '#232f3e' : '#bf0000', color: 'white', borderRadius: '4px', fontWeight: '900', letterSpacing: '0.05em' }}>
                        {p.store.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 'bold' }}>
                        ¥{Math.round((p.price + p.shipping - p.points) / Math.max(0.1, getNormalizedVolume(p.name, unitType, p.volume, p.unit, p.lengthPerRoll, p.setsPerPack, p.dosagePerWash)))}/{unitType}
                        <span style={{ marginLeft: '6px', opacity: 0.7 }}>({p.volume}{p.unit})</span>
                      </span>
                    </div>

                    {isAdmin && linkHealth[p.id] && (
                      <div style={{ 
                        marginTop: '4px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', color: linkHealth[p.id].status === 'broken' ? 'var(--signal-red)' : (linkHealth[p.id].status === 'ok' ? 'var(--signal-green)' : 'var(--text-sub)')
                      }}>
                        {linkHealth[p.id].status === 'broken' ? <ShieldAlert size={12} /> : (linkHealth[p.id].status === 'ok' ? <CheckCircle2 size={12} /> : null)}
                        {linkHealth[p.id].status === 'broken' ? `死を検知: ${linkHealth[p.id].reason}` : (linkHealth[p.id].status === 'ok' ? '健常' : '未診断')}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isAdmin && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button onClick={() => handleMove(p.id, -1)} disabled={idx === 0} style={{ padding: '2px', opacity: idx === 0 ? 0.2 : 1, cursor: idx === 0 ? 'default' : 'pointer', background: 'var(--bg-app)', border: 'none', borderRadius: '4px', color: 'var(--text-main)' }}><ArrowUp size={12} /></button>
                        <button onClick={() => handleMove(p.id, 1)} disabled={idx === displayProducts.length - 1} style={{ padding: '2px', opacity: idx === displayProducts.length - 1 ? 0.2 : 1, cursor: idx === displayProducts.length - 1 ? 'default' : 'pointer', background: 'var(--bg-app)', border: 'none', borderRadius: '4px', color: 'var(--text-main)' }}><ArrowDown size={12} /></button>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)' }}>¥{p.price.toLocaleString()}</div>
                      <a href={p.affiliateUrl || '#'} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: '10px', color: 'var(--price-blue)', fontWeight: 'bold', textDecoration: 'none', display: 'block' }}>購入 ➔</a>
                    </div>
                    {isAdmin ? (
                      <button onClick={(e) => { e.stopPropagation(); setEditingProduct(p); }} style={{ border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '50%', background: 'var(--bg-app)' }}>✏️</button>
                    ) : (
                      <a 
                        href={p.affiliateUrl || '#'} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bg-card)', color: 'var(--price-blue)', border: '1.5px solid var(--border-main)', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', fontSize: '22px'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--price-blue)'; e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-main)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'; }}
                      >🛒</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* --- EDIT MODAL --- */}
      {editingProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', zIndex: 99999, padding: '80px 20px 40px 20px', overflowY: 'auto'
        }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px' }}>商品の修正・検証</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>表示名</label>
                <input 
                  type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>価格 (¥)</label>
                  <input 
                    type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                    {unitType === '100m' ? 'ロール数' : (unitType === '100組' ? 'パック数' : `重量/容量 (${unitType})`)}
                  </label>
                  <input 
                    type="number" value={editingProduct.volume} onChange={(e) => setEditingProduct({ ...editingProduct, volume: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px' }}
                  />
                </div>
              </div>

              {/* 🏮 TP Smart Calculator: Length per roll */}
              {unitType === '100m' && (
                <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '12px', border: '1px dashed var(--price-blue)' }}>
                  <label style={{ fontSize: '12px', fontWeight: '900', color: 'var(--price-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>📏 スマート計算機 (100m単価換算用)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>1ロールの長さ (m)</label>
                      <input 
                        type="number" placeholder="130, 170等" value={editingProduct.lengthPerRoll || ''} onChange={(e) => setEditingProduct({ ...editingProduct, lengthPerRoll: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--price-blue)', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-sub)' }}>自動換算結果:</div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text-main)' }}>{((editingProduct.lengthPerRoll || 0) * editingProduct.volume / 100).toFixed(2)} x 100m</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 🏮 Tissue Smart Calculator: Sets per pack */}
              {unitType === '100組' && (
                <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '12px', border: '1px dashed var(--price-blue)' }}>
                  <label style={{ fontSize: '12px', fontWeight: '900', color: 'var(--price-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>📏 ティッシュ計算機 (2枚 ＝ 1組 換算対応)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>1パックの枚数 (枚)</label>
                      <input 
                        type="number" placeholder="300, 400等" value={(editingProduct.setsPerPack || 0) * 2 || ''} onChange={(e) => setEditingProduct({ ...editingProduct, setsPerPack: Number(e.target.value) / 2 })}
                        style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>1パックの組数 (組)</label>
                      <input 
                        type="number" placeholder="150, 200等" value={editingProduct.setsPerPack || ''} onChange={(e) => setEditingProduct({ ...editingProduct, setsPerPack: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', border: '1px solid var(--price-blue)', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>パック数 (パック)</label>
                    <input 
                      type="number" placeholder="例: 40" value={editingProduct.volume || ''} onChange={(e) => setEditingProduct({ ...editingProduct, volume: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--price-blue)', borderRadius: '6px', fontSize: '12px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '8px', border: '2px solid var(--price-blue)', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: 'bold' }}>🏮 最終単価換算結果:</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--price-blue)', marginTop: '4px' }}>
                      {editingProduct.volume} パック × {editingProduct.setsPerPack || 0} 組 ＝ <span style={{ textDecoration: 'underline' }}>{((editingProduct.setsPerPack || 0) * editingProduct.volume / 100).toFixed(1)} ユニット</span>
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>※この数値に基づき「100組あたりの単価」を算出します</div>
                  </div>
                </div>
              )}

              {/* 🏮 Detergent Smart Calculator: Dosage per wash */}
              {(unitType === '1回' || unitType === '1wash') && (
                <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '12px', border: '1px dashed var(--price-blue)' }}>
                  <label style={{ fontSize: '12px', fontWeight: '900', color: 'var(--price-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>📏 洗剤計算機 (1回あたりの単価換算用)</label>
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>1回あたりの使用量 ({editingProduct.unit === 'kg' || editingProduct.unit === 'g' ? 'g' : 'ml'})</label>
                    <input 
                      type="number" step="0.1" placeholder="例: 10.0, 25.0等" value={editingProduct.dosagePerWash || ''} onChange={(e) => setEditingProduct({ ...editingProduct, dosagePerWash: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--price-blue)', borderRadius: '6px', fontSize: '12px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '8px', border: '2px solid var(--price-blue)', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: 'bold' }}>🏮 最終単価換算結果:</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--price-blue)', marginTop: '4px' }}>
                      {editingProduct.volume}{editingProduct.unit} / {editingProduct.dosagePerWash || '?'} ＝ <span style={{ textDecoration: 'underline' }}>{
                        (() => {
                          const vol = editingProduct.volume;
                          const dos = editingProduct.dosagePerWash || 0;
                          if (dos === 0) return '0';
                          if (editingProduct.unit === 'kg' || editingProduct.unit === 'l') return ((vol * 1000) / dos).toFixed(1);
                          return (vol / dos).toFixed(1);
                        })()
                      } 回分</span>
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>※パッケージ裏面の「水30Lあたりの量」などを入力してください</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>送料 (¥)</label>
                  <input type="number" value={editingProduct.shipping} onChange={(e) => setEditingProduct({ ...editingProduct, shipping: Number(e.target.value) })} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>付与ポイント (P)</label>
                  <input type="number" value={editingProduct.points} onChange={(e) => setEditingProduct({ ...editingProduct, points: Number(e.target.value) })} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>ストア選択</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button onClick={() => setEditingProduct({ ...editingProduct, store: 'amazon' })} style={{ flex: 1, padding: '8px', background: editingProduct.store === 'amazon' ? '#232f3e' : '#f1f5f9', color: editingProduct.store === 'amazon' ? 'white' : '#64748b', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}>AMAZON</button>
                  <button onClick={() => setEditingProduct({ ...editingProduct, store: 'rakuten' })} style={{ flex: 1, padding: '8px', background: editingProduct.store === 'rakuten' ? '#bf0000' : '#f1f5f9', color: editingProduct.store === 'rakuten' ? 'white' : '#64748b', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}>RAKUTEN</button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#e11d48' }}>🚩 商品URL / アフィリエイトリンク</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input type="text" value={editingProduct.affiliateUrl || ''} placeholder="https://..." onChange={(e) => setEditingProduct({ ...editingProduct, affiliateUrl: e.target.value })} style={{ flex: 1, padding: '10px', border: '2px solid #fda4af', borderRadius: '8px', fontSize: '12px' }} />
                  <button onClick={handleLinkConvert} style={{ padding: '0 16px', background: 'var(--price-blue)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', whiteSpace: 'nowrap' }}>🧙 変換</button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setEditingProduct(null)} style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white', fontWeight: 'bold' }}>キャンセル</button>
              <button onClick={() => { saveOverride(editingProduct.id, editingProduct); setEditingProduct(null); }} style={{ flex: 1, padding: '12px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900' }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
