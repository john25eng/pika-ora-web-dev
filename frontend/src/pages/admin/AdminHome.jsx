import client from '../../api/client';
import useFetch from '../../hooks/useFetch';

export default function AdminHome() {
  const { data: stats, loading, error, reload } = useFetch(() => client.get('/admin/dashboard/'));

  if (loading) return <div className="container mt-4">Loading dashboard... (the server may take a moment to wake up)</div>;
  if (error) return (
    <div className="container mt-4">
      <div className="alert alert-danger">{error}</div>
      <button className="btn btn-outline-primary btn-sm" onClick={reload}>Try again</button>
    </div>
  );

  const cards = [
    { label: 'Active doctors', value: stats.doctor_count },
    { label: 'Upcoming appointments', value: stats.upcoming_appointments },
    { label: 'Patients', value: stats.patient_count },
    { label: 'Open slots', value: stats.open_slots },
  ];

  return (
    <div className="container mt-4">
      <h1 className="h4 mb-4">Admin Dashboard</h1>
      <div className="row g-3">
        {cards.map((c) => (
          <div className="col-md-3" key={c.label}>
            <div className="card shadow-sm text-center">
              <div className="card-body">
                <div className="display-6">{c.value}</div>
                <div className="text-muted small">{c.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}