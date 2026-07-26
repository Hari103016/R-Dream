import { COLORS } from "./pdfStyles";

export const drawFooter = (doc, startY) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = startY + 10;

  // =====================================
  // Declaration
  // =====================================

  doc.setDrawColor(...COLORS.gold);
  doc.setFillColor(252, 250, 245);

  doc.roundedRect(10, y, 190, 30, 3, 3, "FD");

  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.navy);

  doc.text("DECLARATION", 15, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60);

  const declaration =
    "This receipt confirms the payment received towards the purchase of the above plot. This is a computer-generated receipt issued by R DREAM INFRA DEVELOPERS and does not require a physical signature.";

  const lines = doc.splitTextToSize(declaration, 180);

  doc.text(lines, 15, y + 16);

  // =====================================
  // THANK YOU SECTION
  // =====================================

  y += 40;

  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(10, y, 120, 20, 3, 3, "F");

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255);

  doc.text("THANK YOU", 70, y + 8, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  doc.text(
    "Thank you for choosing R DREAM INFRA DEVELOPERS",
    70,
    y + 15,
    {
      align: "center",
    }
  );

  // =====================================
  // AUTHORIZED SIGNATURE
  // =====================================

  doc.setDrawColor(...COLORS.gold);

  doc.line(145, y + 12, 195, y + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);

  doc.text("Authorized Signature", 170, y + 18, {
    align: "center",
  });

  // =====================================
  // CONTACT INFORMATION
  // =====================================

  y += 32;

  doc.setFillColor(...COLORS.navy);

  doc.roundedRect(10, y, 190, 28, 2, 2, "F");

  doc.setTextColor(255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text(
    "R DREAM INFRA DEVELOPERS",
    pageWidth / 2,
    y + 8,
    {
      align: "center",
    }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.text(
    "Konyapalem Venture | NTR District | Andhra Pradesh",
    pageWidth / 2,
    y + 15,
    {
      align: "center",
    }
  );

  doc.text(
    "Phone: +91 98765 43210 | Email: info@rdreaminfra.com",
    pageWidth / 2,
    y + 21,
    {
      align: "center",
    }
  );

  doc.text(
    "Generated: " + new Date().toLocaleString("en-IN"),
    15,
    286
  );

  doc.text("Page 1 of 1", 195, 286, {
    align: "right",
  });
};