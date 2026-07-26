import logo from "../assets/logo.png";
import { COLORS, FONTS } from "./pdfStyles";
import { generateReceiptNumber } from "./pdfHelpers";


export const drawHeader = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // ===========================
  // Outer Border
  // ===========================

  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.8);
  doc.roundedRect(5, 5, 200, 287, 3, 3);

  // ===========================
  // Left Logo Panel
  // ===========================

  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(8, 8, 38, 52, 2, 2, "F");

  try {
        doc.addImage(logo, "PNG", 12, 12, 30, 30);
    } catch (e) {
        console.error("Logo error:", e);
    }
  doc.setTextColor(255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text("R DREAM", 27, 48, {
    align: "center",
  });

  doc.setFontSize(8);

  doc.text("INFRA DEVELOPERS", 27, 53, {
    align: "center",
  });

  // ===========================
  // Right Badge
  // ===========================

  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(170, 8, 32, 42, 2, 2, "F");

  doc.setTextColor(255);
  doc.setFontSize(8);

  doc.text("BUILDING", 186, 22, {
    align: "center",
  });

  doc.text("YOUR DREAMS", 186, 28, {
    align: "center",
  });

  doc.text("TOGETHER", 186, 34, {
    align: "center",
  });

  // ===========================
  // Company Name
  // ===========================

  doc.setTextColor(...COLORS.navy);

  doc.setFont("times", "bold");
  doc.setFontSize(FONTS.title);

  doc.text(
    "R DREAM INFRA DEVELOPERS",
    pageWidth / 2,
    24,
    {
      align: "center",
    }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  doc.setTextColor(...COLORS.gold);

  doc.text(
    "DTCP Approved Open Plots | Konyapalem Venture",
    pageWidth / 2,
    32,
    {
      align: "center",
    }
  );

  // ===========================
  // Divider
  // ===========================

  doc.setDrawColor(...COLORS.gold);

  doc.line(55, 40, 155, 40);

  // ===========================
  // Title
  // ===========================

  doc.setTextColor(...COLORS.navy);

  doc.setFont("times", "bold");
  doc.setFontSize(20);

  doc.text(
    "PAYMENT RECEIPT",
    pageWidth / 2,
    50,
    {
      align: "center",
    }
  );

  // ===========================
  // Receipt Number
  // ===========================

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(
    `Receipt No : ${generateReceiptNumber()}`,
    15,
    63
  );

  doc.text(
    `Date : ${new Date().toLocaleDateString("en-IN")}`,
    150,
    63
  );
};