import { useState } from 'react';
import StatusBadge from './StatusBadge';
import RescheduleForm from './RescheduleForm';

// one appointment with its note editor and reschedule form
// the on... handlers must return true when the action worked
export default function AppointmentCard({ appointment, loadSlots, onSaveNote, onReschedule, onCancel }) {
  const [mode, setMode] = useState(null); // 'note', 'reschedule' or null
  const [noteDraft, setNoteDraft] = useState('');

  function openNote() {
    setNoteDraft(appointment.notes || '');
    setMode('note');
  }

  async function saveNote() {
    if (await onSaveNote(appointment.id, noteDraft)) setMode(null);
  }

  async function confirmReschedule(slotId) {
    if (await onReschedule(appointment.id, slotId)) setMode(null);
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h2 className="h6 mb-1">{appointment.doctor_name}</h2>
            <div className="text-muted small mb-2">
              {appointment.date} at {appointment.start_time.slice(0, 5)}
            </div>
            <StatusBadge
              label={appointment.status}
              variant={appointment.status === 'confirmed' ? 'success' : 'secondary'}
            />
          </div>
          {appointment.status === 'confirmed' && (
            <div className="d-flex gap-2 flex-wrap">
              <button className="btn btn-outline-primary btn-sm" onClick={() => setMode('reschedule')}>
                Reschedule
              </button>
              <button className="btn btn-outline-secondary btn-sm" onClick={openNote}>
                Edit note
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={() => onCancel(appointment.id)}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {mode === 'note' ? (
          <div className="mt-3">
            <textarea
              className="form-control mb-2"
              rows={3}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Reason for visit, symptoms, etc. (optional)"
            />
            <div className="d-flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={saveNote}>Save</button>
              <button className="btn btn-light btn-sm" onClick={() => setMode(null)}>Cancel</button>
            </div>
          </div>
        ) : (
          appointment.notes && <p className="mt-3 mb-0 small">{appointment.notes}</p>
        )}

        {mode === 'reschedule' && (
          <RescheduleForm
            loadSlots={loadSlots}
            onConfirm={confirmReschedule}
            onCancel={() => setMode(null)}
          />
        )}
      </div>
    </div>
  );
}