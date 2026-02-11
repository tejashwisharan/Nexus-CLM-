import React, { useState } from 'react';
import { EntityProfile, ApplicationStatus, RiskLevel } from '../types';
import RiskBadge from '../components/RiskBadge';
import { UserCheck, UserX, Flag, FileText, AlertTriangle, Check, FileCheck, ChevronRight, ChevronLeft, Search, User, Briefcase, Shield, Globe } from 'lucide-react';

interface ReviewQueueProps {
  items: EntityProfile[];
  onReview: (id: string, action: 'approve' | 'reject' | 'waiver', reason?: string) => void;
}

const ReviewQueue: React.FC<ReviewQueueProps> = ({ items, onReview }) => {
  const pendingItems = items.filter(i => i.status === ApplicationStatus.REVIEW_REQUIRED);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [waiverReason, setWaiverReason] = useState<string>('');
  const [showWaiverInput, setShowWaiverInput] = useState<boolean>(false);

  const selectedEntity = items.find(i => i.id === selectedEntityId);

  // --- No Items View ---
  if (pendingItems.length === 0 && !selectedEntity) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserCheck className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">EDD Queue Empty</h2>
        <p className="text-slate-500 mt-2">No high-risk entities pending enhanced due diligence.</p>
      </div>
    );
  }

  // --- Detailed View ---
  if (selectedEntity) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <button 
          onClick={() => {
              setSelectedEntityId(null);
              setShowWaiverInput(false);
              setWaiverReason('');
          }}
          className="flex items-center text-slate-500 hover:text-slate-700 transition-colors font-medium mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to List
        </button>

        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
                <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">{selectedEntity.name}</h2>
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded border border-red-200 uppercase">
                        High Risk
                    </span>
                </div>
                <p className="text-slate-500 text-sm">{selectedEntity.type} • ID: {selectedEntity.id}</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
                <RiskBadge level={selectedEntity.riskLevel} score={selectedEntity.riskScore} />
                <p className="text-xs text-slate-400 mt-2">Submitted: {selectedEntity.createdAt.split('T')[0]}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Col 1 & 2: Main Info */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Entity Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                        <User className="w-4 h-4 mr-2 text-blue-500" /> Entity Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(selectedEntity.details).map(([key, value]) => (
                            <div key={key}>
                                <span className="block text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="font-medium text-slate-700">{value as string}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI & Screening */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                        <Briefcase className="w-4 h-4 mr-2 text-indigo-500" /> Intelligence & Screening
                    </h3>
                    
                    {selectedEntity.enrichedData && (
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                            <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2">AI Summary</h4>
                            <p className="text-sm text-indigo-900 leading-relaxed">{selectedEntity.enrichedData}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                        <div className={`p-3 rounded border text-center ${selectedEntity.screeningResult?.sanctionsHit ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                            <span className="text-xs text-slate-500 uppercase block mb-1">Sanctions</span>
                            <span className={`font-bold ${selectedEntity.screeningResult?.sanctionsHit ? 'text-red-700' : 'text-slate-700'}`}>
                                {selectedEntity.screeningResult?.sanctionsHit ? 'HIT' : 'CLEAR'}
                            </span>
                        </div>
                        <div className={`p-3 rounded border text-center ${selectedEntity.screeningResult?.pepStatus ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                            <span className="text-xs text-slate-500 uppercase block mb-1">PEP</span>
                            <span className={`font-bold ${selectedEntity.screeningResult?.pepStatus ? 'text-amber-700' : 'text-slate-700'}`}>
                                {selectedEntity.screeningResult?.pepStatus ? 'YES' : 'NO'}
                            </span>
                        </div>
                        <div className={`p-3 rounded border text-center ${selectedEntity.screeningResult?.adverseMediaFound ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                            <span className="text-xs text-slate-500 uppercase block mb-1">Media</span>
                            <span className={`font-bold ${selectedEntity.screeningResult?.adverseMediaFound ? 'text-red-700' : 'text-slate-700'}`}>
                                {selectedEntity.screeningResult?.adverseMediaFound ? 'ADVERSE' : 'CLEAN'}
                            </span>
                        </div>
                    </div>
                </div>

                 {/* Documents */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                        <FileCheck className="w-4 h-4 mr-2 text-emerald-500" /> Submitted Documentation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedEntity.documents.map((doc, i) => (
                        <div key={i} className="flex items-center p-3 bg-slate-50 rounded border border-slate-100 text-sm">
                            <div className="bg-emerald-100 p-1 rounded-full mr-3">
                                <Check className="w-3 h-3 text-emerald-600" />
                            </div>
                            <div>
                                <span className="text-slate-700 font-medium block">{doc.name}</span>
                                <span className="text-slate-500 text-xs">{doc.description}</span>
                            </div>
                        </div>
                        ))}
                        {selectedEntity.documents.length === 0 && <p className="text-slate-400 text-sm italic">No documents attached.</p>}
                    </div>
                 </div>

            </div>

            {/* Col 3: Risk Factors & Decision */}
            <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-amber-500" /> Risk Factors
                    </h3>
                    <div className="space-y-3">
                         {selectedEntity.riskFactors.map((factor, i) => (
                            <div key={i} className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase">{factor.category}</span>
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${factor.severity === RiskLevel.HIGH ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{factor.severity}</span>
                                </div>
                                <p className="text-sm text-slate-800">{factor.description}</p>
                            </div>
                         ))}
                         {selectedEntity.riskFactors.length === 0 && <p className="text-slate-400 text-sm italic">No specific risk factors flagged.</p>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 sticky top-6">
                    <h3 className="font-bold text-slate-800 mb-4">Analyst Decision</h3>
                    
                    {showWaiverInput ? (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 animate-fade-in">
                            <label className="text-xs font-bold text-amber-800 uppercase mb-2 block">Waiver Justification</label>
                            <textarea
                                className="w-full text-sm p-3 border border-amber-300 rounded-lg mb-3 h-32 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="Please provide a detailed reason for requesting a policy waiver..."
                                value={waiverReason}
                                onChange={(e) => setWaiverReason(e.target.value)}
                            />
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowWaiverInput(false)}
                                    className="flex-1 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if(waiverReason) {
                                            onReview(selectedEntity.id, 'waiver', waiverReason);
                                            setSelectedEntityId(null);
                                        }
                                    }}
                                    className="flex-1 bg-amber-600 text-white text-sm py-2 rounded-lg hover:bg-amber-700 font-bold shadow-sm"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                             <button
                                onClick={() => {
                                    onReview(selectedEntity.id, 'approve');
                                    setSelectedEntityId(null);
                                }}
                                className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm transition-all"
                            >
                                <UserCheck className="w-4 h-4" />
                                <span>Approve Entity</span>
                            </button>
                            
                            <button 
                                onClick={() => setShowWaiverInput(true)}
                                className="w-full flex items-center justify-center space-x-2 py-3 border border-amber-200 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 font-medium transition-all"
                            >
                                <Flag className="w-4 h-4" />
                                <span>Request Policy Waiver</span>
                            </button>

                            <button
                                onClick={() => {
                                    onReview(selectedEntity.id, 'reject');
                                    setSelectedEntityId(null);
                                }}
                                className="w-full flex items-center justify-center space-x-2 py-3 border border-red-200 text-red-600 bg-white rounded-lg hover:bg-red-50 font-medium transition-all"
                            >
                                <UserX className="w-4 h-4" />
                                <span>Reject Entity</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- Dashboard List View ---
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">EDD Queue</h2>
          <p className="text-slate-500">Enhanced Due Diligence required for <span className="font-bold text-slate-800">{pendingItems.length}</span> high-risk entities.</p>
        </div>
        <div className="bg-white px-4 py-2 border border-slate-200 rounded-lg flex items-center text-slate-400">
            <Search className="w-4 h-4 mr-2" />
            <span className="text-sm">Filter queue...</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4 font-semibold">Entity Name</th>
                    <th className="px-6 py-4 font-semibold">Risk Profile</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Submitted</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {pendingItems.map((entity) => (
                    <tr key={entity.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{entity.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{entity.id}</div>
                        </td>
                        <td className="px-6 py-4">
                            <RiskBadge level={entity.riskLevel} score={entity.riskScore} />
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                            {entity.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                            {entity.createdAt.split('T')[0]}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                onClick={() => setSelectedEntityId(entity.id)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-blue-600 text-sm font-medium rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
                            >
                                View Details <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewQueue;