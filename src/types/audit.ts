export type Role = 'lead_auditor' | 'field_auditor' | 'remediation_owner' | 'executive_viewer' | string;

export interface RoleDefinition {
  id: string;
  name: string;
  label: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
  userCount?: number;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  roleId?: string;
  role: Role;
  roleLabel: string;
  department: string;
  title: string;
  initials: string;
  status?: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: string;
  createdAt?: string;
}

export interface UserAccount extends UserProfile {
  roleId: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface PermissionDefinition {
  code: string;
  label: string;
  category: 'Audits & Workflow' | 'Fieldwork Controls' | 'Findings & CAPA' | 'Verification & Reports' | 'Administration';
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  { code: 'audits:create', label: 'Create & Schedule Audits', category: 'Audits & Workflow', description: 'Schedule new compliance audit programs and define scopes.' },
  { code: 'audits:edit_stages', label: 'Configure 6-Stage Workflow', category: 'Audits & Workflow', description: 'Enable/disable phases (Planning, Pre-Exit, etc.) and advance milestones.' },
  { code: 'audits:delete', label: 'Archive / Delete Audits', category: 'Audits & Workflow', description: 'Remove audit engagements from active records.' },
  
  { code: 'controls:test', label: 'Execute Control Tests', category: 'Fieldwork Controls', description: 'Mark controls as pass, fail, or partial and enter observation notes.' },
  { code: 'controls:manage', label: 'Add / Modify Control Checklists', category: 'Fieldwork Controls', description: 'Customize standard control checklists for regulatory frameworks.' },

  { code: 'findings:create', label: 'Log Non-Compliance Findings', category: 'Findings & CAPA', description: 'Register non-compliance observations and set risk severities.' },
  { code: 'findings:edit', label: 'Edit Finding Details', category: 'Findings & CAPA', description: 'Update titles, descriptions, and assigned ownership.' },
  { code: 'findings:delete', label: 'Dismiss / Delete Findings', category: 'Findings & CAPA', description: 'Remove invalid or duplicate finding records.' },

  { code: 'capa:submit', label: 'Submit CAPA Remediation Plans', category: 'Findings & CAPA', description: 'Author root cause analysis, corrective, and preventive action plans.' },
  { code: 'evidence:upload', label: 'Attach Remediation Evidence', category: 'Findings & CAPA', description: 'Upload configuration files, pull request links, and proof artifacts.' },

  { code: 'verification:approve', label: 'Approve Verification & Close', category: 'Verification & Reports', description: 'Certify formal compliance verification sign-off and close issues.' },
  { code: 'verification:reject', label: 'Reject Verification & Request Action', category: 'Verification & Reports', description: 'Return remediations to open status with corrective feedback.' },
  { code: 'reports:generate', label: 'Generate Formal Audit Reports', category: 'Verification & Reports', description: 'Produce executive summaries and regulatory compliance packets.' },
  { code: 'reports:export', label: 'Export Data (CSV / JSON / PDF)', category: 'Verification & Reports', description: 'Download raw findings spreadsheets and print-ready dossiers.' },

  { code: 'users:manage', label: 'Manage User Accounts', category: 'Administration', description: 'Create, modify, assign roles, and deactivate user accounts in SQLite.' },
  { code: 'roles:manage', label: 'Manage RBAC Roles & Permissions', category: 'Administration', description: 'Define custom roles and configure granular permission matrices in SQLite.' },
  { code: 'notifications:manage', label: 'Configure Email Notification Rules', category: 'Administration', description: 'Enable or disable stakeholder email trigger rules.' },
  { code: 'frameworks:manage', label: 'Manage Standards & Regulatory Frameworks', category: 'Administration', description: 'Add, update, or retire compliance standards, ISO controls, and statutory frameworks.' },
  { code: 'departments:manage', label: 'Manage Departments & Business Units', category: 'Administration', description: 'Add, restructure, and configure enterprise business units, risk tiers, and unit heads.' }
];

export interface FrameworkDefinition {
  id: string;
  code: string;
  name: string;
  governingBody: string;
  version: string;
  cadence: 'Annual' | 'Semi-annual' | 'Quarterly' | 'Continuous';
  description: string;
  status: 'active' | 'in_revision' | 'retired';
  auditCount?: number;
  findingCount?: number;
  createdAt: string;
}

export interface DepartmentDefinition {
  id: string;
  code: string;
  name: string;
  headName: string;
  headEmail: string;
  riskTier: 'High' | 'Medium' | 'Low';
  inherentRiskScore?: number;
  rcmCount?: number;
  highRiskCount?: number;
  mediumRiskCount?: number;
  lowRiskCount?: number;
  description: string;
  status: 'active' | 'restructuring' | 'inactive';
  employeeCount?: number;
  auditCount?: number;
  findingCount?: number;
  createdAt: string;
}

export type RiskCategory = 
  | 'Financial' 
  | 'Operational' 
  | 'Compliance' 
  | 'Strategic' 
  | 'Cybersecurity' 
  | 'Reputational';

export interface RiskControlMatrixItem {
  id: string;
  departmentId: string;
  departmentCode?: string;
  departmentName: string;
  process: string;
  subProcess: string;
  riskRefCode: string;
  riskDescription: string;
  riskCategory: RiskCategory;
  riskEvent?: string;
  inherentLikelihood: number; // 1 to 5
  inherentImpact: number;     // 1 to 5
  inherentRiskScore: number;  // likelihood * impact (1 to 25)
  inherentRiskTier: 'High' | 'Medium' | 'Low';
  controlRefCode?: string;
  controlName: string;
  controlDescription: string;
  controlType: 'Preventive' | 'Detective' | 'Corrective';
  controlMethod: 'Automated' | 'Manual' | 'Semi-Automated';
  controlFrequency: 'Continuous' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'Per-Transaction';
  controlOwner: string;
  controlEffectiveness: 'Effective' | 'Partially Effective' | 'Ineffective' | 'Not Tested';
  residualRiskScore?: number;
  residualRiskTier?: 'High' | 'Medium' | 'Low';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type FrameworkType = string;

export type AuditWorkflowStage = 
  | 'Planning' 
  | 'Preparation' 
  | 'Fieldwork' 
  | 'Pre-Exit Meeting' 
  | 'Exit Meeting' 
  | 'Reporting';

export const ALL_WORKFLOW_STAGES: AuditWorkflowStage[] = [
  'Planning',
  'Preparation',
  'Fieldwork',
  'Pre-Exit Meeting',
  'Exit Meeting',
  'Reporting'
];

export interface StageChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface AuditStageConfiguration {
  stage: AuditWorkflowStage;
  enabled: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  targetDate?: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  meetingMinutes?: string;
  checklist: StageChecklistItem[];
}

export type ControlStatus = 'pass' | 'fail' | 'not_tested' | 'partial';

export interface AuditControl {
  id: string;
  auditId: string;
  code: string;
  name: string;
  category: string;
  requirement: string;
  status: ControlStatus;
  testedBy?: string;
  testedAt?: string;
  notes?: string;
  findingId?: string;
}

export interface Audit {
  id: string;
  title: string;
  framework: FrameworkType;
  department: string;
  leadAuditorId: string;
  leadAuditorName: string;
  scope: string;
  startDate: string;
  endDate: string;
  currentStage: AuditWorkflowStage;
  stageConfigs: Record<AuditWorkflowStage, AuditStageConfiguration>;
  progress: number;
  controlsCount: number;
  findingsCount: number;
}

export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type FindingStatus = 
  | 'Draft' 
  | 'Open' 
  | 'Remediation Proposed' 
  | 'Verification Pending' 
  | 'Closed';

export interface RemediationEvidence {
  id: string;
  fileName: string;
  fileType: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  linkRef?: string;
}

export interface CAPAPlan {
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  targetDate: string;
  submittedAt?: string;
  submittedBy?: string;
}

export interface VerificationRecord {
  verifiedBy?: string;
  verifiedAt?: string;
  status?: 'approved' | 'rejected';
  notes?: string;
  signOffTitle?: string;
}

export interface AuditTrailEvent {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  timestamp: string;
  comment?: string;
}

export interface Finding {
  id: string;
  auditId: string;
  auditTitle: string;
  controlCode: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  framework: FrameworkType;
  department: string;
  identifiedDate: string;
  dueDate: string;
  assignedOwnerId: string;
  assignedOwnerName: string;
  assignedOwnerEmail: string;
  status: FindingStatus;
  capa: CAPAPlan;
  evidence: RemediationEvidence[];
  remediationNotes: string;
  verification: VerificationRecord;
  history: AuditTrailEvent[];
}

export type NotificationTrigger = 
  | 'finding_created' 
  | 'capa_submitted' 
  | 'evidence_uploaded' 
  | 'verification_requested' 
  | 'verification_approved' 
  | 'verification_rejected' 
  | 'sla_overdue_warning' 
  | 'audit_stage_changed'
  | 'audit_report_published';

export interface EmailDispatchLog {
  id: string;
  timestamp: string;
  recipientEmail: string;
  recipientName: string;
  recipientRole: string;
  triggerEvent: NotificationTrigger;
  triggerLabel: string;
  subject: string;
  htmlContent: string;
  status: 'delivered' | 'sent' | 'queued';
  relatedFindingId?: string;
  relatedAuditId?: string;
}

export interface NotificationRule {
  id: string;
  triggerEvent: NotificationTrigger;
  name: string;
  description: string;
  enabled: boolean;
  targetRoles: Role[];
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'alert';
  linkFindingId?: string;
  linkAuditId?: string;
}
