// src/utils/pdfHelpers.js

import { COLORS } from "./pdfStyles";

/**
 * Generate Receipt Number
 * Example: RD-20260726-4831
 */
export const generateReceiptNo = () => {
  const today = new Date();

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `RD-${yyyy}${mm}${dd}-${random}`;
};

/**
 * Format Date
 * Example:
 * 26 Jul 2026
 */
export const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format Currency
 * Example:
 * ₹ 4,50,000
 */
export const formatCurrency = (amount) => {
  const value = Number(amount || 0);

  return `₹ ${value.toLocaleString("en-IN")}`;
};

/**
 * Payment Percentage
 */
export const getPaidPercentage = (total, paid) => {
  total = Number(total || 0);
  paid = Number(paid || 0);

  if (total === 0) return 0;

  return Math.min(Math.round((paid / total) * 100), 100);
};

/**
 * Balance
 */
export const getBalance = (total, paid) => {
  total = Number(total || 0);
  paid = Number(paid || 0);

  return Math.max(total - paid, 0);
};

/**
 * Payment Status
 */
export const getPaymentStatus = (total, paid) => {
  const balance = getBalance(total, paid);

  if (paid === 0)
    return {
      text: "Pending",
      color: COLORS.danger,
    };

  if (balance === 0)
    return {
      text: "Paid",
      color: COLORS.success,
    };

  return {
    text: "Partially Paid",
    color: COLORS.warning,
  };
};

/**
 * Booking Status
 */
export const getBookingStatus = (status) => {
  if (!status)
    return {
      text: "Available",
      color: COLORS.success,
    };

  switch (status.toLowerCase()) {
    case "sold":
      return {
        text: "Sold",
        color: COLORS.danger,
      };

    case "booked":
      return {
        text: "Booked",
        color: COLORS.warning,
      };

    case "reserved":
      return {
        text: "Reserved",
        color: COLORS.warning,
      };

    default:
      return {
        text: status,
        color: COLORS.success,
      };
  }
};

/**
 * Draw Rounded Rectangle
 */
export const drawCard = (
  doc,
  x,
  y,
  width,
  height,
  fillColor = COLORS.white
) => {
  doc.setFillColor(...fillColor);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(x, y, width, height, 3, 3, "FD");
};

/**
 * Section Title
 */
export const drawSectionTitle = (doc, title, x, y) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.setTextColor(...COLORS.navy);
  doc.text(title, x, y);

  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);

  doc.line(x, y + 2, x + 45, y + 2);
};

/**
 * Label
 */
export const drawLabel = (doc, label, x, y) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.darkGray);

  doc.text(label, x, y);
};

/**
 * Value
 */
export const drawValue = (doc, value, x, y) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.black);

  doc.text(String(value ?? "-"), x, y);
};

/**
 * Draw Divider
 */
export const drawDivider = (doc, y) => {
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(10, y, 200, y);
};

/**
 * Draw Status Badge
 */
export const drawBadge = (doc, text, x, y, color) => {
  doc.setFillColor(...color);
  doc.roundedRect(x, y - 5, 30, 8, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  doc.text(text, x + 15, y, {
    align: "center",
  });

  doc.setTextColor(...COLORS.black);
};