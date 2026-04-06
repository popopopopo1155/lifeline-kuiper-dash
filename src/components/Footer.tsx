import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-900 bg-[#0a0a0b] py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-sm">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <span className="text-white font-bold tracking-tighter text-lg">Market-Slayer</span>
          <p className="text-zinc-500 font-medium">Household Economic Intelligence Bureau</p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 font-medium">
          <Link to="/about" className="text-zinc-400 hover:text-white transition-colors">運営者情報</Link>
          <Link to="/privacy" className="text-zinc-400 hover:text-white transition-colors">プライバシーポリシー</Link>
          <Link to="/terms" className="text-zinc-400 hover:text-white transition-colors">利用規約</Link>
          <Link to="/contact" className="text-zinc-400 hover:text-white transition-colors">お問い合わせ</Link>
        </nav>

        <div className="text-zinc-500 text-xs tracking-widest uppercase">
          &copy; {currentYear} popopopopo1155 & Antigravity
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto flex justify-center mt-8">
        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
      </div>
    </footer>
  );
};

export default Footer;
