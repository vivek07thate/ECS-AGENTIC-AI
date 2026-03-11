import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normStatus = status?.toUpperCase() || 'NEEDS REVIEW';

  let colors = '';
  let Icon = null;
  let text = '';

  switch (normStatus) {
    case 'COMPLIANT':
      colors = 'bg-green-100 text-green-800 border-green-200';
      Icon = CheckCircle2;
      text = 'Compliant';
      break;
    case 'NON-COMPLIANT':
      colors = 'bg-red-100 text-red-800 border-red-200';
      Icon = XCircle;
      text = 'Non-Compliant';
      break;
    case 'REMEDIATED':
      colors = 'bg-teal-100 text-teal-800 border-teal-200';
      Icon = CheckCircle2;
      text = 'Remediated';
      break;
    case 'NEEDS REVIEW':
    default:
      colors = 'bg-amber-100 text-amber-800 border-amber-200';
      Icon = AlertCircle;
      text = 'Needs Review';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors}`}>
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}
