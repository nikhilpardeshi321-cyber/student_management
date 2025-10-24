const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Get all students with pagination
router.get('/students', studentController.getAllStudents);

// Get single student by ID with marks
router.get('/students/:id', studentController.getStudentById);

// Create new student
router.post('/students', studentController.createStudent);

// Update student
router.put('/students/:id', studentController.updateStudent);

// Delete student
router.delete('/students/:id', studentController.deleteStudent);

module.exports = router;
