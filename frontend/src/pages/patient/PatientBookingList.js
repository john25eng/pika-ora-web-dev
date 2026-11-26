import { useState } from 'react';
import { Link } from 'react-router-dom';
import { patientApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import PageLayout from '../../components/PageLayout';
import LoadState from '../../components/LoadState';
import AlertMessage from '../../components/AlertMessage';
import StatusBadge from '../../components/StatusBadge';

export default function PatientBookingList() {
  const { data, loading, error: loadError, reload } = useFetch(() => patientApi.myAppointments());
  const appointments = data ?? [];
  const [error, setError] = useState('');

  async function handleCancel(id) {
    if (!window.confirm('Cancel this appointment?')) return;
    setError('');
    try {
      await patientApi.cancel(id);
      reload();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  if (loading || loadError) {
    return <LoadState loading={loading} error={loadError} onRetry={reload} label="Loading your appointments..." />;
  }

  return (
    <PageLayout title="My Appointments">
      <AlertMessage>{error}</AlertMessage>
      {appointments.length === 0 && <p className="text-muted">You have no appointments yet.</p>}

      {appointments.length > 0 && (
        <table className="table table-sm align-middle">
          <thead>
            <tr><th>Doctor</th><th>Date</th><th>Status</th><th>Note</th><th></th></tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td>{appt.doctor_name}</td>
                <td>{appt.date} {appt.start_time.slice(0, 5)}{appt.end_time && ` - ${appt.end_time.slice(0, 5)}`}</td>
                <td>
                  <StatusBadge
                    label={appt.status}
                    variant={appt.status === 'confirmed' ? 'success' : 'secondary'}
                  />
                </td>
                <td>{appt.notes || '—'}</td>
                <td className="text-end">
                  {appt.status === 'confirmed' && (
                    <>
                      <Link to={`/my-appointments/${appt.id}/edit`} className="btn btn-outline-primary btn-sm me-2">
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
      )}
    </PageLayout>
  );
}