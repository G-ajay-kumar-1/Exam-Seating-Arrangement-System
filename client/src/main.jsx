import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students.jsx';
import ImportStudents from './pages/ImportStudents.jsx';
import Exams from './pages/Exams.jsx';
import Halls from './pages/Halls.jsx';
import Allocation from './pages/Allocation.jsx';
import Search from './pages/Search.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';

function Protected({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<Protected><AppLayout /></Protected>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/add" element={<Students />} />
            <Route path="/students/import" element={<ImportStudents />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/exams/create" element={<Exams />} />
            <Route path="/halls" element={<Halls />} />
            <Route path="/halls/create" element={<Halls />} />
            <Route path="/allocation" element={<Allocation />} />
            <Route path="/allocation/generate" element={<Allocation />} />
            <Route path="/allocation/:examId" element={<Allocation />} />
            <Route path="/search" element={<Search />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
