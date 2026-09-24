import { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";
import Modal from "../components/Modal";

export default function ClubAdmins() {
  const { showToast } = useToast();
  const [clubs, setClubs] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignClub, setAssignClub] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  async function load() {
    const [cRes, uRes] = await Promise.all([api.get("/clubs"), api.get("/users")]);
    setClubs(cRes.data.clubs);
    setStudents(uRes.data.users);
  }
  useEffect(() => { load(); }, []);

  async function handleAssign() {
    if (!selectedUserId) return showToast("Select a student first", "error");
    try {
      await api.put(`/clubs/${assignClub._id}/assign-admin`, { userId: selectedUserId });
      showToast("Club admin assigned", "success");
      setAssignClub(null);
      setSelectedUserId("");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not assign admin", "error");
    }
  }

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1>Club Administrators</h1>
          <p className="muted">Assign and manage administrators for every club.</p>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Club</th><th>Administrator</th><th>Members</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {clubs.map((c) => (
                <tr key={c._id}>
                  <td><b>{c.icon} {c.name}</b></td>
                  <td>{c.adminName}</td>
                  <td>{c.memberCount}</td>
                  <td><span className="tag">{c.adminName === "Not assigned" ? "Unassigned" : "Active"}</span></td>
                  <td><button className="btn small warning" onClick={() => setAssignClub(c)}>Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {assignClub && (
        <Modal title={`Assign Admin — ${assignClub.name}`} onClose={() => setAssignClub(null)}>
          <div className="field">
            <label>Student / Administrator</label>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              <option value="">Select a student...</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
            </select>
          </div>
          <button className="btn primary" style={{ marginTop: 18 }} onClick={handleAssign}>Assign</button>
        </Modal>
      )}
    </Layout>
  );
}
