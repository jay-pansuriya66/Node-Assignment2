import { Router } from 'express';
import mongoose from 'mongoose';
import { Employee } from '../models/Employee.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendNewEmployeeEmail } from '../utils/email.js';

const router = Router();

// Index
router.get('/', requireAdmin, async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 });
  res.render('employees/index', { title: 'Employees', employees });
});

// New
router.get('/new', requireAdmin, (req, res) => {
  res.render('employees/new', { title: 'New Employee' });
});

// GET delete must be before generic GET '/:id'
router.get('/:id/delete', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    console.log('GET delete requested for', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid employee id');
      return res.redirect('/employees');
    }
    const result = await Employee.deleteOne({ _id: id });
    if (!result || result.deletedCount === 0) {
      req.flash('error', 'Employee not found');
    } else {
      req.flash('success', 'Employee deleted');
    }
    return res.redirect('/employees');
  } catch (e) {
    console.error('GET /employees/:id/delete error', e);
    req.flash('error', 'Delete failed');
    return res.redirect('/employees');
  }
});

// Create
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, email, role, baseSalary, allowances, deductions } = req.body;
    const emp = new Employee({ name, email, role, baseSalary, allowances, deductions });
    await emp.validate();
    const tempPassword = emp.tempPasswordRaw; // generated during validate
    await emp.save();

    // Send email with credentials
    try {
      await sendNewEmployeeEmail({
        to: emp.email,
        empId: emp.empId,
        password: tempPassword,
        name: emp.name,
      });
    } catch (mailErr) {
      console.error('Email error:', mailErr.message);
    }

    req.flash('success', `Employee ${emp.name} created`);
    res.redirect('/employees');
  } catch (e) {
    console.error(e);
    req.flash('error', 'Failed to create employee');
    res.redirect('/employees/new');
  }
});

// Show
router.get('/:id', requireAdmin, async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) return res.status(404).render('404', { title: 'Not Found' });
  res.render('employees/show', { title: 'Employee Details', emp });
});

// Edit
router.get('/:id/edit', requireAdmin, async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) return res.status(404).render('404', { title: 'Not Found' });
  res.render('employees/edit', { title: 'Edit Employee', emp });
});

// Update
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, role, baseSalary, allowances, deductions } = req.body;
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).render('404', { title: 'Not Found' });
    emp.name = name;
    emp.email = email;
    emp.role = role;
    emp.baseSalary = Number(baseSalary);
    emp.allowances = Number(allowances || 0);
    emp.deductions = Number(deductions || 0);
    emp.recalculate();
    await emp.save();
    req.flash('success', 'Employee updated');
    res.redirect('/employees');
  } catch (e) {
    console.error(e);
    req.flash('error', 'Failed to update employee');
    res.redirect(`/employees/${req.params.id}/edit`);
  }
});

// Delete
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    console.log('DELETE requested for', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid employee id');
      return res.redirect('/employees');
    }
    const result = await Employee.deleteOne({ _id: id });
    if (!result || result.deletedCount === 0) {
      req.flash('error', 'Employee not found');
    } else {
      req.flash('success', 'Employee deleted');
    }
    return res.redirect('/employees');
  } catch (e) {
    console.error('DELETE /employees/:id error', e);
    req.flash('error', 'Delete failed');
    return res.redirect('/employees');
  }
});

// Fallback delete via POST (no method override)
router.post('/:id/delete', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    console.log('POST delete requested for', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid employee id');
      return res.redirect('/employees');
    }
    const result = await Employee.deleteOne({ _id: id });
    if (!result || result.deletedCount === 0) {
      req.flash('error', 'Employee not found');
    } else {
      req.flash('success', 'Employee deleted');
    }
    return res.redirect('/employees');
  } catch (e) {
    console.error('POST /employees/:id/delete error', e);
    req.flash('error', 'Delete failed');
    return res.redirect('/employees');
  }
});

// (moved above)

export default router;
