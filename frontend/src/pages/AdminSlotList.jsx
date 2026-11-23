import { useState } from 'react';
import { adminApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import useFetch from '../hooks/useFetch';
import PageLayout from '../components/PageLayout';
import LoadState from '../components/LoadState';
import AlertMessage from '../components/AlertMessage';
import StatusBadge from '../components/StatusBadge';
import SlotForm from '../components/SlotForm';

export default function AdminSlots() {
  const [filterDoctor, setFilterDoctor] = useState('');
  const [error, setError] = useState('');

  const { data: doctorData } = useFetch(() => adminApi.listDoctors());
  const doctors = doctorData ?? [];

  const {
    data: slotData,
    loading,
    error: loadError,
    reload,
  } = useFetch(() => adminApi.listSlots(filterDoctor || undefined), [filterDoctor]);
  const slots = slotData ?? [];

  async function addSlot(form) {
    setError('');
    try {
      await adminApi.createSlot(form);
      reload();
      return true;
    } catch (err) {
      setError(apiErrorMessage(err));
      return false;
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this slot?')) return;
    setError('');
    try {
      await adminApi.deleteSlot(id);
      reload();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  if (loading || loadError) {
    return <LoadState loading={loading} error={loadError} onRetry={reload} label="Loading slots..." />;
  }

  return (
    <PageLayout title="Manage Appointment Slots">
      <AlertMessage>{error}</AlertMessage>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h6 mb-3">Add a slot</h2>
          <SlotForm doctors={doctors} onSubmit={addSlot} />
        </div>
      </div>

      <div className="mb-3" style={{ maxWidth: 260 }}>
        <label className="form-label">Filter by doctor</label>
        <select className="form-select" value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}>
          <option value="">All doctors</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
        </select>
      </div>

      <table className="table table-sm align-middle">
        <thead>
          <tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.id}>
              <td>{slot.doctor_name}</td>
              <td>{slot.date}</td>
              <td>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</td>
              <td>
                <StatusBadge
                  label={slot.is_booked ? 'Booked' : 'Open'}
                  variant={slot.is_booked ? 'warning' : 'success'}
                />
              </td>
              <td className="text-end">
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(slot.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageLayout>
  );
}