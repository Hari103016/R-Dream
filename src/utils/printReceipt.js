import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";

export const printReceipt = async (customer, payment) => {
  if (!customer) {
    alert("Customer not found");
    return;
  }

  // Create PDF
  const pdf = new jsPDF("p", "mm", "a4");

  // ===============================
  // Logo
  // ===============================

  const img = new Image();
  img.src = logo;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  pdf.addImage(img, "PNG", 15, 12, 24, 24);

  // ===============================
  // Company Header
  // ===============================

  pdf.setFillColor(239, 90, 41);
  pdf.rect(0, 0, 210, 38, "F");

  pdf.addImage(img, "PNG", 12, 7, 24, 24);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);

  pdf.text(
    "R DREAM INFRA DEVELOPERS",
    105,
    18,
    {
      align: "center",
    }
  );

  pdf.setFontSize(11);

  pdf.text(
    "Premium Open Plot Developers",
    105,
    26,
    {
      align: "center",
    }
  );

  // ===============================
  // Receipt Title
  // ===============================

  pdf.setTextColor(0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);

  pdf.text(
    "PAYMENT RECEIPT",
    105,
    50,
    {
      align: "center",
    }
  );

  // ===============================
  // Receipt Number
  // ===============================

  const receiptNo =
    "RD-" +
    new Date().getFullYear() +
    "-" +
    String(customer.id).padStart(4, "0");

  const latestPayment = payment || {
    amount: customer.amount_paid,
    payment_mode: "Cash",
    payment_date: customer.booking_date,
    remarks: "-",
  };

  pdf.setDrawColor(239, 90, 41);
  pdf.setFillColor(255, 248, 244);

  pdf.roundedRect(
    15,
    58,
    85,
    18,
    2,
    2,
    "FD"
  );

  pdf.roundedRect(
    110,
    58,
    85,
    18,
    2,
    2,
    "FD"
  );

  pdf.setFontSize(10);
  pdf.setTextColor(120);

  pdf.text(
    "Receipt Number",
    20,
    65
  );

  pdf.text(
    "Date",
    115,
    65
  );

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0);

  pdf.text(
    receiptNo,
    20,
    72
  );

  pdf.text(
    new Date().toLocaleDateString("en-IN"),
    115,
    72
  );
    // ===========================================
  // Customer Information
  // ===========================================

  autoTable(pdf, {
    startY: 85,

    head: [["CUSTOMER INFORMATION", ""]],

    body: [
      ["Customer Name", customer.name || "-"],

      ["Mobile Number", customer.mobile || "-"],

      ["Status", customer.status || "-"],
    ],

    theme: "grid",

    headStyles: {
      fillColor: [239, 90, 41],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
      fontSize: 11,
    },

    bodyStyles: {
      fontSize: 10,
      cellPadding: 3,
    },

    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },

    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 60,
      },
      1: {
        cellWidth: 120,
      },
    },
  });

  // ===========================================
  // Plot Information
  // ===========================================

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 10,

    head: [["PLOT INFORMATION", ""]],

    body: [
      ["Plot Number", customer.plot_no || "-"],

      [
        "Plot Size",
        `${customer.plot_size || "-"} Sq.Yds`,
      ],

      ["Facing", customer.facing || "-"],

      [
        "Booking Date",
        customer.booking_date || "-",
      ],
    ],

    theme: "grid",

    headStyles: {
      fillColor: [239, 90, 41],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
      fontSize: 11,
    },

    bodyStyles: {
      fontSize: 10,
      cellPadding: 3,
    },

    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },

    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 60,
      },
      1: {
        cellWidth: 120,
      },
    },
  });
    // ===========================================
  // Payment Summary
  // ===========================================

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 10,

    head: [["PAYMENT SUMMARY", ""]],

    body: [
      [
        "Total Amount",
        `Rs. ${Number(customer.total_amount || 0).toLocaleString("en-IN")}`,
      ],

      [
        "Amount Paid",
        `Rs. ${Number(customer.amount_paid || 0).toLocaleString("en-IN")}`,
      ],

      [
        "Balance Amount",
        `Rs. ${Number(customer.balance || 0).toLocaleString("en-IN")}`,
      ],
    ],

    theme: "grid",

    headStyles: {
      fillColor: [46, 125, 50],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
      halign: "left",
    },

    bodyStyles: {
      fontSize: 11,
      cellPadding: 4,
    },

    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },

    columnStyles: {
      0: {
        cellWidth: 70,
        fontStyle: "bold",
      },

      1: {
        cellWidth: 110,
        halign: "right",
      },
    },
  });

  // ===========================================
  // Latest Payment Details
  // ===========================================

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 10,

    head: [["LATEST PAYMENT DETAILS", ""]],

    body: [
      [
        "Paid Amount",
        `Rs. ${Number(latestPayment.amount || 0).toLocaleString("en-IN")}`,
      ],

      [
        "Payment Mode",
        latestPayment.payment_mode || "-",
      ],

      [
        "Payment Date",
        latestPayment.payment_date || "-",
      ],

      [
        "Remarks",
        latestPayment.remarks || "-",
      ],
    ],

    theme: "grid",

    headStyles: {
      fillColor: [21, 101, 192],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
      halign: "left",
    },

    bodyStyles: {
      fontSize: 10,
      cellPadding: 3,
    },

    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },

    columnStyles: {
      0: {
        cellWidth: 70,
        fontStyle: "bold",
      },

      1: {
        cellWidth: 110,
      },
    },
  });
    // ===========================================
  // Note Section
  // ===========================================

  let y = pdf.lastAutoTable.finalY + 15;

  pdf.setFillColor(255, 248, 230);
  pdf.roundedRect(15, y - 5, 180, 18, 3, 3, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(239, 90, 41);

  pdf.text("Important Note", 20, y + 2);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(60);

  pdf.text(
    "This receipt confirms the payment received towards the purchase of the above-mentioned plot.",
    20,
    y + 8
  );

  // ===========================================
  // Footer
  // ===========================================

  y += 35;

  pdf.setDrawColor(239, 90, 41);
  pdf.setLineWidth(0.6);
  pdf.line(15, y, 195, y);

  y += 8;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(239, 90, 41);

  pdf.text(
    "R DREAM INFRA DEVELOPERS",
    15,
    y
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(80);

  pdf.text(
    "Mahanadu Road, Vijayawada",
    15,
    y + 7
  );

  pdf.text(
    "NTR District, Andhra Pradesh",
    15,
    y + 13
  );

  pdf.text(
    "Phone : +91 9347110914",
    15,
    y + 19
  );

  pdf.text(
    "Email : rdreamdevelopers@gmail.com",
    15,
    y + 25
  );

  // ===========================================
  // Signature
  // ===========================================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);

  pdf.line(140, y + 18, 190, y + 18);

  pdf.text(
    "Authorized Signature",
    145,
    y + 25
  );

  // ===========================================
  // Border
  // ===========================================

  pdf.setDrawColor(180);
  pdf.setLineWidth(0.4);
  pdf.rect(8, 8, 194, 281);

  // ===========================================
  // Thank You
  // ===========================================

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.setTextColor(100);

  pdf.text(
    "Thank you for choosing R DREAM INFRA DEVELOPERS.",
    105,
    285,
    {
      align: "center",
    }
  );

  // ===========================================
  // Save PDF
  // ===========================================

  pdf.save(`Receipt-${customer.plot_no}.pdf`);
};