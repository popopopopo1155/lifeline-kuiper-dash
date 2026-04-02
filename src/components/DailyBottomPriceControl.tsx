import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface StoreRecord {
  id: string;
  name: string;
  price: number;
  date: string;
}

interface DailyBottomPriceControlProps {
  subtypeId: string;
  subtypeName: string;
  regionalAverage: number;
  unitType: string;
}

export const DailyBottomPriceControl: React.FC<DailyBottomPriceControlProps> = ({ 
  subtypeId, 
  regionalAverage,
  unitType
}) => {
  const [records, setRecords] = useState<StoreRecord[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  
  const storageKey = `daily_memo_${subtypeId}`;

  // Load records from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse local storage');
      }
    }
  }, [subtypeId, storageKey]);

  // Save records to localStorage
  const saveRecords = (newRecords: StoreRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem(storageKey, JSON.stringify(newRecords));
  };

  const addRecord = () => {
    if (!newName || !newPrice) return;
    const newRecord: StoreRecord = {
      id: Date.now().toString(),
      name: newName,
      price: Number(newPrice),
      date: new Date().toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
    };
    const updated = [newRecord, ...records].slice(0, 5); // Keep last 5
    saveRecords(updated);
    setNewName('');
    setNewPrice('');
  };

  const removeRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    saveRecords(updated);
  };

  return (
    <div className="daily-price-control" style={{ marginTop: '20px' }}>
      <div style={{ 
        padding: '16px', 
        background: 'rgba(15, 23, 42, 0.03)', 
        borderRadius: '20px', 
        border: '1.5px dashed #cbd5e1',
        marginBottom: '20px'
      }}>
        <h4 style={{ 
          fontSize: '13px', 
          margin: '0 0 12px 0', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: '#475569',
          fontWeight: '900'
        }}>
          <ShoppingCart size={16} /> 近隣スーパーの底値を記録
        </h4>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input 
            type="text" 
            placeholder="店名 (例: ライフ)" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 2, padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '13px' }}
          />
          <input 
            type="number" 
            placeholder="価格" 
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value === '' ? '' : Number(e.target.value))}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '13px' }}
          />
          <button 
            onClick={addRecord}
            style={{ 
              padding: '8px 16px', 
              background: '#0f172a', 
              color: 'white', 
              border: 'none', 
              borderRadius: 10, 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            記録
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {records.map(record => {
          const diff = record.price - regionalAverage;
          const isBargain = diff < 0;
          
          return (
            <div key={record.id} style={{ 
              padding: '12px 16px', 
              background: 'white', 
              borderRadius: '16px', 
              border: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#1e293b' }}>
                  {record.name} <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal' }}>({record.date})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>¥{record.price.toLocaleString()}</span>
                  
                  {/* Comparison Indicator */}
                  <div style={{ 
                    fontSize: '10px', 
                    padding: '2px 8px', 
                    borderRadius: '20px', 
                    background: isBargain ? '#dcfce7' : (diff === 0 ? '#f1f5f9' : '#fee2e2'),
                    color: isBargain ? '#166534' : (diff === 0 ? '#64748b' : '#991b1b'),
                    fontWeight: '900',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isBargain ? <TrendingDown size={12} /> : (diff === 0 ? <Minus size={12} /> : <TrendingUp size={12} />)}
                    {isBargain ? `目安より -¥${Math.abs(diff)}` : (diff === 0 ? '平均的' : `目安より +¥${diff}`)}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => removeRecord(record.id)}
                style={{ border: 'none', background: 'transparent', color: '#cbd5e1', cursor: 'pointer', padding: '8px' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {records.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#94a3b8', 
          fontSize: '12px',
          fontStyle: 'italic'
        }}>
          近所のスーパーの価格を記録して、統計データと比較しましょう。
        </div>
      )}
    </div>
  );
};
