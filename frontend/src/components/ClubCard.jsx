export default function ClubCard({ club, role, joined, onJoin, onLeave }) {
  return (
    <div className="card club-card">
      <div className="club-banner">{club.icon}</div>
      <div className="club-content">
        <h3>{club.name}</h3>
        <p>{club.description}</p>
        <div className="club-meta">
          <span>👥 {club.memberCount} members</span>
          <span>🛡️ {club.adminName}</span>
        </div>
        {role === "student" && (
          <button
            className={`btn ${joined ? "danger" : "primary"}`}
            onClick={() => (joined ? onLeave(club) : onJoin(club))}
          >
            {joined ? "Leave Club" : "Request to Join"}
          </button>
        )}
      </div>
    </div>
  );
}
