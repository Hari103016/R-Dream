import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import { supabase } from "../services/supabase";
import "./EditPlotModal.css";

const RATES = {
  East: 2300,
  West: 2000,
  Corner: 2700,
  "North East": 3000,
};

function getRateByFacing(facing) {
  return RATES[facing] || 2300;
}

function EditPlotModal({ plot, onClose, selectedVenture = null }) {
  const [ventures, setVentures] = useState([]);
  const [ventureId, setVentureId] = useState(
    plot?.venture_id || selectedVenture?.id || ""
  );
  const [formData, setFormData] = useState({
    plot_size: plot?.plot_size ?? "",
    facing: plot?.facing || "East",
    road_width: plot?.road_width || "24 Ft",
    status: plot?.status || "Available",
  });

  const [saving, setSaving] = useState(false);
  const [loadingVentures, setLoadingVentures] = useState(true);

  const rate = getRateByFacing(formData.facing);
  const price = (Number(formData.plot_size) || 0) * rate;

  useEffect(() => {
    let active = true;

    async function loadVentures() {
      setLoadingVentures(true);

      const { data, error } = await supabase
        .from("ventures")
        .select("id, village, phase_name, total_plots")
        .order("village", { ascending: true })
        .order("phase_name", { ascending: true });

      if (!active) return;

      if (error) {
        console.error("Load Ventures Error:", error);
        Swal.fire({
          title: "Unable to Load Ventures",
          text: error.message,
          icon: "error",
          confirmButtonColor: "#2563eb",
        });
        setVentures([]);
      } else {
        const rows = data || [];
        setVentures(rows);

        if (plot?.venture_id) {
          setVentureId(plot.venture_id);
        } else if (!ventureId && selectedVenture?.id) {
          setVentureId(selectedVenture.id);
        } else if (!ventureId && rows.length === 1) {
          setVentureId(rows[0].id);
        }
      }

      setLoadingVentures(false);
    }

    loadVentures();

    return () => {
      active = false;
    };
    // Venture is intentionally resolved once when the plot changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plot?.id]);

  const selectedVentureData = useMemo(
    () => ventures.find((v) => v.id === ventureId),
    [ventures, ventureId]
  );

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function savePlot() {
    if (!ventureId) {
      Swal.fire({
        title: "Select Venture / Phase",
        text: "Please select the venture and phase for this plot.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (!formData.plot_size || Number(formData.plot_size) <= 0) {
      Swal.fire({
        title: "Invalid Plot Size",
        text: "Please enter a valid plot size.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setSaving(true);

    const finalRate = getRateByFacing(formData.facing);
    const finalPrice = Number(formData.plot_size) * finalRate;

    const { error } = await supabase
      .from("plots")
      .update({
        venture_id: ventureId,
        plot_size: Number(formData.plot_size),
        facing: formData.facing,
        road_width: formData.road_width,
        rate: finalRate,
        price: finalPrice,
        status: formData.status,
      })
      .eq("id", plot.id);

    setSaving(false);

    if (error) {
      console.error("Update Plot Error:", error);

      Swal.fire({
        title: "Update Failed",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    await Swal.fire({
      title: "Plot Updated Successfully!",
      text: "Plot details and venture assignment have been saved.",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#10b981",
      background: "#111827",
      color: "#ffffff",
    });

    onClose();
  }

  return (
    <div className="edit-plot-overlay">
      <div className="edit-plot-modal">
        <div className="edit-modal-header">
          <div>
            <h2>Edit Plot #{plot.plot_no}</h2>
            <p>Update plot, pricing, venture and status information.</p>
          </div>

          <button
            type="button"
            className="edit-close-btn"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        <div className="edit-form-grid">
          <div className="edit-form-group edit-form-full">
            <label>Venture / Phase</label>

            <select
              value={ventureId}
              onChange={(e) => setVentureId(e.target.value)}
              disabled={loadingVentures || saving}
            >
              <option value="">
                {loadingVentures ? "Loading ventures..." : "Select Venture / Phase"}
              </option>

              {ventures.map((venture) => (
                <option key={venture.id} value={venture.id}>
                  {venture.village} — {venture.phase_name}
                </option>
              ))}
            </select>

            {selectedVentureData && (
              <small>
                {selectedVentureData.village} • {selectedVentureData.phase_name}
                {selectedVentureData.total_plots
                  ? ` • ${selectedVentureData.total_plots} plots`
                  : ""}
              </small>
            )}
          </div>

          <div className="edit-form-group">
            <label>Plot Size (Sq.Yds)</label>
            <input
              type="number"
              name="plot_size"
              min="0"
              step="0.01"
              value={formData.plot_size}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="edit-form-group">
            <label>Facing</label>
            <select
              name="facing"
              value={formData.facing}
              onChange={handleChange}
              disabled={saving}
            >
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Corner">Corner</option>
              <option value="North East">North East</option>
            </select>
          </div>

          <div className="edit-form-group">
            <label>Road Width</label>
            <select
              name="road_width"
              value={formData.road_width}
              onChange={handleChange}
              disabled={saving}
            >
              <option value="24 Ft">24 Ft</option>
              <option value="30 Ft">30 Ft</option>
              <option value="40 Ft">40 Ft</option>
            </select>
          </div>

          <div className="edit-form-group">
            <label>Rate / Sq.Yd</label>
            <div className="edit-readonly-field green">
              ₹{rate.toLocaleString("en-IN")}
            </div>
            <small>Automatically calculated from facing</small>
          </div>

          <div className="edit-form-group">
            <label>Total Price</label>
            <div className="edit-readonly-field yellow">
              ₹{price.toLocaleString("en-IN")}
            </div>
            <small>Plot Size × Rate</small>
          </div>

          <div className="edit-form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={saving}
            >
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>

        <div className="edit-modal-buttons">
          <button
            type="button"
            className="edit-cancel-btn"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="edit-save-btn"
            onClick={savePlot}
            disabled={saving || loadingVentures}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPlotModal;
