import React, { useState, useMemo } from 'react';
import { useAudit } from '../context/AuditContext';
import { 
  DepartmentDefinition, 
  RiskControlMatrixItem, 
  RiskCategory 
} from '../types/audit';
import { 
  FileSpreadsheet, 
  X, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Copy, 
  Download, 
  Printer, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Calculator, 
  HelpCircle, 
  Sliders, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

interface InherentRiskWorkingPaperModalProps {
  department: DepartmentDefinition;
  onClose: () => void;
  onNavigateToAudit?: (deptName: string) => void;
}

const RISK_CATEGORIES: RiskCategory[] = [
  'Operational',
  'Cybersecurity',
  'Financial',
  'Compliance',
  'Strategic',
  'Reputational'
];

const LIKELIHOOD_LABELS: Record<number, { name: string; desc: string }> = {
  1: { name: 'Rare', desc: 'Highly unlikely (< 5% probability in 24 months)' },
  2: { name: 'Unlikely', desc: 'Could occur occasionally (5% - 25% probability)' },
  3: { name: 'Possible', desc: 'Feasible / reasonable chance (25% - 50% probability)' },
  4: { name: 'Likely', desc: 'High probability of occurrence (50% - 80% probability)' },
  5: { name: 'Almost Certain', desc: 'Expected to occur regularly (> 80% probability)' }
};

const IMPACT_LABELS: Record<number, { name: string; desc: string }> = {
  1: { name: 'Insignificant', desc: 'Negligible operational friction, < $10k loss' },
  2: { name: 'Minor', desc: 'Localized disturbance, minimal regulatory report' },
  3: { name: 'Moderate', desc: 'Service degradation, manageable financial cost' },
  4: { name: 'Major', desc: 'Critical outage, regulatory inquiry, high financial loss' },
  5: { name: 'Catastrophic', desc: 'Enterprise existential threat, statutory shutdown' }
};

// Preset risk templates for quick addition by internal auditors
const PRESET_RISK_TEMPLATES = [
  {
    title: 'Privileged Cloud Admin Credential Compromise',
    category: 'Cybersecurity' as RiskCategory,
    process: 'Cloud Architecture & Provisioning',
    subProcess: 'IAM & Root Access Management',
    event: 'Phishing of administrator endpoint or missing hardware MFA tokens.',
    description: 'Compromise of root cloud credentials allowing attacker unauthorized command over all production clusters and encrypted storage.',
    likelihood: 4,
    impact: 5,
    controlName: 'Hardware FIDO2 Keys & Automated Session Expiry',
    controlType: 'Preventive' as const,
    controlMethod: 'Automated' as const,
    controlFrequency: 'Continuous' as const,
    controlOwner: 'Cloud Security Architect',
    controlDesc: 'Hardware security tokens mandated for all AWS/GCP administrative roles with 1-hour maximum session lifetimes.'
  },
  {
    title: 'Fraudulent Wire Transfer & Social Engineering',
    category: 'Financial' as RiskCategory,
    process: 'Treasury & Cash Disbursements',
    subProcess: 'Outbound High-Value Wire Transfers',
    event: 'Business email compromise (BEC) impersonating C-level executive or supplier bank account update.',
    description: 'Execution of unauthorized outbound banking wire transfer leading to unrecoverable capital loss.',
    likelihood: 3,
    impact: 5,
    controlName: 'Out-of-Band Callback Verification & Dual Token Approval',
    controlType: 'Preventive' as const,
    controlMethod: 'Manual' as const,
    controlFrequency: 'Per-Transaction' as const,
    controlOwner: 'Treasury Operations Lead',
    controlDesc: 'Mandatory verbal telephone verification with pre-approved vendor contacts and dual-custody authorization for transfers > $25,000.'
  },
  {
    title: 'Malicious / Vulnerable Dependency Injection in Microservices',
    category: 'Cybersecurity' as RiskCategory,
    process: 'Software Development Lifecycle (SDLC)',
    subProcess: 'Third-Party Open Source Libraries',
    event: 'Software supply chain poisoning or unpatched remote code execution in open-source packages.',
    description: 'Deployment of compromised dependency allowing remote threat actors access to tenant memory and backend databases.',
    likelihood: 4,
    impact: 3,
    controlName: 'Automated Software Bill of Materials (SBOM) & PR Blocking Gates',
    controlType: 'Preventive' as const,
    controlMethod: 'Automated' as const,
    controlFrequency: 'Continuous' as const,
    controlOwner: 'Application Security Engineer',
    controlDesc: 'Automated scanner blocks pull requests containing dependencies with known High or Critical CVE advisories.'
  },
  {
    title: 'Protected Health Information (ePHI) / Customer Data Leakage',
    category: 'Compliance' as RiskCategory,
    process: 'Data Retention & Encryption',
    subProcess: 'Cryptographic Storage at Rest',
    event: 'Publicly exposed S3 bucket or unencrypted database snapshot export.',
    description: 'Sensitive customer or patient identifiable records leaked to public domain violating statutory privacy mandates (HIPAA / GDPR).',
    likelihood: 4,
    impact: 5,
    controlName: 'KMS Customer-Managed Envelope Encryption & CloudTrail Alerts',
    controlType: 'Preventive' as const,
    controlMethod: 'Automated' as const,
    controlFrequency: 'Continuous' as const,
    controlOwner: 'Chief Privacy Officer',
    controlDesc: 'Enforced AES-256 KMS encryption for all S3 and RDS storage with automated GuardDuty alerting on public bucket policies.'
  },
  {
    title: 'Disaster Recovery Failure & Database Backup Inaccessibility',
    category: 'Operational' as RiskCategory,
    process: 'Business Continuity & Disaster Recovery',
    subProcess: 'Snapshot Lifecycle & Immutable Storage',
    event: 'Configuration drift in backup scripts or ransomware encryption of local volume snapshots.',
    description: 'Inability to restore production data stores following infrastructure failure, violating Recovery Time Objective (RTO).',
    likelihood: 3,
    impact: 4,
    controlName: 'Multi-Region Immutable Object Lock & Automated Test Restores',
    controlType: 'Preventive' as const,
    controlMethod: 'Automated' as const,
    controlFrequency: 'Weekly' as const,
    controlOwner: 'Site Reliability Engineering Lead',
    controlDesc: 'Nightly snapshots replicated to an isolated cloud account with WORM (Write Once Read Many) compliance retention.'
  },
  {
    title: 'Regulatory Non-Compliance & AuditUniverse Blindspot',
    category: 'Strategic' as RiskCategory,
    process: 'Internal Governance & Regulatory Reporting',
    subProcess: 'Statutory Compliance Tracking',
    event: 'New jurisdiction regulation enacted without corresponding internal control updates.',
    description: 'Failure to comply with mandatory statutory frameworks resulting in regulatory sanctions, fines, or operational suspension.',
    likelihood: 2,
    impact: 4,
    controlName: 'Quarterly Audit Universe Review with Board Committee Sign-off',
    controlType: 'Preventive' as const,
    controlMethod: 'Manual' as const,
    controlFrequency: 'Quarterly' as const,
    controlOwner: 'Internal Audit Director',
    controlDesc: 'Formal gap assessment conducted across all operating regions against evolving statutory frameworks.'
  }
];

export const InherentRiskWorkingPaperModal: React.FC<InherentRiskWorkingPaperModalProps> = ({
  department,
  onClose,
  onNavigateToAudit
}) => {
  const { 
    rcmItems, 
    addRcmItem, 
    editRcmItem, 
    removeRcmItem, 
    getDepartmentInherentRisk,
    currentUser,
    users
  } = useAudit();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ l: number; i: number } | null>(null);

  // Modal / Form state for Add / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RiskControlMatrixItem | null>(null);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Working Paper Header metadata
  const [assessorName, setAssessorName] = useState(currentUser.name || 'Lead Auditor');
  const [assessmentPeriod, setAssessmentPeriod] = useState('FY2026 - Annual Audit Cycle');
  const [wpStatus, setWpStatus] = useState<'Draft' | 'Under Review' | 'Sign-Off Approved'>('Sign-Off Approved');

  // Form Fields
  const [formProcess, setFormProcess] = useState('');
  const [formSubProcess, setFormSubProcess] = useState('');
  const [formRiskRefCode, setFormRiskRefCode] = useState('');
  const [formRiskCategory, setFormRiskCategory] = useState<RiskCategory>('Operational');
  const [formRiskDescription, setFormRiskDescription] = useState('');
  const [formRiskEvent, setFormRiskEvent] = useState('');
  const [formLikelihood, setFormLikelihood] = useState<number>(3);
  const [formImpact, setFormImpact] = useState<number>(3);
  const [formControlRefCode, setFormControlRefCode] = useState('');
  const [formControlName, setFormControlName] = useState('');
  const [formControlDescription, setFormControlDescription] = useState('');
  const [formControlType, setFormControlType] = useState<'Preventive' | 'Detective' | 'Corrective'>('Preventive');
  const [formControlMethod, setFormControlMethod] = useState<'Automated' | 'Manual' | 'Semi-Automated'>('Automated');
  const [formControlFrequency, setFormControlFrequency] = useState<'Continuous' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'Per-Transaction'>('Continuous');
  const [formControlOwner, setFormControlOwner] = useState(department.headName || 'Unit Operations Lead');
  const [formControlEffectiveness, setFormControlEffectiveness] = useState<'Effective' | 'Partially Effective' | 'Ineffective' | 'Not Tested'>('Effective');
  const [formNotes, setFormNotes] = useState('');

  // Get department RCM items and calculated inherent metrics
  const deptRcmList = useMemo(() => {
    return rcmItems.filter(r => r.departmentId === department.id || r.departmentName === department.name);
  }, [rcmItems, department.id, department.name]);

  const inherentMetrics = useMemo(() => {
    return getDepartmentInherentRisk(department.id);
  }, [getDepartmentInherentRisk, department.id]);

  // Filtered RCM list
  const filteredRcm = useMemo(() => {
    return deptRcmList.filter(item => {
      if (selectedCategory !== 'all' && item.riskCategory !== selectedCategory) return false;
      if (selectedTier !== 'all' && item.inherentRiskTier !== selectedTier) return false;
      if (selectedHeatmapCell) {
        if (item.inherentLikelihood !== selectedHeatmapCell.l || item.inherentImpact !== selectedHeatmapCell.i) {
          return false;
        }
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches = 
          item.riskRefCode.toLowerCase().includes(query) ||
          item.process.toLowerCase().includes(query) ||
          item.subProcess.toLowerCase().includes(query) ||
          item.riskDescription.toLowerCase().includes(query) ||
          item.controlName.toLowerCase().includes(query) ||
          item.controlOwner.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [deptRcmList, selectedCategory, selectedTier, selectedHeatmapCell, searchTerm]);

  // Open Form to Add New
  const handleOpenAddForm = () => {
    setEditingItem(null);
    setFormProcess('');
    setFormSubProcess('');
    setFormRiskRefCode(`RCM-${department.code.replace(/[^A-Z0-9]/g, '').slice(-3)}-${(deptRcmList.length + 1).toString().padStart(3, '0')}`);
    setFormRiskCategory('Operational');
    setFormRiskDescription('');
    setFormRiskEvent('');
    setFormLikelihood(3);
    setFormImpact(3);
    setFormControlRefCode(`CTRL-${department.code.replace(/[^A-Z0-9]/g, '').slice(-3)}-${(deptRcmList.length + 1).toString().padStart(2, '0')}`);
    setFormControlName('');
    setFormControlDescription('');
    setFormControlType('Preventive');
    setFormControlMethod('Automated');
    setFormControlFrequency('Continuous');
    setFormControlOwner(department.headName || 'Unit Operations Lead');
    setFormControlEffectiveness('Effective');
    setFormNotes('');
    setIsFormOpen(true);
  };

  // Open Form to Edit
  const handleOpenEditForm = (item: RiskControlMatrixItem) => {
    setEditingItem(item);
    setFormProcess(item.process);
    setFormSubProcess(item.subProcess);
    setFormRiskRefCode(item.riskRefCode);
    setFormRiskCategory(item.riskCategory);
    setFormRiskDescription(item.riskDescription);
    setFormRiskEvent(item.riskEvent || '');
    setFormLikelihood(item.inherentLikelihood);
    setFormImpact(item.inherentImpact);
    setFormControlRefCode(item.controlRefCode || '');
    setFormControlName(item.controlName);
    setFormControlDescription(item.controlDescription);
    setFormControlType(item.controlType);
    setFormControlMethod(item.controlMethod);
    setFormControlFrequency(item.controlFrequency);
    setFormControlOwner(item.controlOwner);
    setFormControlEffectiveness(item.controlEffectiveness);
    setFormNotes(item.notes || '');
    setIsFormOpen(true);
  };

  // Duplicate an RCM item
  const handleDuplicateItem = async (item: RiskControlMatrixItem) => {
    try {
      const newRefCode = `${item.riskRefCode}-COPY`;
      await addRcmItem({
        ...item,
        id: undefined,
        riskRefCode: newRefCode,
        controlRefCode: item.controlRefCode ? `${item.controlRefCode}-COPY` : undefined,
        riskDescription: `Copy of ${item.riskDescription}`
      });
      setNotification({ type: 'success', message: `Duplicated RCM item as ${newRefCode}` });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error duplicating RCM item' });
    }
  };

  // Save RCM Form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProcess.trim() || !formRiskDescription.trim() || !formControlName.trim()) {
      setNotification({ type: 'error', message: 'Process, Risk Description, and Key Control are mandatory.' });
      return;
    }

    try {
      const payload: Partial<RiskControlMatrixItem> = {
        departmentId: department.id,
        departmentCode: department.code,
        departmentName: department.name,
        process: formProcess.trim(),
        subProcess: formSubProcess.trim(),
        riskRefCode: formRiskRefCode.trim().toUpperCase(),
        riskCategory: formRiskCategory,
        riskDescription: formRiskDescription.trim(),
        riskEvent: formRiskEvent.trim(),
        inherentLikelihood: formLikelihood,
        inherentImpact: formImpact,
        controlRefCode: formControlRefCode.trim().toUpperCase(),
        controlName: formControlName.trim(),
        controlDescription: formControlDescription.trim(),
        controlType: formControlType,
        controlMethod: formControlMethod,
        controlFrequency: formControlFrequency,
        controlOwner: formControlOwner.trim(),
        controlEffectiveness: formControlEffectiveness,
        notes: formNotes.trim()
      };

      if (editingItem) {
        await editRcmItem(editingItem.id, payload);
        setNotification({ 
          type: 'success', 
          message: `RCM Item "${payload.riskRefCode}" updated. Department Inherent Risk Tier recalculated.` 
        });
      } else {
        await addRcmItem(payload);
        setNotification({ 
          type: 'success', 
          message: `New RCM Item "${payload.riskRefCode}" saved. Department Inherent Risk Score recalculated.` 
        });
      }

      setIsFormOpen(false);
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error saving RCM item' });
    }
  };

  // Delete RCM item
  const handleDeleteItem = async (id: string, refCode: string) => {
    if (!window.confirm(`Are you sure you want to remove RCM item "${refCode}"? The department's inherent risk score will automatically recalculate.`)) {
      return;
    }

    try {
      await removeRcmItem(id);
      setNotification({ type: 'success', message: `RCM item "${refCode}" deleted. Department risk score refreshed.` });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to delete RCM item' });
    }
  };

  // Apply Preset Template
  const handleApplyPreset = async (preset: typeof PRESET_RISK_TEMPLATES[0]) => {
    try {
      const nextIndex = deptRcmList.length + 1;
      const refCode = `RCM-${department.code.replace(/[^A-Z0-9]/g, '').slice(-3)}-${nextIndex.toString().padStart(3, '0')}`;
      const ctrlCode = `CTRL-${department.code.replace(/[^A-Z0-9]/g, '').slice(-3)}-${nextIndex.toString().padStart(2, '0')}`;

      await addRcmItem({
        departmentId: department.id,
        departmentCode: department.code,
        departmentName: department.name,
        process: preset.process,
        subProcess: preset.subProcess,
        riskRefCode: refCode,
        riskCategory: preset.category,
        riskDescription: preset.description,
        riskEvent: preset.event,
        inherentLikelihood: preset.likelihood,
        inherentImpact: preset.impact,
        controlRefCode: ctrlCode,
        controlName: preset.controlName,
        controlDescription: preset.controlDesc,
        controlType: preset.controlType,
        controlMethod: preset.controlMethod,
        controlFrequency: preset.controlFrequency,
        controlOwner: preset.controlOwner,
        controlEffectiveness: 'Effective',
        notes: `Imported from audit preset: ${preset.title}`
      });

      setShowPresetsMenu(false);
      setNotification({ type: 'success', message: `Added preset risk "${preset.title}" into Working Paper!` });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error applying preset risk' });
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Risk Ref Code',
      'Process',
      'Sub-Process',
      'Category',
      'Risk Description',
      'Root Cause Event',
      'Likelihood (1-5)',
      'Impact (1-5)',
      'Inherent Risk Score',
      'Inherent Risk Tier',
      'Control Ref Code',
      'Control Name',
      'Control Description',
      'Control Type',
      'Control Method',
      'Control Frequency',
      'Control Owner',
      'Control Effectiveness',
      'Residual Risk Score'
    ];

    const rows = deptRcmList.map(item => [
      `"${item.riskRefCode}"`,
      `"${item.process.replace(/"/g, '""')}"`,
      `"${item.subProcess.replace(/"/g, '""')}"`,
      `"${item.riskCategory}"`,
      `"${item.riskDescription.replace(/"/g, '""')}"`,
      `"${(item.riskEvent || '').replace(/"/g, '""')}"`,
      item.inherentLikelihood,
      item.inherentImpact,
      item.inherentRiskScore,
      `"${item.inherentRiskTier}"`,
      `"${item.controlRefCode || ''}"`,
      `"${item.controlName.replace(/"/g, '""')}"`,
      `"${item.controlDescription.replace(/"/g, '""')}"`,
      `"${item.controlType}"`,
      `"${item.controlMethod}"`,
      `"${item.controlFrequency}"`,
      `"${item.controlOwner.replace(/"/g, '""')}"`,
      `"${item.controlEffectiveness}"`,
      item.residualRiskScore || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inherent_Risk_Working_Paper_${department.code}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculated form preview score
  const liveFormScore = formLikelihood * formImpact;
  const liveFormTier: 'High' | 'Medium' | 'Low' = liveFormScore >= 15 ? 'High' : liveFormScore >= 8 ? 'Medium' : 'Low';

  // Heatmap matrix 5x5 data count
  const heatmapData = useMemo(() => {
    const grid: Record<string, number> = {};
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        grid[`${l}-${i}`] = 0;
      }
    }
    deptRcmList.forEach(item => {
      const key = `${item.inherentLikelihood}-${item.inherentImpact}`;
      grid[key] = (grid[key] || 0) + 1;
    });
    return grid;
  }, [deptRcmList]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* --- FORMAL AUDIT WORKING PAPER HEADER STRIP --- */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-600/30 border border-indigo-400/30 rounded-lg text-indigo-300 shrink-0 mt-0.5">
              <FileSpreadsheet className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                  WP-IR-{department.code}
                </span>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Internal Audit Working Paper · ERM Inherent Risk Assessment
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {wpStatus}
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-1">
                Risk Control Matrix (RCM) & Inherent Risk Working Paper: {department.name}
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Unit Head: <strong className="text-slate-200">{department.headName}</strong> ({department.headEmail})</span>
                <span>·</span>
                <span>Workforce: <strong className="text-slate-200">{department.employeeCount || 20} Staff</strong></span>
                <span>·</span>
                <span>Index Ref: <strong className="text-slate-200 font-mono">WP-IR-{department.code}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Download CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Print formal working paper"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              title="Close Working Paper"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- NOTIFICATION BANNER --- */}
        {notification && (
          <div className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <span className="font-medium flex items-center gap-1.5">
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
              {notification.message}
            </span>
            <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-slate-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* --- MAIN SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">

          {/* 1. EXECUTIVE INHERENT RISK CALCULATION CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-5 border-b border-slate-100">
              
              {/* Score Gauge & Tier */}
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center border shadow-xs ${
                  inherentMetrics.tier === 'High'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : inherentMetrics.tier === 'Medium'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Score</span>
                  <span className="text-2xl font-black font-mono tracking-tight">
                    {inherentMetrics.score.toFixed(1)}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">/ 25.0</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Department Inherent Risk Tier
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      (Auto-Calculated via System)
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mt-1">
                    <span className={`text-base font-black px-3 py-1 rounded-md border tracking-wide uppercase font-mono ${
                      inherentMetrics.tier === 'High'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : inherentMetrics.tier === 'Medium'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {inherentMetrics.tier} Risk Tier
                    </span>
                    
                    <span className="text-xs text-slate-600 font-medium">
                      Derived from <strong className="text-slate-900">{inherentMetrics.count}</strong> linked Risk Control Matrix entries
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>
                      Formula: <strong>Inherent Risk = Likelihood (1-5) × Impact (1-5)</strong>. Score ≥ 15 = High Risk; 8 - 14 = Medium; &lt; 8 = Low.
                    </span>
                  </p>
                </div>
              </div>

              {/* Working Paper Metadata inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Audit Assessor</span>
                  <select
                    value={assessorName}
                    onChange={(e) => setAssessorName(e.target.value)}
                    className="mt-0.5 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-800 outline-none w-full"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.name}>{u.name} ({u.title || u.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Assessment Cycle</span>
                  <input
                    type="text"
                    value={assessmentPeriod}
                    onChange={(e) => setAssessmentPeriod(e.target.value)}
                    className="mt-0.5 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-800 outline-none w-full"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Sign-off Status</span>
                  <select
                    value={wpStatus}
                    onChange={(e) => setWpStatus(e.target.value as any)}
                    className="mt-0.5 bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-800 outline-none w-full"
                  >
                    <option value="Draft">Draft Review</option>
                    <option value="Under Review">Fieldwork Under Review</option>
                    <option value="Sign-Off Approved">Sign-Off Approved</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Metrics Breakdown Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total RCM Items</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">{inherentMetrics.count}</span>
                <span className="text-[10px] text-slate-400">Identified risk events</span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100">
                <span className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider block">High Inherent Risks</span>
                <span className="text-lg font-bold font-mono text-rose-900 mt-0.5 block">{inherentMetrics.highCount}</span>
                <span className="text-[10px] text-rose-600">Score &ge; 15 (Critical priority)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100">
                <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block">Medium Inherent Risks</span>
                <span className="text-lg font-bold font-mono text-amber-900 mt-0.5 block">{inherentMetrics.medCount}</span>
                <span className="text-[10px] text-amber-600">Score 8 - 14</span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">Low Inherent Risks</span>
                <span className="text-lg font-bold font-mono text-emerald-900 mt-0.5 block">{inherentMetrics.lowCount}</span>
                <span className="text-[10px] text-emerald-600">Score 1 - 7</span>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100">
                <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider block">Average Likelihood / Impact</span>
                <span className="text-lg font-bold font-mono text-indigo-900 mt-0.5 block">
                  L: {inherentMetrics.avgLikelihood} · I: {inherentMetrics.avgImpact}
                </span>
                <span className="text-[10px] text-indigo-600">5-point internal audit scale</span>
              </div>
            </div>
          </div>

          {/* 2. INTERACTIVE 5x5 HEATMAP MATRIX DRAWER */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  Inherent Risk Heatmap Matrix (Likelihood &times; Impact)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Visual distribution of {department.name}&apos;s risk events. Click any cell to filter the Risk Control Matrix below.
                </p>
              </div>

              {selectedHeatmapCell && (
                <button
                  onClick={() => setSelectedHeatmapCell(null)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  Clear Matrix Filter ({selectedHeatmapCell.l} &times; {selectedHeatmapCell.i}) &times;
                </button>
              )}
            </div>

            {/* 5x5 Grid representation */}
            <div className="overflow-x-auto pb-1">
              <div className="min-w-[500px]">
                <div className="grid grid-cols-6 gap-1.5 text-center text-[11px]">
                  {/* Row headers */}
                  <div className="font-bold text-slate-400 py-1 flex items-center justify-center">
                    Likelihood \ Impact
                  </div>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={`col-hdr-${i}`} className="font-semibold text-slate-600 bg-slate-100 py-1 rounded">
                      {i}: {IMPACT_LABELS[i].name}
                    </div>
                  ))}

                  {/* Likelihood rows from 5 (top) to 1 (bottom) */}
                  {[5, 4, 3, 2, 1].map(l => (
                    <React.Fragment key={`row-${l}`}>
                      <div className="font-semibold text-slate-600 bg-slate-100 flex items-center justify-center p-1 rounded text-left px-2">
                        {l}: {LIKELIHOOD_LABELS[l].name}
                      </div>

                      {[1, 2, 3, 4, 5].map(i => {
                        const cellScore = l * i;
                        const count = heatmapData[`${l}-${i}`] || 0;
                        const isSelected = selectedHeatmapCell?.l === l && selectedHeatmapCell?.i === i;

                        let colorClass = 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100';
                        if (cellScore >= 15) {
                          colorClass = 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100';
                        } else if (cellScore >= 8) {
                          colorClass = 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100';
                        }

                        return (
                          <button
                            key={`cell-${l}-${i}`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedHeatmapCell(null);
                              } else {
                                setSelectedHeatmapCell({ l, i });
                              }
                            }}
                            className={`p-2 rounded border transition-all text-xs flex flex-col items-center justify-center relative ${colorClass} ${
                              isSelected ? 'ring-2 ring-slate-900 shadow-md font-bold' : ''
                            }`}
                          >
                            <span className="font-mono text-[10px] text-slate-500">
                              {cellScore}
                            </span>
                            <span className={`text-sm font-black font-mono mt-0.5 ${count > 0 ? 'scale-110' : 'opacity-40'}`}>
                              {count > 0 ? `${count} risks` : '—'}
                            </span>
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. MULTIPLE RISK CONTROL MATRIX (RCM) MANAGEMENT */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            
            {/* Table Action Bar */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search RCM by process, risk scenario, ref code, or control owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Filters & Actions */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Category filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 outline-none font-medium"
                >
                  <option value="all">All Risk Categories</option>
                  {RISK_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Tier filter */}
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 outline-none font-medium"
                >
                  <option value="all">All Inherent Tiers</option>
                  <option value="High">High Risk Tier</option>
                  <option value="Medium">Medium Risk Tier</option>
                  <option value="Low">Low Risk Tier</option>
                </select>

                {/* Presets dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
                    title="Insert standardized risk templates"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Presets</span>
                  </button>

                  {showPresetsMenu && (
                    <div className="absolute right-0 mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-30 p-2 text-xs">
                      <div className="px-2 py-1 font-bold text-slate-800 border-b border-slate-100 flex items-center justify-between">
                        <span>Standard Risk Templates</span>
                        <button onClick={() => setShowPresetsMenu(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto mt-1">
                        {PRESET_RISK_TEMPLATES.map((preset, idx) => (
                          <div 
                            key={idx}
                            onClick={() => handleApplyPreset(preset)}
                            className="p-2 hover:bg-slate-50 cursor-pointer rounded transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900 group-hover:text-indigo-600">{preset.title}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {preset.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{preset.description}</p>
                            <span className="text-[10px] text-indigo-600 font-medium mt-1 inline-block">
                              + Add to {department.code} (Inherent: {preset.likelihood * preset.impact})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Add RCM Button */}
                <button
                  onClick={handleOpenAddForm}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Input Risk Control Matrix</span>
                </button>
              </div>
            </div>

            {/* RCM Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-3.5 whitespace-nowrap">Risk Ref</th>
                    <th className="py-3 px-3.5">Business Process & Activity</th>
                    <th className="py-3 px-3.5 min-w-[220px]">Risk Event & Description</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Likelihood &times; Impact</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Inherent Risk Tier</th>
                    <th className="py-3 px-3.5 min-w-[220px]">Key Existing Controls</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Control Method & Type</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Owner</th>
                    <th className="py-3 px-3.5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRcm.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        <div className="max-w-md mx-auto text-center space-y-2">
                          <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="font-semibold text-slate-700">No Risk Control Matrix entries found</p>
                          <p className="text-xs text-slate-400">
                            Input multiple RCM entries for {department.name} or use standard presets to automatically calculate the inherent risk score and tier.
                          </p>
                          <button
                            onClick={handleOpenAddForm}
                            className="mt-3 px-3.5 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" /> Input First Risk Control Matrix
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRcm.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Ref Code */}
                        <td className="py-3 px-3.5 align-top whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block text-center">
                            {item.riskRefCode}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block text-center">
                            {item.riskCategory}
                          </span>
                        </td>

                        {/* Process */}
                        <td className="py-3 px-3.5 align-top">
                          <span className="font-bold text-slate-900 block">{item.process}</span>
                          {item.subProcess && (
                            <span className="text-[11px] text-slate-500 mt-0.5 block flex items-center gap-1">
                              <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                              {item.subProcess}
                            </span>
                          )}
                        </td>

                        {/* Risk Description */}
                        <td className="py-3 px-3.5 align-top max-w-sm">
                          <p className="text-slate-800 font-medium leading-relaxed">
                            {item.riskDescription}
                          </p>
                          {item.riskEvent && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">
                              <strong>Root Cause / Trigger:</strong> {item.riskEvent}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-[10px] text-slate-400 mt-1 border-l-2 border-slate-200 pl-1.5">
                              {item.notes}
                            </p>
                          )}
                        </td>

                        {/* Likelihood x Impact Calculation */}
                        <td className="py-3 px-3.5 align-top whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-center">
                              L:{item.inherentLikelihood}
                            </span>
                            <span className="text-slate-400">&times;</span>
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-center">
                              I:{item.inherentImpact}
                            </span>
                            <span className="text-slate-400">=</span>
                            <span className="font-mono font-black text-slate-900 text-sm">
                              {item.inherentRiskScore}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {LIKELIHOOD_LABELS[item.inherentLikelihood]?.name} &times; {IMPACT_LABELS[item.inherentImpact]?.name}
                          </span>
                        </td>

                        {/* Inherent Risk Tier */}
                        <td className="py-3 px-3.5 align-top whitespace-nowrap">
                          {item.inherentRiskTier === 'High' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                              High (Score {item.inherentRiskScore})
                            </span>
                          )}
                          {item.inherentRiskTier === 'Medium' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                              Medium (Score {item.inherentRiskScore})
                            </span>
                          )}
                          {item.inherentRiskTier === 'Low' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Low (Score {item.inherentRiskScore})
                            </span>
                          )}
                        </td>

                        {/* Controls */}
                        <td className="py-3 px-3.5 align-top max-w-sm">
                          <div className="flex items-center gap-1.5">
                            {item.controlRefCode && (
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {item.controlRefCode}
                              </span>
                            )}
                            <span className="font-bold text-slate-900">{item.controlName}</span>
                          </div>
                          {item.controlDescription && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                              {item.controlDescription}
                            </p>
                          )}
                        </td>

                        {/* Method & Frequency */}
                        <td className="py-3 px-3.5 align-top whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block">
                            {item.controlMethod} · {item.controlType}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            Cadence: {item.controlFrequency}
                          </span>
                        </td>

                        {/* Owner */}
                        <td className="py-3 px-3.5 align-top whitespace-nowrap">
                          <span className="font-medium text-slate-800 block">{item.controlOwner}</span>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {item.controlEffectiveness}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditForm(item)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                              title="Edit RCM Item"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateItem(item)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                              title="Duplicate Risk Item"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.riskRefCode)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                              title="Delete RCM Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom summary footer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-mono">
                Showing {filteredRcm.length} of {deptRcmList.length} Risk Control Matrix entries for {department.name}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px]">
                  Composite Inherent Risk Score: <strong className="text-slate-900 font-mono">{inherentMetrics.score}</strong>
                </span>
                <span>·</span>
                <span className="text-[11px]">
                  Inherent Risk Tier: <strong className="text-slate-900 font-bold">{inherentMetrics.tier}</strong>
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* --- MODAL FOR INPUTTING / EDITING RISK CONTROL MATRIX (RCM) --- */}
        {isFormOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8 border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingItem ? 'Edit Risk Control Matrix Item' : 'Input Risk Control Matrix (RCM) Item'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Business Unit: <strong className="text-slate-800">{department.name} ({department.code})</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">

                {/* Section A: Process & Scope */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
                    1. Business Process & Risk Classification
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Risk Reference Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={formRiskRefCode}
                        onChange={(e) => setFormRiskRefCode(e.target.value.toUpperCase())}
                        placeholder="e.g. RCM-ENG-001"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-xs font-bold focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Business Process *
                      </label>
                      <input
                        type="text"
                        required
                        value={formProcess}
                        onChange={(e) => setFormProcess(e.target.value)}
                        placeholder="e.g. Financial Reporting & General Ledger"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Sub-Process / Objective
                      </label>
                      <input
                        type="text"
                        value={formSubProcess}
                        onChange={(e) => setFormSubProcess(e.target.value)}
                        placeholder="e.g. Manual Journal Entries"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Risk Category *
                      </label>
                      <select
                        value={formRiskCategory}
                        onChange={(e) => setFormRiskCategory(e.target.value as RiskCategory)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white"
                      >
                        {RISK_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Root Cause / Risk Event Trigger
                      </label>
                      <input
                        type="text"
                        value={formRiskEvent}
                        onChange={(e) => setFormRiskEvent(e.target.value)}
                        placeholder="e.g. Missing dual authorization or insider override"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Risk Description & Potential Impact Scenario *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formRiskDescription}
                      onChange={(e) => setFormRiskDescription(e.target.value)}
                      placeholder="Describe what could go wrong, potential financial or operational loss, or regulatory non-compliance..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>

                {/* Section B: Inherent Risk Scoring & Live Calculation */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-indigo-600" />
                      2. Inherent Risk Evaluation (Likelihood &times; Impact)
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Evaluated prior to testing mitigating controls
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Likelihood Selector */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-800 mb-1.5">
                        Inherent Likelihood (1 - 5): <strong className="text-indigo-600 font-mono">{formLikelihood} - {LIKELIHOOD_LABELS[formLikelihood]?.name}</strong>
                      </label>
                      <div className="grid grid-cols-5 gap-1 text-center font-mono text-xs">
                        {[1, 2, 3, 4, 5].map(lvl => (
                          <button
                            type="button"
                            key={lvl}
                            onClick={() => setFormLikelihood(lvl)}
                            className={`py-1.5 rounded border transition-all ${
                              formLikelihood === lvl
                                ? 'bg-indigo-600 text-white font-bold border-indigo-700 ring-2 ring-indigo-200'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 italic">
                        {LIKELIHOOD_LABELS[formLikelihood]?.desc}
                      </p>
                    </div>

                    {/* Impact Selector */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-800 mb-1.5">
                        Inherent Impact (1 - 5): <strong className="text-indigo-600 font-mono">{formImpact} - {IMPACT_LABELS[formImpact]?.name}</strong>
                      </label>
                      <div className="grid grid-cols-5 gap-1 text-center font-mono text-xs">
                        {[1, 2, 3, 4, 5].map(lvl => (
                          <button
                            type="button"
                            key={lvl}
                            onClick={() => setFormImpact(lvl)}
                            className={`py-1.5 rounded border transition-all ${
                              formImpact === lvl
                                ? 'bg-indigo-600 text-white font-bold border-indigo-700 ring-2 ring-indigo-200'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 italic">
                        {IMPACT_LABELS[formImpact]?.desc}
                      </p>
                    </div>
                  </div>

                  {/* Realtime Inherent Score Pill */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Calculated Inherent Risk Score:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xl font-black text-slate-900">
                          {formLikelihood} &times; {formImpact} = {liveFormScore} / 25
                        </span>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase font-mono border ${
                          liveFormTier === 'High'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : liveFormTier === 'Medium'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {liveFormTier} Inherent Risk
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-500 max-w-xs">
                      Saving will automatically recompute <strong>{department.name}</strong>&apos;s overall Inherent Risk Tier in SQLite.
                    </div>
                  </div>
                </div>

                {/* Section C: Key Mitigating Controls */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
                    3. Key Mitigating Controls & Governance
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Control Reference Code
                      </label>
                      <input
                        type="text"
                        value={formControlRefCode}
                        onChange={(e) => setFormControlRefCode(e.target.value.toUpperCase())}
                        placeholder="e.g. CTRL-ENG-01"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-xs font-bold focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Control Title / Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formControlName}
                        onChange={(e) => setFormControlName(e.target.value)}
                        placeholder="e.g. Mandatory Dual-Authorization for Outbound Transfers"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Control Description & Implementation Specification
                    </label>
                    <textarea
                      rows={2}
                      value={formControlDescription}
                      onChange={(e) => setFormControlDescription(e.target.value)}
                      placeholder="Specify how the control operates, automated parameters, toolsets, approval thresholds..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Control Type
                      </label>
                      <select
                        value={formControlType}
                        onChange={(e) => setFormControlType(e.target.value as any)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs bg-white outline-none"
                      >
                        <option value="Preventive">Preventive</option>
                        <option value="Detective">Detective</option>
                        <option value="Corrective">Corrective</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Control Method
                      </label>
                      <select
                        value={formControlMethod}
                        onChange={(e) => setFormControlMethod(e.target.value as any)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs bg-white outline-none"
                      >
                        <option value="Automated">Automated</option>
                        <option value="Semi-Automated">Semi-Automated</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Frequency
                      </label>
                      <select
                        value={formControlFrequency}
                        onChange={(e) => setFormControlFrequency(e.target.value as any)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs bg-white outline-none"
                      >
                        <option value="Continuous">Continuous</option>
                        <option value="Per-Transaction">Per-Transaction</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annual">Annual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Effectiveness
                      </label>
                      <select
                        value={formControlEffectiveness}
                        onChange={(e) => setFormControlEffectiveness(e.target.value as any)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs bg-white outline-none font-medium"
                      >
                        <option value="Effective">Effective</option>
                        <option value="Partially Effective">Partially Effective</option>
                        <option value="Ineffective">Ineffective</option>
                        <option value="Not Tested">Not Tested</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Control Owner (Designee)
                      </label>
                      <input
                        type="text"
                        value={formControlOwner}
                        onChange={(e) => setFormControlOwner(e.target.value)}
                        placeholder="e.g. Lead Security Architect"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Auditor Working Notes / Artifact Reference
                      </label>
                      <input
                        type="text"
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        placeholder="e.g. Verified in Q1 SOC 2 audit sample. Jira: SEC-402"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <span>{editingItem ? 'Save & Recalculate Tier' : 'Add RCM & Recalculate Tier'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
