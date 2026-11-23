import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import PageLayout from '../components/PageLayout';
import LoadState from '../components/LoadState';
import AlertMessage from '../components/AlertMessage';

function UserEditForm({ patient }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: patient.first_name,
    last_name: patient.last_name,
    email: patient.email,
    phone_number: patient.phone_number || '',
    is_active: patient.is_active,
  });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await adminApi.updatePatient(patient.id, form);
      navigate('/admin/patients');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <PageLayout title="Edit Patient">
      <AlertMessage>{error}</AlertMessage>
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">First name</label>
            <input className="form-control" value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Last name</label>
            <input className="form-control" value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input className="form-control" value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
          </div>
          <div className="form-check mb-3">
            <input type="checkbox" className="form-check-input" id="is_active" checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <label className="form-check-label" htmlFor="is_active">Active</label>
          </div>
          <button type="button" className="btn btn-primary me-2" onClick={handleSubmit}>Save</button>
          <Link to="/admin/patients" className="btn btn-light">Cancel</Link>
        </div>
      </div>
    </PageLayout>
  );
}

export default function AdminUserForm() {
  const { id } = useParams();
  const { data, loading, error: loadError, reload } = useFetch(() => adminApi.listPatients());

  if (loading || loadError) {
    return <LoadState loading={loading} error={loadError} onRetry={reload} label="Loading patient..." />;
  }

  const patient = (data ?? []).find((p) => String(p.id) === String(id));

  if (!patient) {
    return (
      <PageLayout title="Edit Patient">
        <AlertMessage>Patient not found.</AlertMessage>
      </PageLayout>
    );
  }

  return <UserEditForm key={patient.id} patient={patient} />;
}