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

  // 背景色をより「まとまり」のある、視認性の高いものに変更
  const boxStyles = highestLevel === 'CRITICAL' 
    ? { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.3)' }
    : highestLevel === 'HIGH'
    ? { backgroundColor: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.3)' }
    : { backgroundColor: 'rgba(59, 130, 246, 0.08)', borderColor: 'rgba(59, 130, 246, 0.3)' };

  const textColor = highestLevel === 'CRITICAL' ? 'text-red-700' :
                    highestLevel === 'HIGH' ? 'text-orange-700' :
                    'text-blue-700';

  const Icon = highestLevel === 'CRITICAL' ? ShieldAlert :
               highestLevel === 'HIGH' ? AlertTriangle : Info;

  return (
    <div 
      className="mb-8 p-5 rounded-2xl border backdrop-blur-sm"
      style={{ ...boxStyles, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}
    >
      {/* 1. ヘッダー：アイコンとタイトルを一列に固定 */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}
      >
        <Icon 
          style={{ flexShrink: 0 }}
          className={`w-6 h-6 ${highestLevel === 'CRITICAL' ? 'text-red-500' : 'text-orange-500'}`} 
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
        {combinedRisks.slice(0, 6).map((risk: any, i: number) => (
          <div 
            key={i} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            {/* 絵文字アイコン */}
            {risk.type === 'data' ? (
              <TrendingUp style={{ flexShrink: 0 }} className="w-5 h-5 text-red-500" />
            ) : (
              <Newspaper style={{ flexShrink: 0 }} className="w-5 h-5 text-gray-500" />
            )}
            
            {/* テキストとリンク (絶対に折返さない) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              {risk.type === 'news' ? (
                <a 
                  href={risk.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-700 hover:text-black transition-colors underline decoration-gray-300 underline-offset-4 whitespace-nowrap overflow-hidden text-ellipsis font-medium"
                >
                  {risk.title}
                </a>
              ) : (
                <span className="text-gray-900 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                  {risk.title}
                </span>
              )}

              {/* Verified Badge */}
              {risk.type === 'news' && hasNumerical && numericalRisks.some(n => risk.title.includes(n.title.split(':')[1]?.trim().split('(')[0] || '')) && (
                <CheckCircle2 style={{ flexShrink: 0 }} className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
        ))}

        <p className="mt-5 text-[11px] text-gray-400 font-bold border-t border-gray-100 pt-4">
          ※ インテリジェンス層：報道と実勢価格の乖離を 14日間 監視し、不確かな情報は自動排除されます
        </p>
      </div>
    </div>
  );
};

export default RiskAlertBanner;
