import { useEffect, useState } from 'react';
import { apiErrorMessage } from '../api/client';

// loadSlots must return a promise resolving to a list of open slots
export default function RescheduleForm({ loadSlots, onConfirm, onCancel }) {
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSlots()
      .then(setSlots)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="small text-muted mt-2">Loading open slots...</div>;

  return (
    <div className="mt-3">
      {error && <div className="alert alert-danger py-1 small">{error}</div>}
      {slots.length === 0 ? (
        <div className="small text-muted mb-2">No other open slots available for this doctor.</div>
      ) : (
        <select className="form-select form-select-sm mb-2" value={slotId} onChange={(e) => setSlotId(e.target.value)}>
          <option value="">Choose a new date and time</option>
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.date} {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
            </option>
          ))}
        </select>
      )}
      <div className="d-flex gap-2">
        <button className="btn btn-primary btn-sm" disabled={!slotId} onClick={() => onConfirm(Number(slotId))}>
          Confirm change
        </button>
        <button className="btn btn-light btn-sm" onClick={onCancel}>Close</button>
      </div>
    </div>
  );
}
