import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ChangePassword from './pages/auth/ChangePassword';
import PasswordChanged from './pages/auth/PasswordChanged';

import DoctorList from './pages/patient/DoctorList';
import AvailableSlots from './pages/patient/AvailableSlots';
import PatientBookingList from './pages/patient/PatientBookingList';
import PatientEditBooking from './pages/patient/PatientEditBooking';

import AdminHome from './pages/admin/AdminHome';
import AdminDoctorList from './pages/admin/AdminDoctorList';
import AdminDoctorForm from './pages/admin/AdminDoctorForm';
import AdminSlotList from './pages/admin/AdminSlotList';
import AdminSlotForm from './pages/admin/AdminSlotForm';
import AdminBookingList from './pages/admin/AdminBookingList';
import AdminAddBooking from './pages/admin/AdminAddBooking';
import AdminEditBooking from './pages/admin/AdminEditBooking';
import AdminUserList from './pages/admin/AdminUserList';
import AdminUserForm from './pages/admin/AdminUserForm';



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
        <Route path="/my-appointments/:id/edit" element={
          <ProtectedRoute role="patient"><PatientEditBooking /></ProtectedRoute>
        } />

        {/* admin */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminHome /></ProtectedRoute>
        } />
                <Route path="/admin/doctors" element={
          <ProtectedRoute role="admin"><AdminDoctorList /></ProtectedRoute>
        } />
        <Route path="/admin/doctors/new" element={
          <ProtectedRoute role="admin"><AdminDoctorForm /></ProtectedRoute>
        } />
        <Route path="/admin/doctors/:id/edit" element={
          <ProtectedRoute role="admin"><AdminDoctorForm /></ProtectedRoute>
        } />
                <Route path="/admin/slots" element={
          <ProtectedRoute role="admin"><AdminSlotList /></ProtectedRoute>
        } />
        <Route path="/admin/slots/new" element={
          <ProtectedRoute role="admin"><AdminSlotForm /></ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute role="admin"><AdminBookingList /></ProtectedRoute>
        } />
        <Route path="/admin/appointments/new" element={
          <ProtectedRoute role="admin"><AdminAddBooking /></ProtectedRoute>
        } />
        <Route path="/admin/appointments/:id/edit" element={
          <ProtectedRoute role="admin"><AdminEditBooking /></ProtectedRoute>
        } />
        <Route path="/admin/patients" element={
          <ProtectedRoute role="admin"><AdminUserList /></ProtectedRoute>
        } />
        <Route path="/admin/patients/:id/edit" element={
          <ProtectedRoute role="admin"><AdminUserForm /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/change-password" element={
          <ProtectedRoute><ChangePassword /></ProtectedRoute>
        } />
        <Route path="/password-changed" element={
          <ProtectedRoute><PasswordChanged /></ProtectedRoute>
        } />
      </Routes>
    </>
  );
}