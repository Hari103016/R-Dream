import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Receipt.css";
import {
  downloadReceipt,
  shareReceipt,
} from "../utils/downloadReceipt";

/* =========================================================
   HELPERS
========================================================= */

const valueOrDash = (value) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "-";
  }

  return value;
};

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* =========================================================
   NUMBER TO WORDS
========================================================= */

const numberToWords = (number) => {
  const num = Math.floor(Number(number || 0));

  if (num === 0) {
    return "Rupees Zero Only";
  }

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const twoDigit = (n) => {
    if (n < 20) return ones[n];

    return (
      tens[Math.floor(n / 10)] +
      (n % 10 ? ` ${ones[n % 10]}` : "")
    );
  };

  const threeDigit = (n) => {
    if (n < 100) return twoDigit(n);

    return (
      `${ones[Math.floor(n / 100)]} Hundred` +
      (n % 100 ? ` ${twoDigit(n % 100)}` : "")
    );
  };

  let n = num;
  const parts = [];

  const crore = Math.floor(n / 10000000);
  n %= 10000000;

  const lakh = Math.floor(n / 100000);
  n %= 100000;

  const thousand = Math.floor(n / 1000);
  n %= 1000;

  if (crore) {
    parts.push(`${threeDigit(crore)} Crore`);
  }

  if (lakh) {
    parts.push(`${twoDigit(lakh)} Lakh`);
  }

  if (thousand) {
    parts.push(`${twoDigit(thousand)} Thousand`);
  }

  if (n) {
    parts.push(threeDigit(n));
  }

  return `Rupees ${parts.join(" ")} Only`;
};

/* =========================================================
   MAIN RECEIPT
========================================================= */

export default function Receipt() {
  const { state } = useLocation();

  const receiptRef = useRef(null);

  const customer = state?.customer;

  const payments = Array.isArray(state?.payments)
    ? state.payments
    : [];

  const plot = state?.plot || {};

  /* -------------------------------------------------------
     NO CUSTOMER
  ------------------------------------------------------- */

  if (!customer) {
    return (
      <div className="receipt-empty">
        <div className="receipt-empty-card">
          <h2>No Receipt Found</h2>

          <p>
            Customer/payment information was not
            provided.
          </p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     PAYMENT CALCULATIONS
  ------------------------------------------------------- */

  const paidAmount = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  const totalAmount = Number(
    customer.total_amount ??
      customer.totalAmount ??
      plot.total_amount ??
      plot.price ??
      0
  );

  const balanceAmount = Math.max(
    0,
    Number(
      customer.balance ??
        customer.balance_amount ??
        totalAmount - paidAmount
    )
  );

  /* -------------------------------------------------------
     RECEIPT INFORMATION
  ------------------------------------------------------- */

  const receiptNo =
    customer.receipt_no ||
    customer.receipt_number ||
    `RD-${String(customer.id || "").padStart(
      6,
      "0"
    )}`;

  const customerId =
    customer.customer_code ||
    customer.customer_id ||
    `CUS-${String(customer.id || "").padStart(
      3,
      "0"
    )}`;

  const plotNo = valueOrDash(
    customer.plot_no ??
      customer.plot_number ??
      plot.plot_no ??
      plot.plot_number
  );

  const phase = valueOrDash(
    customer.phase ??
      plot.phase ??
      customer.facing ??
      plot.facing
  );

  const rawPlotSize = valueOrDash(
    customer.plot_size ??
      customer.size ??
      plot.plot_size ??
      plot.size
  );

  const plotSize =
    rawPlotSize === "-"
      ? "-"
      : /sq\.?\s*yd/i.test(String(rawPlotSize))
      ? rawPlotSize
      : `${rawPlotSize} Sq.Yds`;

  const latestPayment =
    payments.length > 0
      ? payments[payments.length - 1]
      : null;

  const paymentMode = valueOrDash(
    latestPayment?.payment_mode ??
      latestPayment?.mode ??
      customer.payment_mode
  );

  const transactionId = valueOrDash(
    latestPayment?.transaction_id ??
      latestPayment?.transactionId ??
      latestPayment?.txn_id ??
      latestPayment?.reference_no
  );

  const transactionDate = formatDate(
    latestPayment?.payment_date ??
      latestPayment?.date ??
      customer.payment_date ??
      customer.booking_date ??
      new Date()
  );

  const receiptDate = formatDate(
    latestPayment?.payment_date ??
      latestPayment?.date ??
      customer.payment_date ??
      customer.booking_date ??
      new Date()
  );

  /* -------------------------------------------------------
     DOWNLOAD PDF
  ------------------------------------------------------- */

  const handleDownload = async () => {
    try {
      await downloadReceipt(
        receiptRef,
        `Payment_Receipt_${receiptNo}.pdf`
      );
    } catch (error) {
      console.error(
        "Receipt download error:",
        error
      );

      alert(
        "Unable to download receipt. Please try again."
      );
    }
  };

  /* -------------------------------------------------------
     WHATSAPP
  ------------------------------------------------------- */

  const handleWhatsApp = async () => {
    try {
      const mobile =
        customer.mobile ||
        customer.phone ||
        customer.phone_number;

      if (!mobile) {
        alert(
          "Customer mobile number is not available."
        );

        return;
      }

      await shareReceipt(
        receiptRef,
        mobile,
        customer.name || "Customer",
        `Payment_Receipt_${receiptNo}.pdf`
      );
    } catch (error) {
      console.error(
        "WhatsApp receipt error:",
        error
      );

      alert(
        "Unable to send receipt through WhatsApp."
      );
    }
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <main className="receipt-page">

      {/* =====================================================
          ACTION BUTTONS
      ===================================================== */}

      <div className="receipt-actions">

        <button
          type="button"
          className="download-btn"
          onClick={handleDownload}
        >
          📄 Download PDF
        </button>

        <button
          type="button"
          className="whatsapp-btn"
          onClick={handleWhatsApp}
        >
          💬 Send Receipt via WhatsApp
        </button>

      </div>

      {/* =====================================================
          RECEIPT
      ===================================================== */}

      <article
        className="receipt-paper"
        ref={receiptRef}
      >

        {/* ===================================================
            HEADER
        =================================================== */}
        <header className="receipt-header">

          {/* LEFT BLACK PANEL */}
          <div className="reference-side reference-side-left">

            <div className="reference-quote">“</div>

            <div className="reference-slogan">
              INVEST
              <br />
              IN A
              <br />
              BRIGHTER
              <br />
              <span>TOMORROW</span>
            </div>

            <div className="reference-line" />

            <div className="reference-features">
              <div className="reference-feature">
                <span className="reference-feature-circle">⌂</span>
                <span>
                  PREMIUM
                  <br />
                  PLOTS
                </span>
              </div>

              <div className="reference-feature-divider" />

              <div className="reference-feature">
                <span className="reference-feature-circle">A</span>
                <span>
                  NH-65
                  <br />
                  ACCESS
                </span>
              </div>
            </div>

          </div>

          {/* CENTER LOGO */}
          <div className="reference-center">

            <img
              src={logo}
              alt="R Dream Infra Developers"
              className="receipt-logo"
            />

            <div className="logo-tagline">
              <span />
              Your Dream Our Priority
              <span />
            </div>

          </div>

          {/* RIGHT BLACK PANEL */}
          <div className="reference-side reference-side-right">

            <div className="reference-quote">”</div>

            <div className="reference-slogan">
              BUILD TODAY
              <br />
              A BETTER
              <br />
              <span>TOMORROW</span>
            </div>

            <div className="reference-line reference-line-right" />

            <div className="reference-features reference-features-right">

              <div className="reference-feature">
                <span className="reference-feature-circle">A</span>
                <span>
                  24 FT
                  <br />
                  ROADS
                </span>
              </div>

              <div className="reference-feature-divider" />

              <div className="reference-feature">
                <span className="reference-feature-circle">✓</span>
                <span>
                  CLEAR
                  <br />
                  TITLES
                </span>
              </div>

            </div>

          </div>

        </header>

        {/* ===================================================
            PAYMENT RECEIPT TITLE
        =================================================== */}

        <div className="title-wrap">

          <div className="main-title">

            <span className="title-chevron">
              ‹
            </span>

            <span>
              PAYMENT RECEIPT
            </span>

            <span className="title-chevron">
              ›
            </span>

          </div>

          <div className="title-subline">
            THANK YOU FOR YOUR TRUST
          </div>

        </div>

        {/* ===================================================
            RECEIPT / PLOT INFORMATION
        =================================================== */}

        <section className="meta-grid">

          <div className="meta-column">

            <MetaRow
              label="Receipt No"
              value={receiptNo}
            />

            <MetaRow
              label="Date"
              value={receiptDate}
            />

            <MetaRow
              label="Customer ID"
              value={customerId}
            />

          </div>

          <div className="meta-column">

            <MetaRow
              label="Plot No"
              value={plotNo}
              accent
            />

            <MetaRow
              label="Phase"
              value={phase}
              accent
            />

            <MetaRow
              label="Plot Size"
              value={plotSize}
              accent
            />

          </div>

        </section>

        {/* ===================================================
            CUSTOMER DETAILS
        =================================================== */}

        <ReceiptSection title="Customer Details">

          <DetailRow
            label="Customer Name"
            value={customer.name}
          />

          <DetailRow
            label="Phone Number"
            value={
              customer.mobile ||
              customer.phone ||
              customer.phone_number
            }
          />

        </ReceiptSection>

        {/* ===================================================
            PAYMENT DETAILS
        =================================================== */}

        <ReceiptSection title="Payment Details">

          <div className="payment-table-container">

            <table className="payment-table">

              <colgroup>

                <col className="col-sno" />

                <col className="col-particulars" />

                <col className="col-amount" />

              </colgroup>

              <thead>

                <tr>

                  <th>
                    S.No
                  </th>

                  <th>
                    Particulars
                  </th>

                  <th>
                    Amount (₹)
                  </th>

                </tr>

              </thead>

              <tbody>

                {payments.length === 0 ? (

                  <tr>

                    <td
                      colSpan="3"
                      className="no-payment"
                    >
                      No Payment Records Found
                    </td>

                  </tr>

                ) : (

                  payments.map(
                    (payment, index) => (

                      <tr
                        key={
                          payment.id ||
                          index
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {valueOrDash(
                            payment.particulars ||
                              payment.remarks ||
                              payment.description ||
                              (
                                index === 0
                                  ? "Booking Advance"
                                  : "Payment"
                              )
                          )}
                        </td>

                        <td className="amount-value">

                          {formatMoney(
                            payment.amount
                          )}

                        </td>

                      </tr>

                    )
                  )

                )}

                <tr className="total-row">

                  <td colSpan="2">
                    Total Paid
                  </td>

                  <td>
                    {formatMoney(
                      paidAmount
                    )}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </ReceiptSection>

        {/* ===================================================
            AMOUNT IN WORDS
        =================================================== */}

        <ReceiptSection
          title="Amount (in Words)"
          compact
        >

          <div className="words-value">

            {numberToWords(
              paidAmount
            )}

          </div>

        </ReceiptSection>

        {/* ===================================================
            PAYMENT MODE
        =================================================== */}

        <ReceiptSection title="Payment Mode">

          <DetailRow
            label="Mode"
            value={paymentMode}
          />

          <DetailRow
            label="Transaction ID"
            value={transactionId}
          />

          <DetailRow
            label="Transaction Date"
            value={transactionDate}
          />

        </ReceiptSection>

        {/* ===================================================
            DECLARATION
        =================================================== */}

        <section className="declaration">

          <strong>
            DECLARATION
          </strong>

          <p>

            This receipt certifies that
            the payment has been successfully
            received by{" "}

            <b>
              R DREAM INFRA DEVELOPERS
            </b>

            {" "}towards the above-mentioned plot.

          </p>

        </section>

        {/* ===================================================
            SIGNATURE / THANK YOU
        =================================================== */}

        <section className="signature-area">

          <div className="thank-you">

            <div className="thank-you-script">
              Thank You!
            </div>

            <div className="thank-you-sub">
              for being a part of R Dream
            </div>

          </div>

          <div className="authorized">

            <div className="signature-script">
              Authorized
            </div>

            <div className="signature-line" />

            <div className="authorized-title">
              Authorized Signatory
            </div>

            <div className="authorized-company">
              R Dream
            </div>

          </div>

        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="receipt-footer">

          <div className="footer-left">

            <span>
              ◉ www.rdream.in
            </span>

            <i>|</i>

            <span>
              ✉ info@rdream.in
            </span>

            <i>|</i>

            <span>
              ☎ +91 98765 43210
            </span>

          </div>

          <div className="footer-right">

            <b>
              /
            </b>

            <span>
              Build Today
              <br />
              A Better Tomorrow
            </span>

          </div>

        </footer>

        <div className="receipt-bottom-border" />

      </article>

    </main>
  );
}

/* =========================================================
   META ROW
========================================================= */

function MetaRow({
  label,
  value,
  accent = false,
}) {
  return (
    <div
      className={`meta-row ${
        accent ? "accent" : ""
      }`}
    >

      <span className="row-label">
        {label}
      </span>

      <b className="row-colon">
        :
      </b>

      <span className="row-value">
        {valueOrDash(value)}
      </span>

    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="detail-row">

      <span className="row-label">
        {label}
      </span>

      <b className="row-colon">
        :
      </b>

      <span className="row-value">
        {valueOrDash(value)}
      </span>

    </div>
  );
}

/* =========================================================
   SECTION
========================================================= */

function ReceiptSection({
  title,
  children,
  compact = false,
}) {
  return (
    <section
      className={`receipt-section ${
        compact
          ? "compact-section"
          : ""
      }`}
    >

      <div className="section-title">
        {title}
      </div>

      {children}

    </section>
  );
}
