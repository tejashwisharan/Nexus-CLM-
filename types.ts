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

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  uploaded: boolean;
}

export interface RiskFactor {
  category: string;
  description: string;
  score: number; // 0-100
  severity: RiskLevel;
}

export interface ScreeningResult {
  adverseMediaFound: boolean;
  pepStatus: boolean;
  sanctionsHit: boolean;
  summary: string;
}

export interface EntityProfile {
  id: string;
  type: EntityType;
  name: string; // Full name or Company name
  details: Record<string, any>; // Dynamic fields
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
}

export interface SearchResult {
  entity: EntityProfile;
  matchReason: string;
}