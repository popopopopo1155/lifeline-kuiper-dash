import React, { useState } from 'react';
import type { Genre } from '../types';
import { getNormalizedVolume } from '../api/dataUtils';
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
  let unitLabel = genre.unitType; // Fallback to genre's unitType
  let forecastData: number[] = [];
  let regionalAverage = 0;
  let isOfficial = false;

  // 最初に見つかったsubtypeのmetadataをデフォルトとして持っておく
  if (genre.subtypes.length > 0) {
    regionalAverage = genre.subtypes[0].regionalAverage;
    isOfficial = genre.subtypes[0].isOfficial || false;
  }

    genre.subtypes.forEach((subtype: any) => {
      subtype.products.forEach((product: any) => {
        // [FIX] SubtypeCardと同じ精度の計算ロジックに統一（全メタデータを渡す）
        const normVol = getNormalizedVolume(
          product.name, 
          genre.unitType, 
          product.volume, 
          product.unit, 
          product.lengthPerRoll, 
          product.setsPerPack, 
          product.dosagePerWash
        );
        const up = Math.round((product.price + product.shipping - product.points) / Math.max(0.1, normVol || 1));
      
      allPrices.push(up);
      if (up < minUnitPrice) {
        minUnitPrice = up;
        unitLabel = genre.unitType;
        forecastData = product.forecastData;
        regionalAverage = subtype.regionalAverage;
        isOfficial = subtype.isOfficial || false;
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
  const status = minUnitPrice < regionalAverage * 0.97 ? 'buy' : (minUnitPrice > regionalAverage * 1.03 ? 'wait' : 'regular');

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
        background: isHovered ? 'var(--bg-app)' : 'var(--bg-card)',
        border: status === 'buy' 
          ? '2px solid var(--signal-green)' 
          : (status === 'wait' 
              ? '2px solid var(--signal-red)' 
              : (isHighPriority ? '2px solid #ff0000' : (isHovered ? '2px solid var(--price-blue)' : '2px solid var(--border-main)'))),
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
      <h3 style={{ fontSize: 'clamp(14px, 4vw, 22px)', fontWeight: '900', textAlign: 'center', margin: '0 0 12px 0', color: 'var(--text-main)' }}>
        {genre.name}
      </h3>

      <div style={{ 
        width: '100%', 
        height: 'clamp(60px, 15vw, 120px)', 
        marginBottom: '12px', 
        borderRadius: '16px', 
        overflow: 'hidden',
        background: 'var(--bg-app)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
      }}>
        {heroImage ? (
          <img src={heroImage} alt={genre.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ fontSize: '56px', color: 'var(--signal-gray)', fontWeight: '900' }}>{genre.name[0]}</div>
        )}
      </div>

      {/* 2. Status & Large Price */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div className={`status-chip status-${status}`} style={{ fontWeight: '800', fontSize: '10px', padding: '3px 10px' }}>
            {getStatusLabel(status)}
          </div>
          {isOfficial && (
            <div style={{ 
              background: 'rgba(56, 189, 248, 0.1)', 
              border: '1px solid var(--price-blue)',
              color: 'var(--price-blue)',
              borderRadius: '6px',
              fontSize: '9px',
              padding: '2px 6px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              🏛️ 統計同期
            </div>
          )}
        </div>
        <div style={{ color: 'var(--text-main)', fontSize: 'clamp(24px, 8vw, 42px)', fontWeight: '900', lineHeight: 1, letterSpacing: '-0.02em' }}>
          <span style={{ fontSize: 'clamp(12px, 4vw, 20px)', opacity: 0.4, marginRight: '2px' }}>¥</span>
          {minUnitPrice === Infinity ? (
             <span style={{ opacity: 0.7 }}>{regionalAverage || '---'}</span>
          ) : (
             minUnitPrice
          )}
          <span style={{ fontSize: 'clamp(10px, 3vw, 16px)', opacity: 0.4 }}>/{unitLabel}</span>
          {minUnitPrice === Infinity && (
            <div style={{ fontSize: '10px', color: 'var(--text-sub)', marginTop: '4px' }}>統計目安</div>
          )}
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
            ? 'var(--bg-warning)' 
            : (analysis.sentiment === 'success' ? 'var(--bg-success)' : 'var(--bg-info)'),
          border: analysis.sentiment === 'warning'
            ? '1px solid var(--signal-red)'
            : (analysis.sentiment === 'success' ? '1px solid var(--signal-green)' : '1px solid var(--price-blue)'),
          borderLeft: analysis.sentiment === 'warning'
            ? '4px solid var(--signal-red)'
            : (analysis.sentiment === 'success' ? '4px solid var(--signal-green)' : '4px solid var(--price-blue)'),
          borderRadius: '12px',
          padding: '8px 12px',
          width: '100%',
          maxWidth: '220px', 
          margin: '0 auto',
          textAlign: 'center',
          fontSize: 'clamp(10px, 3vw, 13px)', 
          fontWeight: '900', 
          color: analysis.sentiment === 'warning'
            ? 'var(--text-warning)'
            : (analysis.sentiment === 'success' ? 'var(--text-success)' : 'var(--text-info)'),
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
        borderTop: '2px solid var(--border-main)',
        textAlign: 'center', 
        fontSize: '18px', // DYNAMIC 18px text
        color: isHovered ? 'var(--price-blue)' : 'var(--text-main)', 
        fontWeight: '900', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '8px',
        transition: 'all 0.3s ease',
        background: isHovered ? 'var(--bg-app)' : 'transparent',
        margin: '0 -24px -24px -24px' 
      }}>
        {isHovered ? '最安値をチェック' : '詳細を見る'}
      </div>
    </div>
  );
};
