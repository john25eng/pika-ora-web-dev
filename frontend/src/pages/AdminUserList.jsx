import { useState } from 'react';
import { adminApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import PageLayout from '../components/PageLayout';
import LoadState from '../components/LoadState';
import AlertMessage from '../components/AlertMessage';
import StatusBadge from '../components/StatusBadge';

export default function AdminPatients() {
  const { data, loading, error: loadError, reload } = useFetch(() => adminApi.listPatients());
  const patients = data ?? [];
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      phone_number: p.phone_number || '',
      is_active: p.is_active,
    });
  }

  async function save(id) {
    setError('');
    try {
      await adminApi.updatePatient(id, form);
      setEditingId(null);
      reload();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  if (loading || loadError) {
    return <LoadState loading={loading} error={loadError} onRetry={reload} label="Loading patients..." />;
  }

  return (
    <PageLayout title="Patient Accounts">
      <AlertMessage>{error}</AlertMessage>

      <table className="table align-middle">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              {editingId === p.id ? (
                <>
                  <td className="d-flex gap-1">
                    <input className="form-control form-control-sm" value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                    <input className="form-control form-control-sm" value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                  </td>
                  <td>
                    <input className="form-control form-control-sm" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </td>
                  <td>
                    <input className="form-control form-control-sm" value={form.phone_number}
                      onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
                  </td>
                  <td>
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" checked={form.is_active}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                      <label className="form-check-label small">Active</label>
                    </div>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-primary btn-sm me-2" onClick={() => save(p.id)}>Save</button>
                    <button className="btn btn-light btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{p.first_name} {p.last_name}</td>
                  <td>{p.email}</td>
                  <td>{p.phone_number || '—'}</td>
                  <td>
                    <StatusBadge
                      label={p.is_active ? 'Active' : 'Inactive'}
                      variant={p.is_active ? 'success' : 'secondary'}
                    />
                  </td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => startEdit(p)}>Edit</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </PageLayout>
  );
}