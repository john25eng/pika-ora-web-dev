import { useState } from 'react';
import { patientApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import PageLayout from '../components/PageLayout';
import LoadState from '../components/LoadState';
import AlertMessage from '../components/AlertMessage';
import AppointmentCard from '../components/AppointmentCard';

export default function MyAppointments() {
  const { data, loading, error: loadError, reload } = useFetch(() => patientApi.myAppointments());
  const appointments = data ?? [];
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // runs an api call, shows any error, reloads the list and returns true when it worked
  async function run(action, message = '') {
    setError('');
    setSuccess('');
    try {
      await action();
      if (message) setSuccess(message);
      reload();
      return true;
    } catch (err) {
      setError(apiErrorMessage(err));
      return false;
    }
  }

  const saveNote = (id, notes) => run(() => patientApi.updateNote(id, notes));
  const reschedule = (id, slotId) =>
    run(() => patientApi.reschedule(id, slotId), 'Appointment moved to your new time.');

  function cancel(id) {
    if (!window.confirm('Cancel this appointment?')) return;
    run(() => patientApi.cancel(id));
  }

  // open slots for the same doctor, excluding the one already held
  function slotLoader(appt) {
    return () =>
      patientApi
        .doctorSlots(appt.doctor)
        .then((res) => res.data.filter((slot) => slot.id !== appt.slot));
  }

  if (loading || loadError) {
    return <LoadState loading={loading} error={loadError} onRetry={reload} label="Loading your appointments..." />;
  }

  return (
    <PageLayout title="My Appointments">
      <AlertMessage>{error}</AlertMessage>
      <AlertMessage type="success">{success}</AlertMessage>
      {appointments.length === 0 && <p className="text-muted">You have no appointments yet.</p>}
      <div className="vstack gap-3">
        {appointments.map((appt) => (
          <AppointmentCard
            key={appt.id}
            appointment={appt}
            loadSlots={slotLoader(appt)}
            onSaveNote={saveNote}
            onReschedule={reschedule}
            onCancel={cancel}
          />
        ))}
      </div>
    </PageLayout>
  );
}