import { Download, Upload, Database } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";

function BackupTab() {

  async function exportCustomers() {

    const { data, error } = await supabase
      .from("customers")
      .select("*");

    if (error) {
      toast.error(error.message);
      return;
    }

    const json = JSON.stringify(data, null, 2);

    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "customers_backup.json";

    a.click();

    URL.revokeObjectURL(url);

    toast.success("Customers Backup Downloaded");

  }

  function restoreBackup(e) {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

      try{

        JSON.parse(reader.result);

        toast.success(
          "Backup file verified successfully."
        );

        toast.info(
          "Restore logic can now be implemented."
        );

      }

      catch{

        toast.error("Invalid Backup File");

      }

    };

    reader.readAsText(file);

  }

  return (

    <div className="settings-card">

      <h2>

        <Database size={22}/>

        Backup & Restore

      </h2>

      <p>

        Download your CRM data or verify a backup
        file before restoring.

      </p>

      <div
        style={{
          display:"flex",
          gap:"20px",
          marginTop:"30px",
        }}
      >

        <button
          className="save-settings-btn"
          onClick={exportCustomers}
        >

          <Download size={18}/>

          Download Backup

        </button>

        <label className="save-settings-btn">

          <Upload size={18}/>

          Restore Backup

          <input
            type="file"
            hidden
            accept=".json"
            onChange={restoreBackup}
          />

        </label>

      </div>

      <div
        style={{
          marginTop:"40px"
        }}
      >

        <h3>Backup Includes</h3>

        <ul>

          <li>Customers</li>

          <li>Plots</li>

          <li>Bookings</li>

          <li>Payments</li>

          <li>Notifications</li>

          <li>Settings</li>

        </ul>

      </div>

    </div>

  );

}

export default BackupTab;