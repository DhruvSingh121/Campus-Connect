import { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => new Set(JSON.parse(localStorage.getItem("cc_read_notifs") || "[]")));
  const ref = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    api.get("/notifications").then(({ data }) => {
      if (mounted) setNotifications(data.notifications || []);
    }).catch(() => {});
    const interval = setInterval(() => {
      api.get("/notifications").then(({ data }) => mounted && setNotifications(data.notifications || [])).catch(() => {});
    }, 20000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const scoped = notifications.filter((n) => {
    if (n.scope === "All Students") return true;
    if (user?.role !== "student") return true; // admins see everything
    return false; // students only see "All Students" scope + their own club scope (simplified demo rule)
  });

  const unreadCount = scoped.filter((n) => !readIds.has(n._id)).length;

  function markAllRead() {
    const ids = new Set(readIds);
    scoped.forEach((n) => ids.add(n._id));
    setReadIds(ids);
    localStorage.setItem("cc_read_notifs", JSON.stringify([...ids]));
  }

  return (
    <div className="bell-wrap" ref={ref}>
      <button className="bell-btn" onClick={() => { setOpen((o) => !o); if (!open) markAllRead(); }} aria-label="Notifications">
        <FiBell />
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="bell-dropdown">
          <h4>Notifications</h4>
          {scoped.length === 0 && <div className="empty">No notifications yet.</div>}
          {scoped.slice(0, 12).map((n) => (
            <div className="notification" key={n._id}>
              <div className="dot" />
              <div>
                <strong>{n.title}</strong>
                <p className="muted">{n.message}</p>
                <small className="muted">{n.scope} · {new Date(n.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
