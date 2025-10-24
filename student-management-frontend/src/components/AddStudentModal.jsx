import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { studentAPI } from '../services/api';
import Swal from 'sweetalert2';

const AddStudentModal = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    averageMarks: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await studentAPI.createStudent({
        name: formData.name,
        email: formData.email,
        age: Number(formData.age),
        averageMarks: Number(formData.averageMarks),
      });

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Student added successfully',
        timer: 2000,
      });

      // Reset form and close modal
      setFormData({ name: '', email: '', age: '', averageMarks: '' });
      onHide();
      onSuccess();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add student',
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Student</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Student Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter student name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Age</Form.Label>
            <Form.Control
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter age"
              required
              min="1"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Average Marks</Form.Label>
            <Form.Control
              type="number"
              name="averageMarks"
              value={formData.averageMarks}
              onChange={handleChange}
              placeholder="Enter average marks"
              min="0"
              max="100"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button variant="primary" type="submit">Save Student</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddStudentModal;
