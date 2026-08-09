import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import AddPaymentModal from "../components/AddPaymentModal";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./CustomerDetails.css";

import {
  User,
  Phone,
  MapPinned,
  Calendar,
  IndianRupee,
  CreditCard,
  Wallet,
  Receipt,
  ArrowLeft,
} from "lucide-react";

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [plots, setPlots] = useState([]);
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
      // -----------------------------------------
      // GET CUSTOMER
      // -----------------------------------------
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setCustomer(data);

      // -----------------------------------------
      // GET CUSTOMER PLOT NUMBERS
      // -----------------------------------------
      const plotNumbers = data.plot_no
        ? data.plot_no
            .split(",")
            .map((p) => Number(p.trim()))
            .filter(Boolean)
        : [];

      // -----------------------------------------
      // GET PLOTS
      // -----------------------------------------
      if (plotNumbers.length > 0) {
        const {
          data: plotData,
          error: plotError,
        } = await supabase
          .from("plots")
          .select("*")
          .in("plot_no", plotNumbers);

        if (plotError) throw plotError;

        setPlots(plotData || []);
      } else {
        setPlots([]);
      }

      // -----------------------------------------
      // GET PAYMENTS
      // -----------------------------------------
      const { data: paymentData, error: paymentError } =
        await supabase
          .from("payments")
          .select("*")
          .eq("customer_id", data.id)
          .order("payment_date", {
            ascending: false,
          });

      if (paymentError) throw paymentError;

      setPayments(paymentData || []);
    } catch (err) {
      console.error(err);

      toast.error("Customer not found.");

      navigate("/customers");
      return;
    }

    setLoading(false);
  }

  // ============================================
  // OPEN EDIT
  // ============================================

  function openEdit() {
    setFormData({
      name: customer.name || "",
      mobile: customer.mobile || "",
      plot_no: customer.plot_no || "",
      plot_size: customer.plot_size || "",
      facing: customer.facing || "",
      status: customer.status || "",
      total_amount: customer.total_amount || "",
      amount_paid: customer.amount_paid || "",
      balance: customer.balance || "",
      booking_date: customer.booking_date || "",
    });

    setShowEdit(true);
  }

  // ============================================
  // REMOVE PLOT
  // ============================================

  async function handleRemovePlot(plot) {
    const result = await Swal.fire({
      title: "Remove Plot?",
      text: `Remove Plot ${plot.plot_no}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#2563eb",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      // -----------------------------------------
      // 1. MAKE SELECTED PLOT AVAILABLE
      // -----------------------------------------

      const { error: plotError } = await supabase
        .from("plots")
        .update({
          status: "Available",
          customer_id: null,
        })
        .eq("id", plot.id);

      if (plotError) {
        throw plotError;
      }

      // -----------------------------------------
      // 2. REMOVE PLOT FROM CURRENT LIST
      // -----------------------------------------

      const updatedPlots = plots.filter(
        (item) => item.id !== plot.id
      );

      // -----------------------------------------
      // 3. REMAINING PLOT NUMBERS
      // -----------------------------------------

      const plotNumbers = updatedPlots
        .map((item) => item.plot_no)
        .join(",");

      // -----------------------------------------
      // 4. REMAINING PLOT SIZES
      // -----------------------------------------

      const plotSizes = updatedPlots
        .map((item) => item.plot_size)
        .join(",");

      // -----------------------------------------
      // 5. REMAINING FACINGS
      // -----------------------------------------

      const facings = updatedPlots
        .map((item) => item.facing)
        .filter(Boolean)
        .join(",");

      // -----------------------------------------
      // 6. CALCULATE NEW TOTAL
      // -----------------------------------------

      const totalAmount = updatedPlots.reduce(
        (sum, item) =>
          sum + Number(item.price || 0),
        0
      );

      // -----------------------------------------
      // 7. KEEP AMOUNT PAID
      // -----------------------------------------

      const amountPaid = Number(
        customer.amount_paid || 0
      );

      // -----------------------------------------
      // 8. CALCULATE NEW BALANCE
      // -----------------------------------------

      const balance = Math.max(
        0,
        totalAmount - amountPaid
      );

      // -----------------------------------------
      // 9. UPDATE CUSTOMER
      // -----------------------------------------

      const {
        data: updatedCustomer,
        error: customerError,
      } = await supabase
        .from("customers")
        .update({
          plot_no: plotNumbers,
          plot_size: plotSizes,
          facing: facings,
          total_amount: totalAmount,
          amount_paid: amountPaid,
          balance: balance,

          status:
            updatedPlots.length === 0
              ? "Available"
              : customer.status,
        })
        .eq("id", customer.id)
        .select()
        .single();

      if (customerError) {
        throw customerError;
      }

      // -----------------------------------------
      // 10. UPDATE SCREEN IMMEDIATELY
      // -----------------------------------------

      setPlots(updatedPlots);

      setCustomer(updatedCustomer);

      // -----------------------------------------
      // 11. UPDATE EDIT FORM
      // -----------------------------------------

      setFormData((prev) => ({
        ...prev,

        plot_no: plotNumbers,
        plot_size: plotSizes,
        facing: facings,

        total_amount: totalAmount,
        amount_paid: amountPaid,
        balance: balance,

        status:
          updatedPlots.length === 0
            ? "Available"
            : customer.status,
      }));

      // -----------------------------------------
      // SUCCESS
      // -----------------------------------------

      await Swal.fire({
        title: "Removed!",
        text: `Plot ${plot.plot_no} removed successfully.`,
        icon: "success",
        confirmButtonColor: "#2563eb",
      });
    } catch (error) {
      console.error(
        "Remove plot error:",
        error
      );

      Swal.fire({
        title: "Error",
        text:
          error.message ||
          "Unable to remove plot.",
        icon: "error",
        confirmButtonColor: "#2563eb",
      });
    }
  }

  // ============================================
  // SAVE CUSTOMER
  // ============================================

  async function saveCustomer() {
    const totalAmount = Number(
      formData.total_amount || 0
    );

    const amountPaid = Number(
      formData.amount_paid || 0
    );

    const balance = Math.max(
      0,
      totalAmount - amountPaid
    );

    const { error } = await supabase
      .from("customers")
      .update({
        name: formData.name,
        mobile: formData.mobile,
        plot_no: formData.plot_no,
        plot_size: formData.plot_size,
        facing: formData.facing,
        status: formData.status,
        total_amount: totalAmount,
        amount_paid: amountPaid,
        balance: balance,
        booking_date: formData.booking_date,
      })
      .eq("id", customer.id);

    if (error) {
      toast.error(
        error.message ||
          "Something went wrong"
      );
      return;
    }

    setShowEdit(false);

    Swal.fire({
      title: "Customer Updated Successfully!",
      text: "Customer details have been saved.",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#2563eb",
    }).then(() => {
      fetchCustomer();
    });

    toast.success(
      "Customer Updated Successfully"
    );
  }
    // ============================================
  // DELETE CUSTOMER
  // ============================================

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
      // -----------------------------------------
      // DELETE PAYMENT HISTORY
      // -----------------------------------------

      const { error: paymentError } =
        await supabase
          .from("payments")
          .delete()
          .eq("customer_id", customer.id);

      if (paymentError) {
        throw paymentError;
      }

      // -----------------------------------------
      // MAKE CUSTOMER'S PLOTS AVAILABLE
      // -----------------------------------------

      const { error: plotError } =
        await supabase
          .from("plots")
          .update({
            status: "Available",
            customer_id: null,
          })
          .eq("customer_id", customer.id);

      if (plotError) {
        throw plotError;
      }

      // -----------------------------------------
      // DELETE CUSTOMER
      // -----------------------------------------

      const { error: customerError } =
        await supabase
          .from("customers")
          .delete()
          .eq("id", customer.id);

      if (customerError) {
        throw customerError;
      }

      // -----------------------------------------
      // SUCCESS
      // -----------------------------------------

      await Swal.fire({
        title: "Deleted!",
        text: "Customer deleted successfully.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      navigate("/plots", {
        replace: true,
      });
    } catch (err) {
      console.error(err);

      toast.error(
        err.message ||
          "Something went wrong"
      );
    }
  }

  // ============================================
  // WHATSAPP
  // ============================================

  function sendWhatsApp() {
    if (!customer?.mobile) {
      toast.error(
        "Customer mobile number not found."
      );
      return;
    }

    const phone = customer.mobile.replace(
      /\D/g,
      ""
    );

    const message = `🏡 *R DREAM INFRA DEVELOPERS*

Hello ${customer.name},

Your Plot Details

📍 Plot No : ${customer.plot_no}
📐 Plot Size : ${customer.plot_size} Sq.Yds
🧭 Facing : ${customer.facing}

💰 Total Amount : ₹${Number(
      customer.total_amount || 0
    ).toLocaleString("en-IN")}

💵 Amount Paid : ₹${Number(
      customer.amount_paid || 0
    ).toLocaleString("en-IN")}

💳 Balance : ₹${Number(
      customer.balance || 0
    ).toLocaleString("en-IN")}

Thank you for choosing R Dream Infra Developers.

📞 Contact us for any assistance.`;

    window.open(
      `https://wa.me/91${phone}?text=${encodeURIComponent(
        message
      )}`,
      "_blank"
    );
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="customer-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  // ============================================
  // CALCULATE CUSTOMER AMOUNTS
  // ============================================

  const total = Number(
    customer?.total_amount || 0
  );

  const paid = Number(
    customer?.amount_paid || 0
  );

  // Always calculate balance from
  // Total Amount - Amount Paid
  const balance = Math.max(
    0,
    total - paid
  );

  const percent =
    total === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (paid / total) * 100
          )
        );

  // ============================================
  // MAIN PAGE
  // ============================================

  return (
    <div className="customer-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="customer-header">

        <button
          className="back-btn"
          onClick={() =>
            navigate("/customers")
          }
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1>
          Customer Profile
        </h1>

      </div>

      {/* ======================================
          PROFILE CARD
      ====================================== */}

      <div className="profile-card">

        <div className="profile-top">

          <div className="avatar">
            {customer?.name
              ? customer.name
                  .charAt(0)
                  .toUpperCase()
              : "C"}
          </div>

          <div className="profile-details">

            <h2>
              {customer?.name}
            </h2>

            <p>
              Customer ID :
              <strong>
                {" "}
                #{customer?.id}
              </strong>
            </p>

            <p>
              📱 {customer?.mobile}
            </p>

            <p>
              🏡 Plot No :
              <strong>
                {" "}
                {customer?.plot_no || "-"}
              </strong>
            </p>

            <p>
              📅 {customer?.booking_date}
            </p>

            <span
              className={`status-badge ${
                customer?.status
                  ?.toLowerCase()
                  .replace(
                    /\s+/g,
                    "-"
                  ) || ""
              }`}
            >
              {customer?.status}
            </span>

          </div>

        </div>

        {/* ==================================
            SUMMARY CARDS
        ================================== */}

        <div className="summary-grid">

          {/* TOTAL */}

          <div className="summary-card">

            <IndianRupee size={30} />

            <h4>
              Total Amount
            </h4>

            <h2>
              ₹
              {total.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

          {/* PAID */}

          <div className="summary-card paid">

            <Wallet size={30} />

            <h4>
              Amount Paid
            </h4>

            <h2>
              ₹
              {paid.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

          {/* BALANCE */}

          <div className="summary-card balance">

            <CreditCard size={30} />

            <h4>
              Balance
            </h4>

            <h2>
              ₹
              {balance.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

          {/* PAYMENTS */}

          <div className="summary-card">

            <Receipt size={30} />

            <h4>
              Total Payments
            </h4>

            <h2>
              {payments.length}
            </h2>

          </div>

        </div>

        {/* ==================================
            PAYMENT PROGRESS
        ================================== */}

        <div className="progress-section">

          <div className="progress-header">

            <span>
              Payment Progress
            </span>

            <span>
              {percent}%
            </span>

          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${percent}%`,
              }}
            />

          </div>

        </div>

      </div>

      {/* ======================================
          CUSTOMER INFORMATION
      ====================================== */}

      <div className="cd-info-grid">

        {/* CUSTOMER NAME */}

        <div className="cd-info-card">

          <User className="card-icon" />

          <div className="card-content">

            <h4>
              Customer Name
            </h4>

            <p>
              {customer?.name}
            </p>

          </div>

        </div>

        {/* MOBILE */}

        <div className="cd-info-card">

          <Phone className="card-icon" />

          <div className="card-content">

            <h4>
              Mobile Number
            </h4>

            <p>
              {customer?.mobile}
            </p>

          </div>

        </div>

        {/* FACING */}

        <div className="cd-info-card">

          <MapPinned className="card-icon" />

          <div className="card-content">

            <h4>
              Facing
            </h4>

            <p>
              {customer?.facing || "-"}
            </p>

          </div>

        </div>

        {/* ==================================
            PLOTS
        ================================== */}

        <div className="cd-info-card plots-card">

          <MapPinned className="card-icon" />

          <div className="card-content">

            <h4>
              Plot No & Size
            </h4>

            <div className="plot-scroll">

              {plots.length === 0 ? (

                <p>
                  No plots assigned
                </p>

              ) : (

                plots.map((plot) => (

                  <div
                    className="plot-row"
                    key={plot.id}
                  >

                    <div>

                      <p>
                        Plot #
                        {plot.plot_no}
                      </p>

                      <span>
                        {plot.plot_size}{" "}
                        Sq.Yds
                      </span>

                    </div>

                    <button
                      type="button"
                      className="remove-plot-btn"
                      onClick={() =>
                        handleRemovePlot(
                          plot
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                ))

              )}

            </div>

          </div>

        </div>

        {/* BOOKING DATE */}

        <div className="cd-info-card">

          <Calendar className="card-icon" />

          <div className="card-content">

            <h4>
              Booking Date
            </h4>

            <p>
              {customer?.booking_date}
            </p>

          </div>

        </div>

      </div>
            {/* ======================================
          ACTION BUTTONS
      ====================================== */}

      <div className="action-buttons">

        {/* EDIT CUSTOMER */}

        <button
          type="button"
          className="edit-btn"
          onClick={openEdit}
        >
          ✏ Edit Customer
        </button>

        {/* ADD PAYMENT */}

        <button
          type="button"
          className="payment-btn"
          onClick={() =>
            setShowPayment(true)
          }
        >
          💰 Add Payment
        </button>

        {/* WHATSAPP */}

        <button
          type="button"
          className="whatsapp-btn"
          onClick={sendWhatsApp}
        >
          💬 WhatsApp
        </button>

        {/* PRINT RECEIPT */}

        <button
          type="button"
          className="receipt-btn"
          onClick={() =>
            navigate("/receipt", {
              state: {
                customer,
                payments,
              },
            })
          }
        >
          🖨 Print Receipt
        </button>

        {/* DELETE CUSTOMER */}

        <button
          type="button"
          className="delete-btn"
          onClick={deleteCustomer}
        >
          🗑 Delete Customer
        </button>

      </div>

      {/* ======================================
          PAYMENT HISTORY
      ====================================== */}

      <div className="payment-history">

        <h2>
          Payment History
        </h2>

        <table className="payment-table">

          <thead>

            <tr>

              <th>
                Date
              </th>

              <th>
                Receipt No
              </th>

              <th>
                Amount
              </th>

              <th>
                Mode
              </th>

              <th>
                Remarks
              </th>

            </tr>

          </thead>

          <tbody>

            {payments.length === 0 ? (

              <tr>

                <td colSpan="5">
                  No Payments Found
                </td>

              </tr>

            ) : (

              payments.map(
                (payment, index) => (

                  <tr
                    key={payment.id}
                  >

                    {/* DATE */}

                    <td>
                      {new Date(
                        payment.payment_date
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                    {/* RECEIPT */}

                    <td>
                      RCPT-
                      {String(
                        index + 1
                      ).padStart(
                        4,
                        "0"
                      )}
                    </td>

                    {/* AMOUNT */}

                    <td>
                      ₹
                      {Number(
                        payment.amount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    {/* MODE */}

                    <td>
                      {payment.payment_mode ||
                        "-"}
                    </td>

                    {/* REMARKS */}

                    <td>
                      {payment.remarks ||
                        "-"}
                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

      {/* ======================================
          BOOKING TIMELINE
      ====================================== */}

      <div className="timeline-section">

        <h2>
          Booking Timeline
        </h2>

        <div className="timeline">

          {/* ==================================
              BOOKING
          ================================== */}

          <div className="timeline-item">

            <div className="timeline-icon success">
              ✓
            </div>

            <div className="timeline-content">

              <h4>
                Plot Booked
              </h4>

              <p>
                {customer?.booking_date}
              </p>

            </div>

          </div>

          {/* ==================================
              ADVANCE PAYMENT
          ================================== */}

          <div className="timeline-item">

            <div className="timeline-icon paid">
              ₹
            </div>

            <div className="timeline-content">

              <h4>
                Advance Paid
              </h4>

              <p>
                ₹
                {paid.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

          </div>

          {/* ==================================
              BALANCE PENDING
          ================================== */}

          {balance > 0 && (

            <div className="timeline-item">

              <div className="timeline-icon pending">
                !
              </div>

              <div className="timeline-content">

                <h4>
                  Balance Pending
                </h4>

                <p>
                  ₹
                  {balance.toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

            </div>

          )}

          {/* ==================================
              PAYMENT COMPLETED
          ================================== */}

          {balance === 0 && (

            <div className="timeline-item">

              <div className="timeline-icon complete">
                ✓
              </div>

              <div className="timeline-content">

                <h4>
                  Payment Completed
                </h4>

                <p>
                  Customer has cleared
                  all dues.
                </p>

              </div>

            </div>

          )}

        </div>

      </div>

      {/* ======================================
          EDIT CUSTOMER MODAL
      ====================================== */}

      {showEdit && (

        <div className="modal-overlay">

          <div className="modal">

            <h2>
              Edit Customer
            </h2>

            <div className="form-grid">

              {/* CUSTOMER NAME */}

              <input
                type="text"
                placeholder="Customer Name"
                value={
                  formData.name
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
              />

              {/* MOBILE */}

              <input
                type="text"
                placeholder="Mobile Number"
                value={
                  formData.mobile
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mobile:
                      e.target.value,
                  })
                }
              />

              {/* PLOT NUMBER */}

              <input
                type="text"
                placeholder="Plot Number"
                value={
                  formData.plot_no
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plot_no:
                      e.target.value,
                  })
                }
              />

              {/* PLOT SIZE */}

              <input
                type="text"
                placeholder="Plot Size"
                value={
                  formData.plot_size
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plot_size:
                      e.target.value,
                  })
                }
              />

              {/* FACING */}

              <input
                type="text"
                placeholder="Facing"
                value={
                  formData.facing
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    facing:
                      e.target.value,
                  })
                }
              />

              {/* STATUS */}

              <input
                type="text"
                placeholder="Status"
                value={
                  formData.status
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status:
                      e.target.value,
                  })
                }
              />

              {/* TOTAL AMOUNT */}

              <input
                type="number"
                placeholder="Total Amount"
                value={
                  formData.total_amount
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_amount:
                      e.target.value,
                  })
                }
              />

              {/* AMOUNT PAID */}

              <input
                type="number"
                placeholder="Amount Paid"
                value={
                  formData.amount_paid
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount_paid:
                      e.target.value,
                  })
                }
              />

              {/* BALANCE */}

              <input
                type="number"
                placeholder="Balance"
                value={
                  formData.balance
                }
                readOnly
              />

              {/* BOOKING DATE */}

              <input
                type="date"
                value={
                  formData.booking_date
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    booking_date:
                      e.target.value,
                  })
                }
              />

            </div>

            {/* ==================================
                MODAL BUTTONS
            ================================== */}

            <div className="modal-buttons">

              <button
                type="button"
                className="save-btn"
                onClick={
                  saveCustomer
                }
              >
                Save Changes
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={() =>
                  setShowEdit(false)
                }
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}
            {/* ======================================
          ADD PAYMENT MODAL
      ====================================== */}

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

export default CustomerDetails;