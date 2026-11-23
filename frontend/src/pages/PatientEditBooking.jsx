import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { patientApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import PageLayout from '../components/PageLayout';
import LoadState from '../components/LoadState';
import AlertMessage from '../components/AlertMessage';
import RescheduleForm from '../components/RescheduleForm';

function EditBookingForm({ appt }) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(appt.notes || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function saveNote() {
    setError('');
    setSuccess('');
    try {
      await patientApi.updateNote(appt.id, notes);
      setSuccess('Note saved.');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  // open slots for the same doctor, excluding the one already held
  function loadSlots() {
    return patientApi
      .doctorSlots(appt.doctor)
      .then((res) => res.data.filter((slot) => slot.id !== appt.slot));
  }

  async function handleConfirm(slotId) {
    setError('');
    setSuccess('');
    try {
      await patientApi.reschedule(appt.id, slotId);
      navigate('/my-appointments');
      return true;
    } catch (err) {
      setError(apiErrorMessage(err));
      return false;
    }
  }

  return (
    <PageLayout title="Edit Appointment">
      <AlertMessage>{error}</AlertMessage>
      <AlertMessage type="success">{success}</AlertMessage>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <p className="mb-1"><strong>Doctor:</strong> {appt.doctor_name}</p>
          <p className="mb-3"><strong>Current time:</strong> {appt.date} {appt.start_time.slice(0, 5)}</p>

          <div className="mb-3">
            <label className="form-label">Note</label>
            <textarea className="form-control mb-2" rows={3} value={notes}
              onChange={(e) => setNotes(e.target.value)} />
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={saveNote}>Save note</button>
          </div>

          <hr />
          <h2 className="h6 mb-3">Move to a different time</h2>
          <RescheduleForm
            loadSlots={loadSlots}
            onConfirm={handleConfirm}
            onCancel={() => navigate('/my-appointments')}
          />
        </div>
      </div>
    </PageLayout>
  );
}

export default function PatientEditBooking() {
  const { id } = useParams();
  const { data, loading, error: loadError, reload } = useFetch(() => patientApi.myAppointments());

  if (loading || loadError) {
    return <LoadState loading={loading} error={loadError} onRetry={reload} label="Loading appointment..." />;
  }

  const appt = (data ?? []).find((a) => String(a.id) === String(id));

  if (!appt || appt.status !== 'confirmed') {
    return (
      <PageLayout title="Edit Appointment">
        <AlertMessage>Only confirmed appointments can be edited.</AlertMessage>
        <Link to="/my-appointments" className="btn btn-outline-secondary btn-sm">Back to my appointments</Link>
      </PageLayout>
    );
  }

  return <EditBookingForm key={appt.id} appt={appt} />;
}