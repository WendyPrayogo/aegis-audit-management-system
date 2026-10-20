import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { 
  Audit, 
  AuditWorkflowStage, 
  ALL_WORKFLOW_STAGES 
} from '../types/audit';
import { 
  X, 
  Sliders, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  FileText, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';

interface StageConfigModalProps {
  audit: Audit;
  onClose: () => void;
}

export const StageConfigModal: React.FC<StageConfigModalProps> = ({ audit, onClose }) => {
  const { toggleStageEnabled, updateAuditStageConfig, toggleChecklistItem, currentUser } = useAudit();
  const [selectedStage, setSelectedStage] = useState<AuditWorkflowStage>(audit.currentStage);
  const [newChecklistText, setNewChecklistText] = useState('');

  const currentConfig = audit.stageConfigs[selectedStage];

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: `task-${Date.now()}`,
      text: newChecklistText.trim(),
      done: false
    };
    updateAuditStageConfig(audit.id, selectedStage, {
      checklist: [...currentConfig.checklist, newItem]
    });
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    updateAuditStageConfig(audit.id, selectedStage, {
      checklist: currentConfig.checklist.filter(c => c.id !== itemId)
    });
  };

  const handleTargetDateChange = (date: string) => {
    updateAuditStageConfig(audit.id, selectedStage, { targetDate: date });
  };

  const handleNotesChange = (notes: string) => {
    updateAuditStageConfig(audit.id, selectedStage, { notes });
  };

  const handleMeetingMinutesChange = (minutes: string) => {
    updateAuditStageConfig(audit.id, selectedStage, { meetingMinutes: minutes });
  };

  const canEdit = currentUser.role === 'lead_auditor' || currentUser.role === 'field_auditor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Audit Planning & Workflow Configuration
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {audit.id} · {audit.title} ({audit.framework})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Guidance */}
        <div className="px-6 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-900 leading-relaxed">
            In compliance governance, audit workflows can be customized during the <strong>Planning</strong> phase. Enable or disable stages (e.g. Pre-Exit or Exit Meeting) to tailor the process for rapid internal assessments vs. comprehensive regulatory certifications.
          </p>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Stage Selector & Toggle Switches */}
          <div className="md:col-span-5 border-r border-slate-100 pr-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Workflow Stages (Toggle to Enable/Disable)
            </h3>
            {ALL_WORKFLOW_STAGES.map((stage, idx) => {
              const config = audit.stageConfigs[stage];
              const isSelected = selectedStage === stage;
              const isCurrent = audit.currentStage === stage;

              return (
                <div
                  key={stage}
                  className={`p-3 rounded-lg border transition-all text-left flex items-center justify-between ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <button
                    onClick={() => setSelectedStage(stage)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                  >
                    <span className="text-xs font-mono font-semibold text-slate-400 w-4">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold truncate ${
                          config.enabled ? 'text-slate-900' : 'text-slate-400 line-through'
                        }`}>
                          {stage}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {config.enabled ? `${config.checklist.filter(c => c.done).length}/${config.checklist.length} tasks` : 'Stage Disabled'}
                      </span>
                    </div>
                  </button>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      disabled={!canEdit}
                      onChange={() => toggleStageEnabled(audit.id, stage)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                  </label>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Stage Details & Checklist */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{selectedStage} Configuration</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                    currentConfig.enabled 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {currentConfig.enabled ? 'Enabled in Workflow' : 'Disabled / Skipped'}
                  </span>
                </h3>
              </div>
            </div>

            {/* Target Date & Stage Status */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Target Date
                </label>
                <input
                  type="date"
                  value={currentConfig.targetDate || ''}
                  disabled={!canEdit}
                  onChange={(e) => handleTargetDateChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs font-mono focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Stage Progress Status
                </label>
                <div className="px-2.5 py-1.5 border border-slate-200 bg-slate-50 rounded-md text-xs font-medium text-slate-700 capitalize">
                  {currentConfig.status.replace('_', ' ')}
                  {currentConfig.completedAt && (
                    <span className="text-[10px] text-slate-400 font-mono ml-1 tabular-nums">
                      ({currentConfig.completedAt.substring(0, 10)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stage Notes / Agendas */}
            <div>
              <label className="block text-xs text-slate-600 font-medium mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Stage Objectives & Guidance
              </label>
              <textarea
                rows={2}
                value={currentConfig.notes || ''}
                disabled={!canEdit}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Specific guidance for auditors and process owners..."
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
              />
            </div>

            {/* Special Meeting Minutes for Pre-Exit & Exit Meeting */}
            {(selectedStage === 'Pre-Exit Meeting' || selectedStage === 'Exit Meeting') && (
              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">
                  Conference & Meeting Minutes
                </label>
                <textarea
                  rows={2}
                  value={currentConfig.meetingMinutes || ''}
                  disabled={!canEdit}
                  onChange={(e) => handleMeetingMinutesChange(e.target.value)}
                  placeholder="Record attendees, key discussion points, and agreed remediation milestones..."
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none font-mono"
                />
              </div>
            )}

            {/* Stage Checklist Tasks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">
                  Required Milestone Checklist
                </label>
                <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                  {currentConfig.checklist.filter(c => c.done).length} / {currentConfig.checklist.length} Completed
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {currentConfig.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded border border-slate-100 hover:border-slate-200 bg-slate-50/50 text-xs"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 mr-2">
                      <input
                        type="checkbox"
                        checked={item.done}
                        disabled={!canEdit}
                        onChange={() => toggleChecklistItem(audit.id, selectedStage, item.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                      <span className={`truncate ${item.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {item.text}
                      </span>
                    </label>
                    {canEdit && (
                      <button
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                        title="Remove task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Checklist Item Input */}
              {canEdit && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                    placeholder="Add stage task..."
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                  <button
                    onClick={handleAddChecklistItem}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Changes apply in real-time to the Workflow Kanban board.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
