import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Image as ImageIcon, 
  Layers, 
  ShieldCheck, 
  Calculator, 
  Database, 
  CheckCircle2, 
  ExternalLink,
  Key,
  Download
} from 'lucide-react';

interface ReadmeModalProps {
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ReadmeModal: React.FC<ReadmeModalProps> = ({ onClose, onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<'screenshots' | 'docs' | 'architecture' | 'credentials'>('screenshots');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const screenshots = [
    {
      id: 'kanban',
      title: 'Workflow Kanban & Audit Pipeline',
      description: 'Drag-and-drop audit lifecycle stages (Planning, Fieldwork, Review, Reporting, Certified Closed) with SLA countdowns and controls testing bars.',
      path: '/screenshots/audit_kanban_dashboard.svg',
      tag: 'Core Workflow'
    },
    {
      id: 'rcm',
      title: 'Department Inherent Risk Working Paper & Risk Control Matrix',
      description: 'Inherent Risk Tier automated calculation, Likelihood (1-5) x Impact (1-5) matrix scoring, and multi-control RCM management per department.',
      path: '/screenshots/rcm_working_paper.svg',
      tag: 'Risk Management'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">AegisAudit Documentation &amp; Screenshots</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-semibold">
                  README.md
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Enterprise Internal Audit, Risk Control Matrix (RCM) &amp; Automated Inherent Risk Tiering
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('screenshots')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'screenshots' 
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Screenshots Gallery</span>
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'docs' 
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full README Docs</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'architecture' 
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
              <span>Inherent Risk Formula &amp; Architecture</span>
            </button>
            <button
              onClick={() => setActiveTab('credentials')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'credentials' 
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>RBAC Credentials</span>
            </button>
          </div>

          <a
            href="/README.md"
            download="README.md"
            className="hidden sm:inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
            title="Download README.md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Raw File</span>
          </a>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: SCREENSHOTS */}
          {activeTab === 'screenshots' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {screenshots.map(s => (
                  <div key={s.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs hover:shadow-md transition-shadow">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                            {s.tag}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{s.description}</p>
                      </div>
                      <a
                        href={s.path}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-100 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Full Size</span>
                      </a>
                    </div>
                    <div className="p-3 bg-slate-900/5 cursor-pointer" onClick={() => setPreviewImage(s.path)}>
                      <img 
                        src={s.path} 
                        alt={s.title}
                        className="w-full h-auto rounded border border-slate-200 shadow-xs" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FULL README */}
          {activeTab === 'docs' && (
            <div className="prose prose-slate max-w-none text-xs space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Overview</h3>
                <p className="text-slate-700 leading-relaxed">
                  <strong>AegisAudit</strong> is an enterprise-grade internal audit management system designed to enforce rigorous controls testing, non-compliance remediations (CAPA), regulatory framework governance, and automated departmental inherent risk scoring.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Regulatory Compliance Frameworks
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li><strong>ISO 27001:2022</strong> — Information Security Management (ISMS)</li>
                    <li><strong>SOC 2 Type II</strong> — AICPA Trust Services Criteria (Security, Availability, Confidentiality)</li>
                    <li><strong>SOX 404</strong> — Internal Controls over Financial Reporting (ICFR)</li>
                    <li><strong>NIST CSF 2.0</strong> — Identify, Protect, Detect, Respond, Recover</li>
                    <li><strong>PCI-DSS v4.0</strong> — Cardholder Data Security Standards</li>
                    <li><strong>GDPR</strong> — Articles 25, 30, and 32 Data Protection by Design</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    SQLite Database &amp; API Architecture
                  </h4>
                  <p className="text-slate-600 mb-2">
                    Persistence is backed by WebAssembly SQLite (sql.js) with file synchronizer.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li><code>departments</code>: Stores risk tier, calculated score, and head info</li>
                    <li><code>risk_control_matrix</code>: Stores multiple RCM rows per department</li>
                    <li><code>frameworks</code>: Regulatory standards and audit mapping</li>
                    <li><code>audits</code>, <code>controls</code>, <code>findings</code>: Fieldwork execution</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INHERENT RISK FORMULA */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-indigo-700" />
                  <h3 className="text-sm font-bold text-indigo-950">Inherent Risk Scoring Formula</h3>
                </div>
                <p className="text-xs text-indigo-900 leading-relaxed mb-3">
                  Department Inherent Risk Tiers are automatically calculated using a composite hybrid model that balances general operational risk density against peak catastrophic exposure:
                </p>
                <div className="p-3 bg-white rounded-lg border border-indigo-200 font-mono text-xs font-bold text-slate-900">
                  Department Inherent Risk Score = (0.6 &times; Average RCM Score) + (0.4 &times; Maximum RCM Score)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <span className="font-bold text-rose-900 text-xs">High Risk Tier</span>
                  </div>
                  <p className="text-sm font-extrabold text-rose-950 font-mono">Score &ge; 15.0</p>
                  <p className="text-[11px] text-rose-800 mt-1">Requires immediate quarterly audit cycle and continuous executive oversight.</p>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <span className="font-bold text-amber-900 text-xs">Medium Risk Tier</span>
                  </div>
                  <p className="text-sm font-extrabold text-amber-950 font-mono">9.0 &le; Score &lt; 15.0</p>
                  <p className="text-[11px] text-amber-800 mt-1">Scheduled for semi-annual audit review with baseline sample testing.</p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="font-bold text-emerald-900 text-xs">Low Risk Tier</span>
                  </div>
                  <p className="text-sm font-extrabold text-emerald-950 font-mono">Score &lt; 9.0</p>
                  <p className="text-[11px] text-emerald-800 mt-1">Standard annual or bi-annual compliance monitoring cycle.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CREDENTIALS */}
          {activeTab === 'credentials' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Switch users via the <strong>Persona Switcher</strong> in the top header or log in with these credentials:
              </p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">User Name</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Lead Internal Auditor</td>
                      <td className="py-2.5 px-3">Sarah Chen</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-600">sarah.chen@aegis.internal</td>
                      <td className="py-2.5 px-3 font-mono">audit2026</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Chief Audit Executive (CAE)</td>
                      <td className="py-2.5 px-3">Marcus Vance</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-600">marcus.vance@aegis.internal</td>
                      <td className="py-2.5 px-3 font-mono">admin2026</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Fieldwork Auditor</td>
                      <td className="py-2.5 px-3">Elena Rostova</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-600">elena.rostova@aegis.internal</td>
                      <td className="py-2.5 px-3 font-mono">audit2026</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Auditee (Finance Lead)</td>
                      <td className="py-2.5 px-3">David Wright</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-600">david.wright@aegis.internal</td>
                      <td className="py-2.5 px-3 font-mono">auditee2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            AegisAudit Internal Audit Management Suite
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            Close Documentation
          </button>
        </div>

      </div>

      {/* Full-size image modal if clicked */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 p-4 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-w-[95vw] max-h-[90vh] rounded shadow-2xl object-contain border border-slate-700" 
            referrerPolicy="no-referrer"
          />
          <p className="text-slate-300 text-xs mt-3">Click anywhere to close preview</p>
        </div>
      )}
    </div>
  );
};
