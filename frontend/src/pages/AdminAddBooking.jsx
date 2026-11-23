import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import PageLayout from '../components/PageLayout';
import LoadState from '../components/LoadState';
import AlertMessage from '../components/AlertMessage';

export default function AdminAddBooking() {
  const navigate = useNavigate();
  const patientsFetch = useFetch(() => adminApi.listPatients());
  const doctorsFetch = useFetch(() => adminApi.listDoctors());
  const patients = (patientsFetch.data ?? []).filter((p) => p.is_active);
  const doctors = (doctorsFetch.data ?? []).filter((d) => d.is_active);

  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [slotId, setSlotId] = useState('');
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');

  // load the doctor's open, future slots whenever the doctor changes
  useEffect(() => {
    setSlotId('');
    if (!doctorId) {
      setSlots([]);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    adminApi
      .listSlots(doctorId)
      .then((res) => setSlots(res.data.filter((s) => !s.is_booked && s.date >= today)))
      .catch((err) => setError(apiErrorMessage(err)));
  }, [doctorId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await adminApi.bookAppointment(Number(patientId), Number(slotId));
      navigate('/admin/appointments');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  const loading = patientsFetch.loading || doctorsFetch.loading;
  const loadError = patientsFetch.error || doctorsFetch.error;
  if (loading || loadError) {
    return (
      <LoadState
        loading={loading}
        error={loadError}
        onRetry={() => { patientsFetch.reload(); doctorsFetch.reload(); }}
        label="Loading..."
      />
    );
  }

  return (
    <PageLayout title="Add Booking">
      <AlertMessage>{error}</AlertMessage>
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Patient</label>
              <select className="form-select" value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                <option value="">Select a patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.email})</option>
                ))}
              </select>
              {patients.length === 0 && <div className="form-text">No active patients yet.</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Doctor</label>
              <select className="form-select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
                <option value="">Select a doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.full_name} - {d.specialty}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Time slot</label>
              <select className="form-select" value={slotId} onChange={(e) => setSlotId(e.target.value)} required disabled={!doctorId}>
                <option value="">{doctorId ? 'Select a slot' : 'Choose a doctor first'}</option>
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                  </option>
                ))}
              </select>
              {doctorId && slots.length === 0 && <div className="form-text">This doctor has no open future slots.</div>}
            </div>

            <button className="btn btn-primary me-2" disabled={!patientId || !slotId}>Book appointment</button>
            <Link to="/admin/appointments" className="btn btn-light">Cancel</Link>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}