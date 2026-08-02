import { useEffect, useState } from "react";
import { Receipt, Save } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";

function ReceiptTab() {

  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    receipt_prefix: "RDI",
    next_receipt_number: 1001,
    receipt_footer: "",
    receipt_terms: "",
    authorized_signatory: "",
  });

  useEffect(() => {
    loadReceiptSettings();
  }, []);

  async function loadReceiptSettings() {

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
      receipt_prefix: data.receipt_prefix || "RDI",
      next_receipt_number: data.next_receipt_number || 1001,
      receipt_footer: data.receipt_footer || "",
      receipt_terms: data.receipt_terms || "",
      authorized_signatory: data.authorized_signatory || "",
    });

  }

  function handleChange(e) {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  }

  async function saveReceiptSettings() {

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

    toast.success("Receipt Settings Saved");

  }

  return (

    <div className="settings-card">

      <h2>

        <Receipt size={22} />

        Receipt Settings

      </h2>

      <div className="settings-grid">

        <div className="form-group">

          <label>Receipt Prefix</label>

          <input
            name="receipt_prefix"
            value={formData.receipt_prefix}
            onChange={handleChange}
          />

        </div>

        <div className="form-group">

          <label>Next Receipt Number</label>

          <input
            type="number"
            name="next_receipt_number"
            value={formData.next_receipt_number}
            onChange={handleChange}
          />

        </div>

        <div className="form-group full-width">

          <label>Receipt Footer</label>

          <textarea
            rows="3"
            name="receipt_footer"
            value={formData.receipt_footer}
            onChange={handleChange}
          />

        </div>

        <div className="form-group full-width">

          <label>Terms & Conditions</label>

          <textarea
            rows="5"
            name="receipt_terms"
            value={formData.receipt_terms}
            onChange={handleChange}
          />

        </div>

        <div className="form-group">

          <label>Authorized Signatory</label>

          <input
            name="authorized_signatory"
            value={formData.authorized_signatory}
            onChange={handleChange}
          />

        </div>

      </div>

      <button
        className="save-settings-btn"
        onClick={saveReceiptSettings}
        disabled={saving}
      >

        <Save size={18} />

        {saving ? "Saving..." : "Save Receipt Settings"}

      </button>

    </div>

  );

}

export default ReceiptTab;