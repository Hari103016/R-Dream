import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";

import "./AddPlotModal.css";

function EditPlotModal({ plot, onClose }) {
  const [plotNo, setPlotNo] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [facing, setFacing] = useState("East");
  const [rate, setRate] = useState(1300);
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState("Available");

  useEffect(() => {
    if (!plot) return;

    setPlotNo(plot.plot_no);
    setPlotSize(plot.plot_size);
    setFacing(plot.facing);
    setRate(plot.rate);
    setPrice(plot.price);
    setStatus(plot.status);
  }, [plot]);

  useEffect(() => {
    let newRate = 1300;

    if (facing === "West") newRate = 1000;
    if (facing === "Corner") newRate = 1700;

    setRate(newRate);
  }, [facing]);

  useEffect(() => {
    setPrice(Number(plotSize || 0) * Number(rate));
  }, [plotSize, rate]);

  async function updatePlot() {
    if (!plotNo) {
      toast.error("Enter Plot Number");
      return;
    }

    if (!plotSize) {
      toast.error("Enter Plot Size");
      return;
    }

    const { error } = await supabase
      .from("plots")
      .update({
        plot_no: plotNo,
        plot_size: plotSize,
        facing,
        rate,
        price,
        status,
      })
      .eq("id", plot.id);

    if (error) {
      console.error(error);
      toast.error("Unable to update plot");
      return;
    }

    toast.success("Plot Updated Successfully");
    onClose();
  }

  return (
    <div className="modal-overlay">

      <div className="modal">

        <div className="modal-header">
          <h2>Edit Plot</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="form-grid">

          <div className="form-group">
            <label>Plot Number</label>

            <input
              value={plotNo}
              onChange={(e) => setPlotNo(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Plot Size (Sq.Yds)</label>

            <input
              type="number"
              value={plotSize}
              onChange={(e) => setPlotSize(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Facing</label>

            <select
              value={facing}
              onChange={(e) => setFacing(e.target.value)}
            >
              <option>East</option>
              <option>West</option>
              <option>Corner</option>
            </select>
          </div>

          <div className="form-group">
            <label>Rate</label>

            <input value={rate} readOnly />
          </div>

          <div className="form-group">
            <label>Status</label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Available</option>
              <option>Booked</option>
              <option>Sold</option>
            </select>
          </div>

          <div className="form-group">
            <label>Total Price</label>

            <input value={price} readOnly />
          </div>

        </div>

        <div className="modal-actions">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={updatePlot}
          >
            Update Plot
          </button>

        </div>

      </div>

    </div>
  );
}

export default EditPlotModal;