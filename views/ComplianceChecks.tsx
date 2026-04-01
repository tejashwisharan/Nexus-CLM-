import React from 'react';
import { ShieldCheck } from 'lucide-react';

const ComplianceChecks: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Compliance Checks</h2>
      </div>
      
      <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">Compliance Rule Verification</h3>
        <p className="text-slate-500 max-w-md">
          Run automated compliance rules and verify regulatory requirements against client profiles.
        </p>
      </div>
    </div>
  );
};

export default ComplianceChecks;
