import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Audit, 
  AuditControl, 
  Finding, 
  UserProfile, 
  RoleDefinition,
  EmailDispatchLog, 
  NotificationRule, 
  InAppNotification,
  AuditWorkflowStage,
  AuditStageConfiguration,
  ControlStatus,
  CAPAPlan,
  RemediationEvidence,
  Role,
  ALL_WORKFLOW_STAGES,
  FrameworkDefinition,
  DepartmentDefinition,
  RiskControlMatrixItem
} from '../types/audit';
import { 
  INITIAL_AUDITS, 
  INITIAL_CONTROLS, 
  INITIAL_FINDINGS, 
  INITIAL_USERS, 
  INITIAL_ROLES,
  INITIAL_FRAMEWORKS,
  INITIAL_DEPARTMENTS,
  INITIAL_RCM_ITEMS,
  INITIAL_NOTIFICATION_RULES, 
  INITIAL_EMAIL_LOGS, 
  INITIAL_INAPP_NOTIFICATIONS,
  createDefaultStageConfigs
} from '../data/initialData';
import * as api from '../api/client';

interface AuditContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  users: UserProfile[];
  roles: RoleDefinition[];
  frameworks: FrameworkDefinition[];
  departments: DepartmentDefinition[];
  rcmItems: RiskControlMatrixItem[];
  audits: Audit[];
  controls: AuditControl[];
  findings: Finding[];
  notificationRules: NotificationRule[];
  emailLogs: EmailDispatchLog[];
  inAppNotifications: InAppNotification[];
  sqliteStatus: string;

  // Risk Control Matrix (RCM) & Inherent Risk Working Paper Actions
  addRcmItem: (item: Partial<RiskControlMatrixItem>) => Promise<RiskControlMatrixItem>;
  editRcmItem: (id: string, updates: Partial<RiskControlMatrixItem>) => Promise<RiskControlMatrixItem>;
  removeRcmItem: (id: string) => Promise<void>;
  getDepartmentRcmItems: (deptIdOrName: string) => RiskControlMatrixItem[];
  getDepartmentInherentRisk: (deptIdOrName: string) => {
    score: number;
    tier: 'High' | 'Medium' | 'Low';
    count: number;
    highCount: number;
    medCount: number;
    lowCount: number;
    avgLikelihood: number;
    avgImpact: number;
  };
  
  // Framework Management
  addFramework: (data: {
    code: string;
    name: string;
    governingBody?: string;
    version?: string;
    cadence?: 'Annual' | 'Semi-annual' | 'Quarterly' | 'Continuous';
    description?: string;
    status?: 'active' | 'in_revision' | 'retired';
  }) => Promise<FrameworkDefinition>;
  editFramework: (
    id: string,
    updates: Partial<{
      code: string;
      name: string;
      governingBody: string;
      version: string;
      cadence: 'Annual' | 'Semi-annual' | 'Quarterly' | 'Continuous';
      description: string;
      status: 'active' | 'in_revision' | 'retired';
    }>
  ) => Promise<FrameworkDefinition>;
  removeFramework: (id: string) => Promise<void>;

  // Department Management
  addDepartment: (data: {
    code: string;
    name: string;
    headName?: string;
    headEmail?: string;
    riskTier?: 'High' | 'Medium' | 'Low';
    description?: string;
    status?: 'active' | 'restructuring' | 'inactive';
    employeeCount?: number;
  }) => Promise<DepartmentDefinition>;
  editDepartment: (
    id: string,
    updates: Partial<{
      code: string;
      name: string;
      headName: string;
      headEmail: string;
      riskTier: 'High' | 'Medium' | 'Low';
      description: string;
      status: 'active' | 'restructuring' | 'inactive';
      employeeCount: number;
    }>
  ) => Promise<DepartmentDefinition>;
  removeDepartment: (id: string) => Promise<void>;
  
  // User Management
  addUser: (userData: {
    name: string;
    email: string;
    roleId: string;
    department?: string;
    title?: string;
    status?: string;
  }) => Promise<UserProfile>;
  editUser: (
    id: string,
    updates: {
      name?: string;
      email?: string;
      roleId?: string;
      department?: string;
      title?: string;
      status?: string;
    }
  ) => Promise<UserProfile>;
  removeUser: (id: string) => Promise<void>;

  // Role Management
  addRole: (roleData: {
    name: string;
    label: string;
    description?: string;
    permissions: string[];
  }) => Promise<RoleDefinition>;
  editRole: (
    id: string,
    updates: {
      label?: string;
      description?: string;
      permissions?: string[];
    }
  ) => Promise<RoleDefinition>;
  removeRole: (id: string) => Promise<void>;

  // Workflow actions
  updateAuditStage: (auditId: string, newStage: AuditWorkflowStage) => void;
  updateAuditStageConfig: (
    auditId: string, 
    stage: AuditWorkflowStage, 
    updates: Partial<AuditStageConfiguration>
  ) => void;
  toggleStageEnabled: (auditId: string, stage: AuditWorkflowStage) => void;
  toggleChecklistItem: (auditId: string, stage: AuditWorkflowStage, itemId: string) => void;
  createAudit: (audit: Partial<Audit>, disabledStages?: AuditWorkflowStage[]) => void;
  updateAudit: (auditId: string, updates: Partial<Audit>) => void;
  
  // Control actions
  updateControlStatus: (controlId: string, status: ControlStatus, notes?: string) => void;
  
  // Finding lifecycle actions
  createFinding: (finding: Partial<Finding>) => string;
  updateFindingCAPA: (findingId: string, capa: CAPAPlan) => void;
  addFindingEvidence: (
    findingId: string, 
    evidence: Omit<RemediationEvidence, 'id' | 'uploadedAt' | 'uploadedBy'>
  ) => void;
  requestVerification: (findingId: string, remarks?: string) => void;
  verifyFinding: (findingId: string, status: 'approved' | 'rejected', notes: string) => void;
  
  // Email & Notification actions
  dispatchEmailNotification: (
    triggerEvent: NotificationRule['triggerEvent'],
    triggerLabel: string,
    subject: string,
    recipientEmail: string,
    recipientName: string,
    recipientRole: string,
    htmlContent: string,
    relatedFindingId?: string,
    relatedAuditId?: string
  ) => void;
  toggleNotificationRule: (ruleId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // System reset
  resetToSampleData: () => Promise<void>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'aegis_current_user',
  USERS: 'aegis_users',
  ROLES: 'aegis_roles',
  FRAMEWORKS: 'aegis_frameworks',
  DEPARTMENTS: 'aegis_departments',
  RCM: 'aegis_rcm',
  AUDITS: 'aegis_audits',
  CONTROLS: 'aegis_controls',
  FINDINGS: 'aegis_findings',
  RULES: 'aegis_rules',
  EMAIL_LOGS: 'aegis_email_logs',
  NOTIFICATIONS: 'aegis_notifications',
  IS_AUTH: 'aegis_is_authenticated',
};

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sqliteStatus, setSqliteStatus] = useState<string>('Connected (SQLite 3 WASM)');

  const [frameworks, setFrameworks] = useState<FrameworkDefinition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FRAMEWORKS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_FRAMEWORKS;
  });

  const [departments, setDepartments] = useState<DepartmentDefinition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_DEPARTMENTS;
  });

  const [rcmItems, setRcmItems] = useState<RiskControlMatrixItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RCM);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_RCM_ITEMS;
  });

  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_ROLES;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return users[0]; // Default: Marcus Vance (Lead Auditor)
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTH);
    return saved !== null ? saved === 'true' : true; // Default true so user can immediately use or log out
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_AUTH, String(isAuthenticated));
  }, [isAuthenticated]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const targetUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!targetUser) {
      return { success: false, error: 'No user account found with this corporate email address in SQLite.' };
    }
    if (targetUser.status === 'suspended') {
      return { success: false, error: 'This user account is suspended by Internal Audit Security. Contact the Lead Auditor.' };
    }
    if (targetUser.status === 'inactive') {
      return { success: false, error: 'This user account is currently inactive. Contact your administrator.' };
    }

    // Set user and auth
    setCurrentUserState(targetUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const [audits, setAudits] = useState<Audit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDITS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_AUDITS;
  });

  const [controls, setControls] = useState<AuditControl[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTROLS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CONTROLS;
  });

  const [findings, setFindings] = useState<Finding[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FINDINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_FINDINGS;
  });

  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RULES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_NOTIFICATION_RULES;
  });

  const [emailLogs, setEmailLogs] = useState<EmailDispatchLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_EMAIL_LOGS;
  });

  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_INAPP_NOTIFICATIONS;
  });

  // Fetch initial SQLite Users, Roles, Frameworks, Departments & RCM from backend
  useEffect(() => {
    let isMounted = true;
    const syncWithBackend = async () => {
      try {
        const [fetchedRoles, fetchedUsers, fetchedFrameworks, fetchedDepartments, fetchedRcm] = await Promise.all([
          api.fetchRoles().catch(() => null),
          api.fetchUsers().catch(() => null),
          api.fetchFrameworks().catch(() => null),
          api.fetchDepartments().catch(() => null),
          api.fetchRcmItems().catch(() => null)
        ]);

        if (isMounted) {
          if (fetchedRoles && fetchedRoles.length > 0) {
            setRoles(fetchedRoles);
          }
          if (fetchedUsers && fetchedUsers.length > 0) {
            setUsers(fetchedUsers);
            // Sync current user if still matches
            setCurrentUserState(prev => {
              const updated = fetchedUsers.find(u => u.id === prev.id);
              return updated || prev;
            });
          }
          if (fetchedFrameworks && fetchedFrameworks.length > 0) {
            setFrameworks(fetchedFrameworks);
          }
          if (fetchedDepartments && fetchedDepartments.length > 0) {
            setDepartments(fetchedDepartments);
          }
          if (fetchedRcm && fetchedRcm.length > 0) {
            setRcmItems(fetchedRcm);
          }
        }
      } catch (err) {
        console.warn('Backend SQLite sync skipped; operating in local mode:', err);
      }
    };

    syncWithBackend();
    return () => { isMounted = false; };
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FRAMEWORKS, JSON.stringify(frameworks));
  }, [frameworks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RCM, JSON.stringify(rcmItems));
  }, [rcmItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTROLS, JSON.stringify(controls));
  }, [controls]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FINDINGS, JSON.stringify(findings));
  }, [findings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(notificationRules));
  }, [notificationRules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(emailLogs));
  }, [emailLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(inAppNotifications));
  }, [inAppNotifications]);

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
  };

  // --- USER MANAGEMENT ACTIONS (SQLite Synced) ---
  const addUser = async (userData: {
    name: string;
    email: string;
    roleId: string;
    department?: string;
    title?: string;
    status?: string;
  }): Promise<UserProfile> => {
    const assignedRole = roles.find(r => r.id === userData.roleId);
    let newUser: UserProfile;

    try {
      newUser = await api.createUser(userData);
    } catch (e) {
      // Local fallback
      const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 3) || 'U';
      newUser = {
        id: `user-${Date.now().toString().slice(-6)}`,
        name: userData.name,
        email: userData.email,
        roleId: userData.roleId,
        role: assignedRole?.name || 'auditee',
        roleLabel: assignedRole?.label || 'User',
        department: userData.department || 'Internal Audit',
        title: userData.title || 'Compliance Analyst',
        initials,
        status: (userData.status as any) || 'active',
        createdAt: new Date().toISOString()
      };
    }

    setUsers(prev => [newUser, ...prev]);

    // Push audit notification
    dispatchEmailNotification(
      'finding_created',
      'User Account Created',
      `[Account Created] New AegisAudit User Provisioned: ${newUser.name}`,
      newUser.email,
      newUser.name,
      newUser.roleLabel,
      `<p>Your account has been provisioned with role <strong>${newUser.roleLabel}</strong> in SQLite.</p>`
    );

    return newUser;
  };

  const editUser = async (
    id: string,
    updates: {
      name?: string;
      email?: string;
      roleId?: string;
      department?: string;
      title?: string;
      status?: string;
    }
  ): Promise<UserProfile> => {
    const assignedRole = updates.roleId ? roles.find(r => r.id === updates.roleId) : undefined;
    let updatedUser: UserProfile;

    try {
      updatedUser = await api.updateUser(id, updates);
    } catch (e) {
      const existing = users.find(u => u.id === id);
      if (!existing) throw new Error('User not found');
      updatedUser = {
        ...existing,
        ...updates,
        role: assignedRole ? assignedRole.name : existing.role,
        roleLabel: assignedRole ? assignedRole.label : existing.roleLabel,
        initials: updates.name ? updates.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 3) : existing.initials,
        status: (updates.status as any) || existing.status
      };
    }

    setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));

    if (currentUser.id === id) {
      setCurrentUserState(updatedUser);
    }

    return updatedUser;
  };

  const removeUser = async (id: string): Promise<void> => {
    try {
      await api.deleteUser(id);
    } catch (e) {
      console.warn('API delete user error, removing locally:', e);
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser.id === id) {
      const remaining = users.filter(u => u.id !== id);
      if (remaining.length > 0) {
        setCurrentUserState(remaining[0]);
      }
    }
  };

  // --- ROLE MANAGEMENT ACTIONS (SQLite Synced) ---
  const addRole = async (roleData: {
    name: string;
    label: string;
    description?: string;
    permissions: string[];
  }): Promise<RoleDefinition> => {
    let newRole: RoleDefinition;
    try {
      newRole = await api.createRole(roleData);
    } catch (e) {
      newRole = {
        id: `role-${roleData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
        name: roleData.name,
        label: roleData.label,
        description: roleData.description || '',
        isSystem: false,
        permissions: roleData.permissions,
        userCount: 0,
        createdAt: new Date().toISOString()
      };
    }

    setRoles(prev => [...prev, newRole]);
    return newRole;
  };

  const editRole = async (
    id: string,
    updates: {
      label?: string;
      description?: string;
      permissions?: string[];
    }
  ): Promise<RoleDefinition> => {
    let updatedRole: RoleDefinition;
    try {
      updatedRole = await api.updateRole(id, updates);
    } catch (e) {
      const existing = roles.find(r => r.id === id);
      if (!existing) throw new Error('Role not found');
      updatedRole = {
        ...existing,
        label: updates.label !== undefined ? updates.label : existing.label,
        description: updates.description !== undefined ? updates.description : existing.description,
        permissions: updates.permissions !== undefined ? updates.permissions : existing.permissions
      };
    }

    setRoles(prev => prev.map(r => r.id === id ? updatedRole : r));

    // Update roleLabel for users holding this role
    if (updates.label) {
      setUsers(prev => prev.map(u => u.roleId === id ? { ...u, roleLabel: updates.label! } : u));
    }

    return updatedRole;
  };

  const removeRole = async (id: string): Promise<void> => {
    const target = roles.find(r => r.id === id);
    if (target?.isSystem) {
      throw new Error('System roles cannot be deleted');
    }

    const assignedCount = users.filter(u => u.roleId === id).length;
    if (assignedCount > 0) {
      throw new Error(`Cannot delete role: ${assignedCount} user(s) currently assigned. Reassign them first.`);
    }

    try {
      await api.deleteRole(id);
    } catch (e) {
      console.warn('API delete role error, removing locally:', e);
    }

    setRoles(prev => prev.filter(r => r.id !== id));
  };

  // --- REGULATORY FRAMEWORKS ACTIONS (SQLite Synced) ---
  const addFramework = async (data: {
    code: string;
    name: string;
    governingBody?: string;
    version?: string;
    cadence?: 'Annual' | 'Semi-annual' | 'Quarterly' | 'Continuous';
    description?: string;
    status?: 'active' | 'in_revision' | 'retired';
  }): Promise<FrameworkDefinition> => {
    let newFw: FrameworkDefinition;
    try {
      newFw = await api.createFramework(data);
    } catch (e: any) {
      console.warn('API create framework error, creating locally:', e);
      newFw = {
        id: `fw-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
        code: data.code.trim(),
        name: data.name.trim(),
        governingBody: data.governingBody || 'Independent Standards Organization',
        version: data.version || '1.0',
        cadence: data.cadence || 'Annual',
        description: data.description || '',
        status: data.status || 'active',
        auditCount: 0,
        findingCount: 0,
        createdAt: new Date().toISOString()
      };
    }

    setFrameworks(prev => [...prev, newFw]);
    return newFw;
  };

  const editFramework = async (
    id: string,
    updates: Partial<{
      code: string;
      name: string;
      governingBody: string;
      version: string;
      cadence: 'Annual' | 'Semi-annual' | 'Quarterly' | 'Continuous';
      description: string;
      status: 'active' | 'in_revision' | 'retired';
    }>
  ): Promise<FrameworkDefinition> => {
    let updatedFw: FrameworkDefinition;
    try {
      updatedFw = await api.updateFramework(id, updates);
    } catch (e: any) {
      console.warn('API update framework error, updating locally:', e);
      const existing = frameworks.find(f => f.id === id);
      if (!existing) throw new Error('Framework not found');
      updatedFw = {
        ...existing,
        ...updates
      };
    }

    setFrameworks(prev => prev.map(f => f.id === id ? updatedFw : f));
    return updatedFw;
  };

  const removeFramework = async (id: string): Promise<void> => {
    const existing = frameworks.find(f => f.id === id);
    if (!existing) return;

    // Check if audits use it
    const linkedAudits = audits.filter(a => a.framework === existing.code).length;
    if (linkedAudits > 0) {
      throw new Error(`Cannot delete framework "${existing.code}": ${linkedAudits} active audit(s) are bound to it.`);
    }

    try {
      await api.deleteFramework(id);
    } catch (e: any) {
      console.warn('API delete framework error, removing locally:', e);
    }

    setFrameworks(prev => prev.filter(f => f.id !== id));
  };

  // --- DEPARTMENTS & BUSINESS UNITS ACTIONS (SQLite Synced) ---
  const addDepartment = async (data: {
    code: string;
    name: string;
    headName?: string;
    headEmail?: string;
    riskTier?: 'High' | 'Medium' | 'Low';
    description?: string;
    status?: 'active' | 'restructuring' | 'inactive';
    employeeCount?: number;
  }): Promise<DepartmentDefinition> => {
    let newDept: DepartmentDefinition;
    try {
      newDept = await api.createDepartment(data);
    } catch (e: any) {
      console.warn('API create department error, creating locally:', e);
      newDept = {
        id: `dept-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
        code: data.code.trim(),
        name: data.name.trim(),
        headName: data.headName || 'Unassigned',
        headEmail: data.headEmail || '',
        riskTier: data.riskTier || 'Medium',
        description: data.description || '',
        status: data.status || 'active',
        employeeCount: data.employeeCount || 10,
        auditCount: 0,
        findingCount: 0,
        createdAt: new Date().toISOString()
      };
    }

    setDepartments(prev => [...prev, newDept]);
    return newDept;
  };

  const editDepartment = async (
    id: string,
    updates: Partial<{
      code: string;
      name: string;
      headName: string;
      headEmail: string;
      riskTier: 'High' | 'Medium' | 'Low';
      description: string;
      status: 'active' | 'restructuring' | 'inactive';
      employeeCount: number;
    }>
  ): Promise<DepartmentDefinition> => {
    let updatedDept: DepartmentDefinition;
    try {
      updatedDept = await api.updateDepartment(id, updates);
    } catch (e: any) {
      console.warn('API update department error, updating locally:', e);
      const existing = departments.find(d => d.id === id);
      if (!existing) throw new Error('Department not found');
      updatedDept = {
        ...existing,
        ...updates
      };
    }

    setDepartments(prev => prev.map(d => d.id === id ? updatedDept : d));
    return updatedDept;
  };

  const removeDepartment = async (id: string): Promise<void> => {
    const existing = departments.find(d => d.id === id);
    if (!existing) return;

    const linkedAudits = audits.filter(a => a.department === existing.name).length;
    if (linkedAudits > 0) {
      throw new Error(`Cannot delete department "${existing.name}": ${linkedAudits} active audit(s) are bound to it.`);
    }

    const linkedUsers = users.filter(u => u.department === existing.name).length;
    if (linkedUsers > 0) {
      throw new Error(`Cannot delete department "${existing.name}": ${linkedUsers} user(s) are assigned to it.`);
    }

    try {
      await api.deleteDepartment(id);
    } catch (e: any) {
      console.warn('API delete department error, removing locally:', e);
    }

    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  // Helper to recalculate Department Inherent Risk metrics in local state
  const recalculateDepartmentState = (deptIdOrName: string, currentRcmList: RiskControlMatrixItem[]) => {
    const list = currentRcmList.filter(r => r.departmentId === deptIdOrName || r.departmentName === deptIdOrName);
    
    if (list.length === 0) {
      setDepartments(prev => prev.map(d => {
        if (d.id === deptIdOrName || d.name === deptIdOrName) {
          return {
            ...d,
            inherentRiskScore: 0,
            rcmCount: 0,
            highRiskCount: 0,
            mediumRiskCount: 0,
            lowRiskCount: 0
          };
        }
        return d;
      }));
      return;
    }

    const scores = list.map(r => r.inherentRiskScore);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / list.length;
    const max = Math.max(...scores);
    const highCount = list.filter(r => r.inherentRiskTier === 'High').length;
    const medCount = list.filter(r => r.inherentRiskTier === 'Medium').length;
    const lowCount = list.filter(r => r.inherentRiskTier === 'Low').length;

    let calculatedTier: 'High' | 'Medium' | 'Low' = 'Medium';
    if (avg >= 14 || max >= 20) {
      calculatedTier = 'High';
    } else if (avg < 8 && max < 12) {
      calculatedTier = 'Low';
    }

    const roundedAvg = Math.round(avg * 10) / 10;

    setDepartments(prev => prev.map(d => {
      if (d.id === deptIdOrName || d.name === deptIdOrName) {
        return {
          ...d,
          riskTier: calculatedTier,
          inherentRiskScore: roundedAvg,
          rcmCount: list.length,
          highRiskCount: highCount,
          mediumRiskCount: medCount,
          lowRiskCount: lowCount
        };
      }
      return d;
    }));
  };

  const getDepartmentRcmItems = (deptIdOrName: string): RiskControlMatrixItem[] => {
    return rcmItems.filter(r => r.departmentId === deptIdOrName || r.departmentName === deptIdOrName);
  };

  const getDepartmentInherentRisk = (deptIdOrName: string) => {
    const list = getDepartmentRcmItems(deptIdOrName);
    if (list.length === 0) {
      const dept = departments.find(d => d.id === deptIdOrName || d.name === deptIdOrName);
      return {
        score: dept?.inherentRiskScore || 0,
        tier: dept?.riskTier || 'Medium',
        count: 0,
        highCount: 0,
        medCount: 0,
        lowCount: 0,
        avgLikelihood: 0,
        avgImpact: 0
      };
    }

    const scores = list.map(r => r.inherentRiskScore);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / list.length;
    const max = Math.max(...scores);
    const highCount = list.filter(r => r.inherentRiskTier === 'High').length;
    const medCount = list.filter(r => r.inherentRiskTier === 'Medium').length;
    const lowCount = list.filter(r => r.inherentRiskTier === 'Low').length;
    const avgL = Math.round((list.reduce((a, b) => a + b.inherentLikelihood, 0) / list.length) * 10) / 10;
    const avgI = Math.round((list.reduce((a, b) => a + b.inherentImpact, 0) / list.length) * 10) / 10;

    let calculatedTier: 'High' | 'Medium' | 'Low' = 'Medium';
    if (avg >= 14 || max >= 20) {
      calculatedTier = 'High';
    } else if (avg < 8 && max < 12) {
      calculatedTier = 'Low';
    }

    return {
      score: Math.round(avg * 10) / 10,
      tier: calculatedTier,
      count: list.length,
      highCount,
      medCount,
      lowCount,
      avgLikelihood: avgL,
      avgImpact: avgI
    };
  };

  const addRcmItem = async (data: Partial<RiskControlMatrixItem>): Promise<RiskControlMatrixItem> => {
    let createdItem: RiskControlMatrixItem;
    try {
      const res = await api.createRcmItem(data);
      createdItem = res.rcmItem;
      if (res.department) {
        setDepartments(prev => prev.map(d => d.id === res.department!.id ? {
          ...d,
          riskTier: res.department!.riskTier,
          inherentRiskScore: res.department!.inherentRiskScore
        } : d));
      }
    } catch (e) {
      console.warn('API create RCM item error, creating locally:', e);
      const l = Math.min(5, Math.max(1, Number(data.inherentLikelihood) || 3));
      const i = Math.min(5, Math.max(1, Number(data.inherentImpact) || 3));
      const score = l * i;
      const tier = score >= 15 ? 'High' : score >= 8 ? 'Medium' : 'Low';
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      createdItem = {
        id: `rcm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        departmentId: data.departmentId || '',
        departmentCode: data.departmentCode || '',
        departmentName: data.departmentName || '',
        process: data.process || '',
        subProcess: data.subProcess || '',
        riskRefCode: data.riskRefCode || `RCM-GEN-${Date.now().toString().slice(-3)}`,
        riskDescription: data.riskDescription || '',
        riskCategory: data.riskCategory || 'Operational',
        riskEvent: data.riskEvent || '',
        inherentLikelihood: l,
        inherentImpact: i,
        inherentRiskScore: score,
        inherentRiskTier: tier,
        controlRefCode: data.controlRefCode || '',
        controlName: data.controlName || '',
        controlDescription: data.controlDescription || '',
        controlType: data.controlType || 'Preventive',
        controlMethod: data.controlMethod || 'Automated',
        controlFrequency: data.controlFrequency || 'Continuous',
        controlOwner: data.controlOwner || 'Operations Lead',
        controlEffectiveness: data.controlEffectiveness || 'Effective',
        residualRiskScore: data.residualRiskScore !== undefined ? Number(data.residualRiskScore) : Math.max(1, Math.round(score * 0.3)),
        residualRiskTier: data.residualRiskTier || (score >= 15 ? 'Medium' : 'Low'),
        notes: data.notes || '',
        createdAt: now,
        updatedAt: now
      };
    }

    setRcmItems(prev => {
      const next = [createdItem, ...prev];
      recalculateDepartmentState(createdItem.departmentId, next);
      return next;
    });

    return createdItem;
  };

  const editRcmItem = async (id: string, updates: Partial<RiskControlMatrixItem>): Promise<RiskControlMatrixItem> => {
    let updatedItem: RiskControlMatrixItem;
    try {
      updatedItem = await api.updateRcmItem(id, updates);
    } catch (e) {
      console.warn('API update RCM item error, updating locally:', e);
      const existing = rcmItems.find(r => r.id === id);
      if (!existing) throw new Error('RCM item not found');

      const l = updates.inherentLikelihood !== undefined ? Math.min(5, Math.max(1, Number(updates.inherentLikelihood))) : existing.inherentLikelihood;
      const i = updates.inherentImpact !== undefined ? Math.min(5, Math.max(1, Number(updates.inherentImpact))) : existing.inherentImpact;
      const score = l * i;
      const tier = score >= 15 ? 'High' : score >= 8 ? 'Medium' : 'Low';
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      updatedItem = {
        ...existing,
        ...updates,
        inherentLikelihood: l,
        inherentImpact: i,
        inherentRiskScore: score,
        inherentRiskTier: tier,
        updatedAt: now
      };
    }

    setRcmItems(prev => {
      const next = prev.map(r => r.id === id ? updatedItem : r);
      recalculateDepartmentState(updatedItem.departmentId, next);
      return next;
    });

    return updatedItem;
  };

  const removeRcmItem = async (id: string): Promise<void> => {
    const existing = rcmItems.find(r => r.id === id);
    if (!existing) return;

    try {
      await api.deleteRcmItem(id);
    } catch (e) {
      console.warn('API delete RCM item error, removing locally:', e);
    }

    setRcmItems(prev => {
      const next = prev.filter(r => r.id !== id);
      recalculateDepartmentState(existing.departmentId, next);
      return next;
    });
  };

  // Helper to dispatch email notification
  const dispatchEmailNotification = (
    triggerEvent: NotificationRule['triggerEvent'],
    triggerLabel: string,
    subject: string,
    recipientEmail: string,
    recipientName: string,
    recipientRole: string,
    htmlContent: string,
    relatedFindingId?: string,
    relatedAuditId?: string
  ) => {
    // Check if rule is enabled
    const rule = notificationRules.find(r => r.triggerEvent === triggerEvent);
    if (rule && !rule.enabled) {
      return; // Rule disabled by config
    }

    const newLog: EmailDispatchLog = {
      id: `EML-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      recipientEmail,
      recipientName,
      recipientRole,
      triggerEvent,
      triggerLabel,
      subject,
      htmlContent,
      status: 'delivered',
      relatedFindingId,
      relatedAuditId
    };

    setEmailLogs(prev => [newLog, ...prev]);

    // Also push to in-app notifications
    const newInApp: InAppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: triggerLabel,
      message: subject,
      timestamp: 'Just now',
      read: false,
      type: triggerEvent.includes('overdue') || triggerEvent.includes('rejected') 
        ? 'alert' 
        : triggerEvent.includes('approved') 
        ? 'success' 
        : 'info',
      linkFindingId: relatedFindingId,
      linkAuditId: relatedAuditId
    };

    setInAppNotifications(prev => [newInApp, ...prev]);
  };

  // Workflow: update current stage
  const updateAuditStage = (auditId: string, newStage: AuditWorkflowStage) => {
    setAudits(prev => prev.map(a => {
      if (a.id !== auditId) return a;
      
      const updatedConfigs = { ...a.stageConfigs };
      
      // If newStage is enabled
      if (updatedConfigs[newStage]) {
        updatedConfigs[newStage] = {
          ...updatedConfigs[newStage],
          status: 'in_progress'
        };
      }

      // Mark previous stages as completed if they were in_progress
      const currentIdx = ALL_WORKFLOW_STAGES.indexOf(a.currentStage);
      const newIdx = ALL_WORKFLOW_STAGES.indexOf(newStage);
      
      if (newIdx > currentIdx && updatedConfigs[a.currentStage]) {
        updatedConfigs[a.currentStage] = {
          ...updatedConfigs[a.currentStage],
          status: 'completed',
          completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          completedBy: currentUser.name
        };
      }

      // Calculate progress based on completed enabled stages
      const enabledStages = Object.values(updatedConfigs).filter(c => c.enabled);
      const completedCount = enabledStages.filter(c => c.status === 'completed').length;
      const progressPct = Math.round((completedCount / (enabledStages.length || 1)) * 100);

      return {
        ...a,
        currentStage: newStage,
        stageConfigs: updatedConfigs,
        progress: Math.min(100, Math.max(progressPct, a.progress))
      };
    }));

    // Dispatch workflow transition notification
    const audit = audits.find(a => a.id === auditId);
    if (audit) {
      dispatchEmailNotification(
        'audit_stage_changed',
        `Workflow Advanced to ${newStage}`,
        `[Audit Workflow] ${audit.title} has progressed to ${newStage} stage`,
        'governance-stakeholders@aegisaudit.internal',
        'Audit Committee & Stakeholders',
        'Executive & Stakeholders',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0f172a; padding: 20px; color: white;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 600;">AegisAudit Workflow Notification</h2>
              <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Milestone Update</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
              <p style="font-size: 14px; margin-bottom: 12px;">The audit workflow has been advanced to <strong>${newStage}</strong> by ${currentUser.name} (${currentUser.roleLabel}).</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 16px;">
                <strong>${audit.title}</strong> (${audit.framework})<br/>
                Department: ${audit.department} · Current Stage: ${newStage}
              </div>
            </div>
          </div>
        `,
        undefined,
        audit.id
      );
    }
  };

  // Workflow: update stage configuration
  const updateAuditStageConfig = (
    auditId: string, 
    stage: AuditWorkflowStage, 
    updates: Partial<AuditStageConfiguration>
  ) => {
    setAudits(prev => prev.map(a => {
      if (a.id !== auditId) return a;
      return {
        ...a,
        stageConfigs: {
          ...a.stageConfigs,
          [stage]: {
            ...a.stageConfigs[stage],
            ...updates
          }
        }
      };
    }));
  };

  // Workflow: toggle stage enabled/disabled (per planning configuration)
  const toggleStageEnabled = (auditId: string, stage: AuditWorkflowStage) => {
    setAudits(prev => prev.map(a => {
      if (a.id !== auditId) return a;
      const currentConfig = a.stageConfigs[stage];
      const isEnabling = !currentConfig.enabled;
      
      const newConfigs = {
        ...a.stageConfigs,
        [stage]: {
          ...currentConfig,
          enabled: isEnabling,
          status: isEnabling ? (currentConfig.status === 'skipped' ? 'pending' : currentConfig.status) : 'skipped'
        }
      };

      let nextCurrentStage = a.currentStage;
      if (!isEnabling && a.currentStage === stage) {
        const remainingEnabled = ALL_WORKFLOW_STAGES.filter(s => s !== stage && newConfigs[s].enabled);
        if (remainingEnabled.length > 0) {
          nextCurrentStage = remainingEnabled[0];
        }
      }

      return {
        ...a,
        currentStage: nextCurrentStage,
        stageConfigs: newConfigs
      };
    }));
  };

  // Workflow: toggle checklist item in stage
  const toggleChecklistItem = (auditId: string, stage: AuditWorkflowStage, itemId: string) => {
    setAudits(prev => prev.map(a => {
      if (a.id !== auditId) return a;
      const stageConfig = a.stageConfigs[stage];
      const updatedChecklist = stageConfig.checklist.map(item => 
        item.id === itemId ? { ...item, done: !item.done } : item
      );

      const allDone = updatedChecklist.every(item => item.done);

      return {
        ...a,
        stageConfigs: {
          ...a.stageConfigs,
          [stage]: {
            ...stageConfig,
            checklist: updatedChecklist,
            status: allDone ? 'completed' : stageConfig.status === 'completed' ? 'in_progress' : stageConfig.status,
            completedAt: allDone ? new Date().toISOString().replace('T', ' ').substring(0, 19) : stageConfig.completedAt
          }
        }
      };
    }));
  };

  const createAudit = (auditData: Partial<Audit>, disabledStages: AuditWorkflowStage[] = []) => {
    const stageConfigs = createDefaultStageConfigs(disabledStages);
    const newId = `AUD-${new Date().getFullYear()}-${String(audits.length + 1).padStart(3, '0')}`;
    
    const firstEnabled = ALL_WORKFLOW_STAGES.find(s => stageConfigs[s].enabled) || 'Planning';
    stageConfigs[firstEnabled].status = 'in_progress';

    const newAudit: Audit = {
      id: newId,
      title: auditData.title || 'Untitled Compliance Audit',
      framework: auditData.framework || 'ISO 27001',
      department: auditData.department || 'Cloud Infrastructure',
      leadAuditorId: currentUser.id,
      leadAuditorName: currentUser.name,
      scope: auditData.scope || 'Full organizational compliance boundary.',
      startDate: auditData.startDate || new Date().toISOString().substring(0, 10),
      endDate: auditData.endDate || new Date(Date.now() + 60*24*60*60*1000).toISOString().substring(0, 10),
      currentStage: firstEnabled,
      stageConfigs,
      progress: 10,
      controlsCount: 0,
      findingsCount: 0
    };

    setAudits(prev => [newAudit, ...prev]);

    dispatchEmailNotification(
      'finding_created',
      'Audit Initiated & Scheduled',
      `[New Audit Scheduled] ${newAudit.title} (${newAudit.framework})`,
      'audit-team@aegisaudit.internal',
      'Audit & Engineering Leads',
      'Auditee & Auditor',
      `<p>A new audit program has been scheduled: <strong>${newAudit.title}</strong> (${newAudit.framework}).</p>`,
      undefined,
      newAudit.id
    );
  };

  const updateAudit = (auditId: string, updates: Partial<Audit>) => {
    setAudits(prev => prev.map(a => a.id === auditId ? { ...a, ...updates } : a));
  };

  // Controls: update status & testing
  const updateControlStatus = (controlId: string, status: ControlStatus, notes?: string) => {
    setControls(prev => prev.map(c => {
      if (c.id !== controlId) return c;
      return {
        ...c,
        status,
        testedBy: currentUser.name,
        testedAt: new Date().toISOString().substring(0, 10),
        notes: notes !== undefined ? notes : c.notes
      };
    }));
  };

  // Findings: create
  const createFinding = (findingData: Partial<Finding>): string => {
    const findingId = `F-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    
    const newFinding: Finding = {
      id: findingId,
      auditId: findingData.auditId || audits[0].id,
      auditTitle: findingData.auditTitle || audits[0].title,
      controlCode: findingData.controlCode || 'GEN-01',
      title: findingData.title || 'Untitled Compliance Finding',
      description: findingData.description || 'Non-compliance observation identified during fieldwork.',
      severity: findingData.severity || 'Medium',
      framework: findingData.framework || 'ISO 27001',
      department: findingData.department || 'Cloud Infrastructure',
      identifiedDate: new Date().toISOString().substring(0, 10),
      dueDate: findingData.dueDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().substring(0, 10),
      assignedOwnerId: findingData.assignedOwnerId || 'user-remediation-owner',
      assignedOwnerName: findingData.assignedOwnerName || 'Dev Patel',
      assignedOwnerEmail: findingData.assignedOwnerEmail || 'd.patel@aegisaudit.internal',
      status: 'Open',
      capa: {
        rootCause: '',
        correctiveAction: '',
        preventiveAction: '',
        targetDate: ''
      },
      evidence: [],
      remediationNotes: '',
      verification: {},
      history: [
        {
          id: `HIST-${Date.now()}`,
          action: 'Finding Logged & Assigned',
          actor: currentUser.name,
          actorRole: currentUser.roleLabel,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          comment: `Severity set to ${findingData.severity || 'Medium'}. Assigned to ${findingData.assignedOwnerName || 'Dev Patel'}.`
        }
      ]
    };

    setFindings(prev => [newFinding, ...prev]);

    setAudits(prev => prev.map(a => 
      a.id === newFinding.auditId ? { ...a, findingsCount: a.findingsCount + 1 } : a
    ));

    dispatchEmailNotification(
      'finding_created',
      'Compliance Finding Assigned',
      `[Action Required] New Finding Assigned: ${newFinding.id} - ${newFinding.title}`,
      newFinding.assignedOwnerEmail,
      newFinding.assignedOwnerName,
      'Remediation Owner',
      `<p>New finding assigned: <strong>${newFinding.title}</strong> (${newFinding.severity}). Due: ${newFinding.dueDate}.</p>`,
      newFinding.id,
      newFinding.auditId
    );

    return findingId;
  };

  // Findings: submit CAPA
  const updateFindingCAPA = (findingId: string, capa: CAPAPlan) => {
    setFindings(prev => prev.map(f => {
      if (f.id !== findingId) return f;
      const updatedHistory = [
        ...f.history,
        {
          id: `HIST-${Date.now()}`,
          action: 'CAPA Remediation Plan Submitted',
          actor: currentUser.name,
          actorRole: currentUser.roleLabel,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          comment: `Target completion set for ${capa.targetDate}. Root cause entered.`
        }
      ];

      return {
        ...f,
        status: 'Remediation Proposed',
        capa: {
          ...capa,
          submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          submittedBy: currentUser.name
        },
        history: updatedHistory
      };
    }));

    const finding = findings.find(f => f.id === findingId);
    if (finding) {
      dispatchEmailNotification(
        'capa_submitted',
        'CAPA Plan Submitted',
        `[CAPA Plan Submitted] ${finding.id}: ${finding.title}`,
        'm.vance@aegisaudit.internal',
        'Marcus Vance',
        'Lead Auditor',
        `<p>${currentUser.name} has submitted the CAPA plan for finding <strong>${finding.id}</strong>.</p>`,
        finding.id,
        finding.auditId
      );
    }
  };

  // Findings: add evidence
  const addFindingEvidence = (
    findingId: string, 
    evidence: Omit<RemediationEvidence, 'id' | 'uploadedAt' | 'uploadedBy'>
  ) => {
    const newEvidence: RemediationEvidence = {
      ...evidence,
      id: `EVD-${Math.floor(100 + Math.random() * 900)}`,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      uploadedBy: currentUser.name
    };

    setFindings(prev => prev.map(f => {
      if (f.id !== findingId) return f;
      return {
        ...f,
        evidence: [...f.evidence, newEvidence],
        history: [
          ...f.history,
          {
            id: `HIST-${Date.now()}`,
            action: 'Remediation Evidence Attached',
            actor: currentUser.name,
            actorRole: currentUser.roleLabel,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            comment: `Attached artifact: ${evidence.fileName} (${evidence.size})`
          }
        ]
      };
    }));
  };

  // Findings: request verification
  const requestVerification = (findingId: string, remarks?: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id !== findingId) return f;
      return {
        ...f,
        status: 'Verification Pending',
        remediationNotes: remarks || f.remediationNotes,
        history: [
          ...f.history,
          {
            id: `HIST-${Date.now()}`,
            action: 'Verification Requested by Auditee',
            actor: currentUser.name,
            actorRole: currentUser.roleLabel,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            comment: remarks || 'All corrective actions implemented and evidence provided.'
          }
        ]
      };
    }));

    const finding = findings.find(f => f.id === findingId);
    if (finding) {
      dispatchEmailNotification(
        'verification_requested',
        'Verification Sign-off Requested',
        `[Action Required] Verification Requested for ${finding.id} (${finding.severity})`,
        'm.vance@aegisaudit.internal',
        'Marcus Vance',
        'Lead Auditor',
        `<p>${currentUser.name} has requested closure verification for finding <strong>${finding.id}</strong>.</p>`,
        finding.id,
        finding.auditId
      );
    }
  };

  // Findings: auditor verify (approve or reject)
  const verifyFinding = (findingId: string, status: 'approved' | 'rejected', notes: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id !== findingId) return f;
      const isApproved = status === 'approved';
      return {
        ...f,
        status: isApproved ? 'Closed' : 'Open',
        verification: {
          verifiedBy: currentUser.name,
          verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status,
          notes,
          signOffTitle: currentUser.title
        },
        history: [
          ...f.history,
          {
            id: `HIST-${Date.now()}`,
            action: isApproved ? 'Remediation Verified & Finding Closed' : 'Remediation Rejected / Returned to Open',
            actor: currentUser.name,
            actorRole: currentUser.roleLabel,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            comment: notes
          }
        ]
      };
    }));

    const finding = findings.find(f => f.id === findingId);
    if (finding) {
      if (status === 'approved') {
        dispatchEmailNotification(
          'verification_approved',
          'Remediation Verified & Closed',
          `[Finding Closed] ${finding.id} has been formally verified and signed off`,
          finding.assignedOwnerEmail,
          finding.assignedOwnerName,
          'Remediation Owner',
          `<p>Lead Auditor ${currentUser.name} has approved remediation and marked <strong>${finding.id}</strong> as CLOSED.</p>`,
          finding.id,
          finding.auditId
        );
      } else {
        dispatchEmailNotification(
          'verification_rejected',
          'Remediation Verification Rejected',
          `[Action Required] Verification Rejected for ${finding.id}: Further Action Needed`,
          finding.assignedOwnerEmail,
          finding.assignedOwnerName,
          'Remediation Owner',
          `<p>Auditor ${currentUser.name} has reviewed the evidence for <strong>${finding.id}</strong> and returned it to OPEN status.</p>`,
          finding.id,
          finding.auditId
        );
      }
    }
  };

  const toggleNotificationRule = (ruleId: string) => {
    setNotificationRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const markNotificationAsRead = (id: string) => {
    setInAppNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllNotificationsAsRead = () => {
    setInAppNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetToSampleData = async () => {
    try {
      await api.resetSqliteDb();
    } catch (e) {
      console.warn('API reset failed, falling back to local reset:', e);
    }
    localStorage.clear();
    setRoles(INITIAL_ROLES);
    setUsers(INITIAL_USERS);
    setFrameworks(INITIAL_FRAMEWORKS);
    setDepartments(INITIAL_DEPARTMENTS);
    setRcmItems(INITIAL_RCM_ITEMS);
    setAudits(INITIAL_AUDITS);
    setControls(INITIAL_CONTROLS);
    setFindings(INITIAL_FINDINGS);
    setNotificationRules(INITIAL_NOTIFICATION_RULES);
    setEmailLogs(INITIAL_EMAIL_LOGS);
    setInAppNotifications(INITIAL_INAPP_NOTIFICATIONS);
    setCurrentUserState(INITIAL_USERS[0]);
  };

  return (
    <AuditContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        logout,
        users,
        roles,
        frameworks,
        departments,
        rcmItems,
        audits,
        controls,
        findings,
        notificationRules,
        emailLogs,
        inAppNotifications,
        sqliteStatus,
        addRcmItem,
        editRcmItem,
        removeRcmItem,
        getDepartmentRcmItems,
        getDepartmentInherentRisk,
        addFramework,
        editFramework,
        removeFramework,
        addDepartment,
        editDepartment,
        removeDepartment,
        addUser,
        editUser,
        removeUser,
        addRole,
        editRole,
        removeRole,
        updateAuditStage,
        updateAuditStageConfig,
        toggleStageEnabled,
        toggleChecklistItem,
        createAudit,
        updateAudit,
        updateControlStatus,
        createFinding,
        updateFindingCAPA,
        addFindingEvidence,
        requestVerification,
        verifyFinding,
        dispatchEmailNotification,
        toggleNotificationRule,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToSampleData
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = (): AuditContextType => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};
