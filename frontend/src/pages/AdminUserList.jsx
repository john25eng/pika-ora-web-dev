import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import PageLayout from '../components/PageLayout';
import LoadState from '../components/LoadState';
import AlertMessage from '../components/AlertMessage';
import StatusBadge from '../components/StatusBadge';

export default function AdminUserList() {
  const { data, loading, error: loadError, reload } = useFetch(() => adminApi.listPatients());
  const patients = data ?? [];
  const [error, setError] = useState('');

  async function handleDelete(p) {
    const name = `${p.first_name} ${p.last_name}`.trim() || p.email;
    if (!window.confirm(`Permanently delete ${name}? This also deletes all of their appointments and cannot be undone.`)) return;
    setError('');
    try {
      await adminApi.deletePatient(p.id);
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
                <Link to={`/admin/patients/${p.id}/edit`} className="btn btn-outline-secondary btn-sm me-2">Edit</Link>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(p)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageLayout>
  );
}