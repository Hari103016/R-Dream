import { useState } from "react";
import { Lock, Save } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";

function SecurityTab() {

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function changePassword() {

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password: formData.password,
    });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password Updated Successfully");

    setFormData({
      password: "",
      confirmPassword: "",
    });

  }

  return (

    <div className="settings-card">

      <h2>
        <Lock size={22}/>
        Security Settings
      </h2>

      <div className="settings-grid">

        <div className="form-group">

          <label>New Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

        </div>

        <div className="form-group">

          <label>Confirm Password</label>

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

        </div>

      </div>

      <button
        className="save-settings-btn"
        onClick={changePassword}
        disabled={saving}
      >

        <Save size={18}/>

        {saving ? "Updating..." : "Update Password"}

      </button>

    </div>

  );

}

export default SecurityTab;