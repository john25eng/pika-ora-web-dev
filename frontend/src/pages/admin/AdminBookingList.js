import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import PageLayout from '../../components/PageLayout';
import LoadState from '../../components/LoadState';
import AlertMessage from '../../components/AlertMessage';
import StatusBadge from '../../components/StatusBadge';

export default function AdminBookingList() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { data, loading, error: loadError, reload } = useFetch(
    () => adminApi.listAppointments(query),
    [query]
  );
  const appointments = data ?? [];
  const [error, setError] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    setQuery(search);
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this appointment?')) return;
    setError('');
    try {
      await adminApi.cancelAppointment(id);
      reload();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  if (loading || loadError) {
    return <LoadState loading={loading} error={loadError} onRetry={reload} label="Loading appointments..." />;
  }

  return (
    <PageLayout title="All Appointments">
      <AlertMessage>{error}</AlertMessage>

            <div className="mb-3">
        <Link to="/admin/appointments/new" className="btn btn-primary btn-sm">Add booking</Link>
      </div>

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
            <tr key={appt.id}>
              <td>{appt.patient_name}</td>
              <td>{appt.doctor_name}</td>
              <td>{appt.date} {appt.start_time.slice(0, 5)}{appt.end_time && ` - ${appt.end_time.slice(0, 5)}`}</td>
              <td>
                <StatusBadge
                  label={appt.status}
                  variant={appt.status === 'confirmed' ? 'success' : 'secondary'}
                />
              </td>
              <td className="text-end">
                {appt.status === 'confirmed' && (
                  <>
                    <Link to={`/admin/appointments/${appt.id}/edit`} className="btn btn-outline-primary btn-sm me-2">
                      Edit
                    </Link>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(appt.id)}>
                      Cancel
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageLayout>
  );
}