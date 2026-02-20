require('dotenv').config();
require('./config/db');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

const userRoutes = require('./routes/user.routes');
app.use('/api/user', userRoutes);

const leaveRoutes = require('./routes/leave.routes');
app.use('/api/leaves', leaveRoutes);

const dashboardRoutes = require('./routes/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

module.exports = app;