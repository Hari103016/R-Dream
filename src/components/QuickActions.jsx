import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  UserPlus,
  MapPinned,
  CreditCard,
  FileText,
  CalendarDays,
  Settings,
  ArrowRight,
} from "lucide-react";

import AddCustomerModal from "./AddCustomerModal";

import "./QuickActions.css";

function QuickActions() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

  /* ===========================================
     QUICK ACTIONS
  =========================================== */

  const actions = [
    {
      title: "Add Customer",
      subtitle: "Register a new customer",
      icon: <UserPlus size={28} />,
      color: "blue",
      action: () => setShowModal(true),
    },

    {
      title: "Manage Plots",
      subtitle: "View & update plots",
      icon: <MapPinned size={28} />,
      color: "green",
      action: () => navigate("/plots"),
    },

    {
      title: "Bookings",
      subtitle: "Manage bookings",
      icon: <CalendarDays size={28} />,
      color: "orange",
      action: () => navigate("/bookings"),
    },

    {
      title: "Payments",
      subtitle: "Payment collection",
      icon: <CreditCard size={28} />,
      color: "purple",
      action: () => navigate("/payments"),
    },

    {
      title: "Reports",
      subtitle: "Revenue & analytics",
      icon: <FileText size={28} />,
      color: "cyan",
      action: () => navigate("/reports"),
    },

    {
      title: "Settings",
      subtitle: "System configuration",
      icon: <Settings size={28} />,
      color: "red",
      action: () => navigate("/settings"),
    },
  ];

  /* ===========================================
     RETURN
  =========================================== */

  return (
    <div className="quick-actions">

  {/* ===========================================
      HEADER
  =========================================== */}

  <div className="quick-header">

    <div>

      <h2>⚡ Quick Actions</h2>

      <p>Access your most frequently used features</p>

    </div>

  </div>

  {/* ===========================================
      ACTION GRID
  =========================================== */}

  <div className="action-grid">

    {actions.map((item, index) => (

      <div
        key={index}
        className={`action-card ${item.color}`}
        onClick={item.action}
      >

        <div className="action-top">

          <div className="action-icon">

            {item.icon}

          </div>

          <ArrowRight
            size={18}
            className="action-arrow"
          />

        </div>

        <div className="action-content">

          <h4>{item.title}</h4>

          <p>{item.subtitle}</p>

        </div>

        <div className="action-glow"></div>

      </div>

    ))}

  </div>

  {/* ===========================================
      ADD CUSTOMER MODAL
  =========================================== */}

  {showModal && (

    <AddCustomerModal
      closeModal={() =>
        setShowModal(false)
      }
    />

  )}

</div>
  );
}

export default QuickActions;