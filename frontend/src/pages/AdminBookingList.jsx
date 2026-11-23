import { Fragment, useState } from 'react';
import { adminApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import PageLayout from '../components/PageLayout';
import LoadState from '../components/LoadState';
import AlertMessage from '../components/AlertMessage';
import StatusBadge from '../components/StatusBadge';
import RescheduleForm from '../components/RescheduleForm';

export default function AdminAppointments() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { data, loading, error: loadError, reload } = useFetch(
    () => adminApi.listAppointments(query),
    [query]
  );
  const appointments = data ?? [];
  const [reschedulingId, setReschedulingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    setQuery(search);
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this appointment?')) return;
    setError('');
    setSuccess('');
    try {
      await adminApi.cancelAppointment(id);
      reload();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleReschedule(id, slotId) {
    setError('');
    setSuccess('');
    try {
      await adminApi.rescheduleAppointment(id, slotId);
      setReschedulingId(null);
      setSuccess('Appointment moved to the new time.');
      reload();
      return true;
    } catch (err) {
      setError(apiErrorMessage(err));
      return false;
    }
  }

  // open future slots for the same doctor, excluding the one already held
  function slotLoader(appt) {
    const today = new Date().toISOString().slice(0, 10);
    return () =>
      adminApi.listSlots(appt.doctor).then((res) =>
        res.data.filter((slot) => !slot.is_booked && slot.id !== appt.slot && slot.date >= today)
      );
  }

  if (loading || loadError) {
    return <LoadState loading={loading} error={loadError} onRetry={reload} label="Loading appointments..." />;
  }

  return (
    <PageLayout title="All Appointments">
      <AlertMessage>{error}</AlertMessage>
      <AlertMessage type="success">{success}</AlertMessage>

      <form className="d-flex mb-3" style={{ maxWidth: 400 }} onSubmit={handleSearch}>
        <input
          className="form-control me-2"
          placeholder="Search by patient or doctor name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-outline-primary">Search</button>
      </form>

      {appointments.length === 0 && <p className="text-muted">No appointments found.</p>}

      <table className="table table-sm align-middle">
        <thead>
          <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <Fragment key={appt.id}>
              <tr>
                <td>{appt.patient_name}</td>
                <td>{appt.doctor_name}</td>
                <td>{appt.date} {appt.start_time.slice(0, 5)}</td>
                <td>
                  <StatusBadge
                    label={appt.status}
                    variant={appt.status === 'confirmed' ? 'success' : 'secondary'}
                  />
                </td>
                <td className="text-end">
                  {appt.status === 'confirmed' && (
                    <>
                      <button className="btn btn-outline-primary btn-sm me-2" onClick={() => setReschedulingId(appt.id)}>
                        Reschedule
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(appt.id)}>
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
              {reschedulingId === appt.id && (
                <tr>
                  <td colSpan={5}>
                    <RescheduleForm
                      loadSlots={slotLoader(appt)}
                      onConfirm={(slotId) => handleReschedule(appt.id, slotId)}
                      onCancel={() => setReschedulingId(null)}
                    />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </PageLayout>
  );
}