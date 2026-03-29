import React, { useState } from 'react';
import { Truck, Percent, TrendingDown, Calculator } from 'lucide-react';

export const CostCalculator: React.FC = () => {
  const [basePrice, setBasePrice] = useState<number>(3000);
  const [shipping, setShipping] = useState<number>(500);
  const [points, setPoints] = useState<number>(1); // %

  const realPrice = Math.round(basePrice + shipping - (basePrice * (points / 100)));

  return (
    <div className="glass-card flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-secondary font-bold uppercase">商品価格</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">¥</span>
            <input 
              type="number" 
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="calculator-input pl-8"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-secondary font-bold uppercase">送料</label>
          <div className="relative">
            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
            <input 
              type="number" 
              value={shipping}
              onChange={(e) => setShipping(Number(e.target.value))}
              className="calculator-input pl-8"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-secondary font-bold uppercase">ポイント還元 (%)</label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
            <input 
              type="number" 
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="calculator-input pl-8"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 p-6 bg-accent-mint/10 rounded-xl border border-accent-mint/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-xs text-accent-mint font-bold flex items-center gap-1">
            <TrendingDown size={14} />
            実質負担額
          </p>
          <p className="text-3xl font-black text-accent-mint">¥{realPrice.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-secondary font-medium italic">
            *送料込み・ポイント還元分を除いた金額を表示しています。
          </p>
          <button className="mt-2 px-6 py-2 bg-accent-mint text-bg-primary font-black rounded-lg hover:brightness-110 transition-all text-xs">
            この条件で最速比較する
          </button>
        </div>
      </div>
    </div>
  );
};
