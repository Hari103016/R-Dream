import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";
import "./BookPlotModal.css";

function BookPlotModal({ plot, onClose }) {
  const [customer, setCustomer] = useState({
    name: "",
    mobile: "",
    advance: "",
    payment_mode: "Cash",
  });

  const [loading, setLoading] = useState(false);

  const totalAmount = Number(plot.price || 0);
  const advance = Number(customer.advance || 0);
  const balance = Math.max(totalAmount - advance, 0);

  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  async function bookPlot() {
    if (!customer.name.trim()) {
      toast.error("Enter Customer Name");
      return;
    }

    if (!customer.mobile.trim()) {
      toast.error("Enter Mobile Number");
      return;
    }

    if (advance > totalAmount) {
      toast.error("Advance cannot be greater than Total Amount");
      return;
    }

    setLoading(true);

    try {
      // ==========================
      // STEP 1 : Insert Customer
      // ==========================

      const { data: customerData, error: customerError } =
        await supabase
          .from("customers")
          .insert([
            {
              name: customer.name,
              mobile: customer.mobile,
              plot_no: plot.plot_no,
              plot_size: plot.plot_size,
              facing: plot.facing,
              total_amount: totalAmount,
              amount_paid: advance,
              balance: balance,
              booking_date: new Date().toISOString(),
              status: balance === 0 ? "Sold" : "Booked",
            },
          ])
          .select()
          .single();

      if (customerError) throw customerError;

      const customerId = customerData.id;

      // ==========================
      // STEP 2 : Save Payment
      // ==========================

      if (advance > 0) {
        const { error: paymentError } = await supabase
          .from("payments")
          .insert([
            {
              customer_id: customerId,
              amount: advance,
              payment_mode: customer.payment_mode,
              remarks: "Booking Advance",
              payment_date: new Date().toISOString(),
            },
          ]);

        if (paymentError) throw paymentError;
      }

      // ==========================
      // STEP 3 : Update Plot
      // ==========================

      const plotStatus = balance === 0 ? "Sold" : "Booked";

      const { data: updatedPlot, error: plotError } =
        await supabase
          .from("plots")
          .update({
            status: plotStatus,
            customer_id: customerId,
          })
          .eq("id", plot.id)
          .select();

      if (plotError) throw plotError;

      if (!updatedPlot || updatedPlot.length === 0) {
        toast.error("No plot was updated.");
        return;
      }

      // ==========================
      // STEP 4 : Activity
      // ==========================

      const { data: activityData, error: activityError } =
        await supabase
          .from("activities")
          .insert([
            {
              title: "Plot Booked",
              description: `${customer.name} booked Plot #${plot.plot_no}`,
              type: "booking",
            },
          ])
          .select();

      if (activityError) {
        console.error("Activity Insert Failed:", activityError);
      } else {
        console.log("Activity Saved:", activityData);
      }

      toast.success("Plot Booked Successfully");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Booking Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Book Plot #{plot.plot_no}</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Customer Name *</label>

            <input
              type="text"
              name="name"
              placeholder="Enter Customer Name"
              value={customer.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mobile Number *</label>

            <input
              type="text"
              name="mobile"
              placeholder="Enter Mobile Number"
              value={customer.mobile}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Plot Number</label>

            <input value={plot.plot_no} readOnly />
          </div>

          <div className="form-group">
            <label>Plot Size</label>

            <input value={`${plot.plot_size} Sq.Yds`} readOnly />
          </div>

          <div className="form-group">
            <label>Facing</label>

            <input value={plot.facing} readOnly />
          </div>

          <div className="form-group">
            <label>Payment Mode</label>

            <select
              name="payment_mode"
              value={customer.payment_mode}
              onChange={handleChange}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="form-group">
            <label>Advance Amount</label>

            <input
              type="number"
              name="advance"
              placeholder="0"
              value={customer.advance}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Total Amount</label>

            <input
              value={`₹ ${totalAmount.toLocaleString("en-IN")}`}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Balance Amount</label>

            <input
              value={`₹ ${balance.toLocaleString("en-IN")}`}
              readOnly
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={bookPlot}
            disabled={loading}
          >
            {loading ? "Booking..." : "Book Plot"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookPlotModal;