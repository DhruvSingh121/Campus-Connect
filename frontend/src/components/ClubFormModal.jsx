import { useState } from "react";
import Modal from "./Modal";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function ClubFormModal({ onClose, onCreated }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", icon: "🌟", description: "" });
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!form.name.trim()) return showToast("Enter club name", "error");
    setBusy(true);
    try {
      await api.post("/clubs", form);
      showToast("Club created", "success");
      onCreated();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not create club", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Add Club" onClose={onClose}>
      <div className="form-grid">
        <div className="field">
          <label>Club Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Icon</label>
          <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        </div>
        <div className="field full">
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>
      <button className="btn primary" style={{ marginTop: 18 }} onClick={handleSubmit} disabled={busy}>
        {busy ? "Creating..." : "Create Club"}
      </button>
    </Modal>
  );
}
