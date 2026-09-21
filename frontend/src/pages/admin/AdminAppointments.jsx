import { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

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
    try {
      await adminApi.cancelAppointment(id);
      load(query);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="container mt-4">
      <h1 className="h4 mb-4">All Appointments</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <form className="d-flex mb-3" style={{ maxWidth: 400 }} onSubmit={handleSearch}>
        <input
          className="form-control me-2"
          placeholder="Search by patient or doctor name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-outline-primary">Search</button>
      </form>

      <table className="table table-sm align-middle">
        <thead>
          <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.id}>
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
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(appt.id)}>Cancel</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
