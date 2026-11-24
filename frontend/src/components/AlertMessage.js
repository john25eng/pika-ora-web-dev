// shows a bootstrap alert, or nothing when there is no message
export default function AlertMessage({ type = 'danger', children }) {
  if (!children) return null;
  return <div className={`alert alert-${type}`}>{children}</div>;
}