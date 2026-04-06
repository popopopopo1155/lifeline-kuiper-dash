import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Article {
  id: string;
  title: string;
  date: string;
  author: string;
  content: React.ReactNode;
}

const JournalArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const articles: Record<string, Article> = {
    "rice-truth": {
      id: "rice-truth",
      title: "米価の動向分析：日本国内における適正価格の推移と要因",
      date: "2026年4月6日",
      author: "生活必需品.com 編集部",
      content: (
        <div className="space-y-8">
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-sub)' }}>
            2026年、日本の食卓において主要な穀物である米の価格変動が注目されています。店頭価格の推移に対し、消費者はどのような視点でデータを見るべきか、統計的側面から分析します。
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4" style={{ color: 'var(--text-main)' }}>1. 小売物価統計に基づく価格分析</h2>
          <p>
            政府統計（e-Stat）の小売物価統計調査を詳細に分析すると、地域間での価格差や銘柄による変動幅に一定の傾向が見られます。単なる物価上昇として捉えるのではなく、供給網や物流コストの影響を客観的に把握することが重要です。
          </p>
          <p>
            当サイトが提示している基準値は、全国的な平均統計情報をベースに、現時点での市場コストを加味した「適正な購入価格の目安」を示しています。これは、消費者が極端な高値での購入を避けるための合理的な判断指標となります。
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4" style={{ color: 'var(--text-main)' }}>2. 基準値に関する統計的アプローチ</h2>
          <p>
            特定の地域ではなく全国平均（地域コード 00000等）を基準とする理由は、局地的な需給バランスやコスト変動に左右されない「物の本質的な価値」を把握するためです。都市部の価格は不動産コスト等の影響が大きく、食品単体の価値を正確に反映しない場合があります。
          </p>

          <blockquote className="border-l-4 border-indigo-500 pl-6 my-10 italic text-xl" style={{ color: 'var(--text-sub)' }}>
            「信頼できるデータに基づき、冷静な購買判断を行うことが家計管理の基盤となります。」
          </blockquote>

          <h2 className="text-2xl font-bold mt-12 mb-4" style={{ color: 'var(--text-main)' }}>3. 実生活への活用</h2>
          <p>
            インフレ局面においては、報道による心理的な影響を受けやすい傾向があります。当サイトの価格推移データを参照し、実势価格との乖離を確認することで、計画的かつ賢い買い物に繋げることが可能です。
          </p>
        </div>
      )
    },
    "inflation-shield": {
      id: "inflation-shield",
      title: "インフレ局面における家計管理：データの視覚化による効率化",
      date: "2026年4月6日",
      author: "生活必需品.com 編集部",
      content: (
        <div className="space-y-8">
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-sub)' }}>
            物価上昇が日常的な課題となる中、消費者が効率的に家計を守るための情報活用術について解説します。
          </p>
          <h2 className="text-2xl font-bold mt-12 mb-4" style={{ color: 'var(--text-main)' }}>1. 効率的な在庫管理の重要性</h2>
          <p>
            当サイトの提供する在庫管理機能は、生活必需品の保有状況を正確に把握するために設計されています。必要以上の備蓄を避けつつ、底値情報を活用して適切なタイミングで補充を行うことが、持続可能な家計管理の要となります。
          </p>
          <h2 className="text-2xl font-bold mt-12 mb-4" style={{ color: 'var(--text-main)' }}>2. 情報解析によるサポート</h2>
          <p>
            生活必需品.com は、膨大な統計データから皆様の生活に直結する要素を抽出し、解析を行っています。視認性を重視したデザインにより、店頭でも素早く情報を確認でき、確かなデータに基づいた意思決定を支援します。
          </p>
        </div>
      )
    }
  };

  const article = id ? articles[id] : null;

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)', color: 'var(--text-main)' }}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p style={{ color: 'var(--text-sub)' }}>該当する記事が見つかりません</p>
          <button onClick={() => navigate('/')} className="mt-8 text-indigo-600 dark:text-indigo-400 hover:underline">ホームへ戻る</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 selection:bg-indigo-500/30" style={{ background: 'var(--bg-app)', color: 'var(--text-main)' }}>
      <article className="max-w-3xl mx-auto py-16">
        <header className="mb-16">
          <button 
            onClick={() => navigate('/')}
            className="mb-12 text-indigo-600 dark:text-indigo-400 hover:underline transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <span>←</span> ホームへ戻る
          </button>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs tracking-widest text-indigo-500 uppercase font-bold">
              <span className="w-8 h-[1px] bg-indigo-500"></span>
              Strategic Analysis
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm pt-4" style={{ color: 'var(--text-sub)' }}>
              <span className="font-medium">{article.author}</span>
              <span className="w-1 h-1 bg-gray-300 dark:bg-zinc-800 rounded-full"></span>
              <span>{article.date}</span>
            </div>
          </div>
        </header>

        <div className="prose dark:prose-invert max-w-none">
          {article.content}
        </div>

        <footer className="mt-20 pt-12 border-t" style={{ borderColor: 'var(--border-main)' }}>
          <div className="p-8 rounded-3xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              本記事について
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>
              本記事は、生活必需品.com 編集部による独自の市場分析結果を掲載しています。分析内容は公的な統計データに基づき、定期的に更新されます。無断転載・複製は固く禁じます。
            </p>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default JournalArticle;
