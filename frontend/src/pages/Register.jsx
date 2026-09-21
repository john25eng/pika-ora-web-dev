import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';

const initial = {
  username: '', first_name: '', last_name: '', email: '',
  phone_number: '', password: '', password2: '',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/doctors');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <div className="card mt-5 shadow-sm">
        <div className="card-body p-4">
          <h1 className="h4 mb-4 text-center">Create a patient account</h1>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col mb-3">
                <label className="form-label">First name</label>
                <input className="form-control" value={form.first_name} onChange={update('first_name')} required />
              </div>
              <div className="col mb-3">
                <label className="form-label">Last name</label>
                <input className="form-control" value={form.last_name} onChange={update('last_name')} required />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input className="form-control" value={form.username} onChange={update('username')} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={form.email} onChange={update('email')} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone number (optional)</label>
              <input className="form-control" value={form.phone_number} onChange={update('phone_number')} />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={form.password} onChange={update('password')} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm password</label>
              <input type="password" className="form-control" value={form.password2} onChange={update('password2')} required />
            </div>
            <button className="btn btn-primary w-100" disabled={busy}>
              {busy ? 'Creating account...' : 'Register'}
            </button>
          </form>
          <p className="text-center mt-3 mb-0">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
