import React, { useState } from 'react';
import type { Subtype, GenreGroup, Product } from '../types';
import { analyzePriceTrend } from '../api/priceAnalysis';
import { useAdmin } from '../contexts/AdminContext';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SubtypeCardProps {
  subtype: Subtype;
  group: GenreGroup;
  unitType: string;
}

export const SubtypeCard: React.FC<SubtypeCardProps> = ({ subtype, group, unitType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { isAdmin, saveOverride, saveOrder } = useAdmin();

  const handleSaveVerified = async () => {
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/manual/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: editingProduct })
      });
      if (res.ok) {
        alert('検証データを保存しました。次回の同期から優先表示されます。');
        setEditingProduct(null);
      }
    } catch (err) {
      console.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

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

  // usePriceData側で既にソート済みだが、念のためここでも subtype.products をそのまま表示
  const displayProducts = [...subtype.products].slice(0, 10);
  const bestProduct = displayProducts[0];
  
  const minPrice = bestProduct 
    ? Math.round((bestProduct.price + bestProduct.shipping - bestProduct.points) / Math.max(0.1, bestProduct.volume)) 
    : 0;
  
  const allUnitPrices = subtype.products.map((p: Product) => 
    Math.round((p.price + p.shipping - p.points) / Math.max(0.1, p.volume))
  );

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
      background: 'white',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      border: analysis.sentiment === 'warning' 
        ? '2px solid #ef4444' 
        : (analysis.sentiment === 'success' ? '2px solid #10b981' : '1px solid #e2e8f0')
    }}>
      <div className="product-name" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px', fontSize: '18px', fontWeight: '900', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             {subtype.name}
             <div className={`status-chip status-${analysis.sentiment === 'warning' ? 'wait' : (analysis.sentiment === 'success' ? 'buy' : 'regular')}`} style={{ fontSize: '10px' }}>
                {analysis.sentiment === 'warning' ? '要警戒' : (analysis.sentiment === 'success' ? '底値更新' : '安定')}
             </div>
        </div>
        <div style={{ 
          fontSize: '11px', 
          color: subtype.products.length > 0 ? '#3b82f6' : '#94a3b8', 
          background: subtype.products.length > 0 ? '#eff6ff' : '#f8fafc', 
          padding: '4px 10px', 
          borderRadius: '12px',
          fontWeight: '900',
          border: `1px solid ${subtype.products.length > 0 ? '#dbeafe' : '#f1f5f9'}`
        }}>
           {isDaily ? '🏠 地場価格優先' : `📊 市場データ: ${subtype.products.length}件`}
        </div>
      </div>
      
      {/* --- PRICE DASHBOARD --- */}
      <div className="unit-price-box" style={{ 
        marginBottom: '16px',
        padding: '16px', 
        background: '#f8fafc', 
        borderRadius: '16px', 
        textAlign: 'center',
        border: '1px solid #f1f5f9'
      }}>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>
          {isDaily ? '近隣スーパー目安価格' : '現在市場・最安実質単価'}
        </div>
        <div style={{ fontSize: '32px', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.02em' }}>
          ¥{isDaily ? subtype.regionalAverage : minPrice}
          <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '700' }}>/{unitType}</span>
        </div>
        
        {/* Market Comparison Badge */}
        {!isDaily && subtype.regionalAverage > 0 && minPrice > 0 && (
          <div style={{ 
            marginTop: '8px', 
            fontSize: '11px', 
            display: 'inline-block',
            padding: '3px 10px', 
            borderRadius: '20px',
            background: minPrice < subtype.regionalAverage ? '#dcfce7' : '#fee2e2',
            color: minPrice < subtype.regionalAverage ? '#166534' : '#991b1b',
            fontWeight: '900'
          }}>
            {minPrice < subtype.regionalAverage ? '📉 スーパーよりお得' : '🛑 スーパー推奨'}
          </div>
        )}
      </div>

      {/* AI Intelligence Reasoning */}
      <div style={{ 
        marginBottom: '16px',
        background: analysis.sentiment === 'warning' ? '#fef2f2' : (analysis.sentiment === 'success' ? '#f0fdf4' : '#fffbeb'),
        borderRadius: '12px',
        padding: '12px',
        fontSize: '13px',
        color: analysis.sentiment === 'warning' ? '#991b1b' : (analysis.sentiment === 'success' ? '#166534' : '#92400e'),
        fontWeight: 'bold',
        lineHeight: '1.5',
        border: `1px solid ${analysis.sentiment === 'warning' ? '#fee2e2' : (analysis.sentiment === 'success' ? '#dcfce7' : '#fef3c7')}`
      }}>
        {analysis.reasoning}
      </div>

      {/* --- CONDITIONAL ACTION AREA --- */}
      {isDaily ? (
        <div style={{ 
          padding: '12px', 
          background: '#f8fafc', 
          borderRadius: '12px', 
          border: '1px dashed #cbd5e1',
          fontSize: '11px',
          color: '#64748b',
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          💡 卵やパンなどの生鮮品はネット購入より、<br />
          地元のスーパー店頭での購入を強く推奨します。<br />
          <strong>目安単価 ¥{subtype.regionalAverage}</strong> 以下なら「買い」です。
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                実効最安値: ¥{minPrice.toLocaleString()}/{unitType}
              </span>
              {subtype.lastUpdated && (
                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '2px' }}>
                  🕒 {new Date(subtype.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 更新
                </div>
              )}
            </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#0f172a',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isExpanded ? '項目を閉じる ▲' : `最安値リストを表示 ➔`}
          </button>

          {isExpanded && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {displayProducts.map((p, idx) => (
                <div 
                  key={p.id}
                  style={{ 
                    padding: '12px', 
                    background: p.isVerified ? '#f0f9ff' : 'white', 
                    border: p.isVerified ? '2px solid #0ea5e9' : '1px solid #e2e8f0', 
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'default',
                    transition: 'border-color 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {p.name.length > 35 ? p.name.substring(0, 35) + '...' : p.name}
                      {idx === 0 && !p.isVerified && (
                        <span style={{ fontSize: '10px', background: '#fbbf24', color: '#78350f', padding: '1px 6px', borderRadius: '4px', fontWeight: '900' }}>⭐ 最安</span>
                      )}
                      {p.isVerified && (
                        <span style={{ fontSize: '10px', background: '#0ea5e9', color: 'white', padding: '1px 8px', borderRadius: '4px', fontWeight: '900' }}>✅ 検証済</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', padding: '2px 4px', background: p.store === 'amazon' ? '#232f3e' : '#bf0000', color: 'white', borderRadius: '4px', fontWeight: '900', letterSpacing: '0.05em' }}>
                        {p.store.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>
                        ¥{Math.round((p.price + p.shipping - p.points) / Math.max(0.1, p.volume))}/{unitType}
                        <span style={{ marginLeft: '6px', opacity: 0.7 }}>({p.volume}{p.unit})</span>
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    {/* Admin Move Controls */}
                    {isAdmin && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button 
                          onClick={() => handleMove(p.id, -1)}
                          disabled={idx === 0}
                          style={{ padding: '2px', opacity: idx === 0 ? 0.2 : 1, cursor: idx === 0 ? 'default' : 'pointer', background: '#f1f5f9', border: 'none', borderRadius: '4px' }}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button 
                          onClick={() => handleMove(p.id, 1)}
                          disabled={idx === displayProducts.length - 1}
                          style={{ padding: '2px', opacity: idx === displayProducts.length - 1 ? 0.2 : 1, cursor: idx === displayProducts.length - 1 ? 'default' : 'pointer', background: '#f1f5f9', border: 'none', borderRadius: '4px' }}
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>¥{p.price.toLocaleString()}</div>
                      <a 
                        href={p.affiliateUrl || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none', display: 'block' }}
                      >
                        購入 ➔
                      </a>
                    </div>
                    {isAdmin ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingProduct(p); }}
                        style={{ border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '50%', background: '#f1f5f9' }}
                      >
                        ✏️
                      </button>
                    ) : (
                      <a 
                        href={p.affiliateUrl || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          width: '42px', height: '42px', borderRadius: '50%', 
                          background: '#ffffff', color: '#2563eb', 
                          border: '1.5px solid #dbeafe',
                          cursor: 'pointer', textDecoration: 'none',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                          fontSize: '22px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#2563eb';
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#dbeafe';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                        }}
                      >
                        🛒
                      </a>
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
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px' }}>商品の修正・検証</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>表示名</label>
                <input 
                  type="text" 
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>価格 (¥)</label>
                  <input 
                    type="number" 
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>重量/容量 ({unitType})</label>
                  <input 
                    type="number" 
                    value={editingProduct.volume}
                    onChange={(e) => setEditingProduct({ ...editingProduct, volume: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>送料 (¥)</label>
                  <input 
                    type="number" 
                    value={editingProduct.shipping}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shipping: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>付与ポイント (P)</label>
                  <input 
                    type="number" 
                    value={editingProduct.points}
                    onChange={(e) => setEditingProduct({ ...editingProduct, points: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#e11d48' }}>🚩 商品URL / アフィリエイトリンク</label>
                <input 
                  type="text" 
                  value={editingProduct.affiliateUrl || ''}
                  placeholder="https://..."
                  onChange={(e) => setEditingProduct({ ...editingProduct, affiliateUrl: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '2px solid #fda4af', borderRadius: '8px', marginTop: '4px', fontSize: '12px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => setEditingProduct(null)}
                style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white', fontWeight: 'bold' }}
              >
                キャンセル
              </button>
              <button 
                onClick={() => {
                   saveOverride(editingProduct.id, editingProduct);
                   setEditingProduct(null);
                }}
                style={{ flex: 1, padding: '12px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900' }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
