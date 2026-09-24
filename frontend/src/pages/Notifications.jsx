import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import NotificationFormModal from "../components/NotificationFormModal";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const [nRes, cRes] = await Promise.all([api.get("/notifications"), api.get("/clubs")]);
    setNotifications(nRes.data.notifications);
    setClubs(cRes.data.clubs);
  }
  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1>Notifications</h1>
          <p className="muted">Important announcements and club updates.</p>
        </div>
        {user.role !== "student" && (
          <button className="btn primary" onClick={() => setShowForm(true)}>+ Send Notification</button>
        )}
      </div>
      <div className="card">
        {notifications.length ? notifications.map((n) => (
          <div className="notification" key={n._id}>
            <div className="dot" />
            <div>
              <strong>{n.title}</strong>
              <p className="muted">{n.message}</p>
              <small className="muted">{n.scope} · {new Date(n.createdAt).toLocaleString()}</small>
            </div>
          </div>
        )) : <div className="empty">No notifications yet.</div>}
      </div>
      {showForm && (
        <NotificationFormModal clubs={clubs} onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); load(); }} />
      )}
    </Layout>
  );
}
