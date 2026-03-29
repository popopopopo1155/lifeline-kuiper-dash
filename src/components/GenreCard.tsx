import React, { useState } from 'react';
import type { Genre } from '../data/mockData';
import { calculateUnitPrice } from '../data/mockData';
import { analyzePriceTrend } from '../api/priceAnalysis';

interface GenreCardProps {
  genre: Genre;
  daysLeft: number;
  onClick: (genreId: string) => void;
  heroImage?: string;
}

export const GenreCard: React.FC<GenreCardProps> = ({ genre, daysLeft, onClick, heroImage }) => {
  const [isHovered, setIsHovered] = useState(false);
  const allPrices: number[] = [];
  let minUnitPrice = Infinity;
  let unitLabel = '';
  let forecastData: number[] = [];
  let regionalAverage = 0;

  genre.subtypes.forEach(subtype => {
    subtype.products.forEach(product => {
      const up = calculateUnitPrice(product);
      allPrices.push(up);
      if (up < minUnitPrice) {
        minUnitPrice = up;
        unitLabel = product.baseUnit;
        forecastData = product.forecastData;
        regionalAverage = subtype.regionalAverage;
      }
    });
  });

  const analysis = analyzePriceTrend(
    genre.id, 
    minUnitPrice, 
    forecastData, 
    regionalAverage,
    allPrices,
    allPrices.length
  );
  const status = minUnitPrice < regionalAverage * 0.95 ? 'buy' : (minUnitPrice > regionalAverage * 1.05 ? 'wait' : 'regular');

  const getStatusLabel = (s: string) => {
    switch(s) {
      case 'buy': return '最安値圏';
      case 'regular': return '通常';
      case 'wait': return '割高';
      default: return '';
    }
  };

  const isHighPriority = daysLeft <= 3;

  return (
    <div 
      className={`price-card ${isHighPriority ? 'priority-high' : ''} ${status === 'buy' ? 'buy-card-pulse' : ''}`} 
      onClick={() => onClick(genre.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(12px, 4vw, 24px)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
        height: '100%',
        background: isHovered ? '#f8fafc' : 'white',
        border: status === 'buy' 
          ? '2px solid #10b981' 
          : (status === 'wait' 
              ? '2px solid #ef4444' 
              : (isHighPriority ? '2px solid #ff0000' : (isHovered ? '2px solid #bbc1cc' : '2px solid #cbd5e1'))),
        borderRadius: '20px',
        boxShadow: status === 'buy' 
          ? '0 20px 40px -10px rgba(16, 185, 129, 0.2)' 
          : (isHovered ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'),
        transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
        position: 'relative',
        zIndex: status === 'buy' || isHovered ? 10 : 1,
        overflow: 'hidden'
      }}
    >
      {/* 1. Header & Image */}
      <h3 style={{ fontSize: 'clamp(14px, 4vw, 22px)', fontWeight: '900', textAlign: 'center', margin: '0 0 12px 0', color: '#0f172a' }}>
        {genre.name}
      </h3>

      <div style={{ 
        width: '100%', 
        height: 'clamp(60px, 15vw, 120px)', 
        marginBottom: '12px', 
        borderRadius: '16px', 
        overflow: 'hidden',
        background: '#f1f5f9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
      }}>
        {heroImage ? (
          <img src={heroImage} alt={genre.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ fontSize: '56px', color: '#cbd5e1', fontWeight: '900' }}>{genre.name[0]}</div>
        )}
      </div>

      {/* 2. Status & Large Price */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
          <div className={`status-chip status-${status}`} style={{ fontWeight: '800', fontSize: '10px', padding: '3px 10px' }}>
            {getStatusLabel(status)}
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', marginBottom: '2px' }}>
          最安単価
        </div>
        <div style={{ color: '#0f172a', fontSize: 'clamp(24px, 8vw, 42px)', fontWeight: '900', lineHeight: 1, letterSpacing: '-0.02em' }}>
          <span style={{ fontSize: 'clamp(12px, 4vw, 20px)', opacity: 0.4, marginRight: '2px' }}>¥</span>
          {minUnitPrice === Infinity ? '---' : minUnitPrice}
          <span style={{ fontSize: 'clamp(10px, 3vw, 16px)', opacity: 0.4 }}>/{unitLabel}</span>
        </div>
      </div>

      {/* 3. Conditional Alert (More visible) */}
      {isHighPriority && (
        <div style={{ 
          background: '#ff0000', 
          borderRadius: '12px', 
          padding: '10px', 
          textAlign: 'center', 
          marginBottom: '16px',
          boxShadow: '0 4px 12px rgba(255,0,0,0.2)'
        }}>
          <div style={{ fontSize: '12px', color: 'white', fontWeight: '900' }}>
            残り {daysLeft}日分：在庫切れ間近
          </div>
        </div>
      )}

      {/* 4. AI Advice Panel (Centered, 2 lines) */}
      <div style={{ 
        flexGrow: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingTop: '8px'
      }}>
        <div style={{ 
          background: analysis.sentiment === 'warning' 
            ? 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)' 
            : (analysis.sentiment === 'success' ? 'linear-gradient(135deg, #f0fdf4 0%, #fff 100%)' : 'linear-gradient(135deg, #fffbeb 0%, #fff 100%)'),
          border: analysis.sentiment === 'warning'
            ? '1px solid #fee2e2'
            : (analysis.sentiment === 'success' ? '1px solid #dcfce7' : '1px solid #fef3c7'),
          borderLeft: analysis.sentiment === 'warning'
            ? '4px solid #ff0000'
            : (analysis.sentiment === 'success' ? '4px solid #10b981' : '4px solid #f59e0b'),
          borderRadius: '12px',
          padding: '8px 12px',
          width: '100%',
          maxWidth: '220px', 
          margin: '0 auto',
          textAlign: 'center',
          fontSize: 'clamp(10px, 3vw, 13px)', 
          fontWeight: '900', 
          color: analysis.sentiment === 'warning'
            ? '#b91c1c'
            : (analysis.sentiment === 'success' ? '#166534' : '#92400e'),
          lineHeight: '1.4',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          {analysis.reasoning}
        </div>
      </div>

      {/* 5. Clear Call to Action Footer (Large & Bold) */}
      <div style={{ 
        marginTop: '24px', 
        padding: '24px 0', 
        borderTop: '2px solid #f1f5f9',
        textAlign: 'center', 
        fontSize: '18px', // DYNAMIC 18px text
        color: isHovered ? '#2563eb' : '#2d3748', 
        fontWeight: '900', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '8px',
        transition: 'all 0.3s ease',
        background: isHovered ? '#eff6ff' : 'transparent',
        margin: '0 -24px -24px -24px' 
      }}>
        {isHovered ? '最安値をチェック' : '詳細を見る'}
      </div>
    </div>
  );
};
