import AlertMessage from './AlertMessage';

// shown instead of a page while it loads, or when loading failed
export default function LoadState({ loading, error, onRetry, label = 'Loading...' }) {
  if (loading) {
    return <div className="container mt-4">{label} (the server may take a moment to wake up)</div>;
  }
  if (error) {
    return (
      <div className="container mt-4">
        <AlertMessage>{error}</AlertMessage>
        <button className="btn btn-outline-primary btn-sm" onClick={onRetry}>Try again</button>
      </div>
    );
  }
  return null;
}