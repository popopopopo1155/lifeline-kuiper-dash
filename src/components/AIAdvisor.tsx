import React, { useState, useEffect } from 'react';
import { useInventory, ALL_INVENTORY_ITEMS } from '../hooks/useInventory';
import { Newspaper, ChevronRight } from 'lucide-react';

export const AIAdvisor: React.FC = () => {
  const { householdSize, getDaysLeft, getCurrentAmount, inventory } = useInventory();
  const [advice, setAdvice] = useState<string>('');
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    try {
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
      setAdvice(data.advice || '在庫データから最適なアドバイスを生成します。');
      setRiskData(data.risks);
    } catch (err) {
      setAdvice('AIアドバイザーへの接続に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [householdSize, inventory]);

  return (
    <div className="sidebar-box glass-card" style={{ 
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: '24px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '4px' }}>
        <div style={{ width: '6px', height: '6px', background: loading ? '#3b82f6' : '#10b981', borderRadius: '50%', animation: loading ? 'pulse 1.5s infinite' : 'none' }}></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          あなただけの生活通信
        </div>
        <button 
          onClick={fetchAdvice} 
          disabled={loading}
          style={{ background: 'transparent', border: 'none', fontSize: '11px', padding: '4px', cursor: 'pointer', color: 'var(--price-blue)', fontWeight: '900', textDecoration: 'underline' }}
        >
          {loading ? '分析中...' : '再読み込み'}
        </button>
      </div>

      <div style={{ 
        minHeight: '80px', 
        fontSize: '13px', 
        lineHeight: '1.8', 
        color: 'var(--text-main)',
        position: 'relative',
        padding: '24px',
        background: 'var(--bg-app)',
        borderRadius: '24px',
        border: '1px solid var(--border-main)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="skeleton" style={{ height: '14px', width: '90%', background: 'var(--price-blue)', opacity: 0.1, borderRadius: '4px' }}></div>
            <div className="skeleton" style={{ height: '14px', width: '70%', background: 'var(--price-blue)', opacity: 0.1, borderRadius: '4px' }}></div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ whiteSpace: 'pre-wrap', fontWeight: '800', letterSpacing: '0.02em', color: 'var(--text-main)' }}>
              {advice}
            </div>
            
            {riskData && riskData.activeRisks && riskData.activeRisks.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-main)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--price-blue)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Newspaper style={{ width: '12px', height: '12px' }} />
                  検出された物価変動要因
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {riskData.activeRisks.slice(0, 2).map((risk: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '4px', fontSize: '11px', lineHeight: '1.4', color: 'var(--text-sub)', fontWeight: 'bold' }}>
                      <ChevronRight style={{ width: '12px', height: '12px', marginTop: '2px', flexShrink: 0, color: 'var(--price-blue)' }} />
                      <a href={risk.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid transparent' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--price-blue-hover)'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>
                        {risk.title.length > 35 ? risk.title.substring(0, 35) + '...' : risk.title}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '16px', fontSize: '9px', color: 'var(--text-sub)', textAlign: 'center', fontWeight: '800', letterSpacing: '0.05em', opacity: 0.3 }}>
        LIFELINE ANALYSIS ENGINE V2
      </div>
    </div>
  );
};
