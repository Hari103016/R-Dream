import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./BookPlot.css";

function BookPlot() {
  const { id } = useParams();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plot, setPlot] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    amount_paid: "",
    booking_date: today,
    payment_mode: "Cash",
    remarks: "Booking Advance",
  });

  useEffect(() => {
    fetchPlot();
  }, []);

  async function fetchPlot() {
    const { data, error } = await supabase
      .from("plots")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      navigate("/plots");
      return;
    }

    setPlot(data);
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveBooking() {
    if (!formData.name.trim()) {
      alert("Please enter customer name.");
      return;
    }

    if (!formData.mobile.trim()) {
      alert("Please enter mobile number.");
      return;
    }

    if (!formData.amount_paid) {
      alert("Please enter advance amount.");
      return;
    }

    setSaving(true);

    const totalAmount = Number(plot.price || 0);
    const amountPaid = Number(formData.amount_paid || 0);
    const balance = totalAmount - amountPaid;

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert([
        {
          name: formData.name,
          mobile: formData.mobile,
          plot_no: plot.plot_no,
          plot_size: plot.plot_size,
          facing: plot.facing,
          status: "Booked",
          total_amount: totalAmount,
          amount_paid: amountPaid,
          balance,
          booking_date: formData.booking_date,
        },
      ])
      .select()
      .single();

    if (customerError) {
      setSaving(false);
      alert(customerError.message);
      return;
    }

    if (amountPaid > 0) {
      const { error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            customer_id: customer.id,
            amount: amountPaid,
            payment_mode: formData.payment_mode,
            remarks: formData.remarks,
            payment_date: formData.booking_date,
          },
        ]);

      if (paymentError) {
        setSaving(false);
        alert(paymentError.message);
        return;
      }
    }

    const { error: plotError } = await supabase
      .from("plots")
      .update({
        status: "Booked",
        customer_id: customer.id,
      })
      .eq("id", plot.id);

    if (plotError) {
      setSaving(false);
      alert(plotError.message);
      return;
    }

    setSaving(false);

    alert("Plot Booked Successfully");

    navigate("/plots");
  }

  if (loading) {
    return (
      <div className="booking-page">
        <h2>Loading Plot...</h2>
      </div>
    );
  }

  const totalAmount = Number(plot.price || 0);
  const paid = Number(formData.amount_paid || 0);
  const balance = totalAmount - paid;

  return (
    <div className="booking-page">
      <div className="booking-card">

        <h2>Book Plot #{plot.plot_no}</h2>

        <div className="section-title">
          Plot Information
        </div>

        <div className="details-grid">
                      <div className="form-group">
            <label>Plot Number</label>
            <input
              type="text"
              value={plot.plot_no}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Plot Size</label>
            <input
              type="text"
              value={plot.plot_size}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Facing</label>
            <input
              type="text"
              value={plot.facing}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Total Amount</label>
            <input
              type="text"
              value={`₹${totalAmount.toLocaleString()}`}
              readOnly
            />
          </div>

        </div>

        <div className="section-title">
          Customer Details
        </div>

        <div className="details-grid">

          <div className="form-group">
            <label>Customer Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter customer name"
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
            />
          </div>

          <div className="form-group">
            <label>Advance Amount</label>
            <input
              type="number"
              name="amount_paid"
              value={formData.amount_paid}
              onChange={handleChange}
              placeholder="Enter advance amount"
            />
          </div>

          <div className="form-group">
            <label>Balance Amount</label>
            <input
              type="text"
              value={`₹${balance.toLocaleString()}`}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Booking Date</label>
            <input
              type="date"
              name="booking_date"
              value={formData.booking_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Payment Mode</label>
            <select
              name="payment_mode"
              value={formData.payment_mode}
              onChange={handleChange}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Remarks</label>
            <textarea
              rows="4"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter remarks"
            />
          </div>
                  </div>

        <div className="button-group">

          <button
            className="cancel-btn"
            onClick={() => navigate("/plots")}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={saveBooking}
            disabled={saving}
          >
            {saving ? "Booking..." : "Book Plot"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default BookPlot;