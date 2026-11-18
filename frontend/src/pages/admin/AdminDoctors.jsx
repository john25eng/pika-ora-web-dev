import { useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import PageLayout from '../../components/PageLayout';
import LoadState from '../../components/LoadState';
import AlertMessage from '../../components/AlertMessage';
import StatusBadge from '../../components/StatusBadge';
import DoctorForm from '../../components/DoctorForm';

export default function AdminDoctors() {
  const { data, loading, error: loadError, reload } = useFetch(() => adminApi.listDoctors());
  const doctors = data ?? [];
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  async function save(form) {
    setError('');
    try {
      if (editing) {
        await adminApi.updateDoctor(editing.id, form);
      } else {
        await adminApi.createDoctor(form);
      }
      setEditing(null);
      reload();
      return true;
    } catch (err) {
      setError(apiErrorMessage(err));
      return false;
    }
  }

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

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h6 mb-3">{editing ? 'Edit doctor' : 'Add doctor'}</h2>
          <DoctorForm
            key={editing ? editing.id : 'new'}
            doctor={editing}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </div>
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
                <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => setEditing(doc)}>Edit</button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(doc.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageLayout>
  );
}