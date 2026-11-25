import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import PageLayout from '../../components/layout/PageLayout';
import LoadState from '../../components/layout/LoadState';
import AlertMessage from '../../components/layout/AlertMessage';
import SlotItem from '../../components/cards/SlotItem';

export default function DoctorSchedule() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(
    () => patientApi.doctorSlots(doctorId),
    [doctorId]
  );
  const slots = data ?? [];
  const [bookError, setBookError] = useState('');
  const [bookingId, setBookingId] = useState(null);

  async function handleBook(slotId) {
    setBookError('');
    setBookingId(slotId);
    try {
      await patientApi.book(slotId);
      navigate('/my-appointments');
    } catch (err) {
      setBookError(apiErrorMessage(err));
      reload(); // someone may have just taken the slot - refresh
    } finally {
      setBookingId(null);
    }
  }

  if (loading || error) {
    return <LoadState loading={loading} error={error} onRetry={reload} label="Loading schedule..." />;
  }

  return (
    <PageLayout title="Available appointments">
      <AlertMessage>{bookError}</AlertMessage>
      {slots.length === 0 && <p className="text-muted">No open slots for this doctor right now.</p>}
      <div className="list-group">
        {slots.map((slot) => (
          <SlotItem key={slot.id} slot={slot} busy={bookingId === slot.id} onBook={handleBook} />
        ))}
      </div>
    </PageLayout>
  );
}