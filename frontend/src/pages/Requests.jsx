import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";

export default function Requests() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);

  async function load() {
    const { data } = await api.get("/requests");
    setRequests(data.requests);
  }
  useEffect(() => { load(); }, []);

  async function handleApprove(id) {
    try {
      const { data } = await api.put(`/requests/${id}/approve`);
      showToast(data.message, "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not approve request", "error");
    }
  }
  async function handleReject(id) {
    try {
      const { data } = await api.put(`/requests/${id}/reject`);
      showToast(data.message, "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not reject request", "error");
    }
  }

  const title = user.role === "superadmin" ? "System Approvals" : "Membership Requests";
  const sub = user.role === "clubadmin" ? "Only requests to join your club." : "Review pending requests.";

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p className="muted">{sub}</p>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Student</th><th>Club</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {requests.length ? requests.map((r) => (
                <tr key={r._id}>
                  <td><b>{r.name}</b><br /><small className="muted">{r.email}</small></td>
                  <td>{r.clubName}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="actions">
                      <button className="btn small success" onClick={() => handleApprove(r._id)}>Approve</button>
                      <button className="btn small danger" onClick={() => handleReject(r._id)}>Reject</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="empty">No pending requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
