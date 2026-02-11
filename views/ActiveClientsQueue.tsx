import React, { useState } from 'react';
import { EntityProfile, ApplicationStatus } from '../types';
import RiskBadge from '../components/RiskBadge';
import { CheckCircle, ChevronLeft, ChevronRight, Search, User, FileCheck, ShieldCheck, Bot, UserCheck, Briefcase } from 'lucide-react';

interface ActiveClientsQueueProps {
  items: EntityProfile[];
}

const ActiveClientsQueue: React.FC<ActiveClientsQueueProps> = ({ items }) => {
  const activeItems = items.filter(i => i.status === ApplicationStatus.APPROVED);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const selectedEntity = items.find(i => i.id === selectedEntityId);

  // Detail View
  if (selectedEntity) {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <button 
                onClick={() => setSelectedEntityId(null)}
                className="flex items-center text-slate-500 hover:text-slate-700 transition-colors font-medium mb-4"
            >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Client List
            </button>

            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-slate-900">{selectedEntity.name}</h2>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded border border-emerald-200 uppercase flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" /> Active Client
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm">{selectedEntity.type} • ID: {selectedEntity.id}</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <RiskBadge level={selectedEntity.riskLevel} score={selectedEntity.riskScore} />
                    <p className="text-xs text-slate-400 mt-2">Onboarded: {selectedEntity.createdAt.split('T')[0]}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                            <User className="w-4 h-4 mr-2 text-blue-500" /> Entity Details
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
                            <FileCheck className="w-4 h-4 mr-2 text-emerald-500" /> Documentation
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {selectedEntity.documents.map((doc, i) => (
                            <div key={i} className="flex items-center p-3 bg-slate-50 rounded border border-slate-100 text-sm">
                                <div className="bg-emerald-100 p-1 rounded-full mr-3">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                </div>
                                <div>
                                    <span className="text-slate-700 font-medium block">{doc.name}</span>
                                    <span className="text-slate-500 text-xs">{doc.description}</span>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                            <ShieldCheck className="w-4 h-4 mr-2 text-indigo-500" /> Compliance Audit
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm bg-white p-3 rounded border border-slate-200">
                                <span className="text-slate-600">Approved By</span>
                                <span className={`font-bold flex items-center ${selectedEntity.approvedBy === 'AI' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    {selectedEntity.approvedBy === 'AI' ? <Bot className="w-4 h-4 mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                                    {selectedEntity.approvedBy === 'AI' ? 'AI Agent' : 'Risk Analyst'}
                                </span>
                            </div>
                             <div className="flex justify-between items-center text-sm bg-white p-3 rounded border border-slate-200">
                                <span className="text-slate-600">Screening Status</span>
                                <span className="font-bold text-emerald-600">CLEAN</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                           <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                              <Briefcase className="w-4 h-4 mr-2 text-slate-500" /> Business Profile
                          </h3>
                          <p className="text-sm text-slate-600 leading-relaxed">
                              {selectedEntity.enrichedData || "No additional data available."}
                          </p>
                      </div>
                </div>
            </div>
        </div>
    );
  }

  // List View
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Active Client Portfolio</h2>
          <p className="text-slate-500">
             Total <span className="font-bold text-emerald-600">{activeItems.length}</span> active entities (AI & Analyst Approved).
          </p>
        </div>
        <div className="bg-white px-4 py-2 border border-slate-200 rounded-lg flex items-center text-slate-400">
            <Search className="w-4 h-4 mr-2" />
            <span className="text-sm">Filter clients...</span>
        </div>
      </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4 font-semibold">Entity Name</th>
                    <th className="px-6 py-4 font-semibold">Risk Profile</th>
                    <th className="px-6 py-4 font-semibold">Approved By</th>
                    <th className="px-6 py-4 font-semibold">Onboarded Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {activeItems.map((entity) => (
                    <tr key={entity.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{entity.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{entity.id} • {entity.type}</div>
                        </td>
                        <td className="px-6 py-4">
                            <RiskBadge level={entity.riskLevel} score={entity.riskScore} />
                        </td>
                        <td className="px-6 py-4">
                             {entity.approvedBy === 'AI' ? (
                                <div className="flex items-center text-emerald-700 text-sm font-medium bg-emerald-50 w-fit px-2 py-1 rounded border border-emerald-100">
                                    <Bot className="w-3 h-3 mr-1.5" />
                                    AI Agent
                                </div>
                             ) : (
                                <div className="flex items-center text-blue-700 text-sm font-medium bg-blue-50 w-fit px-2 py-1 rounded border border-blue-100">
                                    <UserCheck className="w-3 h-3 mr-1.5" />
                                    Analyst
                                </div>
                             )}
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

export default ActiveClientsQueue;