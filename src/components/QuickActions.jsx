import "./QuickActions.css";
import {
  UserPlus,
  MapPinned,
  CreditCard,
  FileText,
} from "lucide-react";

function QuickActions() {
  const actions = [
    {
      title: "Add Customer",
      icon: <UserPlus size={26} />,
      color: "#2563EB",
    },
    {
      title: "Add Plot",
      icon: <MapPinned size={26} />,
      color: "#10B981",
    },
    {
      title: "Add Payment",
      icon: <CreditCard size={26} />,
      color: "#F59E0B",
    },
    {
      title: "Generate Report",
      icon: <FileText size={26} />,
      color: "#8B5CF6",
    },
  ];

  return (
    <div className="quick-actions">
      <h2>⚡ Quick Actions</h2>

      <div className="action-grid">
        {actions.map((action, index) => (
          <div className="action-card" key={index}>
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
  );
}

export default QuickActions;