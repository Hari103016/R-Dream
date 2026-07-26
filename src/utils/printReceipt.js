import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";

export const printReceipt = async (customer, payment) => {
  console.log("Customer:", customer);
  console.log("Payment:", payment);

  if (!customer) {
    alert("Customer not found");
    return;
  }

  const pdf = new jsPDF("p", "mm", "a4");

  // ================= Logo =================

  const img = new Image();
  img.src = logo;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  pdf.addImage(img, "PNG", 15, 10, 22, 22);

  // ================= Receipt Data =================

  const latestPayment = payment || {
    amount: customer.amount_paid,
    payment_mode: "Cash",
    payment_date: customer.booking_date,
    remarks: "-",
  };

  const receiptNo =
    "RD-" +
    new Date().getFullYear() +
    "-" +
    String(customer.id).padStart(4, "0");

  // ================= Header =================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(239, 90, 41);

  pdf.text("R DREAM INFRA DEVELOPERS", 105, 22, {
    align: "center",
  });

  pdf.setDrawColor(239, 90, 41);
  pdf.setLineWidth(0.5);
  pdf.line(15, 30, 195, 30);

  pdf.setFontSize(16);
  pdf.setTextColor(0);

  pdf.text("PAYMENT RECEIPT", 105, 38, {
    align: "center",
  });

  pdf.setFontSize(11);

  pdf.text(
    `Receipt No : ${receiptNo}`,
    15,
    48
  );

  pdf.text(
    `Date : ${new Date().toLocaleDateString("en-IN")}`,
    145,
    48
  );

  // ================= Customer Details =================

  autoTable(pdf, {
    startY: 55,

    head: [["Customer Details", ""]],

    body: [
      ["Name", customer.name || "-"],

      ["Mobile", customer.mobile || "-"],

      ["Plot Number", customer.plot_no || "-"],

      [
        "Plot Size",
        `${customer.plot_size || "-"} Sq.Yds`,
      ],

      ["Facing", customer.facing || "-"],

      ["Status", customer.status || "-"],

      [
        "Booking Date",
        customer.booking_date || "-",
      ],
    ],

    theme: "grid",

    headStyles: {
      fillColor: [239, 90, 41],
      textColor: 255,
      halign: "left",
      fontStyle: "bold",
    },

    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
  });

  // ================= Payment Summary =================

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 10,

    head: [["Payment Summary", ""]],

    body: [
      [
        "Total Amount",
        `Rs. ${Number(
          customer.total_amount || 0
        ).toLocaleString("en-IN")}`,
      ],

      [
        "Amount Paid",
        `Rs. ${Number(
          customer.amount_paid || 0
        ).toLocaleString("en-IN")}`,
      ],

      [
        "Balance Amount",
        `Rs. ${Number(
          customer.balance || 0
        ).toLocaleString("en-IN")}`,
      ],
    ],

    theme: "grid",

    headStyles: {
      fillColor: [239, 90, 41],
      textColor: 255,
      halign: "left",
      fontStyle: "bold",
    },

    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
  });
    // ================= Latest Payment =================

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 10,

    head: [["Latest Payment", ""]],

    body: [
      [
        "Paid Amount",
        `Rs. ${Number(
          latestPayment.amount || 0
        ).toLocaleString("en-IN")}`,
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
      fillColor: [239, 90, 41],
      textColor: 255,
      halign: "left",
      fontStyle: "bold",
    },

    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
  });

  // ================= Note =================

  let y = pdf.lastAutoTable.finalY + 15;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(239, 90, 41);

  pdf.text("Note:", 15, y);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(60);

  pdf.text(
    "This receipt confirms the payment received towards the purchase of the above-mentioned plot.",
    15,
    y + 6
  );

  // ================= Footer Line =================

  y += 30;

  pdf.setDrawColor(239, 90, 41);
  pdf.setLineWidth(0.5);
  pdf.line(15, y, 195, y);

  // ================= Company Details =================

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

  // ================= Signature =================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);

  pdf.line(140, y + 18, 190, y + 18);

  pdf.text(
    "Authorized Signature",
    145,
    y + 25
  );

  // ================= Save =================

  pdf.save(
    `Receipt-${customer.plot_no}.pdf`
  );
};