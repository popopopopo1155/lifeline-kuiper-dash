import React, { useState } from 'react';
import { LayoutDashboard, TrendingUp, Compass, Settings } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';

const Header = () => {
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

    // 1秒経ったらリセット
    setTimeout(() => {
      setClickCount(0);
    }, 1000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
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
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Master Stability v5.0 (Golden Master)</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-6">
            <a href="#" className="text-sm font-bold text-gray-900 border-b-2 border-black pb-1 transition-all duration-300">Overview</a>
            <a href="#" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors">Analytics</a>
            <a href="#" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors">Reports</a>
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
