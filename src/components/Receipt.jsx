import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import "./Receipt.css";
import downloadReceipt from "../utils/downloadReceipt";

export default function Receipt() {
  const receiptRef = useRef();

  // Receive data from CustomerDetails.jsx
  const { state } = useLocation();

  const customer = state?.customer;
  const payments = state?.payments || [];

  if (!customer) {
    return <h2>No Receipt Found</h2>;
  }

  const receiptNo = `RD-${customer.id}`;
  const today = new Date().toLocaleDateString("en-IN");

  return (
    <div className="receipt-page">

      <button
        className="download-btn"
        onClick={() => downloadReceipt(receiptRef)}
      >
        Download PDF
      </button>

      <div
        className="luxury-receipt"
        ref={receiptRef}
      >

        {/* ================= HEADER ================= */}

        <div className="top-header">

          <div className="title-section">

            <h1>R DREAM INFRA DEVELOPERS</h1>

            <p>Premium Residential Open Plots</p>

            <div className="venture-tag">
              KONYAPALEM VENTURE
            </div>

          </div>

          <div className="approval-circle">

            <span className="approval-top">
              PANCHAYAT
            </span>

            <div className="approval-check">
              ✓
            </div>

            <span className="approval-bottom">
              APPROVED
            </span>

          </div>

        </div>

        {/* ================= RECEIPT TITLE ================= */}

        <div className="receipt-title">
          <h2>PAYMENT RECEIPT</h2>
        </div>

        {/* ================= RECEIPT INFO ================= */}

        <div className="receipt-info">

          <div>
            <small>Receipt Number</small>
            <h3>{receiptNo}</h3>
          </div>

          <div>
            <small>Receipt Date</small>
            <h3>{today}</h3>
          </div>

        </div>
                {/* ================= CUSTOMER & PLOT INFORMATION ================= */}

        <div className="info-grid">

          {/* CUSTOMER */}

          <div className="info-card">

            <div className="card-header">
              CUSTOMER INFORMATION
            </div>

            <div className="card-body">

              <div className="row">
                <span>Name</span>
                <strong>{customer.name || "-"}</strong>
              </div>

              <div className="row">
                <span>Mobile</span>
                <strong>{customer.mobile || "-"}</strong>
              </div>

              <div className="row">
                <span>Booking Date</span>
                <strong>
                  {customer.booking_date
                    ? new Date(customer.booking_date).toLocaleDateString("en-IN")
                    : "-"}
                </strong>
              </div>

              <div className="row">
                <span>Status</span>
                <strong>{customer.status || "-"}</strong>
              </div>

              <div className="row">
                <span>Address</span>
                <strong>{customer.address || "-"}</strong>
              </div>

            </div>

          </div>

          {/* PLOT INFORMATION */}

          <div className="info-card">

            <div className="card-header">
              PLOT INFORMATION
            </div>

            <div className="card-body">

              <div className="row">
                <span>Plot Number</span>
                <strong>{customer.plot_no || "-"}</strong>
              </div>

              <div className="row">
                <span>Plot Size</span>
                <strong>
                  {customer.plot_size
                    ? `${customer.plot_size} Sq.Yds`
                    : "-"}
                </strong>
              </div>

              <div className="row">
                <span>Facing</span>
                <strong>{customer.facing || "-"}</strong>
              </div>

              <div className="row">
                <span>Project</span>
                <strong>Konyapalem Venture</strong>
              </div>

              <div className="row">
                <span>Receipt Status</span>

                <strong style={{ color: "#2e7d32" }}>
                  Payment Received
                </strong>

              </div>

            </div>

          </div>

        </div>
             {/* ================= PAYMENT DETAILS ================= */}

        <div className="payment-card">

          <div className="payment-header">
            PAYMENT DETAILS
          </div>

          {payments.length === 0 ? (

            <div
              style={{
                padding: "30px",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              No Payments Found
            </div>

          ) : (

            payments.map((payment, index) => (

              <div
                key={payment.id}
                style={{
                  margin: "25px",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >

                <table className="payment-table">

                  <thead>

                    <tr>
                      <th>S.No</th>
                      <th>Date</th>
                      <th>Payment Mode</th>
                      <th>Remarks</th>
                      <th>Amount</th>
                    </tr>

                  </thead>

                  <tbody>

                    <tr>

                      <td>{index + 1}</td>

                      <td>
                        {new Date(payment.payment_date).toLocaleDateString("en-IN")}
                      </td>

                      <td>{payment.payment_mode}</td>

                      <td>{payment.remarks || "-"}</td>

                      <td className="amount-cell">
                        ₹ {Number(payment.amount).toLocaleString("en-IN")}
                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            ))

          )}

        </div>
                {/* ================= AMOUNT SUMMARY ================= */}

        <div className="summary-section">

          {/* TOTAL AMOUNT */}

          <div className="summary-card">

            <div className="summary-icon">
              ₹
            </div>

            <div className="summary-text">
              <small>Total Amount</small>
            </div>

            <div className="summary-value">
              <h2>
                ₹{" "}
                {Number(customer.total_amount || 0).toLocaleString("en-IN")}
              </h2>
            </div>

          </div>

          {/* PAID AMOUNT */}

          <div className="summary-card">

            <div className="summary-icon">
              💳
            </div>

            <div className="summary-text">
              <small>Paid Amount</small>
            </div>

            <div className="summary-value">
              <h2>
                ₹{" "}
                {payments
                  .reduce(
                    (total, payment) => total + Number(payment.amount || 0),
                    0
                  )
                  .toLocaleString("en-IN")}
              </h2>
            </div>

          </div>

          {/* BALANCE */}

          <div className="summary-card">

            <div className="summary-icon">
              ⚖
            </div>

            <div className="summary-text">
              <small>Balance Amount</small>
            </div>

            <div className="summary-value">
              <h2>
                ₹{" "}
                {Number(customer.balance || 0).toLocaleString("en-IN")}
              </h2>
            </div>

          </div>

        </div>

        {/* ================= DECLARATION ================= */}

        <div className="declaration-box">

          <div className="declaration-title">
            DECLARATION
          </div>

          <p>
            This receipt certifies that the payment has been successfully
            received by <strong>R DREAM INFRA DEVELOPERS</strong> towards the
            purchase of the above-mentioned plot.
          </p>

          <br />

          <p>
            This receipt has been generated electronically from our official
            management system and is valid without a handwritten signature.
          </p>

          <br />

          <p>
            Kindly preserve this receipt for future reference. It may be
            required during plot registration and other documentation.
          </p>

        </div>

        {/* ================= SIGNATURE ================= */}

        <div className="signature-area">

          <div className="company-seal">
            COMPANY
            <br />
            SEAL
          </div>

          <div className="signature-box">

            <div className="signature-line"></div>

            <h4>Authorized Signatory</h4>

            <p>R DREAM INFRA DEVELOPERS</p>

          </div>

        </div>

        {/* ================= NOTE ================= */}

        <div className="signature-section">

          <p className="receipt-note">
            This is a computer-generated receipt and does not require a
            physical signature.
          </p>

        </div>

        {/* ================= FOOTER ================= */}

        <div className="receipt-footer">

          <h3>THANK YOU FOR CHOOSING</h3>

          <h2>R DREAM INFRA DEVELOPERS</h2>

          <p>
            Panchayat Approved Layout • Clear Title • Ready for Registration
          </p>

          <div className="footer-contact">

            <span>📞 +91 9876543210</span>

            <span>✉ info@rdreaminfra.com</span>

            <span>🌐 www.rdreaminfra.com</span>

          </div>

        </div>

        {/* ================= BOTTOM BAR ================= */}

        <div className="bottom-bar">

          <span>
            Generated : {new Date().toLocaleString("en-IN")}
          </span>

          <span>
            Receipt ID : {receiptNo}
          </span>

        </div>

      </div>

    </div>
  );
}