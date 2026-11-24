import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import PageLayout from '../../components/PageLayout';
import LoadState from '../../components/LoadState';
import AlertMessage from '../../components/AlertMessage';
import SlotForm from '../../components/SlotForm';

export default function AdminSlotForm() {
  const navigate = useNavigate();
  const { data, loading, error: loadError, reload } = useFetch(() => adminApi.listDoctors());
  const doctors = data ?? [];
  const [error, setError] = useState('');

  async function save(form) {
    setError('');
    try {
      await adminApi.createSlot(form);
      navigate('/admin/slots');
      return true;
    } catch (err) {
      setError(apiErrorMessage(err));
      return false;
    }
  }

  if (loading || loadError) {
    return <LoadState loading={loading} error={loadError} onRetry={reload} label="Loading doctors..." />;
  }

  return (
    <PageLayout title="Add Appointment Slot">
      <AlertMessage>{error}</AlertMessage>
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <SlotForm doctors={doctors} onSubmit={save} />
        </div>
      </div>
      <Link to="/admin/slots" className="btn btn-outline-secondary btn-sm">Back to slots</Link>
    </PageLayout>
  );
}