const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department_id } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      'INSERT INTO users (name, email, password, role, department_id) VALUES (?, ?, ?, ?, ?)';

    db.query(
      sql,
      [name, email, hashedPassword, role || 'EMPLOYEE', department_id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        res.json({ message: 'User registered successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // create JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
};