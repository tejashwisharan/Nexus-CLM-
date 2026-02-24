
export enum EntityType {
  INDIVIDUAL = 'Individual',
  COMPANY = 'Company',
  JOINT_VENTURE = 'Joint Venture',
  NGO = 'NGO',
  PARTNERSHIP = 'Partnership',
  TRUST = 'Trust'
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum ApplicationStatus {
  DRAFT = 'Draft',
  PENDING_SCREENING = 'Pending Screening',
  PEER_REVIEW = 'Peer Review', // Low/Medium Risk awaiting final check
  REVIEW_REQUIRED = 'EDD Review', // High Risk / Sanctions
  WAIVER_REQUESTED = 'Waiver Requested', // Policy Exception needed
  PERIODIC_REVIEW = 'Periodic Review', // PKYC: Scheduled or Event-Driven
  OFFBOARDING_REQUESTED = 'Off-boarding', // Client requested exit
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  OFFBOARDED = 'Off-boarded' // Closed
}

export type VerificationStatus = 'Pending' | 'Scanning' | 'Verified' | 'Flagged';

export interface ForensicResult {
  isForged: boolean;
  score: number; // 0-100% confidence of authenticity
  factors: {
    metadata: 'Consistent' | 'Inconsistent' | 'Missing';
    ela: 'Pass' | 'Fail' | 'Inconclusive'; // Error Level Analysis
    fonts: 'Consistent' | 'Manipulation Detected';
    pixel: 'Natural' | 'Artifacts Detected';
  };
  reason?: string;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  uploaded: boolean;
  triggerReason?: string; // Why is this document required?
  category?: 'Standard' | 'Risk' | 'Product' | 'Jurisdiction'; // For grouping in UI
  verificationStatus?: VerificationStatus;
  forensicAnalysis?: ForensicResult;
}

export interface RiskFactor {
  category: string;
  description: string;
  score: number; // 0-100
  severity: RiskLevel;
}

export type ScreeningHitType = 'Sanction' | 'PEP' | 'Adverse Media' | 'RCA';
export type MatchStatus = 'Potential' | 'Matched' | 'Unmatched' | 'Unable to Resolve';

export interface ScreeningHit {
  id: string;
  name: string; // Name found in the list
  type: ScreeningHitType;
  score: number; // Fuzzy match score (0-100)
  description: string;
  status: MatchStatus;
  listSource?: string; // e.g., "OFAC", "WorldCheck"
}

export interface ScreeningResult {
  adverseMediaFound: boolean;
  pepStatus: boolean;
  sanctionsHit: boolean;
  summary: string;
  hits: ScreeningHit[];
}

export enum Region {
  USA = 'USA',
  EU = 'EU',
  APAC = 'APAC'
}

export interface TaxInfo {
  taxId?: string; // Generic Tax ID
  fatcaStatus?: string; // USA
  crsNumber?: string; // EU/APAC
  tin?: string; // Tax Identification Number
  giin?: string; // Global Intermediary Identification Number (FATCA)
}

export interface EntityProfile {
  id: string;
  type: EntityType;
  name: string; // Full name or Company name
  details: Record<string, any>; // Dynamic fields
  region?: Region; // New field for jurisdiction
  taxInfo?: TaxInfo; // New field for tax compliance
  documents: DocumentRequirement[];
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  screeningResult?: ScreeningResult;
  status: ApplicationStatus;
  createdAt: string;
  enrichedData?: string; // AI Summary
  waiverReason?: string; // If waiver requested
  approvedBy?: 'AI' | 'Analyst'; // Track who approved the entity
  
  // PKYC Specific Fields
  reviewTrigger?: string; // 'Scheduled' | 'Transaction Monitoring' | 'PII Update'
  nextReviewDate?: string;
  lastReviewDate?: string;

  // Off-boarding Fields
  offboardingReason?: string;

  // Legacy / Migration Fields
  isLegacy?: boolean; // Imported from previous system
  amlCompliant?: boolean; // Flag for legacy entities
}

export interface SearchResult {
  entity: EntityProfile;
  matchReason: string;
}
