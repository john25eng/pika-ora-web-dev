import { patientApi } from '../../api/endpoints';
import useFetch from '../../hooks/useFetch';
import PageLayout from '../../components/layout/PageLayout';
import LoadState from '../../components/layout/LoadState';
import DoctorCard from '../../components/cards/DoctorCard';

export default function DoctorList() {
  const { data, loading, error, reload } = useFetch(() => patientApi.listDoctors());
  const doctors = data ?? [];

  if (loading || error) {
    return <LoadState loading={loading} error={error} onRetry={reload} label="Loading doctors..." />;
  }

  return (
    <PageLayout title="Our Doctors">
      {doctors.length === 0 && <p className="text-muted">No doctors are available right now.</p>}
      <div className="row g-3">
        {doctors.map((doc) => (
          <div className="col-md-4" key={doc.id}>
            <DoctorCard doctor={doc} />
          </div>
        ))}
      </div>
    </PageLayout>
  );
}