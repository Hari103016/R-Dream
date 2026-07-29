import { useState } from "react";
import { supabase } from "../services/supabase";
import "./AddCustomerModal.css";

function AddCustomerModal({ onClose }) {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    plot_no: "",
    plot_size: "",
    facing: "East",
    status: "Booked",
    total_amount: "",
    amount_paid: "",
    balance: 0,
    booking_date: today,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    if (name === "total_amount" || name === "amount_paid") {
      const total = Number(
        name === "total_amount" ? value : updatedData.total_amount
      );

      const paid = Number(
        name === "amount_paid" ? value : updatedData.amount_paid
      );

      updatedData.balance = total - paid;

      if (updatedData.balance < 0) {
        updatedData.balance = 0;
      }
    }

    setFormData(updatedData);
  };

  const saveCustomer = async () => {
    if (
      !formData.name.trim() ||
      !formData.mobile.trim() ||
      !formData.plot_no.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }
        const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .insert([
        {
          name: formData.name,
          mobile: formData.mobile,
          plot_no: formData.plot_no,
          plot_size: formData.plot_size,
          facing: formData.facing,
          status: formData.status,
          total_amount: Number(formData.total_amount || 0),
          amount_paid: Number(formData.amount_paid || 0),
          balance: Number(formData.balance || 0),
          booking_date: formData.booking_date,
        },
      ])
      .select()
      .single();

    if (customerError) {
      console.error("Customer Error:", customerError);
      alert(customerError.message);
      return;
    }

    // Insert first payment automatically
    if (Number(formData.amount_paid) > 0) {
      const { error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            customer_id: customerData.id,
            amount: Number(formData.amount_paid),
            payment_mode: "Cash",
            remarks: "Booking Advance",
            payment_date: formData.booking_date,
          },
        ]);

      if (paymentError) {
        console.error("Payment Error:", paymentError);
        alert(paymentError.message);
        return;
      }
    }

    alert("Customer Added Successfully");

    onClose();
  };

  return (
    <div className="modal-overlay">
  <div className="customer-modal">

    <h2>Add New Customer</h2>

    <div className="form-grid">

      <div className="form-group">
        <label>Customer Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter customer name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Mobile Number</label>
        <input
          type="text"
          name="mobile"
          placeholder="Enter mobile number"
          value={formData.mobile}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Plot Number</label>
        <input
          type="text"
          name="plot_no"
          placeholder="Enter plot number"
          value={formData.plot_no}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Plot Size</label>
        <input
          type="text"
          name="plot_size"
          placeholder="Enter plot size"
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
          <option value="East">East</option>
          <option value="West">West</option>
          <option value="North">North</option>
          <option value="South">South</option>
        </select>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Available">Available</option>
          <option value="Booked">Booked</option>
          <option value="Sold">Sold</option>
        </select>
      </div>

      <div className="form-group">
        <label>Total Amount</label>
        <input
          type="number"
          name="total_amount"
          placeholder="Enter total amount"
          value={formData.total_amount}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Amount Paid</label>
        <input
          type="number"
          name="amount_paid"
          placeholder="Enter amount paid"
          value={formData.amount_paid}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Balance</label>
        <input
          type="number"
          value={formData.balance}
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
        onClick={saveCustomer}
      >
        Save Customer
      </button>
    </div>

  </div>
</div>
);
}

export default AddCustomerModal;