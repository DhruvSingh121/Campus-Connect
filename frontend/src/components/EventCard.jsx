import { formatDate } from "../utils/format";

export default function EventCard({ event, role, onRegister, onManage, registered }) {
  const d = formatDate(event.date);
  return (
    <div className="card">
      <div className="datebox" style={{ marginBottom: 14 }}>
        <b>{d.day}</b>
        <small>{d.mon}</small>
      </div>
      <span className={`tag status-${event.status?.toLowerCase()}`}>{event.clubName}</span>
      <h3 style={{ margin: "10px 0 5px" }}>{event.name}</h3>
      <p className="muted">{event.description}</p>
      <p style={{ marginTop: 12 }}>
        🕐 {event.time}
        <br />
        📍 {event.venue}
        <br />
        👥 {event.participants?.length || 0} registered · <span className={`tag status-${event.status?.toLowerCase()}`}>{event.status}</span>
      </p>
      <div className="event-actions">
        {role === "student" ? (
          <button className="btn primary" disabled={registered} onClick={() => onRegister(event)}>
            {registered ? "Registered" : "Register"}
          </button>
        ) : (
          <button className="btn" onClick={() => onManage(event)}>Manage</button>
        )}
      </div>
    </div>
  );
}
