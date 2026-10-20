import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { Audit, ControlStatus, AuditControl } from '../types/audit';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  FileCheck, 
  Plus, 
  Filter,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { InherentRiskWorkingPaperModal } from './InherentRiskWorkingPaperModal';

interface AuditFieldworkModalProps {
  auditId: string;
  onClose: () => void;
  onLogFindingFromControl: (control: AuditControl) => void;
}

export const AuditFieldworkModal: React.FC<AuditFieldworkModalProps> = ({
  auditId,
  onClose,
  onLogFindingFromControl
}) => {
  const { audits, controls, updateControlStatus, currentUser, findings, departments } = useAudit();
  const audit = audits.find(a => a.id === auditId);
  const auditControls = controls.filter(c => c.auditId === auditId);
  const dept = departments.find(d => d.name === audit?.department || d.id === audit?.department);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingNotesControlId, setEditingNotesControlId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [showDeptWorkingPaper, setShowDeptWorkingPaper] = useState(false);

  if (!audit) return null;

  const categories = Array.from(new Set(auditControls.map(c => c.category)));

  const filteredControls = auditControls.filter(c => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    return true;
  });

  const passedCount = auditControls.filter(c => c.status === 'pass').length;
  const failedCount = auditControls.filter(c => c.status === 'fail').length;
  const partialCount = auditControls.filter(c => c.status === 'partial').length;
  const notTestedCount = auditControls.filter(c => c.status === 'not_tested').length;

  const canTest = currentUser.role === 'lead_auditor' || currentUser.role === 'field_auditor';

  const handleStartEditNotes = (ctrl: AuditControl) => {
    setEditingNotesControlId(ctrl.id);
    setTempNotes(ctrl.notes || '');
  };

  const handleSaveNotes = (controlId: string) => {
    const ctrl = auditControls.find(c => c.id === controlId);
    if (ctrl) {
      updateControlStatus(controlId, ctrl.status, tempNotes);
    }
    setEditingNotesControlId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Audit Fieldwork: Controls Testing & Checklist
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

        {/* Testing Summary Strip */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">Test Execution Summary:</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> {passedCount} Passed
            </span>
            <span className="text-rose-700 font-medium flex items-center gap-1 font-mono">
              <XCircle className="w-3.5 h-3.5" /> {failedCount} Failed
            </span>
            <span className="text-amber-700 font-medium flex items-center gap-1 font-mono">
              <AlertCircle className="w-3.5 h-3.5" /> {partialCount} Partial
            </span>
            <span className="text-slate-500 font-medium flex items-center gap-1 font-mono">
              <HelpCircle className="w-3.5 h-3.5" /> {notTestedCount} Untested
            </span>
          </div>

          <div className="flex items-center gap-3">
            {dept && (
              <button
                onClick={() => setShowDeptWorkingPaper(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-xs font-semibold transition-colors shadow-2xs"
                title="Open Department Inherent Risk Working Paper & Risk Control Matrix"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                <span>{dept.name} Inherent Risk ({dept.riskTier} Tier) &rarr;</span>
              </button>
            )}

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-md">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All ({auditControls.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

        {/* Controls Testing Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredControls.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No controls found for this category.
              </div>
            ) : (
              filteredControls.map((ctrl) => {
                const isEditing = editingNotesControlId === ctrl.id;
                const linkedFinding = ctrl.findingId ? findings.find(f => f.id === ctrl.findingId) : null;

                return (
                  <div
                    key={ctrl.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
                  >
                    {/* Control Row Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {ctrl.code}
                          </span>
                          <span className="text-slate-500 font-medium">{ctrl.category}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">
                          {ctrl.name}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {ctrl.requirement}
                        </p>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div className="flex items-center gap-1 shrink-0 pt-1">
                        {(['pass', 'fail', 'partial', 'not_tested'] as ControlStatus[]).map((st) => {
                          const isActive = ctrl.status === st;
                          return (
                            <button
                              key={st}
                              disabled={!canTest}
                              onClick={() => updateControlStatus(ctrl.id, st)}
                              className={`px-2.5 py-1 text-xs font-medium rounded capitalize transition-colors ${
                                isActive && st === 'pass' ? 'bg-emerald-600 text-white shadow-xs' :
                                isActive && st === 'fail' ? 'bg-rose-600 text-white shadow-xs' :
                                isActive && st === 'partial' ? 'bg-amber-600 text-white shadow-xs' :
                                isActive && st === 'not_tested' ? 'bg-slate-700 text-white' :
                                'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              } ${!canTest ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              {st.replace('_', ' ')}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fieldwork Testing Notes */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            placeholder="Document test procedure, sample IDs, and observations..."
                            className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingNotesControlId(null)}
                              className="px-2.5 py-1 text-slate-600 hover:text-slate-800 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNotes(ctrl.id)}
                              className="px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded"
                            >
                              Save Notes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-semibold text-slate-500 text-[11px] block">
                              Auditor Observation Notes:
                            </span>
                            <p className="text-slate-800 mt-0.5 italic">
                              {ctrl.notes || 'No testing notes recorded yet.'}
                            </p>
                            {ctrl.testedBy && (
                              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                                Tested by {ctrl.testedBy} on {ctrl.testedAt}
                              </span>
                            )}
                          </div>
                          {canTest && (
                            <button
                              onClick={() => handleStartEditNotes(ctrl)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0"
                            >
                              Edit Notes
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Failed Control Action: Link or Log Finding */}
                    {ctrl.status === 'fail' && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs">
                        {linkedFinding ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-rose-900">Linked Finding:</span>
                            <span className="font-mono font-bold text-rose-800">{linkedFinding.id}</span>
                            <span className="text-rose-700 truncate max-w-md">{linkedFinding.title}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-rose-900 font-medium">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>This control failed testing. Log a non-compliance finding to initiate CAPA.</span>
                          </div>
                        )}

                        {!linkedFinding && canTest && (
                          <button
                            onClick={() => onLogFindingFromControl(ctrl)}
                            className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Log Finding</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {canTest ? 'Auditor role active: All control test results saved immediately.' : 'Auditee/Viewer role: Read-only access.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
          >
            Close Fieldwork
          </button>
        </div>
      </div>

      {showDeptWorkingPaper && dept && (
        <InherentRiskWorkingPaperModal
          department={dept}
          onClose={() => setShowDeptWorkingPaper(false)}
        />
      )}
    </div>
  );
};
