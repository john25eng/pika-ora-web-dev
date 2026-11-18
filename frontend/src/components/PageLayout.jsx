// page wrapper with the standard container and heading
export default function PageLayout({ title, children }) {
  return (
    <div className="container mt-4">
      <h1 className="h4 mb-4">{title}</h1>
      {children}
    </div>
  );
}