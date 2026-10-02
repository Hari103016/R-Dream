import { useState } from "react";
import { supabase } from "../services/supabase";
import Swal from "sweetalert2";
import {
  X,
  WalletCards,
  UserRound,
  MapPin,
  IndianRupee,
  ArrowDownToLine,
  CreditCard,
  FileText,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  ReceiptText,
  Landmark,
} from "lucide-react";
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
  const progress = totalAmount > 0
    ? Math.min(100, Math.round((amountPaid / totalAmount) * 100))
    : 0;

  const paymentAmount = Number(amount || 0);
  const projectedPaid = amountPaid + paymentAmount;
  const projectedBalance = Math.max(totalAmount - projectedPaid, 0);

  const savePayment = async () => {
    if (saving) return;

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      await Swal.fire({
        title: "Enter a payment amount",
        text: "Please enter a valid amount greater than zero.",
        icon: "warning",
        confirmButtonColor: "#176ff2",
      });
      return;
    }

    if (totalAmount <= 0) {
      await Swal.fire({
        title: "Invalid total amount",
        text: "Customer total amount is invalid.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    if (paymentAmount > balance) {
      await Swal.fire({
        title: "Payment exceeds balance",
        text: `Maximum payment allowed is ₹${balance.toLocaleString("en-IN")}.`,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    if (!paymentDate) {
      await Swal.fire({
        title: "Payment date required",
        text: "Please select a payment date.",
        icon: "warning",
        confirmButtonColor: "#176ff2",
      });
      return;
    }

    setSaving(true);

    try {
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          customer_id: customer.id,
          amount: paymentAmount,
          payment_mode: paymentMode,
          remarks: remarks || "",
          payment_date: paymentDate,
        });

      if (paymentError) throw paymentError;

      const newPaid = amountPaid + paymentAmount;
      const newBalance = Math.max(totalAmount - newPaid, 0);
      const isFullyPaid = newPaid >= totalAmount;

      const { error: customerError } = await supabase
        .from("customers")
        .update({
          amount_paid: newPaid,
          balance: newBalance,
          status: isFullyPaid ? "Sold" : "Booked",
          registration_status: isFullyPaid ? "Completed" : "Pending",
        })
        .eq("id", customer.id);

      if (customerError) throw customerError;

      onClose();

      setTimeout(() => {
        Swal.fire({
          width: 520,
          padding: "0",
          background: "transparent",
          color: "#eef6ff",
          showConfirmButton: false,
          showCloseButton: false,
          allowOutsideClick: false,
          customClass: {
            popup: "rd-payment-success-popup",
            htmlContainer: "rd-payment-success-html",
          },
          html: `
            <div class="rd-payment-success-card">
              <div class="rd-success-top">
                <div class="rd-success-check">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5 9.2 17 19 7"/>
                  </svg>
                </div>

                <button type="button" class="rd-success-close" data-rd-close>
                  <span>×</span>
                </button>

                <div class="rd-success-kicker">
                  <span class="rd-success-live-dot"></span>
                  TRANSACTION CONFIRMED
                </div>

                <h2>
                  ${isFullyPaid
                    ? "Full Payment Completed"
                    : "Payment Added Successfully"}
                </h2>

                <p>
                  ${isFullyPaid
                    ? "The customer's payment is now fully settled."
                    : "The payment has been securely added to the customer record."}
                </p>
              </div>

              <div class="rd-success-customer">
                <div class="rd-success-avatar">
                  ${(customer.name || "C").trim().charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>${customer.name || "Customer"}</strong>
                  <span>Customer #${customer.id} · Plot ${customer.plot_no || "-"}</span>
                </div>
                <div class="rd-success-status ${isFullyPaid ? "sold" : "booked"}">
                  <span></span>
                  ${isFullyPaid ? "SOLD" : "BOOKED"}
                </div>
              </div>

              <div class="rd-success-amount">
                <span>PAYMENT RECEIVED</span>
                <strong>₹${paymentAmount.toLocaleString("en-IN")}</strong>
                <small>${paymentMode} · ${paymentDate}</small>
              </div>

              <div class="rd-success-breakdown">
                <div>
                  <span>Total Paid</span>
                  <strong>₹${newPaid.toLocaleString("en-IN")}</strong>
                </div>
                <div>
                  <span>Balance Due</span>
                  <strong>₹${newBalance.toLocaleString("en-IN")}</strong>
                </div>
                <div>
                  <span>Registration</span>
                  <strong>${isFullyPaid ? "Completed" : "Pending"}</strong>
                </div>
                <div>
                  <span>Record Status</span>
                  <strong>${isFullyPaid ? "Sold" : "Booked"}</strong>
                </div>
              </div>

              <div class="rd-success-footer">
                <div class="rd-success-secure">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3 19 6v5c0 4.7-2.9 8.1-7 10-4.1-1.9-7-5.3-7-10V6l7-3Z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  <span>Record saved successfully</span>
                </div>

                <button type="button" class="rd-success-done" data-rd-close>
                  <span>Done</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m5 12 4 4L19 6"/>
                  </svg>
                </button>
              </div>
            </div>
          `,
          didOpen: () => {
            document.querySelectorAll("[data-rd-close]").forEach((button) => {
              button.addEventListener("click", () => Swal.close(), { once: true });
            });
          },
        });
      }, 120);
    } catch (error) {
      console.error("ADD PAYMENT FAILED:", error);
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
    <div
      className="payment-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <section className="payment-modal-card" role="dialog" aria-modal="true">
        <header className="payment-modal-header">
          <div className="payment-header-icon">
            <WalletCards size={22} />
          </div>
          <div className="payment-header-copy">
            <span>FINANCIAL MANAGEMENT</span>
            <h2>Add New Payment</h2>
            <p>Record a payment against this customer's plot.</p>
          </div>
          <button
            type="button"
            className="payment-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </header>

        <div className="payment-customer-bar">
          <div className="payment-customer-avatar">
            {(customer.name || "C").trim().charAt(0).toUpperCase()}
          </div>
          <div className="payment-customer-copy">
            <strong>{customer.name || "Customer"}</strong>
            <span>Customer #{customer.id} · Plot {customer.plot_no || "-"}</span>
          </div>
          <div className="payment-secure-badge">
            <ShieldCheck size={14} />
            Secure Record
          </div>
        </div>

        <div className="payment-modal-body">
          <div className="payment-overview">
            <div className="payment-overview-head">
              <div>
                <span>BOOKING SUMMARY</span>
                <strong>Payment position</strong>
              </div>
              <b>{progress}% paid</b>
            </div>

            <div className="payment-progress-track">
              <div style={{ width: `${progress}%` }} />
            </div>

            <div className="payment-summary-grid">
              <PaymentSummary icon={<IndianRupee size={17} />} label="Total Amount" value={`₹${totalAmount.toLocaleString("en-IN")}`} tone="blue" />
              <PaymentSummary icon={<CheckCircle2 size={17} />} label="Amount Paid" value={`₹${amountPaid.toLocaleString("en-IN")}`} tone="green" />
              <PaymentSummary icon={<ArrowDownToLine size={17} />} label="Balance Due" value={`₹${balance.toLocaleString("en-IN")}`} tone="red" />
            </div>
          </div>

          <div className="payment-form-section">
            <div className="payment-form-heading">
              <span className="payment-heading-icon blue"><CreditCard size={16} /></span>
              <div>
                <strong>Payment Information</strong>
                <small>Enter the details for this transaction</small>
              </div>
            </div>

            <div className="payment-form-grid">
              <PaymentField icon={<UserRound size={15} />} label="Customer">
                <div className="payment-readonly">{customer.name || "-"}</div>
              </PaymentField>

              <PaymentField icon={<MapPin size={15} />} label="Plot Number">
                <div className="payment-readonly">{customer.plot_no || "-"}</div>
              </PaymentField>

              <PaymentField icon={<WalletCards size={15} />} label="Payment Amount" required>
                <div className="payment-input money">
                  <IndianRupee size={15} />
                  <input
                    type="number"
                    value={amount}
                    placeholder="Enter amount"
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    max={balance}
                    step="1"
                    disabled={saving || balance <= 0}
                  />
                </div>
              </PaymentField>

              <PaymentField icon={<CreditCard size={15} />} label="Payment Mode">
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
              </PaymentField>

              <PaymentField icon={<CalendarDays size={15} />} label="Payment Date">
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  disabled={saving}
                />
              </PaymentField>

              <PaymentField icon={<FileText size={15} />} label="Remarks">
                <input
                  type="text"
                  value={remarks}
                  placeholder="Optional remarks"
                  onChange={(e) => setRemarks(e.target.value)}
                  disabled={saving}
                />
              </PaymentField>
            </div>
          </div>

          {amount && paymentAmount > 0 && paymentAmount <= balance && (
            <div className="payment-preview">
              <div className="preview-icon"><ReceiptText size={17} /></div>
              <div>
                <span>AFTER THIS PAYMENT</span>
                <strong>
                  ₹{projectedPaid.toLocaleString("en-IN")} paid
                  <em> · ₹{projectedBalance.toLocaleString("en-IN")} remaining</em>
                </strong>
              </div>
            </div>
          )}
        </div>

        <footer className="payment-modal-footer">
          <div className="payment-footer-note">
            <Landmark size={15} />
            <span>Payment will update the customer's financial status.</span>
          </div>

          <div className="payment-footer-actions">
            <button
              type="button"
              className="payment-cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="payment-save-btn"
              onClick={savePayment}
              disabled={saving || balance <= 0 || !amount}
            >
              <CheckCircle2 size={16} />
              {saving ? "Saving Payment..." : "Save Payment"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function PaymentSummary({ icon, label, value, tone }) {
  return (
    <div className={`payment-summary-card ${tone}`}>
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function PaymentField({ icon, label, required, children }) {
  return (
    <label className="payment-field">
      <span>
        <i>{icon}</i>
        {label}
        {required && <b>*</b>}
      </span>
      {children}
    </label>
  );
}

export default AddPaymentModal;
