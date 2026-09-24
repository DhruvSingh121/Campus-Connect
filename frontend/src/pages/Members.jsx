import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";

export default function Members() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [members, setMembers] = useState([]);
  const [clubName, setClubName] = useState("");

  async function load() {
    const [uRes, cRes] = await Promise.all([api.get("/users"), api.get("/clubs")]);
    setMembers(uRes.data.users);
    const club = cRes.data.clubs.find((c) => c._id === user.club);
    setClubName(club?.name || "");
  }
  useEffect(() => { load(); }, []);

  async function handleRemove(memberId) {
    try {
      await api.delete(`/users/${memberId}/clubs/${user.club}`);
      showToast("Member removed", "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not remove member", "error");
    }
  }

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1>{clubName} — Members</h1>
          <p className="muted">Manage members of {clubName} only.</p>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Student</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {members.length ? members.map((m) => (
                <tr key={m._id}>
                  <td><b>{m.name}</b></td>
                  <td>{m.email}</td>
                  <td><span className="tag">{m.status === "active" ? "Active" : "Suspended"}</span></td>
                  <td><button className="btn small danger" onClick={() => handleRemove(m._id)}>Remove</button></td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="empty">No members yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
