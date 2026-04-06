import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutProfile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-app)', color: 'var(--text-main)' }}>
      <div className="max-w-3xl mx-auto py-12">
        <button 
          onClick={() => navigate('/')}
          className="mb-8 text-indigo-600 dark:text-indigo-400 hover:underline transition-all flex items-center gap-2 text-sm font-medium"
        >
          <span>←</span> ホームへ戻る
        </button>

        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">生活必需品.comについて</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">About Seikatsu-Hitsujuhin.com</p>
        </header>

        <section className="space-y-12 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-l-4 border-indigo-500 pl-4 py-1">サイトの目的</h2>
            <p className="font-medium">
              「生活必需品.com」は、日々変動する生活必需品の価格情報を可視化し、皆様の家計管理をサポートすることを目的とした情報提供サイトです。公的な統計データに基づき、客観的な視点で価格推移を分析します。
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-sub)' }}>
              情報の過剰な装飾を排し、必要な情報を迅速に把握できるシンプルで使いやすいインターフェースを追求しています。
            </p>
          </div>

          <div className="space-y-4 p-8 rounded-xl border shadow-lg" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
            <h2 className="text-xl font-bold">当サイトの取り組み</h2>
            <p className="font-medium">
              政府統計（e-Stat）などの信頼性の高いデータソースを活用し、以下の機能を提供しています。
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 text-sm font-bold" style={{ color: 'var(--text-sub)' }}>
              <li>政府統計局API（e-Stat）を利用した定期的な価格データの更新</li>
              <li>主要な生活必需品の市場平均単価の算出と提示</li>
              <li>在庫状況に応じた効率的な購入タイミングの検討支援</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold border-l-4 border-indigo-500 pl-4 py-1">データの透明性について</h2>
            <p className="font-medium">
              当サイトで提示している価格の基準値は、政府が公開している週次・月次の統計調査に基づいています。利用者の皆様が客観的なデータに基づいて購入判断を行えるよう、情報の正確性と透明性を維持することに努めています。
            </p>
          </div>

          <div className="pt-8 border-t">
            <p className="text-sm font-medium" style={{ color: 'var(--text-sub)' }}>
              情報の正確性や利用規約に関する詳細は、プライバシーポリシーおよび利用規約のページをご確認ください。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutProfile;
