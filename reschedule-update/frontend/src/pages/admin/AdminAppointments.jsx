import { Fragment, useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import RescheduleForm from '../../components/RescheduleForm';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState('');
  const [reschedulingId, setReschedulingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function load(q) {
    adminApi.listAppointments(q).then((res) => setAppointments(res.data));
  }

  useEffect(() => load(), []);

  function handleSearch(e) {
    e.preventDefault();
    load(query);
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this appointment?')) return;
    setError('');
    setSuccess('');
    try {
      await adminApi.cancelAppointment(id);
      load(query);
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
      setSuccess('Appointment rescheduled.');
      load(query);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  // open, upcoming slots for the same doctor, excluding the one already held
  function slotLoader(appt) {
    const today = new Date().toISOString().slice(0, 10);
    return () =>
      adminApi
        .listSlots(appt.doctor)
        .then((res) => res.data.filter((slot) => !slot.is_booked && slot.date >= today && slot.id !== appt.slot));
  }

  return (
    <div className="container mt-4">
      <h1 className="h4 mb-4">All Appointments</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="d-flex mb-3" style={{ maxWidth: 400 }} onSubmit={handleSearch}>
        <input
          className="form-control me-2"
          placeholder="Search by patient or doctor name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-outline-primary">Search</button>
      </form>

      <div className="table-responsive">
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
                    <span className={`badge ${appt.status === 'confirmed' ? 'bg-success' : 'bg-secondary'}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="text-end">
                    {appt.status === 'confirmed' && (
                      <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-outline-primary btn-sm" onClick={() => setReschedulingId(appt.id)}>
                          Reschedule
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(appt.id)}>Cancel</button>
                      </div>
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
      </div>
    </div>
  );
}
