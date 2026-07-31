import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

import { supabase } from "../services/supabase";

import "./AddPlotModal.css";

function AddPlotModal({ onClose }) {

  const [plotNo, setPlotNo] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [facing, setFacing] = useState("East");

  const [rate, setRate] = useState(1300);
  const [price, setPrice] = useState(0);

  useEffect(() => {

    let newRate = 1300;

    if (facing === "West") newRate = 1000;
    if (facing === "Corner") newRate = 1700;

    setRate(newRate);

  }, [facing]);

  useEffect(() => {

    setPrice(Number(plotSize || 0) * Number(rate));

  }, [plotSize, rate]);

  async function savePlot() {

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

      .insert([

        {
          plot_no: plotNo,
          plot_size: plotSize,
          facing,
          rate,
          price,
          status: "Available",
        },

      ]);

    if (error) {

      console.error(error);

      toast.error("Unable to save plot");

      return;

    }

    toast.success("Plot Added Successfully");

    onClose();

  }
    return (

    <div className="modal-overlay">

      <div className="modal">

        <div className="modal-header">

          <h2>Add Plot</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>

        </div>

        <div className="form-grid">

          <div className="form-group">

            <label>Plot Number</label>

            <input
              value={plotNo}
              onChange={(e) =>
                setPlotNo(e.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label>Plot Size</label>

            <input
              type="number"
              value={plotSize}
              onChange={(e) =>
                setPlotSize(e.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label>Facing</label>

            <select
              value={facing}
              onChange={(e) =>
                setFacing(e.target.value)
              }
            >

              <option>East</option>

              <option>West</option>

              <option>Corner</option>

            </select>

          </div>

          <div className="form-group">

            <label>Rate</label>

            <input
              value={rate}
              readOnly
            />

          </div>

          <div className="form-group full">

            <label>Total Price</label>

            <input
              value={price}
              readOnly
            />

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
            onClick={savePlot}
          >
            Save Plot
          </button>

        </div>

      </div>

    </div>

  );

}

export default AddPlotModal;