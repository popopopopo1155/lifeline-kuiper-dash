import React, { useState } from 'react';
import { LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onBack, showBack }) => {
  const { isAdmin, toggleAdmin } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([]);
  
  const handleLogoClick = () => {
    if (onBack) onBack();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const now = Date.now();
    const newTimestamps = [...clickTimestamps, now].filter(t => now - t <= 1000);
    setClickTimestamps(newTimestamps);
    
    if (newTimestamps.length >= 10) {
      toggleAdmin();
      setClickTimestamps([]);
    }
  };

  return (
    <header className="site-header site-header-legacy px-8 py-4">
      <div className="flex justify-between items-center max-w-[1200px] mx-auto w-full">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none active:scale-95 transition-transform"
          onClick={handleLogoClick}
        >
          <div className="bg-black text-white p-2 rounded-xl">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              生活必需品.com
              {isAdmin && (
                <span 
                  className="animate-pulse" 
                  style={{ 
                    background: '#ef4444', 
                    color: 'white', 
                    fontSize: '10px', 
                    padding: '2px 8px', 
                    borderRadius: '9999px', 
                    fontWeight: 'bold', 
                    marginLeft: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}
                >
                  Admin Mode
                </span>
              )}
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] dark:text-gray-400">「買い時」がわかる。暮らしが変わる。</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-gray-100 dark:border-gray-800">
            {showBack && onBack && (
              <button 
                onClick={onBack}
                className="px-4 py-1.5 bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-xs font-black flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
              >
                ➔ 戻る
              </button>
            )}
          </div>
          
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center p-2.5 bg-gray-100 dark:bg-slate-800 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all active:scale-90 shadow-sm border border-transparent dark:border-slate-700"
            title={theme === 'light' ? 'ダークモードへ' : 'ライトモードへ'}
          >
            {theme === 'light' ? <Moon size={18} fill="currentColor" /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
