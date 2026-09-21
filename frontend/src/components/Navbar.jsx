import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isPatient } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand fw-semibold" to="/">
        Piki Ora Medical Centre
      </Link>
      <div className="ms-auto d-flex align-items-center gap-3">
        {isPatient && (
          <>
            <Link className="nav-link text-white-50" to="/doctors">Doctors</Link>
            <Link className="nav-link text-white-50" to="/my-appointments">My Appointments</Link>
          </>
        )}
        {isAdmin && (
          <>
            <Link className="nav-link text-white-50" to="/admin">Dashboard</Link>
            <Link className="nav-link text-white-50" to="/admin/doctors">Doctors</Link>
            <Link className="nav-link text-white-50" to="/admin/slots">Slots</Link>
            <Link className="nav-link text-white-50" to="/admin/appointments">Appointments</Link>
            <Link className="nav-link text-white-50" to="/admin/patients">Patients</Link>
          </>
        )}
        {user ? (
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Log out ({user.first_name || user.username})
          </button>
        ) : (
          <>
            <Link className="nav-link text-white-50" to="/login">Login</Link>
            <Link className="nav-link text-white-50" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
