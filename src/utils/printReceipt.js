// src/utils/printReceipt.js

import { jsPDF } from "jspdf";

import { drawHeader } from "./pdfHeader";
import { drawCustomer } from "./pdfCustomer";
import { drawPayment } from "./pdfPayment";
import { drawFooter } from "./pdfFooter";

export const printReceipt = async (customer, payment) => {
  try {
    // =====================================
    // CREATE PDF
    // =====================================
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // =====================================
    // HEADER
    // =====================================
    drawHeader(doc);

    // =====================================
    // CUSTOMER & PLOT DETAILS
    // =====================================
    drawCustomer(doc, customer);

    // =====================================
    // PAYMENT DETAILS
    // =====================================
    const footerStartY = drawPayment(doc, customer, payment);

    // =====================================
    // FOOTER
    // =====================================
    drawFooter(doc, footerStartY);

    // =====================================
    // PDF PROPERTIES
    // =====================================
    doc.setProperties({
      title: "Payment Receipt",
      subject: "R DREAM INFRA DEVELOPERS",
      author: "R DREAM INFRA DEVELOPERS",
      creator: "R DREAM INFRA DEVELOPERS",
      keywords: "Receipt, Plot, Payment",
    });

    // =====================================
    // FILE NAME
    // =====================================
    const plotNo = customer?.plot_no || "Plot";
    const customerName = (customer?.name || "Customer")
      .replace(/\s+/g, "_")
      .replace(/[^\w-]/g, "");

    const receiptNo = `Receipt_${plotNo}_${customerName}.pdf`;

    // =====================================
    // SAVE PDF
    // =====================================
    doc.save(receiptNo);
  } catch (error) {
    console.error("Receipt Generation Error:", error);
  }
};