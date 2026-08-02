import { useEffect, useState } from "react";
import "./Sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import logo from "../assets/logo.png";

import {
  LayoutDashboard,
  Users,
  MapPinned,
  CalendarDays,
  CreditCard,
  BarChart3,
  Settings,
  UserCircle2,
  LogOut,
  X,
} from "lucide-react";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState({
    full_name: "",
    role: "Administrator",
    avatar_url: "",
  });

  useEffect(() => {
    loadAdmin();
  }, []);

  async function loadAdmin() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setAdmin({
        full_name: data.full_name,
        role: data.role,
        avatar_url: data.avatar_url,
      });
    } catch (err) {
      console.log(err);
    }
  }

  const closeSidebar = () => setSidebarOpen(false);

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/", {
      replace: true,
    });
  }

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
      name: "Admin Profile",
      icon: UserCircle2,
      path: "/admin-profile",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
    {
      name: "Layout Map",
      icon: MapPinned,
      path: "/layout-map",
    },
  ];

  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        {/* Close */}

        <button
          className="close-btn"
          onClick={closeSidebar}
        >
          <X size={24} />
        </button>

        {/* Company */}

        <div className="logo">
          <img
            src={logo}
            alt="Company Logo"
            className="company-logo"
          />

          <div className="company-details">
            <h2>R DREAM</h2>

            <span>
              Luxury Real Estate CRM
            </span>
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
                  location.pathname === item.path
                    ? "active"
                    : ""
                }
                onClick={closeSidebar}
              >
                <Icon size={20} />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}

        <div className="sidebar-bottom">

          {/* Admin Profile */}

          <div
            className="profile"
            onClick={() =>
              navigate("/admin-profile")
            }
          >
            <div
              className="profile-avatar"
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "#444",
              }}
            />

            <div className="profile-info">
              <h4>
                {admin.full_name ||
                  "Administrator"}
              </h4>

              <p>
                {admin.role ||
                  "Administrator"}
              </p>
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

        </div>
      </aside>
    </>
  );
}

export default Sidebar;