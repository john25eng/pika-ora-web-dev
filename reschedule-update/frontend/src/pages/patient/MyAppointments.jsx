import { useEffect, useState } from 'react';
import { patientApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import RescheduleForm from '../../components/RescheduleForm';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function load() {
    setLoading(true);
    patientApi.myAppointments().then((res) => {
      setAppointments(res.data);
      setLoading(false);
    });
  }

  useEffect(load, []);

  function startEdit(appt) {
    setReschedulingId(null);
    setEditingId(appt.id);
    setNoteDraft(appt.notes || '');
  }

  function startReschedule(appt) {
    setEditingId(null);
    setReschedulingId(appt.id);
  }

  async function saveNote(id) {
    setError('');
    setSuccess('');
    try {
      await patientApi.updateNote(id, noteDraft);
      setEditingId(null);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function reschedule(id, slotId) {
    setError('');
    setSuccess('');
    try {
      await patientApi.reschedule(id, slotId);
      setReschedulingId(null);
      setSuccess('Appointment moved to your new time.');
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function cancelAppointment(id) {
    if (!window.confirm('Cancel this appointment?')) return;
    setError('');
    setSuccess('');
    try {
      await patientApi.cancel(id);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  // open slots for the same doctor, excluding the one already held
  function slotLoader(appt) {
    return () =>
      patientApi
        .doctorSlots(appt.doctor)
        .then((res) => res.data.filter((slot) => slot.id !== appt.slot));
  }

  if (loading) return <div className="container mt-4">Loading your appointments...</div>;

  return (
    <div className="container mt-4">
      <h1 className="h4 mb-4">My Appointments</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {appointments.length === 0 && <p className="text-muted">You have no appointments yet.</p>}
      <div className="vstack gap-3">
        {appointments.map((appt) => (
          <div className="card shadow-sm" key={appt.id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <h2 className="h6 mb-1">{appt.doctor_name}</h2>
                  <div className="text-muted small mb-2">
                    {appt.date} at {appt.start_time.slice(0, 5)}
                  </div>
                  <span className={`badge ${appt.status === 'confirmed' ? 'bg-success' : 'bg-secondary'}`}>
                    {appt.status}
                  </span>
                </div>
                {appt.status === 'confirmed' && (
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => startReschedule(appt)}>
                      Reschedule
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => startEdit(appt)}>
                      Edit note
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => cancelAppointment(appt.id)}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {reschedulingId === appt.id && (
                <RescheduleForm
                  loadSlots={slotLoader(appt)}
                  onConfirm={(slotId) => reschedule(appt.id, slotId)}
                  onCancel={() => setReschedulingId(null)}
                />
              )}

              {editingId === appt.id ? (
                <div className="mt-3">
                  <textarea
                    className="form-control mb-2"
                    rows={3}
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Reason for visit, symptoms, etc. (optional)"
                  />
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary btn-sm" onClick={() => saveNote(appt.id)}>Save</button>
                    <button className="btn btn-light btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                appt.notes && <p className="mt-3 mb-0 small">{appt.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
