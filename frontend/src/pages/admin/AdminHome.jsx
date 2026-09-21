import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client.get('/admin/dashboard/').then((res) => setStats(res.data));
  }, []);

  const cards = stats
    ? [
        { label: 'Active doctors', value: stats.doctor_count },
        { label: 'Upcoming appointments', value: stats.upcoming_appointments },
        { label: 'Patients', value: stats.patient_count },
        { label: 'Open slots', value: stats.open_slots },
      ]
    : [];

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
