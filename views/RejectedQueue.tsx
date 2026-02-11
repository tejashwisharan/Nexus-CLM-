import React, { useState } from 'react';
import { EntityProfile, ApplicationStatus } from '../types';
import RiskBadge from '../components/RiskBadge';
import { Ban, Search, ChevronRight, ChevronLeft, FileWarning, Shield, XCircle, User, Activity } from 'lucide-react';

interface RejectedQueueProps {
  items: EntityProfile[];
}

const RejectedQueue: React.FC<RejectedQueueProps> = ({ items }) => {
  const rejectedItems = items.filter(i => i.status === ApplicationStatus.REJECTED);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const selectedEntity = items.find(i => i.id === selectedEntityId);

  // --- Detail View ---
  if (selectedEntity) {
      return (
          <div className="max-w-6xl mx-auto space-y-6">
              <button 
                  onClick={() => setSelectedEntityId(null)}
                  className="flex items-center text-slate-500 hover:text-slate-700 transition-colors font-medium mb-4"
              >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Rejected List
              </button>

              {/* Header */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                      <div className="flex items-center space-x-3 mb-2">
                          <h2 className="text-2xl font-bold text-slate-900">{selectedEntity.name}</h2>
                          <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded border border-red-200 uppercase flex items-center">
                              <Ban className="w-3 h-3 mr-1" /> Application Rejected
                          </span>
                      </div>
                      <p className="text-slate-500 text-sm">{selectedEntity.type} • ID: {selectedEntity.id}</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                      <RiskBadge level={selectedEntity.riskLevel} score={selectedEntity.riskScore} />
                      <p className="text-xs text-slate-400 mt-2">Processed: {selectedEntity.createdAt.split('T')[0]}</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Rejection Context */}
                  <div className="lg:col-span-1 space-y-6">
                      <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm">
                          <h3 className="font-bold text-red-900 mb-4 flex items-center">
                              <XCircle className="w-4 h-4 mr-2" /> Rejection Summary
                          </h3>
                          <div className="bg-white/80 p-4 rounded-lg border border-red-100 space-y-3">
                             <div>
                                 <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Status</span>
                                 <p className="font-bold text-slate-800">Declined by Analyst</p>
                             </div>
                             {selectedEntity.waiverReason && (
                                 <div>
                                    <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Waiver Attempt</span>
                                    <p className="text-sm text-slate-700 italic">"{selectedEntity.waiverReason}"</p>
                                    <p className="text-xs text-red-600 mt-1 font-bold">Waiver Denied</p>
                                 </div>
                             )}
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                              <Shield className="w-4 h-4 mr-2 text-slate-500" /> Risk Factors
                          </h3>
                          <div className="space-y-3">
                              {selectedEntity.riskFactors.length > 0 ? selectedEntity.riskFactors.map((factor, i) => (
                                  <div key={i} className="flex justify-between items-start text-sm bg-slate-50 p-2 rounded">
                                      <span className="text-slate-700 w-3/4">{factor.description}</span>
                                      <span className="font-bold text-red-600 text-xs">{factor.severity}</span>
                                  </div>
                              )) : <p className="text-slate-400 text-xs italic">No specific risk flags recorded.</p>}
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Entity Data */}
                  <div className="lg:col-span-2 space-y-6">
                       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                              <User className="w-4 h-4 mr-2 text-slate-500" /> Entity Profile
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

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                              <Activity className="w-4 h-4 mr-2 text-slate-500" /> Screening Data
                          </h3>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
              </div>
          </div>
      )
  }

  // --- List View ---
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Rejected</h2>
          <p className="text-slate-500">History of <span className="font-bold text-red-600">{rejectedItems.length}</span> declined entities.</p>
        </div>
        <div className="bg-white px-4 py-2 border border-slate-200 rounded-lg flex items-center text-slate-400">
            <Search className="w-4 h-4 mr-2" />
            <span className="text-sm">Filter list...</span>
        </div>
      </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4 font-semibold">Entity Name</th>
                    <th className="px-6 py-4 font-semibold">Risk Profile</th>
                    <th className="px-6 py-4 font-semibold">Reason / Factors</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {rejectedItems.map((entity) => (
                    <tr key={entity.id} className="hover:bg-red-50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{entity.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{entity.id} • {entity.type}</div>
                        </td>
                        <td className="px-6 py-4">
                            <RiskBadge level={entity.riskLevel} score={entity.riskScore} />
                        </td>
                        <td className="px-6 py-4">
                             {entity.waiverReason ? (
                                 <span className="text-xs text-slate-600 italic">Waiver Declined</span>
                             ) : entity.riskFactors.length > 0 ? (
                                 <span className="text-xs text-slate-600">{entity.riskFactors[0].category} Issues</span>
                             ) : (
                                 <span className="text-xs text-slate-400">General Policy Decline</span>
                             )}
                        </td>
                         <td className="px-6 py-4 text-sm text-slate-500">
                            {entity.createdAt.split('T')[0]}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                onClick={() => setSelectedEntityId(entity.id)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-red-700 text-sm font-medium rounded-lg hover:border-red-300 hover:bg-red-50 transition-all shadow-sm"
                            >
                                Details <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {rejectedItems.length === 0 && (
            <div className="text-center py-12">
                <p className="text-slate-400 italic">No rejected applications found.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default RejectedQueue;