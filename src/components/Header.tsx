import React from 'react';
import { ShoppingCart, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="py-6 px-8 flex justify-between items-center border-b border-white/5 sticky top-0 bg-bg-primary/80 backdrop-blur-md z-50">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-accent-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShoppingCart className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter text-gradient">生活必需品.com</h1>
          <p className="text-[10px] text-secondary font-medium tracking-widest uppercase opacity-70">Expert Price Intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <nav className="hidden md:flex gap-6 text-sm font-medium text-secondary">
          <a href="#" className="hover:text-primary transition-colors text-primary">ダッシュボード</a>
          <a href="#" className="hover:text-primary transition-colors">お米</a>
          <a href="#" className="hover:text-primary transition-colors">日用品</a>
        </nav>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-mint/10 text-accent-mint rounded-lg border border-accent-mint/20">
          <ShieldCheck size={16} />
          <span className="text-xs font-bold">Secure AI Audit Active</span>
        </div>
      </div>
    </header>
  );
};
