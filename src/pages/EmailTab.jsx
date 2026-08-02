import { useEffect, useState } from "react";
import { Mail, Save } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";

function EmailTab() {

  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    smtp_host: "",
    smtp_port: 587,
    smtp_email: "",
    smtp_password: "",
    sender_name: "",
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

    setFormData({
      smtp_host: data.smtp_host || "",
      smtp_port: data.smtp_port || 587,
      smtp_email: data.smtp_email || "",
      smtp_password: data.smtp_password || "",
      sender_name: data.sender_name || "",
    });

  }

  function handleChange(e) {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  }

  async function saveSettings() {

    setSaving(true);

    const { error } = await supabase
      .from("settings")
      .update(formData)
      .eq("id", settingsId);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Email Settings Saved");

  }

  return (

    <div className="settings-card">

      <h2>

        <Mail size={22} />

        Email Settings

      </h2>

      <div className="settings-grid">

        <div className="form-group">

          <label>SMTP Host</label>

          <input
            name="smtp_host"
            value={formData.smtp_host}
            onChange={handleChange}
            placeholder="smtp.gmail.com"
          />

        </div>

        <div className="form-group">

          <label>SMTP Port</label>

          <input
            type="number"
            name="smtp_port"
            value={formData.smtp_port}
            onChange={handleChange}
          />

        </div>

        <div className="form-group">

          <label>Email Address</label>

          <input
            type="email"
            name="smtp_email"
            value={formData.smtp_email}
            onChange={handleChange}
          />

        </div>

        <div className="form-group">

          <label>Email Password / App Password</label>

          <input
            type="password"
            name="smtp_password"
            value={formData.smtp_password}
            onChange={handleChange}
          />

        </div>

        <div className="form-group full-width">

          <label>Sender Name</label>

          <input
            name="sender_name"
            value={formData.sender_name}
            onChange={handleChange}
            placeholder="R Dream Infra Developers"
          />

        </div>

      </div>

      <button
        className="save-settings-btn"
        onClick={saveSettings}
        disabled={saving}
      >

        <Save size={18} />

        {saving ? "Saving..." : "Save Email Settings"}

      </button>

    </div>

  );

}

export default EmailTab;