import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { FindingSeverity, FrameworkType } from '../types/audit';
import { X, Plus, AlertCircle, ShieldAlert } from 'lucide-react';

interface CreateFindingModalProps {
  initialAuditId?: string;
  initialControlCode?: string;
  onClose: () => void;
  onCreated: (findingId: string) => void;
}

export const CreateFindingModal: React.FC<CreateFindingModalProps> = ({
  initialAuditId,
  initialControlCode,
  onClose,
  onCreated
}) => {
  const { audits, users, createFinding } = useAudit();

  const [auditId, setAuditId] = useState(initialAuditId || audits[0]?.id || '');
  const [controlCode, setControlCode] = useState(initialControlCode || 'A.9.4.2');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<FindingSeverity>('High');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().substring(0, 10);
  });
  const [assignedOwnerId, setAssignedOwnerId] = useState('user-remediation-owner');

  const selectedAudit = audits.find(a => a.id === auditId);
  const selectedOwner = users.find(u => u.id === assignedOwnerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const findingId = createFinding({
      auditId,
      auditTitle: selectedAudit?.title || 'Audit',
      controlCode,
      title: title.trim(),
      description: description.trim(),
      severity,
      framework: selectedAudit?.framework || 'ISO 27001',
      department: selectedAudit?.department || 'Cloud Infrastructure',
      dueDate,
      assignedOwnerId,
      assignedOwnerName: selectedOwner?.name || 'Dev Patel',
      assignedOwnerEmail: selectedOwner?.email || 'd.patel@aegisaudit.internal'
    });

    onCreated(findingId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Log Non-Compliance Finding
              </h2>
              <p className="text-xs text-slate-500">
                Document compliance defect, assign remediation owner, and trigger automated CAPA alert.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Associated Audit & Control Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Audit Program *</label>
              <select
                value={auditId}
                onChange={(e) => setAuditId(e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
              >
                {audits.map(a => (
                  <option key={a.id} value={a.id}>{a.id} - {a.title.substring(0, 36)}...</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clause / Control Code *</label>
              <input
                type="text"
                required
                value={controlCode}
                onChange={(e) => setControlCode(e.target.value)}
                placeholder="e.g. A.9.4.2 or CC6.1"
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Finding Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Root SSH Access Enabled Without Hardware Token MFA"
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Observation & Sample Evidence *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Document the exact non-compliance condition, affected infrastructure assets, and sampling observations..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
            />
          </div>

          {/* Severity & SLA Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity Rating *</label>
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {(['Critical', 'High', 'Medium', 'Low'] as FindingSeverity[]).map(sev => {
                  const isSelected = severity === sev;
                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-1.5 px-2 rounded text-xs font-semibold border transition-colors ${
                        isSelected && sev === 'Critical' ? 'bg-rose-600 text-white border-rose-600' :
                        isSelected && sev === 'High' ? 'bg-amber-600 text-white border-amber-600' :
                        isSelected && sev === 'Medium' ? 'bg-indigo-600 text-white border-indigo-600' :
                        isSelected && sev === 'Low' ? 'bg-slate-700 text-white border-slate-700' :
                        'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Remediation SLA Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Remediation Owner */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Remediation Owner *</label>
            <select
              value={assignedOwnerId}
              onChange={(e) => setAssignedOwnerId(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.title} ({u.department})
                </option>
              ))}
            </select>
          </div>

          {/* Notice */}
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-[11px] text-indigo-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Creating this finding will automatically send a high-priority email notification to the assigned owner with CAPA instructions.
            </span>
          </div>

          {/* Footer actions inside form */}
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
              Log & Dispatch Finding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
