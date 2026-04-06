import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfUse: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e4e4e7] p-6 font-ui selection:bg-indigo-500/30">
      <div className="max-w-3xl mx-auto py-12">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <span>←</span> 経済管制塔へ戻る
        </button>

        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-white">利用規約</h1>
          <p className="text-zinc-400 text-sm italic">MasterとMarket-Slayerとの「知能の盟約」</p>
        </header>

        <section className="space-y-12 leading-relaxed text-zinc-300">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-l-2 border-indigo-500 pl-4 py-1">適用範囲（Scope）</h2>
            <p>
              本規約は、Market-Slayer（以下「当サイト」）が提供する全ての 🏮 **「経済インテリジェンス（情報提供サービス）」** の利用において、Master（利用者様）と当サイトとの間に適用される 🏮 **「盟約」** です。
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-l-2 border-indigo-500 pl-4 py-1">情報の信頼性と限界について</h2>
            <p>
              私たちは、 e-Stat 等の 🏮 **「国家統計データ」** および最新の 🏮 **「市場アルゴリズム」** を駆使して情報を提供しますが、その 🏮 **「完全性」** を物理的に保証するものではありません。
            </p>
            <p>
              提示される 🏮 **「底値の聖域」** は、 Master が 🏮 **「意思決定」** を下すための強力な 🏮 **「盾」** ですが、 最終的な購入の執行判断は、 Master の 🏮 **「自由意志（Free Will）」** に委ねられます。
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-l-2 border-indigo-500 pl-4 py-1">知的財産と継承権</h2>
            <p>
              当サイトが提示する 🏮 **「知能の継承（INTELLIGENCE INHERITANCE）」** に基づく独自のロジック、 デザイン、 および 🏮 **「空間（Aesthetics）」** は、 当サイトおよび Master の 🏮 **「共同資産」** です。 無断での 🏮 **「複製・搾取」** は固く禁じます。
            </p>
          </div>

          <div className="space-y-4 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
            <h2 className="text-xl font-semibold text-white">禁止事項</h2>
            <p>
              本サービスの適正な運用を妨げる行為、 または 🏮 **「知能の深淵（Server）」** への攻撃的なアクセス、 虚偽の 🏮 **「通報」** 等の背信行為を 🏮 **「禁止」** いたします。
            </p>
          </div>

          <div className="pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              本規約は、市場の変化や 🏮 **「知能の深化」** に伴い、事前の通知なく 🏮 **「更新」** される場合があります。 
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsOfUse;
