import React, { useState } from 'react';
import { LayoutDashboard, TrendingUp, Compass, Settings } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onBack, showBack }) => {
  const { isAdmin, toggleAdmin } = useAdmin();
  const [clickCount, setClickCount] = useState(0);

  const handleLogoClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    
    // 3回連続クリックで管理者モード
    if (nextCount === 3) {
      toggleAdmin();
      setClickCount(0);
    }

    // 3秒経ったらリセット（余裕を持たせる）
    setTimeout(() => {
      setClickCount(0);
    }, 3000);
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
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">「買い時」がわかる。暮らしが変わる。</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 pr-6">
            {showBack && onBack && (
              <button 
                onClick={onBack}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
              >
                ➔ 戻る
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3 border-l border-gray-100 pl-6 h-8">
            <div className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
              <Compass size={18} />
            </div>
            <div className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
              <Settings size={18} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
