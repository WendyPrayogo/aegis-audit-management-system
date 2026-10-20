import { 
  Audit, 
  AuditControl, 
  Finding, 
  UserProfile, 
  EmailDispatchLog, 
  NotificationRule, 
  InAppNotification,
  AuditWorkflowStage,
  AuditStageConfiguration,
  RoleDefinition,
  FrameworkDefinition,
  DepartmentDefinition,
  RiskControlMatrixItem
} from '../types/audit';

export const INITIAL_FRAMEWORKS: FrameworkDefinition[] = [
  {
    id: 'fw-iso-27001',
    code: 'ISO 27001',
    name: 'ISO/IEC 27001:2022 Information Security Management System (ISMS)',
    governingBody: 'International Organization for Standardization (ISO)',
    version: '2022 Revision',
    cadence: 'Annual',
    description: 'International standard specifying requirements for establishing, implementing, maintaining, and continually improving an ISMS.',
    status: 'active',
    auditCount: 1,
    findingCount: 2,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'fw-soc-2',
    code: 'SOC 2 Type II',
    name: 'SOC 2 Type II Trust Services Criteria (Security, Confidentiality & Availability)',
    governingBody: 'American Institute of Certified Public Accountants (AICPA)',
    version: '2026 Criteria',
    cadence: 'Annual',
    description: 'Independent evaluation of operational effectiveness of controls relevant to security, availability, and processing integrity.',
    status: 'active',
    auditCount: 1,
    findingCount: 3,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'fw-hipaa',
    code: 'HIPAA Security',
    name: 'Health Insurance Portability and Accountability Act - Security Rule',
    governingBody: 'U.S. Department of Health & Human Services (HHS OCR)',
    version: '45 CFR Part 160/164',
    cadence: 'Annual',
    description: 'National standards to protect individuals electronic personal health information (ePHI) created, received, used, or maintained.',
    status: 'active',
    auditCount: 1,
    findingCount: 0,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'fw-sox',
    code: 'SOX 404',
    name: 'Sarbanes-Oxley Act Section 404 (IT General Controls - ITGC)',
    governingBody: 'Securities and Exchange Commission (SEC) / PCAOB',
    version: 'Section 404(b)',
    cadence: 'Semi-annual',
    description: 'Internal control evaluation over financial reporting systems, change management, and privileged database ledger access.',
    status: 'active',
    auditCount: 1,
    findingCount: 1,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'fw-gdpr',
    code: 'GDPR Privacy',
    name: 'General Data Protection Regulation (Regulation EU 2016/679)',
    governingBody: 'European Data Protection Board (EDPB)',
    version: 'EU 2016/679',
    cadence: 'Annual',
    description: 'European privacy regulation governing processing of personal data, lawful consent, data subject rights, and cross-border transfers.',
    status: 'active',
    auditCount: 0,
    findingCount: 0,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'fw-osha',
    code: 'OSHA Safety',
    name: 'Occupational Safety and Health Standards & Physical Facility Security',
    governingBody: 'U.S. Department of Labor (OSHA)',
    version: '29 CFR 1910',
    cadence: 'Annual',
    description: 'Workplace safety, data center physical security, fire suppression, emergency power systems, and facility ingress controls.',
    status: 'active',
    auditCount: 1,
    findingCount: 0,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'fw-pci-dss',
    code: 'PCI-DSS v4.0',
    name: 'Payment Card Industry Data Security Standard v4.0.1',
    governingBody: 'PCI Security Standards Council',
    version: 'v4.0.1',
    cadence: 'Quarterly',
    description: 'Security baseline for organizations accepting, processing, storing, or transmitting cardholder data.',
    status: 'active',
    auditCount: 0,
    findingCount: 0,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'fw-nist-csf',
    code: 'NIST CSF 2.0',
    name: 'NIST Cybersecurity Framework 2.0 (Govern, Identify, Protect, Detect, Respond, Recover)',
    governingBody: 'National Institute of Standards and Technology (NIST)',
    version: 'CSF 2.0',
    cadence: 'Continuous',
    description: 'Voluntary guidance based on existing standards, guidelines, and practices for critical infrastructure cybersecurity risk.',
    status: 'active',
    auditCount: 0,
    findingCount: 0,
    createdAt: '2026-01-01 00:00:00'
  }
];

export const INITIAL_DEPARTMENTS: DepartmentDefinition[] = [
  {
    id: 'dept-infra',
    code: 'DEPT-INFRA',
    name: 'Cloud Infrastructure',
    headName: 'Dev Patel',
    headEmail: 'd.patel@aegisaudit.internal',
    riskTier: 'High',
    description: 'AWS multi-region VPC architectures, Kubernetes clusters, KMS encryption, Terraform CI/CD automation, and cloud IAM.',
    status: 'active',
    employeeCount: 42,
    auditCount: 2,
    findingCount: 2,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'dept-eng',
    code: 'DEPT-ENG',
    name: 'Engineering',
    headName: 'Marcus Vance',
    headEmail: 'm.vance@aegisaudit.internal',
    riskTier: 'Medium',
    description: 'Application codebases, microservice architectures, API gateways, dependency scanning, and automated regression pipelines.',
    status: 'active',
    employeeCount: 128,
    auditCount: 1,
    findingCount: 2,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'dept-fin',
    code: 'DEPT-FIN',
    name: 'Finance & Payroll',
    headName: 'Kevin Zhao',
    headEmail: 'k.zhao@aegisaudit.internal',
    riskTier: 'High',
    description: 'ERP general ledgers, financial reporting software, billing gateways, banking integration APIs, and dual-authorization segregation.',
    status: 'active',
    employeeCount: 24,
    auditCount: 1,
    findingCount: 1,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'dept-data',
    code: 'DEPT-DATA',
    name: 'Data & Privacy',
    headName: 'Elena Rostova',
    headEmail: 'e.rostova@aegisaudit.internal',
    riskTier: 'High',
    description: 'Patient health records (ePHI) processing, analytical warehouses, data retention schedules, GDPR anonymization, and S3 encryption.',
    status: 'active',
    employeeCount: 35,
    auditCount: 1,
    findingCount: 0,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'dept-ops',
    code: 'DEPT-OPS',
    name: 'Operations',
    headName: 'Elena Rostova',
    headEmail: 'e.rostova@aegisaudit.internal',
    riskTier: 'Medium',
    description: 'Physical data center facilities, electrical distribution units, environmental temperature controls, and badge entry logs.',
    status: 'active',
    employeeCount: 18,
    auditCount: 1,
    findingCount: 0,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'dept-sec',
    code: 'DEPT-SEC',
    name: 'Security Operations',
    headName: 'Amara Okafor',
    headEmail: 'a.okafor@aegisaudit.internal',
    riskTier: 'High',
    description: 'Security Information and Event Management (SIEM), incident response playbooks, endpoint detection, and penetration testing.',
    status: 'active',
    employeeCount: 15,
    auditCount: 0,
    findingCount: 0,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'dept-gov',
    code: 'DEPT-GOV',
    name: 'Internal Audit & Governance',
    headName: 'Marcus Vance',
    headEmail: 'm.vance@aegisaudit.internal',
    riskTier: 'Low',
    description: 'Enterprise governance committee, internal audit scheduling, statutory regulatory matrix, and board reporting.',
    status: 'active',
    employeeCount: 8,
    auditCount: 0,
    findingCount: 0,
    createdAt: '2026-01-01 00:00:00'
  }
];

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'role-lead-auditor',
    name: 'lead_auditor',
    label: 'Lead Auditor & Audit Director',
    description: 'Full administrative authority: schedule audits, configure workflow stages, advance phases, log findings, approve verification sign-offs, and certify formal reports.',
    isSystem: true,
    permissions: [
      'audits:create', 'audits:edit_stages', 'audits:delete',
      'controls:test', 'controls:manage',
      'findings:create', 'findings:edit', 'findings:delete',
      'capa:submit', 'evidence:upload',
      'verification:approve', 'verification:reject',
      'reports:generate', 'reports:export',
      'users:manage', 'roles:manage', 'notifications:manage'
    ],
    userCount: 1,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'role-field-auditor',
    name: 'field_auditor',
    label: 'Field Auditor & Compliance Specialist',
    description: 'Audit fieldwork authority: execute control tests, sample artifacts, log compliance findings, and review auditee evidence.',
    isSystem: true,
    permissions: [
      'audits:edit_stages',
      'controls:test',
      'findings:create', 'findings:edit',
      'capa:submit', 'evidence:upload',
      'verification:approve', 'verification:reject',
      'reports:generate', 'reports:export'
    ],
    userCount: 1,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'role-remediation-owner',
    name: 'remediation_owner',
    label: 'Auditee & Remediation Owner',
    description: 'Operational auditee: view assigned non-compliance findings, propose CAPA root cause plans, attach evidence, and request verification.',
    isSystem: true,
    permissions: [
      'findings:edit',
      'capa:submit',
      'evidence:upload'
    ],
    userCount: 2,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'role-executive-viewer',
    name: 'executive_viewer',
    label: 'Executive Stakeholder & VP',
    description: 'Governance & Board oversight: read-only access to executive dashboard, KPI compliance scorecards, audit progression, and published reports.',
    isSystem: true,
    permissions: [
      'reports:generate',
      'reports:export'
    ],
    userCount: 1,
    createdAt: '2026-01-01 00:00:00'
  },
  {
    id: 'role-security-analyst',
    name: 'security_analyst',
    label: 'Security Risk & Vulnerability Analyst',
    description: 'Custom specialized role: technical vulnerability assessment, control testing, and remediation verification review.',
    isSystem: false,
    permissions: [
      'controls:test',
      'findings:create',
      'evidence:upload',
      'reports:generate'
    ],
    userCount: 1,
    createdAt: '2026-01-15 10:00:00'
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-lead-auditor',
    name: 'Marcus Vance',
    email: 'm.vance@aegisaudit.internal',
    roleId: 'role-lead-auditor',
    role: 'lead_auditor',
    roleLabel: 'Lead Auditor & Audit Director',
    department: 'Internal Audit & Governance',
    title: 'Director of Compliance & Assurance',
    initials: 'MV',
    status: 'active',
    lastLoginAt: '2026-03-18 08:30:00'
  },
  {
    id: 'user-field-auditor',
    name: 'Elena Rostova',
    email: 'e.rostova@aegisaudit.internal',
    roleId: 'role-field-auditor',
    role: 'field_auditor',
    roleLabel: 'Field Auditor & Compliance Specialist',
    department: 'Cybersecurity Assurance',
    title: 'Senior Information Security Auditor',
    initials: 'ER',
    status: 'active',
    lastLoginAt: '2026-03-18 09:12:00'
  },
  {
    id: 'user-remediation-owner',
    name: 'Dev Patel',
    email: 'd.patel@aegisaudit.internal',
    roleId: 'role-remediation-owner',
    role: 'remediation_owner',
    roleLabel: 'Auditee & Remediation Owner',
    department: 'Cloud Infrastructure & DevOps',
    title: 'Principal Cloud Platform Architect',
    initials: 'DP',
    status: 'active',
    lastLoginAt: '2026-03-17 17:45:00'
  },
  {
    id: 'user-executive',
    name: 'Sarah Jenkins',
    email: 's.jenkins@aegisaudit.internal',
    roleId: 'role-executive-viewer',
    role: 'executive_viewer',
    roleLabel: 'Executive Stakeholder & VP',
    department: 'Executive Governance Board',
    title: 'Vice President of Enterprise Risk & Trust',
    initials: 'SJ',
    status: 'active',
    lastLoginAt: '2026-03-16 16:20:00'
  },
  {
    id: 'user-amara-okafor',
    name: 'Amara Okafor',
    email: 'a.okafor@aegisaudit.internal',
    roleId: 'role-security-analyst',
    role: 'security_analyst',
    roleLabel: 'Security Risk & Vulnerability Analyst',
    department: 'Security Operations',
    title: 'Cloud Security Engineer',
    initials: 'AO',
    status: 'active',
    lastLoginAt: '2026-03-15 13:10:00'
  },
  {
    id: 'user-kevin-zhao',
    name: 'Kevin Zhao',
    email: 'k.zhao@aegisaudit.internal',
    roleId: 'role-remediation-owner',
    role: 'remediation_owner',
    roleLabel: 'Auditee & Remediation Owner',
    department: 'Finance & Payroll',
    title: 'ERP Systems Lead',
    initials: 'KZ',
    status: 'active',
    lastLoginAt: '2026-03-14 11:05:00'
  }
];

export const createDefaultStageConfigs = (
  disabledStages: AuditWorkflowStage[] = []
): Record<AuditWorkflowStage, AuditStageConfiguration> => {
  return {
    'Planning': {
      stage: 'Planning',
      enabled: !disabledStages.includes('Planning'),
      status: 'pending',
      targetDate: '2026-02-18',
      notes: 'Define audit scope, regulatory framework boundaries, stakeholders, and schedule initial kickoff.',
      checklist: [
        { id: 'pl-1', text: 'Define audit charter, objective, and regulatory scope', done: false },
        { id: 'pl-2', text: 'Identify key auditee stakeholders & lead audit team', done: false },
        { id: 'pl-3', text: 'Configure and approve audit workflow stages in planning', done: false },
        { id: 'pl-4', text: 'Conduct initial kickoff orientation meeting', done: false }
      ]
    },
    'Preparation': {
      stage: 'Preparation',
      enabled: !disabledStages.includes('Preparation'),
      status: 'pending',
      targetDate: '2026-02-24',
      notes: 'Information request list (IRL) dispatch, review baseline policies, and assign control sample sets.',
      checklist: [
        { id: 'pr-1', text: 'Send Information Request List (IRL) to department leads', done: false },
        { id: 'pr-2', text: 'Gather baseline architecture diagrams and policy documents', done: false },
        { id: 'pr-3', text: 'Select sampling population for control testing', done: false },
        { id: 'pr-4', text: 'Provision auditor access tokens to testing repositories & logs', done: false }
      ]
    },
    'Fieldwork': {
      stage: 'Fieldwork',
      enabled: !disabledStages.includes('Fieldwork'),
      status: 'pending',
      targetDate: '2026-03-20',
      notes: 'Execute control verification tests, sample artifacts, and log non-compliance findings.',
      checklist: [
        { id: 'fw-1', text: 'Execute control test procedures against framework criteria', done: false },
        { id: 'fw-2', text: 'Sample evidence records for privileged access and configurations', done: false },
        { id: 'fw-3', text: 'Log non-compliance findings and assign initial risk severities', done: false },
        { id: 'fw-4', text: 'Validate root cause initial feedback with auditees', done: false }
      ]
    },
    'Pre-Exit Meeting': {
      stage: 'Pre-Exit Meeting',
      enabled: !disabledStages.includes('Pre-Exit Meeting'),
      status: 'pending',
      targetDate: '2026-03-24',
      notes: 'Informal walkthrough with auditees to present preliminary findings and prevent surprises.',
      meetingMinutes: 'Preliminary walkthrough conducted with department leads to review draft observations before final executive readout.',
      checklist: [
        { id: 'pex-1', text: 'Draft preliminary findings memo and risk ratings', done: false },
        { id: 'pex-2', text: 'Review draft observations with operational process owners', done: false },
        { id: 'pex-3', text: 'Allow auditees 48 hours to submit factual clarifications', done: false },
        { id: 'pex-4', text: 'Agree on disputed findings classification before executive readout', done: false }
      ]
    },
    'Exit Meeting': {
      stage: 'Exit Meeting',
      enabled: !disabledStages.includes('Exit Meeting'),
      status: 'pending',
      targetDate: '2026-03-28',
      notes: 'Formal presentation to executive leadership, auditees, and governance risk committee.',
      meetingMinutes: 'Formal exit conference convened with VP and Director. All open findings presented with agreed remediation milestones.',
      checklist: [
        { id: 'ex-1', text: 'Convene formal exit conference with leadership', done: false },
        { id: 'ex-2', text: 'Present executive summary of findings and compliance posture', done: false },
        { id: 'ex-3', text: 'Obtain formal management response & target CAPA dates', done: false },
        { id: 'ex-4', text: 'Sign off exit meeting minutes & distribute to stakeholders', done: false }
      ]
    },
    'Reporting': {
      stage: 'Reporting',
      enabled: !disabledStages.includes('Reporting'),
      status: 'pending',
      targetDate: '2026-04-05',
      notes: 'Publish final audit summary report, distribute to executive stakeholders, and initiate remediation tracking.',
      checklist: [
        { id: 'rp-1', text: 'Draft comprehensive audit report with executive summary', done: false },
        { id: 'rp-2', text: 'Obtain Lead Auditor & Director formal certification signature', done: false },
        { id: 'rp-3', text: 'Publish final report and distribute via email notifications', done: false },
        { id: 'rp-4', text: 'Transition all open findings to CAPA remediation tracking hub', done: false }
      ]
    }
  };
};

// Build configured initial audits
const isoStages = createDefaultStageConfigs();
isoStages['Planning'].status = 'completed';
isoStages['Planning'].checklist.forEach(c => c.done = true);
isoStages['Preparation'].status = 'completed';
isoStages['Preparation'].checklist.forEach(c => c.done = true);
isoStages['Fieldwork'].status = 'in_progress';
isoStages['Fieldwork'].checklist[0].done = true;
isoStages['Fieldwork'].checklist[1].done = true;

const socStages = createDefaultStageConfigs();
socStages['Planning'].status = 'completed';
socStages['Planning'].checklist.forEach(c => c.done = true);
socStages['Preparation'].status = 'completed';
socStages['Preparation'].checklist.forEach(c => c.done = true);
socStages['Fieldwork'].status = 'completed';
socStages['Fieldwork'].checklist.forEach(c => c.done = true);
socStages['Pre-Exit Meeting'].status = 'in_progress';
socStages['Pre-Exit Meeting'].checklist[0].done = true;
socStages['Pre-Exit Meeting'].checklist[1].done = true;

// HIPAA audit has Pre-Exit Meeting disabled in planning configuration
const hipaaStages = createDefaultStageConfigs(['Pre-Exit Meeting']);
hipaaStages['Planning'].status = 'completed';
hipaaStages['Planning'].checklist.forEach(c => c.done = true);
hipaaStages['Preparation'].status = 'completed';
hipaaStages['Preparation'].checklist.forEach(c => c.done = true);
hipaaStages['Fieldwork'].status = 'completed';
hipaaStages['Fieldwork'].checklist.forEach(c => c.done = true);
hipaaStages['Exit Meeting'].status = 'completed';
hipaaStages['Exit Meeting'].checklist.forEach(c => c.done = true);
hipaaStages['Reporting'].status = 'completed';
hipaaStages['Reporting'].checklist.forEach(c => c.done = true);

const soxStages = createDefaultStageConfigs();
soxStages['Planning'].status = 'completed';
soxStages['Planning'].checklist.forEach(c => c.done = true);
soxStages['Preparation'].status = 'in_progress';
soxStages['Preparation'].checklist[0].done = true;

const oshaStages = createDefaultStageConfigs(['Pre-Exit Meeting', 'Exit Meeting']);
oshaStages['Planning'].status = 'in_progress';
oshaStages['Planning'].checklist[0].done = true;

export const INITIAL_AUDITS: Audit[] = [
  {
    id: 'AUD-2026-001',
    title: 'Q1 2026 ISO/IEC 27001 Surveillance Audit',
    framework: 'ISO 27001',
    department: 'Cloud Infrastructure',
    leadAuditorId: 'user-lead-auditor',
    leadAuditorName: 'Marcus Vance',
    scope: 'AWS Multi-region Production VPCs, Kubernetes clusters, IAM policies, and cryptographic key vaults.',
    startDate: '2026-02-15',
    endDate: '2026-03-30',
    currentStage: 'Fieldwork',
    stageConfigs: isoStages,
    progress: 68,
    controlsCount: 12,
    findingsCount: 3
  },
  {
    id: 'AUD-2026-002',
    title: 'SOC 2 Type II Annual Trust Services Criteria Review',
    framework: 'SOC 2 Type II',
    department: 'Engineering',
    leadAuditorId: 'user-lead-auditor',
    leadAuditorName: 'Marcus Vance',
    scope: 'CI/CD deployment pipeline, change management tickets, access control reviews, and vulnerability remediation SLAs.',
    startDate: '2026-01-10',
    endDate: '2026-04-15',
    currentStage: 'Pre-Exit Meeting',
    stageConfigs: socStages,
    progress: 82,
    controlsCount: 16,
    findingsCount: 4
  },
  {
    id: 'AUD-2026-003',
    title: 'HIPAA Security Rule ePHI Safeguards Review',
    framework: 'HIPAA Security',
    department: 'Data & Privacy',
    leadAuditorId: 'user-field-auditor',
    leadAuditorName: 'Elena Rostova',
    scope: 'Patient data ingestion pipelines, S3 bucket encryption, database access logs, and business associate agreements.',
    startDate: '2025-11-01',
    endDate: '2026-01-20',
    currentStage: 'Reporting',
    stageConfigs: hipaaStages,
    progress: 100,
    controlsCount: 10,
    findingsCount: 2
  },
  {
    id: 'AUD-2026-004',
    title: 'SOX Section 404 IT General Controls (ITGC) Evaluation',
    framework: 'SOX 404',
    department: 'Finance & Payroll',
    leadAuditorId: 'user-lead-auditor',
    leadAuditorName: 'Marcus Vance',
    scope: 'ERP ledger access controls, segregation of duties in payment gateways, and privileged database log retention.',
    startDate: '2026-02-01',
    endDate: '2026-05-10',
    currentStage: 'Preparation',
    stageConfigs: soxStages,
    progress: 35,
    controlsCount: 14,
    findingsCount: 2
  },
  {
    id: 'AUD-2026-005',
    title: 'OSHA Workplace Safety & Data Center Physical Security Audit',
    framework: 'OSHA Safety',
    department: 'Operations',
    leadAuditorId: 'user-field-auditor',
    leadAuditorName: 'Elena Rostova',
    scope: 'Primary colocation facilities, power distribution units, fire suppression, and badge access logs.',
    startDate: '2026-03-15',
    endDate: '2026-04-20',
    currentStage: 'Planning',
    stageConfigs: oshaStages,
    progress: 15,
    controlsCount: 8,
    findingsCount: 0
  }
];

export const INITIAL_CONTROLS: AuditControl[] = [
  // Controls for AUD-2026-001 (ISO 27001)
  {
    id: 'CTRL-001',
    auditId: 'AUD-2026-001',
    code: 'A.9.2.1',
    name: 'User Registration & Access Provisioning',
    category: 'Access Control',
    requirement: 'A formal user registration and de-registration process shall be implemented for assigning access rights.',
    status: 'pass',
    testedBy: 'Elena Rostova',
    testedAt: '2026-02-22',
    notes: 'Sampled 25 new hire onboarding tickets in Jira. 100% matched authorized RBAC roles.'
  },
  {
    id: 'CTRL-002',
    auditId: 'AUD-2026-001',
    code: 'A.9.4.2',
    name: 'Privileged Access Token & SSH Key Hardening',
    category: 'Access Control',
    requirement: 'Allocation and use of privileged access rights shall be strictly restricted and bound to hardware MFA.',
    status: 'fail',
    testedBy: 'Elena Rostova',
    testedAt: '2026-02-26',
    notes: 'Failed: 4 production nodes in us-east allowed direct root login without hardware token requirement.',
    findingId: 'F-2026-101'
  },
  {
    id: 'CTRL-003',
    auditId: 'AUD-2026-001',
    code: 'A.10.1.1',
    name: 'Cryptographic Controls & Key Lifecycle',
    category: 'Cryptography',
    requirement: 'A policy on the use of cryptographic controls for data protection shall be defined and applied.',
    status: 'fail',
    testedBy: 'Elena Rostova',
    testedAt: '2026-03-01',
    notes: 'Failed: PostgreSQL snapshot cold storage volume lacked AWS KMS customer-managed key encryption.',
    findingId: 'F-2026-102'
  },
  {
    id: 'CTRL-004',
    auditId: 'AUD-2026-001',
    code: 'A.12.1.2',
    name: 'Change Management & Production Deployment Approvals',
    category: 'Operations Security',
    requirement: 'Changes to organizations, business processes, and IT assets that affect information security shall be controlled.',
    status: 'pass',
    testedBy: 'Marcus Vance',
    testedAt: '2026-03-04',
    notes: 'Reviewed GitHub branch protection rules on main and release branches. Dual code owner approvals strictly enforced.'
  },
  {
    id: 'CTRL-005',
    auditId: 'AUD-2026-001',
    code: 'A.12.4.1',
    name: 'Event Logging & Tamper-Proof Audit Trails',
    category: 'Operations Security',
    requirement: 'Event logs recording user activities, exceptions, and security events shall be produced and kept.',
    status: 'partial',
    testedBy: 'Elena Rostova',
    testedAt: '2026-03-08',
    notes: 'AWS CloudTrail enabled and shipped to write-once S3, but retention policy in secondary VPC is set to 90 days instead of 365 days.'
  },
  {
    id: 'CTRL-006',
    auditId: 'AUD-2026-001',
    code: 'A.18.1.1',
    name: 'Identification of Applicable Legislation & Regulations',
    category: 'Compliance',
    requirement: 'All relevant statutory, regulatory, and contractual requirements shall be explicitly defined.',
    status: 'pass',
    testedBy: 'Marcus Vance',
    testedAt: '2026-03-11',
    notes: 'Legal and compliance matrix reviewed; updated for 2026 statutory amendments.'
  },

  // Controls for AUD-2026-002 (SOC 2)
  {
    id: 'CTRL-007',
    auditId: 'AUD-2026-002',
    code: 'CC6.1',
    name: 'Logical Access Security & Identity Governance',
    category: 'Access Management',
    requirement: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets.',
    status: 'fail',
    testedBy: 'Marcus Vance',
    testedAt: '2026-02-18',
    notes: 'Identified 7 contractor accounts active in identity provider beyond 30 days after contract expiration.',
    findingId: 'F-2026-103'
  },
  {
    id: 'CTRL-008',
    auditId: 'AUD-2026-002',
    code: 'CC7.2',
    name: 'Vulnerability Scanning & Patch Remediation SLAs',
    category: 'System Operations',
    requirement: 'The entity monitors system components and the operation of those components for anomalies and vulnerabilities.',
    status: 'pass',
    testedBy: 'Elena Rostova',
    testedAt: '2026-02-28',
    notes: 'Tenable vulnerability scanner runs daily. Critical CVEs patched within the 7-day SLA target.'
  },
  {
    id: 'CTRL-009',
    auditId: 'AUD-2026-002',
    code: 'CC9.1',
    name: 'Business Continuity & Disaster Recovery Testing',
    category: 'Risk Mitigation',
    requirement: 'The entity tests its business continuity and disaster recovery plans on an annual basis.',
    status: 'pass',
    testedBy: 'Marcus Vance',
    testedAt: '2026-03-05',
    notes: 'Drill executed and verified after remediation of previous finding.'
  }
];

export const INITIAL_FINDINGS: Finding[] = [
  {
    id: 'F-2026-101',
    auditId: 'AUD-2026-001',
    auditTitle: 'Q1 2026 ISO/IEC 27001 Surveillance Audit',
    controlCode: 'A.9.4.2',
    title: 'Root SSH Access Enabled on Production Kubernetes Nodes Without Hardware MFA',
    description: 'During sampling of node baseline configurations in the us-east cluster, four worker nodes maintained direct root SSH authorized_keys without session recording or Step-Up YubiKey MFA enforcement, exposing privileged host control to lateral movement.',
    severity: 'Critical',
    framework: 'ISO 27001',
    department: 'Cloud Infrastructure',
    identifiedDate: '2026-02-26',
    dueDate: '2026-03-25',
    assignedOwnerId: 'user-remediation-owner',
    assignedOwnerName: 'Dev Patel',
    assignedOwnerEmail: 'd.patel@aegisaudit.internal',
    status: 'Verification Pending',
    capa: {
      rootCause: 'Terraform node provisioning module had a fallback parameter permitting default SSH keys during emergency auto-scaling events, which was never deprecated.',
      correctiveAction: 'De-provisioned root SSH keys across all 48 production cluster nodes; enforced AWS Systems Manager (SSM) Session Manager with IAM role validation and MFA prompt.',
      preventiveAction: 'Added a Sentinel policy-as-code check in the CI/CD pipeline preventing Terraform merge if any instance enables port 22 or authorized_keys.',
      targetDate: '2026-03-12',
      submittedAt: '2026-03-10 14:32:00',
      submittedBy: 'Dev Patel'
    },
    evidence: [
      {
        id: 'EVD-001',
        fileName: 'pr_542_terraform_disable_ssh.pdf',
        fileType: 'application/pdf',
        description: 'Merged pull request #542 enforcing SSM Session Manager and removing direct SSH port exposure.',
        uploadedBy: 'Dev Patel',
        uploadedAt: '2026-03-10 14:15:20',
        size: '1.4 MB',
        linkRef: 'https://github.com/internal/infra-core/pull/542'
      },
      {
        id: 'EVD-002',
        fileName: 'ssm_audit_session_logs_march.json',
        fileType: 'application/json',
        description: 'AWS CloudTrail log dump proving 100% of host access requests routed through audited SSM broker.',
        uploadedBy: 'Dev Patel',
        uploadedAt: '2026-03-10 14:28:44',
        size: '4.8 MB'
      }
    ],
    remediationNotes: 'All evidence compiled. The infrastructure team requests formal review and closure verification from the audit lead.',
    verification: {
      notes: ''
    },
    history: [
      {
        id: 'HIST-001',
        action: 'Finding Identified & Logged',
        actor: 'Elena Rostova',
        actorRole: 'Field Auditor',
        timestamp: '2026-02-26 11:20:00',
        comment: 'Identified during A.9.4.2 control testing. Severity categorized as Critical.'
      },
      {
        id: 'HIST-002',
        action: 'Assigned to Remediation Owner',
        actor: 'Marcus Vance',
        actorRole: 'Lead Auditor',
        timestamp: '2026-02-26 14:05:00',
        comment: 'Assigned to Dev Patel with 30-day remediation SLA.'
      },
      {
        id: 'HIST-003',
        action: 'CAPA Remediation Plan Submitted',
        actor: 'Dev Patel',
        actorRole: 'Remediation Owner',
        timestamp: '2026-03-05 09:40:00',
        comment: 'Root cause and corrective action plan entered. Target completion set for March 12.'
      },
      {
        id: 'HIST-004',
        action: 'Remediation Evidence Uploaded & Verification Requested',
        actor: 'Dev Patel',
        actorRole: 'Remediation Owner',
        timestamp: '2026-03-10 14:32:00',
        comment: 'Uploaded Terraform PR and SSM session logs. Status moved to Verification Pending.'
      }
    ]
  },
  {
    id: 'F-2026-102',
    auditId: 'AUD-2026-001',
    auditTitle: 'Q1 2026 ISO/IEC 27001 Surveillance Audit',
    controlCode: 'A.10.1.1',
    title: 'Production Customer Database Backup Snapshots Unencrypted at Rest',
    description: 'PostgreSQL secondary disaster recovery snapshots replicated to the secondary cloud region were created using default storage tier without KMS customer-managed encryption keys (CMEK).',
    severity: 'High',
    framework: 'ISO 27001',
    department: 'Cloud Infrastructure',
    identifiedDate: '2026-03-01',
    dueDate: '2026-03-15',
    assignedOwnerId: 'user-remediation-owner',
    assignedOwnerName: 'Dev Patel',
    assignedOwnerEmail: 'd.patel@aegisaudit.internal',
    status: 'Open',
    capa: {
      rootCause: '',
      correctiveAction: '',
      preventiveAction: '',
      targetDate: ''
    },
    evidence: [],
    remediationNotes: '',
    verification: {},
    history: [
      {
        id: 'HIST-102-1',
        action: 'Finding Identified & Logged',
        actor: 'Elena Rostova',
        actorRole: 'Field Auditor',
        timestamp: '2026-03-01 16:10:00',
        comment: 'Snapshot encryption check failed in secondary region.'
      },
      {
        id: 'HIST-102-2',
        action: 'SLA Escalation Warning Triggered',
        actor: 'System Automated Monitor',
        actorRole: 'System',
        timestamp: '2026-03-16 08:00:00',
        comment: 'Finding past 14-day SLA deadline without submitted CAPA plan.'
      }
    ]
  },
  {
    id: 'F-2026-103',
    auditId: 'AUD-2026-002',
    auditTitle: 'SOC 2 Type II Annual Trust Services Criteria Review',
    controlCode: 'CC6.1',
    title: 'Stale Contractor User Accounts Retained Past 30-Day Deprovisioning SLA',
    description: 'Quarterly user access review identified seven contractor identities retained in active status in the central SSO directory between 45 and 90 days following completion of contract engagements.',
    severity: 'Medium',
    framework: 'SOC 2 Type II',
    department: 'Engineering',
    identifiedDate: '2026-02-18',
    dueDate: '2026-04-05',
    assignedOwnerId: 'user-remediation-owner',
    assignedOwnerName: 'Dev Patel',
    assignedOwnerEmail: 'd.patel@aegisaudit.internal',
    status: 'Remediation Proposed',
    capa: {
      rootCause: 'Disconnection between HR contractor offboarding notices and the IT identity automation webhook.',
      correctiveAction: 'Immediately revoked all 7 stale accounts; reviewed audit logs to confirm no post-contract logins occurred.',
      preventiveAction: 'Configured automated SCIM deprovisioning script tied directly to HR Workday contractor end-date field with daily reconciliation job.',
      targetDate: '2026-04-01',
      submittedAt: '2026-03-04 11:20:00',
      submittedBy: 'Dev Patel'
    },
    evidence: [
      {
        id: 'EVD-103-1',
        fileName: 'okta_deprovisioning_confirmation.pdf',
        fileType: 'application/pdf',
        description: 'Okta directory confirmation report confirming revocation of the 7 contractor identities.',
        uploadedBy: 'Dev Patel',
        uploadedAt: '2026-03-04 11:15:00',
        size: '890 KB'
      }
    ],
    remediationNotes: 'Automated reconciliation script currently running in staging environment. Final production deployment scheduled for verification.',
    verification: {},
    history: [
      {
        id: 'HIST-103-1',
        action: 'Finding Logged',
        actor: 'Marcus Vance',
        actorRole: 'Lead Auditor',
        timestamp: '2026-02-18 10:15:00',
        comment: 'Logged during CC6.1 access control testing.'
      },
      {
        id: 'HIST-103-2',
        action: 'CAPA Proposed',
        actor: 'Dev Patel',
        actorRole: 'Remediation Owner',
        timestamp: '2026-03-04 11:20:00',
        comment: 'CAPA plan submitted and initial deprovisioning proof attached.'
      }
    ]
  },
  {
    id: 'F-2026-104',
    auditId: 'AUD-2026-002',
    auditTitle: 'SOC 2 Type II Annual Trust Services Criteria Review',
    controlCode: 'CC9.1',
    title: 'Incomplete Quarterly Disaster Recovery Failover Simulation Drill',
    description: 'The Q4 2025 cross-region failover test simulation was cut short due to an uncoordinated network routing conflict and lacked documented executive post-mortem review.',
    severity: 'High',
    framework: 'SOC 2 Type II',
    department: 'Cloud Infrastructure',
    identifiedDate: '2026-01-15',
    dueDate: '2026-02-28',
    assignedOwnerId: 'user-remediation-owner',
    assignedOwnerName: 'Dev Patel',
    assignedOwnerEmail: 'd.patel@aegisaudit.internal',
    status: 'Closed',
    capa: {
      rootCause: 'BGP peering failover timing window was misconfigured in Route 53 latency routing policies.',
      correctiveAction: 'Re-conducted full automated failover exercise under simulated peak load on 2026-02-14 with 100% data integrity verified.',
      preventiveAction: 'Established automated chaos testing schedule every 60 days with runbooks verified by Site Reliability Engineering.',
      targetDate: '2026-02-20',
      submittedAt: '2026-02-16 17:00:00',
      submittedBy: 'Dev Patel'
    },
    evidence: [
      {
        id: 'EVD-104-1',
        fileName: 'q1_2026_dr_drill_postmortem_certified.pdf',
        fileType: 'application/pdf',
        description: 'Comprehensive 24-page post-mortem sign-off document with recovery time objective (RTO) of 4 minutes.',
        uploadedBy: 'Dev Patel',
        uploadedAt: '2026-02-16 16:45:00',
        size: '3.2 MB'
      }
    ],
    remediationNotes: 'Drill verified with VP of Infrastructure and Lead Auditor.',
    verification: {
      verifiedBy: 'Marcus Vance',
      verifiedAt: '2026-02-22 15:30:00',
      status: 'approved',
      notes: 'Reviewed RTO/RPO metrics from the re-test. Failover executed within 4 minutes against the 15-minute SLA. Corrective and preventive actions verified and closed.',
      signOffTitle: 'Director of Compliance & Assurance'
    },
    history: [
      {
        id: 'HIST-104-1',
        action: 'Finding Logged',
        actor: 'Marcus Vance',
        actorRole: 'Lead Auditor',
        timestamp: '2026-01-15 13:00:00'
      },
      {
        id: 'HIST-104-2',
        action: 'CAPA Submitted',
        actor: 'Dev Patel',
        actorRole: 'Remediation Owner',
        timestamp: '2026-02-05 10:00:00'
      },
      {
        id: 'HIST-104-3',
        action: 'Evidence Submitted for Verification',
        actor: 'Dev Patel',
        actorRole: 'Remediation Owner',
        timestamp: '2026-02-16 17:00:00'
      },
      {
        id: 'HIST-104-4',
        action: 'Remediation Verified & Finding Closed',
        actor: 'Marcus Vance',
        actorRole: 'Lead Auditor',
        timestamp: '2026-02-22 15:30:00',
        comment: 'Verified with satisfactory test telemetry. Finding marked Closed.'
      }
    ]
  },
  {
    id: 'F-2026-105',
    auditId: 'AUD-2026-004',
    auditTitle: 'SOX Section 404 IT General Controls (ITGC) Evaluation',
    controlCode: 'ITGC-FIN-03',
    title: 'Lack of Dual-Authorization for Production Database Schema Migration Scripts',
    description: 'During finance ERP ledger review, 2 database schema update scripts were applied directly by senior database administrators without documented secondary peer approval.',
    severity: 'Medium',
    framework: 'SOX 404',
    department: 'Finance & Payroll',
    identifiedDate: '2026-02-24',
    dueDate: '2026-04-10',
    assignedOwnerId: 'user-remediation-owner',
    assignedOwnerName: 'Dev Patel',
    assignedOwnerEmail: 'd.patel@aegisaudit.internal',
    status: 'Open',
    capa: {
      rootCause: '',
      correctiveAction: '',
      preventiveAction: '',
      targetDate: ''
    },
    evidence: [],
    remediationNotes: '',
    verification: {},
    history: [
      {
        id: 'HIST-105-1',
        action: 'Finding Logged',
        actor: 'Marcus Vance',
        actorRole: 'Lead Auditor',
        timestamp: '2026-02-24 15:45:00',
        comment: 'Noted during SOX ITGC segregation of duties fieldwork.'
      }
    ]
  },
  {
    id: 'F-2026-106',
    auditId: 'AUD-2026-002',
    auditTitle: 'SOC 2 Type II Annual Trust Services Criteria Review',
    controlCode: 'CC9.2',
    title: 'Third-Party Analytics Subprocessor Missing Current SOC 2 Type II Report',
    description: 'Vendor risk assessment archive did not have an active bridge letter or SOC 2 report for an auxiliary web event telemetry vendor.',
    severity: 'Low',
    framework: 'SOC 2 Type II',
    department: 'Engineering',
    identifiedDate: '2026-03-02',
    dueDate: '2026-04-30',
    assignedOwnerId: 'user-remediation-owner',
    assignedOwnerName: 'Dev Patel',
    assignedOwnerEmail: 'd.patel@aegisaudit.internal',
    status: 'Open',
    capa: {
      rootCause: '',
      correctiveAction: '',
      preventiveAction: '',
      targetDate: ''
    },
    evidence: [],
    remediationNotes: '',
    verification: {},
    history: [
      {
        id: 'HIST-106-1',
        action: 'Finding Logged',
        actor: 'Elena Rostova',
        actorRole: 'Field Auditor',
        timestamp: '2026-03-02 09:30:00'
      }
    ]
  }
];

export const INITIAL_NOTIFICATION_RULES: NotificationRule[] = [
  {
    id: 'RULE-01',
    triggerEvent: 'finding_created',
    name: 'Compliance Finding Logged & Assigned',
    description: 'Instant notification dispatched to Remediation Owner when a new non-compliance finding is registered.',
    enabled: true,
    targetRoles: ['remediation_owner', 'lead_auditor']
  },
  {
    id: 'RULE-02',
    triggerEvent: 'capa_submitted',
    name: 'CAPA Remediation Plan Submitted',
    description: 'Alerts Lead Auditor and Compliance Specialist when an auditee submits root cause analysis and action plan.',
    enabled: true,
    targetRoles: ['lead_auditor', 'field_auditor']
  },
  {
    id: 'RULE-03',
    triggerEvent: 'verification_requested',
    name: 'Remediation Evidence Verification Requested',
    description: 'Notifies Lead Auditor when remediation evidence is uploaded and auditee requests sign-off review.',
    enabled: true,
    targetRoles: ['lead_auditor', 'field_auditor']
  },
  {
    id: 'RULE-04',
    triggerEvent: 'verification_approved',
    name: 'Remediation Verified & Finding Closed',
    description: 'Confirms formal audit sign-off to Auditee, Department Lead, and Executive Governance Board.',
    enabled: true,
    targetRoles: ['remediation_owner', 'executive_viewer', 'lead_auditor']
  },
  {
    id: 'RULE-05',
    triggerEvent: 'verification_rejected',
    name: 'Remediation Rejected / Additional Evidence Required',
    description: 'Dispatches urgent feedback to Remediation Owner if auditor rejects submitted evidence.',
    enabled: true,
    targetRoles: ['remediation_owner']
  },
  {
    id: 'RULE-06',
    triggerEvent: 'sla_overdue_warning',
    name: 'SLA Remediation Overdue Escalation',
    description: 'Automated alert sent when remediation target date lapses without completed verification.',
    enabled: true,
    targetRoles: ['remediation_owner', 'lead_auditor', 'executive_viewer']
  },
  {
    id: 'RULE-07',
    triggerEvent: 'audit_stage_changed',
    name: 'Audit Workflow Stage Advanced (Kanban)',
    description: 'Dispatched when an audit advances through Planning, Preparation, Fieldwork, Pre-Exit, Exit Meeting, or Reporting.',
    enabled: true,
    targetRoles: ['lead_auditor', 'field_auditor', 'remediation_owner', 'executive_viewer']
  },
  {
    id: 'RULE-08',
    triggerEvent: 'audit_report_published',
    name: 'Audit Summary Report Published',
    description: 'Distributes formal audit executive summary and compliance health scorecard to executives.',
    enabled: true,
    targetRoles: ['executive_viewer', 'lead_auditor']
  }
];

export const INITIAL_EMAIL_LOGS: EmailDispatchLog[] = [
  {
    id: 'EML-9842',
    timestamp: '2026-03-10 14:32:15',
    recipientEmail: 'm.vance@aegisaudit.internal',
    recipientName: 'Marcus Vance',
    recipientRole: 'Lead Auditor',
    triggerEvent: 'verification_requested',
    triggerLabel: 'Verification Requested',
    subject: '[Action Required] Remediation Verification Requested: F-2026-101 (Critical)',
    status: 'delivered',
    relatedFindingId: 'F-2026-101',
    relatedAuditId: 'AUD-2026-001',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; color: white;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 600;">AegisAudit Compliance Notification</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Automated Remediation Verification Dispatcher</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
          <div style="display: inline-block; background-color: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 12px; margin-bottom: 16px;">
            CRITICAL SEVERITY FINDING
          </div>
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #0f172a;">Evidence Submitted for Verification</h3>
          <p style="font-size: 14px; line-height: 1.5; color: #475569; margin: 0 0 16px;">
            Remediation Owner <strong>Dev Patel</strong> has submitted corrective actions and 2 verification attachments for finding <strong>F-2026-101</strong>:
          </p>
          <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 4px 4px 0;">
            <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #0f172a;">Root SSH Access Enabled on Production Kubernetes Nodes Without Hardware MFA</p>
            <p style="margin: 0; font-size: 12px; color: #64748b;">Framework: ISO 27001 · Clause A.9.4.2 · Department: Cloud Infrastructure</p>
          </div>
          <p style="font-size: 13px; color: #475569; margin-bottom: 24px;">
            <strong>Uploaded Evidence:</strong><br/>
            • pr_542_terraform_disable_ssh.pdf (1.4 MB)<br/>
            • ssm_audit_session_logs_march.json (4.8 MB)
          </p>
        </div>
      </div>
    `
  },
  {
    id: 'EML-9841',
    timestamp: '2026-03-08 09:15:00',
    recipientEmail: 'd.patel@aegisaudit.internal',
    recipientName: 'Dev Patel',
    recipientRole: 'Remediation Owner',
    triggerEvent: 'audit_stage_changed',
    triggerLabel: 'Workflow Advanced to Pre-Exit Meeting',
    subject: '[Audit Workflow] SOC 2 Type II Audit Advanced to Pre-Exit Meeting Stage',
    status: 'delivered',
    relatedAuditId: 'AUD-2026-002',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; color: white;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 600;">AegisAudit Workflow Notification</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Audit Process Milestone Notification</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
          <div style="display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 12px; margin-bottom: 16px;">
            PRE-EXIT MEETING STAGE
          </div>
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #0f172a;">Fieldwork Concluded · Preliminary Review Scheduled</h3>
          <p style="font-size: 14px; line-height: 1.5; color: #475569; margin: 0 0 16px;">
            The <strong>SOC 2 Type II Annual Trust Services Criteria Review</strong> has successfully concluded its Fieldwork stage and progressed to <strong>Pre-Exit Meeting</strong>.
          </p>
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 20px; border-radius: 0 4px 4px 0;">
            <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #0f172a;">Pre-Exit Walkthrough Agenda:</p>
            <p style="margin: 0; font-size: 12px; color: #64748b;">Auditees and Process Owners will review preliminary findings before the formal executive exit meeting.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'EML-9840',
    timestamp: '2026-03-01 16:15:02',
    recipientEmail: 'd.patel@aegisaudit.internal',
    recipientName: 'Dev Patel',
    recipientRole: 'Remediation Owner',
    triggerEvent: 'finding_created',
    triggerLabel: 'Finding Assigned',
    subject: '[New Issue Assigned] F-2026-102: Production Customer Database Backup Snapshots Unencrypted at Rest',
    status: 'delivered',
    relatedFindingId: 'F-2026-102',
    relatedAuditId: 'AUD-2026-001',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; color: white;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 600;">AegisAudit Compliance Notification</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">New Finding Assignment</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
          <div style="display: inline-block; background-color: #ffedd5; color: #9a3412; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 12px; margin-bottom: 16px;">
            HIGH SEVERITY FINDING
          </div>
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #0f172a;">You have been assigned as Remediation Owner</h3>
          <p style="font-size: 14px; line-height: 1.5; color: #475569; margin: 0 0 16px;">
            During fieldwork for <strong>Q1 2026 ISO/IEC 27001 Surveillance Audit</strong>, Field Auditor Elena Rostova registered finding <strong>F-2026-102</strong>.
          </p>
        </div>
      </div>
    `
  }
];

export const INITIAL_INAPP_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'NOTIF-01',
    title: 'Verification Sign-off Pending',
    message: 'Dev Patel submitted evidence for F-2026-101 (Root SSH Access). Review requested.',
    timestamp: '10 minutes ago',
    read: false,
    type: 'warning',
    linkFindingId: 'F-2026-101'
  },
  {
    id: 'NOTIF-02',
    title: 'Workflow Stage Advanced',
    message: 'SOC 2 Type II audit advanced to Pre-Exit Meeting stage.',
    timestamp: '45 minutes ago',
    read: false,
    type: 'info',
    linkAuditId: 'AUD-2026-002'
  },
  {
    id: 'NOTIF-03',
    title: 'SLA Remediation Overdue',
    message: 'Finding F-2026-102 (Database Backup Snapshots) has exceeded its 14-day SLA deadline.',
    timestamp: '2 hours ago',
    read: false,
    type: 'alert',
    linkFindingId: 'F-2026-102'
  }
];

export const INITIAL_RCM_ITEMS: RiskControlMatrixItem[] = [
  // --- Infrastructure & Cloud (dept-infra) ---
  {
    id: 'rcm-infra-001',
    departmentId: 'dept-infra',
    departmentCode: 'DEPT-INFRA',
    departmentName: 'Infrastructure & Cloud',
    process: 'Cloud Architecture & Provisioning',
    subProcess: 'IAM & Privileged Root Administration',
    riskRefCode: 'RCM-INF-001',
    riskDescription: 'Compromise or unauthorized escalation of Cloud Root / IAM administrative credentials leading to full tenant infrastructure takeover or data destruction.',
    riskCategory: 'Cybersecurity',
    riskEvent: 'Compromised admin workstation, missing hardware token, or excessive wildcard permission policies.',
    inherentLikelihood: 4,
    inherentImpact: 5,
    inherentRiskScore: 20,
    inherentRiskTier: 'High',
    controlRefCode: 'CTRL-INF-01',
    controlName: 'Mandatory Hardware FIDO2 MFA & Just-In-Time Break-Glass IAM Approval',
    controlDescription: 'Enforce hardware security keys for all AWS IAM privileged roles, zero standing root access, and temporary elevation requiring dual approval.',
    controlType: 'Preventive',
    controlMethod: 'Automated',
    controlFrequency: 'Continuous',
    controlOwner: 'Cloud Security Architect',
    controlEffectiveness: 'Effective',
    residualRiskScore: 5,
    residualRiskTier: 'Low',
    notes: 'Tested in Q1 2026 ISO 27001 audit. Continuous IAM credential reports evaluated weekly.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },
  {
    id: 'rcm-infra-002',
    departmentId: 'dept-infra',
    departmentCode: 'DEPT-INFRA',
    departmentName: 'Infrastructure & Cloud',
    process: 'Disaster Recovery & Business Continuity',
    subProcess: 'Automated Snapshot Lifecycle',
    riskRefCode: 'RCM-INF-002',
    riskDescription: 'Backup snapshot retention failure, accidental deletion, or ransomware encryption resulting in Recovery Point Objective (RPO) breach.',
    riskCategory: 'Operational',
    riskEvent: 'Configuration drift in lifecycle policies or unverified automated backup scripts.',
    inherentLikelihood: 3,
    inherentImpact: 4,
    inherentRiskScore: 12,
    inherentRiskTier: 'Medium',
    controlRefCode: 'CTRL-INF-02',
    controlName: 'Immutable AWS S3 Object Lock & Multi-Region Cross-Account Replication',
    controlDescription: 'Nightly production database snapshots are automatically locked under compliance mode with cross-region replication to a segregated vault.',
    controlType: 'Preventive',
    controlMethod: 'Automated',
    controlFrequency: 'Daily',
    controlOwner: 'Site Reliability Lead',
    controlEffectiveness: 'Partially Effective',
    residualRiskScore: 6,
    residualRiskTier: 'Low',
    notes: 'Linked to finding F-2026-102 for snapshot retention alert thresholds.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },
  {
    id: 'rcm-infra-003',
    departmentId: 'dept-infra',
    departmentCode: 'DEPT-INFRA',
    departmentName: 'Infrastructure & Cloud',
    process: 'Infrastructure as Code (IaC)',
    subProcess: 'Terraform CI/CD Pipeline',
    riskRefCode: 'RCM-INF-003',
    riskDescription: 'Unreviewed infrastructure changes deployed directly to production introducing open security groups or public egress.',
    riskCategory: 'Operational',
    riskEvent: 'Developer bypass of pipeline gates or lack of automated static code analysis for Terraform scripts.',
    inherentLikelihood: 3,
    inherentImpact: 4,
    inherentRiskScore: 12,
    inherentRiskTier: 'Medium',
    controlRefCode: 'CTRL-INF-03',
    controlName: 'Automated tfsec / checkov Static Analysis in PR Gates',
    controlDescription: 'Pull requests touching cloud infrastructure must pass automated static linting and policy-as-code validations before merge.',
    controlType: 'Preventive',
    controlMethod: 'Automated',
    controlFrequency: 'Per-Transaction',
    controlOwner: 'DevOps Lead',
    controlEffectiveness: 'Effective',
    residualRiskScore: 4,
    residualRiskTier: 'Low',
    notes: 'Configured in GitHub Actions with mandatory block on high-severity findings.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },

  // --- Engineering (dept-eng) ---
  {
    id: 'rcm-eng-001',
    departmentId: 'dept-eng',
    departmentCode: 'DEPT-ENG',
    departmentName: 'Engineering',
    process: 'Software Development Lifecycle (SDLC)',
    subProcess: 'Open Source Dependency Management',
    riskRefCode: 'RCM-ENG-001',
    riskDescription: 'Incorporation of compromised, vulnerable, or malicious third-party dependencies into customer-facing microservices.',
    riskCategory: 'Cybersecurity',
    riskEvent: 'Supply chain poisoning or unpatched remote code execution vulnerabilities in npm/PyPI libraries.',
    inherentLikelihood: 4,
    inherentImpact: 3,
    inherentRiskScore: 12,
    inherentRiskTier: 'Medium',
    controlRefCode: 'CTRL-ENG-01',
    controlName: 'Automated Snyk / Dependabot Dependency Scanning Gates',
    controlDescription: 'Build pipelines scan all dependency manifests on every commit and block deployments containing critical vulnerabilities with known exploits.',
    controlType: 'Preventive',
    controlMethod: 'Automated',
    controlFrequency: 'Continuous',
    controlOwner: 'Application Security Lead',
    controlEffectiveness: 'Effective',
    residualRiskScore: 4,
    residualRiskTier: 'Low',
    notes: 'Triaged weekly in AppSec vulnerability review.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },
  {
    id: 'rcm-eng-002',
    departmentId: 'dept-eng',
    departmentCode: 'DEPT-ENG',
    departmentName: 'Engineering',
    process: 'API Gateway & Edge Security',
    subProcess: 'Rate Limiting & Token Validation',
    riskRefCode: 'RCM-ENG-002',
    riskDescription: 'Unauthenticated API endpoint exposure or distributed denial-of-service causing platform downtime or data scraping.',
    riskCategory: 'Operational',
    riskEvent: 'Missing authentication decorator on newly deployed endpoint or misconfigured CDN cache rule.',
    inherentLikelihood: 3,
    inherentImpact: 3,
    inherentRiskScore: 9,
    inherentRiskTier: 'Medium',
    controlRefCode: 'CTRL-ENG-02',
    controlName: 'Central Envoy Gateway JWT Verification & Distributed Rate Limiting',
    controlDescription: 'Edge reverse proxy enforces cryptographically signed JWT tokens and per-tenant rate limit quotas before routing requests.',
    controlType: 'Preventive',
    controlMethod: 'Automated',
    controlFrequency: 'Continuous',
    controlOwner: 'Platform Engineering Lead',
    controlEffectiveness: 'Effective',
    residualRiskScore: 3,
    residualRiskTier: 'Low',
    notes: 'Configured across all ingress clusters.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },
  {
    id: 'rcm-eng-003',
    departmentId: 'dept-eng',
    departmentCode: 'DEPT-ENG',
    departmentName: 'Engineering',
    process: 'Code Release & Deployment',
    subProcess: 'Peer Review & Branch Protection',
    riskRefCode: 'RCM-ENG-003',
    riskDescription: 'Direct commits or code merged without senior engineering peer review introducing logic flaws or unvetted schema modifications.',
    riskCategory: 'Compliance',
    riskEvent: 'Developer emergency commit or bypassed branch protection rules.',
    inherentLikelihood: 2,
    inherentImpact: 4,
    inherentRiskScore: 8,
    inherentRiskTier: 'Medium',
    controlRefCode: 'CTRL-ENG-03',
    controlName: 'GitHub Branch Protection with Enforced 2-Person Sign-off',
    controlDescription: 'Production repository branches reject direct pushes and require minimum 2 peer reviews including one from Code Owners.',
    controlType: 'Preventive',
    controlMethod: 'Automated',
    controlFrequency: 'Per-Transaction',
    controlOwner: 'VP of Engineering',
    controlEffectiveness: 'Effective',
    residualRiskScore: 2,
    residualRiskTier: 'Low',
    notes: 'Subject to quarterly audit sample verification.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },

  // --- Finance & Payroll (dept-fin) ---
  {
    id: 'rcm-fin-001',
    departmentId: 'dept-fin',
    departmentCode: 'DEPT-FIN',
    departmentName: 'Finance & Payroll',
    process: 'Financial Reporting & General Ledger',
    subProcess: 'Manual Journal Entry Posting & Review',
    riskRefCode: 'RCM-FIN-001',
    riskDescription: 'Unauthorized, falsified, or erroneous manual journal entries resulting in material misstatement of published financial statements.',
    riskCategory: 'Financial',
    riskEvent: 'Overriding internal accounting controls or posting journal entries without supporting invoices/documentation.',
    inherentLikelihood: 4,
    inherentImpact: 4,
    inherentRiskScore: 16,
    inherentRiskTier: 'High',
    controlRefCode: 'CTRL-FIN-01',
    controlName: 'ERP Dual-Authorization Segregation for Journal Postings',
    controlDescription: 'NetSuite system rule mandates that manual entries above $10,000 must be reviewed and approved by an independent Controller.',
    controlType: 'Preventive',
    controlMethod: 'Semi-Automated',
    controlFrequency: 'Monthly',
    controlOwner: 'Corporate Controller',
    controlEffectiveness: 'Effective',
    residualRiskScore: 4,
    residualRiskTier: 'Low',
    notes: 'Key control evaluated under SOX 404 ITGC audit.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },
  {
    id: 'rcm-fin-002',
    departmentId: 'dept-fin',
    departmentCode: 'DEPT-FIN',
    departmentName: 'Finance & Payroll',
    process: 'Treasury & Cash Disbursements',
    subProcess: 'Outbound High-Value Wire Transfers',
    riskRefCode: 'RCM-FIN-002',
    riskDescription: 'Business Email Compromise (BEC) or vendor payment detail falsification causing fraudulent, unrecoverable capital transfer.',
    riskCategory: 'Financial',
    riskEvent: 'Social engineering of accounts payable staff or spoofed executive urgent transfer instruction.',
    inherentLikelihood: 3,
    inherentImpact: 5,
    inherentRiskScore: 15,
    inherentRiskTier: 'High',
    controlRefCode: 'CTRL-FIN-02',
    controlName: 'Mandatory Out-of-Band Call Verification & Dual Banking Tokens',
    controlDescription: 'Any change in vendor banking details requires phone call verification using pre-registered numbers, followed by dual token release in bank portal.',
    controlType: 'Preventive',
    controlMethod: 'Manual',
    controlFrequency: 'Per-Transaction',
    controlOwner: 'Head of Treasury',
    controlEffectiveness: 'Effective',
    residualRiskScore: 3,
    residualRiskTier: 'Low',
    notes: 'Strict compliance requirement with anti-fraud banking protocols.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },
  {
    id: 'rcm-fin-003',
    departmentId: 'dept-fin',
    departmentCode: 'DEPT-FIN',
    departmentName: 'Finance & Payroll',
    process: 'Payroll Execution & Compensation',
    subProcess: 'Bi-Weekly Compensation Reconciliation',
    riskRefCode: 'RCM-FIN-003',
    riskDescription: 'Payroll disbursement discrepancies, phantom employee payments, or incorrect tax withholdings triggering labor penalties.',
    riskCategory: 'Operational',
    riskEvent: 'Desynchronization between HRIS onboarding records and payroll processing files.',
    inherentLikelihood: 3,
    inherentImpact: 3,
    inherentRiskScore: 9,
    inherentRiskTier: 'Medium',
    controlRefCode: 'CTRL-FIN-03',
    controlName: 'Automated HRIS Headcount & Variance Cross-Reconciliation',
    controlDescription: 'Automated script compares ADP payroll register line-by-line against active Workday HR employee status prior to submission.',
    controlType: 'Detective',
    controlMethod: 'Automated',
    controlFrequency: 'Per-Transaction',
    controlOwner: 'Payroll Director',
    controlEffectiveness: 'Effective',
    residualRiskScore: 3,
    residualRiskTier: 'Low',
    notes: 'Exceptions flagged and signed off prior to ACH release.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },

  // --- Data & Privacy (dept-data) ---
  {
    id: 'rcm-data-001',
    departmentId: 'dept-data',
    departmentCode: 'DEPT-DATA',
    departmentName: 'Data & Privacy',
    process: 'Patient Health Data (ePHI) Storage',
    subProcess: 'Cryptographic Protection & Data-at-Rest',
    riskRefCode: 'RCM-DAT-001',
    riskDescription: 'Unencrypted storage or leak of patient electronic protected health information violating HIPAA Security Rule specifications.',
    riskCategory: 'Compliance',
    riskEvent: 'Misconfigured S3 bucket, backup export without envelope encryption, or inadvertent logging of patient identifiers.',
    inherentLikelihood: 4,
    inherentImpact: 5,
    inherentRiskScore: 20,
    inherentRiskTier: 'High',
    controlRefCode: 'CTRL-DAT-01',
    controlName: 'Mandatory AWS KMS Customer Managed Keys & Automated Secret Redaction',
    controlDescription: 'All databases and object stores containing ePHI enforce AES-256 KMS customer keys with automated data masking on all application log outputs.',
    controlType: 'Preventive',
    controlMethod: 'Automated',
    controlFrequency: 'Continuous',
    controlOwner: 'Chief Privacy Officer',
    controlEffectiveness: 'Effective',
    residualRiskScore: 4,
    residualRiskTier: 'Low',
    notes: 'Audit verified in HIPAA 45 CFR 164.312 review.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },
  {
    id: 'rcm-data-002',
    departmentId: 'dept-data',
    departmentCode: 'DEPT-DATA',
    departmentName: 'Data & Privacy',
    process: 'Data Subject Rights & Consent',
    subProcess: 'GDPR Right to Erasure / RTBF',
    riskRefCode: 'RCM-DAT-002',
    riskDescription: 'Failure to process data subject erasure requests within the 30-day statutory window resulting in EDPB enforcement actions.',
    riskCategory: 'Compliance',
    riskEvent: 'Orphaned customer records across analytical data warehouses or unmonitored privacy mailboxes.',
    inherentLikelihood: 3,
    inherentImpact: 4,
    inherentRiskScore: 12,
    inherentRiskTier: 'Medium',
    controlRefCode: 'CTRL-DAT-02',
    controlName: 'Automated Privacy Request Workflow & Warehouse Cascading Deletion',
    controlDescription: 'OneTrust privacy portal automatically issues tokenized erasure events to all downstream data stores with SLA alerting at 14 days.',
    controlType: 'Preventive',
    controlMethod: 'Automated',
    controlFrequency: 'Continuous',
    controlOwner: 'Privacy Operations Lead',
    controlEffectiveness: 'Effective',
    residualRiskScore: 3,
    residualRiskTier: 'Low',
    notes: '99.4% SLA adherence recorded over trailing 12 months.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },

  // --- Operations (dept-ops) ---
  {
    id: 'rcm-ops-001',
    departmentId: 'dept-ops',
    departmentCode: 'DEPT-OPS',
    departmentName: 'Operations',
    process: 'Physical Security & Facility Access',
    subProcess: 'Data Center Ingress & Badge Logs',
    riskRefCode: 'RCM-OPS-001',
    riskDescription: 'Unauthorized visitor or unescorted third-party ingress into primary data hall compromising physical hardware or cables.',
    riskCategory: 'Operational',
    riskEvent: 'Tailgating through security doors or failure to log visitor photo identification.',
    inherentLikelihood: 2,
    inherentImpact: 4,
    inherentRiskScore: 8,
    inherentRiskTier: 'Medium',
    controlRefCode: 'CTRL-OPS-01',
    controlName: 'Biometric Anti-Tailgating Mantrap & 24/7 CCTV Recording',
    controlDescription: 'Single-occupancy mantrap turnstiles with iris/fingerprint authentication and 90-day video retention across all facility doors.',
    controlType: 'Preventive',
    controlMethod: 'Automated',
    controlFrequency: 'Continuous',
    controlOwner: 'Physical Security Director',
    controlEffectiveness: 'Effective',
    residualRiskScore: 2,
    residualRiskTier: 'Low',
    notes: 'Reviewed in OSHA & SOC 2 physical security walkthrough.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },
  {
    id: 'rcm-ops-002',
    departmentId: 'dept-ops',
    departmentCode: 'DEPT-OPS',
    departmentName: 'Operations',
    process: 'Environmental Facility Management',
    subProcess: 'HVAC Cooling & Redundant Power Generator',
    riskRefCode: 'RCM-OPS-002',
    riskDescription: 'Air conditioning chiller failure or municipal grid power outage causing thermal emergency shutdown of server racks.',
    riskCategory: 'Operational',
    riskEvent: 'Failure of automatic transfer switch (ATS) or delayed diesel generator cold start.',
    inherentLikelihood: 3,
    inherentImpact: 3,
    inherentRiskScore: 9,
    inherentRiskTier: 'Medium',
    controlRefCode: 'CTRL-OPS-02',
    controlName: 'N+1 Redundant HVAC Units & Monthly Generator Load Bank Testing',
    controlDescription: 'Environmental sensors alert at 24°C threshold, backed by dual UPS flywheels and diesel generator tested under live load monthly.',
    controlType: 'Preventive',
    controlMethod: 'Semi-Automated',
    controlFrequency: 'Monthly',
    controlOwner: 'Facilities Operations Manager',
    controlEffectiveness: 'Effective',
    residualRiskScore: 3,
    residualRiskTier: 'Low',
    notes: 'Full load bank test certified in December 2025.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },

  // --- Security Operations (dept-sec) ---
  {
    id: 'rcm-sec-001',
    departmentId: 'dept-sec',
    departmentCode: 'DEPT-SEC',
    departmentName: 'Security Operations',
    process: 'Threat Detection & Monitoring',
    subProcess: '24/7 SIEM Ingestion & Incident Triaging',
    riskRefCode: 'RCM-SEC-001',
    riskDescription: 'Critical advanced persistent threat (APT) indicators lost in SIEM noise leading to prolonged dwell time and breach expansion.',
    riskCategory: 'Cybersecurity',
    riskEvent: 'Log ingestion bottleneck, alert fatigue, or missing parsing rules for newly deployed cloud services.',
    inherentLikelihood: 4,
    inherentImpact: 5,
    inherentRiskScore: 20,
    inherentRiskTier: 'High',
    controlRefCode: 'CTRL-SEC-01',
    controlName: 'Automated SOAR Alert Correlation & Mandatory 15-Minute P1 SLA',
    controlDescription: 'High-severity alerts trigger automated forensic artifact gathering and wake-on-call engineer paging within 15 minutes.',
    controlType: 'Detective',
    controlMethod: 'Automated',
    controlFrequency: 'Continuous',
    controlOwner: 'SOC Lead',
    controlEffectiveness: 'Effective',
    residualRiskScore: 4,
    residualRiskTier: 'Low',
    notes: 'Tested in quarterly tabletop simulation.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },
  {
    id: 'rcm-sec-002',
    departmentId: 'dept-sec',
    departmentCode: 'DEPT-SEC',
    departmentName: 'Security Operations',
    process: 'Vulnerability Management',
    subProcess: 'Edge Gateway & Host Patching',
    riskRefCode: 'RCM-SEC-002',
    riskDescription: 'Active exploitation of known zero-day vulnerabilities in public-facing internet gateways before patch deployment.',
    riskCategory: 'Cybersecurity',
    riskEvent: 'Delayed security patch release or prolonged change management approval cycle.',
    inherentLikelihood: 3,
    inherentImpact: 4,
    inherentRiskScore: 12,
    inherentRiskTier: 'Medium',
    controlRefCode: 'CTRL-SEC-02',
    controlName: 'Automated Vulnerability Scanning & 72-Hour Critical CVE Patching SLA',
    controlDescription: 'Daily external Tenable scans feed directly to JIRA with executive escalation if critical CVEs exceed 72 hours from patch publication.',
    controlType: 'Preventive',
    controlMethod: 'Automated',
    controlFrequency: 'Daily',
    controlOwner: 'Vulnerability Management Lead',
    controlEffectiveness: 'Effective',
    residualRiskScore: 3,
    residualRiskTier: 'Low',
    notes: 'Remediation track record 100% within SLA over last quarter.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },

  // --- Internal Audit & Governance (dept-gov) ---
  {
    id: 'rcm-gov-001',
    departmentId: 'dept-gov',
    departmentCode: 'DEPT-GOV',
    departmentName: 'Internal Audit & Governance',
    process: 'Audit Universe Governance',
    subProcess: 'Annual Audit Planning & Universe Coverage',
    riskRefCode: 'RCM-GOV-001',
    riskDescription: 'Omission of material business unit or regulatory compliance surface from the Annual Audit Plan resulting in undetected enterprise failure.',
    riskCategory: 'Strategic',
    riskEvent: 'Rapid expansion into new jurisdictions without updating internal audit universe risk assessments.',
    inherentLikelihood: 1,
    inherentImpact: 4,
    inherentRiskScore: 4,
    inherentRiskTier: 'Low',
    controlRefCode: 'CTRL-GOV-01',
    controlName: 'Board Audit Committee Charter & Dynamic Universe Risk Scoring',
    controlDescription: 'Chief Audit Executive presents quarterly risk universe adjustments directly to Board Audit Committee for formal re-approval.',
    controlType: 'Preventive',
    controlMethod: 'Manual',
    controlFrequency: 'Quarterly',
    controlOwner: 'Chief Audit Executive',
    controlEffectiveness: 'Effective',
    residualRiskScore: 2,
    residualRiskTier: 'Low',
    notes: 'Conforms to Institute of Internal Auditors (IIA) standard 2010.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  },
  {
    id: 'rcm-gov-002',
    departmentId: 'dept-gov',
    departmentCode: 'DEPT-GOV',
    departmentName: 'Internal Audit & Governance',
    process: 'Auditor Professional Standards',
    subProcess: 'Auditor Objectivity & Independence Declarations',
    riskRefCode: 'RCM-GOV-002',
    riskDescription: 'Auditor conflict of interest or bias compromising impartiality and validity of published audit findings.',
    riskCategory: 'Compliance',
    riskEvent: 'Auditor assigned to review operational department they recently managed or have close familial ties with.',
    inherentLikelihood: 1,
    inherentImpact: 3,
    inherentRiskScore: 3,
    inherentRiskTier: 'Low',
    controlRefCode: 'CTRL-GOV-02',
    controlName: 'Mandatory Engagement Independence Attestation Matrix',
    controlDescription: 'Every assigned auditor must sign off an electronic independence statement prior to accessing audit fieldwork work papers.',
    controlType: 'Preventive',
    controlMethod: 'Manual',
    controlFrequency: 'Per-Transaction',
    controlOwner: 'Audit Quality Lead',
    controlEffectiveness: 'Effective',
    residualRiskScore: 1,
    residualRiskTier: 'Low',
    notes: 'Zero independence exceptions noted in 2025/2026.',
    createdAt: '2026-01-01 00:00:00',
    updatedAt: '2026-01-01 00:00:00'
  }
];
