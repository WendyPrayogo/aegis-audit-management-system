import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { Finding, FindingSeverity, FindingStatus } from '../types/audit';
import { 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  User, 
  FileCheck,
  ChevronRight
} from 'lucide-react';

interface FindingsViewProps {
  onSelectFinding: (findingId: string) => void;
  onOpenCreateFinding: () => void;
}

export const FindingsView: React.FC<FindingsViewProps> = ({
  onSelectFinding,
  onOpenCreateFinding
}) => {
  const { findings } = useAudit();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');

  const todayStr = '2026-03-18'; // fixed reference timeline

  const filteredFindings = findings.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.controlCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.assignedOwnerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = severityFilter === 'all' || f.severity === severityFilter;
    const matchesSt = statusFilter === 'all' || f.status === statusFilter;
    const matchesFw = frameworkFilter === 'all' || f.framework === frameworkFilter;

    return matchesSearch && matchesSev && matchesSt && matchesFw;
  });

  const criticalCount = findings.filter(f => f.severity === 'Critical' && f.status !== 'Closed').length;
  const highCount = findings.filter(f => f.severity === 'High' && f.status !== 'Closed').length;
  const pendingCount = findings.filter(f => f.status === 'Verification Pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">
              Compliance Findings & CAPA Remediation Hub
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
              {findings.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track root cause analyses, CAPA milestones, evidence uploads, and formal auditor verification sign-offs.
          </p>
        </div>

        <button
          onClick={onOpenCreateFinding}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Non-Compliance Finding</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search finding code, title, owner, clause..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto text-xs">
          {/* Severity */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-md">
            <span className="text-slate-500">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-md">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Remediation Proposed">Remediation Proposed</option>
              <option value="Verification Pending">Verification Pending</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Framework */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-md">
            <span className="text-slate-500">Framework:</span>
            <select
              value={frameworkFilter}
              onChange={(e) => setFrameworkFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Standards</option>
              <option value="ISO 27001">ISO 27001</option>
              <option value="SOC 2 Type II">SOC 2 Type II</option>
              <option value="HIPAA Security">HIPAA</option>
              <option value="SOX 404">SOX 404</option>
            </select>
          </div>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Finding ID</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Title & Framework Clause</th>
                <th className="py-3 px-4">Remediation Owner</th>
                <th className="py-3 px-4">SLA Due Date</th>
                <th className="py-3 px-4">CAPA Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No compliance findings match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFindings.map((f) => {
                  const isOverdue = f.dueDate < todayStr && f.status !== 'Closed';

                  return (
                    <tr
                      key={f.id}
                      onClick={() => onSelectFinding(f.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {f.id}
                        <span className="block text-[10px] font-normal text-slate-400 font-sans">
                          {f.auditId}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          f.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                          f.severity === 'High' ? 'bg-amber-100 text-amber-800' :
                          f.severity === 'Medium' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {f.severity}
                        </span>
                      </td>

                      {/* Title & Clause */}
                      <td className="py-3 px-4 max-w-md">
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {f.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono text-slate-600 font-medium">Control {f.controlCode}</span>
                          <span aria-hidden="true">·</span>
                          <span>{f.framework}</span>
                          <span aria-hidden="true">·</span>
                          <span>{f.department}</span>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono text-[9px] font-bold">
                            {f.assignedOwnerName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-medium text-slate-800 block truncate max-w-[120px]">
                              {f.assignedOwnerName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Due Date & SLA countdown */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] tabular-nums">
                        <span className={isOverdue ? 'text-rose-600 font-bold block' : 'text-slate-700 block'}>
                          {f.dueDate}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] text-rose-600 font-semibold font-sans">
                            SLA Overdue
                          </span>
                        )}
                        {!isOverdue && f.status !== 'Closed' && (
                          <span className="text-[10px] text-slate-400 font-sans">
                            In SLA Target
                          </span>
                        )}
                        {f.status === 'Closed' && (
                          <span className="text-[10px] text-emerald-600 font-sans">
                            Closed on time
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-medium px-2 py-0.5 rounded text-[11px] ${
                          f.status === 'Verification Pending' ? 'bg-indigo-100 text-indigo-800 font-semibold' :
                          f.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                          f.status === 'Remediation Proposed' ? 'bg-sky-100 text-sky-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {f.status}
                        </span>
                        {f.evidence.length > 0 && (
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            {f.evidence.length} artifact(s)
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 flex items-center justify-end gap-1">
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
