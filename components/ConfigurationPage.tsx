import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Search, 
  ListChecks, 
  ShieldCheck, 
  UserCheck, 
  Flag, 
  RefreshCw,
  CheckCircle,
  ArrowRight,
  FileSearch,
  Network,
  FileText
} from 'lucide-react';

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  required?: boolean;
  subtext?: string;
  integrationOptions?: string[];
  multiSelectOptions?: boolean;
}

export const AVAILABLE_MODULES: ModuleConfig[] = [
  { id: 'dashboard', name: 'Dashboard', description: 'Operational overview and analytics', icon: LayoutDashboard, required: true },
  { id: 'onboarding', name: 'Screening', description: 'Client onboarding, KYC, and initial screening', icon: UserPlus, integrationOptions: ['Lexis Nexus', 'DowJones', 'Worldcheck', 'Inhouse'], multiSelectOptions: true },
  { id: 'queue', name: 'Customer Due Diligence', description: 'Standard investigations for medium-risk entities', icon: ListChecks, integrationOptions: ['Inhouse', 'Third Party'] },
  { id: 'edd', name: 'Enhanced Due Diligence (EDD)', description: 'Deep dive investigations for high-risk entities', icon: FileSearch },
  { id: 'peer-review', name: 'Peer Review', description: 'Four-eyes principle for analyst decisions', icon: UserCheck },
  { id: 'compliance-checks', name: 'Compliance Checks', description: 'Automated and manual compliance rule verification', icon: ShieldCheck },
  { id: 'policy-waivers', name: 'Policy Waivers', description: 'Manage policy exceptions and compliance approvals', icon: Flag },
  { id: 'pkyc', name: 'Perpetual KYC (PKYC)', description: 'Continuous monitoring and periodic reviews', icon: RefreshCw },
  { id: 'search', name: 'Entity Search', description: 'Global search across all client records', icon: Search },
];

interface ConfigurationPageProps {
  onComplete: (selectedModuleIds: string[]) => void;
}

const ConfigurationPage: React.FC<ConfigurationPageProps> = ({ onComplete }) => {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(AVAILABLE_MODULES.filter(m => m.required).map(m => m.id))
  );
  
  const [selectedIntegrations, setSelectedIntegrations] = useState<Record<string, string | string[]>>({
    'onboarding': ['Lexis Nexus'],
    'queue': 'Inhouse'
  });

  const handleIntegrationClick = (moduleId: string, opt: string, isMulti: boolean) => {
    setSelectedIntegrations(prev => {
      if (isMulti) {
        const current = (prev[moduleId] as string[]) || [];
        if (current.includes(opt)) {
          return { ...prev, [moduleId]: current.filter(item => item !== opt) };
        } else {
          return { ...prev, [moduleId]: [...current, opt] };
        }
      } else {
        return { ...prev, [moduleId]: opt };
      }
    });
  };

  const toggleModule = (id: string) => {
    const module = AVAILABLE_MODULES.find(m => m.id === id);
    if (module?.required) return;

    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleContinue = () => {
    // Add default required modules that don't have a specific toggle but are needed for the app to function
    const finalModules = Array.from(selected);
    if (!finalModules.includes('active-clients')) finalModules.push('active-clients');
    if (!finalModules.includes('offboarding')) finalModules.push('offboarding');
    if (!finalModules.includes('rejected')) finalModules.push('rejected');
    
    onComplete(finalModules);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full space-y-8"
      >
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Configure Your CLM
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Select the modules you need for your compliance workflow. You can customize this setup based on your organization's specific requirements.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-200 mt-10">
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {AVAILABLE_MODULES.map((module) => {
                const isSelected = selected.has(module.id);
                const Icon = module.icon;
                
                return (
                  <div 
                    key={module.id}
                    onClick={() => toggleModule(module.id)}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col items-start
                      ${isSelected 
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }
                      ${module.required ? 'opacity-75 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className={`p-2.5 rounded-lg mb-3 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 w-full">
                      <h3 className="text-base font-bold text-slate-900 flex items-center">
                        {module.name}
                        {module.required && (
                          <span className="ml-2 text-xs uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                            Req
                          </span>
                        )}
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                        {module.description}
                      </p>
                      {module.integrationOptions && (
                        <div className="mt-3 pt-3 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {module.id === 'onboarding' ? 'Screening Engine' : 'Provider'}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {module.integrationOptions.map(opt => {
                              const isSelected = module.multiSelectOptions 
                                ? ((selectedIntegrations[module.id] as string[]) || []).includes(opt)
                                : selectedIntegrations[module.id] === opt;
                                
                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleIntegrationClick(module.id, opt, !!module.multiSelectOptions)}
                                  className={`text-[10px] px-2 py-1 rounded-md transition-colors border ${
                                    isSelected 
                                      ? 'bg-blue-100 border-blue-200 text-blue-700 font-semibold' 
                                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {module.subtext && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Integrations</p>
                          <p className="text-xs text-slate-600 mt-0.5">{module.subtext}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}
                    `}>
                      {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex justify-between items-center">
            <p className="text-sm text-slate-500 font-medium">
              {selected.size} module{selected.size !== 1 ? 's' : ''} selected
            </p>
            <button
              onClick={handleContinue}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Launch Workspace
              <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfigurationPage;
