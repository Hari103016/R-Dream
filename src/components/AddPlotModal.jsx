import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

import { supabase } from "../services/supabase";
import "./AddPlotModal.css";

const RATES = {
  East: 2300,
  West: 2000,
  Corner: 2700,
  "North East": 3000,
};

function AddPlotModal({ onClose, selectedVenture = null }) {
  const [ventures, setVentures] = useState([]);
  const [ventureId, setVentureId] = useState(selectedVenture?.id || "");
  const [plotNo, setPlotNo] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [facing, setFacing] = useState("East");
  const [roadWidth, setRoadWidth] = useState("24 Ft");
  const [saving, setSaving] = useState(false);
  const [loadingVentures, setLoadingVentures] = useState(true);

  const rate = RATES[facing] || 2300;
  const price = (Number(plotSize) || 0) * rate;

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
        toast.error("Unable to load ventures");
        setVentures([]);
      } else {
        const rows = data || [];
        setVentures(rows);

        if (selectedVenture?.id) {
          setVentureId(selectedVenture.id);
        } else if (rows.length === 1) {
          setVentureId(rows[0].id);
        }
      }

      setLoadingVentures(false);
    }

    loadVentures();

    return () => {
      active = false;
    };
  }, [selectedVenture?.id]);

  const selectedVentureData = useMemo(
    () => ventures.find((v) => v.id === ventureId),
    [ventures, ventureId]
  );

  async function savePlot() {
    if (!ventureId) {
      toast.error("Select Venture / Phase");
      return;
    }

    if (!plotNo.trim()) {
      toast.error("Enter Plot Number");
      return;
    }

    if (!plotSize || Number(plotSize) <= 0) {
      toast.error("Enter a valid Plot Size");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("plots").insert([
      {
        venture_id: ventureId,
        plot_no: plotNo.trim(),
        plot_size: Number(plotSize),
        facing,
        road_width: roadWidth,
        rate,
        price,
        status: "Available",
      },
    ]);

    setSaving(false);

    if (error) {
      console.error("Add Plot Error:", error);
      toast.error(error.message || "Unable to save plot");
      return;
    }

    toast.success("Plot Added Successfully");
    onClose();
  }

  return (
    <div className="plot-modal-overlay">
      <div className="plot-modal add-plot-modal">
        <div className="plot-modal-header">
          <div>
            <h2>Add Plot</h2>
            <p>Assign the plot to a venture and enter its details.</p>
          </div>

          <button
            type="button"
            className="plot-modal-close"
            onClick={onClose}
            disabled={saving}
          >
            <X size={21} />
          </button>
        </div>

        <div className="plot-form-grid">
          <div className="plot-form-group plot-form-full">
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
              <small className="plot-field-hint">
                {selectedVentureData.village} • {selectedVentureData.phase_name}
                {selectedVentureData.total_plots
                  ? ` • ${selectedVentureData.total_plots} plots`
                  : ""}
              </small>
            )}
          </div>

          <div className="plot-form-group">
            <label>Plot Number</label>
            <input
              type="text"
              value={plotNo}
              placeholder="Enter plot number"
              onChange={(e) => setPlotNo(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="plot-form-group">
            <label>Plot Size (Sq.Yds)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={plotSize}
              placeholder="Enter plot size"
              onChange={(e) => setPlotSize(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="plot-form-group">
            <label>Facing</label>
            <select
              value={facing}
              onChange={(e) => setFacing(e.target.value)}
              disabled={saving}
            >
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Corner">Corner</option>
              <option value="North East">North East</option>
            </select>
          </div>

          <div className="plot-form-group">
            <label>Road Width</label>
            <select
              value={roadWidth}
              onChange={(e) => setRoadWidth(e.target.value)}
              disabled={saving}
            >
              <option value="24 Ft">24 Ft</option>
              <option value="30 Ft">30 Ft</option>
              <option value="40 Ft">40 Ft</option>
            </select>
          </div>

          <div className="plot-form-group">
            <label>Rate / Sq.Yd</label>
            <div className="plot-readonly-field green">
              ₹{rate.toLocaleString("en-IN")}
            </div>
            <small className="plot-field-hint">Automatic from facing</small>
          </div>

          <div className="plot-form-group">
            <label>Total Price</label>
            <div className="plot-readonly-field yellow">
              ₹{price.toLocaleString("en-IN")}
            </div>
            <small className="plot-field-hint">Plot Size × Rate</small>
          </div>
        </div>

        <div className="plot-modal-actions">
          <button
            type="button"
            className="plot-cancel-btn"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="plot-save-btn"
            onClick={savePlot}
            disabled={saving || loadingVentures}
          >
            {saving ? "Saving..." : "Save Plot"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddPlotModal;
