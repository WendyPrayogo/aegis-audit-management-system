import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { 
  Audit, 
  AuditWorkflowStage, 
  ALL_WORKFLOW_STAGES, 
  Finding 
} from '../types/audit';
import { StageConfigModal } from './StageConfigModal';
import { 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  FileCheck, 
  Layers, 
  Plus, 
  Users, 
  FileText,
  ChevronRight,
  Filter,
  GripVertical
} from 'lucide-react';

interface WorkflowKanbanViewProps {
  onOpenCreateAudit: () => void;
  onOpenAuditFieldwork: (auditId: string) => void;
  onOpenReports: () => void;
  onSelectFinding: (findingId: string) => void;
}

export const WorkflowKanbanView: React.FC<WorkflowKanbanViewProps> = ({
  onOpenCreateAudit,
  onOpenAuditFieldwork,
  onOpenReports,
  onSelectFinding
}) => {
  const { audits, updateAuditStage, findings, currentUser, toggleChecklistItem, frameworks } = useAudit();
  const [selectedAuditId, setSelectedAuditId] = useState<string>('all');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [configuringAudit, setConfiguringAudit] = useState<Audit | null>(null);
  const [expandedChecklistAuditId, setExpandedChecklistAuditId] = useState<string | null>(null);

  // Drag and Drop States
  const [draggingAuditId, setDraggingAuditId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<AuditWorkflowStage | null>(null);
  const [dragAlert, setDragAlert] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Filter audits
  const filteredAudits = audits.filter(a => {
    if (selectedAuditId !== 'all' && a.id !== selectedAuditId) return false;
    if (selectedFramework !== 'all' && a.framework !== selectedFramework) return false;
    return true;
  });

  // Helper to find the next enabled stage
  const getNextEnabledStage = (audit: Audit): AuditWorkflowStage | null => {
    const currentIdx = ALL_WORKFLOW_STAGES.indexOf(audit.currentStage);
    for (let i = currentIdx + 1; i < ALL_WORKFLOW_STAGES.length; i++) {
      const candidateStage = ALL_WORKFLOW_STAGES[i];
      if (audit.stageConfigs[candidateStage]?.enabled) {
        return candidateStage;
      }
    }
    return null;
  };

  const getStageIcon = (stage: AuditWorkflowStage) => {
    switch (stage) {
      case 'Planning': return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'Preparation': return <FileCheck className="w-4 h-4 text-sky-500" />;
      case 'Fieldwork': return <CheckCircle2 className="w-4 h-4 text-amber-500" />;
      case 'Pre-Exit Meeting': return <Users className="w-4 h-4 text-purple-500" />;
      case 'Exit Meeting': return <Users className="w-4 h-4 text-emerald-500" />;
      case 'Reporting': return <FileText className="w-4 h-4 text-rose-500" />;
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, auditId: string) => {
    e.dataTransfer.setData('text/plain', auditId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingAuditId(auditId);
  };

  const handleDragEnd = () => {
    setDraggingAuditId(null);
    setDragOverStage(null);
  };

  const handleDragOverColumn = (e: React.DragEvent, stage: AuditWorkflowStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeaveColumn = (e: React.DragEvent, stage: AuditWorkflowStage) => {
    // Only clear if actually leaving the column element
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverStage === stage) {
      setDragOverStage(null);
    }
  };

  const handleDropOnStage = (e: React.DragEvent, targetStage: AuditWorkflowStage) => {
    e.preventDefault();
    const auditId = e.dataTransfer.getData('text/plain') || draggingAuditId;
    setDraggingAuditId(null);
    setDragOverStage(null);

    if (!auditId) return;

    const audit = audits.find(a => a.id === auditId);
    if (!audit) return;

    if (audit.currentStage === targetStage) return;

    // Check if target stage is enabled based on planning configuration
    const isStageEnabled = audit.stageConfigs[targetStage]?.enabled;
    if (!isStageEnabled) {
      setDragAlert({
        type: 'error',
        message: `Cannot move "${audit.title}" to ${targetStage}: This stage was disabled during planning configuration. Open "Configure" to enable it first.`
      });
      setTimeout(() => setDragAlert(null), 5000);
      return;
    }

    // Move audit to target stage
    updateAuditStage(audit.id, targetStage);
    setDragAlert({
      type: 'success',
      message: `"${audit.title}" successfully moved to ${targetStage} stage and notifications dispatched.`
    });
    setTimeout(() => setDragAlert(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">
                End-to-End Audit Process Workflow
              </h1>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                Drag & Drop Kanban
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Drag audit cards between workflow columns or use action buttons. Stages are enabled/disabled per audit based on planning configuration.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Audit Selector Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Audit:</span>
              <select
                value={selectedAuditId}
                onChange={(e) => setSelectedAuditId(e.target.value)}
                className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
              >
                <option value="all">All Audits ({audits.length})</option>
                {audits.map(a => (
                  <option key={a.id} value={a.id}>{a.id} - {a.title.substring(0, 32)}...</option>
                ))}
              </select>
            </div>

            {/* Framework Filter */}
            <div className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-lg">
              <span>Framework:</span>
              <select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="bg-transparent font-medium text-slate-900 outline-none ml-1 cursor-pointer"
              >
                <option value="all">All</option>
                {frameworks.map(fw => (
                  <option key={fw.id} value={fw.code}>{fw.code}</option>
                ))}
              </select>
            </div>

            {/* Schedule New Audit CTA */}
            <button
              onClick={onOpenCreateAudit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drag & Drop Feedback Alert Banner */}
      {dragAlert && (
        <div className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
          dragAlert.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {dragAlert.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{dragAlert.message}</span>
          </div>
          <button 
            onClick={() => setDragAlert(null)}
            className="font-bold ml-2 hover:opacity-75"
          >
            ×
          </button>
        </div>
      )}

      {/* Kanban Board Container */}
      <div className="overflow-x-auto pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 min-w-[1240px]">
          {ALL_WORKFLOW_STAGES.map((stage) => {
            // Find audits currently active in this stage
            const auditsInStage = filteredAudits.filter(a => a.currentStage === stage);
            const isColumnDropTarget = dragOverStage === stage;

            return (
              <div 
                key={stage}
                onDragOver={(e) => handleDragOverColumn(e, stage)}
                onDragLeave={(e) => handleDragLeaveColumn(e, stage)}
                onDrop={(e) => handleDropOnStage(e, stage)}
                className={`rounded-xl flex flex-col min-h-[640px] max-h-[85vh] transition-all border ${
                  isColumnDropTarget 
                    ? 'border-indigo-400 bg-indigo-50/70 ring-2 ring-indigo-400/50 shadow-md' 
                    : 'bg-slate-100/70 border-slate-200/90'
                }`}
              >
                {/* Column Header */}
                <div className={`p-3 border-b rounded-t-xl sticky top-0 z-10 transition-colors ${
                  isColumnDropTarget ? 'bg-indigo-100/80 border-indigo-200' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStageIcon(stage)}
                      <h2 className="text-xs font-bold text-slate-900 truncate">
                        {stage}
                      </h2>
                    </div>
                    <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded tabular-nums">
                      {auditsInStage.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    {stage === 'Planning' && 'Charter & Stage config'}
                    {stage === 'Preparation' && 'IRL & sample selection'}
                    {stage === 'Fieldwork' && 'Control testing & findings'}
                    {stage === 'Pre-Exit Meeting' && 'Draft finding review'}
                    {stage === 'Exit Meeting' && 'Executive readout & CAPA'}
                    {stage === 'Reporting' && 'Final report publication'}
                  </div>

                  {/* Drop Indicator hint */}
                  {isColumnDropTarget && (
                    <div className="mt-1.5 py-1 px-2 bg-indigo-600 text-white text-[10px] font-bold rounded text-center animate-pulse">
                      Drop here to advance to {stage}
                    </div>
                  )}
                </div>

                {/* Cards Container */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {auditsInStage.length === 0 ? (
                    <div className={`h-32 flex flex-col items-center justify-center text-center p-3 rounded-lg border border-dashed transition-colors ${
                      isColumnDropTarget 
                        ? 'border-indigo-400 bg-indigo-100/40 text-indigo-700' 
                        : 'border-slate-200 text-slate-400'
                    }`}>
                      <p className="text-xs font-medium">
                        {isColumnDropTarget ? `Drop card here` : `No active audits`}
                      </p>
                      <span className="text-[10px] opacity-75 mt-0.5">
                        {isColumnDropTarget ? 'Release to advance phase' : 'Drag card to this column'}
                      </span>
                    </div>
                  ) : (
                    auditsInStage.map(audit => {
                      const stageConfig = audit.stageConfigs[stage];
                      const nextStage = getNextEnabledStage(audit);
                      const isChecklistExpanded = expandedChecklistAuditId === `${audit.id}-${stage}`;
                      
                      const auditFindings = findings.filter(f => f.auditId === audit.id);
                      const criticalCount = auditFindings.filter(f => f.severity === 'Critical' && f.status !== 'Closed').length;
                      const highCount = auditFindings.filter(f => f.severity === 'High' && f.status !== 'Closed').length;
                      const openCount = auditFindings.filter(f => f.status !== 'Closed').length;

                      const completedTasks = stageConfig?.checklist.filter(c => c.done).length || 0;
                      const totalTasks = stageConfig?.checklist.length || 0;
                      const taskProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

                      const hasPreExit = audit.stageConfigs['Pre-Exit Meeting']?.enabled;
                      const hasExit = audit.stageConfigs['Exit Meeting']?.enabled;

                      const isBeingDragged = draggingAuditId === audit.id;

                      return (
                        <div
                          key={audit.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, audit.id)}
                          onDragEnd={handleDragEnd}
                          className={`bg-white border rounded-lg p-3.5 shadow-xs hover:shadow-sm transition-all text-left space-y-3 cursor-grab active:cursor-grabbing group ${
                            isBeingDragged 
                              ? 'opacity-40 border-dashed border-indigo-400 scale-[0.98]' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Card Header & Drag Handle */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                              <div className="flex items-center gap-1.5">
                                <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                                <span className="font-mono font-semibold text-slate-700">{audit.id}</span>
                              </div>
                              <span className="text-slate-400 font-medium">{audit.framework}</span>
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 leading-snug">
                              {audit.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                              <span>{audit.department}</span>
                              <span aria-hidden="true">·</span>
                              <span>Lead: {audit.leadAuditorName.split(' ')[0]}</span>
                            </div>
                          </div>

                          {/* Planning Stage Configuration Marker */}
                          {(!hasPreExit || !hasExit) && (
                            <div className="text-[10px] bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-100 flex items-center justify-between">
                              <span>Config: {!hasPreExit ? 'Pre-Exit Skipped' : 'Exit Skipped'}</span>
                              <button
                                onClick={() => setConfiguringAudit(audit)}
                                className="font-medium underline hover:text-amber-950"
                              >
                                Edit
                              </button>
                            </div>
                          )}

                          {/* Stage Checklist & Progress */}
                          <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 text-xs space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-medium text-slate-600">Tasks Checklist</span>
                              <span className="font-mono text-slate-500 tabular-nums">
                                {completedTasks}/{totalTasks} ({taskProgressPct}%)
                              </span>
                            </div>

                            {/* Mini progress bar */}
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-slate-900 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${taskProgressPct}%` }}
                              />
                            </div>

                            {/* Collapsible checklist items */}
                            <button
                              onClick={() => setExpandedChecklistAuditId(isChecklistExpanded ? null : `${audit.id}-${stage}`)}
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium pt-0.5"
                            >
                              <span>{isChecklistExpanded ? 'Hide tasks' : 'View & check tasks'}</span>
                              <ChevronRight className={`w-3 h-3 transition-transform ${isChecklistExpanded ? 'rotate-90' : ''}`} />
                            </button>

                            {isChecklistExpanded && (
                              <div className="pt-2 border-t border-slate-200/60 space-y-1.5 max-h-40 overflow-y-auto">
                                {stageConfig?.checklist.map(item => (
                                  <label
                                    key={item.id}
                                    className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-700 hover:text-slate-900"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={item.done}
                                      onChange={() => toggleChecklistItem(audit.id, stage, item.id)}
                                      className="rounded border-slate-300 text-slate-900 focus:ring-0 mt-0.5 shrink-0"
                                    />
                                    <span className={item.done ? 'line-through text-slate-400' : ''}>
                                      {item.text}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Findings & Compliance Stats */}
                          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                            <span className="font-medium">
                              {openCount} Open Finding{openCount !== 1 ? 's' : ''}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              {criticalCount > 0 && (
                                <span className="text-rose-700 bg-rose-50 px-1 rounded font-semibold">
                                  {criticalCount} Crit
                                </span>
                              )}
                              {highCount > 0 && (
                                <span className="text-amber-700 bg-amber-50 px-1 rounded font-semibold">
                                  {highCount} High
                                </span>
                              )}
                              {criticalCount === 0 && highCount === 0 && (
                                <span className="text-slate-400">0 Critical</span>
                              )}
                            </div>
                          </div>

                          {/* Quick Stage Actions */}
                          <div className="pt-2 border-t border-slate-100 space-y-1.5">
                            {/* Advance to next enabled stage */}
                            {nextStage ? (
                              <button
                                onClick={() => updateAuditStage(audit.id, nextStage)}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md transition-colors"
                              >
                                <span>Advance to {nextStage}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <div className="text-center py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded">
                                ✓ Final Stage Reached
                              </div>
                            )}

                            {/* Secondary Action: Stage Specific */}
                            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                              <button
                                onClick={() => setConfiguringAudit(audit)}
                                className="p-1.5 border border-slate-200 rounded text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
                                title="Configure which of the 6 stages are enabled for this audit"
                              >
                                <Sliders className="w-3 h-3 text-slate-500" />
                                <span>Configure</span>
                              </button>

                              {stage === 'Fieldwork' && (
                                <button
                                  onClick={() => onOpenAuditFieldwork(audit.id)}
                                  className="p-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded hover:bg-indigo-100 flex items-center justify-center gap-1 font-medium"
                                >
                                  <FileCheck className="w-3 h-3" />
                                  <span>Test Controls</span>
                                </button>
                              )}

                              {stage === 'Reporting' && (
                                <button
                                  onClick={onOpenReports}
                                  className="p-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded hover:bg-indigo-100 flex items-center justify-center gap-1 font-medium"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Final Report</span>
                                </button>
                              )}

                              {(stage === 'Pre-Exit Meeting' || stage === 'Exit Meeting') && (
                                <button
                                  onClick={() => setConfiguringAudit(audit)}
                                  className="p-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded hover:bg-purple-100 flex items-center justify-center gap-1 font-medium"
                                >
                                  <Users className="w-3 h-3" />
                                  <span>Minutes</span>
                                </button>
                              )}

                              {stage !== 'Fieldwork' && stage !== 'Reporting' && stage !== 'Pre-Exit Meeting' && stage !== 'Exit Meeting' && (
                                <button
                                  onClick={() => setConfiguringAudit(audit)}
                                  className="p-1.5 border border-slate-200 rounded text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
                                >
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>Details</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
