import React, { useState } from 'react';
import { AuditProvider, useAudit } from './context/AuditContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WorkflowKanbanView } from './components/WorkflowKanbanView';
import { AuditsView } from './components/AuditsView';
import { FindingsView } from './components/FindingsView';
import { ReportsView } from './components/ReportsView';
import { EmailDispatcherView } from './components/EmailDispatcherView';
import { UserManagementView } from './components/UserManagementView';
import { RoleManagementView } from './components/RoleManagementView';
import { StandardsAndDeptsView } from './components/StandardsAndDeptsView';
import { FindingDetailModal } from './components/FindingDetailModal';
import { CreateFindingModal } from './components/CreateFindingModal';
import { CreateAuditModal } from './components/CreateAuditModal';
import { AuditFieldworkModal } from './components/AuditFieldworkModal';
import { RbacMatrixModal } from './components/RbacMatrixModal';
import { ReadmeModal } from './components/ReadmeModal';
import { AuditControl } from './types/audit';
import { LoginForm } from './components/LoginForm';

function MainContent() {
  const { isAuthenticated } = useAudit();

  const [activeTab, setActiveTab] = useState<string>('kanban'); // Default to the requested Workflow Kanban
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [showCreateFinding, setShowCreateFinding] = useState<boolean>(false);
  const [showCreateAudit, setShowCreateAudit] = useState<boolean>(false);
  const [fieldworkAuditId, setFieldworkAuditId] = useState<string | null>(null);
  const [showRbacGuide, setShowRbacGuide] = useState<boolean>(false);
  const [showReadme, setShowReadme] = useState<boolean>(false);

  // Fieldwork log finding helper
  const [prefilledControl, setPrefilledControl] = useState<AuditControl | null>(null);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleLogFindingFromControl = (ctrl: AuditControl) => {
    setPrefilledControl(ctrl);
    setShowCreateFinding(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateFinding={() => {
          setPrefilledControl(null);
          setShowCreateFinding(true);
        }}
        onOpenRbacGuide={() => setShowRbacGuide(true)}
        onOpenReadme={() => setShowReadme(true)}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={setActiveTab}
            onSelectFinding={setSelectedFindingId}
            onOpenCreateFinding={() => {
              setPrefilledControl(null);
              setShowCreateFinding(true);
            }}
          />
        )}

        {activeTab === 'kanban' && (
          <WorkflowKanbanView
            onOpenCreateAudit={() => setShowCreateAudit(true)}
            onOpenAuditFieldwork={setFieldworkAuditId}
            onOpenReports={() => setActiveTab('reports')}
            onSelectFinding={setSelectedFindingId}
          />
        )}

        {activeTab === 'audits' && (
          <AuditsView
            onOpenCreateAudit={() => setShowCreateAudit(true)}
            onOpenFieldwork={setFieldworkAuditId}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'findings' && (
          <FindingsView
            onSelectFinding={setSelectedFindingId}
            onOpenCreateFinding={() => {
              setPrefilledControl(null);
              setShowCreateFinding(true);
            }}
          />
        )}

        {activeTab === 'standards' && (
          <StandardsAndDeptsView onNavigateTab={setActiveTab} />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}

        {activeTab === 'users' && (
          <UserManagementView />
        )}

        {activeTab === 'roles' && (
          <RoleManagementView />
        )}

        {activeTab === 'emails' && (
          <EmailDispatcherView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 font-display">AegisAudit</span>
            <span>·</span>
            <span>Compliance Management & Remediation Verification System</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <button
              onClick={() => setActiveTab('standards')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Standards & Depts
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('users')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              User Directory
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('roles')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Role Management
            </button>
            <span>·</span>
            <button
              onClick={() => setShowRbacGuide(true)}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              RBAC Guide
            </button>
            <span>·</span>
            <button
              onClick={() => setShowReadme(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              README &amp; Screenshots
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedFindingId && (
        <FindingDetailModal
          findingId={selectedFindingId}
          onClose={() => setSelectedFindingId(null)}
        />
      )}

      {showCreateFinding && (
        <CreateFindingModal
          initialAuditId={prefilledControl?.auditId}
          initialControlCode={prefilledControl?.code}
          onClose={() => {
            setShowCreateFinding(false);
            setPrefilledControl(null);
          }}
          onCreated={(newFindingId) => {
            setShowCreateFinding(false);
            setPrefilledControl(null);
            setSelectedFindingId(newFindingId);
          }}
        />
      )}

      {showCreateAudit && (
        <CreateAuditModal
          onClose={() => setShowCreateAudit(false)}
          onCreated={() => {
            setShowCreateAudit(false);
            setActiveTab('kanban');
          }}
        />
      )}

      {fieldworkAuditId && (
        <AuditFieldworkModal
          auditId={fieldworkAuditId}
          onClose={() => setFieldworkAuditId(null)}
          onLogFindingFromControl={handleLogFindingFromControl}
        />
      )}

      {showRbacGuide && (
        <RbacMatrixModal
          onClose={() => setShowRbacGuide(false)}
        />
      )}

      {showReadme && (
        <ReadmeModal
          onClose={() => setShowReadme(false)}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuditProvider>
      <MainContent />
    </AuditProvider>
  );
}
