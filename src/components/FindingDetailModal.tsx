import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { Finding, CAPAPlan, RemediationEvidence } from '../types/audit';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  History, 
  Link as LinkIcon, 
  User, 
  Calendar,
  AlertCircle,
  FileCheck,
  Send,
  Eye
} from 'lucide-react';

interface FindingDetailModalProps {
  findingId: string;
  onClose: () => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({ findingId, onClose }) => {
  const { 
    findings, 
    updateFindingCAPA, 
    addFindingEvidence, 
    requestVerification, 
    verifyFinding, 
    currentUser 
  } = useAudit();

  const finding = findings.find(f => f.id === findingId);
  const [activeTab, setActiveTab] = useState<'overview' | 'capa' | 'evidence' | 'verification' | 'history'>('overview');

  // CAPA Form state
  const [rootCause, setRootCause] = useState(finding?.capa.rootCause || '');
  const [correctiveAction, setCorrectiveAction] = useState(finding?.capa.correctiveAction || '');
  const [preventiveAction, setPreventiveAction] = useState(finding?.capa.preventiveAction || '');
  const [targetDate, setTargetDate] = useState(finding?.capa.targetDate || '');

  // Evidence Form state
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const [evidenceFileType, setEvidenceFileType] = useState('application/pdf');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceLinkRef, setEvidenceLinkRef] = useState('');

  // Auditor Verification Form state
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  if (!finding) return null;

  const isAuditor = currentUser.role === 'lead_auditor' || currentUser.role === 'field_auditor';
  const isOwner = currentUser.id === finding.assignedOwnerId || currentUser.role === 'remediation_owner';

  // Handle CAPA submission
  const handleSaveCAPA = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCapa: CAPAPlan = {
      rootCause,
      correctiveAction,
      preventiveAction,
      targetDate: targetDate || finding.dueDate
    };
    updateFindingCAPA(finding.id, updatedCapa);
    setActiveTab('evidence');
  };

  // Handle adding evidence
  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceFileName.trim()) return;

    addFindingEvidence(finding.id, {
      fileName: evidenceFileName.trim(),
      fileType: evidenceFileType,
      description: evidenceDesc.trim() || 'Remediation implementation evidence.',
      linkRef: evidenceLinkRef.trim() || undefined,
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`
    });

    setEvidenceFileName('');
    setEvidenceDesc('');
    setEvidenceLinkRef('');
    setShowAddEvidence(false);
  };

  // Handle request verification
  const handleRequestVerification = () => {
    requestVerification(finding.id, 'Remediation completed. Evidence submitted for formal audit verification.');
    setActiveTab('verification');
  };

  // Handle Auditor verification
  const handleApprove = () => {
    verifyFinding(
      finding.id, 
      'approved', 
      verificationNotes.trim() || 'Reviewed submitted evidence, configuration files, and test telemetry. Remediation verified and finding closed.'
    );
  };

  const handleReject = () => {
    if (!rejectionNotes.trim()) return;
    verifyFinding(finding.id, 'rejected', rejectionNotes.trim());
    setShowRejectBox(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-slate-900 text-xs bg-slate-200/80 px-2 py-0.5 rounded">
                {finding.id}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                finding.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                finding.severity === 'High' ? 'bg-amber-100 text-amber-800' :
                finding.severity === 'Medium' ? 'bg-indigo-100 text-indigo-800' :
                'bg-slate-100 text-slate-700'
              }`}>
                {finding.severity} Severity
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-600 font-semibold">
                Control {finding.controlCode}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-medium">
                {finding.framework}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {finding.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
              finding.status === 'Verification Pending' ? 'bg-indigo-100 text-indigo-800' :
              finding.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
              finding.status === 'Remediation Proposed' ? 'bg-sky-100 text-sky-800' :
              'bg-slate-100 text-slate-700'
            }`}>
              {finding.status}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lifecycle Stepper */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white overflow-x-auto">
          <div className="flex items-center justify-between min-w-[620px] text-xs">
            {[
              { label: 'Identified', done: true, current: false },
              { label: 'Assigned', done: true, current: false },
              { label: 'CAPA Proposed', done: !!finding.capa.submittedAt || finding.status !== 'Open', current: finding.status === 'Open' },
              { label: 'Evidence Attached', done: finding.evidence.length > 0, current: finding.status === 'Remediation Proposed' },
              { label: 'Verification', done: finding.status === 'Closed', current: finding.status === 'Verification Pending' },
              { label: 'Closed', done: finding.status === 'Closed', current: false }
            ].map((step, idx) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                  step.done 
                    ? 'bg-slate-900 text-white' 
                    : step.current 
                    ? 'border-2 border-slate-900 text-slate-900 bg-white' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {step.done ? '✓' : idx + 1}
                </div>
                <span className={`font-medium ${step.done || step.current ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </span>
                {idx < 5 && <span className="text-slate-300 mx-1">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-6 text-xs font-semibold bg-slate-50/50">
          {[
            { id: 'overview', label: 'Finding Overview' },
            { id: 'capa', label: 'CAPA Remediation Plan' },
            { id: 'evidence', label: `Evidence (${finding.evidence.length})` },
            { id: 'verification', label: 'Auditor Verification' },
            { id: 'history', label: `Audit Trail (${finding.history.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Non-Compliance Observation
                </h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-800">
                  {finding.description}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" /> Remediation Owner
                  </h4>
                  <p className="text-slate-800 font-medium">{finding.assignedOwnerName}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{finding.assignedOwnerEmail}</p>
                  <p className="text-slate-500">{finding.department}</p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> SLA Remediation Deadlines
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Identified:</span>
                    <span className="font-mono text-slate-800">{finding.identifiedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remediation Due Date:</span>
                    <span className="font-mono font-bold text-slate-900">{finding.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Associated Audit:</span>
                    <span className="text-slate-800 font-medium truncate max-w-[180px]">{finding.auditTitle}</span>
                  </div>
                </div>
              </div>

              {/* Status Action Suggestion */}
              <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-950 block">Next Action in Workflow:</span>
                  <p className="text-indigo-800 mt-0.5">
                    {finding.status === 'Open' && 'Remediation Owner must submit Root Cause Analysis & Corrective Action Plan (CAPA).'}
                    {finding.status === 'Remediation Proposed' && 'Upload evidence artifacts (e.g. pull requests, config logs) and request verification.'}
                    {finding.status === 'Verification Pending' && 'Lead Auditor must review evidence and sign off or reject the remediation.'}
                    {finding.status === 'Closed' && 'Finding is verified and closed with immutable audit sign-off.'}
                  </p>
                </div>
                {finding.status === 'Open' && (
                  <button
                    onClick={() => setActiveTab('capa')}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800"
                  >
                    Enter CAPA →
                  </button>
                )}
                {finding.status === 'Remediation Proposed' && (
                  <button
                    onClick={() => setActiveTab('evidence')}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800"
                  >
                    Attach Evidence →
                  </button>
                )}
                {finding.status === 'Verification Pending' && (
                  <button
                    onClick={() => setActiveTab('verification')}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700"
                  >
                    Perform Sign-off →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CAPA PLAN */}
          {activeTab === 'capa' && (
            <form onSubmit={handleSaveCAPA} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Corrective and Preventive Action (CAPA) Plan
                  </h3>
                  <p className="text-slate-500">
                    Document root cause failure mode, containment actions, and systemic preventive measures.
                  </p>
                </div>
                {finding.capa.submittedAt && (
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                    Submitted: {finding.capa.submittedAt.substring(0, 10)}
                  </span>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Root Cause Analysis (5-Whys / Ishikawa Failure Mode) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="Explain fundamental technical, procedural, or human factor breakdown that caused the issue..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Immediate Corrective Action (Remediation Execution) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  placeholder="Detail exact remediation changes applied to eliminate the immediate vulnerability..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Preventive Action (Long-Term Defect Prevention) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={preventiveAction}
                  onChange={(e) => setPreventiveAction(e.target.value)}
                  placeholder="Systemic controls, CI/CD policy-as-code, or recurring scans implemented to prevent recurrence..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Remediation Completion Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Submitting CAPA triggers an email notification to Lead Auditor Marcus Vance.
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
                >
                  Save & Submit CAPA Plan
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: EVIDENCE & PROOF */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Remediation Evidence & Verification Artifacts
                  </h3>
                  <p className="text-slate-500">
                    Attach pull requests, architecture configs, KMS key ARN logs, or pen-test retest reports.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddEvidence(!showAddEvidence)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach Evidence</span>
                </button>
              </div>

              {/* Add Evidence Form */}
              {showAddEvidence && (
                <form onSubmit={handleAddEvidence} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900">Upload / Attach Remediation Artifact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">File / Artifact Name *</label>
                      <input
                        type="text"
                        required
                        value={evidenceFileName}
                        onChange={(e) => setEvidenceFileName(e.target.value)}
                        placeholder="e.g. pr_542_disable_root_ssh.pdf"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Artifact Type</label>
                      <select
                        value={evidenceFileType}
                        onChange={(e) => setEvidenceFileType(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
                      >
                        <option value="application/pdf">PDF Report / Policy Sign-off</option>
                        <option value="application/json">JSON Telemetry / Audit Log</option>
                        <option value="text/x-terraform">Terraform / HCL Code Script</option>
                        <option value="image/png">Screenshot / UI Proof</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Evidence Description & Testing Methodology</label>
                    <textarea
                      rows={2}
                      value={evidenceDesc}
                      onChange={(e) => setEvidenceDesc(e.target.value)}
                      placeholder="Explain how this artifact proves the finding is completely remediated..."
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Repository / PR Link (Optional)</label>
                    <input
                      type="url"
                      value={evidenceLinkRef}
                      onChange={(e) => setEvidenceLinkRef(e.target.value)}
                      placeholder="https://github.com/organization/repo/pull/123"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddEvidence(false)}
                      className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800"
                    >
                      Add Evidence
                    </button>
                  </div>
                </form>
              )}

              {/* Evidence List */}
              <div className="space-y-2.5">
                {finding.evidence.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    No evidence attached yet. Click "Attach Evidence" above to upload verification proof.
                  </div>
                ) : (
                  finding.evidence.map(evd => (
                    <div
                      key={evd.id}
                      className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-slate-100 rounded text-slate-700 shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 truncate">{evd.fileName}</span>
                            <span className="text-[10px] font-mono text-slate-400">({evd.size})</span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{evd.description}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                            <span>Uploaded by {evd.uploadedBy}</span>
                            <span>·</span>
                            <span>{evd.uploadedAt}</span>
                            {evd.linkRef && (
                              <>
                                <span>·</span>
                                <a
                                  href={evd.linkRef}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-600 hover:underline flex items-center gap-0.5"
                                >
                                  <LinkIcon className="w-2.5 h-2.5" /> Link
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium shrink-0">
                        Verified Attached
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Action: Request Verification */}
              {finding.status !== 'Verification Pending' && finding.status !== 'Closed' && finding.evidence.length > 0 && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  <span className="text-slate-700">
                    Evidence ready? Submit this finding for formal Lead Auditor verification sign-off.
                  </span>
                  <button
                    onClick={handleRequestVerification}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Request Auditor Sign-off</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDITOR VERIFICATION & SIGN-OFF */}
          {activeTab === 'verification' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Independent Remediation Verification & Sign-off
                  </h3>
                  <p className="text-slate-500">
                    Auditor evaluation of corrective proof, re-test sampling, and formal closure authority.
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
                  finding.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                  finding.status === 'Verification Pending' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  Current Status: {finding.status}
                </span>
              </div>

              {/* Closed Verification Certificate Display */}
              {finding.status === 'Closed' && finding.verification.verifiedBy && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Formal Audit Verification Approved & Certified Closed</span>
                  </div>
                  <p className="text-emerald-800 italic">
                    "{finding.verification.notes}"
                  </p>
                  <div className="pt-2 border-t border-emerald-200/60 text-[11px] font-mono text-emerald-700 flex items-center justify-between">
                    <span>Verified by: <strong>{finding.verification.verifiedBy}</strong> ({finding.verification.signOffTitle || 'Lead Auditor'})</span>
                    <span>Date: {finding.verification.verifiedAt}</span>
                  </div>
                </div>
              )}

              {/* Verification Review Interface for Open/Pending */}
              {finding.status !== 'Closed' && (
                <div className="space-y-4">
                  {/* Evidence Checklist for the Auditor */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <h4 className="font-semibold text-slate-900">
                      Evidence Submitted by Auditee ({finding.evidence.length} Artifacts):
                    </h4>
                    {finding.evidence.length === 0 ? (
                      <p className="text-slate-500 italic">No artifacts uploaded yet.</p>
                    ) : (
                      finding.evidence.map(e => (
                        <div key={e.id} className="flex items-center justify-between text-xs py-1">
                          <span className="font-medium text-slate-800">• {e.fileName}</span>
                          <span className="text-slate-500 font-mono">{e.description}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Auditor Role Gate Check */}
                  {!isAuditor ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                        <span>Role-Based Access Control Notice</span>
                      </div>
                      <p className="text-xs text-amber-800">
                        You are currently operating as <strong>{currentUser.name}</strong> ({currentUser.roleLabel}). Only users with the <strong>Lead Auditor</strong> or <strong>Field Auditor</strong> role are authorized to certify closure or reject remediation. Use the persona switcher in the top bar to switch to Marcus Vance or Elena Rostova.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <label className="block font-semibold text-slate-800">
                        Auditor Sign-off Statement & Retest Observations:
                      </label>
                      <textarea
                        rows={3}
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="State why the remediation is certified as complete, referencing configuration verification and compliance adherence..."
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                      />

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => setShowRejectBox(!showRejectBox)}
                          className="px-3 py-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded border border-rose-200 font-medium transition-colors"
                        >
                          Reject / Request More Evidence
                        </button>

                        <button
                          onClick={handleApprove}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Verification & Close Finding</span>
                        </button>
                      </div>

                      {/* Rejection Feedback Box */}
                      {showRejectBox && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5 mt-3">
                          <h4 className="font-bold text-rose-900">
                            Provide Rejection Feedback & Additional Requirements
                          </h4>
                          <textarea
                            rows={2}
                            value={rejectionNotes}
                            onChange={(e) => setRejectionNotes(e.target.value)}
                            placeholder="Specify what additional proof, retesting, or configuration changes are required before closure..."
                            className="w-full p-2 border border-rose-300 rounded text-xs focus:ring-1 focus:ring-rose-500 outline-none bg-white"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setShowRejectBox(false)}
                              className="px-2.5 py-1 text-slate-600 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleReject}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium"
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Immutable Audit Trail & Activity Log</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {finding.history.length} recorded events
                </span>
              </div>

              <div className="space-y-3">
                {finding.history.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.action}</span>
                      <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                        {item.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span>Actor: <strong>{item.actor}</strong> ({item.actorRole})</span>
                    </div>
                    {item.comment && (
                      <p className="text-slate-700 italic pt-1 border-t border-slate-200/60 mt-1">
                        "{item.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>Audit: {finding.auditId}</span>
            <span>·</span>
            <span>Due: {finding.dueDate}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
