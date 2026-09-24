import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const DEMO_ACCOUNTS = [
  { label: "Student", email: "student@college.edu" },
  { label: "Club Admin", email: "rahul.sharma@college.edu" },
  { label: "Super Admin", email: "superadmin@college.edu" },
];

export default function Login() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("student@college.edu");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setBusy(true);

    console.log("=================================");
    console.log("🚀 LOGIN/REGISTER STARTED");
    console.log("=================================");
    console.log("Mode:", mode);
    console.log("Email:", email);
    console.log("Password received:", !!password);

    try {
      let result;

      if (mode === "login") {
        console.log("🔐 Calling login...");
        result = await login(email, password);
      } else {
        console.log("📝 Calling register...");
        result = await register(name, email, password);
      }

      console.log("=================================");
      console.log("✅ REQUEST SUCCESSFUL");
      console.log("=================================");
      console.log("Response:", result);

      showToast("Welcome to CampusConnect!", "success");
      navigate("/dashboard");
    } catch (err) {
      console.error("=================================");
      console.error("❌ LOGIN/REGISTER ERROR");
      console.error("=================================");

      // Complete error object
      console.error("Full error:", err);

      // Axios information
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      console.error("Error code:", err.code);

      // Request information
      console.error("Request URL:", err.config?.url);
      console.error("Request method:", err.config?.method);
      console.error("Request baseURL:", err.config?.baseURL);

      // Server response
      console.error("HTTP status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("Response headers:", err.response?.headers);

      // If request was sent but server didn't respond
      console.error("Request object:", err.request);

      // Show useful message on screen
      let message = "Something went wrong.";

      if (err.response) {
        // Backend responded with an error
        message =
          err.response.data?.message || `Server error: ${err.response.status}`;

        console.error("🔴 SERVER RESPONDED WITH ERROR");
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      } else if (err.request) {
        // Request was sent but no response received
        message =
          "No response received from server. Check backend/CORS/network.";

        console.error("🟠 NO RESPONSE FROM SERVER");
      } else {
        // Something happened before request was sent
        message = err.message || "Request setup failed.";

        console.error("🟡 REQUEST SETUP ERROR");
      }

      console.error("Final message:", message);
      console.error("=================================");

      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <div className="login-box">
        <div className="logo">
          Campus<span>Connect</span>
        </div>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="muted">
          {mode === "login"
            ? "Sign in to your college community"
            : "Join your college community"}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="field">
              <label>
                <FiUser /> Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}
          <div className="field">
            <label>
              <FiMail /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu"
              required
            />
          </div>
          <div className="field">
            <label>
              <FiLock /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn primary" type="submit" disabled={busy}>
            {busy
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button onClick={() => setMode("register")}>Register</button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("login")}>Sign in</button>
            </>
          )}
        </p>

        {mode === "login" && (
          <div className="demo">
            <b>Demo accounts</b> (password: password123)
            {DEMO_ACCOUNTS.map((a) => (
              <div className="demo-row" key={a.email}>
                <span>
                  {a.label}: {a.email}
                </span>
                <button type="button" onClick={() => setEmail(a.email)}>
                  Use
                </button>
              </div>
            ))}
            <p style={{ marginTop: 6, fontSize: 11 }}>
              Run <code>npm run seed</code> in /backend first to create these
              accounts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
