import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import PageLayout from '../../components/layout/PageLayout';
import LoadState from '../../components/layout/LoadState';
import AlertMessage from '../../components/layout/AlertMessage';
import StatusBadge from '../../components/cards/StatusBadge';

export default function AdminDoctorList() {
  const { data, loading, error: loadError, reload } = useFetch(() => adminApi.listDoctors());
  const doctors = data ?? [];
  const [error, setError] = useState('');

  async function handleDelete(id) {
    if (!window.confirm('Remove this doctor profile? This also removes their appointment slots.')) return;
    setError('');
    try {
      await adminApi.deleteDoctor(id);
      reload();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  if (loading || loadError) {
    return <LoadState loading={loading} error={loadError} onRetry={reload} label="Loading doctors..." />;
  }

  return (
    <PageLayout title="Manage Doctors">
      <AlertMessage>{error}</AlertMessage>

      <div className="mb-3">
        <Link to="/admin/doctors/new" className="btn btn-primary btn-sm">Add doctor</Link>
      </div>

      <table className="table table-sm align-middle">
        <thead>
          <tr><th>Name</th><th>Specialty</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {doctors.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.full_name}</td>
              <td>{doc.specialty}</td>
              <td>
                <StatusBadge
                  label={doc.is_active ? 'Active' : 'Inactive'}
                  variant={doc.is_active ? 'success' : 'secondary'}
                />
              </td>
              <td className="text-end">
                <Link to={`/admin/doctors/${doc.id}/edit`} className="btn btn-outline-secondary btn-sm me-2">Edit</Link>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(doc.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageLayout>
  );
}