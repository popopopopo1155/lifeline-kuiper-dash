import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-white">プライバシーポリシー</h1>
          <p className="text-zinc-400 text-sm italic">最終更新: 2026年4月6日</p>
        </header>

        <section className="space-y-10 leading-relaxed text-zinc-300">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-l-2 border-indigo-500 pl-4 py-1">情報の収集と利用について</h2>
            <p>
              Market-Slayer（以下「当サイト」）は、Master（利用者様）の経済的な資産を守る管制塔として、情報の透明性を最優先事項としています。当サイトでは、サービスの向上および広告配信のためにクッキー（Cookie）を使用することがありますが、これによって個人を特定可能な情報（氏名、生年月日、住所等）が当サイトに提供されることはありません。
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-l-2 border-indigo-500 pl-4 py-1">広告配信(Google AdSense)について</h2>
            <p>
              当サイトでは、Googleによる広告サービス「Google アドセンス」を利用しています。Googleなどの第三者配信事業者は、Cookieを使用して、Masterが当サイトや他のウェブサイトに過去にアクセスした際の情報に基づき、適切な広告を配信します。
            </p>
            <p>
              Google広告の設定（<a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">こちら</a>）により、パーソナライズ広告を無効にすることが可能です。
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-l-2 border-indigo-500 pl-4 py-1">アクセス解析ツールについて</h2>
            <p>
              当サイトでは、市場の動向およびサイトの利用状況を把握するため、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。このツールはデータの収集のためにクッキーを使用していますが、データは匿名で収集されており、個人を特定するものではありません。
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white border-l-2 border-indigo-500 pl-4 py-1">免責事項</h2>
            <p>
              当サイトで提供される価格データ、統計情報、およびAIによる予測は、公的な統計データ（e-Stat等）に基づいたものであり、その正確性には万全を期していますが、将来の利益を保証するものではありません。当サイトの情報を利用して行われた判断や投資によって生じた損害について、当サイトは一切の責任を負いかねます。
            </p>
          </div>

          <div className="pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              情報の取り扱いについて不明な点がある場合は、お問い合わせページよりご連絡ください。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
