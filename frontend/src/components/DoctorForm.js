import { useState } from 'react';

const emptyForm = { first_name: '', last_name: '', specialty: '', bio: '', is_active: true };

// add or edit form for a doctor. onSubmit(form) must return true when it worked
export default function DoctorForm({ doctor, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    doctor
      ? {
          first_name: doctor.first_name,
          last_name: doctor.last_name,
          specialty: doctor.specialty,
          bio: doctor.bio || '',
          is_active: doctor.is_active,
        }
      : emptyForm
  );

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await onSubmit(form);
    if (ok && !doctor) setForm(emptyForm);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">First name</label>
          <input className="form-control" value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Last name</label>
          <input className="form-control" value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">Specialty</label>
        <input className="form-control" value={form.specialty}
          onChange={(e) => setForm({ ...form, specialty: e.target.value })} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Bio</label>
        <textarea className="form-control" rows={2} value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>
      <div className="form-check mb-3">
        <input type="checkbox" className="form-check-input" id="isActive"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
        <label className="form-check-label" htmlFor="isActive">Active (visible to patients)</label>
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-primary btn-sm">{doctor ? 'Save changes' : 'Add doctor'}</button>
        {doctor && (
          <button type="button" className="btn btn-light btn-sm" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}