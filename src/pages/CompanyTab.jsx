import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Globe,
  CreditCard,
  Save,
} from "lucide-react";

import { supabase } from "../services/supabase";

function CompanyTab() {
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
    website: "",
    gst_number: "",
    pan_number: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
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
      website: data.website || "",
      gst_number: data.gst_number || "",
      pan_number: data.pan_number || "",
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
      .update(formData)
      .eq("id", settingsId);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Company Settings Saved");
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <div className="settings-card">

        <h2>Company Information</h2>

        <div className="settings-grid">

          <div className="form-group">
            <label>
              <Building2 size={18}/>
              Company Name
            </label>

            <input
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <Phone size={18}/>
              Phone
            </label>

            <input
              name="company_phone"
              value={formData.company_phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <Mail size={18}/>
              Email
            </label>

            <input
              name="company_email"
              value={formData.company_email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <Globe size={18}/>
              Website
            </label>

            <input
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label>
              <MapPin size={18}/>
              Address
            </label>

            <textarea
              rows={4}
              name="company_address"
              value={formData.company_address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <CreditCard size={18}/>
              GST Number
            </label>

            <input
              name="gst_number"
              value={formData.gst_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <CreditCard size={18}/>
              PAN Number
            </label>

            <input
              name="pan_number"
              value={formData.pan_number}
              onChange={handleChange}
            />
          </div>

        </div>
      </div>

      <div className="settings-card">

        <h2>Administrator</h2>

        <div className="settings-grid">

          <div className="form-group">
            <label>
              <User size={18}/>
              Admin Name
            </label>

            <input
              name="admin_name"
              value={formData.admin_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              <User size={18}/>
              Username
            </label>

            <input
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
        <Save size={18}/>
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </>
  );
}

export default CompanyTab;