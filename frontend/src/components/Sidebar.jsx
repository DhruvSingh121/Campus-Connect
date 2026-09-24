import { NavLink } from "react-router-dom";
import {
  FiHome, FiCalendar, FiUsers, FiStar, FiBell, FiSettings, FiLogOut,
  FiInbox, FiShield, FiUserCheck,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const NAV = {
  student: [
    { to: "/dashboard", icon: <FiHome />, label: "Dashboard" },
    { to: "/events", icon: <FiCalendar />, label: "Events" },
    { to: "/clubs", icon: <FiUsers />, label: "Clubs" },
    { to: "/my-clubs", icon: <FiStar />, label: "My Clubs" },
    { to: "/notifications", icon: <FiBell />, label: "Notifications" },
  ],
  clubadmin: [
    { to: "/dashboard", icon: <FiHome />, label: "Dashboard" },
    { to: "/members", icon: <FiUsers />, label: "Members" },
    { to: "/requests", icon: <FiInbox />, label: "Membership Requests" },
    { to: "/events", icon: <FiCalendar />, label: "Events" },
    { to: "/notifications", icon: <FiBell />, label: "Notifications" },
  ],
  superadmin: [
    { to: "/dashboard", icon: <FiHome />, label: "Dashboard" },
    { to: "/students", icon: <FiUserCheck />, label: "Students" },
    { to: "/clubs", icon: <FiUsers />, label: "Clubs" },
    { to: "/club-admins", icon: <FiShield />, label: "Club Admins" },
    { to: "/events", icon: <FiCalendar />, label: "Events" },
    { to: "/requests", icon: <FiInbox />, label: "Approvals" },
    { to: "/notifications", icon: <FiBell />, label: "Notifications" },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const items = NAV[user?.role] || NAV.student;

  return (
    <aside className="sidebar">
      <div className="logo">
        Campus<span>Connect</span>
      </div>
      <div className="nav-title">Menu</div>
      <nav className="nav">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "active" : "")}>
            {item.icon} {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <div className="nav-title">Account</div>
      <div className="nav">
        <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
          <FiSettings /> Profile
        </NavLink>
        <button onClick={logout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );
}
