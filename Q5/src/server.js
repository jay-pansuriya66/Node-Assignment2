require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const Employee = require('./models/Employee');

const PORT = process.env.PORT || 4005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/q5_employee_site';

async function seedDefaultEmployee() {
  const count = await Employee.countDocuments();
  if (count === 0) {
    const emp = new Employee({
      name: 'John Doe',
      email: 'john@example.com',
      employeeId: 'E1001',
      department: 'Engineering',
      password: 'password123',
    });
    await emp.save();
    console.log('Seeded default employee: E1001 / password123');
  }
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    await seedDefaultEmployee();
    app.listen(PORT, () => console.log(`Q5 Employee app listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
