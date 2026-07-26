import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import logo from "../assets/logo.png";
import qr from "../assets/qr.png";
import stamp from "../assets/stamp.png";
import signature from "../assets/signature.png";

const COLORS = {
  navy: [15, 36, 67],
  gold: [205, 170, 80],
  white: [255, 255, 255],
  black: [35, 35, 35],
  light: [248, 249, 251],
  border: [220, 220, 220],
  green: [34, 197, 94],
  red: [220, 38, 38],
  amber: [245, 158, 11],
};

const COMPANY = {
  name: "R DREAM INFRA DEVELOPERS",
  project: "DTCP Approved Open Plots",
  address: "Konyapalem Venture, NTR District",
  phone: "+91 XXXXXXXXXX",
  email: "info@rdreaminfra.com",
  website: "www.rdreaminfra.com",
};

const formatCurrency = (amount) =>
  `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const generateReceiptNumber = (payment) => {
  if (payment?.receipt_number) return payment.receipt_number;

  const d = new Date();

  return `RD-${d.getFullYear()}${String(
    d.getMonth() + 1
  ).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(
    Math.random() * 9000 + 1000
  )}`;
};

function drawHeader(doc, payment) {
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.8);
  doc.rect(6, 6, 198, 285);

  doc.setFillColor(...COLORS.navy);
  doc.rect(6, 6, 198, 42, "F");

  try {
    doc.addImage(logo, "PNG", 12, 10, 24, 24);
  } catch {}

  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text(COMPANY.name, 42, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(COMPANY.project, 42, 25);

  doc.setFontSize(8);
  doc.text(COMPANY.address, 42, 31);

  doc.setDrawColor(...COLORS.gold);
  doc.line(42, 34, 150, 34);

  doc.setFontSize(7);
  doc.text(`Phone : ${COMPANY.phone}`, 42, 39);
  doc.text(`Email : ${COMPANY.email}`, 95, 39);

  doc.setFillColor(...COLORS.gold);
  doc.roundedRect(158, 10, 38, 26, 2, 2, "F");

  doc.setTextColor(...COLORS.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PAYMENT", 177, 18, { align: "center" });
  doc.text("RECEIPT", 177, 25, { align: "center" });

  doc.setFillColor(45, 45, 45);
  doc.roundedRect(150, 50, 48, 16, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text("Receipt No.", 154, 56);

  doc.setFontSize(8);
  doc.text(generateReceiptNumber(payment), 154, 62);

  doc.setFillColor(242, 247, 255);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(10, 50, 42, 16, 2, 2, "FD");

  doc.setTextColor(...COLORS.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Receipt Date", 14, 56);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(formatDate(new Date()), 14, 62);
}
// =======================================
// CUSTOMER & PLOT SECTION
// =======================================

function drawInfoRow(doc, label, value, x1, x2, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.black);
  doc.text(label, x1, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(value ? String(value) : "-", x2, y);
}

function drawStatusBadge(doc, status, x, y) {
  let color = COLORS.green;
  let text = "BOOKED";

  switch ((status || "").toLowerCase()) {
    case "sold":
      color = COLORS.red;
      text = "SOLD";
      break;

    case "available":
      color = COLORS.green;
      text = "AVAILABLE";
      break;

    case "reserved":
      color = COLORS.amber;
      text = "RESERVED";
      break;

    default:
      color = COLORS.green;
      text = status || "BOOKED";
  }

  doc.setFillColor(...color);
  doc.roundedRect(x, y - 5, 26, 8, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(text.toUpperCase(), x + 13, y, {
    align: "center",
  });
}

function drawCustomer(doc, customer) {

  // ==========================
  // CUSTOMER CARD
  // ==========================

  doc.setFillColor(...COLORS.light);
  doc.setDrawColor(...COLORS.border);

  doc.roundedRect(
    10,
    75,
    92,
    62,
    3,
    3,
    "FD"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.navy);

  doc.text(
    "CUSTOMER INFORMATION",
    15,
    84
  );

  doc.setDrawColor(...COLORS.gold);
  doc.line(15, 86, 58, 86);

  let y = 95;

  drawInfoRow(
    doc,
    "Customer",
    customer.name,
    15,
    48,
    y
  );

  y += 9;

  drawInfoRow(
    doc,
    "Phone",
    customer.phone,
    15,
    48,
    y
  );

  y += 9;

  drawInfoRow(
    doc,
    "Email",
    customer.email || "-",
    15,
    48,
    y
  );

  y += 9;

  drawInfoRow(
    doc,
    "Booking",
    formatDate(customer.booking_date),
    15,
    48,
    y
  );

  y += 9;

  drawInfoRow(
    doc,
    "Executive",
    customer.sales_executive || "Admin",
    15,
    48,
    y
  );

  y += 9;

  doc.setFont("helvetica", "bold");
  doc.text("Status", 15, y);

  drawStatusBadge(
    doc,
    customer.status,
    48,
    y
  );

  // ==========================
  // PLOT CARD
  // ==========================

  doc.setFillColor(248, 252, 255);

  doc.roundedRect(
    108,
    75,
    92,
    62,
    3,
    3,
    "FD"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.navy);

  doc.text(
    "PLOT INFORMATION",
    113,
    84
  );

  doc.setDrawColor(...COLORS.gold);
  doc.line(113, 86, 150, 86);

  y = 95;

  drawInfoRow(
    doc,
    "Plot No",
    customer.plot_no,
    113,
    152,
    y
  );

  y += 9;

  drawInfoRow(
    doc,
    "Size",
    `${customer.plot_size || "-"} Sq.Yds`,
    113,
    152,
    y
  );

  y += 9;

  drawInfoRow(
    doc,
    "Facing",
    customer.facing,
    113,
    152,
    y
  );

  y += 9;

  drawInfoRow(
    doc,
    "Road",
    customer.road_width,
    113,
    152,
    y
  );

  y += 9;

  drawInfoRow(
    doc,
    "Location",
    customer.location || "Konyapalem",
    113,
    152,
    y
  );

  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);

  doc.text(
    "Total Amount",
    113,
    y
  );

  doc.setFontSize(12);

  doc.text(
    formatCurrency(customer.total_amount),
    198,
    y,
    {
      align: "right",
    }
  );

  // Divider

  doc.setDrawColor(...COLORS.gold);
  doc.line(
    10,
    145,
    200,
    145
  );
}
// =======================================
// PAYMENT DETAILS
// =======================================

function drawPayment(doc, customer, payment) {

  const total = Number(customer.total_amount || 0);
  const paid = Number(customer.amount_paid || 0);
  const current = Number(payment.amount || 0);

  const balance = total - paid;

  let status = "PENDING";

  if (balance <= 0) status = "PAID";
  else if (paid > 0) status = "PARTIALLY PAID";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.navy);

  doc.text("PAYMENT DETAILS",10,155);

  doc.setDrawColor(...COLORS.gold);
  doc.line(10,157,60,157);

  autoTable(doc,{
      startY:162,

      head:[
        [
          "Description",
          "Value"
        ]
      ],

      body:[
        ["Total Plot Amount",formatCurrency(total)],
        ["Amount Paid Till Date",formatCurrency(paid)],
        ["Current Payment",formatCurrency(current)],
        ["Balance Amount",formatCurrency(balance)],
        ["Payment Mode",payment.payment_mode || "-"],
        ["Transaction ID",payment.transaction_id || "-"],
        ["Payment Date",formatDate(payment.payment_date)],
        ["Remarks",payment.remarks || "-"]
      ],

      theme:"grid",

      headStyles:{
          fillColor:COLORS.navy,
          textColor:[255,255,255],
          fontStyle:"bold",
          fontSize:10,
          halign:"center"
      },

      styles:{
          fontSize:9,
          cellPadding:3,
          lineWidth:0.25,
          lineColor:COLORS.border
      },

      alternateRowStyles:{
          fillColor:[250,250,250]
      },

      columnStyles:{
          0:{
              cellWidth:72,
              fontStyle:"bold"
          },

          1:{
              cellWidth:108,
              halign:"right"
          }
      }
  });

  let y = doc.lastAutoTable.finalY + 8;

  //------------------------------------------------
  // Payment Progress
  //------------------------------------------------

  const progress = total === 0 ? 0 : Math.min((paid/total)*100,100);

  doc.setFont("helvetica","bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);

  doc.text("Payment Progress",10,y);

  y+=6;

  doc.setFillColor(230,230,230);
  doc.roundedRect(10,y,90,7,3,3,"F");

  doc.setFillColor(...COLORS.green);
  doc.roundedRect(
      10,
      y,
      (90*progress)/100,
      7,
      3,
      3,
      "F"
  );

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.black);

  doc.text(
      `${progress.toFixed(1)} %`,
      105,
      y+5
  );

  //------------------------------------------------
  // Status Card
  //------------------------------------------------

  const cardX = 118;
  const cardY = doc.lastAutoTable.finalY + 4;

  let statusColor = COLORS.red;

  if(status==="PAID")
      statusColor = COLORS.green;

  if(status==="PARTIALLY PAID")
      statusColor = COLORS.amber;

  doc.setFillColor(...COLORS.navy);

  doc.roundedRect(
      cardX,
      cardY,
      82,
      40,
      3,
      3,
      "F"
  );

  doc.setFont("helvetica","bold");
  doc.setTextColor(255,255,255);
  doc.setFontSize(11);

  doc.text(
      "BALANCE",
      159,
      cardY+8,
      {align:"center"}
  );

  doc.setFontSize(17);

  doc.text(
      formatCurrency(balance),
      159,
      cardY+21,
      {align:"center"}
  );

  doc.setFillColor(...statusColor);

  doc.roundedRect(
      136,
      cardY+27,
      46,
      8,
      3,
      3,
      "F"
  );

  doc.setFontSize(8);

  doc.text(
      status,
      159,
      cardY+33,
      {
          align:"center"
      }
  );

  //------------------------------------------------
  // Return Safe Footer Position
  //------------------------------------------------

  const footerStart = Math.max(
      y+18,
      cardY+46
  );

  return footerStart;
}
// =======================================
// FOOTER
// =======================================

function drawFooter(doc, startY) {

  // Ensure footer never starts too low
  let y = Math.min(startY, 205);

  // If content is already too low, continue on a new page
  if (y > 220) {
    doc.addPage();
    drawHeader(doc, {});
    y = 40;
  }

  // ---------------------------
  // Declaration
  // ---------------------------

  doc.setFillColor(255, 252, 245);
  doc.setDrawColor(...COLORS.gold);

  doc.roundedRect(10, y, 190, 30, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);
  doc.text("Declaration", 15, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.black);

  const text =
    "This is a computer generated receipt issued by R DREAM INFRA DEVELOPERS. Please preserve this receipt for future reference. Payments are subject to the terms and conditions of the booking agreement.";

  doc.text(
    doc.splitTextToSize(text, 175),
    15,
    y + 13
  );

  y += 40;

  // ---------------------------
  // QR
  // ---------------------------

  try {
    doc.addImage(qr, "PNG", 15, y, 24, 24);
  } catch {}

  doc.setFontSize(8);
  doc.text("Scan QR", 19, y + 29);

  // ---------------------------
  // Company Stamp
  // ---------------------------

  try {
    doc.addImage(stamp, "PNG", 87, y, 26, 26);
  } catch {}

  doc.text("Company Stamp", 82, y + 29);

  // ---------------------------
  // Signature
  // ---------------------------

  try {
    doc.addImage(signature, "PNG", 150, y + 2, 30, 14);
  } catch {}

  doc.line(145, y + 20, 190, y + 20);

  doc.setFont("helvetica", "bold");
  doc.text("Authorized Signature", 149, y + 26);

  // ---------------------------
  // Watermark
  // ---------------------------

  doc.saveGraphicsState();

  doc.setGState(new doc.GState({ opacity: 0.05 }));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(45);
  doc.setTextColor(120);

  doc.text(
    "R DREAM INFRA",
    105,
    170,
    {
      angle: 45,
      align: "center",
    }
  );

  doc.restoreGraphicsState();

  // ---------------------------
  // Bottom Bar
  // ---------------------------

  doc.setFillColor(...COLORS.navy);
  doc.rect(6, 276, 198, 15, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(COMPANY.name, 10, 282);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  doc.text(`Phone : ${COMPANY.phone}`, 10, 287);
  doc.text(COMPANY.email, 70, 287);
  doc.text(COMPANY.website, 125, 287);

  doc.text(
    "Computer Generated Receipt",
    196,
    287,
    {
      align: "right",
    }
  );
}

// =======================================
// MAIN
// =======================================

export function printReceipt(customer, payment) {

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  drawHeader(doc, payment);

  drawCustomer(doc, customer);

  const footerY = drawPayment(
    doc,
    customer,
    payment
  );

  drawFooter(doc, footerY);

  const fileName =
    `Receipt_${customer.plot_no || "Plot"}_${(customer.name || "Customer")
      .replace(/\s+/g, "_")}.pdf`;

  doc.save(fileName);
}