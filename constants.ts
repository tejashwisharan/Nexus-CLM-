import { EntityType, EntityProfile, RiskLevel, ApplicationStatus } from './types';

export const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "Singapore", 
  "China", "India", "Brazil", "Mexico", "South Africa", "UAE", "Saudi Arabia", "Switzerland", 
  "Netherlands", "Sweden", "Spain", "Italy", "Colombia", "Panama", "Ireland", "Luxembourg", "Russia", "Iran"
];

// Statistical Classification of Economic Activities in the European Community
export const NACE_CODES = [
  "A - Agriculture, Forestry and Fishing",
  "B - Mining and Quarrying",
  "C - Manufacturing",
  "D - Electricity, Gas, Steam and Air Conditioning Supply",
  "E - Water Supply; Sewerage, Waste Management",
  "F - Construction",
  "G - Wholesale and Retail Trade; Repair of Motor Vehicles",
  "H - Transportation and Storage",
  "I - Accommodation and Food Service Activities",
  "J - Information and Communication",
  "K - Financial and Insurance Activities",
  "L - Real Estate Activities",
  "M - Professional, Scientific and Technical Activities",
  "N - Administrative and Support Service Activities",
  "O - Public Administration and Defence",
  "P - Education",
  "Q - Human Health and Social Work Activities",
  "R - Arts, Entertainment and Recreation"
];

export const FINANCIAL_PRODUCTS = [
  "Business Checking Account",
  "Savings Account",
  "Corporate Credit Card",
  "Term Loan",
  "Line of Credit",
  "Trade Finance / Letter of Credit",
  "Merchant Services / Payment Processing",
  "Treasury Management",
  "Foreign Exchange Services",
  "Investment / Wealth Management",
  "Mortgage",
  "International Wire Transfers",
  "Custody Services"
];

export const REQUIRED_DOCS_MAP: Record<string, { name: string; desc: string }[]> = {
  [EntityType.INDIVIDUAL]: [
    { name: 'Proof of Identity', desc: 'Passport or National ID Card' },
    { name: 'Proof of Address', desc: 'Utility bill not older than 3 months' },
    { name: 'Source of Funds', desc: 'Payslips or Tax Return' }
  ],
  [EntityType.COMPANY]: [
    { name: 'Certificate of Incorporation', desc: 'Official government registration document' },
    { name: 'Memorandum of Association', desc: 'Company constitution' },
    { name: 'Board Resolution', desc: 'Authorization to open account' },
    { name: 'UBO Declaration', desc: 'Ultimate Beneficial Owner structure' },
    { name: 'Financial Statements', desc: 'Latest Audited Accounts' }
  ],
  [EntityType.NGO]: [
    { name: 'Registration Certificate', desc: 'NGO Registry proof' },
    { name: 'Constitution/Bylaws', desc: 'Governing rules' },
    { name: 'List of Donors', desc: 'Major donors contributing > 10%' }
  ],
  [EntityType.JOINT_VENTURE]: [
    { name: 'JV Agreement', desc: 'Signed agreement between parties' },
    { name: 'Participant Details', desc: 'KYC for all JV partners' }
  ],
  [EntityType.PARTNERSHIP]: [
      { name: 'Partnership Deed', desc: 'Legal partnership agreement' },
      { name: 'Partner KYC', desc: 'ID for all managing partners' }
  ],
  [EntityType.TRUST]: [
      { name: 'Trust Deed', desc: 'Original trust deed' },
      { name: 'Trustee KYC', desc: 'ID for all trustees' }
  ]
};

// Additional industry specific rules based on NACE codes or keywords
export const INDUSTRY_DOCS: Record<string, { name: string; desc: string }[]> = {
  'B - Mining and Quarrying': [{ name: 'Environmental Impact Assessment', desc: 'Approved EIA report' }],
  'K - Financial and Insurance Activities': [{ name: 'Regulatory License', desc: 'Banking or investment license' }],
  'O - Public Administration and Defence': [{ name: 'Trade License', desc: 'Arms export control license' }],
  'F - Construction': [{ name: 'Site Permits', desc: 'Major project permits' }]
};

const WAIVER_REASONS = [
    "Client unable to provide utility bill under 3 months old due to temporary accommodation; Lease agreement provided.",
    "Director ID expired during onboarding; Renewal receipt provided, requesting exception to proceed.",
    "Company UBO is a PEP (inactive for 5 years); Standard policy requires Board Approval, requesting Risk Committee Waiver.",
    "Missing one historical board resolution due to archive damage; Current incumbency certificate provided.",
    "Entity registered in high-risk jurisdiction for operational reasons but has no local clients; Requesting jurisdiction policy waiver.",
    "Unable to provide 3 years of audited financials (only 2 years available); Management accounts provided for current year.",
    "Strategic client requiring expedited onboarding; Pending final certification of incorporation (digital copy provided).",
    "Adverse media match confirmed as false positive by external legal counsel; System still flagging, manual override requested.",
    "Trust deed original not available; Certified copy from solicitor provided.",
    "Minor discrepancy in address spelling between ID and Utility Bill; Verified via third-party database."
];

const PKYC_TRIGGERS = [
  "Scheduled Review (1 Year - High Risk)",
  "Scheduled Review (3 Year - Medium Risk)",
  "Transaction Monitoring Alert: Volume Spike > 50%",
  "Transaction Monitoring Alert: New Jurisdiction Detected",
  "PII Update: Change of Registered Address",
  "PII Update: Change of Ultimate Beneficial Owner (UBO)",
  "Adverse Media: New Potential Match Found"
];

const OFFBOARDING_REASONS = [
  "Client Request: Consolidating banking relationships",
  "Client Request: Business closure / Liquidation",
  "Client Request: Moving to competitor for better rates",
  "Client Request: Merged with another entity",
  "Dormant Account: No activity for > 24 months",
  "Strategic Exit: Product no longer supported",
  "Client Request: Dissatisfaction with service"
];

// --- Generator Logic for Mocks ---
const generateMocks = (count: number): EntityProfile[] => {
    const profiles: EntityProfile[] = [];
    const entityTypes = [EntityType.INDIVIDUAL, EntityType.COMPANY, EntityType.PARTNERSHIP];
    
    const names = {
        first: ["James", "Maria", "Robert", "Yuki", "Ahmed", "Chen", "Fatima", "Carlos", "Elena", "Igor", "Sarah", "David", "Wei", "Priya", "Hans", "Oliver", "Emma", "Liam", "Ava", "Noah", "Sophia", "William", "Isabella"],
        last: ["Smith", "Garcia", "Kim", "Tanaka", "Al-Fayed", "Wei", "Ivanov", "Popov", "Muller", "Rossi", "Patel", "Nguyen", "Schmidt", "Dubois", "Johnson", "Brown", "Jones", "Miller", "Davis", "Rodriguez"],
        companies: ["Global", "Tech", "Alpha", "Omega", "Prime", "Inter", "Star", "Blue", "Red", "Green", "Apex", "Zenith", "Horizon", "Vertex", "Summit", "Pinnacle", "Vanguard", "Quantum", "Nexus", "Synergy"],
        suffix: ["Ltd", "Inc", "Corp", "Solutions", "Holdings", "Group", "Logistics", "Ventures", "Systems", "Trading", "Partners", "LLC", "Enterprises", "Industries", "Consulting", "Capital"]
    };

    const industries = [
        "J - Information and Communication", "K - Financial and Insurance Activities", 
        "F - Construction", "H - Transportation and Storage", "C - Manufacturing",
        "M - Professional, Scientific and Technical Activities", "G - Wholesale and Retail Trade"
    ];

    for (let i = 0; i < count; i++) {
        const type = entityTypes[Math.floor(Math.random() * entityTypes.length)];
        const isIndividual = type === EntityType.INDIVIDUAL;
        
        let name = "";
        if (isIndividual) {
            name = `${names.first[Math.floor(Math.random() * names.first.length)]} ${names.last[Math.floor(Math.random() * names.last.length)]}`;
        } else {
            name = `${names.companies[Math.floor(Math.random() * names.companies.length)]} ${names.suffix[Math.floor(Math.random() * names.suffix.length)]}`;
        }

        // Determine Risk Profile & Status
        let riskLevel = RiskLevel.LOW;
        let status = ApplicationStatus.PEER_REVIEW;
        let score = Math.floor(Math.random() * 30) + 10;
        let waiverReason = undefined;
        let approvedBy: 'AI' | 'Analyst' | undefined = undefined;
        let reviewTrigger = undefined;
        
        const roll = Math.random();
        
        if (roll > 0.85) {
            // EDD Queue
            riskLevel = RiskLevel.HIGH;
            status = ApplicationStatus.REVIEW_REQUIRED;
            score = Math.floor(Math.random() * 30) + 70;
        } else if (roll > 0.70) {
            // Waiver Queue
            status = ApplicationStatus.WAIVER_REQUESTED;
            riskLevel = Math.random() > 0.5 ? RiskLevel.MEDIUM : RiskLevel.HIGH; 
            score = Math.floor(Math.random() * 40) + 40;
            waiverReason = WAIVER_REASONS[Math.floor(Math.random() * WAIVER_REASONS.length)];
        } else if (roll > 0.55) {
             // Peer Review
            riskLevel = Math.random() > 0.5 ? RiskLevel.LOW : RiskLevel.MEDIUM;
            status = ApplicationStatus.PEER_REVIEW;
            score = Math.floor(Math.random() * 40) + 10;
        } else if (roll > 0.25) {
            // AI Auto-Approved (Clean Entities)
            riskLevel = RiskLevel.LOW;
            status = ApplicationStatus.APPROVED;
            approvedBy = 'AI';
            score = Math.floor(Math.random() * 20); 
        } else {
             // PKYC - Periodic Review (Approx 25% of population in this random set)
             status = ApplicationStatus.PERIODIC_REVIEW;
             riskLevel = Math.random() > 0.7 ? RiskLevel.HIGH : (Math.random() > 0.4 ? RiskLevel.MEDIUM : RiskLevel.LOW);
             score = riskLevel === RiskLevel.HIGH ? 75 : (riskLevel === RiskLevel.MEDIUM ? 45 : 15);
             reviewTrigger = PKYC_TRIGGERS[Math.floor(Math.random() * PKYC_TRIGGERS.length)];
             
             // Adjust trigger based on risk if needed logic
             if(reviewTrigger.includes("High Risk") && riskLevel !== RiskLevel.HIGH) {
                 reviewTrigger = "Scheduled Review (Standard Cycle)";
             }
        }

        // Random Documents
        const docsList = REQUIRED_DOCS_MAP[type] || [];
        const docs = docsList.map(d => ({
            id: `doc-${i}-${d.name.replace(/\s/g, '')}`,
            name: d.name,
            description: d.desc,
            uploaded: true
        }));

        // Random Factors
        const riskFactors = [];
        if (riskLevel === RiskLevel.HIGH) {
            riskFactors.push({ category: 'Screening', description: 'Potential match on PEP list', score: 80, severity: RiskLevel.HIGH });
            riskFactors.push({ category: 'Jurisdiction', description: 'Operations in high-risk region', score: 70, severity: RiskLevel.HIGH });
        } else if (riskLevel === RiskLevel.MEDIUM) {
             riskFactors.push({ category: 'Complexity', description: 'Complex ownership structure', score: 50, severity: RiskLevel.MEDIUM });
        }
        
        if (status === ApplicationStatus.WAIVER_REQUESTED) {
             riskFactors.push({ category: 'Policy', description: 'Mandatory document missing or invalid', score: 45, severity: RiskLevel.MEDIUM });
        }

        if (status === ApplicationStatus.PERIODIC_REVIEW && reviewTrigger && reviewTrigger.includes('Transaction')) {
             riskFactors.push({ category: 'Monitoring', description: reviewTrigger, score: 60, severity: RiskLevel.MEDIUM });
        }

        profiles.push({
            id: `ENT-${1000 + i}`,
            type,
            name,
            details: {
                country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
                industry: !isIndividual ? industries[Math.floor(Math.random() * industries.length)] : undefined,
                occupation: isIndividual ? industries[Math.floor(Math.random() * industries.length)] : undefined,
                product: FINANCIAL_PRODUCTS[Math.floor(Math.random() * FINANCIAL_PRODUCTS.length)],
                email: `contact@${name.replace(/\s/g, '').toLowerCase()}.com`
            },
            documents: docs,
            riskScore: score,
            riskLevel,
            riskFactors,
            screeningResult: {
                adverseMediaFound: riskLevel === RiskLevel.HIGH && Math.random() > 0.5,
                pepStatus: riskLevel === RiskLevel.HIGH && Math.random() > 0.5,
                sanctionsHit: riskLevel === RiskLevel.HIGH && Math.random() > 0.8,
                summary: status === ApplicationStatus.APPROVED ? 'Clean screening. No hits found.' : 'Automated screening complete.'
            },
            status,
            waiverReason,
            approvedBy,
            reviewTrigger,
            lastReviewDate: new Date(Date.now() - Math.floor(Math.random() * 31536000000 * 2)).toISOString(), // 0-2 years ago
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
            enrichedData: `Automated analysis for ${name}. Entity appears to have ${riskLevel === 'Low' ? 'standard' : 'complex'} operational footprint.`
        });
    }
    return profiles;
};

// Force add ~20 specific PKYC cases
const generatePKYCCases = (count: number): EntityProfile[] => {
    const pkycProfiles: EntityProfile[] = [];
    for(let i=0; i<count; i++) {
        const base = generateMocks(1)[0];
        base.id = `PKYC-${2000+i}`;
        base.status = ApplicationStatus.PERIODIC_REVIEW;
        base.reviewTrigger = PKYC_TRIGGERS[Math.floor(Math.random() * PKYC_TRIGGERS.length)];
        base.riskLevel = Math.random() > 0.5 ? RiskLevel.MEDIUM : RiskLevel.HIGH;
        base.riskScore = base.riskLevel === RiskLevel.HIGH ? 85 : 50;
        pkycProfiles.push(base);
    }
    return pkycProfiles;
}

// Force add ~50 specific Offboarding cases
const generateOffboardingCases = (count: number): EntityProfile[] => {
    const offboardingProfiles: EntityProfile[] = [];
    for(let i=0; i<count; i++) {
        const base = generateMocks(1)[0];
        base.id = `EXIT-${3000+i}`;
        base.status = ApplicationStatus.OFFBOARDING_REQUESTED;
        base.offboardingReason = OFFBOARDING_REASONS[Math.floor(Math.random() * OFFBOARDING_REASONS.length)];
        // Often offboarding clients have low risk, unless they are being exited for risk reasons
        base.riskLevel = RiskLevel.LOW; 
        base.riskScore = 15;
        offboardingProfiles.push(base);
    }
    return offboardingProfiles;
}

// --- Manual Scenarios ---
const MANUAL_MOCKS: EntityProfile[] = [
  {
    id: 'ENT-001',
    type: EntityType.COMPANY,
    name: 'TechFlow Solutions Ltd.',
    details: {
      registrationNumber: 'GB123456',
      industry: 'J - Information and Communication',
      country: 'United Kingdom',
      turnover: '5M',
      product: 'Business Checking Account',
      email: 'contact@techflow.com'
    },
    documents: [
       { id: 'd1', name: 'Certificate of Incorporation', description: 'Official government registration', uploaded: true },
       { id: 'd2', name: 'Financial Statements', description: 'Latest Audited Accounts', uploaded: true }
    ],
    riskScore: 10,
    riskLevel: RiskLevel.LOW,
    riskFactors: [],
    status: ApplicationStatus.APPROVED,
    approvedBy: 'AI',
    createdAt: '2023-10-15',
    screeningResult: {
        adverseMediaFound: false,
        pepStatus: false,
        sanctionsHit: false,
        summary: 'No screening hits found. Entity is clean.'
    },
    enrichedData: 'A stable software development firm based in London with no adverse history. Perfect match for auto-onboarding.'
  },
  {
    id: 'ENT-002',
    type: EntityType.INDIVIDUAL,
    name: 'Santiago Morales',
    details: {
      nationality: 'Colombia',
      occupation: 'G - Wholesale and Retail Trade',
      residency: 'Miami, FL',
      product: 'International Wire Transfers',
      email: 's.morales@example.com'
    },
    documents: [
       { id: 'd1', name: 'Passport', description: 'Colombian Passport', uploaded: true },
       { id: 'd2', name: 'Proof of Address', description: 'Utility Bill Miami', uploaded: true }
    ],
    riskScore: 75,
    riskLevel: RiskLevel.HIGH,
    riskFactors: [
      { category: 'Geography', description: 'High risk jurisdiction connections', score: 60, severity: RiskLevel.MEDIUM },
      { category: 'Occupation', description: 'High volume cross-border transactions', score: 80, severity: RiskLevel.HIGH }
    ],
    status: ApplicationStatus.REVIEW_REQUIRED,
    createdAt: '2023-11-02',
    enrichedData: 'Identified potential name match with regional watchlists. Requires manual review.'
  },
  {
    id: 'ENT-003',
    type: EntityType.NGO,
    name: 'Green Earth Initiative',
    details: {
      focus: 'Environmental Protection',
      country: 'Germany',
      fundingSource: 'Public Donations',
      product: 'Savings Account'
    },
    documents: [
        { id: 'd1', name: 'Registration Certificate', description: 'NGO Registry proof', uploaded: true }
    ],
    riskScore: 25,
    riskLevel: RiskLevel.LOW,
    riskFactors: [],
    status: ApplicationStatus.PEER_REVIEW,
    createdAt: '2023-12-10',
    enrichedData: 'Legitimate NGO registered in Germany. No adverse media found.'
  },
  {
      id: 'ENT-004',
      type: EntityType.COMPANY,
      name: 'Oceanic Transport Corp',
      details: {
        registrationNumber: 'PA987654',
        industry: 'H - Transportation and Storage',
        country: 'Panama',
        turnover: '50M',
        product: 'Trade Finance / Letter of Credit'
      },
      documents: [
          { id: 'd1', name: 'Certificate of Incorporation', description: 'Panama Registry', uploaded: true },
          { id: 'd2', name: 'Board Resolution', description: 'Missing signature', uploaded: true }
      ],
      riskScore: 60,
      riskLevel: RiskLevel.MEDIUM,
      riskFactors: [
          { category: 'Jurisdiction', description: 'Registered in high-risk jurisdiction (Panama)', score: 60, severity: RiskLevel.MEDIUM }
      ],
      status: ApplicationStatus.WAIVER_REQUESTED,
      waiverReason: 'Client is missing one historical board resolution due to archive fire, but is a key strategic partner for the bank with $50M turnover. Requesting policy waiver for document expiry.',
      createdAt: '2024-01-05',
      enrichedData: 'Established shipping company. While jurisdiction is high risk, operational history is clean. Document gap identified.'
    }
];

export const MOCK_DATABASE: EntityProfile[] = [
    ...MANUAL_MOCKS,
    ...generatePKYCCases(25), 
    ...generateOffboardingCases(50), // Generate 50 offboarding cases
    ...generateMocks(150)
];

export const DEMO_SCENARIOS = [
  {
    id: 'ind-low',
    label: 'Individual - Low Risk (Auto)',
    desc: 'Perfect profile. Should trigger AI Approval.',
    type: EntityType.INDIVIDUAL,
    risk: 'Low',
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 123-4567',
      addressLine1: '42 Maple Avenue',
      city: 'Springfield',
      zip: '62704',
      dob: '1985-04-12',
      nationality: 'United States',
      occupation: 'J - Information and Communication',
      product: 'Savings Account',
      sourceOfFunds: 'Salary',
      volume: '5,000',
      taxId: '123-45-6789'
    }
  },
  {
    id: 'ind-high',
    label: 'Individual - High Risk',
    desc: 'Politically exposed, adverse media.',
    type: EntityType.INDIVIDUAL,
    risk: 'High',
    data: {
      name: 'Victor Volkov',
      email: 'v.volkov@redstar.ru',
      phone: '+7 (999) 000-0000',
      addressLine1: '12 Elite Tower',
      city: 'Moscow',
      zip: '101000',
      dob: '1970-11-05',
      nationality: 'Russia',
      occupation: 'O - Public Administration and Defence',
      product: 'International Wire Transfers',
      sourceOfFunds: 'Investment Profits',
      volume: '500,000',
      taxId: 'RU-998877'
    }
  },
  {
    id: 'co-low',
    label: 'Company - Low Risk',
    desc: 'Domestic corp, clean history.',
    type: EntityType.COMPANY,
    risk: 'Low',
    data: {
      name: 'GreenLeaf Logistics',
      email: 'ops@greenleaf.com',
      phone: '+44 20 7123 4567',
      addressLine1: '8 Industrial Park',
      city: 'Manchester',
      zip: 'M1 1AA',
      regNumber: 'UK-982211',
      doi: '2010-06-15',
      industry: 'H - Transportation and Storage',
      country: 'United Kingdom',
      product: 'Business Checking Account',
      sourceOfFunds: 'Business Turnover',
      volume: '100,000'
    }
  },
  {
    id: 'co-high',
    label: 'Company - High Risk',
    desc: 'Sanctions hit, high risk industry.',
    type: EntityType.COMPANY,
    risk: 'High',
    data: {
      name: 'Caspian Arms Trade',
      email: 'contact@caspian-arms.com',
      phone: '+98 21 0000 0000',
      addressLine1: 'Sector 4, Free Zone',
      city: 'Tehran',
      zip: '12345',
      regNumber: 'IR-555666',
      doi: '2005-01-20',
      industry: 'O - Public Administration and Defence',
      country: 'Iran',
      product: 'Trade Finance / Letter of Credit',
      sourceOfFunds: 'Government Contracts',
      volume: '5,000,000'
    }
  }
];