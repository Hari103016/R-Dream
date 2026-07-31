import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Save,
} from "lucide-react";
import { supabase } from "../services/supabase";
import "./Settings.css";

function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settingsId, setSettingsId] = useState(null);

  const [formData, setFormData] = useState({
    company_name: "",
    company_phone: "",
    company_email: "",
    company_address: "",
    admin_name: "",
    admin_username: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setSettingsId(data.id);

    setFormData({
      company_name: data.company_name || "",
      company_phone: data.company_phone || "",
      company_email: data.company_email || "",
      company_address: data.company_address || "",
      admin_name: data.admin_name || "",
      admin_username: data.admin_username || "",
    });

    setLoading(false);
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
      .update({
        company_name: formData.company_name,
        company_phone: formData.company_phone,
        company_email: formData.company_email,
        company_address: formData.company_address,
        admin_name: formData.admin_name,
        admin_username: formData.admin_username,
      })
      .eq("id", settingsId);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    toast.success("Settings Saved");
  }

  if (loading) {
    return (
      <div className="settings-page">
        <h2>Loading Settings...</h2>
      </div>
    );
  }

  return (
    <div className="settings-page">

      <h2>Settings</h2>

      <div className="settings-card">

        <h3>Company Information</h3>

        <div className="settings-grid">

          <div className="form-group">
            <label>
              <Building2 size={18} />
              Company Name
            </label>

            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <Phone size={18} />
              Phone Number
            </label>

            <input
              type="text"
              name="company_phone"
              value={formData.company_phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <Mail size={18} />
              Email
            </label>

            <input
              type="email"
              name="company_email"
              value={formData.company_email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label>
              <MapPin size={18} />
              Company Address
            </label>

            <textarea
              rows="4"
              name="company_address"
              value={formData.company_address}
              onChange={handleChange}
            />
          </div>

        </div>

      </div>

      <div className="settings-card">

        <h3>Administrator</h3>

        <div className="settings-grid">

          <div className="form-group">
            <label>
              <User size={18} />
              Admin Name
            </label>

            <input
              type="text"
              name="admin_name"
              value={formData.admin_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <User size={18} />
              Username
            </label>

            <input
              type="text"
              name="admin_username"
              value={formData.admin_username}
              onChange={handleChange}
            />
          </div>

        </div>

      </div>

      <button
        className="save-settings-btn"
        onClick={saveSettings}
        disabled={saving}
      >
        <Save size={18} />

        {saving ? "Saving..." : "Save Settings"}
      </button>

    </div>
  );
}

export default Settings;