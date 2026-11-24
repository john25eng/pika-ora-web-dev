import { Link } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <h2 className="h6 mb-1">{doctor.full_name}</h2>
        <p className="text-muted small mb-2">{doctor.specialty}</p>
        {doctor.bio && <p className="small">{doctor.bio}</p>}
        <Link to={`/doctors/${doctor.id}`} className="btn btn-primary btn-sm">
          View schedule
        </Link>
      </div>
    </div>
  );
}