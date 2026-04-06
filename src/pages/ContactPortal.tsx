import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContactPortal: React.FC = () => {
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
          <h1 className="text-3xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-main)' }}>お問い合わせ</h1>
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-sub)' }}>Contact Information</p>
        </header>

        <section className="space-y-12 leading-relaxed">
          <div className="space-y-4">
            <p>
              生活必需品.com に関するご意見、ご要望、不備のご報告などを受け付けております。以下のフォームよりお問い合わせください。
            </p>
          </div>

          <form className="space-y-6 p-10 rounded-3xl border backdrop-blur-md" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-sub)' }}>お名前</label>
              <input type="text" id="name" className="w-full border rounded-xl px-4 py-3 transition-colors" style={{ background: 'var(--bg-app)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} placeholder="お名前を入力してください" />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-sub)' }}>メールアドレス</label>
              <input type="email" id="email" className="w-full border rounded-xl px-4 py-3 transition-colors" style={{ background: 'var(--bg-app)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} placeholder="user@example.com" />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-sub)' }}>お問い合わせ内容</label>
              <textarea id="message" rows={6} className="w-full border rounded-xl px-4 py-3 transition-colors resize-none" style={{ background: 'var(--bg-app)', borderColor: 'var(--border-main)', color: 'var(--text-main)' }} placeholder="お問い合わせ内容を入力してください"></textarea>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]">
              送信する
            </button>
          </form>

          <div className="pt-8 border-t" style={{ borderColor: 'var(--border-main)' }}>
            <p className="text-sm" style={{ color: 'var(--text-sub)' }}>
              ※お問い合わせ内容により、回答にお時間をいただく場合や、回答し兼ねる場合がございます。予めご了承ください。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPortal;
