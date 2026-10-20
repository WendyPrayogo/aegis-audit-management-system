import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { RoleDefinition, ALL_PERMISSIONS } from '../types/audit';
import { 
  Shield, 
  Plus, 
  Check, 
  Minus, 
  Edit, 
  Trash2, 
  X, 
  Sliders, 
  Users, 
  Lock, 
  Database,
  CheckCircle2
} from 'lucide-react';

export const RoleManagementView: React.FC = () => {
  const { roles, users, addRole, editRole, removeRole } = useAudit();

  const [selectedRole, setSelectedRole] = useState<RoleDefinition>(roles[0] || {} as any);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<RoleDefinition | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [roleForm, setRoleForm] = useState({
    name: '',
    label: '',
    description: '',
    permissions: [] as string[]
  });

  const categories = Array.from(new Set(ALL_PERMISSIONS.map(p => p.category)));

  const handleOpenAddModal = () => {
    setErrorMsg(null);
    setRoleForm({
      name: '',
      label: '',
      description: '',
      permissions: ['controls:test', 'findings:create', 'evidence:upload']
    });
    setShowAddRoleModal(true);
  };

  const handleOpenEditModal = (r: RoleDefinition) => {
    setErrorMsg(null);
    setEditingRole(r);
    setRoleForm({
      name: r.name,
      label: r.label,
      description: r.description,
      permissions: [...r.permissions]
    });
  };

  const handleTogglePermission = (permCode: string) => {
    setRoleForm(prev => {
      const exists = prev.permissions.includes(permCode);
      return {
        ...prev,
        permissions: exists 
          ? prev.permissions.filter(p => p !== permCode)
          : [...prev.permissions, permCode]
      };
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim() || !roleForm.label.trim()) return;
    setErrorMsg(null);

    try {
      const created = await addRole({
        name: roleForm.name.trim().toLowerCase().replace(/\s+/g, '_'),
        label: roleForm.label.trim(),
        description: roleForm.description.trim(),
        permissions: roleForm.permissions
      });
      setShowAddRoleModal(false);
      setSelectedRole(created);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create role in SQLite');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setErrorMsg(null);

    try {
      const updated = await editRole(editingRole.id, {
        label: roleForm.label.trim(),
        description: roleForm.description.trim(),
        permissions: roleForm.permissions
      });
      setEditingRole(null);
      setSelectedRole(updated);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update role in SQLite');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteConfirmRole) return;
    try {
      await removeRole(deleteConfirmRole.id);
      setDeleteConfirmRole(null);
      setSelectedRole(roles[0]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">
              Role & Permissions Management (RBAC)
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
              <Database className="w-3 h-3 text-indigo-500" />
              SQLite Persistent
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure system default and custom roles with granular permission policies across audit workflows.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Custom Role</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 font-bold">×</button>
        </div>
      )}

      {/* Main Grid: Roles List (Left) and Detailed Permissions Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Roles Cards */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <span>Defined Roles ({roles.length})</span>
          </div>

          <div className="space-y-2.5">
            {roles.map(r => {
              const isSelected = selectedRole.id === r.id;
              const assignedUsers = users.filter(u => u.roleId === r.id || u.role === r.name);

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-slate-900 bg-white shadow-xs ring-1 ring-slate-900' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{r.label}</span>
                        {r.isSystem ? (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                            System
                          </span>
                        ) : (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-medium">
                            Custom
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">{r.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(r);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100"
                        title="Edit Permissions"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {!r.isSystem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmRole(r);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                          title="Delete Custom Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-3 pt-2 border-t border-slate-100">
                    <span className="text-slate-600 font-medium">
                      {assignedUsers.length} user{assignedUsers.length !== 1 ? 's' : ''} assigned
                    </span>
                    <span>{r.permissions.length} permissions</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Granular Permissions Inspector */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">{selectedRole.label}</h2>
                <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                  selectedRole.isSystem ? 'bg-slate-100 text-slate-700' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {selectedRole.isSystem ? 'Built-in System Role' : 'Custom Defined Role'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{selectedRole.description}</p>
            </div>

            <button
              onClick={() => handleOpenEditModal(selectedRole)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap self-start sm:self-auto"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Configure Permissions</span>
            </button>
          </div>

          {/* Permissions Matrix by Category */}
          <div className="space-y-5">
            {categories.map(cat => {
              const catPerms = ALL_PERMISSIONS.filter(p => p.category === cat);

              return (
                <div key={cat} className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {cat}
                  </h3>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                    {catPerms.map(p => {
                      const hasPerm = selectedRole.permissions.includes(p.code);

                      return (
                        <div
                          key={p.code}
                          className="p-3 flex items-start justify-between gap-3 bg-white hover:bg-slate-50/60 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{p.label}</span>
                              <span className="font-mono text-[10px] text-slate-400">({p.code})</span>
                            </div>
                            <p className="text-slate-500 text-[11px] leading-relaxed">
                              {p.description}
                            </p>
                          </div>

                          <div className="shrink-0 pt-0.5">
                            {hasPerm ? (
                              <span className="flex items-center gap-1 text-emerald-700 font-semibold font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Granted
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded">
                                <Minus className="w-3.5 h-3.5 text-slate-300" /> Denied
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Create or Edit Role */}
      {(showAddRoleModal || editingRole) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-700" />
                <span>{editingRole ? `Configure Role: ${editingRole.label}` : 'Create Custom RBAC Role'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddRoleModal(false);
                  setEditingRole(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingRole ? handleEditSubmit : handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Display Role Label *</label>
                  <input
                    type="text"
                    required
                    value={roleForm.label}
                    onChange={(e) => setRoleForm({ ...roleForm, label: e.target.value })}
                    placeholder="e.g. Third-Party Vendor Auditor"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Identifier (Code) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingRole}
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    placeholder="e.g. vendor_auditor"
                    className={`w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono outline-none ${
                      editingRole ? 'bg-slate-100 text-slate-500' : 'focus:ring-1 focus:ring-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Description</label>
                <textarea
                  rows={2}
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Summarize the core scope and authority of this role..."
                  className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              {/* Permissions Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-800">
                    Granular Access Permissions ({roleForm.permissions.length} Selected)
                  </span>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {categories.map(cat => (
                    <div key={cat} className="space-y-1.5">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                        {cat}
                      </span>
                      <div className="space-y-1">
                        {ALL_PERMISSIONS.filter(p => p.category === cat).map(p => {
                          const isChecked = roleForm.permissions.includes(p.code);
                          return (
                            <label
                              key={p.code}
                              className={`p-2 rounded border flex items-center justify-between cursor-pointer transition-colors ${
                                isChecked ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50/40 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(p.code)}
                                  className="rounded border-slate-300 text-slate-900 focus:ring-0"
                                />
                                <span className="font-medium text-slate-800 truncate">{p.label}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">{p.code}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRoleModal(false);
                    setEditingRole(null);
                  }}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800"
                >
                  Save Role to SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Role Confirmation Modal */}
      {deleteConfirmRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 text-xs space-y-3 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Delete Custom Role</h3>
            <p className="text-slate-600">
              Are you sure you want to remove the custom role <strong>{deleteConfirmRole.label}</strong> ({deleteConfirmRole.name}) from SQLite?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmRole(null)}
                className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="px-3 py-1.5 bg-rose-600 text-white rounded font-medium hover:bg-rose-700"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
