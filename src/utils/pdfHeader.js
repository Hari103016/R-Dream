// src/utils/pdfHeader.js

import logo from "../assets/logo.png";

import { COLORS, COMPANY } from "./pdfStyles";
import { generateReceiptNo, formatDate } from "./pdfHelpers";

/**
 * Draw Premium Receipt Header
 */
export const drawHeader = (doc) => {
  // ===============================
  // OUTER BORDER
  // ===============================
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.8);
  doc.rect(6, 6, 198, 285);

  // ===============================
  // HEADER BACKGROUND
  // ===============================
  doc.setFillColor(...COLORS.navy);
  doc.rect(6, 6, 198, 42, "F");

  // ===============================
  // LOGO
  // ===============================
  try {
    doc.addImage(logo, "PNG", 12, 10, 24, 24);
  } catch (err) {
    console.warn("Logo not loaded", err);
  }

  // ===============================
  // COMPANY NAME
  // ===============================
  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text(COMPANY.name, 42, 18);

  // ===============================
  // PROJECT NAME
  // ===============================
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(COMPANY.project, 42, 25);

  // ===============================
  // ADDRESS
  // ===============================
  doc.setFontSize(8);
  doc.text(COMPANY.address, 42, 31);

  // ===============================
  // GOLD DIVIDER
  // ===============================
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.8);
  doc.line(42, 34, 150, 34);

  // ===============================
  // CONTACT DETAILS
  // ===============================
  doc.setFontSize(7.5);
  doc.text(`Phone : ${COMPANY.phone}`, 42, 39);
  doc.text(`Email : ${COMPANY.email}`, 90, 39);

  // ===============================
  // RECEIPT BOX
  // ===============================
  doc.setFillColor(...COLORS.gold);
  doc.roundedRect(156, 10, 40, 28, 2, 2, "F");

  doc.setTextColor(...COLORS.navy);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("PAYMENT", 176, 18, {
    align: "center",
  });

  doc.text("RECEIPT", 176, 25, {
    align: "center",
  });

  // ===============================
  // RECEIPT NUMBER
  // ===============================
  const receiptNo = generateReceiptNo();

  doc.setTextColor(255, 255, 255);

  doc.setFillColor(35, 35, 35);
  doc.roundedRect(150, 51, 50, 16, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  doc.text("Receipt No.", 154, 57);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.text(receiptNo, 154, 63);

  // ===============================
  // DATE BOX
  // ===============================
  doc.setFillColor(...COLORS.lightBlue);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(10, 51, 42, 16, 2, 2, "FD");

  doc.setTextColor(...COLORS.navy);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  doc.text("Receipt Date", 14, 57);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.text(formatDate(new Date()), 14, 63);

  // ===============================
  // WATERMARK
  // ===============================
  try {
    doc.setGState(new doc.GState({ opacity: 0.05 }));

    doc.addImage(
      logo,
      "PNG",
      55,
      95,
      100,
      100
    );

    doc.setGState(new doc.GState({ opacity: 1 }));
  } catch (err) {
    console.warn("Watermark skipped");
  }

  // ===============================
  // GOLD DIVIDER
  // ===============================
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(10, 70, 200, 70);
};