const pool = require('../config/database');

// Get all students with pagination (includes average score directly)
exports.getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.age,
        s.created_at,
        s.updated_at,
        COALESCE(m.score, 0) AS average_score
      FROM students s
      LEFT JOIN marks m
        ON s.id = m.student_id AND m.subject = 'Average'
      ORDER BY s.id ASC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    const countResult = await pool.query('SELECT COUNT(*) FROM students');
    const totalRecords = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      success: true,
      data: result.rows,
      totalPages,
      totalRecords,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message,
    });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const marksResult = await pool.query(
      'SELECT subject, score FROM marks WHERE student_id = $1',
      [id]
    );

    const avgMark = marksResult.rows.find(m => m.subject === 'Average');
    const average_score = avgMark ? avgMark.score : 0;

    res.json({
      success: true,
      data: { ...studentResult.rows[0], average_score },
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message,
    });
  }
};

// Create new student (with average marks)
exports.createStudent = async (req, res) => {
  try {
    const { name, email, age, averageMarks } = req.body;

    if (!name || !email || !age) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and age',
      });
    }

    const emailCheck = await pool.query('SELECT * FROM students WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const studentInsert = await pool.query(
      'INSERT INTO students (name, email, age) VALUES ($1, $2, $3) RETURNING *',
      [name, email, age]
    );
    const newStudent = studentInsert.rows[0];

    if (averageMarks !== undefined && averageMarks !== null) {
      await pool.query(
        'INSERT INTO marks (student_id, subject, score) VALUES ($1, $2, $3)',
        [newStudent.id, 'Average', parseFloat(averageMarks)]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: newStudent,
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating student',
      error: error.message,
    });
  }
};

// Update student and their marks
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age, averageMarks } = req.body;

    const studentCheck = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const emailCheck = await pool.query(
      'SELECT * FROM students WHERE email = $1 AND id != $2',
      [email, id]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // First, update the student record
    const updatedStudent = await pool.query(
      `UPDATE students 
       SET name = $1, email = $2, age = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 RETURNING *`,
      [name, email, age, id]
    );

    // Delete all old marks for this student (cleanup)
    await pool.query('DELETE FROM marks WHERE student_id = $1', [id]);

    // Insert new marks if averageMarks is given
    if (averageMarks !== undefined && averageMarks !== null) {
      await pool.query(
        'INSERT INTO marks (student_id, subject, score) VALUES ($1, $2, $3)',
        [id, 'Average', parseFloat(averageMarks)]
      );
    }

    res.json({
      success: true,
      message: 'Student and marks updated successfully',
      data: updatedStudent.rows[0],
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message,
    });
  }
};

// Delete student and their marks
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Delete marks first to maintain integrity
    await pool.query('DELETE FROM marks WHERE student_id = $1', [id]);

    // Delete student record
    await pool.query('DELETE FROM students WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Student and associated marks deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message,
    });
  }
};
