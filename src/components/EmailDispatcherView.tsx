import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { EmailDispatchLog, NotificationRule } from '../types/audit';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Eye, 
  Sliders, 
  X, 
  Filter, 
  Clock, 
  User, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const EmailDispatcherView: React.FC = () => {
  const { 
    emailLogs, 
    notificationRules, 
    toggleNotificationRule, 
    dispatchEmailNotification, 
    currentUser 
  } = useAudit();

  const [selectedLog, setSelectedLog] = useState<EmailDispatchLog | null>(null);
  const [showConfigRules, setShowConfigRules] = useState(false);
  const [filterTrigger, setFilterTrigger] = useState<string>('all');
  const [testSentMessage, setTestSentMessage] = useState(false);

  // Filter logs
  const filteredLogs = emailLogs.filter(log => {
    if (filterTrigger !== 'all' && log.triggerEvent !== filterTrigger) return false;
    return true;
  });

  // Test send simulation
  const handleSendTestNotification = () => {
    dispatchEmailNotification(
      'sla_overdue_warning',
      'Test SLA Escalation Dispatch',
      `[SIMULATED SLA WARNING] Testing AegisAudit Automated Dispatcher`,
      currentUser.email,
      currentUser.name,
      currentUser.roleLabel,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 20px; color: white;">
            <h2 style="margin: 0; font-size: 18px;">AegisAudit Automated Dispatch Test</h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Manual Test Trigger Verified</p>
          </div>
          <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
            <p style="font-size: 14px; line-height: 1.5;">
              This test notification was triggered by <strong>${currentUser.name}</strong> to verify the integrated stakeholder email delivery pipeline.
            </p>
            <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0;">
              Timestamp: ${new Date().toLocaleString()}<br/>
              Recipient: ${currentUser.email}<br/>
              SMTP Delivery Pipeline: Verified Active
            </div>
          </div>
        </div>
      `
    );

    setTestSentMessage(true);
    setTimeout(() => setTestSentMessage(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">
              Stakeholder Email Notifications & Dispatch Log
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
              {emailLogs.length} Dispatched
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated compliance emails triggered during finding assignments, CAPA submissions, verification sign-offs, and SLA warnings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConfigRules(!showConfigRules)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Notification Trigger Rules</span>
          </button>

          <button
            onClick={handleSendTestNotification}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Alert</span>
          </button>
        </div>
      </div>

      {testSentMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Test notification email dispatched to <strong>{currentUser.email}</strong> and added to real-time log.</span>
          </div>
        </div>
      )}

      {/* Rules Config Drawer / Banner */}
      {showConfigRules && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Automated Stakeholder Notification Trigger Rules
              </h3>
              <p className="text-xs text-slate-500">
                Toggle automated emails for specific events across the audit & remediation lifecycle.
              </p>
            </div>
            <button
              onClick={() => setShowConfigRules(false)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {notificationRules.map(rule => (
              <div
                key={rule.id}
                className="p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-3 bg-slate-50/50"
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <span className="font-bold text-slate-900 block truncate">{rule.name}</span>
                  <p className="text-[11px] text-slate-500">{rule.description}</p>
                  <div className="text-[10px] text-indigo-700 font-mono mt-1">
                    Recipients: {rule.targetRoles.join(', ')}
                  </div>
                </div>

                {/* Toggle */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleNotificationRule(rule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Filter Event:</span>
          <select
            value={filterTrigger}
            onChange={(e) => setFilterTrigger(e.target.value)}
            className="bg-slate-50 px-2 py-1 border border-slate-200 rounded font-medium text-slate-900 outline-none cursor-pointer"
          >
            <option value="all">All Notification Triggers ({emailLogs.length})</option>
            <option value="finding_created">Finding Assigned</option>
            <option value="capa_submitted">CAPA Submitted</option>
            <option value="verification_requested">Verification Requested</option>
            <option value="verification_approved">Verification Approved & Closed</option>
            <option value="verification_rejected">Verification Rejected</option>
            <option value="sla_overdue_warning">SLA Overdue Warning</option>
            <option value="audit_stage_changed">Audit Stage Changed</option>
            <option value="audit_report_published">Audit Report Published</option>
          </select>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          Showing {filteredLogs.length} dispatches
        </span>
      </div>

      {/* Dispatch Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Trigger Event</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Email Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No email logs recorded for this trigger filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {log.id}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap text-[11px] tabular-nums">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{log.recipientName}</p>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {log.recipientEmail}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {log.triggerLabel}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-sm truncate text-slate-800 font-medium">
                      {log.subject}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-emerald-700 font-mono text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Delivered
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-end gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview HTML</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rendered Email Preview Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-900 text-white rounded-lg">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Dispatched Email Inspector
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Log: {selectedLog.id} · Dispatched {selectedLog.timestamp}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Metadata Envelope Header */}
            <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">From:</span>
                <span className="font-mono text-slate-900 font-medium">AegisAudit Automated Dispatcher &lt;noreply@aegisaudit.internal&gt;</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">To:</span>
                <span className="font-mono text-slate-900 font-medium">{selectedLog.recipientName} &lt;{selectedLog.recipientEmail}&gt;</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-bold text-slate-900">{selectedLog.subject}</span>
              </div>
            </div>

            {/* Rendered HTML Email Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <div 
                className="bg-white rounded-lg shadow-xs overflow-hidden border border-slate-200"
                dangerouslySetInnerHTML={{ __html: selectedLog.htmlContent }}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <a
                href={`mailto:${selectedLog.recipientEmail}?subject=${encodeURIComponent(selectedLog.subject)}`}
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <span>Open in Desktop Mail Client (mailto)</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
