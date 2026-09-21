import { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';

const emptyForm = { first_name: '', last_name: '', specialty: '', bio: '', is_active: true };

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  function load() {
    adminApi.listDoctors().then((res) => setDoctors(res.data));
  }

  useEffect(load, []);

  function startEdit(doc) {
    setEditingId(doc.id);
    setForm({
      first_name: doc.first_name, last_name: doc.last_name,
      specialty: doc.specialty, bio: doc.bio, is_active: doc.is_active,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await adminApi.updateDoctor(editingId, form);
      } else {
        await adminApi.createDoctor(form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this doctor profile? This also removes their appointment slots.')) return;
    try {
      await adminApi.deleteDoctor(id);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="container mt-4">
      <h1 className="h4 mb-4">Manage Doctors</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h6 mb-3">{editingId ? 'Edit doctor' : 'Add doctor'}</h2>
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
              <button className="btn btn-primary btn-sm">{editingId ? 'Save changes' : 'Add doctor'}</button>
              {editingId && (
                <button type="button" className="btn btn-light btn-sm" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>

      <table className="table table-sm align-middle">
        <thead>
          <tr><th>Name</th><th>Specialty</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {doctors.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.full_name}</td>
              <td>{doc.specialty}</td>
              <td>
                <span className={`badge ${doc.is_active ? 'bg-success' : 'bg-secondary'}`}>
                  {doc.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="text-end">
                <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => startEdit(doc)}>Edit</button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(doc.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
