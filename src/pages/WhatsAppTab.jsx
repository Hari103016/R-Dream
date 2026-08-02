import { useEffect, useState } from "react";
import { MessageCircle, Save } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";

function WhatsAppTab() {

  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    country_code: "+91",
    whatsapp_number: "",
    booking_template: "",
    payment_template: "",
    registration_template: "",
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
      country_code: data.country_code || "+91",
      whatsapp_number: data.whatsapp_number || "",
      booking_template:
        data.booking_template ||
        "Dear {name}, your booking for Plot {plot} has been confirmed.",

      payment_template:
        data.payment_template ||
        "Dear {name}, your payment of ₹{amount} is due on {date}.",

      registration_template:
        data.registration_template ||
        "Dear {name}, your registration is scheduled on {date}.",
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

    toast.success("WhatsApp Settings Saved");

  }

  return (

    <div className="settings-card">

      <h2>

        <MessageCircle size={22} />

        WhatsApp Settings

      </h2>

      <div className="settings-grid">

        <div className="form-group">

          <label>Country Code</label>

          <input
            name="country_code"
            value={formData.country_code}
            onChange={handleChange}
          />

        </div>

        <div className="form-group">

          <label>Business WhatsApp Number</label>

          <input
            name="whatsapp_number"
            value={formData.whatsapp_number}
            onChange={handleChange}
          />

        </div>

        <div className="form-group full-width">

          <label>Booking Template</label>

          <textarea
            rows="4"
            name="booking_template"
            value={formData.booking_template}
            onChange={handleChange}
          />

        </div>

        <div className="form-group full-width">

          <label>Payment Reminder Template</label>

          <textarea
            rows="4"
            name="payment_template"
            value={formData.payment_template}
            onChange={handleChange}
          />

        </div>

        <div className="form-group full-width">

          <label>Registration Template</label>

          <textarea
            rows="4"
            name="registration_template"
            value={formData.registration_template}
            onChange={handleChange}
          />

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

export default WhatsAppTab;