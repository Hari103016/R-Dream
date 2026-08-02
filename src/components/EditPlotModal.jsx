import { useState } from "react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";
import "./EditPlotModal.css";

function EditPlotModal({ plot, onClose }) {
  const [formData, setFormData] = useState({
    plot_size: plot.plot_size,
    facing: plot.facing,
    rate: plot.rate,
    price: plot.price,
    status: plot.status,
  });

  const [saving, setSaving] =useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    let updated = {
      ...formData,
      [name]: value,
    };

    if (name === "plot_size" || name === "rate") {
      updated.price =
        Number(updated.plot_size) *
        Number(updated.rate);
    }

    setFormData(updated);
  }

  async function savePlot() {
    setSaving(true);

    const { error } = await supabase
      .from("plots")
      .update({
        plot_size: Number(formData.plot_size),
        facing: formData.facing,
        rate: Number(formData.rate),
        price: Number(formData.price),
        status: formData.status,
      })
      .eq("id", plot.id);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Plot Updated Successfully");

    onClose();
  }

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h2>Edit Plot #{plot.plot_no}</h2>

        <div className="form-group">
          <label>Plot Size</label>

          <input
            type="number"
            name="plot_size"
            value={formData.plot_size}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Facing</label>

          <select
            name="facing"
            value={formData.facing}
            onChange={handleChange}
          >
            <option>East</option>
            <option>West</option>
            <option>North</option>
            <option>South</option>
            <option>Corner</option>
          </select>
        </div>

        <div className="form-group">
          <label>Rate</label>

          <input
            type="number"
            name="rate"
            value={formData.rate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Price</label>

          <input
            type="number"
            name="price"
            value={formData.price}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Status</label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option>Available</option>
            <option>Booked</option>
            <option>Sold</option>
          </select>
        </div>

        <div className="modal-buttons">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={savePlot}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default EditPlotModal;