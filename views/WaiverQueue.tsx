import React, { useState } from 'react';
import { EntityProfile, ApplicationStatus, RiskLevel } from '../types';
import RiskBadge from '../components/RiskBadge';
import { Flag, CheckCircle, XCircle, BrainCircuit, FileText, Check, ChevronLeft, ChevronRight, Search, FileCheck, User, Shield } from 'lucide-react';

interface WaiverQueueProps {
  items: EntityProfile[];
  onDecision: (id: string, approved: boolean) => void;
}

const WaiverQueue: React.FC<WaiverQueueProps> = ({ items, onDecision }) => {
  const waiverItems = items.filter(i => i.status === ApplicationStatus.WAIVER_REQUESTED);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const selectedEntity = items.find(i => i.id === selectedEntityId);

  // --- No Items View ---
  if (waiverItems.length === 0 && !selectedEntity) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Flag className="w-12 h-12 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">No Policy Waivers</h2>
        <p className="text-slate-500 mt-2">There are no entities currently requesting policy exceptions.</p>
      </div>
    );
  }

  // --- Detail View ---
  if (selectedEntity) {
      return (
        <div className="max-w-6xl mx-auto space-y-6">
            <button 
                onClick={() => setSelectedEntityId(null)}
                className="flex items-center text-slate-500 hover:text-slate-700 transition-colors font-medium mb-4"
            >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to List
            </button>

            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-slate-900">{selectedEntity.name}</h2>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded border border-amber-200 uppercase flex items-center">
                            <Flag className="w-3 h-3 mr-1" /> Waiver Requested
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
                {/* Left Column: Entity Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
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

                    {/* Documentation */}
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

                {/* Right Column: Assessment & Action */}
                <div className="space-y-6">
                    {/* Waiver Reason */}
                    <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm">
                        <h3 className="font-bold text-amber-900 mb-3 flex items-center">
                            <Flag className="w-4 h-4 mr-2" /> Waiver Justification
                        </h3>
                        <p className="text-sm text-amber-900 italic leading-relaxed bg-white/50 p-3 rounded-lg border border-amber-100">
                            "{selectedEntity.waiverReason || 'No specific reason provided.'}"
                        </p>
                    </div>

                    {/* AI Summary */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                         <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                            <BrainCircuit className="w-4 h-4 mr-2 text-indigo-500" /> AI Case Analysis
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {selectedEntity.enrichedData || "Standard risk profile detected."}
                        </p>
                    </div>

                    {/* Risk Factors */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-slate-100">
                            <Shield className="w-4 h-4 mr-2 text-amber-500" /> Risk Factors
                        </h3>
                        <div className="space-y-2">
                            {selectedEntity.riskFactors.length > 0 ? selectedEntity.riskFactors.map((factor, i) => (
                                <div key={i} className="flex justify-between items-start text-xs bg-slate-50 p-2 rounded">
                                    <span className="text-slate-700 w-3/4">{factor.description}</span>
                                    <span className={`font-bold ${factor.severity === RiskLevel.HIGH ? 'text-red-600' : 'text-amber-600'}`}>{factor.severity}</span>
                                </div>
                            )) : <span className="text-slate-400 text-xs italic">No major risks flagged.</span>}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-slate-900 p-6 rounded-xl text-white shadow-lg sticky top-6">
                        <h4 className="font-bold mb-4">Waiver Decision</h4>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    onDecision(selectedEntity.id, true);
                                    setSelectedEntityId(null);
                                }}
                                className="w-full flex items-center justify-center space-x-2 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-bold shadow-md transition-all"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>Grant Waiver & Approve</span>
                            </button>
                            <button
                                onClick={() => {
                                    if(confirm('Rejecting the waiver will reject the entire application. Continue?')) {
                                        onDecision(selectedEntity.id, false);
                                        setSelectedEntityId(null);
                                    }
                                }}
                                className="w-full flex items-center justify-center space-x-2 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white font-medium transition-all"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Deny Waiver (Reject)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- List View ---
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Waiver Assessment</h2>
          <p className="text-slate-500">Review policy exception requests for <span className="font-bold text-slate-800">{waiverItems.length}</span> entities.</p>
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
                    <th className="px-6 py-4 font-semibold">Waiver Justification</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {waiverItems.map((entity) => (
                    <tr key={entity.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{entity.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{entity.id} • {entity.type}</div>
                        </td>
                        <td className="px-6 py-4">
                            <RiskBadge level={entity.riskLevel} score={entity.riskScore} />
                        </td>
                        <td className="px-6 py-4 max-w-md">
                            <div className="flex items-start text-sm text-amber-800 bg-amber-50 p-2 rounded border border-amber-100">
                                <Flag className="w-3 h-3 mr-2 mt-1 flex-shrink-0" />
                                <span className="line-clamp-2" title={entity.waiverReason}>
                                    {entity.waiverReason || "Reason not provided"}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                onClick={() => setSelectedEntityId(entity.id)}
                                className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-blue-600 text-sm font-medium rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
                            >
                                Assess <ChevronRight className="w-4 h-4 ml-1" />
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

export default WaiverQueue;