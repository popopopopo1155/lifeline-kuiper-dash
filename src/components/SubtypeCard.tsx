import React, { useState } from 'react';
import type { Subtype } from '../data/mockData';
import { calculateUnitPrice } from '../data/mockData';
import { analyzePriceTrend } from '../api/priceAnalysis';

interface SubtypeCardProps {
  subtype: Subtype;
}

export const SubtypeCard: React.FC<SubtypeCardProps> = ({ subtype }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. 実質単価が安い順に上位3商品
  const sortedByPrice = [...subtype.products].sort((a, b) => a.price - b.price);
  const top3Cheapest = sortedByPrice.slice(0, 3);
  
  // 2. よく売れている順（人気度順）に上位7商品（最安3件以外から選択）
  const remaining = subtype.products.filter(p => !top3Cheapest.find(c => c.id === p.id));
  const top7Popular = remaining.sort((a, b) => b.popularity - a.popularity).slice(0, 7);
  
  // 3. 合計最大10商品を表示
  const displayProducts = [...top3Cheapest, ...top7Popular].slice(0, 10);

  const bestProduct = top3Cheapest[0];
  const minPrice = bestProduct ? calculateUnitPrice(bestProduct) : 0;
  
  const analysis = analyzePriceTrend(
    subtype.id, 
    minPrice, 
    bestProduct?.forecastData || [], 
    subtype.regionalAverage
  );

  return (
    <div className="price-card subtype-card-outer" style={{ 
      height: 'auto', 
      display: 'flex', 
      flexDirection: 'column',
      padding: 'clamp(12px, 3vw, 20px)',
      borderRadius: '20px',
      border: analysis.sentiment === 'warning' 
        ? '2px solid #ef4444' 
        : (analysis.sentiment === 'success' ? '2px solid #10b981' : '1px solid #e2e8f0') // Light gray for regular
    }}>
      <div className="product-name" style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px', fontSize: 'clamp(14px, 4vw, 18px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             {subtype.name}
             <div className={`status-chip status-${analysis.sentiment === 'warning' ? 'wait' : (analysis.sentiment === 'success' ? 'buy' : 'regular')}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                {analysis.sentiment === 'warning' ? '割高' : (analysis.sentiment === 'success' ? '底値圏' : '通常')}
             </div>
        </div>
        <span style={{ fontSize: '9px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '8px', color: '#64748b' }}>
          {subtype.products.length}件
        </span>
      </div>
      
      {bestProduct && (
        <>
          <div className="unit-price-box" style={{ 
            margin: '10px 0', 
            padding: '12px', 
            background: '#f8fafc', 
            borderRadius: '8px', 
            borderLeft: analysis.sentiment === 'warning' ? '3px solid #ef4444' : (analysis.sentiment === 'success' ? '3px solid #10b981' : '3px solid #94a3af') 
          }}>
            <span className="unit-price-label" style={{ color: analysis.sentiment === 'warning' ? '#ef4444' : (analysis.sentiment === 'success' ? '#10b981' : '#64748b'), fontSize: '10px' }}>最安単価</span>
            <div className="unit-price-value" style={{ fontSize: 'clamp(20px, 6vw, 28px)', color: analysis.sentiment === 'warning' ? '#ef4444' : (analysis.sentiment === 'success' ? '#10b981' : '#334155'), fontWeight: '900' }}>
              ¥{minPrice}<span className="unit-price-unit" style={{ fontSize: '12px', color: '#64748b' }}>/{bestProduct.baseUnit}</span>
            </div>
          </div>

          {/* AI Advice Panel */}
          <div style={{ 
            marginBottom: '12px',
            background: analysis.sentiment === 'warning' 
              ? 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)' 
              : (analysis.sentiment === 'success' ? 'linear-gradient(135deg, #f0fdf4 0%, #fff 100%)' : 'linear-gradient(135deg, #fffbeb 0%, #fff 100%)'),
            border: analysis.sentiment === 'warning'
              ? '1px solid #fee2e2'
              : (analysis.sentiment === 'success' ? '1px solid #dcfce7' : '1px solid #fef3c7'),
            borderLeft: analysis.sentiment === 'warning'
              ? '3px solid #ff0000'
              : (analysis.sentiment === 'success' ? '3px solid #10b981' : '3px solid #f59e0b'),
            borderRadius: '10px',
            padding: '8px 10px',
            fontSize: 'clamp(10px, 3vw, 13px)', 
            fontWeight: '800', 
            color: analysis.sentiment === 'warning'
              ? '#b91c1c'
              : (analysis.sentiment === 'success' ? '#166534' : '#92400e'),
            lineHeight: '1.4',
            textAlign: 'center'
          }}>
            {analysis.reasoning}
          </div>
        </>
      )}

      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        style={{
          width: '100%',
          padding: '10px',
          background: isExpanded ? '#f1f5f9' : '#0055aa',
          color: isExpanded ? '#0055aa' : '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '13px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        {isExpanded ? '▲ リストを閉じる' : `▼ 価格リンクを表示 (${displayProducts.length}件)`}
      </button>

      {isExpanded && (
        <div className="store-list" style={{ borderTop: 'none', marginTop: '15px', flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px', fontWeight: 'bold' }}>TOPピックアップ（3件最安 + 7件人気）</div>
          {displayProducts.map((p, idx) => (
            <div 
              key={p.id} 
              className="store-row subtype-product-row" 
              style={{ 
                padding: '12px', 
                marginBottom: '8px',
                border: '1px solid #e2e8f0', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                background: '#fff',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (p.affiliateUrl && p.affiliateUrl !== '#') {
                  window.open(p.affiliateUrl, '_blank');
                }
              }}
            >
              <div style={{ marginRight: '12px', fontSize: '14px', color: idx < 3 ? '#ef4444' : '#999', fontWeight: 'bold' }}>
                #{idx + 1}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span className="product-link-text" style={{ fontSize: '13px', color: '#0055aa', fontWeight: '700' }}>
                  {p.name.substring(0, 30)}{p.name.length > 30 ? '...' : ''}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                  <span style={{ fontSize: '10px', background: p.store === 'amazon' ? '#232f3e' : '#bf0000', color: '#fff', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold' }}>
                    {p.store.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>¥{calculateUnitPrice(p)}/{p.baseUnit}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginLeft: '10px' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0055aa' }}>¥{p.price.toLocaleString()}</div>
                <div style={{ fontSize: '10px', color: '#0055aa', textDecoration: 'underline', fontWeight: 'bold' }}>詳細 ➔</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .subtype-product-row:hover {
          background: #fff !important;
          border-color: #0055aa !important;
          box-shadow: 0 4px 12px rgba(0, 85, 170, 0.15) !important;
          transform: translateY(-2px);
        }
        .subtype-product-row:hover .product-link-text {
          text-decoration: underline !important;
        }
        .subtype-product-row:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};
