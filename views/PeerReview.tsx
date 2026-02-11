import React, { useState } from 'react';
import { EntityProfile, ApplicationStatus } from '../types';
import RiskBadge from '../components/RiskBadge';
import { Check, X, ChevronLeft, Briefcase, Shield, User, Globe, FileCheck } from 'lucide-react';

interface PeerReviewProps {
  items: EntityProfile[];
  onReview: (id: string, action: 'approve' | 'reject') => void;
}

const PeerReview: React.FC<PeerReviewProps> = ({ items, onReview }) => {
  const pendingItems = items.filter(i => i.status === ApplicationStatus.PEER_REVIEW);
  const [selectedEntity, setSelectedEntity] = useState<EntityProfile | null>(null);

  if (pendingItems.length === 0 && !selectedEntity) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">No Pending Reviews</h2>
        <p className="text-slate-500 mt-2">All low-risk entities have been processed.</p>
      </div>
    );
  }

  // --- Detailed View for Decision Making ---
  if (selectedEntity) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <button 
          onClick={() => setSelectedEntity(null)}
          className="flex items-center text-slate-500 hover:text-slate-700 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Queue
        </button>

        {/* Header Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">{selectedEntity.name}</h2>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase tracking-wide">
                {selectedEntity.type}
              </span>
            </div>
            <p className="text-slate-500 text-sm">ID: {selectedEntity.id} • Submitted: {new Date(selectedEntity.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="mt-4 md:mt-0">
             <RiskBadge level={selectedEntity.riskLevel} score={selectedEntity.riskScore} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Column 1: Entity Data */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                <User className="w-4 h-4 mr-2 text-blue-500" /> Entity Details
                </h3>
                <div className="space-y-4 text-sm">
                {Object.entries(selectedEntity.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center group">
                    <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-slate-900 font-medium text-right max-w-[60%]">{value as string}</span>
                    </div>
                ))}
                </div>
            </div>

            {/* NEW: Documents Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                <FileCheck className="w-4 h-4 mr-2 text-emerald-500" /> Submitted Documentation
                </h3>
                <ul className="space-y-3">
                {selectedEntity.documents.length > 0 ? (
                    selectedEntity.documents.map((doc, idx) => (
                        <li key={idx} className="flex items-start text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                            <Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-medium block">{doc.name}</span>
                                <span className="text-xs text-slate-500">{doc.description}</span>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="text-slate-400 italic text-sm">No documents found.</li>
                )}
                </ul>
            </div>
          </div>

          {/* Column 2: Risk & Intelligence */}
          <div className="space-y-6">
             {/* AI Summary */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                  <Briefcase className="w-4 h-4 mr-2 text-indigo-500" /> AI Analysis
                </h3>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-indigo-900 text-sm leading-relaxed">
                   {selectedEntity.enrichedData || "No AI summary available for this entity."}
                </div>
             </div>

             {/* Risk Factors */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                   <Shield className="w-4 h-4 mr-2 text-amber-500" /> Risk Assessment
                </h3>
                {selectedEntity.riskFactors.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedEntity.riskFactors.map((factor, idx) => (
                      <li key={idx} className="flex justify-between items-start text-sm bg-slate-50 p-3 rounded-lg">
                         <span className="text-slate-700 w-3/4">{factor.description}</span>
                         <span className="text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded border border-amber-100">{factor.severity}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 text-sm italic">No specific risk flags identified by the engine.</p>
                )}
             </div>
          </div>
        </div>

        {/* Screening Results Area */}
        {selectedEntity.screeningResult && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
               <Globe className="w-4 h-4 mr-2 text-emerald-500" /> Screening Status
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border flex flex-col items-center justify-center text-center ${selectedEntity.screeningResult.sanctionsHit ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                   <span className={`text-xs font-bold uppercase mb-1 ${selectedEntity.screeningResult.sanctionsHit ? 'text-red-600' : 'text-emerald-600'}`}>Sanctions</span>
                   <span className={`text-lg font-bold ${selectedEntity.screeningResult.sanctionsHit ? 'text-red-800' : 'text-emerald-800'}`}>
                       {selectedEntity.screeningResult.sanctionsHit ? 'DETECTED' : 'CLEARED'}
                   </span>
                </div>
                <div className={`p-4 rounded-lg border flex flex-col items-center justify-center text-center ${selectedEntity.screeningResult.pepStatus ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                   <span className={`text-xs font-bold uppercase mb-1 ${selectedEntity.screeningResult.pepStatus ? 'text-amber-600' : 'text-emerald-600'}`}>PEP List</span>
                   <span className={`text-lg font-bold ${selectedEntity.screeningResult.pepStatus ? 'text-amber-800' : 'text-emerald-800'}`}>
                       {selectedEntity.screeningResult.pepStatus ? 'MATCH' : 'NO MATCH'}
                   </span>
                </div>
                <div className={`p-4 rounded-lg border flex flex-col items-center justify-center text-center ${selectedEntity.screeningResult.adverseMediaFound ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                   <span className={`text-xs font-bold uppercase mb-1 ${selectedEntity.screeningResult.adverseMediaFound ? 'text-red-600' : 'text-emerald-600'}`}>Adverse Media</span>
                   <span className={`text-lg font-bold ${selectedEntity.screeningResult.adverseMediaFound ? 'text-red-800' : 'text-emerald-800'}`}>
                       {selectedEntity.screeningResult.adverseMediaFound ? 'FOUND' : 'NONE'}
                   </span>
                </div>
             </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-slate-900 p-6 rounded-xl text-white flex flex-col md:flex-row justify-between items-center shadow-lg sticky bottom-6">
           <div className="mb-4 md:mb-0">
             <h4 className="font-bold text-lg">Final Decision Required</h4>
             <p className="text-slate-400 text-sm">Please review all entity data before finalizing the onboarding process.</p>
           </div>
           <div className="flex space-x-4 w-full md:w-auto">
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to reject this entity?')) {
                    onReview(selectedEntity.id, 'reject');
                    setSelectedEntity(null);
                  }
                }}
                className="flex-1 md:flex-none px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors font-medium"
              >
                Reject Application
              </button>
              <button 
                onClick={() => {
                  onReview(selectedEntity.id, 'approve');
                  setSelectedEntity(null);
                }}
                className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center"
              >
                <Check className="w-5 h-5 mr-2" /> Approve & Onboard
              </button>
           </div>
        </div>
      </div>
    );
  }

  // --- List View (Default) ---
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Peer Review Queue</h2>
          <p className="text-slate-500">Final sanity check for {pendingItems.length} low-to-medium risk entities.</p>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
          <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <tr>
                      <th className="px-6 py-4 font-semibold">Entity Name</th>
                      <th className="px-6 py-4 font-semibold">Type</th>
                      <th className="px-6 py-4 font-semibold">Risk Level</th>
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold text-right">Review</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {pendingItems.map((entity) => (
                      <tr 
                        key={entity.id} 
                        className="hover:bg-blue-50 transition-colors cursor-pointer group"
                        onClick={() => setSelectedEntity(entity)}
                      >
                          <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 group-hover:text-blue-700">{entity.name}</div>
                              <div className="text-xs text-slate-400">{entity.id}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{entity.type}</td>
                          <td className="px-6 py-4">
                              <RiskBadge level={entity.riskLevel} score={entity.riskScore} />
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                              {entity.details.product || 'Standard Account'}
                          </td>
                          <td className="px-6 py-4">
                              <div className="flex justify-end">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEntity(entity);
                                    }}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-white hover:text-blue-600 hover:border-blue-300 flex items-center transition-all shadow-sm"
                                  >
                                      View Details <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
                                  </button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};

export default PeerReview;