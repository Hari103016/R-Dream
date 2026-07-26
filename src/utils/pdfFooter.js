// src/utils/pdfFooter.js

import qr from "../assets/qr.png";
import stamp from "../assets/stamp.png";
import signature from "../assets/signature.png";

import { COLORS, COMPANY } from "./pdfStyles";

export const drawFooter = (doc, startY) => {
  let y = startY;

  // ===========================================
  // DECLARATION
  // ===========================================

  doc.setFillColor(...COLORS.cream);
  doc.setDrawColor(...COLORS.gold);

  doc.roundedRect(10, y, 190, 24, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);

  doc.text("Declaration", 15, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.black);

  const declaration =
    "This is a computer generated receipt issued by R DREAM INFRA DEVELOPERS. The amount received has been credited towards the customer's plot booking/payment. Please retain this receipt for future reference.";

  const lines = doc.splitTextToSize(declaration, 178);

  doc.text(lines, 15, y + 13);

  y += 35;

  // ===========================================
  // QR CODE
  // ===========================================

  try {
    doc.addImage(qr, "PNG", 15, y, 28, 28);
  } catch (e) {
    console.warn("QR image not found.");
  }

  doc.setFontSize(8);
  doc.text("Scan for Details", 14, y + 33);

  // ===========================================
  // COMPANY STAMP
  // ===========================================

  try {
    doc.addImage(stamp, "PNG", 82, y - 2, 34, 34);
  } catch (e) {
    console.warn("Stamp image not found.");
  }

  doc.setFontSize(8);
  doc.text("Company Stamp", 84, y + 33);

  // ===========================================
  // SIGNATURE
  // ===========================================

  try {
    doc.addImage(signature, "PNG", 148, y + 2, 34, 18);
  } catch (e) {
    console.warn("Signature image not found.");
  }

  doc.setDrawColor(...COLORS.black);
  doc.line(145, y + 24, 190, y + 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  doc.text("Authorized Signature", 150, y + 30);

  y += 42;

  // ===========================================
  // FOOTER
  // ===========================================

  doc.setFillColor(...COLORS.navy);
  doc.rect(6, 276, 198, 15, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text(COMPANY.name, 10, 282);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  doc.text(
    `Phone: ${COMPANY.phone}   |   Email: ${COMPANY.email}   |   Website: ${COMPANY.website}`,
    10,
    287
  );

  doc.text("Computer Generated Receipt", 195, 287, {
    align: "right",
  });

  doc.setTextColor(...COLORS.black);
};