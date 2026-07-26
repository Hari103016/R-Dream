import logo from "../assets/logo.png";
import { COLORS, FONTS } from "./pdfStyles";
import { generateReceiptNumber } from "./pdfHelpers";

export const drawHeader = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // =====================================
  // OUTER BORDER
  // =====================================

  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.8);
  doc.roundedRect(5, 5, 200, 287, 3, 3);

  // =====================================
  // LEFT LOGO CARD
  // =====================================

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLORS.gold);
  doc.roundedRect(8, 8, 38, 52, 2, 2, "FD");

  try {
    doc.addImage(logo, "PNG", 11, 11, 32, 32);
  } catch (e) {
    console.error("Logo Error :", e);
  }

  doc.setTextColor(...COLORS.navy);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  doc.text("R DREAM", 27, 47, {
    align: "center",
  });

  doc.setFontSize(7);

  doc.text("INFRA DEVELOPERS", 27, 52, {
    align: "center",
  });

  // =====================================
  // RIGHT BADGE
  // =====================================

  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(170, 8, 32, 42, 2, 2, "F");

  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);

  doc.text("BUILDING", 186, 19, {
    align: "center",
  });

  doc.text("YOUR", 186, 25, {
    align: "center",
  });

  doc.text("DREAMS", 186, 31, {
    align: "center",
  });

  doc.text("TOGETHER", 186, 37, {
    align: "center",
  });

  // =====================================
  // COMPANY NAME
  // =====================================

  doc.setTextColor(...COLORS.navy);

  doc.setFont("times", "bold");
  doc.setFontSize(22);

  doc.text(
    "R DREAM INFRA DEVELOPERS",
    pageWidth / 2,
    20,
    {
      align: "center",
    }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.setTextColor(...COLORS.gold);

  doc.text(
    "DTCP Approved Open Plots | Konyapalem Venture",
    pageWidth / 2,
    28,
    {
      align: "center",
    }
  );

  // =====================================
  // GOLD DIVIDER
  // =====================================

  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(55, 36, 155, 36);

  // =====================================
  // RECEIPT TITLE
  // =====================================

  doc.setTextColor(...COLORS.navy);

  doc.setFont("times", "bold");
  doc.setFontSize(18);

  doc.text(
    "PAYMENT RECEIPT",
    pageWidth / 2,
    45,
    {
      align: "center",
    }
  );

  // =====================================
  // RECEIPT DETAILS
  // =====================================

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  doc.setTextColor(40);

  doc.text(
    `Receipt No : ${generateReceiptNumber()}`,
    15,
    58
  );

  doc.text(
    `Date : ${new Date().toLocaleDateString("en-IN")}`,
    148,
    58
  );

  // Reset colour
  doc.setTextColor(0);
};