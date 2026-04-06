import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Plus, Save, UploadCloud, AlertCircle, CheckCircle, ChevronDown, Trash2, FileText } from 'lucide-react';

interface FieldDef {
  id: string;
  name: string;
  type: 'text' | 'dropdown' | 'date';
  options?: string[];
}

interface DocumentTrigger {
  id: string;
  documentName: string;
  conditionField: string;
  conditionValue: string;
}

const INITIAL_FIELDS: FieldDef[] = [
  { id: 'f1', name: 'Entity Type', type: 'dropdown', options: ['Individual', 'Company', 'Trust'] },
  { id: 'f2', name: 'Country of Incorporation', type: 'dropdown', options: ['USA', 'UK', 'Singapore', 'Cayman Islands'] },
  { id: 'f3', name: 'Registration Number', type: 'text' },
];

const INITIAL_TRIGGERS: DocumentTrigger[] = [
  { id: 't1', documentName: 'Trust Deed', conditionField: 'Entity Type', conditionValue: 'Trust' },
  { id: 't2', documentName: 'Certificate of Incorporation', conditionField: 'Entity Type', conditionValue: 'Company' },
];

const ConfigurationEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fields' | 'documents' | 'deployment'>('fields');
  
  const [fields, setFields] = useState<FieldDef[]>(INITIAL_FIELDS);
  const [triggers, setTriggers] = useState<DocumentTrigger[]>(INITIAL_TRIGGERS);

  // Field editing state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [newOption, setNewOption] = useState('');

  // New field state
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState<Partial<FieldDef>>({ type: 'text' });

  // New trigger state
  const [isAddingTrigger, setIsAddingTrigger] = useState(false);
  const [newTrigger, setNewTrigger] = useState<Partial<DocumentTrigger>>({});

  // Deployment state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  const handleAddField = () => {
    if (newField.name && newField.type) {
      setFields([...fields, { 
        id: `f${Date.now()}`, 
        name: newField.name, 
        type: newField.type, 
        options: newField.type === 'dropdown' ? [] : undefined 
      } as FieldDef]);
      setIsAddingField(false);
      setNewField({ type: 'text' });
    }
  };

  const handleAddOption = (fieldId: string) => {
    if (!newOption.trim()) return;
    setFields(fields.map(f => {
      if (f.id === fieldId && f.type === 'dropdown') {
        return { ...f, options: [...(f.options || []), newOption.trim()] };
      }
      return f;
    }));
    setNewOption('');
  };

  const handleAddTrigger = () => {
    if (newTrigger.documentName && newTrigger.conditionField && newTrigger.conditionValue) {
      setTriggers([...triggers, {
        id: `t${Date.now()}`,
        documentName: newTrigger.documentName,
        conditionField: newTrigger.conditionField,
        conditionValue: newTrigger.conditionValue
      } as DocumentTrigger]);
      setIsAddingTrigger(false);
      setNewTrigger({});
    }
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccess(true);
      setTimeout(() => setDeploySuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-600" />
            Configuration Editor Portal
          </h1>
          <p className="text-slate-500 mt-1">Manage fields, document triggers, and deploy changes to production.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          <AlertCircle className="w-4 h-4" />
          <span>Sandbox Environment</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('fields')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'fields' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Data Fields
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Document Logic
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'deployment' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Deployment
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'fields' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate-800">Application Fields</h2>
                <button 
                  onClick={() => setIsAddingField(true)}
                  className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add New Field
                </button>
              </div>

              {isAddingField && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex items-end space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Field Name</label>
                    <input 
                      type="text" 
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Industry Sector"
                      value={newField.name || ''}
                      onChange={e => setNewField({...newField, name: e.target.value})}
                    />
                  </div>
                  <div className="w-48">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Field Type</label>
                    <select 
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newField.type}
                      onChange={e => setNewField({...newField, type: e.target.value as any})}
                    >
                      <option value="text">Text Input</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="date">Date Picker</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={handleAddField} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Save</button>
                    <button onClick={() => setIsAddingField(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {fields.map(field => (
                  <div key={field.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-slate-800">{field.name}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{field.type}</p>
                      </div>
                      
                      {field.type === 'dropdown' && (
                        <button 
                          onClick={() => setEditingFieldId(editingFieldId === field.id ? null : field.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {editingFieldId === field.id ? 'Close' : 'Manage Options'}
                        </button>
                      )}
                    </div>

                    {field.type === 'dropdown' && editingFieldId === field.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {field.options?.map((opt, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              {opt}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="text" 
                            className="flex-1 border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="New dropdown value..."
                            value={newOption}
                            onChange={e => setNewOption(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddOption(field.id)}
                          />
                          <button 
                            onClick={() => handleAddOption(field.id)}
                            className="px-3 py-1.5 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-700"
                          >
                            Add Value
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate-800">Document Triggers</h2>
                <button 
                  onClick={() => setIsAddingTrigger(true)}
                  className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Logic
                </button>
              </div>

              {isAddingTrigger && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Document Name to Request</label>
                    <input 
                      type="text" 
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Proof of Address"
                      value={newTrigger.documentName || ''}
                      onChange={e => setNewTrigger({...newTrigger, documentName: e.target.value})}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">When Field</label>
                      <select 
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newTrigger.conditionField || ''}
                        onChange={e => setNewTrigger({...newTrigger, conditionField: e.target.value})}
                      >
                        <option value="">Select Field...</option>
                        {fields.filter(f => f.type === 'dropdown').map(f => (
                          <option key={f.id} value={f.name}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Equals Value</label>
                      <select 
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newTrigger.conditionValue || ''}
                        onChange={e => setNewTrigger({...newTrigger, conditionValue: e.target.value})}
                        disabled={!newTrigger.conditionField}
                      >
                        <option value="">Select Value...</option>
                        {fields.find(f => f.name === newTrigger.conditionField)?.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button onClick={() => setIsAddingTrigger(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50">Cancel</button>
                    <button onClick={handleAddTrigger} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Save Logic</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {triggers.map(trigger => (
                  <div key={trigger.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Request <span className="font-bold">{trigger.documentName}</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          When <span className="font-medium text-slate-700">{trigger.conditionField}</span> equals <span className="font-medium text-slate-700">"{trigger.conditionValue}"</span>
                        </p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'deployment' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center py-8">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UploadCloud className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Deploy Configuration</h2>
              <p className="text-slate-500 mb-8">
                Push your sandbox changes (new fields, dropdown values, and document logic) to the production environment. This action will update the live application for all users.
              </p>

              {deploySuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-center text-green-700 mb-6">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Successfully deployed to production!
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8 text-left">
                  <h3 className="font-medium text-slate-800 mb-4">Pending Changes:</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span> {fields.length} Data Fields configured</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span> {triggers.length} Document Triggers configured</li>
                  </ul>
                </div>
              )}

              <button
                onClick={handleDeploy}
                disabled={isDeploying || deploySuccess}
                className={`w-full py-3 rounded-lg font-medium text-white flex items-center justify-center transition-all ${
                  isDeploying ? 'bg-blue-400 cursor-not-allowed' : deploySuccess ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isDeploying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deploying to Production...
                  </>
                ) : deploySuccess ? (
                  'Deployed Successfully'
                ) : (
                  'Push to Production'
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationEditor;
