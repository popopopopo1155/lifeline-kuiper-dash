import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfUse: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 selection:bg-indigo-500/30" style={{ background: 'var(--bg-app)', color: 'var(--text-main)' }}>
      <div className="max-w-3xl mx-auto py-12">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 text-indigo-600 dark:text-indigo-400 hover:underline transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <span>←</span> ホームへ戻る
        </button>

        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-main)' }}>利用規約</h1>
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-sub)' }}>Terms of Use</p>
        </header>

        <section className="space-y-12 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-l-2 border-indigo-500 pl-4 py-1" style={{ color: 'var(--text-main)' }}>1. 規約の適用</h2>
            <p>
              本利用規約（以下「本規約」）は、生活必需品.com（以下「当サイト」）が提供するサービス（以下「本サービス」）の利用条件を定めるものです。利用者様が本サービスを利用することをもって、本規約に同意したものとみなします。
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-l-2 border-indigo-500 pl-4 py-1" style={{ color: 'var(--text-main)' }}>2. サービスの提供と免責</h2>
            <p>
              当サイトは、公的な統計データに基づいた情報を提供しますが、その内容の正確性、最新性、完全性について保証するものではありません。
            </p>
            <p>
              本サービスの利用によって生じた損害や不利益について、当サイトは一切の責任を負いません。最終的な購入判断は利用者様の責任において行ってください。
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-l-2 border-indigo-500 pl-4 py-1" style={{ color: 'var(--text-main)' }}>3. 知的財産権</h2>
            <p>
              当サイトに掲載されているコンテンツ（文章、画像、デザイン、プログラム等）に関する知的財産権は、当サイトまたは正当な権利者に帰属します。許可なく転載、複製、改変を行うことを禁じます。
            </p>
          </div>

          <div className="space-y-4 p-8 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>4. 禁止事項</h2>
            <p>
              利用者は、本サービスの利用にあたり、以下の行為を行ってはならないものとします。
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 text-sm" style={{ color: 'var(--text-sub)' }}>
              <li>本サービスの運営を妨害する行為</li>
              <li>不正なアクセスや情報の改ざんを試みる行為</li>
              <li>法令または公序良俗に反する行為</li>
              <li>その他、当サイトが不適切と判断する行為</li>
            </ul>
          </div>

          <div className="pt-8 border-t" style={{ borderColor: 'var(--border-main)' }}>
            <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
              本規約は、必要に応じて事前の通知なく変更されることがあります。変更後の規約は当サイトに掲載された時点から効力を生じるものとします。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsOfUse;
