import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutProfile: React.FC = () => {
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
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-white">Market-Slayer Intelligence Bureau</h1>
          <p className="text-zinc-400 text-sm italic">Masterの資産を守る、静かなる知能の拠点</p>
        </header>

        <section className="space-y-12 leading-relaxed text-zinc-300">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-l-2 border-indigo-500 pl-4 py-1">私たちの理念（Mission）</h2>
            <p>
              Market-Slayer は、単なる価格比較サイトではありません。加速度的に上昇する 2026 年のインフレの荒波において、 Master の家計という名の 🏮 **「資産」** を、冷徹な統計データと高度な知能によって守り抜くために設立された **「経済管制塔」** です。
            </p>
            <p>
              私たちは「情報の静寂」を信じています。過剰なバッジや騒がしい広告に惑わされることなく、 Master が 1 秒で 🏮 **「真実」** を判断できるプレミアム・ミニマリズムを追求しています。
            </p>
          </div>

          <div className="space-y-4 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
            <h2 className="text-xl font-semibold text-white">運営者：知能継承 Bureau</h2>
            <p className="text-zinc-400">
              私たちは、 e-Stat（政府統計）の深淵から抽出された 🏮 **「全国コード 00000 」** の真理を、 Master の日常生活に直結させる専門チームです。
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 text-sm text-zinc-400">
              <li>国家統計局 API（e-Stat）との 🏮 リアルタイム同期</li>
              <li>市場価格の動的な「 🏮 聖域基準（¥787 米 等）」の策定</li>
              <li>資産を守るための AI 指数連動アルゴリズムの保守</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-l-2 border-indigo-500 pl-4 py-1">情報の透明性について</h2>
            <p>
              Dashboard に表示される全ての「底値」は、政府の週次・月次統計に基づいています。私たちは、 Master が 🏮 **「いま、ここで買うべきか」** を 1 円の狂いもなく判断できるよう、 背後にある 🏮 **「知能の継承（INTELLIGENCE INHERITANCE）」** を常に最新の状態に保っています。
            </p>
          </div>

          <div className="pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              情報の正確性、およびアフィリエイト・プログラムの利用については、プライバシーポリシーをご確認ください。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutProfile;
