import "./Sidebar.css";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../services/supabase";

import {
  LayoutDashboard,
  Users,
  MapPinned,
  CalendarDays,
  CreditCard,
  MapPin,
  BellRing,
  FolderOpen,
  UserCircle,
  Settings,
  LogOut,
  X,
  CheckCircle2,
} from "lucide-react";

// ==========================================
// SIDEBAR MENU
// ==========================================

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
    name: "Layout Map",
    icon: MapPin,
    path: "/layout-map",
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

  // ==========================================
  // NEW - REGISTRATION COMPLETED
  // ==========================================

  {
    name: "Registration Completed",
    icon: CheckCircle2,
    path: "/registration-completed",
  },

  {
    name: "Site Visits",
    icon: MapPin,
    path: "/site-visits",
  },

  {
    name: "Follow-ups",
    icon: BellRing,
    path: "/follow-ups",
  },

  {
    name: "Documents",
    icon: FolderOpen,
    path: "/documents",
  },

  {
    name: "Admin Profile",
    icon: UserCircle,
    path: "/admin-profile",
  },

  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar({
  isOpen,
  setIsOpen,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    await supabase.auth.signOut();

    navigate("/");
  };

  // ==========================================
  // CLOSE MOBILE MENU
  // ==========================================

  const closeMobileMenu = () => {
    if (
      window.innerWidth <= 768 &&
      setIsOpen
    ) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* ======================================
          MOBILE OVERLAY
      ====================================== */}

      {isOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() =>
            setIsOpen?.(false)
          }
          aria-hidden="true"
        />
      )}

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`sidebar ${
          isOpen
            ? "sidebar-open"
            : ""
        }`}
      >
        {/* ======================================
            BRAND
        ====================================== */}

        <div className="sidebar-brand">
          <div className="sidebar-brand-name">
            R Dream
          </div>

          <div className="sidebar-brand-subtitle">
            Infra Developers
          </div>
        </div>

        {/* ======================================
            MOBILE CLOSE BUTTON
        ====================================== */}

        <button
          type="button"
          className="sidebar-close"
          onClick={() =>
            setIsOpen?.(false)
          }
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        {/* ======================================
            NAVIGATION
        ====================================== */}

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname ===
                item.path ||
              (item.path !==
                "/dashboard" &&
                location.pathname.startsWith(
                  `${item.path}/`
                ));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={
                  closeMobileMenu
                }
                className={`sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={2}
                />

                <span>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ======================================
            LOGOUT
        ====================================== */}

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut
            size={19}
            strokeWidth={2}
          />

          <span>
            Logout
          </span>
        </button>
      </aside>
    </>
  );
}