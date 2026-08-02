import { useEffect, useState } from "react";
import { Palette, Moon, Sun, Save } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";

function AppearanceTab() {
  const [settingsId, setSettingsId] = useState(null);

  const [theme, setTheme] = useState("dark");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAppearance();
  }, []);

  async function loadAppearance() {
    const { data, error } = await supabase
      .from("settings")
      .select("id, theme, primary_color")
      .limit(1)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setSettingsId(data.id);
    setTheme(data.theme || "dark");
    setPrimaryColor(data.primary_color || "#2563eb");

    document.documentElement.style.setProperty(
      "--primary-color",
      data.primary_color || "#2563eb"
    );
  }

  async function saveAppearance() {
    setSaving(true);

    const { error } = await supabase
      .from("settings")
      .update({
        theme,
        primary_color: primaryColor,
      })
      .eq("id", settingsId);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    document.documentElement.style.setProperty(
      "--primary-color",
      primaryColor
    );

    toast.success("Appearance Saved");
  }

  return (
    <div className="settings-card">

      <h2>Appearance</h2>

      <div className="settings-grid">

        <div className="form-group">
          <label>
            {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            Theme
          </label>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            <Palette size={18} />
            Primary Color
          </label>

          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
        </div>

      </div>

      <button
        className="save-settings-btn"
        onClick={saveAppearance}
        disabled={saving}
      >
        <Save size={18} />
        {saving ? "Saving..." : "Save Appearance"}
      </button>

    </div>
  );
}

export default AppearanceTab;