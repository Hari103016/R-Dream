import { Download, User, MapPin, CreditCard } from "lucide-react";
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import downloadReceipt from "../utils/downloadReceipt";
import "./Receipt.css";

export default function Receipt() {
  const { state } = useLocation();

  const customer = state?.customer;
  const payment = state?.payment;

  const receiptRef = useRef();

  if (!customer) {
    return (
      <div className="receipt-page">
        <h2>No Receipt Data Found</h2>
      </div>
    );
  }

  return (
    <div className="receipt-page">

      <button
        className="download-btn"
        onClick={() => downloadReceipt(receiptRef)}
      >
        <Download size={18} />
        Download Receipt
      </button>

      <div
        id="receipt"
        className="receipt"
        ref={receiptRef}
      >

        {/* ================= HEADER ================= */}

        <div className="receipt-header">

          <div className="header-top">

            <div className="company-logo">
              RD
            </div>

            <div className="company-details">

              <div className="approval-tag">
                ★ DTCP APPROVED LAYOUT ★
              </div>

              <h1>R DREAM INFRA DEVELOPERS</h1>

              <p>
                Premium Residential Ventures • Clear Title • Ready For Registration
              </p>

            </div>

            <div className="receipt-badge">

              <span>OFFICIAL</span>

              <strong>RECEIPT</strong>

            </div>

          </div>

          <div className="gold-line"></div>

          <div className="receipt-title">

            <h2>PAYMENT RECEIPT</h2>

            <p>
              Thank you for choosing R Dream Infra Developers
            </p>

          </div>

        </div>

        {/* ================= RECEIPT INFO ================= */}

        <div className="receipt-info">

          <div className="receipt-box">

            <label>Receipt Number</label>

            <h3>
              RD-
              {String(customer.id).padStart(5, "0")}
            </h3>

          </div>

          <div className="receipt-box">

            <label>Payment Date</label>

            <h3>
              {payment?.payment_date || customer.booking_date}
            </h3>

          </div>

          <div className="receipt-box">

            <label>Status</label>

            <h3 className="status-paid">
              {customer.status}
            </h3>

          </div>

        </div>

        {/* ================= CUSTOMER + PLOT ================= */}

        <div className="details-grid">

          <div className="details-card">

            <div className="card-heading">

              <User size={18} />

              <h3>Customer Information</h3>

            </div>

            <div className="detail-row">
              <span>Customer Name</span>
              <strong>{customer.name}</strong>
            </div>

            <div className="detail-row">
              <span>Mobile Number</span>
              <strong>{customer.mobile}</strong>
            </div>

            <div className="detail-row">
              <span>Booking Date</span>
              <strong>{customer.booking_date}</strong>
            </div>

            <div className="detail-row">
              <span>Customer ID</span>
              <strong>
                CUST-
                {String(customer.id).padStart(4, "0")}
              </strong>
            </div>

          </div>

          <div className="details-card">

            <div className="card-heading">

              <MapPin size={18} />

              <h3>Plot Information</h3>

            </div>

            <div className="detail-row">
              <span>Plot Number</span>
              <strong>{customer.plot_no}</strong>
            </div>

            <div className="detail-row">
              <span>Plot Size</span>
              <strong>{customer.plot_size} Sq.Yds</strong>
            </div>

            <div className="detail-row">
              <span>Facing</span>
              <strong>{customer.facing}</strong>
            </div>

            <div className="detail-row">
              <span>Project</span>
              <strong>Konyapalem Venture</strong>
            </div>

          </div>

        </div>

        {/* Payment Summary starts in Part 2 */}
                {/* ================= PAYMENT SUMMARY ================= */}

        <div className="payment-section">

          <div className="section-title">
            <CreditCard size={18} />
            <h3>Payment Summary</h3>
          </div>

          <table className="payment-table">

            <thead>
              <tr>
                <th>Description</th>
                <th align="right">Amount</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>Total Plot Amount</td>
                <td align="right">
                  ₹{Number(customer.total_amount).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td>Total Amount Paid</td>
                <td align="right">
                  ₹{Number(customer.amount_paid).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td>Current Payment</td>
                <td align="right">
                  ₹{Number(payment?.amount || 0).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td>Balance Amount</td>
                <td align="right">
                  ₹{Number(customer.balance).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td>Payment Mode</td>
                <td align="right">
                  {payment?.payment_mode || "Cash"}
                </td>
              </tr>

              <tr>
                <td>Remarks</td>
                <td align="right">
                  {payment?.remarks || "-"}
                </td>
              </tr>

            </tbody>

          </table>

        </div>

        {/* ================= SUMMARY ================= */}

        <div className="summary-grid">

          <div className="summary-card total-card">

            <span>Total Amount</span>

            <h2>
              ₹{Number(customer.total_amount).toLocaleString()}
            </h2>

          </div>

          <div className="summary-card paid-card">

            <span>Total Paid</span>

            <h2>
              ₹{Number(customer.amount_paid).toLocaleString()}
            </h2>

          </div>

          <div className="summary-card balance-card">

            <span>Balance</span>

            <h2>
              ₹{Number(customer.balance).toLocaleString()}
            </h2>

          </div>

        </div>

        {/* ================= DECLARATION ================= */}

        <div className="declaration-box">

          <h3>Declaration</h3>

          <p>

            This receipt confirms that the above payment has been
            received by <strong>R DREAM INFRA DEVELOPERS</strong>
            towards the purchase of the above residential plot.

            This is a computer-generated receipt and does not
            require a physical signature.

          </p>

        </div>

        {/* ================= FOOTER ================= */}

        <div className="receipt-footer">

          <div className="footer-left">

            <h3>Thank You</h3>

            <p>
              Thank you for your trust in
              <strong> R DREAM INFRA DEVELOPERS</strong>.
            </p>

          </div>

          <div className="footer-center">

            <div className="seal-circle">
              COMPANY
              <br />
              SEAL
            </div>

          </div>

          <div className="footer-right">

            <div className="signature-line"></div>

            <strong>Authorized Signature</strong>

          </div>

        </div>

      </div>

    </div>

  );

}