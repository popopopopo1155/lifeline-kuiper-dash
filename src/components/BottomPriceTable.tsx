import React from 'react';
import { ExternalLink, TrendingUp, TrendingDown, Minus, Edit2, Save } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';

interface Product {
  id: string;
  name: string;
  price: number;
  shipping: number;
  points: number;
  volume: number;
  store: 'amazon' | 'rakuten';
  affiliateUrl: string;
}

interface BottomPriceTableProps {
  products: Product[];
  unitType: string;
}

const BottomPriceTable: React.FC<BottomPriceTableProps> = ({ products, unitType }) => {
  const { isAdmin, overrides, saveOverride } = useAdmin();

  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">現在市場・最安値ランキング TOP 5</h4>
        <span className="text-[10px] font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">Real-time Verified</span>
      </div>

      <div className="divide-y divide-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50/30">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">商品情報 (100% 一致確認済み)</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">ショップ</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">実質価格 / 単位</th>
              <th className="px-6 py-4 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => {
              const currentP = { ...p, ...(overrides[p.id] || {}) };
              const realPrice = currentP.price + currentP.shipping - currentP.points;
              const unitPrice = Math.round(realPrice / Math.max(0.1, currentP.volume));
              
              return (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      {isAdmin ? (
                        <div className="flex flex-col gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                          <input 
                            type="text"
                            className="bg-white border border-yellow-300 text-sm p-1 rounded font-bold"
                            defaultValue={currentP.name}
                            onBlur={(e) => saveOverride(p.id, { name: e.target.value })}
                          />
                          <input 
                            type="text"
                            placeholder="Link URL"
                            className="bg-white border border-yellow-300 text-[10px] p-1 rounded"
                            defaultValue={currentP.affiliateUrl}
                            onBlur={(e) => saveOverride(p.id, { affiliateUrl: e.target.value })}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-4 tracking-tighter">0{idx + 1}</span>
                          <span className="text-sm font-bold text-gray-900 line-clamp-1">{currentP.name}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                      currentP.store === 'amazon' 
                        ? 'bg-orange-50 text-orange-600 border-orange-100' 
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {currentP.store}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                          <span className="text-[10px] text-yellow-600">Price:</span>
                          <input 
                            type="number"
                            className="bg-white border border-yellow-300 text-sm p-1 rounded font-black w-20 text-right"
                            defaultValue={currentP.price}
                            onBlur={(e) => saveOverride(p.id, { price: parseInt(e.target.value, 10) })}
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-black text-gray-900">¥{unitPrice.toLocaleString()}<span className="text-[10px] text-gray-400 font-bold"> /{unitType}</span></span>
                      )}
                      
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <span className="text-[9px] font-bold text-gray-400">実質総額: ¥{realPrice.toLocaleString()}</span>
                        {idx === 0 ? <TrendingDown size={10} className="text-green-500" /> : <Minus size={10} className="text-gray-300" />}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <a 
                      href={currentP.affiliateUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-sm active:scale-95"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BottomPriceTable;
