import { 
  UserProfile, 
  RoleDefinition, 
  FrameworkDefinition, 
  DepartmentDefinition,
  RiskControlMatrixItem
} from '../types/audit';

export async function fetchRoles(): Promise<RoleDefinition[]> {
  const res = await fetch('/api/roles');
  if (!res.ok) throw new Error('Failed to fetch roles from SQLite');
  return res.json();
}

export async function createRole(role: {
  name: string;
  label: string;
  description?: string;
  permissions: string[];
}): Promise<RoleDefinition> {
  const res = await fetch('/api/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create role in SQLite');
  }
  return res.json();
}

export async function updateRole(
  id: string,
  updates: {
    label?: string;
    description?: string;
    permissions?: string[];
  }
): Promise<RoleDefinition> {
  const res = await fetch(`/api/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update role in SQLite');
  }
  return res.json();
}

export async function deleteRole(id: string): Promise<void> {
  const res = await fetch(`/api/roles/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete role from SQLite');
  }
}

export async function fetchUsers(): Promise<UserProfile[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users from SQLite');
  return res.json();
}

export async function createUser(userData: {
  name: string;
  email: string;
  roleId: string;
  department?: string;
  title?: string;
  status?: string;
}): Promise<UserProfile> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create user in SQLite');
  }
  return res.json();
}

export async function updateUser(
  id: string,
  updates: {
    name?: string;
    email?: string;
    roleId?: string;
    department?: string;
    title?: string;
    status?: string;
  }
): Promise<UserProfile> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update user in SQLite');
  }
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete user from SQLite');
  }
}

export async function fetchDbStats(): Promise<any> {
  const res = await fetch('/api/db/stats');
  if (!res.ok) throw new Error('Failed to fetch SQLite stats');
  return res.json();
}

export async function resetSqliteDb(): Promise<void> {
  const res = await fetch('/api/db/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset SQLite database');
}

// --- FRAMEWORKS & REGULATORY STANDARDS ---
export async function fetchFrameworks(): Promise<FrameworkDefinition[]> {
  const res = await fetch('/api/frameworks');
  if (!res.ok) throw new Error('Failed to fetch regulatory frameworks from SQLite');
  return res.json();
}

export async function createFramework(fw: {
  code: string;
  name: string;
  governingBody?: string;
  version?: string;
  cadence?: 'Annual' | 'Semi-annual' | 'Quarterly' | 'Continuous';
  description?: string;
  status?: 'active' | 'in_revision' | 'retired';
}): Promise<FrameworkDefinition> {
  const res = await fetch('/api/frameworks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fw)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create regulatory framework in SQLite');
  }
  return res.json();
}

export async function updateFramework(
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
): Promise<FrameworkDefinition> {
  const res = await fetch(`/api/frameworks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update regulatory framework in SQLite');
  }
  return res.json();
}

export async function deleteFramework(id: string): Promise<void> {
  const res = await fetch(`/api/frameworks/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete regulatory framework from SQLite');
  }
}

// --- DEPARTMENTS & BUSINESS UNITS ---
export async function fetchDepartments(): Promise<DepartmentDefinition[]> {
  const res = await fetch('/api/departments');
  if (!res.ok) throw new Error('Failed to fetch business units from SQLite');
  return res.json();
}

export async function createDepartment(dept: {
  code: string;
  name: string;
  headName?: string;
  headEmail?: string;
  riskTier?: 'High' | 'Medium' | 'Low';
  description?: string;
  status?: 'active' | 'restructuring' | 'inactive';
  employeeCount?: number;
}): Promise<DepartmentDefinition> {
  const res = await fetch('/api/departments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dept)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create business unit in SQLite');
  }
  return res.json();
}

export async function updateDepartment(
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
): Promise<DepartmentDefinition> {
  const res = await fetch(`/api/departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update business unit in SQLite');
  }
  return res.json();
}

export async function deleteDepartment(id: string): Promise<void> {
  const res = await fetch(`/api/departments/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete business unit from SQLite');
  }
}

// --- RISK CONTROL MATRIX (RCM) & INHERENT RISK WORKING PAPERS ---
export async function fetchRcmItems(departmentId?: string, departmentName?: string): Promise<RiskControlMatrixItem[]> {
  const params = new URLSearchParams();
  if (departmentId) params.append('departmentId', departmentId);
  if (departmentName) params.append('departmentName', departmentName);
  const url = `/api/rcm${params.toString() ? '?' + params.toString() : ''}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch Risk Control Matrix items from SQLite');
  return res.json();
}

export async function createRcmItem(item: Partial<RiskControlMatrixItem>): Promise<{
  rcmItem: RiskControlMatrixItem;
  department: { id: string; name: string; riskTier: 'High' | 'Medium' | 'Low'; inherentRiskScore: number } | null;
}> {
  const res = await fetch('/api/rcm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create Risk Control Matrix entry in SQLite');
  }
  return res.json();
}

export async function updateRcmItem(id: string, updates: Partial<RiskControlMatrixItem>): Promise<RiskControlMatrixItem> {
  const res = await fetch(`/api/rcm/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update Risk Control Matrix item in SQLite');
  }
  return res.json();
}

export async function deleteRcmItem(id: string): Promise<{ message: string; id: string; departmentId: string }> {
  const res = await fetch(`/api/rcm/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete Risk Control Matrix item from SQLite');
  }
  return res.json();
}
