import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { supabase } from "../services/supabase";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  clearNotifications,
} from "../services/notificationService";

import { searchCustomers } from "../services/searchService";

import "./Topbar.css";

function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ============================
        PAGE TITLE
  ============================ */

  function getPageTitle(pathname) {
    const path = pathname.replace(/\/+$/, "") || "/";

    if (path === "/" || path === "/dashboard") {
      return "Dashboard";
    }

    if (path === "/customers") {
      return "Customers";
    }

    if (path === "/plots") {
      return "Plots";
    }

    if (
      path === "/layout-map" ||
      path === "/layoutmap" ||
      path === "/map"
    ) {
      return "Layout Map";
    }

    if (path === "/bookings") {
      return "Bookings";
    }

    if (path === "/payments") {
      return "Payments";
    }

    if (path === "/reports") {
      return "Reports";
    }

    if (
      path === "/admin-profile" ||
      path === "/profile"
    ) {
      return "Admin Profile";
    }

    if (path === "/settings") {
      return "Settings";
    }

    /*
     * Customer details route.
     * Example:
     * /customer/72
     */
    if (
      path.startsWith("/customer/")
    ) {
      return "Customer Details";
    }

    return "Dashboard";
  }

  const pageTitle = getPageTitle(
    location.pathname
  );

  /* ============================
        ADMIN PROFILE
  ============================ */

  const [admin, setAdmin] = useState({
    full_name: "",
    role: "Administrator",
    avatar_url: "",
  });

  const [showProfile, setShowProfile] =
    useState(false);

  /* ============================
        NOTIFICATIONS
  ============================ */

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [showDropdown, setShowDropdown] =
    useState(false);

  /* ============================
        SEARCH
  ============================ */

  const [search, setSearch] =
    useState("");

  const [results, setResults] =
    useState([]);

  const [showSearch, setShowSearch] =
    useState(false);

  useEffect(() => {
    loadNotifications();
    loadAdmin();
  }, []);

  /* ============================
        LOAD ADMIN
  ============================ */

  async function loadAdmin() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Admin Auth Error:",
          userError
        );
        return;
      }

      if (!user) {
        return;
      }

      const { data, error } =
        await supabase
          .from("admin_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

      if (error) {
        console.error(
          "Admin Profile Error:",
          error
        );
        return;
      }

      if (data) {
        setAdmin(data);
      }
    } catch (error) {
      console.error(
        "Admin Load Error:",
        error
      );
    }
  }

  /* ============================
        LOGOUT
  ============================ */

  async function logout() {
    try {
      await supabase.auth.signOut();

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout Error:",
        error
      );
    }
  }

  /* ============================
      NOTIFICATIONS
  ============================ */

  async function loadNotifications() {
    try {
      const data =
        await getNotifications();

      const count =
        await getUnreadCount();

      setNotifications(
        data || []
      );

      setUnreadCount(
        Number(count || 0)
      );
    } catch (err) {
      console.error(
        "Notifications Error:",
        err
      );
    }
  }

  async function handleMarkRead(id) {
    try {
      await markAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error(
        "Mark Notification Error:",
        error
      );
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead();
      await loadNotifications();
    } catch (error) {
      console.error(
        "Mark All Notifications Error:",
        error
      );
    }
  }

  async function handleClearAll() {
    if (
      !window.confirm(
        "Delete all notifications?"
      )
    ) {
      return;
    }

    try {
      await clearNotifications();
      await loadNotifications();
    } catch (error) {
      console.error(
        "Clear Notifications Error:",
        error
      );
    }
  }

  /* ============================
        SEARCH
  ============================ */

  async function handleSearch(value) {
    setSearch(value);

    if (value.trim() === "") {
      setResults([]);
      setShowSearch(false);
      return;
    }

    try {
      const data =
        await searchCustomers(value);

      setResults(data || []);

      if (
        !data ||
        data.length === 0
      ) {
        setShowSearch(false);
        return;
      }

      if (data.length === 1) {
        navigate(
          `/customer/${data[0].id}`
        );

        setSearch("");
        setResults([]);
        setShowSearch(false);

        return;
      }

      setShowSearch(true);
    } catch (err) {
      console.error(
        "Customer Search Error:",
        err
      );
    }
  }

  function openCustomer(customer) {
    setSearch("");
    setResults([]);
    setShowSearch(false);

    navigate(
      `/customer/${customer.id}`
    );
  }

  return (
    <div className="topbar">

      {/* LEFT */}

      <div className="topbar-left">
        <h2>{pageTitle}</h2>
      </div>

      {/* RIGHT */}

      <div className="topbar-right">

        {/* SEARCH */}

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search Plot No, Name, Phone..."
            value={search}
            autoComplete="off"
            onChange={(e) =>
              handleSearch(
                e.target.value
              )
            }
          />

          {showSearch && (
            <div className="search-dropdown">

              {results.length === 0 ? (
                <div className="search-empty">
                  No Results Found
                </div>
              ) : (
                results.map(
                  (customer) => (
                    <div
                      key={customer.id}
                      className="search-item"
                      onClick={() =>
                        openCustomer(
                          customer
                        )
                      }
                    >

                      <div className="search-name">
                        {customer.name}
                      </div>

                      <div className="search-info">

                        <span>
                          🏡 Plot :
                          <strong>
                            {" "}
                            {customer.plot_no}
                          </strong>
                        </span>

                        <span>
                          📞{" "}
                          {customer.mobile}
                        </span>

                      </div>

                      <div className="search-status">
                        {customer.status}
                      </div>

                    </div>
                  )
                )
              )}

            </div>
          )}

        </div>

        {/* NOTIFICATIONS */}

        <div className="notification-wrapper">

          <button
            type="button"
            className="notification-btn"
            onClick={() =>
              setShowDropdown(
                !showDropdown
              )
            }
            title="Notifications"
          >

            <Bell size={22} />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount}
              </span>
            )}

          </button>

          {showDropdown && (
            <div className="notification-dropdown">

              <div className="notification-header">

                <h3>
                  Notifications
                </h3>

                <div className="notification-actions">

                  <button
                    type="button"
                    onClick={
                      handleMarkAllRead
                    }
                    title="Mark all as read"
                  >
                    <CheckCheck
                      size={16}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleClearAll
                    }
                    title="Delete all notifications"
                  >
                    <Trash2
                      size={16}
                    />
                  </button>

                </div>

              </div>

              <div className="notification-list">

                {notifications.length === 0 ? (

                  <div className="notification-empty">
                    No Notifications
                  </div>

                ) : (

                  notifications.map(
                    (item) => (
                      <div
                        key={item.id}
                        className={`notification-item ${
                          item.is_read
                            ? ""
                            : "unread"
                        }`}
                        onClick={() =>
                          handleMarkRead(
                            item.id
                          )
                        }
                      >

                        <h4>
                          {item.title}
                        </h4>

                        <p>
                          {item.message}
                        </p>

                        <small>
                          {item.created_at
                            ? new Date(
                                item.created_at
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "Unknown time"}
                        </small>

                      </div>
                    )
                  )

                )}

              </div>

            </div>
          )}

        </div>

        {/* ADMIN PROFILE */}

        <div className="admin-wrapper">

          <div
            className="admin-profile"
            onClick={() =>
              setShowProfile(
                !showProfile
              )
            }
          >

            <img
              src={
                admin.avatar_url ||
                "https://ui-avatars.com/api/?name=Admin"
              }
              alt="Admin"
              className="admin-avatar"
            />

            <div className="admin-details">

              <h4>
                {admin.full_name ||
                  "Administrator"}
              </h4>

              <span>
                {admin.role ||
                  "Administrator"}
              </span>

            </div>

            <ChevronDown size={18} />

          </div>

          {showProfile && (
            <div className="admin-dropdown">

              <div
                className="dropdown-item"
                onClick={() => {
                  setShowProfile(
                    false
                  );

                  navigate(
                    "/admin-profile"
                  );
                }}
              >

                <User size={18} />

                My Profile

              </div>

              <div
                className="dropdown-item"
                onClick={() => {
                  setShowProfile(
                    false
                  );

                  navigate(
                    "/settings"
                  );
                }}
              >

                <Settings
                  size={18}
                />

                Settings

              </div>

              <div
                className="dropdown-item logout-item"
                onClick={logout}
              >

                <LogOut size={18} />

                Logout

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Topbar;
