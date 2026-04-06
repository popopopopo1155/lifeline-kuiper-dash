import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // 🏮 安定性を極限まで高めるためのインラインスタイル定義
  const footerStyle: React.CSSProperties = {
    width: '100%',
    borderTop: '1px solid #18181b', // zinc-900
    backgroundColor: '#0a0a0a', // Onyx Black
    padding: '64px 24px',
    marginTop: '80px',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box'
  };

  const linkStyle: React.CSSProperties = {
    color: '#71717a', // zinc-500
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '0.05em',
    textDecoration: 'none',
    transition: 'all 0.3s ease'
  };

  const separatorStyle: React.CSSProperties = {
    color: '#27272a', // zinc-800
    fontSize: '12px',
    userSelect: 'none'
  };

  return (
    <footer style={footerStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', position: 'relative', zIndex: 10 }}>
        
        {/* Branding */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: '#ffffff', fontWeight: 900, fontSize: '24px', fontStyle: 'italic', tracking: '-0.05em', opacity: 0.95 }}>
            Market-Slayer
          </span>
          <p style={{ color: '#52525b', fontWeight: 700, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0 }}>
            Household Economic Intelligence Bureau
          </p>
        </div>

        {/* Navigation - 🏮 「普通繋げんやろ」への回答 */}
        <nav style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
          {[
            { label: '運営者情報', to: '/about' },
            { label: 'プライバシーポリシー', to: '/privacy' },
            { label: '利用規約', to: '/terms' },
            { label: 'お問い合わせ', to: '/contact' }
          ].map((link, idx) => (
            <React.Fragment key={link.to}>
              <Link to={link.to} style={linkStyle} className="hover-indigo">
                {link.label}
              </Link>
              {idx < 3 && <span style={separatorStyle}>・</span>}
            </React.Fragment>
          ))}
        </nav>

        {/* Copyright */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ height: '1px', width: '48px', backgroundColor: '#27272a' }}></div>
          <div style={{ color: '#3f3f46', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 900 }}>
            &copy; {currentYear} POPPOPOPO1155 & ANTIGRAVITY
          </div>
        </div>
      </div>

      {/* 🏮 「経済管制塔」の静かな輝き（デコレーション） */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '50%', 
        height: '1px', 
        background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent)' 
      }}></div>

      <style>{`
        .hover-indigo:hover {
          color: #818cf8 !important; /* indigo-400 */
          transform: translateY(-1px);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
