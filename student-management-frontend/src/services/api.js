import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const studentAPI = {
  // Get all students with pagination
  getAllStudents: (page = 1, limit = 10) => 
    api.get(`/students?page=${page}&limit=${limit}`),
  
  // Get single student by ID with marks
  getStudentById: (id) => 
    api.get(`/students/${id}`),
  
  // Create new student
  createStudent: (studentData) => 
    api.post('/students', studentData),
  
  // Update student
  updateStudent: (id, studentData) => 
    api.put(`/students/${id}`, studentData),
  
  // Delete student
  deleteStudent: (id) => 
    api.delete(`/students/${id}`),
};

export default api;
