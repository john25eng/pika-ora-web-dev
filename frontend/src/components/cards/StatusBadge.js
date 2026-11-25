// small coloured label, e.g. confirmed, active, booked
export default function StatusBadge({ label, variant = 'secondary' }) {
  const text = variant === 'warning' ? ' text-dark' : '';
  return <span className={`badge bg-${variant}${text}`}>{label}</span>;
}