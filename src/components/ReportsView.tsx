import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { 
  FileText, 
  Printer, 
  Download, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  Layers
} from 'lucide-react';
import { ALL_WORKFLOW_STAGES } from '../types/audit';

export const ReportsView: React.FC = () => {
  const { audits, findings, controls, currentUser, dispatchEmailNotification } = useAudit();
  const [selectedAuditId, setSelectedAuditId] = useState<string>(audits[0]?.id || '');
  const [reportType, setReportType] = useState<'executive' | 'detailed_capa'>('executive');
  const [emailSentAlert, setEmailSentAlert] = useState(false);

  const selectedAudit = audits.find(a => a.id === selectedAuditId) || audits[0];
  const auditFindings = findings.filter(f => f.auditId === selectedAudit?.id);
  const auditControls = controls.filter(c => c.auditId === selectedAudit?.id);

  const criticalFindings = auditFindings.filter(f => f.severity === 'Critical');
  const highFindings = auditFindings.filter(f => f.severity === 'High');
  const closedFindings = auditFindings.filter(f => f.status === 'Closed');

  const testedControls = auditControls.filter(c => c.status !== 'not_tested');
  const passedControls = auditControls.filter(c => c.status === 'pass');
  const passRate = testedControls.length > 0 
    ? Math.round((passedControls.length / testedControls.length) * 100) 
    : 100;

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (!selectedAudit) return;
    const headers = ['Finding ID', 'Audit ID', 'Control Code', 'Title', 'Severity', 'Framework', 'Department', 'Owner', 'Due Date', 'Status', 'CAPA Root Cause', 'CAPA Corrective Action', 'Verified By'];
    const rows = auditFindings.map(f => [
      `"${f.id}"`,
      `"${f.auditId}"`,
      `"${f.controlCode}"`,
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.severity}"`,
      `"${f.framework}"`,
      `"${f.department}"`,
      `"${f.assignedOwnerName}"`,
      `"${f.dueDate}"`,
      `"${f.status}"`,
      `"${(f.capa.rootCause || '').replace(/"/g, '""')}"`,
      `"${(f.capa.correctiveAction || '').replace(/"/g, '""')}"`,
      `"${f.verification.verifiedBy || 'Pending'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Report_${selectedAudit.id}_Findings.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export handler
  const handleExportJSON = () => {
    if (!selectedAudit) return;
    const reportData = {
      audit: selectedAudit,
      controls: auditControls,
      findings: auditFindings,
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser.name,
      certification: 'Certified Independent Compliance Review'
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Audit_Report_${selectedAudit.id}_Full.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Email report to executive stakeholders
  const handleEmailReport = () => {
    if (!selectedAudit) return;
    dispatchEmailNotification(
      'audit_report_published',
      'Audit Summary Report Published',
      `[Audit Report] Formal Executive Audit Report: ${selectedAudit.title}`,
      's.jenkins@aegisaudit.internal',
      'Sarah Jenkins',
      'Executive Stakeholder',
      `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 24px; color: white;">
            <h2 style="margin: 0; font-size: 20px;">AegisAudit Executive Audit Summary</h2>
            <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">${selectedAudit.id} · ${selectedAudit.framework}</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
            <p style="font-size: 14px; line-height: 1.5;">
              Lead Auditor <strong>${currentUser.name}</strong> has compiled the formal executive compliance report for <strong>${selectedAudit.title}</strong>.
            </p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 8px; font-weight: bold; font-size: 14px;">Key Compliance Metrics:</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569;">
                <li>Overall Control Pass Rate: <strong>${passRate}%</strong></li>
                <li>Total Non-Compliance Findings: <strong>${auditFindings.length}</strong></li>
                <li>Critical Severities: <strong>${criticalFindings.length}</strong></li>
                <li>Current Milestone: <strong>${selectedAudit.currentStage}</strong></li>
              </ul>
            </div>
            <p style="font-size: 12px; color: #94a3b8;">Generated via AegisAudit Automated Reporting Engine.</p>
          </div>
        </div>
      `,
      undefined,
      selectedAudit.id
    );

    setEmailSentAlert(true);
    setTimeout(() => setEmailSentAlert(false), 4000);
  };

  if (!selectedAudit) return null;

  return (
    <div className="space-y-6">
      {/* Control Toolbar - Hidden in Print */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">
              Automated Audit Reporting Studio
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
              Formal Outputs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate board-ready executive summaries, regulatory compliance packets, and CAPA verification dossiers.
          </p>
        </div>

        {/* Audit Selector & Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-lg">
            <span className="text-slate-500">Audit:</span>
            <select
              value={selectedAuditId}
              onChange={(e) => setSelectedAuditId(e.target.value)}
              className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer max-w-[200px]"
            >
              {audits.map(a => (
                <option key={a.id} value={a.id}>{a.id} - {a.framework}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors"
            title="Download JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleEmailReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Report</span>
          </button>
        </div>
      </div>

      {emailSentAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Formal executive audit report dispatched to VP of Risk Sarah Jenkins & Governance Board.</span>
          </div>
        </div>
      )}

      {/* FORMAL AUDIT REPORT DOCUMENT CONTAINER (PRINT-READY) */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-sm max-w-4xl mx-auto space-y-8 text-slate-900">
        {/* Document Header & Formal Letterhead */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-900 text-white rounded flex items-center justify-center font-bold font-display text-sm">
                A
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight uppercase">
                AegisAudit Internal Governance & Assurance
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Independent Examination & Regulatory Compliance Assessment Report
            </p>
          </div>

          <div className="text-right text-xs font-mono">
            <span className="block font-bold text-slate-900">{selectedAudit.id}</span>
            <span className="text-slate-500">Date: 2026-03-18</span>
            <span className="text-slate-500 block">Confidential / Internal Use</span>
          </div>
        </div>

        {/* Report Title & Metadata Table */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            {selectedAudit.title}
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Regulatory Framework:</span>
              <span className="font-bold text-slate-900">{selectedAudit.framework}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Department Audited:</span>
              <span className="font-bold text-slate-900">{selectedAudit.department}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Lead Auditor:</span>
              <span className="font-bold text-slate-900">{selectedAudit.leadAuditorName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Audit Period:</span>
              <span className="font-mono text-slate-900">{selectedAudit.startDate} to {selectedAudit.endDate}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
            01. Executive Summary & Assurance Level
          </h2>
          <p className="text-xs leading-relaxed text-slate-700">
            Internal Audit has concluded fieldwork testing and control evaluation for the <strong>{selectedAudit.title}</strong> covering {selectedAudit.scope}. The engagement was conducted in alignment with International Standard on Assurance Engagements (ISAE 3000) and regulatory criteria governing {selectedAudit.framework}.
          </p>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-900 block text-sm">Assurance Rating:</span>
              <span className="text-slate-600">
                {criticalFindings.length === 0 ? 'Satisfactory with Minor Remediations' : 'Qualified Opinion - Critical Actions Pending'}
              </span>
            </div>
            <div className="flex items-center gap-6 font-mono text-center">
              <div>
                <span className="text-lg font-bold text-slate-900 tabular-nums">{passRate}%</span>
                <span className="block text-[11px] text-slate-500 font-sans">Controls Passed</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="text-lg font-bold text-slate-900 tabular-nums">{auditFindings.length}</span>
                <span className="block text-[11px] text-slate-500 font-sans">Total Findings</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="text-lg font-bold text-rose-600 tabular-nums">{criticalFindings.length}</span>
                <span className="block text-[11px] text-slate-500 font-sans">Critical</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: 6-Stage Process Workflow Milestone Record */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
            02. Audit Process Workflow Execution Record
          </h2>
          <p className="text-xs text-slate-600">
            The engagement executed against the organization's standardized 6-stage lifecycle, with stage configurations validated during initial planning:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {ALL_WORKFLOW_STAGES.map((stg) => {
              const cfg = selectedAudit.stageConfigs[stg];
              const isEnabled = cfg?.enabled;
              const isDone = cfg?.status === 'completed';

              return (
                <div
                  key={stg}
                  className={`p-2.5 rounded border ${
                    !isEnabled ? 'bg-slate-50 border-dashed border-slate-200 text-slate-400' :
                    isDone ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' :
                    'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{stg}</span>
                    <span className="font-mono text-[10px]">
                      {!isEnabled ? 'Disabled' : isDone ? 'Completed' : 'Active'}
                    </span>
                  </div>
                  <span className="text-[11px] block mt-1 text-slate-500">
                    {cfg?.checklist.filter(c => c.done).length}/{cfg?.checklist.length} Checklist items
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Non-Compliance Findings & CAPA Matrix */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
            03. Non-Compliance Findings & Remediation Matrix
          </h2>

          {auditFindings.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No non-compliance findings identified for this audit program.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">ID / Control</th>
                    <th className="p-2.5">Severity</th>
                    <th className="p-2.5">Finding Description</th>
                    <th className="p-2.5">Remediation Owner</th>
                    <th className="p-2.5">Target SLA</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditFindings.map(f => (
                    <tr key={f.id}>
                      <td className="p-2.5 font-mono font-bold whitespace-nowrap">
                        {f.id}<br/>
                        <span className="text-[10px] text-slate-500 font-sans">{f.controlCode}</span>
                      </td>
                      <td className="p-2.5 whitespace-nowrap font-semibold">
                        <span className={
                          f.severity === 'Critical' ? 'text-rose-600' :
                          f.severity === 'High' ? 'text-amber-600' : 'text-indigo-600'
                        }>
                          {f.severity}
                        </span>
                      </td>
                      <td className="p-2.5 max-w-xs">
                        <p className="font-semibold text-slate-900">{f.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{f.description}</p>
                      </td>
                      <td className="p-2.5 whitespace-nowrap">{f.assignedOwnerName}</td>
                      <td className="p-2.5 whitespace-nowrap font-mono text-[11px]">{f.dueDate}</td>
                      <td className="p-2.5 whitespace-nowrap font-medium">{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 4: Formal Auditor Certification & Sign-off */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            04. Formal Auditor Certification & Sign-off
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed italic">
            "I hereby attest that the fieldwork procedures, control testing, and finding evaluations documented in this report accurately reflect the compliance controls posture of the audited entities as of the examination date."
          </p>

          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-xs text-slate-900">{selectedAudit.leadAuditorName}</p>
              <p className="text-[11px] text-slate-500">Director of Internal Audit & Assurance</p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">Certified Information Systems Auditor (CISA)</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-xs text-slate-900">Sarah Jenkins</p>
              <p className="text-[11px] text-slate-500">Vice President of Enterprise Risk & Governance</p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">Audit Committee & Board Stakeholder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
