// src/utils/pdfPayment.js

import autoTable from "jspdf-autotable";

import { COLORS } from "./pdfStyles";
import {
  drawSectionTitle,
  formatCurrency,
  formatDate,
  getBalance,
} from "./pdfHelpers";

export const drawPayment = (doc, customer, payment) => {
  // ===============================
  // PAYMENT TITLE
  // ===============================
  drawSectionTitle(doc, "PAYMENT SUMMARY", 10, 150);

  // ===============================
  // TABLE DATA
  // ===============================
  const totalAmount = Number(customer?.total_amount || 0);
  const amountPaid = Number(customer?.amount_paid || 0);
  const balance = getBalance(totalAmount, amountPaid);

  const body = [
    [
      "Total Plot Amount",
      formatCurrency(totalAmount),
    ],
    [
      "Amount Paid",
      formatCurrency(amountPaid),
    ],
    [
      "Current Payment",
      formatCurrency(payment?.amount || 0),
    ],
    [
      "Balance Amount",
      formatCurrency(balance),
    ],
    [
      "Payment Mode",
      payment?.payment_mode || "-",
    ],
    [
      "Payment Date",
      formatDate(payment?.payment_date),
    ],
    [
      "Transaction ID",
      payment?.transaction_id || "-",
    ],
    [
      "Remarks",
      payment?.remarks || "-",
    ],
  ];

  autoTable(doc, {
    startY: 156,

    head: [["Description", "Details"]],

    body,

    theme: "grid",

    headStyles: {
      fillColor: COLORS.navy,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
    },

    bodyStyles: {
      fontSize: 10,
      textColor: COLORS.black,
      valign: "middle",
    },

    alternateRowStyles: {
      fillColor: COLORS.light,
    },

    styles: {
      lineColor: COLORS.border,
      lineWidth: 0.2,
      cellPadding: 4,
    },

    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 70,
      },

      1: {
        halign: "right",
        cellWidth: 110,
      },
    },

    didParseCell(data) {
      if (
        data.section === "body" &&
        data.row.index === 3 // Balance row
      ) {
        data.cell.styles.fillColor = COLORS.cream;
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = COLORS.danger;
      }

      if (
        data.section === "body" &&
        (data.row.index === 0 ||
          data.row.index === 1)
      ) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // ===============================
  // SUMMARY BOX
  // ===============================
  const finalY = doc.lastAutoTable.finalY + 8;

  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(120, finalY, 80, 28, 2, 2, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text("TOTAL BALANCE", 160, finalY + 8, {
    align: "center",
  });

  doc.setFontSize(15);

  doc.text(
    formatCurrency(balance),
    160,
    finalY + 20,
    {
      align: "center",
    }
  );

  // Reset text colour
  doc.setTextColor(...COLORS.black);

  return finalY + 35;
};