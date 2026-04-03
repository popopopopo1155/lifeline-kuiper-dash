import React, { useState } from 'react';
import { useInventory, ALL_INVENTORY_ITEMS } from '../hooks/useInventory';
import type { InventoryItem } from '../hooks/useInventory';

export const InventoryControl: React.FC = () => {
  const { householdSize, setHouseholdSize, updateStock, updateAllStocks, getCurrentAmount } = useInventory();
  
  const [isMoreExpanded, setIsMoreExpanded] = useState(false);
  const [tempStocks, setTempStocks] = useState<Record<string, number>>({});
  
  const priorityItems = ALL_INVENTORY_ITEMS.slice(0, 3);
  const otherItems = ALL_INVENTORY_ITEMS.slice(3);

  const handleTempUpdate = (id: string, val: number) => {
    setTempStocks(prev => ({ ...prev, [id]: Math.max(0, val) }));
  };

  const getDisplayAmount = (id: string) => {
    return tempStocks[id] !== undefined ? tempStocks[id] : getCurrentAmount(id);
  };

  const getSimulatedDaysLeft = (id: string, amount: number) => {
    const item = ALL_INVENTORY_ITEMS.find(i => i.id === id);
    if (!item) return 0;
    const dailyConsumption = item.dailyPerPerson * (householdSize || 1);
    return dailyConsumption > 0 ? Math.floor(amount / dailyConsumption) : 0;
  };

  const handleApply = () => {
    Object.entries(tempStocks).forEach(([id, val]) => {
      updateStock(id, val);
    });
    setTempStocks({});
  };

  const handleReset = () => {
    const maxStocks: Record<string, number> = {};
    ALL_INVENTORY_ITEMS.forEach(item => {
      maxStocks[item.id] = item.dailyPerPerson * (householdSize || 1) * 100;
    });
    // 実データの在庫を一括でマックスに更新し、シミュレーション用の一時状態は解消する
    updateAllStocks(maxStocks);
    setTempStocks({});
  };

  const hasChanges = Object.keys(tempStocks).length > 0;

  const renderItem = (item: InventoryItem) => {
    const currentAmount = getDisplayAmount(item.id);
    const daysLeft = getSimulatedDaysLeft(item.id, currentAmount);
    const isCritical = daysLeft <= 3;
    const isTemp = tempStocks[item.id] !== undefined;

    return (
      <div key={item.id} style={{ 
        marginBottom: '16px', 
        padding: '16px', 
        background: isTemp ? 'var(--bg-info)' : (isCritical ? 'var(--bg-warning)' : 'var(--bg-card)'), 
        borderRadius: '20px', 
        border: `1px solid ${isTemp ? 'var(--price-blue)' : (isCritical ? 'var(--signal-red)' : 'var(--border-main)')}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.2s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-main)' }}>{item.name}</span>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '900', 
            color: isCritical ? 'var(--signal-red)' : 'var(--signal-green)',
            background: isCritical ? 'var(--bg-warning)' : 'var(--bg-success)',
            padding: '4px 8px',
            borderRadius: '8px'
          }}>
            {isTemp ? `推計:${daysLeft}日分` : (isCritical ? `残${daysLeft}日` : `あと${daysLeft}日分`)}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <input 
              type="number" 
              min="0"
              step="1"
              value={Math.round(currentAmount)}
              onChange={(e) => handleTempUpdate(item.id, Number(e.target.value))}
              style={{ 
                width: '70px', 
                padding: '8px 4px', 
                borderRadius: '10px', 
                border: '1px solid var(--border-main)', 
                fontSize: '14px', 
                fontWeight: '900',
                color: 'var(--text-main)',
                textAlign: 'center',
                outline: 'none',
                background: 'var(--bg-card)'
              }}
            />
            <span style={{ 
              fontSize: '10px', 
              color: 'var(--text-sub)', 
              fontWeight: '800',
              width: '40px',
              textAlign: 'left'
            }}>{item.unit}</span>
          </div>
          <div style={{ flex: 1 }}>
            <input 
              type="range" 
              className="premium-slider"
              min="0" 
              max={Math.round(item.dailyPerPerson * (householdSize || 1) * 100)} 
              step="1"
              value={Math.round(currentAmount)}
              onChange={(e) => handleTempUpdate(item.id, Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sidebar-box glass-card" style={{ 
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: '24px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-main)' }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '900', 
          color: 'var(--text-main)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            世帯設定
          </div>
          <select 
            value={householdSize} 
            onChange={(e) => setHouseholdSize(Number(e.target.value))}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '10px', 
              border: '2px solid var(--border-main)', 
              fontSize: '13px', 
              fontWeight: '800',
              outline: 'none',
              background: 'var(--bg-app)',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}人{n === 1 ? '暮らし' : '家族'}</option>)}
          </select>
        </div>
      </div>

      <div style={{ paddingTop: '20px' }}>
        <div style={{ 
          fontSize: '15px', 
          fontWeight: '900', 
          marginBottom: '20px', 
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          在庫シミュレーター
        </div>
        
        {priorityItems.map(renderItem)}

        <button 
          onClick={() => setIsMoreExpanded(!isMoreExpanded)}
          style={{
            width: '100%',
            padding: '12px',
            background: isMoreExpanded ? 'var(--bg-app)' : 'var(--bg-card)',
            border: '2px dashed var(--border-main)',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '900',
            color: 'var(--text-sub)',
            cursor: 'pointer',
            marginTop: '8px',
            marginBottom: '16px',
            transition: 'all 0.2s ease'
          }}
        >
          {isMoreExpanded ? '▲ 項目を閉じる' : `▼ あと${otherItems.length}項目を表示`}
        </button>

        {isMoreExpanded && (
          <div style={{ marginBottom: '16px', borderTop: '1px solid var(--border-main)', paddingTop: '16px' }}>
            {otherItems.map(renderItem)}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button 
            onClick={handleReset}
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: '12px', 
              border: '1px solid var(--border-main)', 
              background: 'var(--bg-card)', 
              fontSize: '12px', 
              fontWeight: '800',
              color: 'var(--text-sub)',
              cursor: 'pointer'
            }}
          >
            リセット
          </button>
          <button 
            disabled={!hasChanges}
            onClick={handleApply}
            style={{ 
              flex: 2, 
              padding: '10px', 
              borderRadius: '12px', 
              border: 'none', 
              background: hasChanges ? 'var(--price-blue)' : 'var(--signal-gray)', 
              color: 'white',
              fontSize: '12px', 
              fontWeight: '900',
              cursor: hasChanges ? 'pointer' : 'default',
              boxShadow: hasChanges ? '0 4px 6px -1px rgba(0, 85, 170, 0.2)' : 'none'
            }}
          >
            変更を反映
          </button>
        </div>
        
        <p style={{ fontSize: '10px', color: 'var(--text-sub)', marginTop: '16px', fontWeight: '500', textAlign: 'center' }}>
          ※数値を変更して消費シミュレーションが可能
        </p>
      </div>
    </div>
  );
};
