import { jsPDF } from "jspdf";

import { drawHeader } from "./pdfHeader";
import { drawCustomer } from "./pdfCustomer";
import { drawPayment } from "./pdfPayment";
import { drawFooter } from "./pdfFooter";

export const printReceipt = async (customer, payment) => {
  try {
    const doc = new jsPDF("p", "mm", "a4");

    // Header
    drawHeader(doc);

    // Customer & Plot Information
    drawCustomer(doc, customer);

    // Payment Table
    const finalY = drawPayment(doc, customer, payment);

    // Footer
    drawFooter(doc, finalY);

    // Save PDF
    const filename = `Receipt_${customer?.plot_no || "Customer"}_${
      customer?.name || "Receipt"
    }.pdf`;

    doc.save(filename);

  } catch (error) {
    console.error("Receipt generation failed:", error);
    alert("Failed to generate receipt. Check the browser console for details.");
  }
};