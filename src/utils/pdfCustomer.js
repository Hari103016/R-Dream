import { COLORS } from "./pdfStyles";
import { formatDate } from "./pdfHelpers";

export const drawCustomer = (doc, customer) => {
  // ===========================
  // CUSTOMER CARD
  // ===========================

  doc.setDrawColor(...COLORS.gold);
  doc.setFillColor(255, 255, 255);

  doc.roundedRect(10, 72, 90, 65, 3, 3, "FD");

  // Header
  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(10, 72, 90, 12, 3, 3, "F");

  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text("CUSTOMER INFORMATION", 15, 80);

  // Body
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  let y = 92;

  const customerData = [
    ["Customer Name", customer?.name],
    ["Mobile Number", customer?.mobile],
    ["Booking Date", formatDate(customer?.booking_date)],
    ["Status", customer?.status],
  ];

  customerData.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 15, y);

    doc.setFont("helvetica", "normal");
    doc.text(`: ${value || "-"}`, 55, y);

    y += 10;
  });

  // ===========================
  // PLOT CARD
  // ===========================

  doc.setDrawColor(...COLORS.gold);

  doc.roundedRect(110, 72, 90, 65, 3, 3, "FD");

  // Header

  doc.setFillColor(...COLORS.navy);

  doc.roundedRect(110, 72, 90, 12, 3, 3, "F");

  doc.setTextColor(255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text("PLOT INFORMATION", 115, 80);

  // Body

  doc.setTextColor(0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  y = 92;

  const plotData = [
    ["Plot Number", customer?.plot_no],
    ["Plot Size", `${customer?.plot_size} Sq.Yds`],
    ["Facing", customer?.facing],
    ["Road Width", "24 Feet"],
  ];

  plotData.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 115, y);

    doc.setFont("helvetica", "normal");
    doc.text(`: ${value || "-"}`, 155, y);

    y += 10;
  });
};