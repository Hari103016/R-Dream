import { useEffect, useState } from "react";
import { Bell, Save } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";

function NotificationTab() {
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    booking_notifications: true,
    payment_notifications: true,
    customer_notifications: true,
    email_notifications: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setSettingsId(data.id);

    setSettings({
      booking_notifications: data.booking_notifications ?? true,
      payment_notifications: data.payment_notifications ?? true,
      customer_notifications: data.customer_notifications ?? true,
      email_notifications: data.email_notifications ?? false,
    });
  }

  function handleToggle(name) {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }

  async function saveNotifications() {
    setSaving(true);

    const { error } = await supabase
      .from("settings")
      .update(settings)
      .eq("id", settingsId);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Notification Settings Saved");
  }

  return (
    <div className="settings-card">

      <h2>
        <Bell size={22} />
        Notification Settings
      </h2>

      <div className="toggle-item">
        <span>Booking Notifications</span>

        <input
          type="checkbox"
          checked={settings.booking_notifications}
          onChange={() => handleToggle("booking_notifications")}
        />
      </div>

      <div className="toggle-item">
        <span>Payment Notifications</span>

        <input
          type="checkbox"
          checked={settings.payment_notifications}
          onChange={() => handleToggle("payment_notifications")}
        />
      </div>

      <div className="toggle-item">
        <span>Customer Notifications</span>

        <input
          type="checkbox"
          checked={settings.customer_notifications}
          onChange={() => handleToggle("customer_notifications")}
        />
      </div>

      <div className="toggle-item">
        <span>Email Notifications</span>

        <input
          type="checkbox"
          checked={settings.email_notifications}
          onChange={() => handleToggle("email_notifications")}
        />
      </div>

      <button
        className="save-settings-btn"
        onClick={saveNotifications}
        disabled={saving}
      >
        <Save size={18} />
        {saving ? "Saving..." : "Save Settings"}
      </button>

    </div>
  );
}

export default NotificationTab;