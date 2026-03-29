import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import LegalModal, { AboutOwner, PrivacyPolicy } from './components/LegalModals';

function App() {
  const [modalType, setModalType] = useState<'owner' | 'privacy' | null>(null);

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1 }}>
        <Dashboard />
      </main>

      {/* Footer for Legal Compliance */}
      <footer style={{ 
        padding: '32px 20px', 
        background: '#f8fafc', 
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '24px', 
          marginBottom: '16px',
          fontSize: '13px',
          fontWeight: '700',
          color: '#64748b'
        }}>
          <span 
            onClick={() => setModalType('owner')} 
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#0f172a')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            運営者情報
          </span>
          <span 
            onClick={() => setModalType('privacy')} 
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#0f172a')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            プライバシーポリシー
          </span>
        </div>
        <p style={{ fontSize: '11px', color: '#94a3af', fontWeight: '500' }}>
          &copy; {new Date().getFullYear()} hitsujuhin.com. All Rights Reserved.
        </p>
      </footer>

      {/* Modals */}
      <LegalModal 
        isOpen={modalType === 'owner'} 
        onClose={() => setModalType(null)} 
        title="運営者情報"
      >
        <AboutOwner />
      </LegalModal>

      <LegalModal 
        isOpen={modalType === 'privacy'} 
        onClose={() => setModalType(null)} 
        title="プライバシーポリシー"
      >
        <PrivacyPolicy />
      </LegalModal>
    </div>
  );
}

export default App;
