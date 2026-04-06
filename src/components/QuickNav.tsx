import React from 'react';

export const QuickNav: React.FC = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 120; // ユーザーをナビゲーションの少し下へ
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { id: 'products-section', label: '🛒 商品一覧', icon: 'list' },
    { id: 'trend-section', label: '📈 トレンド', icon: 'trend' },
    { id: 'ai-section', label: '🤖 AI 診断', icon: 'ai' },
    { id: 'inventory-section', label: '📦 在庫管理ツール', icon: 'stock', wrapAt: 4 }
  ];

  return (
    <nav className="quick-nav">
      <div className="quick-nav-inner">
        {navItems.map(item => (
          <button 
            key={item.id} 
            className="quick-nav-item"
            onClick={() => scrollTo(item.id)}
          >
            {item.id === 'inventory-section' ? (
              <span className="flex flex-col md:flex-row items-center md:gap-1">
                <span className="whitespace-nowrap">📦 在庫管理</span>
                <span className="whitespace-nowrap">ツール</span>
              </span>
            ) : (
              item.label
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
