import React from 'react';
import StudentTable from './components/StudentTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="bg-dark text-white py-3 mb-4">
        <div className="container">
          <h1 className="text-center mb-0">Student Management System</h1>
        </div>
      </header>
      <StudentTable />
    </div>
  );
}

export default App;
