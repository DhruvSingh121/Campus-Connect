import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";
import ClubCard from "../components/ClubCard";

export default function MyClubs() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [clubs, setClubs] = useState([]);

  async function load() {
    const { data } = await api.get("/clubs");
    setClubs(data.clubs.filter((c) => user.joinedClubs?.includes(c._id)));
  }
  useEffect(() => { load(); }, []);

  async function handleLeave(club) {
    try {
      const { data } = await api.post(`/clubs/${club._id}/leave`);
      showToast(data.message, "success");
      window.location.reload(); // refresh auth user's joinedClubs
    } catch (err) {
      showToast(err.response?.data?.message || "Could not leave club", "error");
    }
  }

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1>My Clubs</h1>
          <p className="muted">Clubs you're currently a member of.</p>
        </div>
      </div>
      <div className="grid three">
        {clubs.length ? clubs.map((c) => (
          <ClubCard key={c._id} club={c} role={user.role} joined onLeave={handleLeave} />
        )) : <div className="empty">You haven't joined any clubs yet.</div>}
      </div>
    </Layout>
  );
}
