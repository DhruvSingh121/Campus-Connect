import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";
import ClubCard from "../components/ClubCard";
import ClubFormModal from "../components/ClubFormModal";

export default function Clubs() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [clubs, setClubs] = useState([]);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const { data } = await api.get("/clubs");
    setClubs(data.clubs);
  }
  useEffect(() => { load(); }, []);

  async function handleJoin(club) {
    try {
      const { data } = await api.post(`/clubs/${club._id}/join`);
      showToast(`Membership request sent to ${club.name}`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not send join request", "error");
    }
  }
  async function handleLeave(club) {
    try {
      const { data } = await api.post(`/clubs/${club._id}/leave`);
      showToast(data.message, "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not leave club", "error");
    }
  }

  return (
    <Layout withSearch>
      {(search) => {
        const filtered = clubs.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <div className="page-head">
              <div>
                <h1>College Clubs</h1>
                <p className="muted">Discover communities and join the ones you love.</p>
              </div>
              {user.role === "superadmin" && (
                <button className="btn primary" onClick={() => setShowForm(true)}>+ Add Club</button>
              )}
            </div>
            <div className="grid three">
              {filtered.map((c) => (
                <ClubCard
                  key={c._id}
                  club={c}
                  role={user.role}
                  joined={user.joinedClubs?.includes(c._id)}
                  onJoin={handleJoin}
                  onLeave={handleLeave}
                />
              ))}
            </div>
            {showForm && <ClubFormModal onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); load(); }} />}
          </>
        );
      }}
    </Layout>
  );
}
