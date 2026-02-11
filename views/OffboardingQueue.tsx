import React, { useState } from 'react';
import { EntityProfile, ApplicationStatus } from '../types';
import RiskBadge from '../components/RiskBadge';
import { UserMinus, Search, ChevronRight, ChevronLeft, LogOut, FileWarning, Archive, CheckCircle, User, Activity } from 'lucide-react';

interface OffboardingQueueProps {
  items: EntityProfile[];
  onConfirm: (id: string) => void;
}

const OffboardingQueue: React.FC<OffboardingQueueProps> = ({ items, onConfirm }) => {
  const offboardingItems = items.filter(i => i.status === ApplicationStatus.OFFBOARDING_REQUESTED);
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
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Exit Queue
              </button>

              {/* Header */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                      <div className="flex items-center space-x-3 mb-2">
                          <h2 className="text-2xl font-bold text-slate-900">{selectedEntity.name}</h2>
                          <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded border border-orange-200 uppercase flex items-center">
                              <LogOut className="w-3 h-3 mr-1" /> Exit Requested
                          </span>
                      </div>
                      <p className="text-slate-500 text-sm">{selectedEntity.type} • ID: {selectedEntity.id}</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                      <RiskBadge level={selectedEntity.riskLevel} score={selectedEntity.riskScore} />
                      <p className="text-xs text-slate-400 mt-2">Request Date: {selectedEntity.createdAt.split('T')[0]}</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Reason */}
                  <div className="lg:col-span-1 space-y-6">
                      <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 shadow-sm">
                          <h3 className="font-bold text-orange-900 mb-4 flex items-center">
                              <FileWarning className="w-4 h-4 mr-2" /> Reason for Exit
                          </h3>
                          <div className="bg-white/80 p-4 rounded-lg border border-orange-100">
                             <p className="text-slate-800 text-sm font-medium leading-relaxed">
                                 "{selectedEntity.offboardingReason}"
                             </p>
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                              <Archive className="w-4 h-4 mr-2 text-slate-500" /> Account Status
                          </h3>
                          <ul className="space-y-3">
                              <li className="flex justify-between items-center text-sm">
                                  <span className="text-slate-500">Account Balance</span>
                                  <span className="font-mono font-medium text-slate-800">$0.00</span>
                              </li>
                              <li className="flex justify-between items-center text-sm">
                                  <span className="text-slate-500">Pending Transactions</span>
                                  <span className="font-mono font-medium text-slate-800">0</span>
                              </li>
                              <li className="flex justify-between items-center text-sm">
                                  <span className="text-slate-500">Legal Holds</span>
                                  <span className="font-bold text-emerald-600">None</span>
                              </li>
                          </ul>
                      </div>
                  </div>

                  {/* Right Column: Entity Data & Action */}
                  <div className="lg:col-span-2 space-y-6">
                       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                              <User className="w-4 h-4 mr-2 text-slate-500" /> Client Profile
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

                      {/* Actions */}
                      <div className="bg-slate-900 p-6 rounded-xl text-white shadow-lg flex flex-col md:flex-row justify-between items-center sticky bottom-6">
                           <div className="mb-4 md:mb-0">
                               <h4 className="font-bold text-lg">Confirm Off-boarding</h4>
                               <p className="text-slate-400 text-sm">This action will close the account and archive the profile.</p>
                           </div>
                           <div className="flex space-x-3 w-full md:w-auto">
                                <button
                                    onClick={() => {
                                        if(confirm("Confirm closure of this account? This action is irreversible.")) {
                                            onConfirm(selectedEntity.id);
                                            setSelectedEntityId(null);
                                        }
                                    }}
                                    className="flex-1 md:flex-none px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold shadow-md transition-all text-sm flex items-center justify-center"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Finalize Exit
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
          <h2 className="text-2xl font-bold text-slate-800">Off-boarding Requests</h2>
          <p className="text-slate-500">Clients requesting account closure or exit for <span className="font-bold text-slate-800">{offboardingItems.length}</span> entities.</p>
        </div>
        <div className="bg-white px-4 py-2 border border-slate-200 rounded-lg flex items-center text-slate-400">
            <Search className="w-4 h-4 mr-2" />
            <span className="text-sm">Filter requests...</span>
        </div>
      </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4 font-semibold">Entity Name</th>
                    <th className="px-6 py-4 font-semibold">Risk Profile</th>
                    <th className="px-6 py-4 font-semibold">Exit Reason</th>
                    <th className="px-6 py-4 font-semibold">Request Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {offboardingItems.map((entity) => (
                    <tr key={entity.id} className="hover:bg-orange-50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{entity.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{entity.id} • {entity.type}</div>
                        </td>
                        <td className="px-6 py-4">
                            <RiskBadge level={entity.riskLevel} score={entity.riskScore} />
                        </td>
                        <td className="px-6 py-4">
                             <div className="flex items-center text-sm text-slate-700 bg-slate-50 px-2 py-1 rounded w-fit border border-slate-200">
                                <LogOut className="w-3 h-3 mr-2 text-orange-500" />
                                <span className="truncate max-w-[200px]" title={entity.offboardingReason}>
                                    {entity.offboardingReason || 'Client Request'}
                                </span>
                             </div>
                        </td>
                         <td className="px-6 py-4 text-sm text-slate-500">
                            {entity.createdAt.split('T')[0]}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                onClick={() => setSelectedEntityId(entity.id)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-orange-700 text-sm font-medium rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all shadow-sm"
                            >
                                Process Exit <ChevronRight className="w-4 h-4 ml-1" />
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

export default OffboardingQueue;