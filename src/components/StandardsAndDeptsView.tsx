import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { 
  FrameworkDefinition, 
  DepartmentDefinition 
} from '../types/audit';
import { 
  ShieldCheck, 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  ExternalLink, 
  X, 
  Users, 
  FileText,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Globe,
  FileSpreadsheet,
  Calculator
} from 'lucide-react';
import { InherentRiskWorkingPaperModal } from './InherentRiskWorkingPaperModal';

interface StandardsAndDeptsViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const StandardsAndDeptsView: React.FC<StandardsAndDeptsViewProps> = ({ onNavigateTab }) => {
  const { 
    frameworks, 
    departments, 
    rcmItems,
    audits, 
    findings, 
    currentUser,
    addFramework,
    editFramework,
    removeFramework,
    addDepartment,
    editDepartment,
    removeDepartment
  } = useAudit();

  const [activeSubTab, setActiveSubTab] = useState<'frameworks' | 'departments'>('frameworks');
  
  // Search & filter states for Frameworks
  const [fwSearch, setFwSearch] = useState('');
  const [fwStatusFilter, setFwStatusFilter] = useState<string>('all');
  const [fwCadenceFilter, setFwCadenceFilter] = useState<string>('all');

  // Search & filter states for Departments
  const [deptSearch, setDeptSearch] = useState('');
  const [deptRiskFilter, setDeptRiskFilter] = useState<string>('all');
  const [deptStatusFilter, setDeptStatusFilter] = useState<string>('all');

  // Modals state
  const [editingFramework, setEditingFramework] = useState<FrameworkDefinition | null>(null);
  const [isAddingFramework, setIsAddingFramework] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentDefinition | null>(null);
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [selectedDeptForWorkingPaper, setSelectedDeptForWorkingPaper] = useState<DepartmentDefinition | null>(null);

  // Alert banner
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Framework form state
  const [fwCode, setFwCode] = useState('');
  const [fwName, setFwName] = useState('');
  const [fwGov, setFwGov] = useState('');
  const [fwVersion, setFwVersion] = useState('');
  const [fwCadence, setFwCadence] = useState<'Annual' | 'Semi-annual' | 'Quarterly' | 'Continuous'>('Annual');
  const [fwDescription, setFwDescription] = useState('');
  const [fwStatus, setFwStatus] = useState<'active' | 'in_revision' | 'retired'>('active');

  // Department form state
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptHeadName, setDeptHeadName] = useState('');
  const [deptHeadEmail, setDeptHeadEmail] = useState('');
  const [deptRisk, setDeptRisk] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [deptDescription, setDeptDescription] = useState('');
  const [deptStatus, setDeptStatus] = useState<'active' | 'restructuring' | 'inactive'>('active');
  const [deptEmployeeCount, setDeptEmployeeCount] = useState<number>(20);

  // Helpers to reset forms
  const openAddFrameworkModal = () => {
    setFwCode('');
    setFwName('');
    setFwGov('');
    setFwVersion('1.0');
    setFwCadence('Annual');
    setFwDescription('');
    setFwStatus('active');
    setIsAddingFramework(true);
  };

  const openEditFrameworkModal = (fw: FrameworkDefinition) => {
    setEditingFramework(fw);
    setFwCode(fw.code);
    setFwName(fw.name);
    setFwGov(fw.governingBody);
    setFwVersion(fw.version);
    setFwCadence(fw.cadence);
    setFwDescription(fw.description);
    setFwStatus(fw.status);
  };

  const openAddDepartmentModal = () => {
    setDeptCode('');
    setDeptName('');
    setDeptHeadName('');
    setDeptHeadEmail('');
    setDeptRisk('Medium');
    setDeptDescription('');
    setDeptStatus('active');
    setDeptEmployeeCount(20);
    setIsAddingDepartment(true);
  };

  const openEditDepartmentModal = (dept: DepartmentDefinition) => {
    setEditingDepartment(dept);
    setDeptCode(dept.code);
    setDeptName(dept.name);
    setDeptHeadName(dept.headName);
    setDeptHeadEmail(dept.headEmail);
    setDeptRisk(dept.riskTier);
    setDeptDescription(dept.description);
    setDeptStatus(dept.status);
    setDeptEmployeeCount(dept.employeeCount || 20);
  };

  // Submit Framework
  const handleSaveFramework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fwCode.trim() || !fwName.trim()) {
      setFeedback({ type: 'error', message: 'Framework Code and Full Name are required.' });
      return;
    }

    try {
      if (editingFramework) {
        await editFramework(editingFramework.id, {
          code: fwCode.trim(),
          name: fwName.trim(),
          governingBody: fwGov.trim(),
          version: fwVersion.trim(),
          cadence: fwCadence,
          description: fwDescription.trim(),
          status: fwStatus
        });
        setFeedback({ type: 'success', message: `Framework "${fwCode.trim()}" updated successfully in SQLite database.` });
        setEditingFramework(null);
      } else {
        await addFramework({
          code: fwCode.trim(),
          name: fwName.trim(),
          governingBody: fwGov.trim(),
          version: fwVersion.trim(),
          cadence: fwCadence,
          description: fwDescription.trim(),
          status: fwStatus
        });
        setFeedback({ type: 'success', message: `New standard "${fwCode.trim()}" added successfully to SQLite database.` });
        setIsAddingFramework(false);
      }
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error saving regulatory framework' });
    }
  };

  // Delete Framework
  const handleDeleteFramework = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to remove the standard "${code}"?`)) return;
    try {
      await removeFramework(id);
      setFeedback({ type: 'success', message: `Framework "${code}" removed successfully.` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error deleting framework' });
    }
  };

  // Submit Department
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptCode.trim() || !deptName.trim()) {
      setFeedback({ type: 'error', message: 'Department Code and Name are required.' });
      return;
    }

    try {
      if (editingDepartment) {
        await editDepartment(editingDepartment.id, {
          code: deptCode.trim(),
          name: deptName.trim(),
          headName: deptHeadName.trim(),
          headEmail: deptHeadEmail.trim(),
          riskTier: deptRisk,
          description: deptDescription.trim(),
          status: deptStatus,
          employeeCount: deptEmployeeCount
        });
        setFeedback({ type: 'success', message: `Business unit "${deptName.trim()}" updated successfully in SQLite database.` });
        setEditingDepartment(null);
      } else {
        await addDepartment({
          code: deptCode.trim(),
          name: deptName.trim(),
          headName: deptHeadName.trim(),
          headEmail: deptHeadEmail.trim(),
          riskTier: deptRisk,
          description: deptDescription.trim(),
          status: deptStatus,
          employeeCount: deptEmployeeCount
        });
        setFeedback({ type: 'success', message: `New business unit "${deptName.trim()}" created successfully in SQLite database.` });
        setIsAddingDepartment(false);
      }
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error saving business unit' });
    }
  };

  // Delete Department
  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the business unit "${name}"?`)) return;
    try {
      await removeDepartment(id);
      setFeedback({ type: 'success', message: `Business unit "${name}" removed successfully.` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error deleting business unit' });
    }
  };

  // Filtering Frameworks
  const filteredFrameworks = frameworks.filter(fw => {
    const q = fwSearch.toLowerCase();
    const matchesSearch = fw.code.toLowerCase().includes(q) || 
      fw.name.toLowerCase().includes(q) || 
      fw.governingBody.toLowerCase().includes(q) ||
      fw.description.toLowerCase().includes(q);
    
    const matchesStatus = fwStatusFilter === 'all' || fw.status === fwStatusFilter;
    const matchesCadence = fwCadenceFilter === 'all' || fw.cadence === fwCadenceFilter;

    return matchesSearch && matchesStatus && matchesCadence;
  });

  // Filtering Departments
  const filteredDepartments = departments.filter(dept => {
    const q = deptSearch.toLowerCase();
    const matchesSearch = dept.code.toLowerCase().includes(q) || 
      dept.name.toLowerCase().includes(q) || 
      dept.headName.toLowerCase().includes(q) ||
      dept.headEmail.toLowerCase().includes(q) ||
      dept.description.toLowerCase().includes(q);
    
    const matchesRisk = deptRiskFilter === 'all' || dept.riskTier === deptRiskFilter;
    const matchesStatus = deptStatusFilter === 'all' || dept.status === deptStatusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  // Stats for Frameworks
  const activeFwCount = frameworks.filter(f => f.status === 'active').length;
  const inRevisionFwCount = frameworks.filter(f => f.status === 'in_revision').length;
  const linkedAuditsTotal = audits.length;
  const openFindingsTotal = findings.filter(f => f.status !== 'Closed').length;

  // Stats for Departments
  const highRiskDeptCount = departments.filter(d => d.riskTier === 'High').length;
  const medRiskDeptCount = departments.filter(d => d.riskTier === 'Medium').length;
  const totalEmployees = departments.reduce((acc, d) => acc + (d.employeeCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">
                Standards, Frameworks & Business Units
              </h1>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-medium">
                SQLite Master Data
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure regulatory compliance standards (ISO 27001, SOC 2, HIPAA, SOX) and enterprise department structures for audit scoping and remediation ownership.
            </p>
          </div>

          {/* Sub-tab Switcher & Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setActiveSubTab('frameworks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  activeSubTab === 'frameworks' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Regulatory Standards ({frameworks.length})</span>
              </button>
              <button
                onClick={() => setActiveSubTab('departments')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  activeSubTab === 'departments' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Departments & Units ({departments.length})</span>
              </button>
            </div>

            {activeSubTab === 'frameworks' ? (
              <button
                onClick={openAddFrameworkModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Standard / Framework</span>
              </button>
            ) : (
              <button
                onClick={openAddDepartmentModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Department / Unit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-3.5 rounded-lg text-xs flex items-center justify-between border ${
          feedback.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)} 
            className="font-bold text-slate-500 hover:text-slate-800 px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* --- TAB 1: REGULATORY FRAMEWORKS & STANDARDS --- */}
      {activeSubTab === 'frameworks' && (
        <div className="space-y-5">
          {/* Metrics summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Standards</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{frameworks.length}</p>
              <span className="text-[10px] text-slate-400">Compliance baselines</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Active Mandates</span>
              <p className="text-xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">{activeFwCount}</p>
              <span className="text-[10px] text-emerald-600">Currently in force</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">In Revision</span>
              <p className="text-xl font-bold font-mono text-amber-800 mt-1 tabular-nums">{inRevisionFwCount}</p>
              <span className="text-[10px] text-amber-600">Updating clauses</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">Mapped Audits</span>
              <p className="text-xl font-bold font-mono text-indigo-800 mt-1 tabular-nums">{linkedAuditsTotal}</p>
              <span className="text-[10px] text-indigo-600">Active programs</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">Open Findings</span>
              <p className="text-xl font-bold font-mono text-rose-800 mt-1 tabular-nums">{openFindingsTotal}</p>
              <span className="text-[10px] text-rose-600">Across frameworks</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search standard by code, name, governing body, or requirement..."
                  value={fwSearch}
                  onChange={(e) => setFwSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-md">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Status:</span>
                <select
                  value={fwStatusFilter}
                  onChange={(e) => setFwStatusFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="in_revision">In Revision</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-md">
                <span>Cadence:</span>
                <select
                  value={fwCadenceFilter}
                  onChange={(e) => setFwCadenceFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">All Cadences</option>
                  <option value="Annual">Annual</option>
                  <option value="Semi-annual">Semi-annual</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Continuous">Continuous</option>
                </select>
              </div>

              <span className="text-[11px] text-slate-400 ml-auto font-mono">
                Showing {filteredFrameworks.length} of {frameworks.length}
              </span>
            </div>
          </div>

          {/* Frameworks Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Standard / Code</th>
                    <th className="py-3 px-4">Framework Title & Governing Body</th>
                    <th className="py-3 px-4">Version & Cadence</th>
                    <th className="py-3 px-4">Active Audits</th>
                    <th className="py-3 px-4">Findings</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFrameworks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No regulatory frameworks found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredFrameworks.map(fw => {
                      // Dynamic audits count for this framework
                      const currentAudits = audits.filter(a => a.framework === fw.code);
                      const currentFindings = findings.filter(f => f.framework === fw.code && f.status !== 'Closed');

                      return (
                        <tr key={fw.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 align-top">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {fw.code}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 align-top max-w-sm">
                            <p className="font-bold text-slate-900 leading-snug">{fw.name}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{fw.governingBody}</span>
                            </p>
                            {fw.description && (
                              <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2">
                                {fw.description}
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-4 align-top whitespace-nowrap">
                            <span className="text-slate-900 font-medium block">{fw.version}</span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{fw.cadence}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                {currentAudits.length}
                              </span>
                              {currentAudits.length > 0 && onNavigateTab && (
                                <button
                                  onClick={() => onNavigateTab('kanban')}
                                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-medium"
                                  title="View audits in Kanban"
                                >
                                  View →
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-mono font-semibold px-2 py-0.5 rounded ${
                                currentFindings.length > 0 
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                  : 'text-slate-500 bg-slate-100'
                              }`}>
                                {currentFindings.length} open
                              </span>
                              {currentFindings.length > 0 && onNavigateTab && (
                                <button
                                  onClick={() => onNavigateTab('findings')}
                                  className="text-amber-700 hover:text-amber-900 text-[11px] font-medium"
                                  title="View findings in CAPA matrix"
                                >
                                  Review →
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 align-top whitespace-nowrap">
                            {fw.status === 'active' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                              </span>
                            )}
                            {fw.status === 'in_revision' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" /> In Revision
                              </span>
                            )}
                            {fw.status === 'retired' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                Retired
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditFrameworkModal(fw)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                title="Edit Standard"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteFramework(fw.id, fw.code)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                                title="Delete Standard"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
      )}

      {/* --- TAB 2: DEPARTMENTS & BUSINESS UNITS --- */}
      {activeSubTab === 'departments' && (
        <div className="space-y-5">
          {/* Inherent Risk Working Paper Guide Banner */}
          <div className="bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-indigo-50/90 border border-indigo-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-indigo-600 text-white rounded-md shrink-0 mt-0.5">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  Inherent Risk Tier & Risk Control Matrix (RCM) Working Papers
                </span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Internal auditors can input multiple Risk Control Matrices per Department. The system automatically computes the Inherent Risk Score (Likelihood &times; Impact) and sets the unit&apos;s Inherent Risk Tier.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <span className="text-[11px] font-mono text-indigo-900 bg-white/90 border border-indigo-200 px-2.5 py-1 rounded-md font-semibold">
                {rcmItems.length} RCM Matrices across {departments.length} Units
              </span>
            </div>
          </div>

          {/* Metrics summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Business Units</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{departments.length}</p>
              <span className="text-[10px] text-slate-400">Enterprise operational units</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">High Risk Tier</span>
              <p className="text-xl font-bold font-mono text-rose-800 mt-1 tabular-nums">{highRiskDeptCount}</p>
              <span className="text-[10px] text-rose-600">Critical attack surfaces</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">Medium Risk Tier</span>
              <p className="text-xl font-bold font-mono text-amber-800 mt-1 tabular-nums">{medRiskDeptCount}</p>
              <span className="text-[10px] text-amber-600">Operational dependencies</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider block">Workforce Staff</span>
              <p className="text-xl font-bold font-mono text-sky-800 mt-1 tabular-nums">{totalEmployees}</p>
              <span className="text-[10px] text-sky-600">Headcount in scope</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">Audit Engagements</span>
              <p className="text-xl font-bold font-mono text-indigo-800 mt-1 tabular-nums">{audits.length}</p>
              <span className="text-[10px] text-indigo-600">Department scopes</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search department by code, name, head of department, or mission..."
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-md">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Risk Tier:</span>
                <select
                  value={deptRiskFilter}
                  onChange={(e) => setDeptRiskFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">All Risk Tiers</option>
                  <option value="High">High Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="Low">Low Risk</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-md">
                <span>Status:</span>
                <select
                  value={deptStatusFilter}
                  onChange={(e) => setDeptStatusFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="restructuring">Restructuring</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <span className="text-[11px] text-slate-400 ml-auto font-mono">
                Showing {filteredDepartments.length} of {departments.length}
              </span>
            </div>
          </div>

          {/* Departments Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Business Unit Name & Scope</th>
                    <th className="py-3 px-4">Unit Leadership</th>
                    <th className="py-3 px-4 min-w-[190px]">Inherent Risk & Working Paper</th>
                    <th className="py-3 px-4">Staff Count</th>
                    <th className="py-3 px-4">Active Audits</th>
                    <th className="py-3 px-4">Open CAPA</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDepartments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        No departments found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDepartments.map(dept => {
                      const currentAudits = audits.filter(a => a.department === dept.name);
                      const currentFindings = findings.filter(f => f.department === dept.name && f.status !== 'Closed');
                      const currentDeptRcm = rcmItems.filter(r => r.departmentId === dept.id || r.departmentName === dept.name);
                      const currentDeptRcmCount = currentDeptRcm.length;

                      const calculatedScoreDisplay = dept.inherentRiskScore && dept.inherentRiskScore > 0
                        ? dept.inherentRiskScore.toFixed(1)
                        : (currentDeptRcmCount > 0 
                            ? (currentDeptRcm.reduce((acc, curr) => acc + curr.inherentRiskScore, 0) / currentDeptRcmCount).toFixed(1)
                            : null);

                      return (
                        <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 align-top">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {dept.code}
                            </span>
                          </td>

                          <td className="py-3 px-4 align-top max-w-xs">
                            <p className="font-bold text-slate-900">{dept.name}</p>
                            {dept.description && (
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                {dept.description}
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold font-mono">
                                {dept.headName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 block">{dept.headName}</span>
                                <a 
                                  href={`mailto:${dept.headEmail}`} 
                                  className="text-[11px] text-indigo-600 hover:underline block"
                                >
                                  {dept.headEmail}
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* Inherent Risk Tier & Working Paper Linkage */}
                          <td className="py-3 px-4 align-top whitespace-nowrap">
                            <div className="space-y-1">
                              <div>
                                {dept.riskTier === 'High' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                                    High Risk
                                  </span>
                                )}
                                {dept.riskTier === 'Medium' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                    Medium Risk
                                  </span>
                                )}
                                {dept.riskTier === 'Low' && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                    Low Risk
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                                <span className="text-slate-400">Score:</span>
                                <span className="font-bold text-slate-800">
                                  {calculatedScoreDisplay || '—'}
                                </span>
                                <span className="text-slate-400">/ 25</span>
                              </div>

                              <button
                                onClick={() => setSelectedDeptForWorkingPaper(dept)}
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50/90 hover:bg-indigo-100/90 px-2 py-0.5 rounded border border-indigo-200/90 transition-colors shadow-2xs mt-0.5"
                                title="Open Inherent Risk Working Paper & Risk Control Matrix"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span>Working Paper ({currentDeptRcmCount} RCM) &rarr;</span>
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 align-top whitespace-nowrap">
                            <span className="font-mono text-slate-700">
                              {dept.employeeCount || 10} members
                            </span>
                          </td>

                          <td className="py-3 px-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                {currentAudits.length}
                              </span>
                              {currentAudits.length > 0 && onNavigateTab && (
                                <button
                                  onClick={() => onNavigateTab('kanban')}
                                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-medium"
                                >
                                  View →
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-mono font-semibold px-2 py-0.5 rounded ${
                                currentFindings.length > 0 
                                ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                : 'text-slate-500 bg-slate-100'
                              }`}>
                                {currentFindings.length} open
                              </span>
                              {currentFindings.length > 0 && onNavigateTab && (
                                <button
                                  onClick={() => onNavigateTab('findings')}
                                  className="text-amber-700 hover:text-amber-900 text-[11px] font-medium"
                                >
                                  Review →
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedDeptForWorkingPaper(dept)}
                                className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                                title="Open Inherent Risk Working Paper (RCM)"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditDepartmentModal(dept)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                title="Edit Department"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                                title="Delete Department"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
      )}

      {/* --- MODAL: ADD / EDIT FRAMEWORK --- */}
      {(isAddingFramework || editingFramework) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingFramework ? `Edit Standard: ${editingFramework.code}` : 'Register Regulatory Standard / Framework'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define compliance standard name, governing body, version, and assessment cadence.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddingFramework(false);
                  setEditingFramework(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFramework} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Standard Code / Acronym *</label>
                  <input
                    type="text"
                    required
                    value={fwCode}
                    onChange={(e) => setFwCode(e.target.value)}
                    placeholder="e.g. ISO 27001, FedRAMP High, PCI-DSS v4"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Version / Revision *</label>
                  <input
                    type="text"
                    required
                    value={fwVersion}
                    onChange={(e) => setFwVersion(e.target.value)}
                    placeholder="e.g. 2022 Revision, v4.0.1, Rev 5"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Framework Title *</label>
                <input
                  type="text"
                  required
                  value={fwName}
                  onChange={(e) => setFwName(e.target.value)}
                  placeholder="e.g. ISO/IEC 27001:2022 Information Security Management System"
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Governing Body / Regulatory Authority *</label>
                <input
                  type="text"
                  required
                  value={fwGov}
                  onChange={(e) => setFwGov(e.target.value)}
                  placeholder="e.g. AICPA, International Organization for Standardization, HHS OCR, SEC"
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Audit Assessment Cadence</label>
                  <select
                    value={fwCadence}
                    onChange={(e) => setFwCadence(e.target.value as any)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="Annual">Annual Audit</option>
                    <option value="Semi-annual">Semi-annual (6 months)</option>
                    <option value="Quarterly">Quarterly Review</option>
                    <option value="Continuous">Continuous Monitoring</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lifecycle Status</label>
                  <select
                    value={fwStatus}
                    onChange={(e) => setFwStatus(e.target.value as any)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="active">Active Standard</option>
                    <option value="in_revision">In Revision / Draft</option>
                    <option value="retired">Retired / Superseded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandate Scope & Description</label>
                <textarea
                  rows={3}
                  value={fwDescription}
                  onChange={(e) => setFwDescription(e.target.value)}
                  placeholder="Detail the regulatory scope, control domains, and compliance mandates covered by this standard..."
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingFramework(false);
                    setEditingFramework(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold shadow-xs"
                >
                  {editingFramework ? 'Save Framework Updates' : 'Register Standard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD / EDIT DEPARTMENT --- */}
      {(isAddingDepartment || editingDepartment) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingDepartment ? `Edit Unit: ${editingDepartment.name}` : 'Register Department / Business Unit'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define business unit structure, leadership contact, inherent risk tier, and monitored staff.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddingDepartment(false);
                  setEditingDepartment(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Code *</label>
                  <input
                    type="text"
                    required
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. DEPT-INFRA, DEPT-SEC, DEPT-FIN"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department / Business Unit Name *</label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. Cloud Infrastructure, Cybersecurity Operations"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Head Full Name *</label>
                  <input
                    type="text"
                    required
                    value={deptHeadName}
                    onChange={(e) => setDeptHeadName(e.target.value)}
                    placeholder="e.g. Dev Patel, Sarah Jenkins"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Head Email *</label>
                  <input
                    type="email"
                    required
                    value={deptHeadEmail}
                    onChange={(e) => setDeptHeadEmail(e.target.value)}
                    placeholder="e.g. d.patel@aegisaudit.internal"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inherent Risk Tier</label>
                  <select
                    value={deptRisk}
                    onChange={(e) => setDeptRisk(e.target.value as any)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="High">High Risk (Critical Systems)</option>
                    <option value="Medium">Medium Risk (Operational)</option>
                    <option value="Low">Low Risk (Support Functions)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff / Employee Count</label>
                  <input
                    type="number"
                    min={1}
                    value={deptEmployeeCount}
                    onChange={(e) => setDeptEmployeeCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Operational Status</label>
                  <select
                    value={deptStatus}
                    onChange={(e) => setDeptStatus(e.target.value as any)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="restructuring">Restructuring</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Scope & Architecture</label>
                <textarea
                  rows={3}
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  placeholder="Describe the unit's technical infrastructure, software suites, databases, or compliance scope..."
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingDepartment(false);
                    setEditingDepartment(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold shadow-xs"
                >
                  {editingDepartment ? 'Save Unit Updates' : 'Create Business Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inherent Risk Working Paper Modal for Selected Department */}
      {selectedDeptForWorkingPaper && (
        <InherentRiskWorkingPaperModal
          department={selectedDeptForWorkingPaper}
          onClose={() => setSelectedDeptForWorkingPaper(null)}
          onNavigateToAudit={onNavigateTab ? () => onNavigateTab('kanban') : undefined}
        />
      )}
    </div>
  );
};
