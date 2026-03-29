import React, { useState, useEffect } from 'react';
import { useInventory, ALL_INVENTORY_ITEMS } from '../hooks/useInventory';

export const AIAdvisor: React.FC = () => {
  const { householdSize, getDaysLeft, getCurrentAmount } = useInventory();
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      // 在庫サマリーの作成
      const itemsSummary = ALL_INVENTORY_ITEMS.map(item => ({
        name: item.name,
        daysLeft: getDaysLeft(item.id),
        amount: getCurrentAmount(item.id).toFixed(1) + item.unit
      }));

      const response = await fetch('/api/ai/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ householdSize, items: itemsSummary })
      });
      const data = await response.json();
      setAdvice(data.advice || 'データ不足のためアドバイスを生成できませんでした。');
    } catch (err) {
      setAdvice('AIアドバイザーへの接続に失敗しました。Keyの設定を確認してください。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [householdSize]); // 人数が変わったら再計算

  return (
    <div className="sidebar-box" style={{ 
      background: 'rgba(255, 255, 255, 0.7)', 
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: '24px',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Status Indicator */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '4px' }}>
        <div style={{ width: '6px', height: '6px', background: loading ? '#3b82f6' : '#10b981', borderRadius: '50%', animation: loading ? 'pulse 1.5s infinite' : 'none' }}></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          あなただけの生活通信
        </div>
        <button 
          onClick={fetchAdvice} 
          disabled={loading}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            fontSize: '11px', 
            padding: '4px', 
            cursor: 'pointer',
            color: '#2563eb',
            fontWeight: '900',
            textDecoration: 'underline'
          }}
        >
          {loading ? '分析中...' : '再読み込み'}
        </button>
      </div>

      <div style={{ 
        minHeight: '80px', 
        fontSize: '13px', 
        lineHeight: '1.8', 
        color: '#334155',
        position: 'relative',
        padding: '24px',
        background: '#f1f5f9',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="skeleton" style={{ height: '14px', width: '90%', background: '#3b82f6', opacity: 0.1, borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ height: '14px', width: '70%', background: '#3b82f6', opacity: 0.1, borderRadius: '4px' }}></div>
          </div>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap', fontWeight: '800', letterSpacing: '0.02em', color: '#1e293b' }}>
            {advice}
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '16px', fontSize: '9px', color: '#94a3b8', textAlign: 'center', fontWeight: '800', letterSpacing: '0.05em', opacity: 0.3 }}>
        LIFELINE ANALYSIS ENGINE V2
      </div>
    </div>
  );
};
