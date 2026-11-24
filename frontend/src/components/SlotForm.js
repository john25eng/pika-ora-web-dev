import { useState } from 'react';

const emptyForm = { doctor: '', date: '', start_time: '', end_time: '' };

// form to add an appointment slot. onSubmit(form) must return true when it worked
export default function SlotForm({ doctors, onSubmit }) {
  const [form, setForm] = useState(emptyForm);

  async function handleSubmit(e) {
    e.preventDefault();
    if (await onSubmit(form)) setForm(emptyForm);
  }

  return (
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
  );
}