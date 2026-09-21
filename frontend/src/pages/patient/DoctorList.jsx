import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { patientApi } from '../../api/endpoints';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientApi.listDoctors().then((res) => {
      setDoctors(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container mt-4">Loading doctors...</div>;

  return (
    <div className="container mt-4">
      <h1 className="h4 mb-4">Our Doctors</h1>
      {doctors.length === 0 && <p className="text-muted">No doctors are available right now.</p>}
      <div className="row g-3">
        {doctors.map((doc) => (
          <div className="col-md-4" key={doc.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h2 className="h6 mb-1">{doc.full_name}</h2>
                <p className="text-muted small mb-2">{doc.specialty}</p>
                {doc.bio && <p className="small">{doc.bio}</p>}
                <Link to={`/doctors/${doc.id}`} className="btn btn-primary btn-sm">
                  View schedule
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
