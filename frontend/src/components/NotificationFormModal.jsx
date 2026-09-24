import { useState } from "react";
import Modal from "./Modal";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function NotificationFormModal({ clubs, onClose, onCreated }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: "", message: "", scope: "All Students" });
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!form.title.trim()) return showToast("Enter a title", "error");
    setBusy(true);
    try {
      await api.post("/notifications", form);
      showToast("Notification sent", "success");
      onCreated();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not send notification", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Send Notification" onClose={onClose}>
      <div className="field">
        <label>Title</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label>Message</label>
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label>Audience</label>
        <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
          <option>All Students</option>
          {clubs.map((c) => <option key={c._id}>{c.name} Members</option>)}
        </select>
      </div>
      <button className="btn primary" style={{ marginTop: 18 }} onClick={handleSubmit} disabled={busy}>
        {busy ? "Sending..." : "Send Notification"}
      </button>
    </Modal>
  );
}
