import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import ScanQR from './pages/student/ScanQR';
import AttendanceHistory from './pages/student/AttendanceHistory';

import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import StartSession from './pages/lecturer/StartSession';
import SessionReport from './pages/lecturer/SessionReport';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import SystemOverview from './pages/admin/SystemOverview';

import AttendSession from './pages/AttendSession';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/attend/:sessionToken" element={<AttendSession />} />
            
            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/scan" element={<ProtectedRoute allowedRole="student"><ScanQR /></ProtectedRoute>} />
            <Route path="/student/history" element={<ProtectedRoute allowedRole="student"><AttendanceHistory /></ProtectedRoute>} />
            
            {/* Lecturer Routes */}
            <Route path="/lecturer" element={<ProtectedRoute allowedRole="lecturer"><LecturerDashboard /></ProtectedRoute>} />
            <Route path="/lecturer/session" element={<ProtectedRoute allowedRole="lecturer"><StartSession /></ProtectedRoute>} />
            <Route path="/lecturer/report/:session_id" element={<ProtectedRoute allowedRole="lecturer"><SessionReport /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><ManageUsers /></ProtectedRoute>} />
            <Route path="/admin/overview" element={<ProtectedRoute allowedRole="admin"><SystemOverview /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
