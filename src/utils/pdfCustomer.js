// src/utils/pdfCustomer.js

import { COLORS } from "./pdfStyles";
import {
  drawCard,
  drawSectionTitle,
  drawLabel,
  drawValue,
  formatDate,
} from "./pdfHelpers";

export const drawCustomer = (doc, customer) => {
  // ===========================
  // CUSTOMER CARD
  // ===========================
  drawCard(doc, 10, 76, 92, 58, COLORS.light);

  drawSectionTitle(doc, "CUSTOMER INFORMATION", 15, 84);

  let y = 94;

  drawLabel(doc, "Customer Name", 15, y);
  drawValue(doc, customer?.name || "-", 55, y);

  y += 8;

  drawLabel(doc, "Mobile Number", 15, y);
  drawValue(doc, customer?.phone || "-", 55, y);

  y += 8;

  drawLabel(doc, "Email", 15, y);
  drawValue(doc, customer?.email || "-", 55, y);

  y += 8;

  drawLabel(doc, "Booking Date", 15, y);
  drawValue(doc, formatDate(customer?.booking_date), 55, y);

  y += 8;

  drawLabel(doc, "Status", 15, y);

  const status = customer?.status || "Booked";

  doc.setTextColor(...COLORS.success);
  drawValue(doc, status, 55, y);

  doc.setTextColor(...COLORS.black);

  // ===========================
  // PLOT CARD
  // ===========================
  drawCard(doc, 108, 76, 92, 58, COLORS.lightBlue);

  drawSectionTitle(doc, "PLOT INFORMATION", 113, 84);

  y = 94;

  drawLabel(doc, "Plot Number", 113, y);
  drawValue(doc, customer?.plot_no || "-", 155, y);

  y += 8;

  drawLabel(doc, "Plot Size", 113, y);
  drawValue(doc, `${customer?.plot_size || "-"} Sq.Yds`, 155, y);

  y += 8;

  drawLabel(doc, "Facing", 113, y);
  drawValue(doc, customer?.facing || "-", 155, y);

  y += 8;

  drawLabel(doc, "Road Width", 113, y);
  drawValue(doc, customer?.road_width || "-", 155, y);

  y += 8;

  drawLabel(doc, "Total Amount", 113, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.navy);

  const amount = Number(customer?.total_amount || 0).toLocaleString(
    "en-IN"
  );

  doc.text(`₹ ${amount}`, 155, y);

  doc.setTextColor(...COLORS.black);

  // ===========================
  // DECORATIVE LINE
  // ===========================
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(10, 140, 200, 140);
};