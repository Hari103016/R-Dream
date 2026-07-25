import "./Sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPinned,
  CalendarDays,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("loggedIn");
    navigate("/");
  };

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Close Button */}
        <button
          className="close-btn"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">🏡</div>

          <div>
            <h2>R DREAM</h2>
            <span>Luxury Real Estate CRM</span>
          </div>
        </div>

        {/* Navigation */}
        <nav>
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "active" : ""}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
          >
            <Users size={20} />
            Customers
          </Link>

          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
          >
            <MapPinned size={20} />
            Plots
          </Link>

          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
          >
            <CalendarDays size={20} />
            Bookings
          </Link>

          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
          >
            <CreditCard size={20} />
            Payments
          </Link>

          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
          >
            <BarChart3 size={20} />
            Reports
          </Link>

          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
          >
            <Settings size={20} />
            Settings
          </Link>
        </nav>

        {/* Profile */}
        <div className="profile">
          <img
            src="https://i.pravatar.cc/80"
            alt="Admin"
          />

          <div>
            <h4>Hari</h4>
            <p>Administrator</p>
          </div>
        </div>

        {/* Logout */}
        <button className="logout" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
}

export default Sidebar;