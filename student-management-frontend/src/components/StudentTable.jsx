import React, { useState, useEffect, useCallback } from 'react';
import { studentAPI } from '../services/api';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Memoized fetch function (prevents re-creation)
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getAllStudents(currentPage, limit);
      setStudents(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalRecords(response.data.totalRecords || 0);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch students',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  // ✅ Proper dependency — no more warning
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await studentAPI.deleteStudent(id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Student deleted successfully.',
          timer: 2000,
        });
        fetchStudents();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete student',
        });
      }
    }
  };

  const handleView = async (id) => {
    try {
      const response = await studentAPI.getStudentById(id);
      const student = response.data.data;

      Swal.fire({
        title: `<strong>${student.name}</strong>`,
        html: `
          <div class="text-start">
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Age:</strong> ${student.age}</p>
            <p><strong>Average Marks:</strong> ${student.average_score}</p>
          </div>
        `,
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch student details',
      });
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };

  // ✅ Improved Search Logic (by ID or Name)
  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return fetchStudents();
    setLoading(true);

    // Search by ID
    if (!isNaN(query)) {
      try {
        const response = await studentAPI.getStudentById(query);
        const data = response.data.data;
        setStudents(data ? [data] : []);
        setTotalPages(1);
        setTotalRecords(data ? 1 : 0);
      } catch {
        Swal.fire({ icon: 'error', title: 'No student found', text: 'No match for this ID' });
        setStudents([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Search by Name
    try {
      const response = await studentAPI.getAllStudents(1, 100);
      const filtered = response.data.data.filter((st) =>
        st.name.toLowerCase().includes(query.toLowerCase())
      );
      setStudents(filtered);
      setTotalPages(1);
      setTotalRecords(filtered.length);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Search failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h4 className="mb-0">Student Management</h4>
            <div className="d-flex align-items-center mt-2 mt-md-0">
              <button
                className="btn btn-light me-2"
                onClick={() => setShowAddModal(true)}
              >
                Add Student
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <label>Show </label>
              <select
                className="form-select d-inline-block mx-2"
                style={{ width: 'auto' }}
                value={limit}
                onChange={handleLimitChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <label> entries</label>
            </div>

            <form className="d-flex" onSubmit={handleSearch}>
              <input
                type="text"
                className="form-control me-2"
                style={{ width: '200px' }}
                placeholder="Search by ID or name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-secondary" type="submit">
                <FaSearch />
              </button>
            </form>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Age</th>
                      <th>Average Marks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student.id}>
                          <td>{student.id}</td>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>{student.age}</td>
                          <td>{student.average_score ?? 0}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-info me-2"
                              onClick={() => handleView(student.id)}
                              title="View"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleEdit(student)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(student.id, student.name)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  Showing {students.length > 0 ? ((currentPage - 1) * limit) + 1 : 0} to{' '}
                  {Math.min(currentPage * limit, totalRecords)} of {totalRecords} entries
                </div>
                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(1)}>
                        First
                      </button>
                    </li>
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <li
                          key={page}
                          className={`page-item ${currentPage === page ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    })}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        Last
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>

      <AddStudentModal show={showAddModal} onHide={() => setShowAddModal(false)} onSuccess={fetchStudents} />
      <EditStudentModal show={showEditModal} onHide={() => setShowEditModal(false)} onSuccess={fetchStudents} student={selectedStudent} />
    </div>
  );
};

export default StudentTable;
