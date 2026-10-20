import React from 'react';
import { useAudit } from '../context/AuditContext';
import { X, ShieldCheck, Check, Minus, UserCheck } from 'lucide-react';

interface RbacMatrixModalProps {
  onClose: () => void;
}

export const RbacMatrixModal: React.FC<RbacMatrixModalProps> = ({ onClose }) => {
  const { users, currentUser, setCurrentUser } = useAudit();

  const permissions = [
    { feature: 'Create & Schedule Audits', lead: true, field: false, owner: false, exec: false },
    { feature: 'Configure 6-Stage Workflow (Enable/Disable)', lead: true, field: true, owner: false, exec: false },
    { feature: 'Execute Fieldwork Control Tests', lead: true, field: true, owner: false, exec: false },
    { feature: 'Log Non-Compliance Findings', lead: true, field: true, owner: false, exec: false },
    { feature: 'Submit CAPA & Upload Remediation Evidence', lead: true, field: true, owner: true, exec: false },
    { feature: 'Approve Verification Sign-off & Close Findings', lead: true, field: true, owner: false, exec: false },
    { feature: 'Publish & Export Final Audit Reports', lead: true, field: false, owner: false, exec: true },
    { feature: 'Configure Email Notification Trigger Rules', lead: true, field: false, owner: false, exec: false },
    { feature: 'View Executive Dashboard & Analytics', lead: true, field: true, owner: true, exec: true }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Role-Based Access Control (RBAC) Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Enterprise segregation of duties between auditors, remediation auditees, and executive governance.
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

        {/* Persona Switcher Quick Cards */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            Select Active Persona for Testing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {users.map(u => {
              const isSelected = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setCurrentUser(u)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isSelected 
                      ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center">
                      {u.initials}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-2 truncate">{u.name}</p>
                  <p className="text-[11px] text-slate-500 truncate font-medium">{u.roleLabel.split('&')[0]}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">System Capability</th>
                  <th className="py-2.5 px-3 text-center">Lead Auditor</th>
                  <th className="py-2.5 px-3 text-center">Field Auditor</th>
                  <th className="py-2.5 px-3 text-center">Auditee Owner</th>
                  <th className="py-2.5 px-3 text-center">Executive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissions.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{p.feature}</td>
                    <td className="py-2.5 px-3 text-center">
                      {p.lead ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <Minus className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.field ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <Minus className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.owner ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <Minus className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.exec ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <Minus className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Currently active: <strong>{currentUser.name}</strong> ({currentUser.roleLabel})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
