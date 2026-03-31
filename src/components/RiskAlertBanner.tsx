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

  const bgColor = highestLevel === 'CRITICAL' ? 'bg-red-500/20 border-red-500/50' :
                  highestLevel === 'HIGH' ? 'bg-orange-500/20 border-orange-500/50' :
                  'bg-blue-500/20 border-blue-500/50';

  const textColor = highestLevel === 'CRITICAL' ? 'text-red-200' :
                    highestLevel === 'HIGH' ? 'text-orange-200' :
                    'text-blue-200';

  const Icon = highestLevel === 'CRITICAL' ? ShieldAlert :
               highestLevel === 'HIGH' ? AlertTriangle : Info;

  return (
    <div className={`mb-6 p-4 rounded-xl border ${bgColor} backdrop-blur-md animate-pulse-subtle`}>
      {/* Header Row: Forced Horizontal */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}
      >
        <Icon 
          style={{ flexShrink: 0 }}
          className={`w-7 h-7 ${highestLevel === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`} 
        />
        <h3 
          className={`text-lg font-bold ${textColor}`}
          style={{ margin: 0, padding: 0, lineHeight: '1.2' }}
        >
          {highestLevel === 'CRITICAL' ? '物価急騰リスク検知' : 
           highestLevel === 'HIGH' ? '物価上昇の可能性' : '市場動向の変化'}
        </h3>
      </div>

      {/* Details Area: Strictly Horizontal Rows */}
      <div className="pl-10 space-y-2">
        {combinedRisks.slice(0, 6).map((risk: any, i: number) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            {risk.type === 'data' ? (
              <TrendingUp className="w-5 h-5 text-red-400 flex-shrink-0" />
            ) : (
              <Newspaper className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            
            <div className="flex items-center gap-2 overflow-hidden">
              {risk.type === 'news' ? (
                <a 
                  href={risk.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-white transition-colors underline decoration-gray-600 underline-offset-4 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {risk.title}
                </a>
              ) : (
                <span className="text-white font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                  {risk.title}
                </span>
              )}

              {/* 数値で裏取りされたニュースには小さなバッジを表示 */}
              {risk.type === 'news' && hasNumerical && numericalRisks.some(n => risk.title.includes(n.title.split(':')[1]?.trim().split('(')[0] || '')) && (
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" title="データ裏取り済" />
              )}
            </div>
          </div>
        ))}

        <p className="mt-4 text-[11px] text-gray-500 italic font-bold">
          ※ インテリジェンス層：報道と実勢価格の乖離を 14日間 監視し、不確かな情報は自動排除されます
        </p>
      </div>
    </div>
  );
};

export default RiskAlertBanner;
