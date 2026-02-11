
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
import WorkflowDiagram from './components/WorkflowDiagram';
import { MOCK_DATABASE } from './constants';
import { EntityProfile, ApplicationStatus, RiskLevel } from './types';
import RiskBadge from './components/RiskBadge';
import { Users, AlertTriangle, CheckCircle, PieChart, Flag, Bot, RefreshCw, UserMinus, Ban } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [database, setDatabase] = useState<EntityProfile[]>(MOCK_DATABASE);

  const handleOnboardingComplete = (entity: EntityProfile) => {
    setDatabase(prev => [entity, ...prev]);
    
    // Redirect logic updated based on status
    if (entity.status === ApplicationStatus.APPROVED && entity.approvedBy === 'AI') {
        setActiveTab('active-clients'); // Redirect to Active Clients
    } else if (entity.riskLevel === RiskLevel.HIGH) {
      setActiveTab('queue'); // To EDD
    } else {
      setActiveTab('peer-review'); // To Peer Review
    }
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
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Total Entities</p>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{stats.total}</h3>
              </div>
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-600 text-[10px] font-bold uppercase">AI Onboarded</p>
                <h3 className="text-xl font-bold text-emerald-700 mt-1">{stats.aiApproved}</h3>
              </div>
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Bot className="w-4 h-4" />
              </div>
            </div>
          </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-600 text-[10px] font-bold uppercase">PKYC / Monitor</p>
                <h3 className="text-xl font-bold text-purple-700 mt-1">{stats.pkyc}</h3>
              </div>
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-600 text-[10px] font-bold uppercase">Off-boarding</p>
                <h3 className="text-xl font-bold text-orange-700 mt-1">{stats.offboarding}</h3>
              </div>
              <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                <UserMinus className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">EDD Queue</p>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{stats.edd}</h3>
              </div>
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Peer Review</p>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{stats.peerReview}</h3>
              </div>
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Waivers</p>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{stats.waivers}</h3>
              </div>
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Flag className="w-4 h-4" />
              </div>
            </div>
          </div>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Rejected</p>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{stats.rejected}</h3>
              </div>
              <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                <Ban className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Diagram */}
        <WorkflowDiagram database={database} />
      </div>
    );
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}
      {activeTab === 'active-clients' && <ActiveClientsQueue items={database} />}
      {activeTab === 'pkyc' && <PKYCQueue items={database} onReview={handlePKYCReview} />}
      {activeTab === 'offboarding' && <OffboardingQueue items={database} onConfirm={handleOffboardingConfirm} />}
      {activeTab === 'queue' && <ReviewQueue items={database} onReview={handleEDDReview} />}
      {activeTab === 'peer-review' && <PeerReview items={database} onReview={handlePeerReview} />}
      {activeTab === 'waivers' && <WaiverQueue items={database} onDecision={handleWaiverDecision} />}
      {activeTab === 'rejected' && <RejectedQueue items={database} />}
      {activeTab === 'search' && <EntitySearch database={database} />}
    </Layout>
  );
};

export default App;
