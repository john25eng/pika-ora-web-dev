// one number on the admin dashboard
export default function StatCard({ label, value }) {
  return (
    <div className="card shadow-sm text-center">
      <div className="card-body">
        <div className="display-6">{value}</div>
        <div className="text-muted small">{label}</div>
      </div>
    </div>
  );
}