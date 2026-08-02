import { useEffect, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";

function LogoTab() {
  const [logo, setLogo] = useState("");
  const [settingsId, setSettingsId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadLogo();
  }, []);

  async function loadLogo() {
    const { data, error } = await supabase
      .from("settings")
      .select("id, company_logo")
      .limit(1)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setSettingsId(data.id);
    setLogo(data.company_logo || "");
  }

  async function uploadLogo(e) {
    const file = e.target.files[0];

    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;

    console.log("Uploading...");

    const { data, error: uploadError } = await supabase.storage
        .from("company-logo")
        .upload(fileName, file);

    console.log("UPLOAD DATA:", data);
    console.log("UPLOAD ERROR:", uploadError);

    if (uploadError) {
        toast.error(uploadError.message);
        setUploading(false);
        return;
    }

    const {
        data: { publicUrl },
    } = supabase.storage
        .from("company-logo")
        .getPublicUrl(fileName);

    console.log("PUBLIC URL:", publicUrl);

    const { error } = await supabase
        .from("settings")
        .update({
            company_logo: publicUrl,
        })
        .eq("id", settingsId);

    console.log("UPDATE ERROR:", error);

    if (error) {
        toast.error(error.message);
        setUploading(false);
        return;
    }

    setLogo(publicUrl);

    setUploading(false);

    toast.success("Logo Uploaded");
}
  async function removeLogo() {
    const { error } = await supabase
      .from("settings")
      .update({
        company_logo: "",
      })
      .eq("id", settingsId);

    if (error) {
      toast.error(error.message);
      return;
    }

    setLogo("");

    toast.success("Logo Removed");
  }

  return (
    <div className="settings-card">

      <h2>Company Logo</h2>

      {logo ? (

        <img
          src={logo}
          alt="Company Logo"
          className="company-logo"
        />

      ) : (

        <div className="logo-placeholder">

          No Logo Uploaded

        </div>

      )}

      <br />

      <label className="upload-button">

        <Upload size={18} />

        {uploading ? "Uploading..." : "Upload Logo"}

        <input
          type="file"
          hidden
          accept="image/*"
          onChange={uploadLogo}
        />

      </label>

      {logo && (

        <button
          className="delete-logo-btn"
          onClick={removeLogo}
        >

          <Trash2 size={18} />

          Remove Logo

        </button>

      )}

    </div>
  );
}

export default LogoTab;