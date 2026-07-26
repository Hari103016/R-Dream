import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";

export const printReceipt = async (customer, payment) => {
  try {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();

    // =========================
    // Logo
    // =========================

    try {
      doc.addImage(logo, "PNG", 15, 10, 25, 25);
    } catch (e) {
      console.log("Logo not found");
    }

    // =========================
    // Company Header
    // =========================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(18, 52, 86);

    doc.text(
      "R DREAM INFRA DEVELOPERS",
      pageWidth / 2,
      18,
      {
        align: "center",
      }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90);

    doc.text(
      "DTCP Approved Open Plots | Konyapalem Venture",
      pageWidth / 2,
      24,
      {
        align: "center",
      }
    );

    doc.setDrawColor(30, 144, 255);
    doc.setLineWidth(0.5);
    doc.line(10, 38, 200, 38);

    // =========================
    // Receipt Heading
    // =========================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0);

    doc.text(
      "PAYMENT RECEIPT",
      pageWidth / 2,
      48,
      {
        align: "center",
      }
    );

    const receiptNo =
      "RD-" + Date.now().toString().slice(-6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(
      `Receipt No : ${receiptNo}`,
      14,
      60
    );

    doc.text(
      `Date : ${new Date().toLocaleDateString("en-IN")}`,
      140,
      60
    );

    // =========================
    // Customer Details
    // =========================

    doc.setFillColor(240, 248, 255);
    doc.roundedRect(10, 68, 190, 52, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);

    doc.text(
      "Customer Information",
      14,
      76
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(
      `Customer Name : ${customer?.name || "-"}`,
      15,
      86
    );

    doc.text(
      `Mobile Number : ${customer?.mobile || "-"}`,
      15,
      94
    );

    doc.text(
      `Booking Date : ${
        customer?.booking_date
          ? new Date(
              customer.booking_date
            ).toLocaleDateString("en-IN")
          : "-"
      }`,
      15,
      102
    );

    doc.text(
      `Status : ${customer?.status || "-"}`,
      15,
      110
    );

    // =========================
    // Plot Details
    // =========================

    doc.setFillColor(250, 250, 250);
    doc.roundedRect(10, 126, 190, 44, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);

    doc.text(
      "Plot Information",
      14,
      134
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(
      `Plot Number : ${customer?.plot_no || "-"}`,
      15,
      144
    );

    doc.text(
      `Plot Size : ${
        customer?.plot_size || "-"
      } Sq.Yds`,
      15,
      152
    );

    doc.text(
      `Facing : ${customer?.facing || "-"}`,
      15,
      160
    );

    // =========================
    // Payment Summary
    // =========================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);

    doc.text(
      "Payment Summary",
      14,
      182
    );

    autoTable(doc, {
      startY: 188,

      head: [["Description", "Value"]],

      body: [
        [
          "Total Amount",
          `₹${Number(
            customer?.total_amount || 0
          ).toLocaleString("en-IN")}`,
        ],

        [
          "Amount Paid",
          `₹${Number(
            customer?.amount_paid || 0
          ).toLocaleString("en-IN")}`,
        ],

        [
          "Balance",
          `₹${Number(
            customer?.balance || 0
          ).toLocaleString("en-IN")}`,
        ],

        [
          "Latest Payment",
          payment
            ? `₹${Number(
                payment.amount
              ).toLocaleString("en-IN")}`
            : "-",
        ],

        [
          "Payment Mode",
          payment?.payment_mode || "-",
        ],

        [
          "Payment Date",
          payment?.payment_date
            ? new Date(
                payment.payment_date
              ).toLocaleDateString("en-IN")
            : "-",
        ],

        [
          "Remarks",
          payment?.remarks || "-",
        ],
      ],

      theme: "grid",

      headStyles: {
        fillColor: [18, 52, 86],
        textColor: 255,
      },

      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
    });

    const finalY =
      doc.lastAutoTable.finalY + 10;
          // =========================
    // Declaration
    // =========================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0);

    doc.text("Declaration", 14, finalY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const declaration =
      "Received the above payment towards the purchase of the above plot. This receipt is generated by R DREAM INFRA DEVELOPERS and is valid without a physical signature.";

    const lines = doc.splitTextToSize(declaration, 180);

    doc.text(lines, 14, finalY + 8);

    // =========================
    // Signature Section
    // =========================

    const signY = finalY + 45;

    doc.setDrawColor(0);

    doc.line(20, signY, 80, signY);
    doc.line(130, signY, 190, signY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text("Customer Signature", 25, signY + 6);
    doc.text("Authorized Signature", 135, signY + 6);

    // =========================
    // Thank You Box
    // =========================

    doc.setFillColor(240, 248, 255);
    doc.roundedRect(10, signY + 18, 190, 18, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(18, 52, 86);

    doc.text(
      "Thank you for choosing R DREAM INFRA DEVELOPERS",
      pageWidth / 2,
      signY + 29,
      {
        align: "center",
      }
    );

    // =========================
    // Footer
    // =========================

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);

    doc.text(
      `Generated on ${new Date().toLocaleString("en-IN")}`,
      14,
      288
    );

    doc.text(
      "Page 1 of 1",
      196,
      288,
      {
        align: "right",
      }
    );

    // =========================
    // Save PDF
    // =========================

    const filename = `Receipt_${customer?.plot_no || "Customer"}_${
      customer?.name || "Receipt"
    }.pdf`;

    doc.save(filename);

  } catch (error) {
    console.error("Receipt generation failed:", error);
    alert(
      "Failed to generate receipt. Check the browser console for details."
    );
  }
};