import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { FrameworkType, AuditWorkflowStage, ALL_WORKFLOW_STAGES } from '../types/audit';
import { X, Calendar, Layers, ShieldCheck } from 'lucide-react';

interface CreateAuditModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateAuditModal: React.FC<CreateAuditModalProps> = ({ onClose, onCreated }) => {
  const { createAudit, frameworks, departments } = useAudit();

  const [title, setTitle] = useState('');
  const [framework, setFramework] = useState<FrameworkType>(() => frameworks[0]?.code || 'ISO 27001');
  const [department, setDepartment] = useState(() => departments[0]?.name || 'Cloud Infrastructure');
  const [scope, setScope] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().substring(0, 10);
  });

  // Stage configuration toggle state (all enabled by default)
  const [enabledStages, setEnabledStages] = useState<Record<AuditWorkflowStage, boolean>>({
    'Planning': true,
    'Preparation': true,
    'Fieldwork': true,
    'Pre-Exit Meeting': true,
    'Exit Meeting': true,
    'Reporting': true
  });

  const toggleStage = (stage: AuditWorkflowStage) => {
    setEnabledStages(prev => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scope.trim()) return;

    // Disabled stages list
    const disabledStages = ALL_WORKFLOW_STAGES.filter(s => !enabledStages[s]);

    createAudit({
      title: title.trim(),
      framework,
      department,
      scope: scope.trim(),
      startDate,
      endDate
    }, disabledStages);

    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Schedule New Audit & Configure Workflow Stages
              </h2>
              <p className="text-xs text-slate-500">
                Define regulatory scope and configure which of the 6 workflow phases are enabled.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Audit Program Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q2 2026 ISO 27001 Surveillance Audit"
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
            />
          </div>

          {/* Framework & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard / Regulatory Framework *</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as FrameworkType)}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
              >
                {frameworks.length > 0 ? (
                  frameworks.map(fw => (
                    <option key={fw.id} value={fw.code}>
                      {fw.code} · {fw.name.length > 36 ? fw.name.substring(0, 34) + '...' : fw.name}
                    </option>
                  ))
                ) : (
                  <option value="ISO 27001">ISO 27001 Information Security</option>
                )}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department / Business Unit *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
              >
                {departments.length > 0 ? (
                  departments.map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.riskTier} Inherent Risk {d.inherentRiskScore ? `· ${d.inherentRiskScore.toFixed(1)}/25` : ''})
                    </option>
                  ))
                ) : (
                  <option value="Cloud Infrastructure">Cloud Infrastructure & DevOps</option>
                )}
              </select>
              {departments.find(d => d.name === department) && (
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Inherent Risk:{' '}
                    <strong className={
                      departments.find(d => d.name === department)?.riskTier === 'High'
                        ? 'text-rose-700'
                        : departments.find(d => d.name === department)?.riskTier === 'Medium'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }>
                      {departments.find(d => d.name === department)?.riskTier} Tier
                    </strong>
                  </span>
                  <span className="text-indigo-600 font-medium">
                    Calculated via Department RCM Working Paper
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Audit Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Audit Target End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Audit Scope & Boundary *</label>
            <textarea
              rows={2}
              required
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="List specific systems, VPCs, repositories, and processes included in this audit..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
            />
          </div>

          {/* Workflow Configuration Checkboxes */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">
                  Planning Stage Configuration: Enable / Disable Workflows
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select which stages will appear in this audit's Kanban board.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {ALL_WORKFLOW_STAGES.map((stg) => {
                const isChecked = enabledStages[stg];
                return (
                  <label
                    key={stg}
                    className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                      isChecked ? 'bg-white border-slate-300 shadow-2xs' : 'bg-slate-100/80 border-dashed border-slate-200 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStage(stg)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0"
                    />
                    <span className={`text-xs font-medium truncate ${isChecked ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                      {stg}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-xs"
            >
              Initialize Audit Program
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
