import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getDatabase, saveDatabase, seedInitialData } from './src/server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize SQLite
  const db = await getDatabase();

  // Helper to run query and return array of objects
  const queryAll = (sql: string, params: any[] = []): any[] => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  };

  // Helper to run single query and return one object or null
  const queryOne = (sql: string, params: any[] = []): any | null => {
    const results = queryAll(sql, params);
    return results.length > 0 ? results[0] : null;
  };

  // --- API ROUTES ---

  // DB Stats
  app.get('/api/db/stats', (req, res) => {
    try {
      const userCount = queryOne('SELECT COUNT(*) as count FROM users')?.count || 0;
      const roleCount = queryOne('SELECT COUNT(*) as count FROM roles')?.count || 0;
      const auditCount = queryOne('SELECT COUNT(*) as count FROM audits')?.count || 0;
      const findingCount = queryOne('SELECT COUNT(*) as count FROM findings')?.count || 0;
      const frameworkCount = queryOne('SELECT COUNT(*) as count FROM frameworks')?.count || 0;
      const departmentCount = queryOne('SELECT COUNT(*) as count FROM departments')?.count || 0;
      const rcmCount = queryOne('SELECT COUNT(*) as count FROM risk_control_matrix')?.count || 0;

      res.json({
        engine: 'SQLite 3 (via WebAssembly sql.js)',
        status: 'online',
        tables: {
          users: userCount,
          roles: roleCount,
          audits: auditCount,
          findings: findingCount,
          frameworks: frameworkCount,
          departments: departmentCount,
          rcm: rcmCount
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // DB Reset
  app.post('/api/db/reset', (req, res) => {
    try {
      seedInitialData(db);
      saveDatabase();
      res.json({ message: 'SQLite database reset to initial seeds successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- ROLE MANAGEMENT ROUTES ---
  app.get('/api/roles', (req, res) => {
    try {
      const rows = queryAll(`
        SELECT r.*, COUNT(u.id) as user_count 
        FROM roles r 
        LEFT JOIN users u ON u.role_id = r.id 
        GROUP BY r.id
        ORDER BY r.is_system DESC, r.label ASC
      `);

      const roles = rows.map(r => ({
        id: r.id,
        name: r.name,
        label: r.label,
        description: r.description,
        isSystem: Boolean(r.is_system),
        permissions: JSON.parse(r.permissions || '[]'),
        userCount: r.user_count || 0,
        createdAt: r.created_at
      }));

      res.json(roles);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/roles', (req, res) => {
    try {
      const { name, label, description, permissions } = req.body;
      if (!name || !label) {
        return res.status(400).json({ error: 'Role name and label are required' });
      }

      const id = `role-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
      const permissionsJson = JSON.stringify(permissions || []);
      const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

      db.run(
        `INSERT INTO roles (id, name, label, description, is_system, permissions, created_at)
         VALUES (?, ?, ?, ?, 0, ?, ?)`,
        [id, name, label, description || '', permissionsJson, createdAt]
      );
      saveDatabase();

      res.status(201).json({
        id,
        name,
        label,
        description,
        isSystem: false,
        permissions: permissions || [],
        userCount: 0,
        createdAt
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/roles/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { label, description, permissions } = req.body;

      const existing = queryOne('SELECT * FROM roles WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'Role not found' });
      }

      const permissionsJson = permissions ? JSON.stringify(permissions) : existing.permissions;
      const newLabel = label !== undefined ? label : existing.label;
      const newDesc = description !== undefined ? description : existing.description;

      db.run(
        `UPDATE roles SET label = ?, description = ?, permissions = ? WHERE id = ?`,
        [newLabel, newDesc, permissionsJson, id]
      );
      saveDatabase();

      res.json({
        id,
        name: existing.name,
        label: newLabel,
        description: newDesc,
        isSystem: Boolean(existing.is_system),
        permissions: JSON.parse(permissionsJson),
        createdAt: existing.created_at
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/roles/:id', (req, res) => {
    try {
      const { id } = req.params;
      const existing = queryOne('SELECT * FROM roles WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'Role not found' });
      }
      if (existing.is_system) {
        return res.status(400).json({ error: 'System roles cannot be deleted' });
      }

      // Check if users are assigned to this role
      const userCount = queryOne('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [id])?.count || 0;
      if (userCount > 0) {
        return res.status(400).json({
          error: `Cannot delete role: ${userCount} active user(s) are currently assigned to it. Reassign users first.`
        });
      }

      db.run('DELETE FROM roles WHERE id = ?', [id]);
      saveDatabase();
      res.json({ message: 'Role deleted successfully', id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- USER MANAGEMENT ROUTES ---
  app.get('/api/users', (req, res) => {
    try {
      const rows = queryAll(`
        SELECT u.*, r.label as role_label, r.name as role_name 
        FROM users u 
        LEFT JOIN roles r ON r.id = u.role_id 
        ORDER BY u.name ASC
      `);

      const users = rows.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        roleId: u.role_id,
        role: u.role_name,
        roleLabel: u.role_label || 'User',
        department: u.department,
        title: u.title,
        initials: u.initials,
        status: u.status,
        lastLoginAt: u.last_login_at,
        createdAt: u.created_at
      }));

      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/users', (req, res) => {
    try {
      const { name, email, roleId, department, title, status } = req.body;
      if (!name || !email || !roleId) {
        return res.status(400).json({ error: 'Name, email, and role are required' });
      }

      const existingUser = queryOne('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
      if (existingUser) {
        return res.status(400).json({ error: 'A user with this email address already exists' });
      }

      const id = `user-${Date.now().toString().slice(-6)}`;
      const initials = name
        .trim()
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 3) || 'U';

      const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

      db.run(
        `INSERT INTO users (id, name, email, role_id, department, title, initials, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          name.trim(),
          email.trim().toLowerCase(),
          roleId,
          department || 'Internal Audit',
          title || 'Compliance Analyst',
          initials,
          status || 'active',
          createdAt
        ]
      );
      saveDatabase();

      const role = queryOne('SELECT label, name FROM roles WHERE id = ?', [roleId]);

      res.status(201).json({
        id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        roleId,
        role: role?.name || 'auditee',
        roleLabel: role?.label || 'User',
        department: department || 'Internal Audit',
        title: title || 'Compliance Analyst',
        initials,
        status: status || 'active',
        createdAt
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/users/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, roleId, department, title, status } = req.body;

      const existing = queryOne('SELECT * FROM users WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check unique email if changed
      if (email && email.toLowerCase() !== existing.email.toLowerCase()) {
        const dup = queryOne('SELECT id FROM users WHERE email = ? AND id != ?', [email.toLowerCase(), id]);
        if (dup) {
          return res.status(400).json({ error: 'Another user with this email already exists' });
        }
      }

      const newName = name !== undefined ? name.trim() : existing.name;
      const newEmail = email !== undefined ? email.trim().toLowerCase() : existing.email;
      const newRoleId = roleId !== undefined ? roleId : existing.role_id;
      const newDept = department !== undefined ? department : existing.department;
      const newTitle = title !== undefined ? title : existing.title;
      const newStatus = status !== undefined ? status : existing.status;
      const newInitials = newName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);

      db.run(
        `UPDATE users 
         SET name = ?, email = ?, role_id = ?, department = ?, title = ?, initials = ?, status = ?
         WHERE id = ?`,
        [newName, newEmail, newRoleId, newDept, newTitle, newInitials, newStatus, id]
      );
      saveDatabase();

      const role = queryOne('SELECT label, name FROM roles WHERE id = ?', [newRoleId]);

      res.json({
        id,
        name: newName,
        email: newEmail,
        roleId: newRoleId,
        role: role?.name,
        roleLabel: role?.label,
        department: newDept,
        title: newTitle,
        initials: newInitials,
        status: newStatus,
        lastLoginAt: existing.last_login_at,
        createdAt: existing.created_at
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/users/:id', (req, res) => {
    try {
      const { id } = req.params;
      const existing = queryOne('SELECT * FROM users WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'User not found' });
      }

      db.run('DELETE FROM users WHERE id = ?', [id]);
      saveDatabase();
      res.json({ message: 'User deleted successfully', id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- REGULATORY FRAMEWORKS & STANDARDS ROUTES ---
  app.get('/api/frameworks', (req, res) => {
    try {
      const rows = queryAll(`
        SELECT f.*,
          (SELECT COUNT(*) FROM audits a WHERE a.framework = f.code) as audit_count,
          (SELECT COUNT(*) FROM findings fi WHERE fi.framework = f.code) as finding_count
        FROM frameworks f
        ORDER BY f.status ASC, f.name ASC
      `);

      const frameworks = rows.map(f => ({
        id: f.id,
        code: f.code,
        name: f.name,
        governingBody: f.governing_body,
        version: f.version,
        cadence: f.cadence,
        description: f.description || '',
        status: f.status,
        auditCount: f.audit_count || 0,
        findingCount: f.finding_count || 0,
        createdAt: f.created_at
      }));

      res.json(frameworks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/frameworks', (req, res) => {
    try {
      const { code, name, governingBody, version, cadence, description, status } = req.body;
      if (!code || !name) {
        return res.status(400).json({ error: 'Framework code and full name are required' });
      }

      const existing = queryOne('SELECT id FROM frameworks WHERE UPPER(code) = UPPER(?)', [code.trim()]);
      if (existing) {
        return res.status(400).json({ error: `Framework with code "${code.trim()}" already exists` });
      }

      const id = `fw-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
      const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

      db.run(
        `INSERT INTO frameworks (id, code, name, governing_body, version, cadence, description, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          code.trim(),
          name.trim(),
          governingBody ? governingBody.trim() : 'Independent Standards Organization',
          version ? version.trim() : '1.0',
          cadence || 'Annual',
          description ? description.trim() : '',
          status || 'active',
          createdAt
        ]
      );
      saveDatabase();

      res.status(201).json({
        id,
        code: code.trim(),
        name: name.trim(),
        governingBody: governingBody ? governingBody.trim() : 'Independent Standards Organization',
        version: version ? version.trim() : '1.0',
        cadence: cadence || 'Annual',
        description: description ? description.trim() : '',
        status: status || 'active',
        auditCount: 0,
        findingCount: 0,
        createdAt
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/frameworks/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { code, name, governingBody, version, cadence, description, status } = req.body;

      const existing = queryOne('SELECT * FROM frameworks WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'Framework not found' });
      }

      if (code && code.trim().toUpperCase() !== existing.code.toUpperCase()) {
        const dup = queryOne('SELECT id FROM frameworks WHERE UPPER(code) = UPPER(?) AND id != ?', [code.trim(), id]);
        if (dup) {
          return res.status(400).json({ error: `Another framework with code "${code.trim()}" already exists` });
        }
      }

      const newCode = code !== undefined ? code.trim() : existing.code;
      const newName = name !== undefined ? name.trim() : existing.name;
      const newGov = governingBody !== undefined ? governingBody.trim() : existing.governing_body;
      const newVer = version !== undefined ? version.trim() : existing.version;
      const newCadence = cadence !== undefined ? cadence : existing.cadence;
      const newDesc = description !== undefined ? description.trim() : existing.description;
      const newStatus = status !== undefined ? status : existing.status;

      db.run(
        `UPDATE frameworks 
         SET code = ?, name = ?, governing_body = ?, version = ?, cadence = ?, description = ?, status = ?
         WHERE id = ?`,
        [newCode, newName, newGov, newVer, newCadence, newDesc, newStatus, id]
      );
      saveDatabase();

      const auditCount = queryOne('SELECT COUNT(*) as count FROM audits WHERE framework = ?', [newCode])?.count || 0;
      const findingCount = queryOne('SELECT COUNT(*) as count FROM findings WHERE framework = ?', [newCode])?.count || 0;

      res.json({
        id,
        code: newCode,
        name: newName,
        governingBody: newGov,
        version: newVer,
        cadence: newCadence,
        description: newDesc,
        status: newStatus,
        auditCount,
        findingCount,
        createdAt: existing.created_at
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/frameworks/:id', (req, res) => {
    try {
      const { id } = req.params;
      const existing = queryOne('SELECT * FROM frameworks WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'Framework not found' });
      }

      // Check if audits are currently associated with this framework
      const auditCount = queryOne('SELECT COUNT(*) as count FROM audits WHERE framework = ?', [existing.code])?.count || 0;
      if (auditCount > 0) {
        return res.status(400).json({
          error: `Cannot delete framework "${existing.code}": ${auditCount} active audit engagement(s) are bound to it. Reassign or archive the audits first.`
        });
      }

      db.run('DELETE FROM frameworks WHERE id = ?', [id]);
      saveDatabase();
      res.json({ message: 'Framework standard removed successfully', id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- DEPARTMENTS & BUSINESS UNITS ROUTES ---
  app.get('/api/departments', (req, res) => {
    try {
      const rows = queryAll(`
        SELECT d.*,
          (SELECT COUNT(*) FROM audits a WHERE a.department = d.name) as audit_count,
          (SELECT COUNT(*) FROM findings fi WHERE fi.department = d.name) as finding_count,
          (SELECT COUNT(*) FROM users u WHERE u.department = d.name) as assigned_user_count,
          (SELECT COUNT(*) FROM risk_control_matrix r WHERE r.department_id = d.id OR r.department_name = d.name) as rcm_count,
          (SELECT AVG(inherent_risk_score) FROM risk_control_matrix r WHERE r.department_id = d.id OR r.department_name = d.name) as rcm_avg_score,
          (SELECT COUNT(*) FROM risk_control_matrix r WHERE (r.department_id = d.id OR r.department_name = d.name) AND r.inherent_risk_tier = 'High') as high_risk_count,
          (SELECT COUNT(*) FROM risk_control_matrix r WHERE (r.department_id = d.id OR r.department_name = d.name) AND r.inherent_risk_tier = 'Medium') as med_risk_count,
          (SELECT COUNT(*) FROM risk_control_matrix r WHERE (r.department_id = d.id OR r.department_name = d.name) AND r.inherent_risk_tier = 'Low') as low_risk_count
        FROM departments d
        ORDER BY d.name ASC
      `);

      const departments = rows.map(d => {
        const rawScore = d.rcm_avg_score !== null && d.rcm_avg_score !== undefined
          ? Math.round(Number(d.rcm_avg_score) * 10) / 10
          : (d.inherent_risk_score || 0);

        return {
          id: d.id,
          code: d.code,
          name: d.name,
          headName: d.head_name,
          headEmail: d.head_email,
          riskTier: d.risk_tier,
          inherentRiskScore: rawScore,
          rcmCount: d.rcm_count || 0,
          highRiskCount: d.high_risk_count || 0,
          mediumRiskCount: d.med_risk_count || 0,
          lowRiskCount: d.low_risk_count || 0,
          description: d.description || '',
          status: d.status,
          employeeCount: d.employee_count || d.assigned_user_count || 0,
          auditCount: d.audit_count || 0,
          findingCount: d.finding_count || 0,
          createdAt: d.created_at
        };
      });

      res.json(departments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/departments', (req, res) => {
    try {
      const { code, name, headName, headEmail, riskTier, description, status, employeeCount } = req.body;
      if (!code || !name) {
        return res.status(400).json({ error: 'Department code and name are required' });
      }

      const existing = queryOne('SELECT id FROM departments WHERE UPPER(code) = UPPER(?) OR UPPER(name) = UPPER(?)', [
        code.trim(),
        name.trim()
      ]);
      if (existing) {
        return res.status(400).json({ error: 'A department with this code or name already exists' });
      }

      const id = `dept-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
      const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

      db.run(
        `INSERT INTO departments (id, code, name, head_name, head_email, risk_tier, description, status, employee_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          code.trim(),
          name.trim(),
          headName ? headName.trim() : 'Unassigned',
          headEmail ? headEmail.trim().toLowerCase() : '',
          riskTier || 'Medium',
          description ? description.trim() : '',
          status || 'active',
          Number(employeeCount) || 10,
          createdAt
        ]
      );
      saveDatabase();

      res.status(201).json({
        id,
        code: code.trim(),
        name: name.trim(),
        headName: headName ? headName.trim() : 'Unassigned',
        headEmail: headEmail ? headEmail.trim().toLowerCase() : '',
        riskTier: riskTier || 'Medium',
        description: description ? description.trim() : '',
        status: status || 'active',
        employeeCount: Number(employeeCount) || 10,
        auditCount: 0,
        findingCount: 0,
        createdAt
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/departments/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { code, name, headName, headEmail, riskTier, description, status, employeeCount } = req.body;

      const existing = queryOne('SELECT * FROM departments WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'Department not found' });
      }

      if (code && code.trim().toUpperCase() !== existing.code.toUpperCase()) {
        const dup = queryOne('SELECT id FROM departments WHERE UPPER(code) = UPPER(?) AND id != ?', [code.trim(), id]);
        if (dup) {
          return res.status(400).json({ error: `Another department with code "${code.trim()}" already exists` });
        }
      }

      const newCode = code !== undefined ? code.trim() : existing.code;
      const newName = name !== undefined ? name.trim() : existing.name;
      const newHeadName = headName !== undefined ? headName.trim() : existing.head_name;
      const newHeadEmail = headEmail !== undefined ? headEmail.trim().toLowerCase() : existing.head_email;
      const newRisk = riskTier !== undefined ? riskTier : existing.risk_tier;
      const newDesc = description !== undefined ? description.trim() : existing.description;
      const newStatus = status !== undefined ? status : existing.status;
      const newEmpCount = employeeCount !== undefined ? Number(employeeCount) : existing.employee_count;

      db.run(
        `UPDATE departments 
         SET code = ?, name = ?, head_name = ?, head_email = ?, risk_tier = ?, description = ?, status = ?, employee_count = ?
         WHERE id = ?`,
        [newCode, newName, newHeadName, newHeadEmail, newRisk, newDesc, newStatus, newEmpCount, id]
      );
      saveDatabase();

      const auditCount = queryOne('SELECT COUNT(*) as count FROM audits WHERE department = ?', [newName])?.count || 0;
      const findingCount = queryOne('SELECT COUNT(*) as count FROM findings WHERE department = ?', [newName])?.count || 0;

      res.json({
        id,
        code: newCode,
        name: newName,
        headName: newHeadName,
        headEmail: newHeadEmail,
        riskTier: newRisk,
        description: newDesc,
        status: newStatus,
        employeeCount: newEmpCount,
        auditCount,
        findingCount,
        createdAt: existing.created_at
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/departments/:id', (req, res) => {
    try {
      const { id } = req.params;
      const existing = queryOne('SELECT * FROM departments WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'Department not found' });
      }

      const auditCount = queryOne('SELECT COUNT(*) as count FROM audits WHERE department = ?', [existing.name])?.count || 0;
      if (auditCount > 0) {
        return res.status(400).json({
          error: `Cannot delete business unit "${existing.name}": ${auditCount} active audit program(s) are bound to it. Reassign audits first.`
        });
      }

      const userCount = queryOne('SELECT COUNT(*) as count FROM users WHERE department = ?', [existing.name])?.count || 0;
      if (userCount > 0) {
        return res.status(400).json({
          error: `Cannot delete business unit "${existing.name}": ${userCount} active employee account(s) are assigned to it.`
        });
      }

      db.run('DELETE FROM departments WHERE id = ?', [id]);
      saveDatabase();
      res.json({ message: 'Department/Business Unit deleted successfully', id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Helper to recalculate Department Inherent Risk Score and Tier from RCM items
  function recalculateDepartmentRiskTier(deptIdOrName: string) {
    try {
      const dept = queryOne('SELECT id, name FROM departments WHERE id = ? OR name = ?', [deptIdOrName, deptIdOrName]);
      if (!dept) return;

      const rcmRows = queryAll(
        'SELECT inherent_risk_score FROM risk_control_matrix WHERE department_id = ? OR department_name = ?',
        [dept.id, dept.name]
      );

      if (rcmRows.length === 0) {
        db.run('UPDATE departments SET inherent_risk_score = 0.0 WHERE id = ?', [dept.id]);
        saveDatabase();
        return;
      }

      const scores = rcmRows.map(r => Number(r.inherent_risk_score) || 0);
      const sum = scores.reduce((a, b) => a + b, 0);
      const avg = sum / scores.length;
      const max = Math.max(...scores);

      let calculatedTier: 'High' | 'Medium' | 'Low' = 'Medium';
      if (avg >= 14 || max >= 20) {
        calculatedTier = 'High';
      } else if (avg < 8 && max < 12) {
        calculatedTier = 'Low';
      }

      const roundedAvg = Math.round(avg * 10) / 10;
      db.run(
        'UPDATE departments SET risk_tier = ?, inherent_risk_score = ? WHERE id = ?',
        [calculatedTier, roundedAvg, dept.id]
      );
      saveDatabase();
    } catch (err) {
      console.warn('Error recalculating department risk tier:', err);
    }
  }

  // --- RISK CONTROL MATRIX (RCM) & INHERENT RISK WORKING PAPER ROUTES ---
  app.get('/api/rcm', (req, res) => {
    try {
      const { departmentId, departmentName } = req.query;
      let sql = 'SELECT * FROM risk_control_matrix';
      const params: any[] = [];

      if (departmentId || departmentName) {
        sql += ' WHERE department_id = ? OR department_name = ?';
        params.push(departmentId || '', departmentName || '');
      }

      sql += ' ORDER BY inherent_risk_score DESC, risk_ref_code ASC';

      const rows = queryAll(sql, params);
      const items = rows.map(r => ({
        id: r.id,
        departmentId: r.department_id,
        departmentCode: r.department_code || '',
        departmentName: r.department_name,
        process: r.process,
        subProcess: r.sub_process,
        riskRefCode: r.risk_ref_code,
        riskDescription: r.risk_description,
        riskCategory: r.risk_category,
        riskEvent: r.risk_event || '',
        inherentLikelihood: Number(r.inherent_likelihood) || 1,
        inherentImpact: Number(r.inherent_impact) || 1,
        inherentRiskScore: Number(r.inherent_risk_score) || 1,
        inherentRiskTier: r.inherent_risk_tier,
        controlRefCode: r.control_ref_code || '',
        controlName: r.control_name,
        controlDescription: r.control_description,
        controlType: r.control_type,
        controlMethod: r.control_method,
        controlFrequency: r.control_frequency,
        controlOwner: r.control_owner,
        controlEffectiveness: r.control_effectiveness,
        residualRiskScore: r.residual_risk_score !== null ? Number(r.residual_risk_score) : undefined,
        residualRiskTier: r.residual_risk_tier || 'Low',
        notes: r.notes || '',
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/rcm', (req, res) => {
    try {
      const {
        departmentId,
        departmentCode,
        departmentName,
        process,
        subProcess,
        riskRefCode,
        riskDescription,
        riskCategory,
        riskEvent,
        inherentLikelihood,
        inherentImpact,
        controlRefCode,
        controlName,
        controlDescription,
        controlType,
        controlMethod,
        controlFrequency,
        controlOwner,
        controlEffectiveness,
        residualRiskScore,
        residualRiskTier,
        notes
      } = req.body;

      if (!departmentId || !departmentName || !process || !riskDescription || !controlName) {
        return res.status(400).json({ error: 'Department, Process, Risk Description, and Control Name are required.' });
      }

      const l = Math.min(5, Math.max(1, Number(inherentLikelihood) || 3));
      const i = Math.min(5, Math.max(1, Number(inherentImpact) || 3));
      const score = l * i;
      const tier = score >= 15 ? 'High' : score >= 8 ? 'Medium' : 'Low';

      const id = `rcm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const refCode = riskRefCode ? riskRefCode.trim().toUpperCase() : `RCM-${(departmentCode || 'GEN').replace(/[^A-Z0-9]/g, '').slice(0, 5)}-${Date.now().toString().slice(-3)}`;

      db.run(
        `INSERT INTO risk_control_matrix (
          id, department_id, department_code, department_name,
          process, sub_process, risk_ref_code, risk_description,
          risk_category, risk_event, inherent_likelihood, inherent_impact,
          inherent_risk_score, inherent_risk_tier, control_ref_code,
          control_name, control_description, control_type, control_method,
          control_frequency, control_owner, control_effectiveness,
          residual_risk_score, residual_risk_tier, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          departmentId,
          departmentCode || '',
          departmentName.trim(),
          process.trim(),
          subProcess ? subProcess.trim() : '',
          refCode,
          riskDescription.trim(),
          riskCategory || 'Operational',
          riskEvent ? riskEvent.trim() : '',
          l,
          i,
          score,
          tier,
          controlRefCode ? controlRefCode.trim().toUpperCase() : '',
          controlName.trim(),
          controlDescription ? controlDescription.trim() : '',
          controlType || 'Preventive',
          controlMethod || 'Automated',
          controlFrequency || 'Continuous',
          controlOwner ? controlOwner.trim() : 'Operations Lead',
          controlEffectiveness || 'Effective',
          residualRiskScore !== undefined ? Number(residualRiskScore) : Math.max(1, Math.round(score * 0.3)),
          residualRiskTier || (score >= 15 ? 'Medium' : 'Low'),
          notes ? notes.trim() : '',
          now,
          now
        ]
      );
      saveDatabase();

      recalculateDepartmentRiskTier(departmentId);

      const updatedDept = queryOne('SELECT * FROM departments WHERE id = ?', [departmentId]);

      res.status(201).json({
        rcmItem: {
          id,
          departmentId,
          departmentCode: departmentCode || '',
          departmentName: departmentName.trim(),
          process: process.trim(),
          subProcess: subProcess ? subProcess.trim() : '',
          riskRefCode: refCode,
          riskDescription: riskDescription.trim(),
          riskCategory: riskCategory || 'Operational',
          riskEvent: riskEvent ? riskEvent.trim() : '',
          inherentLikelihood: l,
          inherentImpact: i,
          inherentRiskScore: score,
          inherentRiskTier: tier,
          controlRefCode: controlRefCode || '',
          controlName: controlName.trim(),
          controlDescription: controlDescription ? controlDescription.trim() : '',
          controlType: controlType || 'Preventive',
          controlMethod: controlMethod || 'Automated',
          controlFrequency: controlFrequency || 'Continuous',
          controlOwner: controlOwner ? controlOwner.trim() : 'Operations Lead',
          controlEffectiveness: controlEffectiveness || 'Effective',
          residualRiskScore: residualRiskScore !== undefined ? Number(residualRiskScore) : Math.max(1, Math.round(score * 0.3)),
          residualRiskTier: residualRiskTier || (score >= 15 ? 'Medium' : 'Low'),
          notes: notes ? notes.trim() : '',
          createdAt: now,
          updatedAt: now
        },
        department: updatedDept ? {
          id: updatedDept.id,
          name: updatedDept.name,
          riskTier: updatedDept.risk_tier,
          inherentRiskScore: updatedDept.inherent_risk_score
        } : null
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/rcm/:id', (req, res) => {
    try {
      const { id } = req.params;
      const existing = queryOne('SELECT * FROM risk_control_matrix WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'RCM item not found' });
      }

      const body = req.body;
      const l = body.inherentLikelihood !== undefined ? Math.min(5, Math.max(1, Number(body.inherentLikelihood))) : existing.inherent_likelihood;
      const i = body.inherentImpact !== undefined ? Math.min(5, Math.max(1, Number(body.inherentImpact))) : existing.inherent_impact;
      const score = l * i;
      const tier = score >= 15 ? 'High' : score >= 8 ? 'Medium' : 'Low';
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const newDeptId = body.departmentId || existing.department_id;
      const newDeptCode = body.departmentCode !== undefined ? body.departmentCode : existing.department_code;
      const newDeptName = body.departmentName !== undefined ? body.departmentName : existing.department_name;
      const newProcess = body.process !== undefined ? body.process : existing.process;
      const newSubProcess = body.subProcess !== undefined ? body.subProcess : existing.sub_process;
      const newRiskCode = body.riskRefCode !== undefined ? body.riskRefCode : existing.risk_ref_code;
      const newRiskDesc = body.riskDescription !== undefined ? body.riskDescription : existing.risk_description;
      const newCategory = body.riskCategory !== undefined ? body.riskCategory : existing.risk_category;
      const newEvent = body.riskEvent !== undefined ? body.riskEvent : existing.risk_event;
      const newCtrlCode = body.controlRefCode !== undefined ? body.controlRefCode : existing.control_ref_code;
      const newCtrlName = body.controlName !== undefined ? body.controlName : existing.control_name;
      const newCtrlDesc = body.controlDescription !== undefined ? body.controlDescription : existing.control_description;
      const newCtrlType = body.controlType !== undefined ? body.controlType : existing.control_type;
      const newCtrlMethod = body.controlMethod !== undefined ? body.controlMethod : existing.control_method;
      const newCtrlFreq = body.controlFrequency !== undefined ? body.controlFrequency : existing.control_frequency;
      const newCtrlOwner = body.controlOwner !== undefined ? body.controlOwner : existing.control_owner;
      const newCtrlEff = body.controlEffectiveness !== undefined ? body.controlEffectiveness : existing.control_effectiveness;
      const newResScore = body.residualRiskScore !== undefined ? Number(body.residualRiskScore) : existing.residual_risk_score;
      const newResTier = body.residualRiskTier !== undefined ? body.residualRiskTier : existing.residual_risk_tier;
      const newNotes = body.notes !== undefined ? body.notes : existing.notes;

      db.run(
        `UPDATE risk_control_matrix SET
          department_id = ?, department_code = ?, department_name = ?,
          process = ?, sub_process = ?, risk_ref_code = ?, risk_description = ?,
          risk_category = ?, risk_event = ?, inherent_likelihood = ?, inherent_impact = ?,
          inherent_risk_score = ?, inherent_risk_tier = ?, control_ref_code = ?,
          control_name = ?, control_description = ?, control_type = ?, control_method = ?,
          control_frequency = ?, control_owner = ?, control_effectiveness = ?,
          residual_risk_score = ?, residual_risk_tier = ?, notes = ?, updated_at = ?
        WHERE id = ?`,
        [
          newDeptId, newDeptCode, newDeptName,
          newProcess, newSubProcess, newRiskCode, newRiskDesc,
          newCategory, newEvent, l, i,
          score, tier, newCtrlCode,
          newCtrlName, newCtrlDesc, newCtrlType, newCtrlMethod,
          newCtrlFreq, newCtrlOwner, newCtrlEff,
          newResScore, newResTier, newNotes, now,
          id
        ]
      );
      saveDatabase();

      recalculateDepartmentRiskTier(newDeptId);
      if (existing.department_id !== newDeptId) {
        recalculateDepartmentRiskTier(existing.department_id);
      }

      res.json({
        id,
        departmentId: newDeptId,
        departmentCode: newDeptCode,
        departmentName: newDeptName,
        process: newProcess,
        subProcess: newSubProcess,
        riskRefCode: newRiskCode,
        riskDescription: newRiskDesc,
        riskCategory: newCategory,
        riskEvent: newEvent,
        inherentLikelihood: l,
        inherentImpact: i,
        inherentRiskScore: score,
        inherentRiskTier: tier,
        controlRefCode: newCtrlCode,
        controlName: newCtrlName,
        controlDescription: newCtrlDesc,
        controlType: newCtrlType,
        controlMethod: newCtrlMethod,
        controlFrequency: newCtrlFreq,
        controlOwner: newCtrlOwner,
        controlEffectiveness: newCtrlEff,
        residualRiskScore: newResScore,
        residualRiskTier: newResTier,
        notes: newNotes,
        createdAt: existing.created_at,
        updatedAt: now
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/rcm/:id', (req, res) => {
    try {
      const { id } = req.params;
      const existing = queryOne('SELECT * FROM risk_control_matrix WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'RCM item not found' });
      }

      const deptId = existing.department_id;
      db.run('DELETE FROM risk_control_matrix WHERE id = ?', [id]);
      saveDatabase();

      recalculateDepartmentRiskTier(deptId);

      res.json({ message: 'Risk Control Matrix item deleted successfully', id, departmentId: deptId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mount Vite development server middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AegisAudit SQLite Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
