import { adminApi } from '../api/endpoints';
import useFetch from '../hooks/useFetch';
import PageLayout from '../components/PageLayout';
import LoadState from '../components/LoadState';
import StatCard from '../components/StatCard';

export default function AdminHome() {
  const { data: stats, loading, error, reload } = useFetch(() => adminApi.dashboard());

  if (loading || error) {
    return <LoadState loading={loading} error={error} onRetry={reload} label="Loading dashboard..." />;
  }

  const cards = [
    { label: 'Active doctors', value: stats.doctor_count },
    { label: 'Upcoming appointments', value: stats.upcoming_appointments },
    { label: 'Patients', value: stats.patient_count },
    { label: 'Open slots', value: stats.open_slots },
  ];

  return (
    <PageLayout title="Admin Dashboard">
      <div className="row g-3">
        {cards.map((c) => (
          <div className="col-md-3" key={c.label}>
            <StatCard label={c.label} value={c.value} />
          </div>
        ))}
      </div>
    </PageLayout>
  );
}