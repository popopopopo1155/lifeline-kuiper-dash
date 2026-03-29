import React from 'react';
import type { Product } from '../types';
import { mockProducts } from '../data/mockData';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export const PriceHeatmap: React.FC = () => {
  // Focus on 3 key items for the heatmap
  const items = mockProducts.slice(0, 4);

  const getStatus = (product: Product) => {
    const unitPrice = Math.round(product.currentPrice / product.quantity);
    const avg = product.historicalAverageUnitPrice;
    
    if (unitPrice <= avg * 0.9) return { color: 'buy-now', label: '買い時！ストック推奨', badge: 'buy', icon: <CheckCircle size={16} /> };
    if (unitPrice <= avg * 1.1) return { color: 'regular', label: '通常価格', badge: 'regular', icon: <Info size={16} /> };
    return { color: 'wait', label: '割高・買い控え推奨', badge: 'wait', icon: <AlertCircle size={16} /> };
  };

  return (
    <section className="heatmap-grid">
      {items.map((item) => {
        const status = getStatus(item);
        const unitPrice = Math.round(item.currentPrice / item.quantity);
        
        return (
          <div key={item.id} className={`heat-card ${status.color}`}>
            <div className="flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-widest text-secondary">{item.name.split(' ')[0]}</span>
              <div className={`signal-badge ${status.badge}`}>
                {status.icon}
                {status.label}
              </div>
            </div>
            
            <div className="massive-unit-price text-primary">
              <span className="text-muted text-sm mr-2">¥</span>
              {unitPrice}
              <span className="unit">/{item.baseUnit}</span>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold">
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded ${item.storePrices.amazon === Math.min(...Object.values(item.storePrices || {}).filter(Boolean) as number[]) ? 'bg-accent-mint/20 text-accent-mint' : 'bg-white/5 text-muted'}`}>Amazon</span>
                <span className={`px-2 py-0.5 rounded ${item.storePrices.rakuten === Math.min(...Object.values(item.storePrices || {}).filter(Boolean) as number[]) ? 'bg-accent-mint/20 text-accent-mint' : 'bg-white/5 text-muted'}`}>楽天</span>
                <span className={`px-2 py-0.5 rounded ${item.storePrices.supermarket === Math.min(...Object.values(item.storePrices || {}).filter(Boolean) as number[]) ? 'bg-accent-mint/20 text-accent-mint' : 'bg-white/5 text-muted'}`}>スーパー</span>
              </div>
              <span className="text-muted">平均: ¥{item.historicalAverageUnitPrice}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
};
