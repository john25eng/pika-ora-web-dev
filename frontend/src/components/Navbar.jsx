import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isPatient } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate('/login');
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <div className="container-fluid px-0">
        <Link className="navbar-brand fw-semibold" to="/" onClick={closeMenu}>
          Piki Ora Medical Centre
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="main-nav"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="main-nav">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            {isPatient && (
              <>
                <Link className="nav-link text-white-50" to="/doctors" onClick={closeMenu}>Doctors</Link>
                <Link className="nav-link text-white-50" to="/my-appointments" onClick={closeMenu}>My Appointments</Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link className="nav-link text-white-50" to="/admin" onClick={closeMenu}>Dashboard</Link>
                <Link className="nav-link text-white-50" to="/admin/doctors" onClick={closeMenu}>Doctors</Link>
                <Link className="nav-link text-white-50" to="/admin/slots" onClick={closeMenu}>Slots</Link>
                <Link className="nav-link text-white-50" to="/admin/appointments" onClick={closeMenu}>Appointments</Link>
                <Link className="nav-link text-white-50" to="/admin/patients" onClick={closeMenu}>Patients</Link>
              </>
            )}
            {user ? (
              <button className="btn btn-outline-light btn-sm my-2 my-lg-0" onClick={handleLogout}>
                Log out ({user.first_name || user.username})
              </button>
            ) : (
              <>
                <Link className="nav-link text-white-50" to="/login" onClick={closeMenu}>Login</Link>
                <Link className="nav-link text-white-50" to="/register" onClick={closeMenu}>Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}