import React from 'react';
import type { Product } from '../data/mockData';

interface PriceCardProps {
  product: Product;
}

export const PriceCard: React.FC<PriceCardProps> = ({ product }) => {
  // Logic: (Price + Shipping - Points) / Volume
  const netPrice = product.currentPrice + product.shipping - product.points;
  const unitPrice = Math.round(netPrice / product.volume);
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'buy': return '底値確定';
      case 'regular': return '通常';
      case 'wait': return '割高';
      default: return '';
    }
  };

  const cheaperThanSuper = unitPrice < product.regionalAverage;

  return (
    <div className="price-card">
      <div className="product-name">{product.name}</div>
      
      <div className={`status-chip status-${product.status}`}>
        {getStatusLabel(product.status)}
      </div>

      <div className="unit-price-box">
        <span className="unit-price-label">実質単価</span>
        <div className="unit-price-value">
          <span className="text-sm">¥</span>
          {unitPrice}
          <span className="unit-price-unit">/{product.baseUnit}</span>
        </div>
      </div>

      <div className="store-list">
        <div className="store-row">
          <span className="store-name">Amazon</span>
          <span className={`store-price ${product.storePrices.amazon === Math.min(product.storePrices.amazon, product.storePrices.rakuten, product.storePrices.supermarket) ? 'cheapest' : ''}`}>
            ¥{product.storePrices.amazon}
          </span>
        </div>
        <div className="store-row">
          <span className="store-name">楽天</span>
          <span className={`store-price ${product.storePrices.rakuten === Math.min(product.storePrices.amazon, product.storePrices.rakuten, product.storePrices.supermarket) ? 'cheapest' : ''}`}>
            ¥{product.storePrices.rakuten}
          </span>
        </div>
        <div className="store-row">
          <span className="store-name">地域スーパー</span>
          <span className={`store-price ${product.storePrices.supermarket === Math.min(product.storePrices.amazon, product.storePrices.rakuten, product.storePrices.supermarket) ? 'cheapest' : ''}`}>
            ¥{product.storePrices.supermarket}
          </span>
        </div>
      </div>

      {cheaperThanSuper && (
        <div style={{ marginTop: '10px', fontSize: '10px', color: '#10b981', fontWeight: 'bold', textAlign: 'center' }}>
          スーパー平均より ¥{product.regionalAverage - unitPrice} お得！
        </div>
      )}

      {product.inventoryLevel < 30 && (
        <div style={{ marginTop: '5px', fontSize: '10px', color: '#ef4444', fontWeight: 'bold', textAlign: 'center', border: '1px solid #ef4444', padding: '2px' }}>
          在庫わずか：今すぐ購入推奨
        </div>
      )}
    </div>
  );
};
