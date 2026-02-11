
import React, { useState } from 'react';
import { EntityProfile, ApplicationStatus } from '../types';
import RiskBadge from '../components/RiskBadge';
import { RefreshCw, Search, ChevronRight, ChevronLeft, AlertCircle, Calendar, Activity, CheckCircle, User, Briefcase, FileText, XCircle } from 'lucide-react';

interface PKYCQueueProps {
  items: EntityProfile[];
  onReview: (id: string, action: 'confirm' | 'retrigger' | 'reject') => void;
}

const PKYCQueue: React.FC<PKYCQueueProps> = ({ items, onReview }) => {
  const pkycItems = items.filter(i => i.status === ApplicationStatus.PERIODIC_REVIEW);
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
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to PKYC List
              </button>

              {/* Header */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                      <div className="flex items-center space-x-3 mb-2">
                          <h2 className="text-2xl font-bold text-slate-900">{selectedEntity.name}</h2>
                          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded border border-purple-200 uppercase flex items-center">
                              <RefreshCw className="w-3 h-3 mr-1" /> Periodic Review
                          </span>
                      </div>
                      <p className="text-slate-500 text-sm">{selectedEntity.type} • ID: {selectedEntity.id}</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                      <RiskBadge level={selectedEntity.riskLevel} score={selectedEntity.riskScore} />
                      <p className="text-xs text-slate-400 mt-2">Last Review: {selectedEntity.lastReviewDate?.split('T')[0] || 'N/A'}</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Triggers */}
                  <div className="lg:col-span-1 space-y-6">
                      <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 shadow-sm">
                          <h3 className="font-bold text-purple-900 mb-4 flex items-center">
                              <Activity className="w-4 h-4 mr-2" /> Review Trigger
                          </h3>
                          <div className="bg-white/80 p-4 rounded-lg border border-purple-100">
                             <p className="font-bold text-purple-800 text-sm mb-1">
                                 {selectedEntity.reviewTrigger?.includes("Scheduled") ? "Scheduled Maintenance" : "Monitoring Alert"}
                             </p>
                             <p className="text-slate-700 text-sm">{selectedEntity.reviewTrigger}</p>
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                              <Calendar className="w-4 h-4 mr-2 text-blue-500" /> Timeline
                          </h3>
                          <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pl-6 py-2">
                              <div className="relative">
                                  <div className="absolute -left-[31px] bg-emerald-500 w-3 h-3 rounded-full border-2 border-white"></div>
                                  <p className="text-xs text-slate-500">{new Date(selectedEntity.createdAt).toLocaleDateString()}</p>
                                  <p className="text-sm font-medium text-slate-800">Initial Onboarding</p>
                              </div>
                              <div className="relative">
                                  <div className="absolute -left-[31px] bg-slate-300 w-3 h-3 rounded-full border-2 border-white"></div>
                                  <p className="text-xs text-slate-500">{selectedEntity.lastReviewDate?.split('T')[0]}</p>
                                  <p className="text-sm font-medium text-slate-800">Previous Review</p>
                              </div>
                              <div className="relative">
                                  <div className="absolute -left-[31px] bg-purple-500 w-3 h-3 rounded-full border-2 border-white animate-pulse"></div>
                                  <p className="text-xs text-purple-600 font-bold">Today</p>
                                  <p className="text-sm font-bold text-slate-800">Review Required</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Entity Data & Action */}
                  <div className="lg:col-span-2 space-y-6">
                       {/* Changes / PII */}
                       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                              <User className="w-4 h-4 mr-2 text-slate-500" /> Current Profile Data
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

                      {/* Documents Status */}
                       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                              <FileText className="w-4 h-4 mr-2 text-slate-500" /> Document Status
                          </h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {selectedEntity.documents.map((doc, i) => (
                              <div key={i} className="flex items-center p-3 bg-slate-50 rounded border border-slate-100 text-sm">
                                  <div className="bg-emerald-100 p-1 rounded-full mr-3">
                                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  </div>
                                  <div>
                                      <span className="text-slate-700 font-medium block">{doc.name}</span>
                                      <span className="text-slate-500 text-xs">Valid & Verified</span>
                                  </div>
                              </div>
                              ))}
                          </div>
                      </div>

                      {/* Actions */}
                      <div className="bg-slate-900 p-6 rounded-xl text-white shadow-lg flex flex-col md:flex-row justify-between items-center sticky bottom-6">
                           <div className="mb-4 md:mb-0">
                               <h4 className="font-bold text-lg">Re-Onboarding Decision</h4>
                               <p className="text-slate-400 text-sm">Does the profile remain compliant given the trigger event?</p>
                           </div>
                           <div className="flex space-x-3 w-full md:w-auto">
                                <button
                                    onClick={() => {
                                        if (confirm("Are you sure you want to reject this KYC? This will mark the entity as Rejected.")) {
                                            onReview(selectedEntity.id, 'reject');
                                            setSelectedEntityId(null);
                                        }
                                    }}
                                    className="flex-1 md:flex-none px-4 py-2 border border-red-500 text-red-400 rounded-lg hover:bg-red-900/30 hover:border-red-400 font-medium transition-all text-sm flex items-center justify-center"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject KYC
                                </button>
                                <button
                                    onClick={() => {
                                        onReview(selectedEntity.id, 'retrigger');
                                        setSelectedEntityId(null);
                                    }}
                                    className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all text-sm flex items-center justify-center"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Re-trigger KYC
                                </button>
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
          <h2 className="text-2xl font-bold text-slate-800">PKYC (Periodic KYC)</h2>
          <p className="text-slate-500">Scheduled reviews and monitoring alerts for <span className="font-bold text-slate-800">{pkycItems.length}</span> entities.</p>
        </div>
        <div className="bg-white px-4 py-2 border border-slate-200 rounded-lg flex items-center text-slate-400">
            <Search className="w-4 h-4 mr-2" />
            <span className="text-sm">Filter...</span>
        </div>
      </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4 font-semibold">Entity Name</th>
                    <th className="px-6 py-4 font-semibold">Risk Profile</th>
                    <th className="px-6 py-4 font-semibold">Review Trigger</th>
                    <th className="px-6 py-4 font-semibold">Last Review</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {pkycItems.map((entity) => (
                    <tr key={entity.id} className="hover:bg-purple-50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{entity.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{entity.id} • {entity.type}</div>
                        </td>
                        <td className="px-6 py-4">
                            <RiskBadge level={entity.riskLevel} score={entity.riskScore} />
                        </td>
                        <td className="px-6 py-4">
                             <div className="flex items-center text-sm">
                                {entity.reviewTrigger && entity.reviewTrigger.includes('Scheduled') ? (
                                    <span className="flex items-center text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                                        <Calendar className="w-3 h-3 mr-1" /> Scheduled
                                    </span>
                                ) : (
                                    <span className="flex items-center text-purple-700 bg-purple-100 px-2 py-1 rounded text-xs font-medium">
                                        <Activity className="w-3 h-3 mr-1" /> Alert
                                    </span>
                                )}
                                <span className="ml-2 text-slate-500 text-xs truncate max-w-[150px]" title={entity.reviewTrigger}>
                                    {entity.reviewTrigger}
                                </span>
                             </div>
                        </td>
                         <td className="px-6 py-4 text-sm text-slate-500">
                            {entity.lastReviewDate?.split('T')[0] || 'Never'}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                onClick={() => setSelectedEntityId(entity.id)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-purple-700 text-sm font-medium rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all shadow-sm"
                            >
                                Review <ChevronRight className="w-4 h-4 ml-1" />
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

export default PKYCQueue;
