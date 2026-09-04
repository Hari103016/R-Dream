import { useState } from "react";
import { supabase } from "../services/supabase";
import Swal from "sweetalert2";
import "./AddPaymentModal.css";

function AddPaymentModal({ customer, onClose }) {
  const today = new Date().toISOString().split("T")[0];

  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [remarks, setRemarks] = useState("");
  const [paymentDate, setPaymentDate] = useState(today);
  const [saving, setSaving] = useState(false);

  if (!customer) return null;

  const totalAmount = Number(customer.total_amount || 0);
  const amountPaid = Number(customer.amount_paid || 0);
  const balance = Math.max(totalAmount - amountPaid, 0);

  const savePayment = async () => {
    if (saving) return;

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      await Swal.fire({
        title: "Invalid Amount",
        text: "Please enter a valid payment amount.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (totalAmount <= 0) {
      await Swal.fire({
        title: "Invalid Total Amount",
        text: "Customer total amount is invalid.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    if (paymentAmount > balance) {
      await Swal.fire({
        title: "Payment Error",
        text: `Payment cannot exceed ₹${balance.toLocaleString("en-IN")}.`,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    if (!paymentDate) {
      await Swal.fire({
        title: "Date Required",
        text: "Please select payment date.",
        icon: "warning",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setSaving(true);

    try {
      console.log("PAYMENT 1: inserting payment");

      // IMPORTANT:
      // Do not use .select() after insert.
      // Do not read the payments table here.
      // This avoids an RLS SELECT-policy problem.
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          customer_id: customer.id,
          amount: paymentAmount,
          payment_mode: paymentMode,
          remarks: remarks || "",
          payment_date: paymentDate,
        });

      if (paymentError) {
        console.error("PAYMENT INSERT ERROR:", paymentError);
        throw paymentError;
      }

      console.log("PAYMENT 2: payment inserted");

      // Calculate from the customer values already loaded.
      // This avoids another SELECT from payments.
      const newPaid = amountPaid + paymentAmount;
      const newBalance = Math.max(totalAmount - newPaid, 0);

      const isFullyPaid = newPaid >= totalAmount;
      const newStatus = isFullyPaid ? "Sold" : "Booked";
      const newRegistrationStatus = isFullyPaid
        ? "Completed"
        : "Pending";

      console.log("PAYMENT 3: updating customer", {
        newPaid,
        newBalance,
        newStatus,
        newRegistrationStatus,
      });

      const { error: customerError } = await supabase
        .from("customers")
        .update({
          amount_paid: newPaid,
          balance: newBalance,
          status: newStatus,
          registration_status: newRegistrationStatus,
        })
        .eq("id", customer.id);

      if (customerError) {
        console.error("CUSTOMER UPDATE ERROR:", customerError);
        throw customerError;
      }

      console.log("PAYMENT 4: customer updated");

      // The database payment trigger should update the related plot.
      // We intentionally do not make another plot request here.

      // Close immediately after successful database operations.
      onClose();

      setTimeout(() => {
        Swal.fire({
          title: isFullyPaid
            ? "Full Payment Completed!"
            : "Payment Added Successfully!",
          html: `
            <div style="text-align:left;line-height:1.9">
              <div><b>Payment:</b> ₹${paymentAmount.toLocaleString("en-IN")}</div>
              <div><b>Total Paid:</b> ₹${newPaid.toLocaleString("en-IN")}</div>
              <div><b>Balance:</b> ₹${newBalance.toLocaleString("en-IN")}</div>
              <div>
                <b>Registration:</b>
                <span style="
                  color:${isFullyPaid ? "#16a34a" : "#2563eb"};
                  font-weight:700;
                ">
                  ${newRegistrationStatus}
                </span>
              </div>
              <div>
                <b>Status:</b>
                <span style="
                  color:${isFullyPaid ? "#dc2626" : "#ea580c"};
                  font-weight:700;
                ">
                  ${newStatus}
                </span>
              </div>
              ${
                isFullyPaid
                  ? `<div style="margin-top:10px;color:#dc2626;font-weight:700">
                       Plot is now Sold.
                     </div>`
                  : ""
              }
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#2563eb",
          confirmButtonText: "OK",
        });
      }, 100);
    } catch (error) {
      console.error("================================");
      console.error("ADD PAYMENT FAILED");
      console.error(error);
      console.error("================================");

      await Swal.fire({
        title: "Payment Failed",
        text: error?.message || "Payment could not be saved.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="payment-modal">
        <h2>Add Payment</h2>

        <div className="form-group">
          <label>Customer</label>
          <input type="text" value={customer.name || ""} readOnly />
        </div>

        <div className="form-group">
          <label>Plot Number</label>
          <input type="text" value={customer.plot_no || ""} readOnly />
        </div>

        <div className="form-group">
          <label>Total Amount</label>
          <input
            type="text"
            value={`₹ ${totalAmount.toLocaleString("en-IN")}`}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Amount Paid</label>
          <input
            type="text"
            value={`₹ ${amountPaid.toLocaleString("en-IN")}`}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Remaining Balance</label>
          <input
            type="text"
            value={`₹ ${balance.toLocaleString("en-IN")}`}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            placeholder="Enter Amount"
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            max={balance}
            step="1"
            disabled={saving || balance <= 0}
          />
        </div>

        <div className="form-group">
          <label>Payment Mode</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            disabled={saving}
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        <div className="form-group">
          <label>Remarks</label>
          <input
            type="text"
            value={remarks}
            placeholder="Remarks"
            onChange={(e) => setRemarks(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label>Payment Date</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="modal-buttons">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="save-btn"
            onClick={savePayment}
            disabled={saving || balance <= 0 || !amount}
          >
            {saving ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddPaymentModal;
