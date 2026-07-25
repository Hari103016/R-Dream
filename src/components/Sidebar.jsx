import "./Sidebar.css";
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
  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        {/* Mobile Close Button */}
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

          <a
            href="/dashboard"
            className="active"
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </a>

          <a
            href="/customers"
            onClick={() => setSidebarOpen(false)}
          >
            <Users size={20} />
            Customers
          </a>

          <a
            href="/plots"
            onClick={() => setSidebarOpen(false)}
          >
            <MapPinned size={20} />
            Plots
          </a>

          <a
            href="/bookings"
            onClick={() => setSidebarOpen(false)}
          >
            <CalendarDays size={20} />
            Bookings
          </a>

          <a
            href="/payments"
            onClick={() => setSidebarOpen(false)}
          >
            <CreditCard size={20} />
            Payments
          </a>

          <a
            href="/reports"
            onClick={() => setSidebarOpen(false)}
          >
            <BarChart3 size={20} />
            Reports
          </a>

          <a
            href="/settings"
            onClick={() => setSidebarOpen(false)}
          >
            <Settings size={20} />
            Settings
          </a>

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
        <button className="logout">
          <LogOut size={18} />
          Logout
        </button>

      </aside>
    </>
  );
}

export default Sidebar;