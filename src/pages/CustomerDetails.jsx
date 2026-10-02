import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import AddPaymentModal from "../components/AddPaymentModal";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./CustomerDetails.css";

import {
  ArrowLeft,
  UserRound,
  Phone,
  MapPin,
  CalendarDays,
  IndianRupee,
  WalletCards,
  CreditCard,
  ReceiptText,
  Pencil,
  Plus,
  MessageCircle,
  Printer,
  Trash2,
  Map,
  Building2,
  ChevronRight,
  Eye,
  Check,
  Clock3,
  FileText,
  UserCircle,
  Zap,
  Landmark,
  X,
  UserRoundCheck,
  Smartphone,
  Hash,
  Ruler,
  Compass,
  BadgeCheck,
  CalendarClock,
  IndianRupee as RupeeIcon,
  ShieldCheck,
  Save,
  RotateCcw,
} from "lucide-react";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function safeDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
}

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    plot_no: "",
    plot_size: "",
    facing: "",
    status: "",
    total_amount: "",
    amount_paid: "",
    balance: "",
    booking_date: "",
  });

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  async function fetchCustomer() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setCustomer(data);

      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .select("*")
        .eq("customer_id", data.id)
        .order("payment_date", { ascending: false });

      if (paymentError) {
        console.warn("Payment history:", paymentError.message);
      }

      setPayments(paymentData || []);
    } catch (err) {
      console.error(err);
      toast.error("Customer not found.");
      navigate("/customers");
    } finally {
      setLoading(false);
    }
  }

  function openEdit() {
    setFormData({
      name: customer?.name || "",
      mobile: customer?.mobile || "",
      plot_no: customer?.plot_no || "",
      plot_size: customer?.plot_size || "",
      facing: customer?.facing || "",
      status: customer?.status || "",
      total_amount: customer?.total_amount ?? "",
      amount_paid: customer?.amount_paid ?? "",
      balance: customer?.balance ?? "",
      booking_date: customer?.booking_date || "",
    });
    setShowEdit(true);
  }

  async function saveCustomer() {
    const total = Number(formData.total_amount || 0);
    const paid = Number(formData.amount_paid || 0);
    const balance = Math.max(0, total - paid);

    const { error } = await supabase
      .from("customers")
      .update({
        name: formData.name,
        mobile: formData.mobile,
        plot_no: formData.plot_no,
        plot_size: formData.plot_size,
        facing: formData.facing,
        status: formData.status,
        total_amount: total,
        amount_paid: paid,
        balance,
        booking_date: formData.booking_date,
      })
      .eq("id", customer.id);

    if (error) {
      toast.error(error.message || "Unable to update customer.");
      return;
    }

    setShowEdit(false);
    await fetchCustomer();
    toast.success("Customer updated successfully.");
  }

  async function deleteCustomer() {
    const result = await Swal.fire({
      title: "Delete Customer?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#2563eb",
    });

    if (!result.isConfirmed) return;

    try {
      const { error: paymentError } = await supabase
        .from("payments")
        .delete()
        .eq("customer_id", customer.id);

      if (paymentError) throw paymentError;

      const { error: plotError } = await supabase
        .from("plots")
        .update({
          status: "Available",
          customer_id: null,
        })
        .eq("customer_id", customer.id);

      if (plotError) throw plotError;

      const { error: customerError } = await supabase
        .from("customers")
        .delete()
        .eq("id", customer.id);

      if (customerError) throw customerError;

      await Swal.fire({
        title: "Deleted!",
        text: "Customer deleted successfully.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      navigate("/plots", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong.");
    }
  }

  function sendWhatsApp() {
    if (!customer?.mobile) {
      toast.error("Customer mobile number not found.");
      return;
    }

    const phone = customer.mobile.replace(/\D/g, "");
    const message = `🏡 *R DREAM INFRA DEVELOPERS*

Hello ${customer.name},

Your Plot Details

📍 Plot No : ${customer.plot_no}
📐 Plot Size : ${customer.plot_size} Sq.Yds
🧭 Facing : ${customer.facing}

💰 Total Amount : ${money(customer.total_amount)}
💵 Amount Paid : ${money(customer.amount_paid)}
💳 Balance : ${money(customer.balance)}

Thank you for choosing R Dream Infra Developers.

📞 Contact us for any assistance.`;

    window.open(
      `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  const sortedPayments = useMemo(
    () =>
      [...payments].sort(
        (a, b) =>
          new Date(b.payment_date || 0).getTime() -
          new Date(a.payment_date || 0).getTime()
      ),
    [payments]
  );

  if (loading) {
    return (
      <div className="customer-page customer-loading">
        <div className="loading-card">
          <div className="loading-ring" />
          <h2>Loading Customer Profile</h2>
          <p>Please wait...</p>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const total = Number(customer.total_amount || 0);
  const paid = Number(customer.amount_paid || 0);
  const balance = Number(customer.balance ?? Math.max(0, total - paid));
  const percent =
    total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  const firstLetter = customer.name?.trim()?.charAt(0)?.toUpperCase() || "C";
  const status = customer.status || (balance === 0 ? "Completed" : "Booked");
  const registrationStatus =
    customer.registration_status || (balance === 0 ? "Completed" : "Pending");

  const printReceipt = () => {
    navigate("/receipt", {
      state: {
        customer,
        payments: sortedPayments,
      },
    });
  };

  return (
    <div className="customer-page">
      <div className="customer-shell">
        {/* TOP BAR */}
        <header className="customer-topbar">
          <div className="breadcrumb">
            <span className="breadcrumb-muted">Customers</span>
            <ChevronRight size={15} />
            <strong>Customer Profile</strong>
          </div>

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/customers")}
          >
            <ArrowLeft size={17} />
            Back
          </button>
        </header>

        {/* PROFILE HERO */}
        <section className="profile-hero">
          <div className="hero-customer">
            <div className="hero-avatar">{firstLetter}</div>

            <div className="hero-identity">
              <h1>{customer.name || "Customer"}</h1>
              <p className="customer-id">
                Customer ID: <strong>#{customer.id}</strong>
              </p>

              <div className="hero-facts">
                <span>
                  <Phone size={15} />
                  {customer.mobile || "-"}
                </span>
                <span>
                  <MapPin size={15} />
                  Plot No: {customer.plot_no || "-"}
                </span>
                <span>
                  <CalendarDays size={15} />
                  Booking Date: {customer.booking_date || "-"}
                </span>
              </div>
            </div>

            <div className="hero-status">
              <span className="status-pill booked">{status}</span>
              <span className="registration-pill">
                Registration: {registrationStatus}
              </span>

              <div className="facing-badge">
                <MapPin size={18} />
                <div>
                  <small>Facing</small>
                  <strong>{customer.facing || "-"}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-finance">
            <div className="finance-grid">
              <FinanceCard
                icon={<IndianRupee size={20} />}
                label="Total Amount"
                value={money(total)}
                type="total"
              />
              <FinanceCard
                icon={<WalletCards size={20} />}
                label="Amount Paid"
                value={money(paid)}
                type="paid"
              />
              <FinanceCard
                icon={<CreditCard size={20} />}
                label="Balance"
                value={money(balance)}
                type="balance"
              />
            </div>

            <div className="progress-block">
              <div className="progress-label">
                <span>Payment Progress</span>
                <strong>{percent}%</strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-value"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-glow" />
            <Building2 size={92} strokeWidth={1.15} />
            <span>Your Dream</span>
            <strong>Our Priority</strong>
          </div>
        </section>

        {/* CUSTOMER INFORMATION */}
        <section className="information-section">
          <div className="section-heading">
            <div className="heading-left">
              <span className="heading-icon blue">
                <UserRound size={19} />
              </span>
              <h2>Customer Information</h2>
            </div>
            <p>Complete details of the customer and plot booking.</p>
          </div>

          <div className="information-grid">
            <InfoCard
              tone="blue"
              icon={<UserCircle size={20} />}
              title="Personal Details"
              rows={[
                ["Full Name", customer.name || "-"],
                ["Customer ID", `#${customer.id}`],
                ["Phone Number", customer.mobile || "-"],
              ]}
            />

            <InfoCard
              tone="green"
              icon={<Map size={20} />}
              title="Plot Details"
              rows={[
                ["Plot No", customer.plot_no || "-"],
                [
                  "Plot Size",
                  customer.plot_size
                    ? `${customer.plot_size} Sq.Yds`
                    : "-",
                ],
                ["Facing", customer.facing || "-"],
                ["Phase", customer.phase || "-"],
              ]}
            />

            <InfoCard
              tone="orange"
              icon={<CalendarDays size={20} />}
              title="Booking Details"
              rows={[
                ["Booking Date", customer.booking_date || "-"],
                [
                  "Status",
                  <span className="mini-pill yellow">{status}</span>,
                ],
                [
                  "Registration Status",
                  <span className="mini-pill blue">{registrationStatus}</span>,
                ],
                ["Total Amount", money(total)],
              ]}
            />

          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="quick-actions-section">
          <div className="section-heading compact-heading">
            <div className="heading-left">
              <span className="heading-icon yellow">
                <Zap size={19} />
              </span>
              <h2>Quick Actions</h2>
            </div>
          </div>

          <div className="action-buttons">
            <button className="action edit" onClick={openEdit}>
              <Pencil size={18} />
              Edit Customer
            </button>

            <button className="action payment" onClick={() => setShowPayment(true)}>
              <Plus size={19} />
              Add Payment
            </button>

            <button className="action whatsapp" onClick={sendWhatsApp}>
              <MessageCircle size={18} />
              WhatsApp
            </button>

            <button className="action receipt" onClick={printReceipt}>
              <Printer size={18} />
              Print Receipt
            </button>

            <button className="action delete" onClick={deleteCustomer}>
              <Trash2 size={18} />
              Delete Customer
            </button>
          </div>
        </section>

        {/* PAYMENT HISTORY */}
        <section className="data-section payment-history">
          <div className="data-section-header">
            <div className="heading-left">
              <span className="heading-icon blue">
                <ReceiptText size={19} />
              </span>
              <div>
                <h2>Payment History</h2>
                <small className="section-subtitle">
                  All payments received from this customer
                </small>
              </div>
            </div>

            <div className="payment-total-badge">
              <span>Total Paid</span>
              <strong>{money(paid)}</strong>
            </div>
          </div>

          <div className="payment-summary">
            <div className="payment-summary-card">
              <span className="payment-summary-icon blue">
                <ReceiptText size={17} />
              </span>
              <div>
                <small>Total Payments</small>
                <strong>{payments.length}</strong>
              </div>
            </div>

            <div className="payment-summary-card">
              <span className="payment-summary-icon green">
                <IndianRupee size={17} />
              </span>
              <div>
                <small>Amount Received</small>
                <strong>{money(paid)}</strong>
              </div>
            </div>

            <div className="payment-summary-card">
              <span className="payment-summary-icon orange">
                <Clock3 size={17} />
              </span>
              <div>
                <small>Latest Payment</small>
                <strong>
                  {sortedPayments.length
                    ? safeDate(sortedPayments[0].payment_date)
                    : "-"}
                </strong>
              </div>
            </div>
          </div>

          <div className="payment-list">
            {sortedPayments.length === 0 ? (
              <div className="payment-empty">
                <ReceiptText size={28} />
                <strong>No payments found</strong>
                <span>Payment records will appear here after a payment is added.</span>
              </div>
            ) : (
              <>
                <div className="payment-list-head">
                  <span>Date</span>
                  <span>Receipt</span>
                  <span>Amount</span>
                  <span>Mode</span>
                  <span>Transaction ID</span>
                  <span>Remarks</span>
                  <span />
                </div>

                {sortedPayments.map((payment, index) => (
                  <div
                    className="payment-row"
                    key={payment.id || `${payment.payment_date}-${index}`}
                  >
                    <div className="payment-date">
                      <span className="date-icon">
                        <CalendarDays size={15} />
                      </span>
                      <div>
                        <strong>{safeDate(payment.payment_date)}</strong>
                        <small>Payment {sortedPayments.length - index}</small>
                      </div>
                    </div>

                    <span className="receipt-code">
                      {payment.receipt_no ||
                        `RCPT-${String(sortedPayments.length - index).padStart(4, "0")}`}
                    </span>

                    <strong className="payment-amount">
                      {money(payment.amount)}
                    </strong>

                    <span className="mode-chip">
                      {payment.payment_mode || "-"}
                    </span>

                    <span className="transaction-id">
                      {payment.transaction_id || "—"}
                    </span>

                    <span className="payment-remarks">
                      {payment.remarks || "—"}
                    </span>

                    <button
                      className="view-payment"
                      type="button"
                      onClick={() =>
                        navigate("/receipt", {
                          state: {
                            customer,
                            payments: sortedPayments,
                          },
                        })
                      }
                      title="View receipt"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {/* BOOKING TIMELINE */}
        <section className="data-section timeline-section">
          <div className="data-section-header">
            <div className="heading-left">
              <span className="heading-icon blue">
                <Landmark size={19} />
              </span>
              <div>
                <h2>Booking Timeline</h2>
                <small className="section-subtitle">
                  Track the customer journey from booking to completion
                </small>
              </div>
            </div>

            <span className={`timeline-status ${balance === 0 ? "complete" : ""}`}>
              {balance === 0 ? "Booking Completed" : "Booking In Progress"}
            </span>
          </div>

          <div className="timeline">
            <TimelineStep
              active
              complete
              icon={<Check size={17} />}
              title="Plot Booked"
              value={customer.booking_date || "-"}
            />

            <TimelineStep
              active={paid > 0}
              complete={paid > 0}
              icon={<IndianRupee size={17} />}
              title="Advance Paid"
              value={paid > 0 ? money(paid) : "Pending"}
            />

            <TimelineStep
              active={paid > 0 && balance === 0}
              complete={paid > 0 && balance === 0}
              icon={<Clock3 size={17} />}
              title="Payment Completed"
              value={balance === 0 ? "All dues cleared" : `${money(balance)} pending`}
            />

            <TimelineStep
              active={String(registrationStatus).toLowerCase() === "completed"}
              complete={String(registrationStatus).toLowerCase() === "completed"}
              icon={<FileText size={17} />}
              title="Registration"
              value={registrationStatus}
            />

            <TimelineStep
              last
              active={balance === 0}
              complete={balance === 0}
              icon={<Check size={17} />}
              title="Completed"
              value={balance === 0 ? "Completed" : "Pending"}
            />
          </div>
        </section>
      </div>

      {/* EDIT CUSTOMER MODAL */}
      {showEdit && (
        <div className="edit-modal-backdrop" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setShowEdit(false);
        }}>
          <section className="edit-modal-card" role="dialog" aria-modal="true">
            <div className="edit-modal-top">
              <div className="edit-modal-heading">
                <div className="edit-modal-symbol">
                  <UserRoundCheck size={22} />
                </div>
                <div>
                  <span>CUSTOMER MANAGEMENT</span>
                  <h2>Edit Customer Profile</h2>
                  <p>Update customer and booking information securely.</p>
                </div>
              </div>

              <button
                type="button"
                className="edit-modal-close"
                onClick={() => setShowEdit(false)}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="edit-customer-summary">
              <div className="edit-summary-avatar">
                {(formData.name || "C").trim().charAt(0).toUpperCase()}
              </div>
              <div className="edit-summary-copy">
                <strong>{formData.name || "Customer"}</strong>
                <span>Customer #{customer.id} · Plot {formData.plot_no || "-"}</span>
              </div>
              <div className="edit-summary-status">
                <span className="summary-dot" />
                {formData.status || "Booked"}
              </div>
            </div>

            <div className="edit-modal-body">
              <div className="edit-form-section">
                <div className="edit-form-title">
                  <span className="edit-title-icon blue"><UserRoundCheck size={16} /></span>
                  <div>
                    <strong>Personal Information</strong>
                    <small>Basic customer contact details</small>
                  </div>
                </div>

                <div className="edit-form-grid">
                  <EditField icon={<UserRoundCheck size={16} />} label="Customer Name">
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter customer name"
                    />
                  </EditField>

                  <EditField icon={<Smartphone size={16} />} label="Mobile Number">
                    <input
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="Enter mobile number"
                    />
                  </EditField>
                </div>
              </div>

              <div className="edit-form-section">
                <div className="edit-form-title">
                  <span className="edit-title-icon green"><Map size={16} /></span>
                  <div>
                    <strong>Plot Information</strong>
                    <small>Property and booking details</small>
                  </div>
                </div>

                <div className="edit-form-grid three">
                  <EditField icon={<Hash size={16} />} label="Plot Number">
                    <input
                      value={formData.plot_no}
                      onChange={(e) => setFormData({ ...formData, plot_no: e.target.value })}
                      placeholder="Plot number"
                    />
                  </EditField>

                  <EditField icon={<Ruler size={16} />} label="Plot Size">
                    <input
                      value={formData.plot_size}
                      onChange={(e) => setFormData({ ...formData, plot_size: e.target.value })}
                      placeholder="Sq.Yds"
                    />
                  </EditField>

                  <EditField icon={<Compass size={16} />} label="Facing">
                    <input
                      value={formData.facing}
                      onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
                      placeholder="Facing"
                    />
                  </EditField>
                </div>
              </div>

              <div className="edit-form-section">
                <div className="edit-form-title">
                  <span className="edit-title-icon purple"><IndianRupee size={16} /></span>
                  <div>
                    <strong>Financial Details</strong>
                    <small>Payment summary for this booking</small>
                  </div>
                </div>

                <div className="edit-finance-grid">
                  <EditMoneyField
                    label="Total Amount"
                    value={formData.total_amount}
                    icon={<RupeeIcon size={16} />}
                    tone="blue"
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  />
                  <EditMoneyField
                    label="Amount Paid"
                    value={formData.amount_paid}
                    icon={<WalletCards size={16} />}
                    tone="green"
                    onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                  />
                  <div className="edit-readonly-money">
                    <span>Current Balance</span>
                    <strong>
                      ₹{Math.max(
                        Number(formData.total_amount || 0) - Number(formData.amount_paid || 0),
                        0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="edit-form-section compact">
                <div className="edit-form-title">
                  <span className="edit-title-icon orange"><CalendarClock size={16} /></span>
                  <div>
                    <strong>Status & Booking</strong>
                    <small>Booking status and date</small>
                  </div>
                </div>

                <div className="edit-form-grid three">
                  <EditField icon={<BadgeCheck size={16} />} label="Status">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Booked">Booked</option>
                      <option value="Sold">Sold</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </EditField>

                  <EditField icon={<CalendarClock size={16} />} label="Booking Date">
                    <input
                      type="date"
                      value={formData.booking_date}
                      onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    />
                  </EditField>

                  <div className="edit-security-note">
                    <ShieldCheck size={17} />
                    <div>
                      <strong>Protected record</strong>
                      <span>Changes are saved to Supabase.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="edit-modal-footer">
              <div className="edit-footer-note">
                <ShieldCheck size={15} />
                <span>Review the details before saving.</span>
              </div>
              <div className="edit-footer-actions">
                <button
                  type="button"
                  className="edit-cancel-btn"
                  onClick={() => setShowEdit(false)}
                >
                  <RotateCcw size={16} />
                  Cancel
                </button>
                <button
                  type="button"
                  className="edit-save-btn"
                  onClick={saveCustomer}
                >
                  <Save size={17} />
                  Save Customer
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {showPayment && (
        <AddPaymentModal
          customer={customer}
          onClose={() => {
            setShowPayment(false);
            fetchCustomer();
          }}
        />
      )}
    </div>
  );
}

function FinanceCard({ icon, label, value, type }) {
  return (
    <div className={`finance-card ${type}`}>
      <span className="finance-icon">{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function InfoCard({ tone, icon, title, rows }) {
  return (
    <div className={`info-card ${tone}`}>
      <div className="info-card-title">
        <span className="info-card-icon">{icon}</span>
        <strong>{title}</strong>
        <ChevronRight size={17} className="info-arrow" />
      </div>

      <div className="info-card-body">
        {rows.map(([label, value], index) => (
          <div className="info-line" key={`${label}-${index}`}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineStep({ icon, title, value, active, complete, last }) {
  return (
    <div
      className={`timeline-step ${active ? "active" : ""} ${
        complete ? "complete" : ""
      } ${last ? "last" : ""}`}
    >
      <div className="timeline-marker">{icon}</div>
      <div className="timeline-copy">
        <strong>{title}</strong>
        <span>{value}</span>
      </div>
    </div>
  );
}

function EditField({ icon, label, children }) {
  return (
    <label className="edit-field">
      <span className="edit-field-label">
        <i>{icon}</i>
        {label}
      </span>
      {children}
    </label>
  );
}

function EditMoneyField({ label, value, icon, tone, onChange }) {
  return (
    <label className={`edit-money-field ${tone}`}>
      <span>{label}</span>
      <div className="money-input-wrap">
        <i>{icon}</i>
        <input
          type="number"
          value={value}
          onChange={onChange}
          min="0"
          placeholder="0"
        />
      </div>
    </label>
  );
}

function FormField({ label, children }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default CustomerDetails;
