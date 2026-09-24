export default function StatCard({ icon, value, label }) {
  return (
    <div className="stat">
      <div className="icon">{icon}</div>
      <h2>{value}</h2>
      <p>{label}</p>
    </div>
  );
}
