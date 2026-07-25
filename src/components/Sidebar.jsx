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
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-icon">🏡</div>

        <div>
          <h2>R DREAM</h2>
          <span>Luxury Real Estate CRM</span>
        </div>
      </div>

      <nav>

        <a href="/dashboard" className="active">
          <LayoutDashboard size={20} />
          Dashboard
        </a>

        <a href="/customers">
          <Users size={20} />
          Customers
        </a>

        <a href="/plots">
          <MapPinned size={20} />
          Plots
        </a>

        <a href="/bookings">
          <CalendarDays size={20} />
          Bookings
        </a>

        <a href="/payments">
          <CreditCard size={20} />
          Payments
        </a>

        <a href="/reports">
          <BarChart3 size={20} />
          Reports
        </a>

        <a href="/settings">
          <Settings size={20} />
          Settings
        </a>

      </nav>

      <div className="profile">
        <img
          src="https://i.pravatar.cc/80"
          alt="admin"
        />

        <div>
          <h4>Hari</h4>
          <p>Administrator</p>
        </div>
      </div>

      <button className="logout">
        <LogOut size={18} />
        Logout
      </button>

    </aside>
  );
}

export default Sidebar;