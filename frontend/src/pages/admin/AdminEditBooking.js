import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import PageLayout from '../../components/layout/PageLayout';
import LoadState from '../../components/layout/LoadState';
import AlertMessage from '../../components/layout/AlertMessage';
import RescheduleForm from '../../components/forms/RescheduleForm';

export default function AdminEditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error: loadError, reload } = useFetch(() => adminApi.listAppointments(''));
  const [error, setError] = useState('');

  if (loading || loadError) {
    return <LoadState loading={loading} error={loadError} onRetry={reload} label="Loading appointment..." />;
  }

  const appt = (data ?? []).find((a) => String(a.id) === String(id));

  if (!appt || appt.status !== 'confirmed') {
    return (
      <PageLayout title="Edit Appointment">
        <AlertMessage>Only confirmed appointments can be edited.</AlertMessage>
        <Link to="/admin/appointments" className="btn btn-outline-secondary btn-sm">Back to appointments</Link>
      </PageLayout>
    );
  }

  // open future slots for the same doctor, excluding the one already held
  function loadSlots() {
    const today = new Date().toISOString().slice(0, 10);
    return adminApi.listSlots(appt.doctor).then((res) =>
      res.data.filter((slot) => !slot.is_booked && slot.id !== appt.slot && slot.date >= today)
    );
  }

  async function handleConfirm(slotId) {
    setError('');
    try {
      await adminApi.rescheduleAppointment(appt.id, slotId);
      navigate('/admin/appointments');
      return true;
    } catch (err) {
      setError(apiErrorMessage(err));
      return false;
    }
  }

  return (
    <PageLayout title="Edit Appointment">
      <AlertMessage>{error}</AlertMessage>
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <p className="mb-1"><strong>Patient:</strong> {appt.patient_name}</p>
          <p className="mb-1"><strong>Doctor:</strong> {appt.doctor_name}</p>
          <p className="mb-3"><strong>Current time:</strong> {appt.date} {appt.start_time.slice(0, 5)}</p>
          <RescheduleForm
            loadSlots={loadSlots}
            onConfirm={handleConfirm}
            onCancel={() => navigate('/admin/appointments')}
          />
        </div>
      </div>
    </PageLayout>
  );
}