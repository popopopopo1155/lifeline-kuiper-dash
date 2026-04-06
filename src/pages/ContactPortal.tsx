import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContactPortal: React.FC = () => {
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
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-white">お問い合わせ</h1>
          <p className="text-zinc-400 text-sm font-bold tracking-widest uppercase">生活必需品.com へのお問い合わせ</p>
        </header>

        <section className="space-y-12 leading-relaxed text-zinc-300">
          <div className="space-y-4">
            <p>
              生活必需品.com の分析に関するフィードバックや、 🏮 **「基準値（Criteria）」** の設定に関するご提案を歓迎します。物価変動の 🏮 **「予兆」** にお気づきの場合も、こちらから 🏮 **「ご報告」** してください。
            </p>
          </div>

          <form className="space-y-6 bg-zinc-900/30 p-10 rounded-3xl border border-zinc-800 backdrop-blur-md">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-2">お名前</label>
              <input type="text" id="name" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder=" popopopopo1155" />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">メールアドレス</label>
              <input type="email" id="email" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="user@example.com" />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-zinc-400 mb-2">メッセージ</label>
              <textarea id="message" rows={6} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none" placeholder=" 報告内容を入力してください..."></textarea>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98]">
              メッセージを送信（ 🏮 指令を執行）
            </button>
          </form>

          <div className="pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              通常 48 時間以内に 🏮 **「解析と返答」** を行います。緊急を要する 🏮 **「市場崩壊」** の報告には優先的に 🏮 **「対応」** いたします。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPortal;
