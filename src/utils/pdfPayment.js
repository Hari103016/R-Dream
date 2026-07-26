import autoTable from "jspdf-autotable";
import { COLORS } from "./pdfStyles";
import { formatCurrency, formatDate } from "./pdfHelpers";

export const drawPayment = (doc, customer, payment) => {
  // ===========================
  // PAYMENT SUMMARY TITLE
  // ===========================

  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(10, 145, 190, 12, 3, 3, "F");

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255);

  doc.text("PAYMENT SUMMARY", 105, 153, {
    align: "center",
  });

  // ===========================
  // TABLE
  // ===========================

  autoTable(doc, {
    startY: 157,

    margin: {
      left: 10,
      right: 10,
    },

    head: [["DESCRIPTION", "AMOUNT / DETAILS"]],

    body: [
      [
        "💰 Total Amount",
        formatCurrency(customer?.total_amount),
      ],

      [
        "✅ Amount Paid",
        formatCurrency(customer?.amount_paid),
      ],

      [
        "⚖ Balance",
        formatCurrency(customer?.balance),
      ],

      [
        "💵 Latest Payment",
        payment
          ? formatCurrency(payment.amount)
          : "-",
      ],

      [
        "💳 Payment Mode",
        payment?.payment_mode || "-",
      ],

      [
        "📅 Payment Date",
        formatDate(payment?.payment_date),
      ],

      [
        "📝 Remarks",
        payment?.remarks || "-",
      ],
    ],

    theme: "grid",

    headStyles: {
      fillColor: COLORS.navy,
      textColor: 255,
      halign: "center",
      fontStyle: "bold",
      fontSize: 11,
    },

    bodyStyles: {
      fontSize: 10,
      cellPadding: 4,
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },

    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },

    columnStyles: {
      0: {
        cellWidth: 85,
        fontStyle: "bold",
      },

      1: {
        cellWidth: 95,
      },
    },
  });

  return doc.lastAutoTable.finalY;
};