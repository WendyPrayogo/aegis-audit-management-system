import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { Audit, AuditWorkflowStage, ALL_WORKFLOW_STAGES } from '../types/audit';
import { StageConfigModal } from './StageConfigModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Sliders, 
  FileCheck, 
  Layers, 
  Calendar, 
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface AuditsViewProps {
  onOpenCreateAudit: () => void;
  onOpenFieldwork: (auditId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const AuditsView: React.FC<AuditsViewProps> = ({
  onOpenCreateAudit,
  onOpenFieldwork,
  onNavigateTab
}) => {
  const { audits, findings, controls, currentUser, frameworks } = useAudit();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [configuringAudit, setConfiguringAudit] = useState<Audit | null>(null);

  const filteredAudits = audits.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFw = selectedFramework === 'all' || a.framework === selectedFramework;
    return matchesSearch && matchesFw;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">
            Audit Management & Fieldwork Programs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise audits spanning ISO 27001, SOC 2, HIPAA, SOX, and OSHA frameworks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('kanban')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Workflow Kanban</span>
          </button>
          <button
            onClick={onOpenCreateAudit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Audit</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audits, framework, department..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-md flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Framework:</span>
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Standards ({audits.length})</option>
              {frameworks.map(fw => (
                <option key={fw.id} value={fw.code}>{fw.code}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audits List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAudits.map(audit => {
          const auditFindings = findings.filter(f => f.auditId === audit.id);
          const criticalCount = auditFindings.filter(f => f.severity === 'Critical' && f.status !== 'Closed').length;
          const auditControls = controls.filter(c => c.auditId === audit.id);
          const failedControls = auditControls.filter(c => c.status === 'fail').length;

          // Check disabled stages
          const disabledStages = ALL_WORKFLOW_STAGES.filter(s => !audit.stageConfigs[s]?.enabled);

          return (
            <div
              key={audit.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Top Row: Title, Framework, Current Stage */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded">
                      {audit.id}
                    </span>
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {audit.framework}
                    </span>
                    <span className="text-xs text-slate-500">
                      {audit.department}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {audit.startDate} → {audit.endDate}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">
                    {audit.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Current Milestone:</span>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded inline-block">
                      {audit.currentStage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scope Description */}
              <p className="text-xs text-slate-600 line-clamp-2">
                <strong>Scope:</strong> {audit.scope}
              </p>

              {/* 6-Stage Workflow Visual Strip */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    6-Stage Workflow Progress
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    {disabledStages.length > 0 && (
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                        {disabledStages.length} Stage(s) Disabled in Planning
                      </span>
                    )}
                    <span className="text-slate-600 font-bold tabular-nums">
                      {audit.progress}% Overall
                    </span>
                  </div>
                </div>

                {/* Stages Breadcrumb Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 pt-1">
                  {ALL_WORKFLOW_STAGES.map((stg) => {
                    const cfg = audit.stageConfigs[stg];
                    const isCurrent = audit.currentStage === stg;
                    const isCompleted = cfg?.status === 'completed';
                    const isEnabled = cfg?.enabled;

                    return (
                      <div
                        key={stg}
                        className={`p-1.5 rounded text-[11px] text-center border font-medium truncate ${
                          !isEnabled 
                            ? 'bg-slate-100 text-slate-400 line-through border-dashed border-slate-200' 
                            : isCurrent 
                            ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs' 
                            : isCompleted 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                        title={`${stg}: ${!isEnabled ? 'Disabled' : isCompleted ? 'Completed' : isCurrent ? 'Active' : 'Pending'}`}
                      >
                        {stg}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Meta & Actions Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-4 text-slate-600 font-mono">
                  <span>Lead: <strong>{audit.leadAuditorName}</strong></span>
                  <span>·</span>
                  <span>{auditControls.length} Controls ({failedControls} Failed)</span>
                  <span>·</span>
                  <span>{auditFindings.length} Findings ({criticalCount} Crit)</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Planning Configuration Modal Trigger */}
                  <button
                    onClick={() => setConfiguringAudit(audit)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium transition-colors"
                  >
                    <Sliders className="w-3 h-3 text-slate-500" />
                    <span>Configure Stages</span>
                  </button>

                  {/* Test Controls Modal Trigger */}
                  <button
                    onClick={() => onOpenFieldwork(audit.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Test Fieldwork Controls</span>
                  </button>

                  {/* View in Kanban Trigger */}
                  <button
                    onClick={() => onNavigateTab('kanban')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors"
                  >
                    <span>View Kanban</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Configuration Modal */}
      {configuringAudit && (
        <StageConfigModal
          audit={configuringAudit}
          onClose={() => setConfiguringAudit(null)}
        />
      )}
    </div>
  );
};
