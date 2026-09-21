import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';

import DoctorList from './pages/patient/DoctorList';
import DoctorSchedule from './pages/patient/DoctorSchedule';
import MyAppointments from './pages/patient/MyAppointments';

import AdminHome from './pages/admin/AdminHome';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminSlots from './pages/admin/AdminSlots';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminPatients from './pages/admin/AdminPatients';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/doctors'} replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* patient */}
        <Route path="/doctors" element={
          <ProtectedRoute role="patient"><DoctorList /></ProtectedRoute>
        } />
        <Route path="/doctors/:doctorId" element={
          <ProtectedRoute role="patient"><DoctorSchedule /></ProtectedRoute>
        } />
        <Route path="/my-appointments" element={
          <ProtectedRoute role="patient"><MyAppointments /></ProtectedRoute>
        } />

        {/* admin */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminHome /></ProtectedRoute>
        } />
        <Route path="/admin/doctors" element={
          <ProtectedRoute role="admin"><AdminDoctors /></ProtectedRoute>
        } />
        <Route path="/admin/slots" element={
          <ProtectedRoute role="admin"><AdminSlots /></ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute role="admin"><AdminAppointments /></ProtectedRoute>
        } />
        <Route path="/admin/patients" element={
          <ProtectedRoute role="admin"><AdminPatients /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
