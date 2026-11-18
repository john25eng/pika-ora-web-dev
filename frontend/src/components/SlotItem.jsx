// one bookable time slot row
export default function SlotItem({ slot, busy, onBook }) {
  return (
    <div className="list-group-item d-flex justify-content-between align-items-center">
      <div>
        <div className="fw-semibold">{slot.date}</div>
        <div className="text-muted small">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</div>
      </div>
      <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => onBook(slot.id)}>
        {busy ? 'Booking...' : 'Book'}
      </button>
    </div>
  );
}