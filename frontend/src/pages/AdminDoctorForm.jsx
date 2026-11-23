import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import PageLayout from '../components/PageLayout';
import LoadState from '../components/LoadState';
import AlertMessage from '../components/AlertMessage';
import DoctorForm from '../components/DoctorForm';

export default function AdminDoctorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error: loadError, reload } = useFetch(() => adminApi.listDoctors());
  const [error, setError] = useState('');

  const isEdit = Boolean(id);
  const doctor = isEdit ? (data ?? []).find((d) => String(d.id) === String(id)) : null;

  async function save(form) {
    setError('');
    try {
      if (isEdit) {
        await adminApi.updateDoctor(id, form);
      } else {
        await adminApi.createDoctor(form);
      }
      navigate('/admin/doctors');
      return true;
    } catch (err) {
      setError(apiErrorMessage(err));
      return false;
    }
  }

  if (isEdit && (loading || loadError)) {
    return <LoadState loading={loading} error={loadError} onRetry={reload} label="Loading doctor..." />;
  }

  if (isEdit && !doctor) {
    return (
      <PageLayout title="Edit Doctor">
        <AlertMessage>Doctor not found.</AlertMessage>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={isEdit ? 'Edit Doctor' : 'Add Doctor'}>
      <AlertMessage>{error}</AlertMessage>
      <div className="card shadow-sm">
        <div className="card-body">
          <DoctorForm
            key={isEdit ? id : 'new'}
            doctor={doctor}
            onSubmit={save}
            onCancel={() => navigate('/admin/doctors')}
          />
        </div>
      </div>
    </PageLayout>
  );
}