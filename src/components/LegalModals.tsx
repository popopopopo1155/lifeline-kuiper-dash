import React from 'react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="legal-modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="legal-modal-content" onClick={e => e.stopPropagation()} style={{
        background: 'white',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '85vh',
        borderRadius: '24px',
        padding: '32px',
        position: 'relative',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: '#f1f5f9',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#64748b',
          transition: 'all 0.2s'
        }}>×</button>
        
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
          {title}
        </h2>
        
        <div style={{ color: '#334155', lineHeight: '1.8', fontSize: '15px' }}>
          {children}
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button onClick={onClose} style={{
            background: '#0f172a',
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>閉じる</button>
        </div>
      </div>
    </div>
  );
};

export const AboutOwner: React.FC = () => (
  <div>
    <section style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#1e293b' }}>運営者情報</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontWeight: '700', width: '120px' }}>サイト名</td>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>hitsujuhin.com（生活必需品.com）</td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontWeight: '700' }}>運営者名</td>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>[お名前を入力してください]</td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontWeight: '700' }}>所在地</td>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>[住所または都道府県市区町村を入力]</td>
          </tr>
          <tr>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontWeight: '700' }}>お問い合わせ</td>
            <td style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>[メールアドレスを入力]</td>
          </tr>
        </tbody>
      </table>
    </section>
    <p style={{ fontSize: '13px', color: '#64748b' }}>
      当サイトは、生活必需品の価格情報を統計および市場価格に基づき提供するインテリジェンス・ダッシュボードです。家計の最適化を支援することを目的としています。
    </p>
  </div>
);

export const PrivacyPolicy: React.FC = () => (
  <div style={{ textAlign: 'justify' }}>
    <section style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#1e293b' }}>1. 広告の配信について</h3>
      <p>
        当サイト（hitsujuhin.com）は、楽天アフィリエイト、Amazonアソシエイトなどのアフィリエイトプログラムに参加しています。これらのプログラムは、サイトに広告を表示し、訪問者が商品を購入することによってサイトが紹介料を獲得できる手段を提供することを目的に設定された宣伝プログラムです。
      </p>
    </section>

    <section style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#1e293b' }}>2. クッキー（Cookies）の使用について</h3>
      <p>
        当サイトでは、サービスの向上および広告配信を適切に管理するためにクッキーを使用することがあります。クッキーは、ブラウザの設定により拒否することも可能ですが、その場合、サイトの一部機能が正常に動作しない可能性があります。
      </p>
    </section>

    <section style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#1e293b' }}>3. 免責事項</h3>
      <p>
        当サイトで提供する価格予測、在庫シミュレーション、およびAIによるアドバイスは、統計データおよび独自の予測モデルに基づくものであり、将来の価格や在庫状況を保証するものではありません。当サイトの情報を利用して発生したいかなる損失や損害についても、当サイト管理者は一切の責任を負いかねます。ご購入の際は、必ず各販売サイトの最新情報をご確認ください。
      </p>
    </section>

    <section style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: '#1e293b' }}>4. プライバシーポリシーの変更</h3>
      <p>
        当サイトは、個人情報に関して適用される日本の法令を遵守するとともに、本ポリシーの内容を適宜見直しその改善に努めます。修正された最新のプライバシーポリシーは常に本ページにて開示されます。
      </p>
    </section>
  </div>
);

export default LegalModal;
