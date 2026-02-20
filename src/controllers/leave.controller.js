const db = require('../config/db');
const ExcelJS = require('exceljs');
const { sendLeaveStatusEmail } = require('../utils/mailer');

// APPLY LEAVE
exports.applyLeave = (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const { leave_type_id, start_date, end_date, reason } = req.body;

    if (!leave_type_id || !start_date || !end_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // basic date validation
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const sql = `
      INSERT INTO leave_requests 
      (user_id, leave_type_id, start_date, end_date, reason, status)
      VALUES (?, ?, ?, ?, ?, 'PENDING')
    `;

    db.query(
      sql,
      [userId, leave_type_id, start_date, end_date, reason],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }

        res.json({
          message: 'Leave applied successfully'
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY LEAVES
exports.getMyLeaves = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT lr.*, lt.name AS leave_type
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.user_id = ?
    ORDER BY lr.applied_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.json(results);
  });
};

// MANAGER: GET ALL LEAVE REQUESTS
exports.getAllLeaveRequests = (req, res) => {
  const sql = `
    SELECT lr.*, u.name AS employee_name, lt.name AS leave_type
    FROM leave_requests lr
    JOIN users u ON lr.user_id = u.id
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    ORDER BY lr.applied_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.json(results);
  });
};

// MANAGER: UPDATE LEAVE STATUS
exports.updateLeaveStatus = (req, res) => {
  const { leaveId } = req.params;
  const { status, manager_comment } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const sql = `
    UPDATE leave_requests
    SET status = ?, manager_comment = ?
    WHERE id = ?
  `;

db.query(sql, [status, manager_comment, leaveId], (err) => {
  if (err) {
    return res.status(500).json({ message: err.message });
  }

  // 🔥 SEND EMAIL TO EMPLOYEE
  const emailSql = `
    SELECT email FROM users
    WHERE id = (SELECT user_id FROM leave_requests WHERE id = ?)
  `;

  db.query(emailSql, [leaveId], async (emailErr, emailRes) => {
    if (!emailErr && emailRes.length) {
      try {
        await sendLeaveStatusEmail(emailRes[0].email, status);
      } catch (mailErr) {
        console.error('Email failed:', mailErr.message);
      }
    }
  });

  res.json({ message: `Leave ${status} successfully` });
});
};

// EXPORT LEAVES TO EXCEL
exports.exportLeaves = async (req, res) => {
  try {
    const sql = `
      SELECT 
        u.name AS employee_name,
        lt.name AS leave_type,
        lr.start_date,
        lr.end_date,
        lr.status,
        lr.manager_comment
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      ORDER BY lr.applied_at DESC
    `;

    db.query(sql, async (err, results) => {
      if (err) return res.status(500).json({ message: err.message });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Leaves');

      worksheet.columns = [
        { header: 'Employee', key: 'employee_name', width: 20 },
        { header: 'Leave Type', key: 'leave_type', width: 20 },
        { header: 'Start Date', key: 'start_date', width: 15 },
        { header: 'End Date', key: 'end_date', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Manager Comment', key: 'manager_comment', width: 25 }
      ];

      worksheet.addRows(results);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      res.setHeader(
        'Content-Disposition',
        'attachment; filename=leave_report.xlsx'
      );

      await workbook.xlsx.write(res);
      res.end();
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};