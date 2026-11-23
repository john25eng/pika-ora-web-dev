import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import PageLayout from '../components/PageLayout';
import AlertMessage from '../components/AlertMessage';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.new_password !== form.confirm) {
      setError('The new passwords do not match.');
      return;
    }
    try {
      await authApi.changePassword({
        old_password: form.old_password,
        new_password: form.new_password,
      });
      navigate('/password-changed');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <PageLayout title="Change Password">
      <AlertMessage>{error}</AlertMessage>
      <div className="card shadow-sm" style={{ maxWidth: 420 }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Current password</label>
              <input type="password" className="form-control" value={form.old_password}
                onChange={(e) => setForm({ ...form, old_password: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="form-label">New password</label>
              <input type="password" className="form-control" value={form.new_password}
                onChange={(e) => setForm({ ...form, new_password: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm new password</label>
              <input type="password" className="form-control" value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
            </div>
            <button className="btn btn-primary">Change password</button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}