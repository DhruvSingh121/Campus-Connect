import { useEffect, useState } from "react";
import { FiCalendar, FiUsers, FiInbox, FiBell, FiUserCheck, FiShield } from "react-icons/fi";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import { formatDate } from "../utils/format";
import EventFormModal from "../components/EventFormModal";
import ClubFormModal from "../components/ClubFormModal";

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showClubModal, setShowClubModal] = useState(false);

  async function loadAll() {
    const [eventsRes, notifRes, clubsRes] = await Promise.all([
      api.get("/events"),
      api.get("/notifications"),
      api.get("/clubs"),
    ]);
    setEvents(eventsRes.data.events);
    setNotifications(notifRes.data.notifications);
    setClubs(clubsRes.data.clubs);
    if (user.role !== "student") {
      const reqRes = await api.get("/requests");
      setRequests(reqRes.data.requests);
    }
  }

  useEffect(() => { loadAll(); }, []); // eslint-disable-line

  async function handleApprove(id) {
    try {
      const { data } = await api.put(`/requests/${id}/approve`);
      showToast(data.message, "success");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not approve request", "error");
    }
  }
  async function handleReject(id) {
    try {
      const { data } = await api.put(`/requests/${id}/reject`);
      showToast(data.message, "success");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not reject request", "error");
    }
  }
  async function handleRegister(event) {
    try {
      const { data } = await api.post(`/events/${event._id}/register`);
      showToast(data.message, "success");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not register", "error");
    }
  }

  if (user.role === "student") {
    const myClubCount = user.joinedClubs?.length || 0;
    const registeredCount = events.filter((e) => e.participants?.includes(user.id)).length;
    return (
      <Layout>
        <div className="page-head">
          <div>
            <h1>Good to see you, {user.name.split(" ")[0]} 👋</h1>
            <p className="muted">Stay connected with your college community.</p>
          </div>
        </div>
        <div className="grid stats">
          <StatCard icon="📅" value={events.length} label="Upcoming Events" />
          <StatCard icon="👥" value={myClubCount} label="My Clubs" />
          <StatCard icon="🎟️" value={registeredCount} label="Registered Events" />
          <StatCard icon="🔔" value={notifications.length} label="Notifications" />
        </div>
        <div className="grid two" style={{ marginTop: 20 }}>
          <div className="card">
            <h3>Upcoming Events</h3>
            {events.slice(0, 4).map((e) => {
              const d = formatDate(e.date);
              const registered = e.participants?.includes(user.id);
              return (
                <div className="event" key={e._id}>
                  <div className="datebox"><b>{d.day}</b><small>{d.mon}</small></div>
                  <div className="event-body">
                    <h4>{e.name}</h4>
                    <span className="tag">{e.clubName}</span> <span className="muted">{e.time} · {e.venue}</span>
                    <div className="event-actions">
                      <button className="btn small primary" disabled={registered} onClick={() => handleRegister(e)}>
                        {registered ? "Registered" : "Register"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {events.length === 0 && <div className="empty">No events found.</div>}
          </div>
          <div className="card">
            <h3>Recent Notifications</h3>
            {notifications.slice(0, 3).map((n) => (
              <div className="notification" key={n._id}>
                <div className="dot" />
                <div>
                  <strong>{n.title}</strong>
                  <p className="muted">{n.message}</p>
                  <small className="muted">{n.scope}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (user.role === "clubadmin") {
    const myClub = clubs.find((c) => c._id === user.club) || {};
    return (
      <Layout>
        <div className="page-head">
          <div>
            <h1>{myClub.icon} {myClub.name} — Admin Dashboard</h1>
            <p className="muted">Manage your club, members and events.</p>
          </div>
          <button className="btn primary" onClick={() => setShowEventModal(true)}>+ Create Event</button>
        </div>
        <div className="grid stats">
          <StatCard icon="👥" value={myClub.memberCount || 0} label="Club Members" />
          <StatCard icon="📥" value={requests.length} label="Pending Requests" />
          <StatCard icon="📅" value={events.length} label="Upcoming Events" />
          <StatCard icon="🔔" value={notifications.length} label="Announcements" />
        </div>
        <div className="grid two" style={{ marginTop: 20 }}>
          <div className="card">
            <h3>Upcoming Club Events</h3>
            {events.slice(0, 4).map((e) => {
              const d = formatDate(e.date);
              return (
                <div className="event" key={e._id}>
                  <div className="datebox"><b>{d.day}</b><small>{d.mon}</small></div>
                  <div className="event-body">
                    <h4>{e.name}</h4>
                    <span className="tag">{e.clubName}</span> <span className="muted">{e.time} · {e.venue}</span>
                  </div>
                </div>
              );
            })}
            {events.length === 0 && <div className="empty">No events yet — create one.</div>}
          </div>
          <div className="card">
            <h3>Membership Requests</h3>
            {requests.length ? requests.slice(0, 4).map((r) => (
              <div className="notice" key={r._id}>
                <strong>{r.name}</strong>
                <span className="muted"> {r.clubName} · {new Date(r.createdAt).toLocaleDateString()}</span>
                <div className="actions" style={{ marginTop: 9 }}>
                  <button className="btn small success" onClick={() => handleApprove(r._id)}>Approve</button>
                  <button className="btn small danger" onClick={() => handleReject(r._id)}>Reject</button>
                </div>
              </div>
            )) : <div className="empty">No pending requests.</div>}
          </div>
        </div>
        {showEventModal && (
          <EventFormModal
            clubs={clubs}
            user={user}
            onClose={() => setShowEventModal(false)}
            onCreated={() => { setShowEventModal(false); loadAll(); }}
          />
        )}
      </Layout>
    );
  }

  // superadmin
  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1>Super Admin Dashboard</h1>
          <p className="muted">Complete control over clubs, students and events.</p>
        </div>
        <button className="btn primary" onClick={() => setShowClubModal(true)}>+ Add Club</button>
      </div>
      <div className="grid stats">
        <StatCard icon={<FiUserCheck />} value="—" label="Total Students" />
        <StatCard icon={<FiUsers />} value={clubs.length} label="Active Clubs" />
        <StatCard icon={<FiShield />} value={clubs.filter((c) => c.adminName !== "Not assigned").length} label="Club Admins" />
        <StatCard icon={<FiCalendar />} value={events.length} label="Total Events" />
      </div>
      <div className="grid two" style={{ marginTop: 20 }}>
        <div className="card">
          <h3>Pending Approvals</h3>
          <div className="notice">
            <strong><FiShield /> {clubs.filter((c) => c.adminName === "Not assigned").length} Clubs Without Admins</strong>
            <span className="muted">Assign administrators to keep clubs running</span>
          </div>
          <div className="notice">
            <strong><FiInbox /> {requests.length} Membership Requests</strong>
            <span className="muted">Students waiting for club approval</span>
          </div>
          <div className="notice">
            <strong><FiCalendar /> {events.filter((e) => e.status === "Pending").length} Event Approvals</strong>
            <span className="muted">Events submitted by club admins</span>
          </div>
        </div>
        <div className="card">
          <h3>System Activity</h3>
          {notifications.slice(0, 4).map((n) => (
            <div className="notification" key={n._id}>
              <div className="dot" />
              <div>
                <strong>{n.title}</strong>
                <p className="muted">{n.message}</p>
                <small className="muted">{n.scope}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showClubModal && (
        <ClubFormModal onClose={() => setShowClubModal(false)} onCreated={() => { setShowClubModal(false); loadAll(); }} />
      )}
    </Layout>
  );
}
