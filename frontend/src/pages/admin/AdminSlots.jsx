import { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';

const emptyForm = { doctor: '', date: '', start_time: '', end_time: '' };

export default function AdminSlots() {
  const [slots, setSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filterDoctor, setFilterDoctor] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  function loadSlots(doctorId) {
    adminApi.listSlots(doctorId || undefined).then((res) => setSlots(res.data));
  }

  useEffect(() => {
    adminApi.listDoctors().then((res) => setDoctors(res.data));
    loadSlots();
  }, []);

  function handleFilterChange(e) {
    const val = e.target.value;
    setFilterDoctor(val);
    loadSlots(val);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await adminApi.createSlot(form);
      setForm(emptyForm);
      loadSlots(filterDoctor);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this slot?')) return;
    setError('');
    try {
      await adminApi.deleteSlot(id);
      loadSlots(filterDoctor);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="container mt-4">
      <h1 className="h4 mb-4">Manage Appointment Slots</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h6 mb-3">Add a slot</h2>
          <form onSubmit={handleSubmit} className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Doctor</label>
              <select className="form-select" value={form.doctor}
                onChange={(e) => setForm({ ...form, doctor: e.target.value })} required>
                <option value="">Select...</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">Start</label>
              <input type="time" className="form-control" value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <label className="form-label">End</label>
              <input type="time" className="form-control" value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100">Add slot</button>
            </div>
          </form>
        </div>
      </div>

      <div className="mb-3" style={{ maxWidth: 260 }}>
        <label className="form-label">Filter by doctor</label>
        <select className="form-select" value={filterDoctor} onChange={handleFilterChange}>
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
                <span className={`badge ${slot.is_booked ? 'bg-warning text-dark' : 'bg-success'}`}>
                  {slot.is_booked ? 'Booked' : 'Open'}
                </span>
              </td>
              <td className="text-end">
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(slot.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
