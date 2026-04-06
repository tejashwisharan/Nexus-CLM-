
import React, { useState } from 'react';
import Layout from './components/Layout';
import Onboarding from './views/Onboarding';
import ReviewQueue from './views/ReviewQueue';
import PeerReview from './views/PeerReview';
import WaiverQueue from './views/WaiverQueue';
import EntitySearch from './views/EntitySearch';
import ActiveClientsQueue from './views/ActiveClientsQueue';
import PKYCQueue from './views/PKYCQueue';
import OffboardingQueue from './views/OffboardingQueue';
import RejectedQueue from './views/RejectedQueue';
import ComplianceChecks from './views/ComplianceChecks';
import WorkflowDiagram from './components/WorkflowDiagram';
import FloatingChatbot from './components/FloatingChatbot';
import ConfigurationPage from './components/ConfigurationPage';
import { MOCK_DATABASE } from './constants';
import { EntityProfile, ApplicationStatus, RiskLevel } from './types';
import RiskBadge from './components/RiskBadge';
import { Users, AlertTriangle, CheckCircle, PieChart, Flag, Bot, RefreshCw, UserMinus, Ban, ShieldCheck, ListChecks } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import ConfigurationEditor from './views/ConfigurationEditor';

const App: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [database, setDatabase] = useState<EntityProfile[]>(MOCK_DATABASE);

  const handleConfigurationComplete = (modules: string[]) => {
    setSelectedModules(modules);
    setIsConfigured(true);
  };

  const handleOnboardingComplete = (entity: EntityProfile) => {
    setDatabase(prev => [entity, ...prev]);
    
    // Redirect logic updated based on status
    if (entity.status === ApplicationStatus.APPROVED && entity.approvedBy === 'AI') {
        setActiveTab('active-clients'); // Redirect to Active Clients
    } else if (entity.status === ApplicationStatus.REVIEW_REQUIRED) {
      setActiveTab('edd'); // To EDD
    } else if (entity.status === ApplicationStatus.CDD_REVIEW) {
      setActiveTab('queue'); // To CDD
    } else {
      setActiveTab('peer-review'); // To Peer Review
    }
  };

  const handleCDDReview = (id: string, action: 'approve' | 'reject' | 'waiver', reason?: string) => {
    setDatabase(prev => prev.map(item => {
      if (item.id === id) {
        if (action === 'waiver') {
            return { ...item, status: ApplicationStatus.WAIVER_REQUESTED, waiverReason: reason };
        }
        if (action === 'reject') {
            return { ...item, status: ApplicationStatus.REJECTED, approvedBy: undefined };
        }
        // Approve
        return {
          ...item,
          status: ApplicationStatus.APPROVED,
          approvedBy: 'Analyst'
        };
      }
      return item;
    }));
  };

  const handleEDDReview = (id: string, action: 'approve' | 'reject' | 'waiver', reason?: string) => {
    setDatabase(prev => prev.map(item => {
      if (item.id === id) {
        if (action === 'waiver') {
            return { ...item, status: ApplicationStatus.WAIVER_REQUESTED, waiverReason: reason };
        }
        if (action === 'reject') {
            return { ...item, status: ApplicationStatus.REJECTED, approvedBy: undefined };
        }
        // Approve
        return {
          ...item,
          status: ApplicationStatus.APPROVED,
          approvedBy: 'Analyst'
        };
      }
      return item;
    }));
  };

  const handlePeerReview = (id: string, action: 'approve' | 'reject') => {
      setDatabase(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: action === 'approve' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED,
            approvedBy: action === 'approve' ? 'Analyst' : undefined
          };
        }
        return item;
      }));
  };

  const handleWaiverDecision = (id: string, approved: boolean) => {
      setDatabase(prev => prev.map(item => {
          if (item.id === id) {
              return {
                  ...item,
                  status: approved ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED,
                  approvedBy: approved ? 'Analyst' : undefined
              };
          }
          return item;
      }));
  };

  const handlePKYCReview = (id: string, action: 'confirm' | 'retrigger' | 'reject') => {
      setDatabase(prev => prev.map(item => {
          if (item.id === id) {
              if (action === 'reject') {
                  return { ...item, status: ApplicationStatus.REJECTED, approvedBy: undefined };
              }
              if (action === 'retrigger') {
                  return { ...item, status: ApplicationStatus.REVIEW_REQUIRED, approvedBy: undefined }; // Send to EDD
              }
              // confirm
              return {
                  ...item,
                  status: ApplicationStatus.APPROVED,
                  approvedBy: 'Analyst',
                  lastReviewDate: new Date().toISOString()
              };
          }
          return item;
      }));
  };

  const handleOffboardingConfirm = (id: string) => {
    setDatabase(prev => prev.map(item => {
        if (item.id === id) {
            return {
                ...item,
                status: ApplicationStatus.OFFBOARDED
            };
        }
        return item;
    }));
  };

  const renderDashboard = () => {
    const stats = {
      total: database.length,
      cdd: database.filter(e => e.status === ApplicationStatus.CDD_REVIEW).length,
      edd: database.filter(e => e.status === ApplicationStatus.REVIEW_REQUIRED).length,
      peerReview: database.filter(e => e.status === ApplicationStatus.PEER_REVIEW).length,
      waivers: database.filter(e => e.status === ApplicationStatus.WAIVER_REQUESTED).length,
      pkyc: database.filter(e => e.status === ApplicationStatus.PERIODIC_REVIEW).length,
      offboarding: database.filter(e => e.status === ApplicationStatus.OFFBOARDING_REQUESTED).length,
      approved: database.filter(e => e.status === ApplicationStatus.APPROVED).length,
      rejected: database.filter(e => e.status === ApplicationStatus.REJECTED).length,
      aiApproved: database.filter(e => e.status === ApplicationStatus.APPROVED && e.approvedBy === 'AI').length
    };

    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-slate-800">Operational Overview</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase leading-tight">Total Entities</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1.5">{stats.total}</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          {selectedModules.includes('onboarding') && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-emerald-600 text-sm font-bold uppercase leading-tight">AI Onboarded</p>
                  <h3 className="text-3xl font-bold text-emerald-700 mt-1.5">{stats.aiApproved}</h3>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Bot className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}
          
          {selectedModules.includes('pkyc') && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-600 text-sm font-bold uppercase leading-tight">PKYC / Monitor</p>
                  <h3 className="text-3xl font-bold text-purple-700 mt-1.5">{stats.pkyc}</h3>
                </div>
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                  <RefreshCw className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}
          
          {selectedModules.includes('offboarding') && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-orange-600 text-sm font-bold uppercase leading-tight">Off-boarding</p>
                  <h3 className="text-3xl font-bold text-orange-700 mt-1.5">{stats.offboarding}</h3>
                </div>
                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
                  <UserMinus className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}
          
          {selectedModules.includes('queue') && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase leading-tight">CDD Queue</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1.5">{stats.cdd}</h3>
                </div>
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                  <ListChecks className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}

          {selectedModules.includes('edd') && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase leading-tight">EDD Queue</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1.5">{stats.edd}</h3>
                </div>
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}
          
          {selectedModules.includes('peer-review') && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase leading-tight">Peer Review</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1.5">{stats.peerReview}</h3>
                </div>
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <PieChart className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}
          
          {selectedModules.includes('compliance-checks') && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase leading-tight">Compliance Checks</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1.5">{stats.total}</h3>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}
          
          {selectedModules.includes('policy-waivers') && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase leading-tight">Policy Waivers</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1.5">{stats.waivers}</h3>
                </div>
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Flag className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}
          
          {selectedModules.includes('rejected') && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase leading-tight">Rejected</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1.5">{stats.rejected}</h3>
                </div>
                <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                  <Ban className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workflow Diagram */}
        <WorkflowDiagram database={database} />
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {!isConfigured ? (
        <motion.div
          key="config"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ConfigurationPage onComplete={handleConfigurationComplete} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-screen"
        >
          <Layout activeTab={activeTab} onTabChange={setActiveTab} selectedModules={selectedModules}>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}
            {activeTab === 'active-clients' && <ActiveClientsQueue items={database} />}
            {activeTab === 'pkyc' && <PKYCQueue items={database} onReview={handlePKYCReview} />}
            {activeTab === 'offboarding' && <OffboardingQueue items={database} onConfirm={handleOffboardingConfirm} />}
            {activeTab === 'queue' && <ReviewQueue items={database} onReview={handleCDDReview} statusFilter={ApplicationStatus.CDD_REVIEW} title="CDD Queue" emptyMessage="No entities pending Customer Due Diligence." description="Customer Due Diligence required for" />}
            {activeTab === 'edd' && <ReviewQueue items={database} onReview={handleEDDReview} statusFilter={ApplicationStatus.REVIEW_REQUIRED} title="EDD Queue" emptyMessage="No high-risk entities pending Enhanced Due Diligence." description="Enhanced Due Diligence required for" />}
            {activeTab === 'peer-review' && <PeerReview items={database} onReview={handlePeerReview} />}
            {activeTab === 'compliance-checks' && <ComplianceChecks />}
            {activeTab === 'policy-waivers' && <WaiverQueue items={database} onDecision={handleWaiverDecision} />}
            {activeTab === 'rejected' && <RejectedQueue items={database} />}
            {activeTab === 'search' && <EntitySearch database={database} />}
            {activeTab === 'config-editor' && <ConfigurationEditor />}
            {selectedModules.includes('ai-assistant') && (
              <FloatingChatbot currentContext={`User is currently viewing the ${activeTab} page.`} selectedModules={selectedModules} />
            )}
          </Layout>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
