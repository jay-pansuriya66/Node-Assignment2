import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
}

export async function sendNewEmployeeEmail({ to, empId, password, name }) {
  const transporter = getTransporter();
  const from = `ERP Admin <noreply@erp.local>`;
  const appUrl = process.env.APP_BASE_URL || 'http://localhost:3004';
  const html = `
    <p>Hello ${name || 'Employee'},</p>
    <p>Your employee account has been created.</p>
    <ul>
      <li><b>Employee ID:</b> ${empId}</li>
      <li><b>Temporary Password:</b> ${password}</li>
    </ul>
    <p>Login at <a href="${appUrl}">${appUrl}</a> and change your password in profile (feature not implemented in this demo).</p>
    <p>Regards,<br/>ERP Admin</p>
  `;
  await transporter.sendMail({ from, to, subject: 'Your Employee Account', html });
}
