import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";
import EventCard from "../components/EventCard";
import EventFormModal from "../components/EventFormModal";
import Modal from "../components/Modal";

export default function Events() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [detailEvent, setDetailEvent] = useState(null);

  async function load() {
    const [eRes, cRes] = await Promise.all([api.get("/events"), api.get("/clubs")]);
    setEvents(eRes.data.events);
    setClubs(cRes.data.clubs);
  }
  useEffect(() => { load(); }, []);

  async function handleRegister(event) {
    try {
      const { data } = await api.post(`/events/${event._id}/register`);
      showToast(data.message, "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not register", "error");
    }
  }

  async function handleStatusChange(event, status) {
    try {
      await api.put(`/events/${event._id}/status`, { status });
      showToast(`Event ${status.toLowerCase()}`, "success");
      setDetailEvent(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update event", "error");
    }
  }

  const title = user.role === "clubadmin" ? "Club Events" : "Events";
  const sub = user.role === "clubadmin" ? "Events run by your club." : "Browse and manage upcoming college events.";

  return (
    <Layout withSearch>
      {(search) => {
        const filtered = events.filter((e) =>
          !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.clubName.toLowerCase().includes(search.toLowerCase())
        );
        return (
          <>
            <div className="page-head">
              <div>
                <h1>{title}</h1>
                <p className="muted">{sub}</p>
              </div>
              {user.role !== "student" && (
                <button className="btn primary" onClick={() => setShowForm(true)}>+ Create Event</button>
              )}
            </div>
            <div className="grid three">
              {filtered.length ? filtered.map((e) => (
                <EventCard
                  key={e._id}
                  event={e}
                  role={user.role}
                  registered={e.participants?.includes(user.id)}
                  onRegister={handleRegister}
                  onManage={setDetailEvent}
                />
              )) : <div className="empty">No events yet — create one.</div>}
            </div>
            {showForm && (
              <EventFormModal clubs={clubs} user={user} onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); load(); }} />
            )}
            {detailEvent && (
              <Modal title={detailEvent.name} onClose={() => setDetailEvent(null)}>
                <span className="tag">{detailEvent.clubName}</span>
                <p style={{ margin: "15px 0" }}>{detailEvent.description}</p>
                <p>📅 {detailEvent.date}<br />🕐 {detailEvent.time}<br />📍 {detailEvent.venue}<br />👥 {detailEvent.participants?.length || 0} registered</p>
                {user.role === "superadmin" && (
                  <div className="actions" style={{ marginTop: 18 }}>
                    <button className="btn small success" onClick={() => handleStatusChange(detailEvent, "Approved")}>Approve</button>
                    <button className="btn small danger" onClick={() => handleStatusChange(detailEvent, "Rejected")}>Reject</button>
                  </div>
                )}
              </Modal>
            )}
          </>
        );
      }}
    </Layout>
  );
}
