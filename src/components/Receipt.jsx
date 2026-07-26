import { Download, Building2, User, MapPin, Calendar } from "lucide-react";
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import downloadReceipt from "../utils/downloadReceipt";
import "./Receipt.css";

export default function Receipt() {
  const { state } = useLocation();

  const customer = state?.customer;
  const payment = state?.payment;

  const receiptRef = useRef();

  if (!customer) return <h2>No Receipt Data</h2>;

  return (
    <div className="receipt-page">

      <button
        className="download-btn"
        onClick={() => downloadReceipt(receiptRef)}
      >
        <Download size={18}/>
        Download PDF
      </button>

      <div className="receipt" ref={receiptRef}>

        {/* HEADER */}

        <div className="receipt-header">

          <div className="approved">
            DTCP APPROVED OPEN PLOTS
          </div>

          <h1>R DREAM INFRA DEVELOPERS</h1>

          <p>
            Premium Residential Ventures • Clear Title • Ready for Registration
          </p>

          <h2>PAYMENT RECEIPT</h2>

        </div>

        {/* TOP DETAILS */}

        <div className="top-grid">

          <div className="card">

            <label>Receipt Number</label>

            <h3>
              RD-
              {String(customer.id).padStart(5,"0")}
            </h3>

          </div>

          <div className="card">

            <label>Payment Date</label>

            <h3>
              {payment?.payment_date || customer.booking_date}
            </h3>

          </div>

        </div>

        {/* INFO */}

        <div className="info-grid">

          <div className="info-card">

            <h3>
              <User size={18}/>
              Customer Information
            </h3>

            <div className="row">
              <span>Name</span>
              <strong>{customer.name}</strong>
            </div>

            <div className="row">
              <span>Phone</span>
              <strong>{customer.mobile}</strong>
            </div>

            <div className="row">
              <span>Booking</span>
              <strong>{customer.booking_date}</strong>
            </div>

            <div className="row">
              <span>Status</span>
              <strong>{customer.status}</strong>
            </div>

          </div>

          <div className="info-card">

            <h3>
              <MapPin size={18}/>
              Plot Information
            </h3>

            <div className="row">
              <span>Plot No</span>
              <strong>{customer.plot_no}</strong>
            </div>

            <div className="row">
              <span>Size</span>
              <strong>{customer.plot_size} Sq.Yds</strong>
            </div>

            <div className="row">
              <span>Facing</span>
              <strong>{customer.facing}</strong>
            </div>

            <div className="row">
              <span>Project</span>
              <strong>Konyapalem Venture</strong>
            </div>

          </div>

        </div>

        {/* PAYMENT */}

        <div className="table-card">

          <h3>Payment Summary</h3>

          <table>

            <tbody>

              <tr>
                <td>Total Plot Amount</td>
                <td>
                  ₹{Number(customer.total_amount).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td>Total Amount Paid</td>
                <td>
                  ₹{Number(customer.amount_paid).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td>Current Payment</td>
                <td>
                  ₹{Number(payment?.amount || 0).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td>Balance</td>
                <td>
                  ₹{Number(customer.balance).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td>Payment Mode</td>
                <td>{payment?.payment_mode}</td>
              </tr>

              <tr>
                <td>Remarks</td>
                <td>{payment?.remarks || "-"}</td>
              </tr>

            </tbody>

          </table>

        </div>

        {/* SUMMARY */}

        <div className="summary">

          <div className="summary-card blue">

            <label>Total Amount</label>

            <h2>
              ₹{Number(customer.total_amount).toLocaleString()}
            </h2>

          </div>

          <div className="summary-card green">

            <label>Paid</label>

            <h2>
              ₹{Number(customer.amount_paid).toLocaleString()}
            </h2>

          </div>

          <div className="summary-card red">

            <label>Balance</label>

            <h2>
              ₹{Number(customer.balance).toLocaleString()}
            </h2>

          </div>

        </div>

        {/* PAYMENT PROGRESS REMOVED */}

        {/* DECLARATION */}

        <div className="declaration">

          <h3>Declaration</h3>

          <p>

            This receipt confirms that the above payment has been received by
            <b> R DREAM INFRA DEVELOPERS </b>
            towards the purchase of the mentioned plot.

          </p>

        </div>

        {/* FOOTER */}

        <div className="receipt-footer">

          <div>

            <h3>Thank You</h3>

            <p>
              We sincerely appreciate your trust.
            </p>

          </div>

          <div>

            <h4>Company Seal</h4>

          </div>

          <div>

            <h4>Authorized Signature</h4>

          </div>

        </div>

      </div>

    </div>
  );

}