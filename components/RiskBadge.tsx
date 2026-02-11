import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showIcon?: boolean;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showIcon = true }) => {
  const getStyles = () => {
    switch (level) {
      case RiskLevel.LOW:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case RiskLevel.MEDIUM:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case RiskLevel.HIGH:
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getIcon = () => {
    switch (level) {
      case RiskLevel.LOW:
        return <CheckCircle className="w-4 h-4 mr-1.5" />;
      case RiskLevel.MEDIUM:
        return <ShieldAlert className="w-4 h-4 mr-1.5" />;
      case RiskLevel.HIGH:
        return <AlertTriangle className="w-4 h-4 mr-1.5" />;
      default:
        return null;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${getStyles()}`}>
      {showIcon && getIcon()}
      {level} {score !== undefined && `(${score})`}
    </span>
  );
};

export default RiskBadge;
