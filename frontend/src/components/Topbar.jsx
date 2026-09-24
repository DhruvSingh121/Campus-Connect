import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

const ROLE_LABEL = { student: "Student", clubadmin: "Club Admin", superadmin: "Super Admin" };

export default function Topbar({ search, onSearch }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      {onSearch ? (
        <input
          className="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      ) : <div />}
      <div className="topbar-right">
        <ThemeToggle />
        <NotificationBell />
        <div className="profile">
          <div>
            <b>{user?.name}</b>
            <br />
            <small className="muted">{ROLE_LABEL[user?.role] || "Student"}</small>
          </div>
          <div className="avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
        </div>
      </div>
    </header>
  );
}
