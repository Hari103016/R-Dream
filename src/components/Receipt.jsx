import "./Receipt.css";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Hash,
  BadgeIndianRupee,
  Building2,
  CheckCircle,
  Download,
  Landmark,
  ReceiptText,
} from "lucide-react";

import logo from "../assets/logo.png";
import qr from "../assets/qr.png";
import stamp from "../assets/stamp.png";
import signature from "../assets/signature.png";

import { downloadReceipt } from "../utils/downloadReceipt";

export default function Receipt({ customer, payment }) {

  const totalAmount = Number(customer?.total_amount || 0);
  const paidAmount = Number(customer?.paid_amount || 0);
  const balance = totalAmount - paidAmount;

  const progress =
    totalAmount === 0
      ? 0
      : Math.round((paidAmount / totalAmount) * 100);

  return (

<div className="receipt-wrapper">

<button
className="download-btn"
onClick={downloadReceipt}
>
<Download size={18}/>
Download PDF
</button>

<div
id="receipt"
className="receipt"
>

<div className="watermark">
R DREAM INFRA DEVELOPERS
</div>

{/* ================= HEADER ================= */}

<div className="receipt-header">

<div className="header-overlay"></div>

<div className="left-ribbon">

<img
src={logo}
alt="logo"
/>

</div>

<div className="company-section">

<span className="company-tag">
DTCP APPROVED OPEN PLOTS
</span>

<h1>
R DREAM INFRA DEVELOPERS
</h1>

<p>
Premium Residential Ventures •
Clear Title • Ready For Registration
</p>

<div className="gold-divider"></div>

<h2>
PAYMENT RECEIPT
</h2>

<div className="gold-divider"></div>

<div className="receipt-badges">

<span>✔ Secure</span>

<span>✔ Verified</span>

<span>✔ Computer Generated</span>

</div>

</div>

<div className="right-ribbon">

<Building2
size={55}
strokeWidth={1.8}
/>

</div>

</div>

{/* ================= RECEIPT INFO ================= */}

<div className="receipt-top">

<div className="detail-box">

<Hash size={22}/>

<div>

<small>Receipt Number</small>

<h3>

RD-
{String(payment?.id || 1).padStart(6,"0")}

</h3>

</div>

</div>

<div className="detail-box">

<Calendar size={22}/>

<div>

<small>Payment Date</small>

<h3>

{
payment?.payment_date ??
new Date().toLocaleDateString()
}

</h3>

</div>

</div>

</div>

{/* ================= CUSTOMER + PLOT ================= */}

<div className="info-grid">

<div className="info-card">

<h3>

<User size={20}/>

Customer Information

</h3>

<div className="info-row">

<span>Name</span>

<strong>

{customer?.name}

</strong>

</div>

<div className="info-row">

<span>

<Phone size={15}/>

Phone

</span>

<strong>

{customer?.phone}

</strong>

</div>

<div className="info-row">

<span>

Address

</span>

<strong>

{customer?.address}

</strong>

</div>

<div className="info-row">

<span>

Booking Date

</span>

<strong>

{customer?.booking_date || "-"}

</strong>

</div>

<div className="status-badge">

<CheckCircle size={16}/>

{customer?.status || "ACTIVE"}

</div>

</div>

<div className="info-card">

<h3>

<MapPin size={20}/>

Plot Information

</h3>

<div className="info-row">

<span>Plot No</span>

<strong>

{customer?.plot_number}

</strong>

</div>

<div className="info-row">

<span>Plot Size</span>

<strong>

{customer?.plot_size} Sq.Yds

</strong>

</div>

<div className="info-row">

<span>Facing</span>

<strong>

{customer?.facing}

</strong>

</div>

<div className="info-row">

<span>Road Width</span>

<strong>

{customer?.road_width}

</strong>

</div>

<div className="info-row">

<span>Project</span>

<strong>

Konyapalem Venture

</strong>

</div>

</div>

</div>
{/* ================= PAYMENT SUMMARY ================= */}

<div className="payment-section">

  <h3>
    <ReceiptText size={20} />
    Payment Summary
  </h3>

  <table className="payment-table">

    <thead>
      <tr>
        <th>Description</th>
        <th>Details</th>
      </tr>
    </thead>

    <tbody>

      <tr>
        <td>Total Plot Amount</td>
        <td>₹ {totalAmount.toLocaleString()}</td>
      </tr>

      <tr>
        <td>Total Amount Paid</td>
        <td className="paid">
          ₹ {paidAmount.toLocaleString()}
        </td>
      </tr>

      <tr>
        <td>Current Payment</td>
        <td>
          ₹ {Number(payment?.amount || 0).toLocaleString()}
        </td>
      </tr>

      <tr>
        <td>Balance Amount</td>
        <td className="balance">
          ₹ {balance.toLocaleString()}
        </td>
      </tr>

      <tr>
        <td>Payment Method</td>
        <td>{payment?.payment_method || "Cash"}</td>
      </tr>

      <tr>
        <td>Transaction ID</td>
        <td>{payment?.transaction_id || "-"}</td>
      </tr>

      <tr>
        <td>Payment Date</td>
        <td>{payment?.payment_date || "-"}</td>
      </tr>

      <tr>
        <td>Remarks</td>
        <td>{payment?.remarks || "-"}</td>
      </tr>

    </tbody>

  </table>

</div>

{/* ================= PAYMENT PROGRESS ================= */}

<div className="progress-card">

  <div className="progress-top">

    <span>Payment Progress</span>

    <strong>{progress}%</strong>

  </div>

  <div className="progress-bar">

    <div
      className="progress-fill"
      style={{
        width: `${progress}%`,
      }}
    ></div>

  </div>

</div>

{/* ================= AMOUNT CARDS ================= */}

<div className="amount-grid">

  <div className="amount-card total">

    <Landmark size={28} />

    <h4>Total Amount</h4>

    <h2>

      ₹ {totalAmount.toLocaleString()}

    </h2>

  </div>

  <div className="amount-card paid">

    <BadgeIndianRupee size={28} />

    <h4>Amount Paid</h4>

    <h2>

      ₹ {paidAmount.toLocaleString()}

    </h2>

  </div>

  <div className="amount-card balance">

    <Hash size={28} />

    <h4>Balance</h4>

    <h2>

      ₹ {balance.toLocaleString()}

    </h2>

  </div>

</div>

{/* ================= DECLARATION ================= */}

<div className="declaration">

  <h3>Declaration</h3>

  <p>

    This is to certify that the above payment has been
    received by <strong>R DREAM INFRA DEVELOPERS</strong>
    towards the purchase of the above-mentioned plot.

  </p>

  <p>

    This receipt is generated electronically and is valid
    without a physical signature unless otherwise required
    by the company.

  </p>

</div>

{/* ================= THANK YOU ================= */}

<div className="thank-message">

  <h2>Thank You For Your Trust</h2>

  <p>

    We sincerely appreciate your investment in
    <strong> R DREAM INFRA DEVELOPERS</strong>.

  </p>

</div>
{/* ================= BOTTOM SECTION ================= */}

<div className="bottom-section">

  {/* QR */}

  <div className="qr-box">

    <img
      src={qr}
      alt="QR Code"
    />

    <h4>Scan QR</h4>

    <p>
      View Project Information
    </p>

  </div>

  {/* THANK YOU */}

  <div className="thank-box">

    <h2>THANK YOU!</h2>

    <p>

      Thank you for choosing

      <br />

      <strong>
        R DREAM INFRA DEVELOPERS
      </strong>

    </p>

    <span>
      We appreciate your trust.
    </span>

  </div>

  {/* COMPANY STAMP */}

  <div className="stamp-box">

    <img
      src={stamp}
      alt="Company Stamp"
    />

    <h4>Company Seal</h4>

  </div>

  {/* SIGNATURE */}

  <div className="signature-box">

    <img
      src={signature}
      alt="Signature"
    />

    <h4>Authorized Signatory</h4>

  </div>

</div>

{/* ================= FOOTER ================= */}

<div className="receipt-footer">

  <div className="footer-left">

    <h3>
      R DREAM INFRA DEVELOPERS
    </h3>

    <p>

      Premium DTCP Approved Residential Layout

    </p>

    <p>

      Konyapalem Venture

    </p>

    <p>

      Chandarlapadu Mandal

    </p>

    <p>

      NTR District

    </p>

  </div>

  <div className="footer-right">

    <p>

      📞 +91 XXXXX XXXXX

    </p>

    <p>

      ✉ info@rdreaminfra.com

    </p>

    <p>

      🌐 www.rdreaminfra.com

    </p>

    <p>

      © {new Date().getFullYear()} R DREAM INFRA DEVELOPERS

    </p>

  </div>

</div>

{/* ================= END ================= */}

</div>

</div>

);
}