import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { generateEmpId, generateTempPassword } from '../utils/generate.js';

const EmployeeSchema = new mongoose.Schema({
  empId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, default: 'Employee' },
  baseSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
  password: { type: String, required: true }, // stored hashed
  tempPasswordRaw: { type: String, select: false }, // transient, not persisted in responses
}, { timestamps: true });

EmployeeSchema.methods.recalculate = function () {
  this.netSalary = (this.baseSalary || 0) + (this.allowances || 0) - (this.deductions || 0);
};

EmployeeSchema.pre('validate', function (next) {
  if (!this.empId) this.empId = generateEmpId();
  if (!this.password) {
    const raw = generateTempPassword();
    this.tempPasswordRaw = raw;
    this.password = raw; // will be hashed in pre-save
  }
  this.recalculate();
  next();
});

EmployeeSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

export const Employee = mongoose.model('Employee', EmployeeSchema);
