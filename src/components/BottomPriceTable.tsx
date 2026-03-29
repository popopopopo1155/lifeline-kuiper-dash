import { ArrowDownCircle } from 'lucide-react';

export const BottomPriceTable: React.FC = () => {
  const categories = [
    { name: 'お米 (5kg)', price: '¥2,100', store: 'スーパーA', status: '過去最安値圏' },
    { name: 'トイレットペーパー (12R)', price: '¥498', store: 'Amazon', status: '最安値圏' },
    { name: '洗濯洗剤 (詰替)', price: '¥298', store: 'ドラッグストアB', status: 'さらなる下落予想' },
    { name: 'サラダ油 (1000g)', price: '¥348', store: 'スーパーC', status: '安定' },
  ];

  return (
    <div className="glass-card flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Update: 3月度</span>
        </div>
        <div className="px-2 py-1 bg-accent-mint/10 text-accent-mint rounded text-[10px] font-bold">
          毎日 08:00 更新
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-secondary text-[10px] uppercase tracking-widest border-b border-white/5">
              <th className="pb-3 font-medium">アイテム</th>
              <th className="pb-3 font-medium text-right">目標底値</th>
              <th className="pb-3 font-medium text-center">主要ストア</th>
              <th className="pb-3 font-medium text-right">ステータス</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {categories.map((cat, i) => (
              <tr key={i} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                <td className="py-4 font-bold">{cat.name}</td>
                <td className="py-4 text-right">
                  <span className="text-accent-mint font-black">{cat.price}</span>
                </td>
                <td className="py-4 text-center text-secondary">{cat.store}</td>
                <td className="py-4 text-right">
                  <span className="flex items-center justify-end gap-1 text-[10px] font-bold text-accent-blue">
                    <ArrowDownCircle size={10} />
                    {cat.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-[10px] text-muted italic mt-2">
        ※独自AIアルゴリズムにより、Webチラシ・ECサイト価格を統合解析した数値です。
      </p>
    </div>
  );
};
