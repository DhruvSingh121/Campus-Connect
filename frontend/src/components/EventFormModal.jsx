import { useState } from "react";
import Modal from "./Modal";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function EventFormModal({ clubs, user, onClose, onCreated }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "", clubId: user.role === "clubadmin" ? user.club : (clubs[0]?._id || ""),
    date: "", time: "", venue: "", description: "",
  });
  const [busy, setBusy] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit() {
    if (!form.name.trim()) return showToast("Enter an event name", "error");
    setBusy(true);
    try {
      await api.post("/events", form);
      showToast("Event created successfully", "success");
      onCreated();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not create event", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Create Event" onClose={onClose}>
      <div className="form-grid">
        <div className="field">
          <label>Event Name</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Tech Fest" />
        </div>
        <div className="field">
          <label>Club</label>
          {user.role === "clubadmin" ? (
            <input value={user.club ? clubs.find((c) => c._id === user.club)?.name || "" : ""} disabled />
          ) : (
            <select value={form.clubId} onChange={(e) => update("clubId", e.target.value)}>
              {clubs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          )}
        </div>
        <div className="field">
          <label>Date</label>
          <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
        </div>
        <div className="field">
          <label>Time</label>
          <input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} />
        </div>
        <div className="field full">
          <label>Venue</label>
          <input value={form.venue} onChange={(e) => update("venue", e.target.value)} placeholder="Auditorium / Lab 3" />
        </div>
        <div className="field full">
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the event..." />
        </div>
      </div>
      <button className="btn primary" style={{ marginTop: 18 }} onClick={handleSubmit} disabled={busy}>
        {busy ? "Creating..." : "Create Event"}
      </button>
    </Modal>
  );
}
