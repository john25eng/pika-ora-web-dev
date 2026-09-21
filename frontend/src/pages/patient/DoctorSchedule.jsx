import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';

export default function DoctorSchedule() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState(null);

  function loadSlots() {
    setLoading(true);
    patientApi.doctorSlots(doctorId).then((res) => {
      setSlots(res.data);
      setLoading(false);
    });
  }

  useEffect(loadSlots, [doctorId]);

  async function handleBook(slotId) {
    setError('');
    setBookingId(slotId);
    try {
      await patientApi.book(slotId);
      navigate('/my-appointments');
    } catch (err) {
      setError(apiErrorMessage(err));
      loadSlots(); // someone may have just taken the slot - refresh
    } finally {
      setBookingId(null);
    }
  }

  if (loading) return <div className="container mt-4">Loading schedule...</div>;

  return (
    <div className="container mt-4">
      <h1 className="h4 mb-4">Available appointments</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {slots.length === 0 && <p className="text-muted">No open slots for this doctor right now.</p>}
      <div className="list-group">
        {slots.map((slot) => (
          <div key={slot.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold">{slot.date}</div>
              <div className="text-muted small">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              disabled={bookingId === slot.id}
              onClick={() => handleBook(slot.id)}
            >
              {bookingId === slot.id ? 'Booking...' : 'Book'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
