import React from 'react';
import { AlertTriangle, Info, ShieldAlert, Newspaper, TrendingUp, CheckCircle2 } from 'lucide-react';

interface RiskAlertBannerProps {
  newsRisks: any;
  numericalRisks: any[];
}

const RiskAlertBanner: React.FC<RiskAlertBannerProps> = ({ newsRisks, numericalRisks }) => {
  const hasNews = newsRisks && newsRisks.activeRisks && newsRisks.activeRisks.length > 0;
  const hasNumerical = numericalRisks && numericalRisks.length > 0;

  if (!hasNews && !hasNumerical) return null;

  // 全リスクの統合
  const allNews = hasNews ? newsRisks.activeRisks.map((r: any) => ({ ...r, type: 'news' })) : [];
  const allNumerical = numericalRisks.map(r => ({ ...r, type: 'data' }));
  const combinedRisks = [...allNumerical, ...allNews];
  
  const highestLevel = combinedRisks.some(r => r.level === 'CRITICAL') ? 'CRITICAL' :
                       combinedRisks.some(r => r.level === 'HIGH') ? 'HIGH' : 'MODERATE';

  // テーマ変数を使用するように変更
  const boxStyles = { 
    backgroundColor: 'var(--bg-card)', 
    border: '1.5px solid var(--border-main)', 
  };

  const textColor = 'text-[var(--text-main)]'; 

  const Icon = highestLevel === 'CRITICAL' ? ShieldAlert :
               highestLevel === 'HIGH' ? AlertTriangle : Info;

  return (
    <div 
      className="mb-8 p-5 rounded-lg transition-colors"
      style={{ ...boxStyles, boxShadow: '4px 4px 0px rgba(0,0,0,0.05)' }}
    >
      {/* 1. ヘッダー：アイコンとタイトルを一列に固定 */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}
      >
        <Icon 
          style={{ flexShrink: 0 }}
          className="w-6 h-6 text-[var(--text-main)]" 
        />
        <h3 
          className={`text-lg font-black ${textColor}`}
          style={{ margin: 0, padding: 0, lineHeight: '1' }}
        >
          {highestLevel === 'CRITICAL' ? '物価急騰リスク検知' : 
           highestLevel === 'HIGH' ? '物価上昇の可能性' : '市場動向の変化'}
        </h3>
      </div>

      {/* 2. ニュース・データエリア：各行を確実に横一列に固定 */}
      <div className="space-y-3" style={{ paddingLeft: '4px' }}>
        {combinedRisks.slice(0, 6).map((risk: any, i: number) => {
          // 🏮 [MOBILE INTELLIGENCE] スマホ時のみタイトルを短縮して画面を保護
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
          let displayTitle = risk.title;
          if (isMobile && risk.type === 'news' && displayTitle.length > 20) {
            displayTitle = displayTitle.substring(0, 20) + '...';
          }

          return (
            <div 
              key={i} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}
            >
              {/* 絵文字アイコン */}
              {risk.type === 'data' ? (
                <TrendingUp style={{ flexShrink: 0 }} className="w-5 h-5 text-[var(--text-main)]" />
              ) : (
                <Newspaper style={{ flexShrink: 0 }} className="w-5 h-5 text-[var(--text-main)]" />
              )}
              
              {/* テキストとリンク (絶対に折返さない & スマホで圧縮) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
                {risk.type === 'news' ? (
                  <a 
                    href={risk.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transition-colors underline underline-offset-4 whitespace-nowrap overflow-hidden text-ellipsis font-bold"
                    style={{ color: 'var(--news-link)', textDecorationColor: 'var(--news-link)', fontSize: isMobile ? '12px' : '14px' }}
                  >
                    {isMobile ? `📰 ${displayTitle}` : risk.title}
                  </a>
                ) : (
                  <span 
                    className="font-black whitespace-nowrap overflow-hidden text-ellipsis text-[var(--text-main)]"
                    style={{ fontSize: isMobile ? '12px' : '14px' }}
                  >
                    {displayTitle}
                  </span>
                )}
  
                {/* Verified Badge (スマホでは非表示にして省スペース化) */}
                {!isMobile && risk.type === 'news' && hasNumerical && numericalRisks.some(n => risk.title.includes(n.title.split(':')[1]?.trim().split('(')[0] || '')) && (
                  <CheckCircle2 style={{ flexShrink: 0 }} className="w-4 h-4 text-[var(--text-main)]" />
                )}
              </div>
            </div>
          );
        })}

        <p className="mt-5 text-[11px] text-[var(--text-sub)] font-bold border-t border-[var(--border-main)] pt-4">
          ※ 報道と実勢価格の乖離を 14日間 監視し、不確かな情報は自動排除されます
        </p>
      </div>
    </div>
  );
};

export default RiskAlertBanner;
