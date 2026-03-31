import React from 'react';
import { AlertTriangle, Info, ShieldAlert, Newspaper } from 'lucide-react';

interface RiskAlertBannerProps {
  risks: any;
}

const RiskAlertBanner: React.FC<RiskAlertBannerProps> = ({ risks }) => {
  if (!risks || !risks.activeRisks || risks.activeRisks.length === 0) return null;

  const highestLevel = risks.activeRisks.some((r: any) => r.level === 'CRITICAL') ? 'CRITICAL' :
                       risks.activeRisks.some((r: any) => r.level === 'HIGH') ? 'HIGH' : 'MODERATE';

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
      {/* Header Row: Forced Horizontal with Inline Styles */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}
        className="flex items-center gap-3"
      >
        <Icon 
          style={{ flexShrink: 0 }}
          className={`w-7 h-7 ${highestLevel === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`} 
        />
        <h3 
          style={{ margin: 0, padding: 0, fontSize: '18px', fontWeight: 'bold', lineHeight: '1.2' }}
          className={`${textColor}`}
        >
          {highestLevel === 'CRITICAL' ? '重大警告: 物価急騰リスク検知' : 
           highestLevel === 'HIGH' ? '警戒: 物価上昇の可能性' : '情報: 市場動向の変化'}
        </h3>
      </div>

      {/* Details Area */}
      <div className="pl-10 space-y-3">
        {risks.activeRisks.map((risk: any, i: number) => (
          <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
            <Newspaper className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
            <a 
              href={risk.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors underline decoration-gray-600 underline-offset-4 leading-normal"
            >
              {risk.title}
            </a>
          </div>
        ))}
        <p className="mt-4 text-[11px] text-gray-500 italic font-bold">
          ※ ニュース解析に基づき、自動で予測カーブを調整済み
        </p>
      </div>
    </div>
  );
};

export default RiskAlertBanner;
