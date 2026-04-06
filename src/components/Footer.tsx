import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-16 px-6 mt-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10 relative z-10">
        <div className="flex flex-col gap-2 items-center text-center">
          <span className="text-white font-black tracking-tighter text-2xl italic opacity-95">Market-Slayer</span>
          <p className="text-zinc-600 font-bold tracking-[0.3em] text-[10px] uppercase">Household Economic Intelligence Bureau</p>
        </div>

        <nav className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
          {[
            { label: '運営者情報', to: '/about' },
            { label: 'プライバシーポリシー', to: '/privacy' },
            { label: '利用規約', to: '/terms' },
            { label: 'お問い合わせ', to: '/contact' }
          ].map((link, idx) => (
            <React.Fragment key={link.to}>
              <Link 
                to={link.to} 
                className="text-zinc-500 hover:text-indigo-400 font-bold text-xs tracking-wide transition-all duration-300 no-underline hover:translate-y-[-1px]"
              >
                {link.label}
              </Link>
              {idx < 3 && <span className="text-zinc-800 text-xs select-none">・</span>}
            </React.Fragment>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-4">
          <div className="h-[1px] w-12 bg-zinc-800"></div>
          <div className="text-zinc-700 text-[10px] tracking-[0.25em] uppercase font-black">
            &copy; {currentYear} POPPOPOPO1155 & ANTIGRAVITY
          </div>
        </div>
      </div>
      
      {/* 聖域の静かな輝き */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
    </footer>
  );
};

export default Footer;
