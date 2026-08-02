import { useState } from "react";

import CompanyTab from "./CompanyTab";
import LogoTab from "./LogoTab";
import AppearanceTab from "./AppearanceTab";
import NotificationTab from "./NotificationTab";
import WhatsAppTab from "./WhatsAppTab";
import EmailTab from "./EmailTab";
import UsersTab from "./UsersTab";
import SecurityTab from "./SecurityTab";
import ReceiptTab from "./ReceiptTab";
import BackupTab from "./BackupTab";
import AboutTab from "./AboutTab";

import "./Settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("company");

  const menu = [
    { id: "company", label: "🏢 Company" },
    { id: "logo", label: "🖼 Logo" },
    { id: "appearance", label: "🎨 Appearance" },
    { id: "notifications", label: "🔔 Notifications" },
    { id: "whatsapp", label: "💬 WhatsApp" },
    { id: "email", label: "📧 Email" },
    { id: "users", label: "👥 Users" },
    { id: "security", label: "🔒 Security" },
    { id: "receipt", label: "🧾 Receipt" },
    { id: "backup", label: "💾 Backup & Restore" },
    { id: "about", label: "ℹ About" },
  ];

  function renderTab() {
    switch (activeTab) {
      case "company":
        return <CompanyTab />;

      case "logo":
        return <LogoTab />;

      case "appearance":
        return <AppearanceTab />;

      case "notifications":
        return <NotificationTab />;

      case "whatsapp":
        return <WhatsAppTab />;

      case "email":
        return <EmailTab />;

      case "users":
        return <UsersTab />;

      case "security":
        return <SecurityTab />;

      case "receipt":
        return <ReceiptTab />;

      case "backup":
        return <BackupTab />;

      case "about":
        return <AboutTab />;

      default:
        return <CompanyTab />;
    }
  }

  return (
    <div className="settings-wrapper">

      <div className="settings-sidebar">

        <h2>Settings</h2>

        {menu.map((item) => (
          <button
            key={item.id}
            className={
              activeTab === item.id
                ? "settings-menu active"
                : "settings-menu"
            }
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </button>
        ))}

      </div>

      <div className="settings-content">
        {renderTab()}
      </div>

    </div>
  );
}

export default Settings;