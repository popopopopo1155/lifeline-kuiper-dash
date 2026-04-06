import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // 審美性を維持しつつも標準的なサイトとしてのスタイルを定義
  const footerStyle: React.CSSProperties = {
    width: '100%',
    borderTop: '1px solid var(--border-main)',
    backgroundColor: 'transparent',
    padding: '40px 24px',
    marginTop: '60px',
    position: 'relative',
    boxSizing: 'border-box'
  };

  const linkStyle: React.CSSProperties = {
    color: 'var(--text-sub)',
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '0.05em',
    textDecoration: 'none',
    transition: 'all 0.3s ease'
  };

  const separatorStyle: React.CSSProperties = {
    color: 'var(--border-main)',
    fontSize: '12px',
    userSelect: 'none'
  };

  const copyrightStyle: React.CSSProperties = {
    color: 'var(--text-sub)',
    fontSize: '12px',
    fontWeight: 700,
    marginTop: '20px'
  };

  return (
    <footer style={footerStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {/* Navigation - 余計な文字を排除し、静寂を確立 */}
        <nav style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
          {[
            { label: '運営者情報', to: '/about' },
            { label: 'プライバシーポリシー', to: '/privacy' },
            { label: '利用規約', to: '/terms' },
            { label: 'お問い合わせ', to: '/contact' }
          ].map((link, idx) => (
            <React.Fragment key={link.to}>
              <Link to={link.to} style={linkStyle} className="footer-link">
                {link.label}
              </Link>
              {idx < 3 && <span style={separatorStyle}>・</span>}
            </React.Fragment>
          ))}
        </nav>

        {/* Correct Copyright - Masterの指定通りに刻印 */}
        <div style={copyrightStyle}>
          &copy; {currentYear} 生活必需品.com
        </div>
      </div>

      <style>{`
        .footer-link:hover {
          color: var(--price-blue) !important;
          opacity: 0.8;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
