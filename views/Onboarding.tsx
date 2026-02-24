
import React, { useState, useEffect } from 'react';
import { EntityType, DocumentRequirement, RiskLevel, EntityProfile, ApplicationStatus, Region, TaxInfo, ScreeningHit, MatchStatus } from '../types';
import { REQUIRED_DOCS_MAP, INDUSTRY_DOCS, COUNTRIES, NACE_CODES, FINANCIAL_PRODUCTS, DEMO_SCENARIOS, KEYWORD_DOCS, RISK_JURISDICTIONS, PRODUCT_DOCS, JURISDICTION_DOCS, TAX_REQUIREMENTS } from '../constants';
import { performRiskAnalysis, verifyDocumentIntegrity } from '../services/geminiService';
import RiskBadge from '../components/RiskBadge';
import { ArrowRight, Upload, AlertCircle, Loader2, FileCheck, Search, ChevronRight, Check, Briefcase, MapPin, Mail, Globe, Zap, Bot, Sparkles, Shield, Anchor, AlertTriangle, Scale, UserCheck, Users, ScanEye, Microscope, FileWarning, Landmark, XCircle, HelpCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (entity: EntityProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form State
  const [entityType, setEntityType] = useState<EntityType | ''>('');
  const [selectedRegion, setSelectedRegion] = useState<Region | ''>('');
  const [formData, setFormData] = useState<any>({});
  const [taxInfo, setTaxInfo] = useState<TaxInfo>({});
  const [requiredDocs, setRequiredDocs] = useState<DocumentRequirement[]>([]);
  const [uploadAttempts, setUploadAttempts] = useState<Record<string, number>>({});
  // activePolicies is calculated but not visually shown anymore
  const [activePolicies, setActivePolicies] = useState<{name: string, type: 'standard' | 'warning' | 'info'}[]>([]);
  
  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [screeningHits, setScreeningHits] = useState<ScreeningHit[]>([]);

  // --- Policy Engine & Rules ---

  const runPolicyEngine = (type: EntityType, data: any) => {
    let docs: DocumentRequirement[] = [];
    let policies: {name: string, type: 'standard' | 'warning' | 'info'}[] = [];

    // 1. Base Requirements (Standard)
    const baseDocs = REQUIRED_DOCS_MAP[type] || [];
    baseDocs.forEach(d => {
        docs.push({ id: `base-${d.name}`, name: d.name, description: d.desc, uploaded: false, triggerReason: 'Standard Policy', category: 'Standard', verificationStatus: 'Pending' });
    });
    policies.push({ name: `Standard KYC: ${type}`, type: 'standard' });

    // 2. Industry Rules (NACE)
    if (data.industry && INDUSTRY_DOCS[data.industry]) {
        INDUSTRY_DOCS[data.industry].forEach(d => {
             docs.push({ id: `ind-${d.name}`, name: d.name, description: d.desc, uploaded: false, triggerReason: `Industry: ${data.industry.substring(0, 15)}...`, category: 'Risk', verificationStatus: 'Pending' });
        });
        policies.push({ name: 'Sector Specific Risk Policy', type: 'info' });
    }

    // 3. Product Rules
    if (data.product && PRODUCT_DOCS[data.product]) {
        PRODUCT_DOCS[data.product].forEach(d => {
            docs.push({ id: `prod-${d.name}`, name: d.name, description: d.desc, uploaded: false, triggerReason: `Product: ${data.product}`, category: 'Product', verificationStatus: 'Pending' });
        });
        policies.push({ name: 'Financial Product Compliance', type: 'info' });
    }

    // 4. Jurisdiction Rules (High Risk Countries)
    const country = data.country || data.nationality;
    if (country && RISK_JURISDICTIONS.includes(country)) {
        JURISDICTION_DOCS.forEach(d => {
             docs.push({ id: `jur-${d.name}`, name: d.name, description: d.desc, uploaded: false, triggerReason: `High Risk Jurisdiction: ${country}`, category: 'Jurisdiction', verificationStatus: 'Pending' });
        });
        policies.push({ name: `Enhanced Due Diligence: ${country}`, type: 'warning' });
    }

    // 5. Keyword Matching (Occupation/Business Activity)
    // Combine fields to check for keywords
    const keywordsText = `${data.occupation || ''} ${data.businessActivity || ''} ${data.name || ''}`.toLowerCase();
    
    Object.keys(KEYWORD_DOCS).forEach(keyword => {
        if (keywordsText.includes(keyword)) {
            KEYWORD_DOCS[keyword].forEach(d => {
                // Prevent duplicates if multiple keywords trigger same doc
                if (!docs.find(existing => existing.name === d.name)) {
                    docs.push({ id: `key-${d.name}`, name: d.name, description: d.desc, uploaded: false, triggerReason: d.reason, category: 'Risk', verificationStatus: 'Pending' });
                }
            });
            // Add a policy flag if not already added for this reason
            const policyName = `Policy Trigger: ${keyword.toUpperCase()}`;
            if (!policies.find(p => p.name === policyName)) {
                policies.push({ name: policyName, type: 'warning' });
            }
        }
    });

    setRequiredDocs(prev => {
        // Merge uploaded state if doc names match (preserve uploads when switching)
        return docs.map(newDoc => {
            const existing = prev.find(p => p.name === newDoc.name);
            return existing ? { ...newDoc, uploaded: existing.uploaded, verificationStatus: existing.verificationStatus, forensicAnalysis: existing.forensicAnalysis } : newDoc;
        });
    });
    setActivePolicies(policies);
  };

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Run policy engine on every significant change
    if (entityType) {
        runPolicyEngine(entityType, newData);
    }
  };

  const handleScenarioClick = (scenario: any) => {
    setEntityType(scenario.type);
    setFormData(scenario.data);
    setSelectedRegion(scenario.region || '');
    setTaxInfo(scenario.taxInfo || {});
    runPolicyEngine(scenario.type, scenario.data);
    setStep(2);
  };

  // --- Step 1: Entity Selection ---
  const renderStep1 = () => (
    <div className="max-w-5xl mx-auto space-y-10">
      
      {/* Autopopulate Section */}
      <div>
        <div className="text-center mb-6">
           <h3 className="text-xl font-bold text-slate-800 flex items-center justify-center">
             <Zap className="w-5 h-5 text-amber-500 mr-2" />
             Quick Start: Demo Scenarios
           </h3>
           <p className="text-slate-500 text-sm mt-1">Select a pre-configured scenario to auto-populate the form for testing.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_SCENARIOS.map((scenario) => (
             <button
                key={scenario.id}
                onClick={() => handleScenarioClick(scenario)}
                className="text-left bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
             >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${scenario.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {scenario.risk} Risk
                  </span>
                  <Zap className="w-4 h-4 text-slate-300 group-hover:text-amber-500" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">{scenario.label}</h4>
                <p className="text-xs text-slate-500">{scenario.desc}</p>
             </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200"></div>

      {/* Manual Selection */}
      <div>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Manual Entry</h3>
          <p className="text-slate-500 text-sm mt-1">Start a fresh application from scratch.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(EntityType).map((type) => (
            <button
              key={type}
              onClick={() => {
                setEntityType(type);
                setFormData({});
                runPolicyEngine(type, {});
                setStep(2);
              }}
              className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group bg-white shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-700 group-hover:text-blue-700">{type}</span>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
              </div>
              <p className="text-xs text-slate-400">Initiate onboarding for {type.toLowerCase()}.</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // --- Step 2: Dynamic Extensive Form (Policy Engine runs in background) ---
  const renderStep2 = () => {
    const isIndividual = entityType === EntityType.INDIVIDUAL;
    
    // Validate Tax Info
    const isTaxValid = selectedRegion && TAX_REQUIREMENTS[selectedRegion].every(req => !req.required || (taxInfo as any)[req.key]);

    const canProceed = formData.name && formData.email && formData.product && (isIndividual ? formData.nationality : (formData.industry && formData.chairman && formData.ubos)) && isTaxValid;

    return (
      <div className="max-w-4xl mx-auto">
        
        {/* Form Container */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-100">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Briefcase className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">KYC Profile: {entityType}</h3>
                <p className="text-sm text-slate-500">Complete all fields to facilitate risk assessment.</p>
            </div>
            </div>
            
            <div className="space-y-8">
            
            {/* Section 1: Core Identity */}
            <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center">
                <Globe className="w-4 h-4 mr-2" /> Identity & {isIndividual ? 'Demographics' : 'Registration'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {isIndividual ? 'Full Legal Name' : 'Registered Entity Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-900"
                        placeholder={isIndividual ? "e.g. John Doe" : "e.g. Acme Corp"}
                    />
                    </div>

                    {isIndividual ? (
                    <>
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                        <input
                            type="date"
                            value={formData.dob || ''}
                            onChange={(e) => handleInputChange('dob', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nationality <span className="text-red-500">*</span></label>
                        <select
                            value={formData.nationality || ''}
                            onChange={(e) => handleInputChange('nationality', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        >
                            <option value="">Select Nationality</option>
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Occupation (NACE Code) <span className="text-red-500">*</span></label>
                        <select
                            value={formData.occupation || ''}
                            onChange={(e) => handleInputChange('occupation', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        >
                            <option value="">Select Occupation Sector</option>
                            {NACE_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Specific Job Title / Activity</label>
                            <input
                                type="text"
                                value={formData.businessActivity || ''}
                                onChange={(e) => handleInputChange('businessActivity', e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                placeholder="e.g. Shipping Merchant, Crypto Trader..."
                            />
                            <p className="text-xs text-slate-400 mt-1">Specific keywords may trigger policy rules.</p>
                        </div>
                    </>
                    ) : (
                    <>
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
                        <input
                            type="text"
                            value={formData.regNumber || ''}
                            onChange={(e) => handleInputChange('regNumber', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Incorporation</label>
                        <input
                            type="date"
                            value={formData.doi || ''}
                            onChange={(e) => handleInputChange('doi', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Industry (NACE Code) <span className="text-red-500">*</span></label>
                        <select
                            value={formData.industry || ''}
                            onChange={(e) => handleInputChange('industry', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        >
                            <option value="">Select Industry Sector</option>
                            {NACE_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Country of Incorporation <span className="text-red-500">*</span></label>
                        <select
                            value={formData.country || ''}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        >
                            <option value="">Select Country</option>
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        </div>
                    </>
                    )}
                </div>
            </div>

            {!isIndividual && (
               <>
                <div className="border-t border-slate-100 pt-6"></div>
                <div>
                   <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center">
                     <Users className="w-4 h-4 mr-2" /> Management & Ownership
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-2 md:col-span-1">
                         <label className="block text-sm font-medium text-slate-700 mb-1">Chairman / Key Director <span className="text-red-500">*</span></label>
                         <input
                            type="text"
                            value={formData.chairman || ''}
                            onChange={(e) => handleInputChange('chairman', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                            placeholder="Full Name"
                         />
                      </div>
                      <div className="col-span-2">
                         <label className="block text-sm font-medium text-slate-700 mb-1">UBOs & Stakeholders (&gt;25% Ownership) <span className="text-red-500">*</span></label>
                         <textarea
                            value={formData.ubos || ''}
                            onChange={(e) => handleInputChange('ubos', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 h-24"
                            placeholder="Please list all Ultimate Beneficial Owners and key stakeholders..."
                         />
                      </div>
                   </div>
                </div>
               </>
            )}

            <div className="border-t border-slate-100 pt-6"></div>

            {/* Section 2: Contact Details */}
            <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center">
                <MapPin className="w-4 h-4 mr-2" /> Contact & Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        placeholder="name@company.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        placeholder="+1 (555) 000-0000"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {isIndividual ? 'Residential Address' : 'Registered Business Address'} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.addressLine1 || ''}
                        onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 mb-2"
                        placeholder="Street Address, P.O. Box"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Postal / Zip Code</label>
                    <input
                        type="text"
                        value={formData.zip || ''}
                        onChange={(e) => handleInputChange('zip', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                    />
                </div>
                </div>
            </div>

            <div className="border-t border-slate-100 pt-6"></div>

            {/* Section 3: Tax & Regulatory Compliance */}
            <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center">
                <Landmark className="w-4 h-4 mr-2" /> Tax & Regulatory Compliance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Jurisdiction / Region <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-3 gap-4">
                            {Object.values(Region).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => {
                                        setSelectedRegion(r);
                                        setTaxInfo({}); // Reset tax info on region switch
                                    }}
                                    className={`p-3 rounded-lg border text-center transition-all ${
                                        selectedRegion === r 
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedRegion && TAX_REQUIREMENTS[selectedRegion].map((field) => (
                        <div key={field.key}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                value={(taxInfo as any)[field.key] || ''}
                                onChange={(e) => setTaxInfo({ ...taxInfo, [field.key]: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                placeholder={field.desc}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-slate-100 pt-6"></div>

            {/* Section 4: Commercial & Service Request */}
            <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center">
                <Mail className="w-4 h-4 mr-2" /> Service Request & Due Diligence
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Requested Financial Service / Product <span className="text-red-500">*</span></label>
                    <select
                        value={formData.product || ''}
                        onChange={(e) => handleInputChange('product', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        >
                        <option value="">Select a Product</option>
                        {FINANCIAL_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    </div>
                    {!isIndividual && (
                        <div className="col-span-2">
                             <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Business Activity</label>
                             <textarea
                                 value={formData.businessActivity || ''}
                                 onChange={(e) => handleInputChange('businessActivity', e.target.value)}
                                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 h-20"
                                 placeholder="Describe primary business operations, key counterparties, etc. (e.g. Exporting textiles to EU...)"
                             />
                             <p className="text-xs text-slate-400 mt-1">This narrative helps in validating industry risk codes.</p>
                        </div>
                    )}
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Source of Funds / Wealth</label>
                    <input
                        type="text"
                        value={formData.sourceOfFunds || ''}
                        onChange={(e) => handleInputChange('sourceOfFunds', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        placeholder="e.g. Salary, Business Profit, Investment"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expected Monthly Volume (USD)</label>
                    <input
                        type="text"
                        value={formData.volume || ''}
                        onChange={(e) => handleInputChange('volume', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                        placeholder="e.g. 50,000"
                    />
                    </div>
                </div>
            </div>

            </div>

            <div className="mt-10 flex justify-end">
            <button
                onClick={() => setStep(3)}
                disabled={!canProceed}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                canProceed ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
                <span>Next: Documentation</span>
                <ArrowRight className="w-4 h-4" />
            </button>
            </div>
        </div>

      </div>
    );
  };

  // --- Step 3: Documentation Rules (Grouped by Category) ---
  const renderStep3 = () => {
    const allUploaded = requiredDocs.every(d => d.uploaded && d.verificationStatus === 'Verified');

    const handleUploadAndScan = async (id: string, name: string) => {
        // Increment attempts
        const currentAttempts = (uploadAttempts[id] || 0) + 1;
        setUploadAttempts(prev => ({ ...prev, [id]: currentAttempts }));

        // 1. Set to scanning
        setRequiredDocs(prev => prev.map(d => d.id === id ? { ...d, uploaded: true, verificationStatus: 'Scanning' } : d));
        
        // 2. Simulate Delay for Forensic Analysis
        setTimeout(async () => {
            // 3. Call AI Service
            // Logic: 1st success, 2nd fail, 3rd success
            const shouldFail = currentAttempts === 2;
            const forensics = await verifyDocumentIntegrity(name, shouldFail);
            
            // 4. Update Result
            setRequiredDocs(prev => prev.map(d => {
                if (d.id === id) {
                    return {
                        ...d,
                        verificationStatus: forensics.isForged ? 'Flagged' : 'Verified',
                        forensicAnalysis: forensics
                    };
                }
                return d;
            }));
        }, 2000);
    };

    const removeDoc = (id: string) => {
        setRequiredDocs(prev => prev.map(d => d.id === id ? { ...d, uploaded: false, verificationStatus: 'Pending', forensicAnalysis: undefined } : d));
    };

    const handleProceedToAnalysis = async () => {
      setStep(4);
      setIsAnalyzing(true);
      // Call Gemini API
      const result = await performRiskAnalysis(formData.name, entityType as string, formData);
      setAnalysisResult(result);
      setScreeningHits(result.screeningResult.hits || []);
      setIsAnalyzing(false);
    };

    // Group docs by category
    const groupedDocs: Record<string, DocumentRequirement[]> = {};
    requiredDocs.forEach(doc => {
        const cat = doc.category || 'Standard';
        if (!groupedDocs[cat]) groupedDocs[cat] = [];
        groupedDocs[cat].push(doc);
    });

    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Required Documentation & Forensics</h3>
        <p className="text-slate-500 mb-6">Upload documents. System will automatically scan for forgery, digital manipulation, and metadata inconsistencies.</p>

        <div className="space-y-8 mb-8">
          {Object.entries(groupedDocs).map(([category, docs]) => (
              <div key={category}>
                  <h4 className={`text-sm font-bold uppercase tracking-wide mb-3 flex items-center ${
                      category === 'Risk' ? 'text-red-600' : 
                      category === 'Jurisdiction' ? 'text-orange-600' : 
                      category === 'Product' ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                      {category === 'Risk' ? <Shield className="w-4 h-4 mr-2" /> :
                       category === 'Jurisdiction' ? <Globe className="w-4 h-4 mr-2" /> :
                       category === 'Product' ? <Briefcase className="w-4 h-4 mr-2" /> :
                       <FileCheck className="w-4 h-4 mr-2" />}
                      {category} Requirements
                  </h4>
                  <div className="space-y-4">
                    {docs.map((doc) => (
                        <div key={doc.id} className={`p-4 border rounded-xl transition-all ${
                            doc.verificationStatus === 'Flagged' ? 'bg-red-50 border-red-200' :
                            doc.verificationStatus === 'Verified' ? 'bg-emerald-50 border-emerald-200' : 
                            'bg-white border-slate-200 hover:border-blue-300'
                        }`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-1 p-2 rounded-lg ${
                                        doc.verificationStatus === 'Verified' ? 'bg-emerald-200 text-emerald-700' : 
                                        doc.verificationStatus === 'Flagged' ? 'bg-red-200 text-red-700' :
                                        'bg-slate-100 text-slate-500'
                                    }`}>
                                        <FileCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{doc.name}</h4>
                                        <p className="text-sm text-slate-500">{doc.description}</p>
                                        {doc.triggerReason && (
                                            <span className="inline-block mt-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                Trigger: {doc.triggerReason}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    {doc.verificationStatus === 'Pending' && !doc.uploaded && (
                                        <button 
                                            onClick={() => handleUploadAndScan(doc.id, doc.name)}
                                            className="flex items-center space-x-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 bg-white font-medium text-sm shadow-sm"
                                        >
                                            <Upload className="w-4 h-4" />
                                            <span>Upload & Scan</span>
                                        </button>
                                    )}
                                    
                                    {doc.verificationStatus === 'Scanning' && (
                                        <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm font-medium">Analyzing...</span>
                                        </div>
                                    )}

                                    {(doc.verificationStatus === 'Verified' || doc.verificationStatus === 'Flagged') && (
                                        <div className="flex flex-col items-end">
                                            <span className={`flex items-center text-sm font-bold mb-2 ${doc.verificationStatus === 'Verified' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {doc.verificationStatus === 'Verified' ? <Check className="w-4 h-4 mr-1"/> : <FileWarning className="w-4 h-4 mr-1"/>}
                                                {doc.verificationStatus === 'Verified' ? 'Verified Authentic' : 'Tampering Detected'}
                                            </span>
                                            <button onClick={() => removeDoc(doc.id)} className="text-xs text-slate-400 hover:text-red-500 underline">Remove & Re-upload</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Forensic Analysis Report Card */}
                            {doc.forensicAnalysis && (
                                <div className={`mt-3 p-3 rounded-lg border text-sm ${
                                    doc.forensicAnalysis.isForged ? 'bg-white border-red-100' : 'bg-white border-emerald-100'
                                }`}>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Microscope className={`w-4 h-4 ${doc.forensicAnalysis.isForged ? 'text-red-500' : 'text-emerald-500'}`} />
                                        <span className="font-bold text-slate-700">Forensic Analysis Report</span>
                                        <span className="text-xs text-slate-400">| Confidence Score: {doc.forensicAnalysis.score}%</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                                        <div className={`p-2 rounded text-center border ${doc.forensicAnalysis.factors.metadata === 'Consistent' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-red-50 border-red-200 text-red-700 font-bold'}`}>
                                            <span className="block text-[10px] uppercase">Metadata</span>
                                            <span className="text-xs">{doc.forensicAnalysis.factors.metadata}</span>
                                        </div>
                                        <div className={`p-2 rounded text-center border ${doc.forensicAnalysis.factors.ela === 'Pass' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-red-50 border-red-200 text-red-700 font-bold'}`}>
                                            <span className="block text-[10px] uppercase">Compression (ELA)</span>
                                            <span className="text-xs">{doc.forensicAnalysis.factors.ela}</span>
                                        </div>
                                        <div className={`p-2 rounded text-center border ${doc.forensicAnalysis.factors.fonts === 'Consistent' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-red-50 border-red-200 text-red-700 font-bold'}`}>
                                            <span className="block text-[10px] uppercase">Typography</span>
                                            <span className="text-xs">{doc.forensicAnalysis.factors.fonts}</span>
                                        </div>
                                        <div className={`p-2 rounded text-center border ${doc.forensicAnalysis.factors.pixel === 'Natural' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-red-50 border-red-200 text-red-700 font-bold'}`}>
                                            <span className="block text-[10px] uppercase">Pixel Pattern</span>
                                            <span className="text-xs">{doc.forensicAnalysis.factors.pixel}</span>
                                        </div>
                                    </div>
                                    
                                    {doc.forensicAnalysis.reason && (
                                        <p className={`text-xs italic ${doc.forensicAnalysis.isForged ? 'text-red-600' : 'text-slate-500'}`}>
                                            Note: {doc.forensicAnalysis.reason}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                  </div>
              </div>
          ))}
        </div>

        {!allUploaded && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center space-x-3 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Please upload and verify all required documents to proceed.</span>
          </div>
        )}

        <div className="flex justify-between mt-8">
            <button
                onClick={() => setStep(2)}
                className="text-slate-500 hover:text-slate-700"
            >
                Back
            </button>
            <button
                onClick={handleProceedToAnalysis}
                disabled={!allUploaded}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                allUploaded ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
                <span>Run Screening & Risk Analysis</span>
                <Search className="w-4 h-4" />
            </button>
        </div>
      </div>
    );
  };

  // --- Step 4: Screening Review (Fuzzy Matches) ---
  const renderStep4 = () => {
    if (isAnalyzing) {
      return (
        <div className="max-w-2xl mx-auto text-center py-20">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
          <h3 className="text-xl font-bold text-slate-800">Processing Entity Profile...</h3>
          <p className="text-slate-500 mt-2">Enriching data, checking global sanctions, PEP lists, and calculating risk score.</p>
        </div>
      );
    }

    if (!analysisResult) return null;

    const handleDisposition = (id: string, status: MatchStatus) => {
        setScreeningHits(prev => prev.map(h => h.id === id ? { ...h, status } : h));
    };

    const allResolved = screeningHits.every(h => h.status !== 'Potential');
    const hasConfirmedHits = screeningHits.some(h => h.status === 'Matched');

    if (screeningHits.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-10 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="bg-emerald-50 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Screening Complete</h3>
                <p className="text-slate-500 mt-2 mb-8">No adverse media, sanctions, or PEP matches found.</p>
                <button 
                    onClick={() => setStep(5)} 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                    Continue to Final Review
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center">
                            <ScanEye className="w-6 h-6 mr-2 text-blue-600" />
                            Screening Hits Review
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">
                            {screeningHits.length} potential matches found. Please disposition each hit.
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${allResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {allResolved ? 'All Resolved' : 'Pending Review'}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {screeningHits.map((hit) => (
                        <div key={hit.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-all">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                                            hit.type === 'Sanction' ? 'bg-red-100 text-red-700' :
                                            hit.type === 'PEP' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {hit.type}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">Score: {hit.score}%</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800">{hit.name}</h4>
                                    <p className="text-sm text-slate-600 mt-1">{hit.description}</p>
                                    {hit.listSource && <p className="text-xs text-slate-400 mt-1">Source: {hit.listSource}</p>}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleDisposition(hit.id, 'Matched')}
                                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                            hit.status === 'Matched' 
                                            ? 'bg-red-600 text-white shadow-sm' 
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600'
                                        }`}
                                    >
                                        Match
                                    </button>
                                    <button
                                        onClick={() => handleDisposition(hit.id, 'Unmatched')}
                                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                            hit.status === 'Unmatched' 
                                            ? 'bg-emerald-600 text-white shadow-sm' 
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                                        }`}
                                    >
                                        False Positive
                                    </button>
                                    <button
                                        onClick={() => handleDisposition(hit.id, 'Unable to Resolve')}
                                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                            hit.status === 'Unable to Resolve' 
                                            ? 'bg-slate-600 text-white shadow-sm' 
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        Unresolved
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                     <button
                        onClick={() => setStep(5)}
                        disabled={!allResolved}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                            allResolved 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <span>Confirm Disposition & View Analysis</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
  };

  // --- Step 5: Final Decision (Analysis Results) ---
  const renderStep5 = () => {
    if (!analysisResult) return null;

    const { riskScore, riskLevel: aiRiskLevel, riskFactors, screeningResult, enrichedSummary } = analysisResult;
    
    // Recalculate Risk based on Disposition
    const confirmedHits = screeningHits.filter(h => h.status === 'Matched');
    const unresolvedHits = screeningHits.filter(h => h.status === 'Unable to Resolve');
    
    let finalRiskLevel = aiRiskLevel;
    let finalRiskScore = riskScore;
    let statusOverride: ApplicationStatus | undefined = undefined;

    if (confirmedHits.length > 0) {
        finalRiskLevel = RiskLevel.HIGH;
        finalRiskScore = Math.max(riskScore, 95);
        statusOverride = ApplicationStatus.REVIEW_REQUIRED;
    } else if (unresolvedHits.length > 0) {
        finalRiskLevel = RiskLevel.HIGH; // Unresolved is risky
        statusOverride = ApplicationStatus.REVIEW_REQUIRED;
    }

    const isHighRisk = finalRiskLevel === RiskLevel.HIGH;
    
    // AI Agent Criteria (Updated):
    // 1. Low Risk
    // 2. No Confirmed Hits
    // 3. Risk Score < 25
    const isClean = finalRiskLevel === RiskLevel.LOW && 
                    confirmedHits.length === 0 &&
                    unresolvedHits.length === 0 &&
                    finalRiskScore < 25;

    const handleFinish = (overrideStatus?: ApplicationStatus) => {
      const newEntity: EntityProfile = {
        id: `ENT-${Math.floor(Math.random() * 10000)}`,
        type: entityType as EntityType,
        name: formData.name,
        details: formData,
        region: selectedRegion as Region,
        taxInfo: taxInfo,
        documents: requiredDocs,
        riskScore: finalRiskScore,
        riskLevel: finalRiskLevel,
        riskFactors: [
            ...riskFactors,
            ...confirmedHits.map(h => ({ category: 'Screening Match', description: `Confirmed ${h.type}: ${h.name}`, score: 100, severity: RiskLevel.HIGH }))
        ],
        screeningResult: {
            ...screeningResult,
            hits: screeningHits // Save the dispositioned hits
        },
        createdAt: new Date().toISOString(),
        enrichedData: enrichedSummary,
        status: overrideStatus || statusOverride || (isHighRisk 
          ? ApplicationStatus.REVIEW_REQUIRED 
          : isClean 
            ? ApplicationStatus.APPROVED 
            : ApplicationStatus.PEER_REVIEW),
        approvedBy: (isClean && !overrideStatus && !isHighRisk) ? 'AI' : undefined
      };
      onComplete(newEntity);
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Risk Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">{formData.name}</h2>
                <p className="text-slate-500">{entityType} • {formData.industry || formData.nationality}</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
                <div className="text-sm text-slate-500 mb-1">Risk Assessment</div>
                <RiskBadge level={finalRiskLevel} score={finalRiskScore} />
            </div>
        </div>

        {isClean && (
             <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-xl shadow-lg text-white flex items-center space-x-4">
                 <div className="p-3 bg-white/20 rounded-full">
                     <Bot className="w-8 h-8 text-white" />
                 </div>
                 <div className="flex-1">
                     <h3 className="font-bold text-lg flex items-center">
                         AI Agent Recommendation: Auto-Approve <Sparkles className="w-4 h-4 ml-2" />
                     </h3>
                     <p className="text-emerald-50 opacity-90 text-sm">
                         This entity meets all safety criteria (Low Risk, Clean Screening, Valid Docs). 
                         The AI Agent can onboard this client immediately without human intervention.
                     </p>
                 </div>
             </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Screening Results */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Screening Disposition</h3>
                <ul className="space-y-3">
                    <li className="flex justify-between items-center">
                        <span className="text-slate-600">Total Hits</span>
                        <span className="font-bold text-slate-800">{screeningHits.length}</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-slate-600">Confirmed Matches</span>
                        {confirmedHits.length > 0 ? <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">{confirmedHits.length} DETECTED</span> : <span className="text-emerald-600 font-medium flex items-center"><Check className="w-4 h-4 mr-1"/> None</span>}
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-slate-600">False Positives</span>
                        <span className="text-slate-600 font-medium">{screeningHits.filter(h => h.status === 'Unmatched').length}</span>
                    </li>
                </ul>
            </div>

            {/* AI Enrichment */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">AI Profile Enrichment</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                    {enrichedSummary}
                </p>
            </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Risk Factors</h3>
             {riskFactors.length > 0 ? (
                 <div className="space-y-3">
                     {riskFactors.map((factor: any, i: number) => (
                         <div key={i} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg">
                             <div>
                                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{factor.category}</span>
                                 <p className="text-slate-800 font-medium">{factor.description}</p>
                             </div>
                             <RiskBadge level={factor.severity} score={factor.score} showIcon={false} />
                         </div>
                     ))}
                 </div>
             ) : (
                 <p className="text-slate-500 italic">No specific risk factors identified.</p>
             )}
        </div>

        {/* Action Bar */}
        <div className={`p-6 rounded-xl border ${
            isHighRisk ? 'bg-red-50 border-red-200' : 
            isClean ? 'bg-emerald-50 border-emerald-200' : 
            'bg-blue-50 border-blue-200'
        }`}>
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <h4 className={`font-bold text-lg ${
                        isHighRisk ? 'text-red-800' : 
                        isClean ? 'text-emerald-800' : 
                        'text-blue-800'
                    }`}>
                        {isHighRisk ? 'High Risk Entity Detected' : 
                         isClean ? 'AI Auto-Approval Available' : 
                         'Entity Ready for Review'}
                    </h4>
                    <p className={`text-sm ${
                        isHighRisk ? 'text-red-600' : 
                        isClean ? 'text-emerald-600' : 
                        'text-blue-600'
                    }`}>
                        {isHighRisk 
                            ? 'This application will be routed to the Enhanced Due Diligence (EDD) Queue.' 
                            : isClean 
                                ? 'AI Agent has verified all details. Click to instant-onboard.' 
                                : 'Minor deviations or medium risk found. Routing to Peer Review.'}
                    </p>
                </div>
                
                <div className="flex items-center space-x-3">
                    {isClean && (
                         <button
                            onClick={() => handleFinish(ApplicationStatus.PEER_REVIEW)}
                            className="px-6 py-2 rounded-lg font-bold shadow-sm transition-colors border border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50"
                        >
                           <UserCheck className="w-4 h-4 mr-2 inline" />
                           Force Peer Review
                        </button>
                    )}
                    <button
                        onClick={() => handleFinish()}
                        className={`px-6 py-2 rounded-lg font-bold shadow-sm transition-colors flex items-center ${
                            isHighRisk 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : isClean 
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {isHighRisk ? 'Submit to EDD Queue' : 
                         isClean ? <><Bot className="w-4 h-4 mr-2"/> Auto-Onboard</> : 
                         'Submit to Peer Review'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="space-y-8 pb-12">
      {/* Stepper */}
      <div className="flex justify-center space-x-4 mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step > s ? <Check className="w-5 h-5"/> : s}
            </div>
            {s < 5 && <div className={`w-12 h-1 mx-2 ${step > s ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
    </div>
  );
};

export default Onboarding;
