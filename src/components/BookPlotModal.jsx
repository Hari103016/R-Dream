import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  UserRound,
  Smartphone,
  MapPinned,
  Layers3,
  Ruler,
  CreditCard,
  WalletCards,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Building2,
  CalendarDays,
} from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../services/supabase";
import "./BookPlotModal.css";

function BookPlotModal({
  plot,
  selectedPlots = [],
  onClose
}) {

  const bookingPlots =
    selectedPlots.length > 0
      ? selectedPlots
      : plot
        ? [plot]
        : [];


  const [customer, setCustomer] = useState({

    name: "",
    mobile: "",
    address: "",
    advance: "",
    payment_mode: "Cash"

  });


  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();



  const totalAmount = useMemo(() => {

    return bookingPlots.reduce(

      (sum, item) =>
        sum + Number(item.price || 0),

      0

    );

  }, [bookingPlots]);



  const advance = Number(
    customer.advance || 0
  );



  const balance = Math.max(

    totalAmount - advance,

    0

  );



  const plotNumbers = bookingPlots

    .map(item => item.plot_no)

    .join(", ");



  const plotSizes = bookingPlots

    .map(item => `${item.plot_size} Sq.Yds`)

    .join(", ");



  function handleChange(e) {

    const {
      name,
      value
    } = e.target;


    setCustomer(prev => ({

      ...prev,

      [name]:

        name === "advance"

          ? value.replace(/[^0-9]/g, "")

          : value

    }));

  }
  async function bookPlot() {
    if (loading || successData) return;

    const name = customer.name.trim();
    const mobile = customer.mobile.trim();

    if (!name) {
      toast.error("Enter Customer Name");
      return;
    }

    if (!mobile) {
      toast.error("Enter Mobile Number");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    if (bookingPlots.length === 0) {
      toast.error("Select at least one plot");
      return;
    }

    if (advance > totalAmount) {
      toast.error("Advance cannot be greater than Total Amount");
      return;
    }

    setLoading(true);

    try {
      const now = new Date().toISOString();
      const plotIds = bookingPlots.map((item) => item.id);
      const newStatus = balance === 0 ? "Sold" : "Booked";

      // 1. Re-check availability immediately before creating the booking.
      const { data: latestPlots, error: availabilityError } = await supabase
        .from("plots")
        .select("id, status")
        .in("id", plotIds);

      if (availabilityError) throw availabilityError;

      if (!latestPlots || latestPlots.length !== plotIds.length) {
        throw new Error("One or more selected plots could not be found.");
      }

      const unavailable = latestPlots.some((item) => {
        const status = String(item.status || "").toLowerCase();
        return status === "booked" || status === "sold";
      });

      if (unavailable) {
        toast.error("One or more selected plots are already booked or sold.");
        return;
      }

      // 2. Create the customer and get only the new customer ID.
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .insert([{
          name,
          mobile,
          plot_no: plotNumbers,
          plot_size: plotSizes,
          facing: bookingPlots.map((item) => item.facing).join(", "),
          total_amount: totalAmount,
          amount_paid: advance,
          balance,
          booking_date: now,

          // Keep the customer linked to the selected venture.
          venture_id: bookingPlots[0]?.venture_id ?? null,

          // Keep registration state explicit.
          registration_status:
            newStatus === "Sold" ? "Completed" : "Pending",

          status: newStatus,
        }])
        .select("id")
        .single();

      if (customerError) throw customerError;
      if (!customerData?.id) throw new Error("Customer was not created.");

      const customerId = customerData.id;

      // 3. Save payment and update all selected plots together.
      const paymentPromise = advance > 0
        ? supabase.from("payments").insert([{
            customer_id: customerId,
            amount: advance,
            payment_mode: customer.payment_mode,
            remarks: bookingPlots.length > 1
              ? "Multiple Plot Booking"
              : "Booking Advance",
            payment_date: now,
            venture_id: bookingPlots[0]?.venture_id ?? null,
          }])
        : Promise.resolve({ error: null });

      const plotUpdatePromise = supabase
        .from("plots")
        .update({
          status: newStatus,
          customer_id: customerId,
        })
        .in("id", plotIds)
        ;

      const [paymentResult, plotResult] = await Promise.all([
        paymentPromise,
        plotUpdatePromise,
      ]);

      if (paymentResult.error) throw paymentResult.error;
      if (plotResult.error) throw plotResult.error;

      // Activity is useful but must never delay the successful booking screen.
      void supabase.from("activities").insert([{
        title: "Plot Booked",
        description: `${name} booked Plot(s): ${plotNumbers}`,
        type: "booking",
      }]).then(({ error }) => {
        if (error) console.warn("Activity log failed:", error);
      });

      // Show the result inside the modal. Do NOT close it automatically.
      setSuccessData({
        customerId,
        name,
        mobile,
        plotNumbers,
        plotSizes,
        totalAmount,
        advance,
        balance,
        status: newStatus,
      });
    } catch (error) {
      console.error("Booking failed:", error);
      console.error("Supabase booking error details:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      });

      toast.error(
        error?.message ||
        error?.details ||
        "Booking Failed"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleViewCustomer() {
    if (!successData?.customerId) return;
    onClose();
    navigate(`/customer/${successData.customerId}`);
  }

  function handleWhatsApp() {
    if (!successData) return;

    const message = [
      "R DREAM INFRA DEVELOPERS",
      "",
      `Hello ${successData.name},`,
      "",
      `Plot No: ${successData.plotNumbers}`,
      `Plot Size: ${successData.plotSizes}`,
      `Total Amount: ₹${successData.totalAmount.toLocaleString("en-IN")}`,
      `Advance Paid: ₹${successData.advance.toLocaleString("en-IN")}`,
      `Balance: ₹${successData.balance.toLocaleString("en-IN")}`,
      `Status: ${successData.status}`,
      "",
      "Thank You",
    ].join("\n");

    const cleanMobile = successData.mobile.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }




  if (successData) {
    return (
      <div className="booking-modal-overlay simple-success-overlay">
        <section
          className="simple-success-popup"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-confirmed-title"
        >
          <button
            type="button"
            className="simple-success-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="simple-success-content">
            <div className="simple-success-check">
              <CheckCircle2 size={36} strokeWidth={2.5} />
            </div>

            <h2 id="booking-confirmed-title">
              Booking <span>Confirmed!</span>
            </h2>

            <p className="simple-success-message">
              Your plot has been booked successfully.
            </p>

            <div className="simple-gold-divider">
              <span />
              <b>◆</b>
              <span />
            </div>

            <div className="simple-success-info">
              <div className="simple-info-row">
                <span>Plot No</span>
                <strong>{successData.plotNumbers}</strong>
              </div>

              <div className="simple-info-row">
                <span>Customer</span>
                <strong>{successData.name}</strong>
              </div>

              <div className="simple-info-row">
                <span>Total Amount</span>
                <strong className="simple-gold-text">
                  ₹{successData.totalAmount.toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="simple-info-row">
                <span>Advance Paid</span>
                <strong className="simple-green-text">
                  ₹{successData.advance.toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="simple-info-row">
                <span>Balance Due</span>
                <strong className="simple-red-text">
                  ₹{successData.balance.toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="simple-success-button"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div
      className="booking-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <section className="booking-modal" role="dialog" aria-modal="true">
        <header className="booking-modal-header">
          <div className="booking-header-left">
            <div className="booking-header-icon">
              <Building2 size={22} />
            </div>

            <div>
              <span className="booking-kicker">PROPERTY MANAGEMENT</span>
              <h2>
                {bookingPlots.length > 1
                  ? "Book Selected Plots"
                  : `Book Plot #${bookingPlots[0]?.plot_no}`}
              </h2>
              <p>
                {bookingPlots.length > 1
                  ? `${bookingPlots.length} plots selected for this booking`
                  : "Create a new customer booking for this property"}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="booking-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close booking"
          >
            <X size={19} />
          </button>
        </header>

        <div className="booking-modal-body first-style-body">
          <div className="first-style-grid">

            {/* LEFT — PLOT DETAILS */}
            <aside className="plot-details-card">
              <div className="plot-card-heading">
                <div>
                  <span className="plot-card-kicker">PLOT DETAILS</span>
                  <h3>Selected Property</h3>
                </div>
                <span className="plot-status-badge">Available</span>
              </div>

              <div className="plot-detail-list">
                <div className="plot-detail-row">
                  <span className="plot-detail-icon"><MapPinned size={16} /></span>
                  <div>
                    <small>Plot Number</small>
                    <strong>{plotNumbers || "-"}</strong>
                  </div>
                </div>

                <div className="plot-detail-row">
                  <span className="plot-detail-icon"><Ruler size={16} /></span>
                  <div>
                    <small>Plot Size</small>
                    <strong>{plotSizes || "-"}</strong>
                  </div>
                </div>

                <div className="plot-detail-row">
                  <span className="plot-detail-icon"><Layers3 size={16} /></span>
                  <div>
                    <small>Facing</small>
                    <strong>
                      {bookingPlots.map(item => item.facing || "-").join(", ")}
                    </strong>
                  </div>
                </div>

                <div className="plot-detail-row">
                  <span className="plot-detail-icon"><Building2 size={16} /></span>
                  <div>
                    <small>Road Width</small>
                    <strong>
                      {bookingPlots.map(item => item.road_width || item.roadWidth || "24 Ft").join(", ")}
                    </strong>
                  </div>
                </div>

                <div className="plot-detail-row">
                  <span className="plot-detail-icon"><IndianRupee size={16} /></span>
                  <div>
                    <small>Price</small>
                    <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              </div>

              <div className="plot-total-card">
                <span className="plot-total-icon"><IndianRupee size={19} /></span>
                <div>
                  <small>Total Amount</small>
                  <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </aside>

            {/* RIGHT — CUSTOMER + PAYMENT */}
            <div className="booking-form-column">

              <section className="first-form-section">
                <div className="first-form-heading">
                  <span className="first-form-icon blue"><UserRound size={16} /></span>
                  <div>
                    <strong>Customer Information</strong>
                    <small>Enter customer details</small>
                  </div>
                </div>

                <div className="first-form-grid">
                  <BookingField
                    icon={<UserRound size={15} />}
                    label="Customer Name"
                    required
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter customer name"
                      value={customer.name}
                      onChange={handleChange}
                      autoComplete="name"
                      disabled={loading}
                    />
                  </BookingField>

                  <BookingField
                    icon={<Smartphone size={15} />}
                    label="Mobile Number"
                    required
                  >
                    <input
                      type="tel"
                      name="mobile"
                      placeholder="Enter mobile number"
                      value={customer.mobile}
                      onChange={handleChange}
                      autoComplete="tel"
                      inputMode="numeric"
                      disabled={loading}
                    />
                  </BookingField>
                </div>

                <BookingField
                  icon={<MapPinned size={15} />}
                  label="Address (Optional)"
                >
                  <textarea
                    name="address"
                    placeholder="Enter complete address"
                    value={customer.address}
                    onChange={handleChange}
                    rows={2}
                    disabled={loading}
                  />
                </BookingField>
              </section>

              <section className="first-form-section payment-section">
                <div className="first-form-heading">
                  <span className="first-form-icon gold"><WalletCards size={16} /></span>
                  <div>
                    <strong>Payment Details</strong>
                    <small>Enter advance and payment method</small>
                  </div>
                </div>

                <div className="first-form-grid">
                  <BookingField icon={<CreditCard size={15} />} label="Payment Mode">
                    <select
                      name="payment_mode"
                      value={customer.payment_mode}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </BookingField>

                  <BookingField
                    icon={<IndianRupee size={15} />}
                    label="Advance Amount"
                  >
                    <div className="booking-money-input">
                      <IndianRupee size={15} />
                      <input
                        type="text"
                        name="advance"
                        inputMode="numeric"
                        placeholder="0"
                        value={customer.advance}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </BookingField>
                </div>

                <div className="first-amount-summary">
                  <BookingAmount
                    icon={<IndianRupee size={16} />}
                    label="Total Amount"
                    value={`₹${totalAmount.toLocaleString("en-IN")}`}
                    tone="blue"
                  />
                  <BookingAmount
                    icon={<CheckCircle2 size={16} />}
                    label="Advance Paid"
                    value={`₹${advance.toLocaleString("en-IN")}`}
                    tone="green"
                  />
                  <BookingAmount
                    icon={<ArrowRight size={16} />}
                    label="Balance Due"
                    value={`₹${balance.toLocaleString("en-IN")}`}
                    tone="red"
                  />
                </div>
              </section>

            </div>
          </div>
        </div>

        <footer className="booking-modal-footer first-style-footer">
          <div className="booking-footer-note">
            <ShieldCheck size={15} />
            <span>Review details before booking.</span>
          </div>

          <div className="booking-footer-actions">
            <button
              type="button"
              className="booking-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="button"
              className="booking-save-btn"
              onClick={bookPlot}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="booking-spinner" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}



function BookingField({ icon, label, required = false, children }) {
  return (
    <label className="booking-field">
      <span>
        <i>{icon}</i>
        {label}
        {required && <b>*</b>}
      </span>
      {children}
    </label>
  );
}

function BookingAmount({ icon, label, value, tone }) {
  return (
    <div className={`booking-amount-card ${tone}`}>
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default BookPlotModal;
