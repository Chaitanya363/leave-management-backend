const db = require('../config/db');

exports.getDashboardStats = (req, res) => {
  const stats = {};

  const queries = {
    totalEmployees: 'SELECT COUNT(*) AS count FROM users',
    totalLeaves: 'SELECT COUNT(*) AS count FROM leave_requests',
    pendingLeaves:
      "SELECT COUNT(*) AS count FROM leave_requests WHERE status='PENDING'",
    approvedLeaves:
      "SELECT COUNT(*) AS count FROM leave_requests WHERE status='APPROVED'",
    rejectedLeaves:
      "SELECT COUNT(*) AS count FROM leave_requests WHERE status='REJECTED'"
  };

  db.query(queries.totalEmployees, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    stats.totalEmployees = result[0].count;

    db.query(queries.totalLeaves, (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      stats.totalLeaves = result[0].count;

      db.query(queries.pendingLeaves, (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        stats.pendingLeaves = result[0].count;

        db.query(queries.approvedLeaves, (err, result) => {
          if (err) return res.status(500).json({ message: err.message });
          stats.approvedLeaves = result[0].count;

          db.query(queries.rejectedLeaves, (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            stats.rejectedLeaves = result[0].count;

            res.json(stats);
          });
        });
      });
    });
  });
};