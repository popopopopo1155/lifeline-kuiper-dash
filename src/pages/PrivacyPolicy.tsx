import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
          <h1 className="text-3xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-main)' }}>プライバシーポリシー</h1>
          <p className="text-sm italic" style={{ color: 'var(--text-sub)' }}>最終更新: 2026年4月6日</p>
        </header>

        <section className="space-y-10 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-l-2 border-indigo-500 pl-4 py-1" style={{ color: 'var(--text-main)' }}>1. 個人情報の収集と利用目的</h2>
            <p>
              生活必需品.com（以下「当サイト」）では、利用者様のプライバシーを尊重し、個人情報の保護に努めております。当サイトの利用にあたり、通常、個人を特定できる情報の提供を求めることはありません。
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-l-2 border-indigo-500 pl-4 py-1" style={{ color: 'var(--text-main)' }}>2. クッキー（Cookie）の利用について</h2>
            <p>
              当サイトでは、サービスの向上、および適切な広告の配信を目的として、クッキー（Cookie）を使用しています。クッキーはウェブサイトから利用者様のブラウザに送信される小さなテキストファイルであり、これにより利用者様のアクセス履歴が記録されますが、氏名や住所などの個人を特定できる情報は含まれません。
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-l-2 border-indigo-500 pl-4 py-1" style={{ color: 'var(--text-main)' }}>3. 広告配信サービスについて</h2>
            <p>
              当サイトでは、Googleが提供する広告配信サービス「Google アドセンス」を利用しています。Google等の第三者配信事業者は、利用者様のアクセス情報に基づき、パーソナライズされた広告を配信します。
            </p>
            <p>
              利用者様は、Googleの<a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">広告設定</a>からパーソナライズ広告を無効にすることができます。
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-l-2 border-indigo-500 pl-4 py-1" style={{ color: 'var(--text-main)' }}>4. 免責事項</h2>
            <p>
              当サイトに掲載されている情報の正確性には万全を期していますが、利用者が当サイトの情報を用いて行う一切の行為について、当サイトは何ら責任を負うものではありません。また、掲載情報は予告なく変更または削除されることがあります。
            </p>
          </div>

          <div className="pt-8 border-t" style={{ borderColor: 'var(--border-main)' }}>
            <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
              プライバシーポリシーに関するお問い合わせは、お問い合わせページよりお願いいたします。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
