import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

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

import AdminDoctorForm from './pages/AdminDoctorForm';
import AdminSlotForm from './pages/AdminSlotForm';
import AdminUserForm from './pages/AdminUserForm';
import AdminEditBooking from './pages/AdminEditBooking';
import AdminAddBooking from './pages/AdminAddBooking';
import PatientEditBooking from './pages/PatientEditBooking';
import ChangePassword from './pages/ChangePassword';
import PasswordChanged from './pages/PasswordChanged';
import Home from './pages/Home';



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