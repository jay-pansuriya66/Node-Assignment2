export function generateEmpId() {
  const prefix = 'EMP';
  const rand = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `${prefix}${rand}`;
}

export function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 10; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}
