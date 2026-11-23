import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';

import DoctorList from './pages/DoctorList';
import AvailableSlots from './pages/AvailableSlots';
import PatientBookingList from './pages/PatientBookingList';

import AdminHome from './pages/AdminHome';
import AdminDoctorList from './pages/AdminDoctorList';
import AdminSlotList from './pages/AdminSlotList';
import AdminBookingList from './pages/AdminBookingList';
import AdminUserList from './pages/AdminUserList';

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
          <ProtectedRoute role="patient"><AvailableSlots /></ProtectedRoute>
        } />
        <Route path="/my-appointments" element={
          <ProtectedRoute role="patient"><PatientBookingList /></ProtectedRoute>
        } />

        {/* admin */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminHome /></ProtectedRoute>
        } />
        <Route path="/admin/doctors" element={
          <ProtectedRoute role="admin"><AdminDoctorList /></ProtectedRoute>
        } />
        <Route path="/admin/slots" element={
          <ProtectedRoute role="admin"><AdminSlotList /></ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute role="admin"><AdminBookingList /></ProtectedRoute>
        } />
        <Route path="/admin/patients" element={
          <ProtectedRoute role="admin"><AdminUserList /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}