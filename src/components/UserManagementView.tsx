import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { UserProfile, RoleDefinition } from '../types/audit';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Database,
  Building,
  Mail,
  Briefcase
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { users, roles, addUser, editUser, removeUser, currentUser } = useAudit();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: roles[0]?.id || '',
    department: 'Cloud Infrastructure',
    title: '',
    status: 'active'
  });

  const departments = Array.from(new Set(users.map(u => u.department)));

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.roleId === roleFilter || u.role === roleFilter;
    const matchesDept = deptFilter === 'all' || u.department === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  const handleOpenAddModal = () => {
    setErrorMsg(null);
    setFormData({
      name: '',
      email: '',
      roleId: roles[0]?.id || '',
      department: 'Cloud Infrastructure',
      title: '',
      status: 'active'
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (u: UserProfile) => {
    setErrorMsg(null);
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      roleId: u.roleId || roles.find(r => r.name === u.role)?.id || roles[0]?.id || '',
      department: u.department,
      title: u.title,
      status: u.status || 'active'
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await addUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        roleId: formData.roleId,
        department: formData.department,
        title: formData.title.trim() || 'Compliance Specialist',
        status: formData.status
      });
      setShowAddModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create user in SQLite');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setErrorMsg(null);
    try {
      await editUser(editingUser.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        roleId: formData.roleId,
        department: formData.department,
        title: formData.title.trim(),
        status: formData.status
      });
      setEditingUser(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update user in SQLite');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteConfirmUser) return;
    try {
      await removeUser(deleteConfirmUser.id);
      setDeleteConfirmUser(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">
              User Directory & Account Management
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
              <Database className="w-3 h-3 text-indigo-500" />
              SQLite Persistent
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage stakeholder accounts, assign RBAC access roles, and monitor account activity across audit programs.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-xs shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, title..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-md">
            <span className="text-slate-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Roles ({users.length})</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-md">
            <span className="text-slate-500">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Assigned RBAC Role</th>
                <th className="py-3 px-4">Department & Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No users match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const isCurrent = currentUser.id === u.id;
                  const roleObj = roles.find(r => r.id === u.roleId || r.name === u.role);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {u.initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.2 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] inline-block">
                          {roleObj?.label || u.roleLabel}
                        </span>
                        {roleObj?.isSystem ? (
                          <span className="text-[10px] text-slate-400 block mt-0.5">System Default</span>
                        ) : (
                          <span className="text-[10px] text-indigo-600 block mt-0.5">Custom Role</span>
                        )}
                      </td>

                      {/* Department & Title */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 truncate max-w-xs">{u.title}</p>
                        <span className="text-[11px] text-slate-500 block">{u.department}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                          u.status === 'active' || !u.status ? 'bg-emerald-100 text-emerald-800' :
                          u.status === 'inactive' ? 'bg-slate-100 text-slate-600' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status || 'active'}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500 tabular-nums">
                        {u.lastLoginAt ? u.lastLoginAt.substring(0, 16) : 'Never'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete User"
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 text-xs">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-slate-700" />
                <span>Provision New User in SQLite</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 text-rose-800 rounded border border-rose-200 text-[11px]">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rachel Sterling"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="r.sterling@aegisaudit.internal"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned RBAC Role *</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Internal Audit & Governance">Internal Audit & Governance</option>
                    <option value="Cybersecurity Assurance">Cybersecurity Assurance</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Finance & Payroll">Finance & Payroll</option>
                    <option value="Executive Governance Board">Executive Governance Board</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title / Designation</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Lead DevOps Engineer"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800"
                >
                  Save to SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 text-xs">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                Edit User: {editingUser.name}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 text-rose-800 rounded border border-rose-200 text-[11px]">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800"
                >
                  Update SQLite Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 text-xs space-y-3 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Delete User Account</h3>
            <p className="text-slate-600">
              Are you sure you want to delete user <strong>{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email}) from SQLite? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="px-3 py-1.5 bg-rose-600 text-white rounded font-medium hover:bg-rose-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
