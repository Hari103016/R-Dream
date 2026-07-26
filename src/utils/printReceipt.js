import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const printReceipt = (customer, payment) => {
    console.log("Customer:", customer);
    console.log("Payment:", payment);
    if (!customer) {
        alert("Customer not found");
        return;
}

  const pdf = new jsPDF("p", "mm", "a4");

  const latestPayment = payment || {
    amount: customer.amount_paid,
    payment_mode: "Cash",
    payment_date: customer.booking_date,
    remarks: "-"
  };

  const receiptNo =
    "RD-" +
    new Date().getFullYear() +
    "-" +
    String(customer.id).padStart(4, "0");

  /* Company Name */

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(239, 90, 41);

  pdf.text("R DREAM INFRA DEVELOPERS", 105, 18, {
    align: "center",
  });

  pdf.setFontSize(10);
  pdf.setTextColor(100);

  pdf.text(
    "DTCP Approved Layouts | Open Plots",
    105,
    25,
    { align: "center" }
  );

  pdf.setDrawColor(239, 90, 41);
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
    150,
    48
  );

  /* Customer Table */

  autoTable(pdf, {
    startY: 55,

    head: [["Customer Details", ""]],

    body: [

      ["Name", customer.name],

      ["Mobile", customer.mobile],

      ["Plot Number", customer.plot_no],

      [
        "Plot Size",
        `${customer.plot_size} Sq.Yds`,
      ],

      ["Facing", customer.facing],

      ["Status", customer.status],

      [
        "Booking Date",
        customer.booking_date,
      ],

    ],

    theme: "grid",

    headStyles: {
      fillColor: [239, 90, 41],
      halign: "left",
    },

    styles: {
      fontSize: 10,
    },

  });
    /* Payment Summary */

  autoTable(pdf, {

    startY: pdf.lastAutoTable.finalY + 10,

    head: [["Payment Summary", ""]],

    body: [

      [
        "Total Amount",
        `₹${Number(customer.total_amount).toLocaleString()}`
      ],

      [
        "Amount Paid",
        `₹${Number(customer.amount_paid).toLocaleString()}`
      ],

      [
        "Balance Amount",
        `₹${Number(customer.balance).toLocaleString()}`
      ],

    ],

    theme: "grid",

    headStyles: {
      fillColor: [239, 90, 41],
      halign: "left",
    },

    styles: {
      fontSize: 10,
    },

  });

  /* Latest Payment */

  autoTable(pdf, {

    startY: pdf.lastAutoTable.finalY + 10,

    head: [["Latest Payment", ""]],

    body: [

      [
        "Paid Amount",
        `₹${Number(latestPayment.amount).toLocaleString()}`
      ],

      [
        "Payment Mode",
        latestPayment.payment_mode,
      ],

      [
        "Payment Date",
        latestPayment.payment_date,
      ],

      [
        "Remarks",
        latestPayment.remarks || "-",
      ],

    ],

    theme: "grid",

    headStyles: {
      fillColor: [239, 90, 41],
      halign: "left",
    },

    styles: {
      fontSize: 10,
    },

  });

  /* Note */

  let y = pdf.lastAutoTable.finalY + 15;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(239, 90, 41);

  pdf.text("Note", 15, y);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(60);

  pdf.text(
    "This receipt confirms the payment received towards the purchase of the above-mentioned plot.",
    15,
    y + 6
  );

  /* Footer */

  y += 30;

  pdf.setDrawColor(239, 90, 41);
  pdf.line(15, y, 195, y);

  y += 8;

  pdf.setFontSize(15);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(239, 90, 41);

  pdf.text(
    "R DREAM INFRA DEVELOPERS",
    15,
    y
  );

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(70);

  pdf.text(
    "Konyapalem Venture",
    15,
    y + 7
  );

  pdf.text(
    "NTR District, Andhra Pradesh",
    15,
    y + 13
  );

  pdf.text(
    "Phone: +91 9347110914",
    15,
    y + 19
  );

  pdf.text(
    "Email: rdreamdevelopers@gmail.com",
    15,
    y + 25
  );

  /* Signature */

  pdf.line(140, y + 18, 190, y + 18);

  pdf.setFont("helvetica", "bold");

  pdf.text(
    "Authorized Signature",
    145,
    y + 25
  );

  /* Save */

  pdf.save(
    `Receipt-${customer.plot_no}.pdf`
  );

};