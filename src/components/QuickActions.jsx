import { useState } from "react";
import {
  UserPlus,
  MapPinned,
  CreditCard,
  FileText,
} from "lucide-react";

import AddCustomerModal from "./AddCustomerModal";
import "./QuickActions.css";

function QuickActions() {
  const [showModal, setShowModal] = useState(false);

  const actions = [
    {
      title: "Add Customer",
      icon: <UserPlus size={26} />,
      color: "#2563EB",
      action: () => setShowModal(true),
    },
    {
      title: "Add Plot",
      icon: <MapPinned size={26} />,
      color: "#10B981",
      action: null,
    },
    {
      title: "Add Payment",
      icon: <CreditCard size={26} />,
      color: "#F59E0B",
      action: null,
    },
    {
      title: "Generate Report",
      icon: <FileText size={26} />,
      color: "#8B5CF6",
      action: null,
    },
  ];

  return (
    <>
      <div className="quick-actions">

        <h2>⚡ Quick Actions</h2>

        <div className="action-grid">

          {actions.map((action, index) => (

            <div
              key={index}
              className="action-card"
              onClick={action.action}
              style={{
                cursor: action.action ? "pointer" : "default",
              }}
            >

              <div
                className="action-icon"
                style={{ background: action.color }}
              >
                {action.icon}
              </div>

              <h4>{action.title}</h4>

            </div>

          ))}

        </div>

      </div>

      {showModal && (
        <AddCustomerModal
          closeModal={() => setShowModal(false)}
        />
      )}

    </>
  );
}

export default QuickActions;