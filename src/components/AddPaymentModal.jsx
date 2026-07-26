import { useState } from "react";
import { supabase } from "../services/supabase";
import "./AddPaymentModal.css";

function AddPaymentModal({ customer, onClose, onSuccess }) {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    amount: "",
    payment_mode: "Cash",
    remarks: "",
    payment_date: today,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const savePayment = async () => {
    if (!formData.amount) {
      alert("Please enter payment amount.");
      return;
    }

    // 1. Insert payment
    const { error } = await supabase
      .from("payments")
      .insert([
        {
          customer_id: customer.id,
          amount: Number(formData.amount),
          payment_mode: formData.payment_mode,
          remarks: formData.remarks,
          payment_date: formData.payment_date,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    // 2. Calculate new paid amount
    const newPaid =
      Number(customer.amount_paid || 0) +
      Number(formData.amount);

    // 3. Calculate new balance
    const newBalance =
      Number(customer.total_amount || 0) -
      newPaid;

    // 4. Update customer
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        amount_paid: newPaid,
        balance: newBalance,
      })
      .eq("id", customer.id);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    alert("Payment Added Successfully");

    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="payment-modal">

        <h2>Add Payment</h2>

        <div className="form-group">
          <label>Customer</label>

          <input
            type="text"
            value={customer.name}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Amount</label>

          <input
            type="number"
            name="amount"
            placeholder="Enter Amount"
            value={formData.amount}
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
            <option>Cash</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
            <option>Cheque</option>
          </select>
        </div>

        <div className="form-group">
          <label>Remarks</label>

          <input
            type="text"
            name="remarks"
            placeholder="Remarks"
            value={formData.remarks}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Payment Date</label>

          <input
            type="date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
          />
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
            onClick={savePayment}
          >
            Save Payment
          </button>

        </div>

      </div>
    </div>
  );
}

export default AddPaymentModal;