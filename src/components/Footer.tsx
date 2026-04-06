import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-900 bg-[#0a0a0b] py-16 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
        <div className="flex flex-col gap-2 items-center text-center">
          <span className="text-white font-bold tracking-tighter text-xl opacity-90 uppercase">Market-Slayer</span>
          <p className="text-zinc-600 font-medium tracking-wide text-xs uppercase">Household Economic Intelligence Bureau</p>
        </div>

        <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 text-[13px] font-medium">
          <Link to="/about" className="text-zinc-500 hover:text-indigo-400 transition-all duration-300 no-underline">運営者情報</Link>
          <span className="text-zinc-800">・</span>
          <Link to="/privacy" className="text-zinc-500 hover:text-indigo-400 transition-all duration-300 no-underline">プライバシーポリシー</Link>
          <span className="text-zinc-800">・</span>
          <Link to="/terms" className="text-zinc-500 hover:text-indigo-400 transition-all duration-300 no-underline">利用規約</Link>
          <span className="text-zinc-800">・</span>
          <Link to="/contact" className="text-zinc-500 hover:text-indigo-400 transition-all duration-300 no-underline">お問い合わせ</Link>
        </nav>

        <div className="text-zinc-700 text-[10px] tracking-[0.2em] uppercase font-bold mt-4">
          &copy; {currentYear} POPPOPOPO1155 & ANTIGRAVITY
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto flex justify-center mt-8">
        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
      </div>
    </footer>
  );
};

export default Footer;
