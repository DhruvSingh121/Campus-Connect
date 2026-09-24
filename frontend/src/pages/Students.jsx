import { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";

export default function Students() {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);

  async function load() {
    const { data } = await api.get("/users");
    setStudents(data.users);
  }
  useEffect(() => { load(); }, []);

  async function toggleStatus(student) {
    const newStatus = student.status === "active" ? "suspended" : "active";
    try {
      await api.put(`/users/${student._id}/status`, { status: newStatus });
      showToast(newStatus === "suspended" ? "Student suspended" : "Student reactivated", "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update student", "error");
    }
  }

  return (
    <Layout withSearch>
      {(search) => {
        const filtered = students.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
        return (
          <>
            <div className="page-head">
              <div>
                <h1>Students</h1>
                <p className="muted">Manage registered students.</p>
              </div>
            </div>
            <div className="card">
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Student</th><th>Email</th><th>Clubs</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {filtered.length ? filtered.map((s) => (
                      <tr key={s._id}>
                        <td><b>{s.name}</b></td>
                        <td>{s.email}</td>
                        <td>{s.joinedClubs?.length || 0}</td>
                        <td><span className={`tag ${s.status === "suspended" ? "status-rejected" : ""}`}>{s.status === "active" ? "Active" : "Suspended"}</span></td>
                        <td>
                          <button className={`btn small ${s.status === "active" ? "danger" : "success"}`} onClick={() => toggleStatus(s)}>
                            {s.status === "active" ? "Suspend" : "Reactivate"}
                          </button>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={5} className="empty">No students found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      }}
    </Layout>
  );
}
