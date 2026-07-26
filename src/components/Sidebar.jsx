import "./Sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
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

  const closeSidebar = () => setSidebarOpen(false);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/", { replace: true });
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Customers",
      icon: Users,
      path: "/customers",
    },
    {
      name: "Plots",
      icon: MapPinned,
      path: "/plots",
    },
    {
      name: "Bookings",
      icon: CalendarDays,
      path: "/bookings",
    },
    {
      name: "Payments",
      icon: CreditCard,
      path: "/payments",
    },
    {
      name: "Reports",
      icon: BarChart3,
      path: "/reports",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Close Button */}
        <button
          className="close-btn"
          onClick={closeSidebar}
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
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={
                  location.pathname === item.path ? "active" : ""
                }
                onClick={closeSidebar}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="profile">
          <div>
            <h4>Hari</h4>
            <p>Administrator</p>
          </div>
        </div>

        {/* Logout */}
        <button
          className="logout"
          onClick={logout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
}

export default Sidebar;