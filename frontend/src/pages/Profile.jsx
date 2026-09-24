import { useState } from "react";
import { FiUser, FiMail } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";
import ThemeToggle from "../components/ThemeToggle";

const ROLE_LABEL = { student: "Student", clubadmin: "Club Admin", superadmin: "Super Admin" };

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setBusy(true);
    try {
      await updateProfile({ name, email });
      showToast("Profile updated", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update profile", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1>My Profile</h1>
          <p className="muted">Manage your account details and preferences.</p>
        </div>
      </div>
      <div className="grid two">
        <div className="card">
          <h3>Account Details</h3>
          <div className="field">
            <label><FiUser /> Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label><FiMail /> Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Role</label>
            <input value={ROLE_LABEL[user.role]} disabled />
          </div>
          <button className="btn primary" style={{ marginTop: 18 }} onClick={handleSave} disabled={busy}>
            {busy ? "Saving..." : "Save Changes"}
          </button>
        </div>
        <div className="card">
          <h3>Preferences</h3>
          <div className="field">
            <label>Appearance</label>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </Layout>
  );
}
