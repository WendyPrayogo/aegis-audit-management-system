import React from 'react';
import { useAudit } from '../context/AuditContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  FileText, 
  ArrowRight, 
  Layers, 
  Activity,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { ALL_WORKFLOW_STAGES } from '../types/audit';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onSelectFinding: (findingId: string) => void;
  onOpenCreateFinding: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onSelectFinding,
  onOpenCreateFinding
}) => {
  const { audits, findings, controls, currentUser } = useAudit();

  // Metrics calculation
  const totalAudits = audits.length;
  const activeAudits = audits.filter(a => a.currentStage !== 'Reporting' || a.progress < 100).length;
  
  const openFindings = findings.filter(f => f.status !== 'Closed');
  const criticalFindings = openFindings.filter(f => f.severity === 'Critical');
  const highFindings = openFindings.filter(f => f.severity === 'High');
  const mediumFindings = openFindings.filter(f => f.severity === 'Medium');
  const lowFindings = openFindings.filter(f => f.severity === 'Low');
  const closedFindings = findings.filter(f => f.status === 'Closed');

  // Check for overdue findings (dueDate < today)
  const todayStr = '2026-03-18'; // fixed reference within simulation timeline
  const overdueFindings = openFindings.filter(f => f.dueDate < todayStr);

  // Verification pending
  const verificationPendingFindings = findings.filter(f => f.status === 'Verification Pending');

  // Controls pass rate
  const testedControls = controls.filter(c => c.status !== 'not_tested');
  const passedControls = controls.filter(c => c.status === 'pass');
  const complianceScore = testedControls.length > 0 
    ? Math.round((passedControls.length / testedControls.length) * 100) 
    : 92;

  // Average remediation cycle (mock MTTR calculation based on realistic SLA)
  const avgMTTR = '14.2';

  // Framework compliance breakdown
  const frameworks = ['ISO 27001', 'SOC 2 Type II', 'HIPAA Security', 'SOX 404', 'OSHA Safety'] as const;
  const frameworkScores = frameworks.map(fw => {
    const fwAudits = audits.filter(a => a.framework === fw);
    const fwFindings = findings.filter(f => f.framework === fw);
    const fwClosed = fwFindings.filter(f => f.status === 'Closed').length;
    const fwTotal = fwFindings.length;
    const score = fwTotal === 0 ? 100 : Math.round(((fwClosed + 1) / (fwTotal + 1)) * 94);
    return {
      framework: fw,
      score: Math.min(100, Math.max(78, score)),
      auditCount: fwAudits.length,
      findingCount: fwFindings.length
    };
  });

  return (
    <div className="space-y-6">
      {/* Welcome & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">
              Executive Compliance & Audit Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time compliance posture, end-to-end workflow milestones, and CAPA remediation SLA tracking.
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab('kanban')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Workflow Kanban</span>
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Reports</span>
          </button>
        </div>
      </div>

      {/* Critical Overdue & Verification Alerts Strip */}
      {(overdueFindings.length > 0 || verificationPendingFindings.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overdue Warning */}
          {overdueFindings.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between gap-3 text-left">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-rose-900">
                    {overdueFindings.length} Remediation SLA Breach Warning
                  </h3>
                  <p className="text-xs text-rose-700 mt-0.5 line-clamp-1">
                    {overdueFindings[0].title} (Target was {overdueFindings[0].dueDate})
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSelectFinding(overdueFindings[0].id)}
                className="text-xs font-semibold text-rose-900 bg-rose-200/70 hover:bg-rose-200 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                Review Issue
              </button>
            </div>
          )}

          {/* Verification Pending Action */}
          {verificationPendingFindings.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start justify-between gap-3 text-left">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-indigo-900">
                    {verificationPendingFindings.length} Finding Ready for Verification
                  </h3>
                  <p className="text-xs text-indigo-700 mt-0.5 line-clamp-1">
                    {verificationPendingFindings[0].title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSelectFinding(verificationPendingFindings[0].id)}
                className="text-xs font-semibold text-indigo-900 bg-indigo-200/70 hover:bg-indigo-200 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                Verify Evidence
              </button>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Active Audits */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Active Audits</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {activeAudits}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              of {totalAudits} total
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>In 6-stage Kanban</span>
          </div>
        </div>

        {/* Card 2: Open Findings */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Open Non-Compliances</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {openFindings.length}
            </span>
            <span className="text-[11px] text-rose-600 font-semibold font-mono">
              {criticalFindings.length} Critical
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>{closedFindings.length} verified & closed</span>
          </div>
        </div>

        {/* Card 3: Compliance Health Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Overall Health Score</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {complianceScore}%
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold font-mono">
              +3.5% QoQ
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>{passedControls.length}/{testedControls.length} Controls passed</span>
          </div>
        </div>

        {/* Card 4: Verification Pending */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Sign-off Verification</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {verificationPendingFindings.length}
            </span>
            <span className="text-[11px] text-indigo-600 font-semibold font-mono">
              Evidence Ready
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Awaiting Lead Auditor</span>
          </div>
        </div>

        {/* Card 5: MTTR */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-xs text-slate-500 font-medium block">Mean Remediation (MTTR)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {avgMTTR}d
            </span>
            <span className="text-[11px] text-emerald-600 font-mono">
              Target &lt; 30d
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Across all frameworks</span>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Workflow Funnel & Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 6-Stage Workflow Funnel */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Audit Process Workflow Funnel
              </h2>
              <p className="text-xs text-slate-500">
                Audits progressing across the 6 configurable stages
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('kanban')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <span>View Kanban Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {ALL_WORKFLOW_STAGES.map((stg, i) => {
              const inStageCount = audits.filter(a => a.currentStage === stg).length;
              const completedCount = audits.filter(a => a.stageConfigs[stg]?.status === 'completed').length;

              return (
                <div
                  key={stg}
                  onClick={() => onNavigateTab('kanban')}
                  className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-all text-left"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-slate-400 font-semibold">0{i + 1}</span>
                    <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                      {inStageCount}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 truncate">{stg}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 tabular-nums">
                    {completedCount} completed
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Notice on planning configuration */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Stage configuration active: Pre-Exit and Exit Meetings can be disabled per audit.</span>
            <button
              onClick={() => onNavigateTab('kanban')}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-xs whitespace-nowrap ml-2"
            >
              Configure in Planning →
            </button>
          </div>
        </div>

        {/* Right: Findings by Severity Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Findings by Severity
              </h2>
              <p className="text-xs text-slate-500">
                Risk distribution across active audits
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('findings')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <span>Manage Findings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Severity Matrix Rows */}
          <div className="space-y-2.5 pt-2">
            {[
              { label: 'Critical', count: criticalFindings.length, total: findings.filter(f => f.severity === 'Critical').length, color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
              { label: 'High', count: highFindings.length, total: findings.filter(f => f.severity === 'High').length, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
              { label: 'Medium', count: mediumFindings.length, total: findings.filter(f => f.severity === 'Medium').length, color: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50' },
              { label: 'Low', count: lowFindings.length, total: findings.filter(f => f.severity === 'Low').length, color: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-50' }
            ].map(row => {
              const maxCount = Math.max(1, findings.length);
              const pct = Math.round((row.total / maxCount) * 100);

              return (
                <div key={row.label} className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{row.label} Severity</span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      {row.count} open / {row.total} total
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${row.color}`}
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Target Remediation SLA:</span>
            <span className="font-mono font-medium text-slate-700">
              Critical (7d) · High (14d) · Med (30d)
            </span>
          </div>
        </div>
      </div>

      {/* Framework Compliance Health Strip & Recent Audit Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Framework Breakdown */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Framework Compliance Posture
              </h2>
              <p className="text-xs text-slate-500">
                Calculated adherence per regulatory standard
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {frameworkScores.map(f => (
              <div key={f.framework} className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{f.framework}</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {f.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      f.score >= 90 ? 'bg-emerald-500' : f.score >= 80 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{f.auditCount} audit(s)</span>
                  <span>{f.findingCount} finding(s)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Action Queue: Findings Needing Attention */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Priority Compliance Findings & Remediation Queue
              </h2>
              <p className="text-xs text-slate-500">
                Items requiring immediate auditee or auditor intervention
              </p>
            </div>
            <button
              onClick={onOpenCreateFinding}
              className="text-xs text-slate-700 hover:text-slate-900 font-medium"
            >
              + Log Finding
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {findings.slice(0, 4).map(finding => {
              const isOverdue = finding.dueDate < todayStr && finding.status !== 'Closed';
              return (
                <div
                  key={finding.id}
                  onClick={() => onSelectFinding(finding.id)}
                  className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900">{finding.id}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        finding.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                        finding.severity === 'High' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {finding.severity}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 text-[11px]">{finding.framework}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {finding.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Owner: {finding.assignedOwnerName}</span>
                      <span>·</span>
                      <span className={isOverdue ? 'text-rose-600 font-semibold' : ''}>
                        Due: {finding.dueDate} {isOverdue ? '(Overdue)' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      finding.status === 'Verification Pending' ? 'bg-indigo-100 text-indigo-800' :
                      finding.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                      finding.status === 'Remediation Proposed' ? 'bg-sky-100 text-sky-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {finding.status}
                    </span>
                    <span className="block text-[10px] text-indigo-600 hover:underline mt-1 font-medium">
                      Inspect →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigateTab('emails')}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <span>View Dispatched Notification Emails</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => onNavigateTab('findings')}
              className="text-indigo-600 font-semibold hover:text-indigo-800"
            >
              View All {findings.length} Findings →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
