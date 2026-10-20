import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'aegis_audit.sqlite');

let db: Database | null = null;

// Save database to disk
export function saveDatabase(): void {
  if (!db) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

// Initialize SQLite Database
export async function getDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
      console.log('Loaded existing SQLite database from:', DB_FILE);
      initializeSchema(db);
      checkAndSeedAdditionalTables(db);
      saveDatabase();
      return db;
    } catch (err) {
      console.warn('Could not read existing SQLite file, creating fresh database:', err);
    }
  }

  // Create new in-memory SQLite and initialize schema
  db = new SQL.Database();
  initializeSchema(db);
  seedInitialData(db);
  saveDatabase();
  console.log('Created and seeded new SQLite database at:', DB_FILE);
  return db;
}

function initializeSchema(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      is_system INTEGER NOT NULL DEFAULT 0,
      permissions TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role_id TEXT NOT NULL,
      department TEXT NOT NULL,
      title TEXT NOT NULL,
      initials TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      framework TEXT NOT NULL,
      department TEXT NOT NULL,
      lead_auditor_id TEXT NOT NULL,
      lead_auditor_name TEXT NOT NULL,
      scope TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      current_stage TEXT NOT NULL,
      stage_configs TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      controls_count INTEGER NOT NULL DEFAULT 0,
      findings_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS controls (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      requirement TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not_tested',
      tested_by TEXT,
      tested_at TEXT,
      notes TEXT,
      finding_id TEXT,
      FOREIGN KEY (audit_id) REFERENCES audits(id)
    );

    CREATE TABLE IF NOT EXISTS findings (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      audit_title TEXT NOT NULL,
      control_code TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL,
      framework TEXT NOT NULL,
      department TEXT NOT NULL,
      identified_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      assigned_owner_id TEXT NOT NULL,
      assigned_owner_name TEXT NOT NULL,
      assigned_owner_email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      capa TEXT NOT NULL,
      evidence TEXT NOT NULL,
      remediation_notes TEXT,
      verification TEXT NOT NULL,
      history TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (audit_id) REFERENCES audits(id)
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      recipient_role TEXT NOT NULL,
      trigger_event TEXT NOT NULL,
      trigger_label TEXT NOT NULL,
      subject TEXT NOT NULL,
      html_content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'delivered',
      related_finding_id TEXT,
      related_audit_id TEXT
    );

    CREATE TABLE IF NOT EXISTS notification_rules (
      id TEXT PRIMARY KEY,
      trigger_event TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      target_roles TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS frameworks (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      governing_body TEXT NOT NULL,
      version TEXT NOT NULL,
      cadence TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      head_name TEXT NOT NULL,
      head_email TEXT NOT NULL,
      risk_tier TEXT NOT NULL DEFAULT 'Medium',
      inherent_risk_score REAL DEFAULT 0.0,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      employee_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS risk_control_matrix (
      id TEXT PRIMARY KEY,
      department_id TEXT NOT NULL,
      department_code TEXT,
      department_name TEXT NOT NULL,
      process TEXT NOT NULL,
      sub_process TEXT NOT NULL,
      risk_ref_code TEXT NOT NULL,
      risk_description TEXT NOT NULL,
      risk_category TEXT NOT NULL,
      risk_event TEXT,
      inherent_likelihood INTEGER NOT NULL DEFAULT 3,
      inherent_impact INTEGER NOT NULL DEFAULT 3,
      inherent_risk_score INTEGER NOT NULL DEFAULT 9,
      inherent_risk_tier TEXT NOT NULL DEFAULT 'Medium',
      control_ref_code TEXT,
      control_name TEXT NOT NULL,
      control_description TEXT NOT NULL,
      control_type TEXT NOT NULL DEFAULT 'Preventive',
      control_method TEXT NOT NULL DEFAULT 'Automated',
      control_frequency TEXT NOT NULL DEFAULT 'Continuous',
      control_owner TEXT NOT NULL,
      control_effectiveness TEXT NOT NULL DEFAULT 'Effective',
      residual_risk_score INTEGER DEFAULT 4,
      residual_risk_tier TEXT DEFAULT 'Low',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  try {
    database.run("ALTER TABLE departments ADD COLUMN inherent_risk_score REAL DEFAULT 0.0;");
  } catch {
    // Column already exists
  }
}

export function seedInitialData(database: Database) {
  // Clear any existing rows to support clean re-seed
  database.run(`
    DELETE FROM users;
    DELETE FROM roles;
    DELETE FROM audits;
    DELETE FROM controls;
    DELETE FROM findings;
    DELETE FROM email_logs;
    DELETE FROM notification_rules;
    DELETE FROM frameworks;
    DELETE FROM departments;
    DELETE FROM risk_control_matrix;
  `);

  // 1. Roles Seed
  const roles = [
    {
      id: 'role-lead-auditor',
      name: 'lead_auditor',
      label: 'Lead Auditor & Audit Director',
      description: 'Full administrative authority: schedule audits, configure workflow stages, advance phases, log findings, approve verification sign-offs, and certify formal reports.',
      is_system: 1,
      permissions: JSON.stringify([
        'audits:create', 'audits:edit_stages', 'audits:delete',
        'controls:test', 'controls:manage',
        'findings:create', 'findings:edit', 'findings:delete',
        'capa:submit', 'evidence:upload',
        'verification:approve', 'verification:reject',
        'reports:generate', 'reports:export',
        'users:manage', 'roles:manage', 'notifications:manage',
        'frameworks:manage', 'departments:manage', 'rcm:manage'
      ]),
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'role-field-auditor',
      name: 'field_auditor',
      label: 'Field Auditor & Compliance Specialist',
      description: 'Audit fieldwork authority: execute control tests, sample artifacts, log compliance findings, and review auditee evidence.',
      is_system: 1,
      permissions: JSON.stringify([
        'audits:edit_stages',
        'controls:test',
        'findings:create', 'findings:edit',
        'capa:submit', 'evidence:upload',
        'verification:approve', 'verification:reject',
        'reports:generate', 'reports:export'
      ]),
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'role-remediation-owner',
      name: 'remediation_owner',
      label: 'Auditee & Remediation Owner',
      description: 'Operational auditee: view assigned non-compliance findings, propose CAPA root cause plans, attach evidence, and request verification.',
      is_system: 1,
      permissions: JSON.stringify([
        'findings:edit',
        'capa:submit',
        'evidence:upload'
      ]),
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'role-executive-viewer',
      name: 'executive_viewer',
      label: 'Executive Stakeholder & VP',
      description: 'Governance & Board oversight: read-only access to executive dashboard, KPI compliance scorecards, audit progression, and published reports.',
      is_system: 1,
      permissions: JSON.stringify([
        'reports:generate',
        'reports:export'
      ]),
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'role-security-analyst',
      name: 'security_analyst',
      label: 'Security Risk & Vulnerability Analyst',
      description: 'Custom specialized role: technical vulnerability assessment, control testing, and remediation verification review.',
      is_system: 0,
      permissions: JSON.stringify([
        'controls:test',
        'findings:create',
        'evidence:upload',
        'reports:generate'
      ]),
      created_at: '2026-01-15 10:00:00'
    }
  ];

  roles.forEach(r => {
    database.run(
      `INSERT INTO roles (id, name, label, description, is_system, permissions, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [r.id, r.name, r.label, r.description, r.is_system, r.permissions, r.created_at]
    );
  });

  // 2. Users Seed
  const users = [
    {
      id: 'user-lead-auditor',
      name: 'Marcus Vance',
      email: 'm.vance@aegisaudit.internal',
      role_id: 'role-lead-auditor',
      department: 'Internal Audit & Governance',
      title: 'Director of Compliance & Assurance',
      initials: 'MV',
      status: 'active',
      last_login_at: '2026-03-18 08:30:00',
      created_at: '2026-01-05 09:00:00'
    },
    {
      id: 'user-field-auditor',
      name: 'Elena Rostova',
      email: 'e.rostova@aegisaudit.internal',
      role_id: 'role-field-auditor',
      department: 'Cybersecurity Assurance',
      title: 'Senior Information Security Auditor',
      initials: 'ER',
      status: 'active',
      last_login_at: '2026-03-18 09:12:00',
      created_at: '2026-01-10 11:00:00'
    },
    {
      id: 'user-remediation-owner',
      name: 'Dev Patel',
      email: 'd.patel@aegisaudit.internal',
      role_id: 'role-remediation-owner',
      department: 'Cloud Infrastructure & DevOps',
      title: 'Principal Cloud Platform Architect',
      initials: 'DP',
      status: 'active',
      last_login_at: '2026-03-17 17:45:00',
      created_at: '2026-01-12 14:00:00'
    },
    {
      id: 'user-executive',
      name: 'Sarah Jenkins',
      email: 's.jenkins@aegisaudit.internal',
      role_id: 'role-executive-viewer',
      department: 'Executive Governance Board',
      title: 'Vice President of Enterprise Risk & Trust',
      initials: 'SJ',
      status: 'active',
      last_login_at: '2026-03-16 16:20:00',
      created_at: '2026-01-08 10:00:00'
    },
    {
      id: 'user-amara-okafor',
      name: 'Amara Okafor',
      email: 'a.okafor@aegisaudit.internal',
      role_id: 'role-security-analyst',
      department: 'Security Operations',
      title: 'Cloud Security Engineer',
      initials: 'AO',
      status: 'active',
      last_login_at: '2026-03-15 13:10:00',
      created_at: '2026-02-01 09:30:00'
    },
    {
      id: 'user-kevin-zhao',
      name: 'Kevin Zhao',
      email: 'k.zhao@aegisaudit.internal',
      role_id: 'role-remediation-owner',
      department: 'Finance & Payroll',
      title: 'ERP Systems Lead',
      initials: 'KZ',
      status: 'active',
      last_login_at: '2026-03-14 11:05:00',
      created_at: '2026-02-10 15:00:00'
    }
  ];

  users.forEach(u => {
    database.run(
      `INSERT INTO users (id, name, email, role_id, department, title, initials, status, last_login_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, u.role_id, u.department, u.title, u.initials, u.status, u.last_login_at, u.created_at]
    );
  });

  // 3. Frameworks Seed
  seedFrameworks(database);

  // 4. Departments Seed
  seedDepartments(database);

  // 5. Risk Control Matrix Seed & Department Inherent Risk Scoring
  seedRiskControlMatrix(database);
  updateAllDepartmentInherentRiskScores(database);
}

function seedFrameworks(database: Database) {
  const frameworks = [
    {
      id: 'fw-iso-27001',
      code: 'ISO 27001',
      name: 'ISO/IEC 27001:2022 Information Security Management System (ISMS)',
      governing_body: 'International Organization for Standardization (ISO)',
      version: '2022 Revision',
      cadence: 'Annual',
      description: 'International standard specifying requirements for establishing, implementing, maintaining, and continually improving an ISMS.',
      status: 'active',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'fw-soc-2',
      code: 'SOC 2 Type II',
      name: 'SOC 2 Type II Trust Services Criteria (Security, Confidentiality & Availability)',
      governing_body: 'American Institute of Certified Public Accountants (AICPA)',
      version: '2026 Criteria',
      cadence: 'Annual',
      description: 'Independent evaluation of operational effectiveness of controls relevant to security, availability, and processing integrity.',
      status: 'active',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'fw-hipaa',
      code: 'HIPAA Security',
      name: 'Health Insurance Portability and Accountability Act - Security Rule',
      governing_body: 'U.S. Department of Health & Human Services (HHS OCR)',
      version: '45 CFR Part 160/164',
      cadence: 'Annual',
      description: 'National standards to protect individuals electronic personal health information (ePHI) created, received, used, or maintained.',
      status: 'active',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'fw-sox',
      code: 'SOX 404',
      name: 'Sarbanes-Oxley Act Section 404 (IT General Controls - ITGC)',
      governing_body: 'Securities and Exchange Commission (SEC) / PCAOB',
      version: 'Section 404(b)',
      cadence: 'Semi-annual',
      description: 'Internal control evaluation over financial reporting systems, change management, and privileged database ledger access.',
      status: 'active',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'fw-gdpr',
      code: 'GDPR Privacy',
      name: 'General Data Protection Regulation (Regulation EU 2016/679)',
      governing_body: 'European Data Protection Board (EDPB)',
      version: 'EU 2016/679',
      cadence: 'Annual',
      description: 'European privacy regulation governing processing of personal data, lawful consent, data subject rights, and cross-border transfers.',
      status: 'active',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'fw-osha',
      code: 'OSHA Safety',
      name: 'Occupational Safety and Health Standards & Physical Facility Security',
      governing_body: 'U.S. Department of Labor (OSHA)',
      version: '29 CFR 1910',
      cadence: 'Annual',
      description: 'Workplace safety, data center physical security, fire suppression, emergency power systems, and facility ingress controls.',
      status: 'active',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'fw-pci-dss',
      code: 'PCI-DSS v4.0',
      name: 'Payment Card Industry Data Security Standard v4.0.1',
      governing_body: 'PCI Security Standards Council',
      version: 'v4.0.1',
      cadence: 'Quarterly',
      description: 'Security baseline for organizations accepting, processing, storing, or transmitting cardholder data.',
      status: 'active',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'fw-nist-csf',
      code: 'NIST CSF 2.0',
      name: 'NIST Cybersecurity Framework 2.0 (Govern, Identify, Protect, Detect, Respond, Recover)',
      governing_body: 'National Institute of Standards and Technology (NIST)',
      version: 'CSF 2.0',
      cadence: 'Continuous',
      description: 'Voluntary guidance based on existing standards, guidelines, and practices for critical infrastructure cybersecurity risk.',
      status: 'active',
      created_at: '2026-01-01 00:00:00'
    }
  ];

  frameworks.forEach(f => {
    database.run(
      `INSERT INTO frameworks (id, code, name, governing_body, version, cadence, description, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [f.id, f.code, f.name, f.governing_body, f.version, f.cadence, f.description, f.status, f.created_at]
    );
  });
}

function seedDepartments(database: Database) {
  const departments = [
    {
      id: 'dept-infra',
      code: 'DEPT-INFRA',
      name: 'Cloud Infrastructure',
      head_name: 'Dev Patel',
      head_email: 'd.patel@aegisaudit.internal',
      risk_tier: 'High',
      description: 'AWS multi-region VPC architectures, Kubernetes clusters, KMS encryption, Terraform CI/CD automation, and cloud IAM.',
      status: 'active',
      employee_count: 42,
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'dept-eng',
      code: 'DEPT-ENG',
      name: 'Engineering',
      head_name: 'Marcus Vance',
      head_email: 'm.vance@aegisaudit.internal',
      risk_tier: 'Medium',
      description: 'Application codebases, microservice architectures, API gateways, dependency scanning, and automated regression pipelines.',
      status: 'active',
      employee_count: 128,
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'dept-fin',
      code: 'DEPT-FIN',
      name: 'Finance & Payroll',
      head_name: 'Kevin Zhao',
      head_email: 'k.zhao@aegisaudit.internal',
      risk_tier: 'High',
      description: 'ERP general ledgers, financial reporting software, billing gateways, banking integration APIs, and dual-authorization segregation.',
      status: 'active',
      employee_count: 24,
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'dept-data',
      code: 'DEPT-DATA',
      name: 'Data & Privacy',
      head_name: 'Elena Rostova',
      head_email: 'e.rostova@aegisaudit.internal',
      risk_tier: 'High',
      description: 'Patient health records (ePHI) processing, analytical warehouses, data retention schedules, GDPR anonymization, and S3 encryption.',
      status: 'active',
      employee_count: 35,
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'dept-ops',
      code: 'DEPT-OPS',
      name: 'Operations',
      head_name: 'Elena Rostova',
      head_email: 'e.rostova@aegisaudit.internal',
      risk_tier: 'Medium',
      description: 'Physical data center facilities, electrical distribution units, environmental temperature controls, and badge entry logs.',
      status: 'active',
      employee_count: 18,
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'dept-sec',
      code: 'DEPT-SEC',
      name: 'Security Operations',
      head_name: 'Amara Okafor',
      head_email: 'a.okafor@aegisaudit.internal',
      risk_tier: 'High',
      description: 'Security Information and Event Management (SIEM), incident response playbooks, endpoint detection, and penetration testing.',
      status: 'active',
      employee_count: 15,
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'dept-gov',
      code: 'DEPT-GOV',
      name: 'Internal Audit & Governance',
      head_name: 'Marcus Vance',
      head_email: 'm.vance@aegisaudit.internal',
      risk_tier: 'Low',
      description: 'Enterprise governance committee, internal audit scheduling, statutory regulatory matrix, and board reporting.',
      status: 'active',
      employee_count: 8,
      created_at: '2026-01-01 00:00:00'
    }
  ];

  departments.forEach(d => {
    database.run(
      `INSERT INTO departments (id, code, name, head_name, head_email, risk_tier, description, status, employee_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.id, d.code, d.name, d.head_name, d.head_email, d.risk_tier, d.description, d.status, d.employee_count, d.created_at]
    );
  });
}

function seedRiskControlMatrix(database: Database) {
  const rcmItems = [
    {
      id: 'rcm-infra-001',
      dept_id: 'dept-infra',
      dept_code: 'DEPT-INFRA',
      dept_name: 'Infrastructure & Cloud',
      process: 'Cloud Architecture & Provisioning',
      sub_process: 'IAM & Privileged Root Administration',
      risk_code: 'RCM-INF-001',
      risk_desc: 'Compromise or unauthorized escalation of Cloud Root / IAM administrative credentials leading to full tenant infrastructure takeover or data destruction.',
      category: 'Cybersecurity',
      event: 'Compromised admin workstation, missing hardware token, or excessive wildcard permission policies.',
      likelihood: 4,
      impact: 5,
      score: 20,
      tier: 'High',
      ctrl_code: 'CTRL-INF-01',
      ctrl_name: 'Mandatory Hardware FIDO2 MFA & Just-In-Time Break-Glass IAM Approval',
      ctrl_desc: 'Enforce hardware security keys for all AWS IAM privileged roles, zero standing root access, and temporary elevation requiring dual approval.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Automated',
      ctrl_freq: 'Continuous',
      ctrl_owner: 'Cloud Security Architect',
      ctrl_eff: 'Effective',
      res_score: 5,
      res_tier: 'Low',
      notes: 'Tested in Q1 2026 ISO 27001 audit. Continuous IAM credential reports evaluated weekly.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-infra-002',
      dept_id: 'dept-infra',
      dept_code: 'DEPT-INFRA',
      dept_name: 'Infrastructure & Cloud',
      process: 'Disaster Recovery & Business Continuity',
      sub_process: 'Automated Snapshot Lifecycle',
      risk_code: 'RCM-INF-002',
      risk_desc: 'Backup snapshot retention failure, accidental deletion, or ransomware encryption resulting in Recovery Point Objective (RPO) breach.',
      category: 'Operational',
      event: 'Configuration drift in lifecycle policies or unverified automated backup scripts.',
      likelihood: 3,
      impact: 4,
      score: 12,
      tier: 'Medium',
      ctrl_code: 'CTRL-INF-02',
      ctrl_name: 'Immutable AWS S3 Object Lock & Multi-Region Cross-Account Replication',
      ctrl_desc: 'Nightly production database snapshots are automatically locked under compliance mode with cross-region replication to a segregated vault.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Automated',
      ctrl_freq: 'Daily',
      ctrl_owner: 'Site Reliability Lead',
      ctrl_eff: 'Partially Effective',
      res_score: 6,
      res_tier: 'Low',
      notes: 'Linked to finding F-2026-102 for snapshot retention alert thresholds.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-infra-003',
      dept_id: 'dept-infra',
      dept_code: 'DEPT-INFRA',
      dept_name: 'Infrastructure & Cloud',
      process: 'Infrastructure as Code (IaC)',
      sub_process: 'Terraform CI/CD Pipeline',
      risk_code: 'RCM-INF-003',
      risk_desc: 'Unreviewed infrastructure changes deployed directly to production introducing open security groups or public egress.',
      category: 'Operational',
      event: 'Developer bypass of pipeline gates or lack of automated static code analysis for Terraform scripts.',
      likelihood: 3,
      impact: 4,
      score: 12,
      tier: 'Medium',
      ctrl_code: 'CTRL-INF-03',
      ctrl_name: 'Automated tfsec / checkov Static Analysis in PR Gates',
      ctrl_desc: 'Pull requests touching cloud infrastructure must pass automated static linting and policy-as-code validations before merge.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Automated',
      ctrl_freq: 'Per-Transaction',
      ctrl_owner: 'DevOps Lead',
      ctrl_eff: 'Effective',
      res_score: 4,
      res_tier: 'Low',
      notes: 'Configured in GitHub Actions with mandatory block on high-severity findings.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-eng-001',
      dept_id: 'dept-eng',
      dept_code: 'DEPT-ENG',
      dept_name: 'Engineering',
      process: 'Software Development Lifecycle (SDLC)',
      sub_process: 'Open Source Dependency Management',
      risk_code: 'RCM-ENG-001',
      risk_desc: 'Incorporation of compromised, vulnerable, or malicious third-party dependencies into customer-facing microservices.',
      category: 'Cybersecurity',
      event: 'Supply chain poisoning or unpatched remote code execution vulnerabilities in npm/PyPI libraries.',
      likelihood: 4,
      impact: 3,
      score: 12,
      tier: 'Medium',
      ctrl_code: 'CTRL-ENG-01',
      ctrl_name: 'Automated Snyk / Dependabot Dependency Scanning Gates',
      ctrl_desc: 'Build pipelines scan all dependency manifests on every commit and block deployments containing critical vulnerabilities with known exploits.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Automated',
      ctrl_freq: 'Continuous',
      ctrl_owner: 'Application Security Lead',
      ctrl_eff: 'Effective',
      res_score: 4,
      res_tier: 'Low',
      notes: 'Triaged weekly in AppSec vulnerability review.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-eng-002',
      dept_id: 'dept-eng',
      dept_code: 'DEPT-ENG',
      dept_name: 'Engineering',
      process: 'API Gateway & Edge Security',
      sub_process: 'Rate Limiting & Token Validation',
      risk_code: 'RCM-ENG-002',
      risk_desc: 'Unauthenticated API endpoint exposure or distributed denial-of-service causing platform downtime or data scraping.',
      category: 'Operational',
      event: 'Missing authentication decorator on newly deployed endpoint or misconfigured CDN cache rule.',
      likelihood: 3,
      impact: 3,
      score: 9,
      tier: 'Medium',
      ctrl_code: 'CTRL-ENG-02',
      ctrl_name: 'Central Envoy Gateway JWT Verification & Distributed Rate Limiting',
      ctrl_desc: 'Edge reverse proxy enforces cryptographically signed JWT tokens and per-tenant rate limit quotas before routing requests.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Automated',
      ctrl_freq: 'Continuous',
      ctrl_owner: 'Platform Engineering Lead',
      ctrl_eff: 'Effective',
      res_score: 3,
      res_tier: 'Low',
      notes: 'Configured across all ingress clusters.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-eng-003',
      dept_id: 'dept-eng',
      dept_code: 'DEPT-ENG',
      dept_name: 'Engineering',
      process: 'Code Release & Deployment',
      sub_process: 'Peer Review & Branch Protection',
      risk_code: 'RCM-ENG-003',
      risk_desc: 'Direct commits or code merged without senior engineering peer review introducing logic flaws or unvetted schema modifications.',
      category: 'Compliance',
      event: 'Developer emergency commit or bypassed branch protection rules.',
      likelihood: 2,
      impact: 4,
      score: 8,
      tier: 'Medium',
      ctrl_code: 'CTRL-ENG-03',
      ctrl_name: 'GitHub Branch Protection with Enforced 2-Person Sign-off',
      ctrl_desc: 'Production repository branches reject direct pushes and require minimum 2 peer reviews including one from Code Owners.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Automated',
      ctrl_freq: 'Per-Transaction',
      ctrl_owner: 'VP of Engineering',
      ctrl_eff: 'Effective',
      res_score: 2,
      res_tier: 'Low',
      notes: 'Subject to quarterly audit sample verification.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-fin-001',
      dept_id: 'dept-fin',
      dept_code: 'DEPT-FIN',
      dept_name: 'Finance & Payroll',
      process: 'Financial Reporting & General Ledger',
      sub_process: 'Manual Journal Entry Posting & Review',
      risk_code: 'RCM-FIN-001',
      risk_desc: 'Unauthorized, falsified, or erroneous manual journal entries resulting in material misstatement of published financial statements.',
      category: 'Financial',
      event: 'Overriding internal accounting controls or posting journal entries without supporting invoices/documentation.',
      likelihood: 4,
      impact: 4,
      score: 16,
      tier: 'High',
      ctrl_code: 'CTRL-FIN-01',
      ctrl_name: 'ERP Dual-Authorization Segregation for Journal Postings',
      ctrl_desc: 'NetSuite system rule mandates that manual entries above $10,000 must be reviewed and approved by an independent Controller.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Semi-Automated',
      ctrl_freq: 'Monthly',
      ctrl_owner: 'Corporate Controller',
      ctrl_eff: 'Effective',
      res_score: 4,
      res_tier: 'Low',
      notes: 'Key control evaluated under SOX 404 ITGC audit.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-fin-002',
      dept_id: 'dept-fin',
      dept_code: 'DEPT-FIN',
      dept_name: 'Finance & Payroll',
      process: 'Treasury & Cash Disbursements',
      sub_process: 'Outbound High-Value Wire Transfers',
      risk_code: 'RCM-FIN-002',
      risk_desc: 'Business Email Compromise (BEC) or vendor payment detail falsification causing fraudulent, unrecoverable capital transfer.',
      category: 'Financial',
      event: 'Social engineering of accounts payable staff or spoofed executive urgent transfer instruction.',
      likelihood: 3,
      impact: 5,
      score: 15,
      tier: 'High',
      ctrl_code: 'CTRL-FIN-02',
      ctrl_name: 'Mandatory Out-of-Band Call Verification & Dual Banking Tokens',
      ctrl_desc: 'Any change in vendor banking details requires phone call verification using pre-registered numbers, followed by dual token release in bank portal.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Manual',
      ctrl_freq: 'Per-Transaction',
      ctrl_owner: 'Head of Treasury',
      ctrl_eff: 'Effective',
      res_score: 3,
      res_tier: 'Low',
      notes: 'Strict compliance requirement with anti-fraud banking protocols.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-fin-003',
      dept_id: 'dept-fin',
      dept_code: 'DEPT-FIN',
      dept_name: 'Finance & Payroll',
      process: 'Payroll Execution & Compensation',
      sub_process: 'Bi-Weekly Compensation Reconciliation',
      risk_code: 'RCM-FIN-003',
      risk_desc: 'Payroll disbursement discrepancies, phantom employee payments, or incorrect tax withholdings triggering labor penalties.',
      category: 'Operational',
      event: 'Desynchronization between HRIS onboarding records and payroll processing files.',
      likelihood: 3,
      impact: 3,
      score: 9,
      tier: 'Medium',
      ctrl_code: 'CTRL-FIN-03',
      ctrl_name: 'Automated HRIS Headcount & Variance Cross-Reconciliation',
      ctrl_desc: 'Automated script compares ADP payroll register line-by-line against active Workday HR employee status prior to submission.',
      ctrl_type: 'Detective',
      ctrl_method: 'Automated',
      ctrl_freq: 'Per-Transaction',
      ctrl_owner: 'Payroll Director',
      ctrl_eff: 'Effective',
      res_score: 3,
      res_tier: 'Low',
      notes: 'Exceptions flagged and signed off prior to ACH release.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-data-001',
      dept_id: 'dept-data',
      dept_code: 'DEPT-DATA',
      dept_name: 'Data & Privacy',
      process: 'Patient Health Data (ePHI) Storage',
      sub_process: 'Cryptographic Protection & Data-at-Rest',
      risk_code: 'RCM-DAT-001',
      risk_desc: 'Unencrypted storage or leak of patient electronic protected health information violating HIPAA Security Rule specifications.',
      category: 'Compliance',
      event: 'Misconfigured S3 bucket, backup export without envelope encryption, or inadvertent logging of patient identifiers.',
      likelihood: 4,
      impact: 5,
      score: 20,
      tier: 'High',
      ctrl_code: 'CTRL-DAT-01',
      ctrl_name: 'Mandatory AWS KMS Customer Managed Keys & Automated Secret Redaction',
      ctrl_desc: 'All databases and object stores containing ePHI enforce AES-256 KMS customer keys with automated data masking on all application log outputs.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Automated',
      ctrl_freq: 'Continuous',
      ctrl_owner: 'Chief Privacy Officer',
      ctrl_eff: 'Effective',
      res_score: 4,
      res_tier: 'Low',
      notes: 'Audit verified in HIPAA 45 CFR 164.312 review.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-data-002',
      dept_id: 'dept-data',
      dept_code: 'DEPT-DATA',
      dept_name: 'Data & Privacy',
      process: 'Data Subject Rights & Consent',
      sub_process: 'GDPR Right to Erasure / RTBF',
      risk_code: 'RCM-DAT-002',
      risk_desc: 'Failure to process data subject erasure requests within the 30-day statutory window resulting in EDPB enforcement actions.',
      category: 'Compliance',
      event: 'Orphaned customer records across analytical data warehouses or unmonitored privacy mailboxes.',
      likelihood: 3,
      impact: 4,
      score: 12,
      tier: 'Medium',
      ctrl_code: 'CTRL-DAT-02',
      ctrl_name: 'Automated Privacy Request Workflow & Warehouse Cascading Deletion',
      ctrl_desc: 'OneTrust privacy portal automatically issues tokenized erasure events to all downstream data stores with SLA alerting at 14 days.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Automated',
      ctrl_freq: 'Continuous',
      ctrl_owner: 'Privacy Operations Lead',
      ctrl_eff: 'Effective',
      res_score: 3,
      res_tier: 'Low',
      notes: '99.4% SLA adherence recorded over trailing 12 months.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-ops-001',
      dept_id: 'dept-ops',
      dept_code: 'DEPT-OPS',
      dept_name: 'Operations',
      process: 'Physical Security & Facility Access',
      sub_process: 'Data Center Ingress & Badge Logs',
      risk_code: 'RCM-OPS-001',
      risk_desc: 'Unauthorized visitor or unescorted third-party ingress into primary data hall compromising physical hardware or cables.',
      category: 'Operational',
      event: 'Tailgating through security doors or failure to log visitor photo identification.',
      likelihood: 2,
      impact: 4,
      score: 8,
      tier: 'Medium',
      ctrl_code: 'CTRL-OPS-01',
      ctrl_name: 'Biometric Anti-Tailgating Mantrap & 24/7 CCTV Recording',
      ctrl_desc: 'Single-occupancy mantrap turnstiles with iris/fingerprint authentication and 90-day video retention across all facility doors.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Automated',
      ctrl_freq: 'Continuous',
      ctrl_owner: 'Physical Security Director',
      ctrl_eff: 'Effective',
      res_score: 2,
      res_tier: 'Low',
      notes: 'Reviewed in OSHA & SOC 2 physical security walkthrough.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-ops-002',
      dept_id: 'dept-ops',
      dept_code: 'DEPT-OPS',
      dept_name: 'Operations',
      process: 'Environmental Facility Management',
      sub_process: 'HVAC Cooling & Redundant Power Generator',
      risk_code: 'RCM-OPS-002',
      risk_desc: 'Air conditioning chiller failure or municipal grid power outage causing thermal emergency shutdown of server racks.',
      category: 'Operational',
      event: 'Failure of automatic transfer switch (ATS) or delayed diesel generator cold start.',
      likelihood: 3,
      impact: 3,
      score: 9,
      tier: 'Medium',
      ctrl_code: 'CTRL-OPS-02',
      ctrl_name: 'N+1 Redundant HVAC Units & Monthly Generator Load Bank Testing',
      ctrl_desc: 'Environmental sensors alert at 24°C threshold, backed by dual UPS flywheels and diesel generator tested under live load monthly.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Semi-Automated',
      ctrl_freq: 'Monthly',
      ctrl_owner: 'Facilities Operations Manager',
      ctrl_eff: 'Effective',
      res_score: 3,
      res_tier: 'Low',
      notes: 'Full load bank test certified in December 2025.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-sec-001',
      dept_id: 'dept-sec',
      dept_code: 'DEPT-SEC',
      dept_name: 'Security Operations',
      process: 'Threat Detection & Monitoring',
      sub_process: '24/7 SIEM Ingestion & Incident Triaging',
      risk_code: 'RCM-SEC-001',
      risk_desc: 'Critical advanced persistent threat (APT) indicators lost in SIEM noise leading to prolonged dwell time and breach expansion.',
      category: 'Cybersecurity',
      event: 'Log ingestion bottleneck, alert fatigue, or missing parsing rules for newly deployed cloud services.',
      likelihood: 4,
      impact: 5,
      score: 20,
      tier: 'High',
      ctrl_code: 'CTRL-SEC-01',
      ctrl_name: 'Automated SOAR Alert Correlation & Mandatory 15-Minute P1 SLA',
      ctrl_desc: 'High-severity alerts trigger automated forensic artifact gathering and wake-on-call engineer paging within 15 minutes.',
      ctrl_type: 'Detective',
      ctrl_method: 'Automated',
      ctrl_freq: 'Continuous',
      ctrl_owner: 'SOC Lead',
      ctrl_eff: 'Effective',
      res_score: 4,
      res_tier: 'Low',
      notes: 'Tested in quarterly tabletop simulation.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-sec-002',
      dept_id: 'dept-sec',
      dept_code: 'DEPT-SEC',
      dept_name: 'Security Operations',
      process: 'Vulnerability Management',
      sub_process: 'Edge Gateway & Host Patching',
      risk_code: 'RCM-SEC-002',
      risk_desc: 'Active exploitation of known zero-day vulnerabilities in public-facing internet gateways before patch deployment.',
      category: 'Cybersecurity',
      event: 'Delayed security patch release or prolonged change management approval cycle.',
      likelihood: 3,
      impact: 4,
      score: 12,
      tier: 'Medium',
      ctrl_code: 'CTRL-SEC-02',
      ctrl_name: 'Automated Vulnerability Scanning & 72-Hour Critical CVE Patching SLA',
      ctrl_desc: 'Daily external Tenable scans feed directly to JIRA with executive escalation if critical CVEs exceed 72 hours from patch publication.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Automated',
      ctrl_freq: 'Daily',
      ctrl_owner: 'Vulnerability Management Lead',
      ctrl_eff: 'Effective',
      res_score: 3,
      res_tier: 'Low',
      notes: 'Remediation track record 100% within SLA over last quarter.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-gov-001',
      dept_id: 'dept-gov',
      dept_code: 'DEPT-GOV',
      dept_name: 'Internal Audit & Governance',
      process: 'Audit Universe Governance',
      sub_process: 'Annual Audit Planning & Universe Coverage',
      risk_code: 'RCM-GOV-001',
      risk_desc: 'Omission of material business unit or regulatory compliance surface from the Annual Audit Plan resulting in undetected enterprise failure.',
      category: 'Strategic',
      event: 'Rapid expansion into new jurisdictions without updating internal audit universe risk assessments.',
      likelihood: 1,
      impact: 4,
      score: 4,
      tier: 'Low',
      ctrl_code: 'CTRL-GOV-01',
      ctrl_name: 'Board Audit Committee Charter & Dynamic Universe Risk Scoring',
      ctrl_desc: 'Chief Audit Executive presents quarterly risk universe adjustments directly to Board Audit Committee for formal re-approval.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Manual',
      ctrl_freq: 'Quarterly',
      ctrl_owner: 'Chief Audit Executive',
      ctrl_eff: 'Effective',
      res_score: 2,
      res_tier: 'Low',
      notes: 'Conforms to Institute of Internal Auditors (IIA) standard 2010.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    },
    {
      id: 'rcm-gov-002',
      dept_id: 'dept-gov',
      dept_code: 'DEPT-GOV',
      dept_name: 'Internal Audit & Governance',
      process: 'Auditor Professional Standards',
      sub_process: 'Auditor Objectivity & Independence Declarations',
      risk_code: 'RCM-GOV-002',
      risk_desc: 'Auditor conflict of interest or bias compromising impartiality and validity of published audit findings.',
      category: 'Compliance',
      event: 'Auditor assigned to review operational department they recently managed or have close familial ties with.',
      likelihood: 1,
      impact: 3,
      score: 3,
      tier: 'Low',
      ctrl_code: 'CTRL-GOV-02',
      ctrl_name: 'Mandatory Engagement Independence Attestation Matrix',
      ctrl_desc: 'Every assigned auditor must sign off an electronic independence statement prior to accessing audit fieldwork work papers.',
      ctrl_type: 'Preventive',
      ctrl_method: 'Manual',
      ctrl_freq: 'Per-Transaction',
      ctrl_owner: 'Audit Quality Lead',
      ctrl_eff: 'Effective',
      res_score: 1,
      res_tier: 'Low',
      notes: 'Zero independence exceptions noted in 2025/2026.',
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00'
    }
  ];

  rcmItems.forEach(item => {
    database.run(
      `INSERT INTO risk_control_matrix (
        id, department_id, department_code, department_name,
        process, sub_process, risk_ref_code, risk_description,
        risk_category, risk_event, inherent_likelihood, inherent_impact,
        inherent_risk_score, inherent_risk_tier, control_ref_code,
        control_name, control_description, control_type, control_method,
        control_frequency, control_owner, control_effectiveness,
        residual_risk_score, residual_risk_tier, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id, item.dept_id, item.dept_code, item.dept_name,
        item.process, item.sub_process, item.risk_code, item.risk_desc,
        item.category, item.event, item.likelihood, item.impact,
        item.score, item.tier, item.ctrl_code,
        item.ctrl_name, item.ctrl_desc, item.ctrl_type, item.ctrl_method,
        item.ctrl_freq, item.ctrl_owner, item.ctrl_eff,
        item.res_score, item.res_tier, item.notes, item.created_at, item.updated_at
      ]
    );
  });
}

export function updateAllDepartmentInherentRiskScores(database: Database) {
  try {
    const deptStmt = database.prepare('SELECT id, name FROM departments');
    const depts: { id: string; name: string }[] = [];
    while (deptStmt.step()) {
      depts.push(deptStmt.getAsObject() as { id: string; name: string });
    }
    deptStmt.free();

    for (const d of depts) {
      const rcmStmt = database.prepare(
        'SELECT inherent_risk_score FROM risk_control_matrix WHERE department_id = ? OR department_name = ?'
      );
      rcmStmt.bind([d.id, d.name]);
      const scores: number[] = [];
      while (rcmStmt.step()) {
        const row = rcmStmt.getAsObject();
        scores.push(Number(row.inherent_risk_score) || 0);
      }
      rcmStmt.free();

      if (scores.length > 0) {
        const sum = scores.reduce((a, b) => a + b, 0);
        const avg = sum / scores.length;
        const max = Math.max(...scores);
        
        let calculatedTier: 'High' | 'Medium' | 'Low' = 'Medium';
        if (avg >= 14 || max >= 20) {
          calculatedTier = 'High';
        } else if (avg < 8 && max < 12) {
          calculatedTier = 'Low';
        }

        const roundedAvg = Math.round(avg * 10) / 10;
        database.run(
          'UPDATE departments SET risk_tier = ?, inherent_risk_score = ? WHERE id = ?',
          [calculatedTier, roundedAvg, d.id]
        );
      }
    }
  } catch (err) {
    console.warn('Error updating department inherent risk scores:', err);
  }
}

export function checkAndSeedAdditionalTables(database: Database) {
  try {
    const fwCountStmt = database.prepare('SELECT COUNT(*) as count FROM frameworks');
    fwCountStmt.step();
    const fwCount = fwCountStmt.getAsObject().count;
    fwCountStmt.free();

    if (fwCount === 0) {
      console.log('Seeding frameworks into existing SQLite database...');
      seedFrameworks(database);
    }
  } catch (err) {
    console.warn('Error checking frameworks table:', err);
  }

  try {
    const deptCountStmt = database.prepare('SELECT COUNT(*) as count FROM departments');
    deptCountStmt.step();
    const deptCount = deptCountStmt.getAsObject().count;
    deptCountStmt.free();

    if (deptCount === 0) {
      console.log('Seeding departments into existing SQLite database...');
      seedDepartments(database);
    }
  } catch (err) {
    console.warn('Error checking departments table:', err);
  }

  try {
    const rcmCountStmt = database.prepare('SELECT COUNT(*) as count FROM risk_control_matrix');
    rcmCountStmt.step();
    const rcmCount = rcmCountStmt.getAsObject().count;
    rcmCountStmt.free();

    if (rcmCount === 0) {
      console.log('Seeding Risk Control Matrix into existing SQLite database...');
      seedRiskControlMatrix(database);
      updateAllDepartmentInherentRiskScores(database);
    }
  } catch (err) {
    console.warn('Error checking risk_control_matrix table:', err);
  }
}

