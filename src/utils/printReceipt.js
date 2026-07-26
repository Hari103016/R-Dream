import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import logo from "../assets/logo.png";
import qr from "../assets/qr.png";
import stamp from "../assets/stamp.png";
import signature from "../assets/signature.png";

const COLORS = {
  navy: [16, 38, 70],
  gold: [203, 168, 84],
  white: [255, 255, 255],
  black: [40, 40, 40],
  gray: [120, 120, 120],
  light: [248, 248, 248],
  border: [220, 220, 220],
  green: [16, 140, 70],
  red: [220, 53, 69],
};

const COMPANY = {
  name: "R DREAM INFRA DEVELOPERS",
  project: "DTCP Approved Open Plots | Konyapalem Venture",
  address: "Konyapalem, Chandarlapadu Mandal, NTR District",
  phone: "+91 XXXXXXXXXX",
  email: "info@rdreaminfra.com",
  website: "www.rdreaminfra.com",
};

function money(value) {
  return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
}

function date(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function receiptNo() {
  return (
    "RD-" +
    Date.now().toString().slice(-8)
  );
}
function drawHeader(doc) {

  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.8);
  doc.rect(6,6,198,285);

  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(6,6,198,40,0,0,"F");

  // Logo
  try{
      doc.addImage(logo,"PNG",12,10,22,22);
  }catch{}

  // Company

  doc.setTextColor(255,255,255);

  doc.setFont("helvetica","bold");
  doc.setFontSize(18);

  doc.text(COMPANY.name,40,18);

  doc.setFontSize(9);
  doc.setFont("helvetica","normal");

  doc.text(COMPANY.project,40,24);

  doc.setFontSize(8);

  doc.text(COMPANY.address,40,30);

  doc.setDrawColor(...COLORS.gold);

  doc.line(40,34,150,34);

  doc.setFontSize(7);

  doc.text(
      `Phone : ${COMPANY.phone}`,
      40,
      39
  );

  doc.text(
      `Email : ${COMPANY.email}`,
      90,
      39
  );

  // Badge

  doc.setFillColor(...COLORS.gold);

  doc.roundedRect(
      170,
      10,
      25,
      20,
      2,
      2,
      "F"
  );

  doc.setTextColor(...COLORS.navy);

  doc.setFont("helvetica","bold");
  doc.setFontSize(10);

  doc.text(
      "PAYMENT",
      182.5,
      17,
      {align:"center"}
  );

  doc.text(
      "RECEIPT",
      182.5,
      23,
      {align:"center"}
  );

  // Receipt Number

  doc.setFillColor(45,45,45);

  doc.roundedRect(
      150,
      52,
      50,
      15,
      2,
      2,
      "F"
  );

  doc.setTextColor(255,255,255);

  doc.setFontSize(7);

  doc.text(
      "Receipt No.",
      154,
      57
  );

  doc.setFontSize(8);

  doc.text(
      receiptNo(),
      154,
      63
  );

  // Date

  doc.setFillColor(240,245,255);

  doc.setDrawColor(...COLORS.border);

  doc.roundedRect(
      10,
      52,
      42,
      15,
      2,
      2,
      "FD"
  );

  doc.setTextColor(...COLORS.black);

  doc.setFont("helvetica","bold");
  doc.setFontSize(7);

  doc.text(
      "Receipt Date",
      14,
      57
  );

  doc.setFont("helvetica","normal");
  doc.setFontSize(8);

  doc.text(
      date(new Date()),
      14,
      63
  );

}function drawCustomer(doc, customer){

    // Left Card

    doc.setFillColor(...COLORS.light);

    doc.setDrawColor(...COLORS.border);

    doc.roundedRect(
        10,
        75,
        92,
        58,
        3,
        3,
        "FD"
    );

    doc.setFont("helvetica","bold");
    doc.setTextColor(...COLORS.navy);
    doc.setFontSize(11);

    doc.text(
        "CUSTOMER INFORMATION",
        15,
        84
    );

    doc.setDrawColor(...COLORS.gold);

    doc.line(
        15,
        86,
        55,
        86
    );

    doc.setTextColor(...COLORS.black);

    doc.setFont("helvetica","normal");
    doc.setFontSize(9);

    let y=94;

    const left=[
        ["Customer",customer.name],
        ["Mobile",customer.phone],
        ["Email",customer.email||"-"],
        ["Booking",date(customer.booking_date)],
        ["Status",customer.status||"Booked"],
    ];

    left.forEach(([k,v])=>{
        doc.setFont("helvetica","bold");
        doc.text(k,15,y);

        doc.setFont("helvetica","normal");
        doc.text(String(v||"-"),45,y);

        y+=8;
    });

    // Right Card

    doc.setFillColor(248,251,255);

    doc.roundedRect(
        108,
        75,
        92,
        58,
        3,
        3,
        "FD"
    );

    doc.setFont("helvetica","bold");

    doc.setTextColor(...COLORS.navy);

    doc.setFontSize(11);

    doc.text(
        "PLOT INFORMATION",
        113,
        84
    );

    doc.setDrawColor(...COLORS.gold);

    doc.line(
        113,
        86,
        145,
        86
    );
        doc.setTextColor(...COLORS.black);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    y = 94;

    const right = [
        ["Plot No", customer.plot_no],
        ["Plot Size", `${customer.plot_size || "-"} Sq.Yds`],
        ["Facing", customer.facing || "-"],
        ["Road Width", customer.road_width || "-"],
        ["Total Amount", money(customer.total_amount)],
    ];

    right.forEach(([k, v]) => {
        doc.setFont("helvetica", "bold");
        doc.text(k, 113, y);

        doc.setFont("helvetica", "normal");
        doc.text(String(v || "-"), 152, y);

        y += 8;
    });

}
function drawPayment(doc, customer, payment){

    const total = Number(customer.total_amount || 0);
    const paid = Number(customer.amount_paid || 0);
    const balance = total - paid;

    doc.setFont("helvetica","bold");
    doc.setTextColor(...COLORS.navy);
    doc.setFontSize(12);

    doc.text(
        "PAYMENT DETAILS",
        10,
        150
    );

    doc.setDrawColor(...COLORS.gold);

    doc.line(
        10,
        152,
        55,
        152
    );

    autoTable(doc,{

        startY:156,

        theme:"grid",

        head:[
            [
                "Description",
                "Value"
            ]
        ],

        body:[

            [
                "Total Plot Amount",
                money(total)
            ],

            [
                "Amount Paid",
                money(paid)
            ],

            [
                "Current Payment",
                money(payment.amount)
            ],

            [
                "Balance Amount",
                money(balance)
            ],

            [
                "Payment Mode",
                payment.payment_mode || "-"
            ],

            [
                "Payment Date",
                date(payment.payment_date)
            ],

            [
                "Transaction ID",
                payment.transaction_id || "-"
            ],

            [
                "Remarks",
                payment.remarks || "-"
            ]

        ],

        headStyles:{
            fillColor:COLORS.navy,
            textColor:[255,255,255],
            halign:"center",
            fontStyle:"bold",
            fontSize:10
        },

        styles:{
            fontSize:9,
            cellPadding:3.5,
            lineColor:COLORS.border,
            lineWidth:0.25,
            textColor:COLORS.black
        },

        alternateRowStyles:{
            fillColor:[250,250,250]
        },

        columnStyles:{
            0:{
                fontStyle:"bold",
                cellWidth:70
            },

            1:{
                cellWidth:110,
                halign:"right"
            }
        },

        didParseCell(data){

            if(
                data.section==="body" &&
                data.row.index===3
            ){

                data.cell.styles.fillColor=[255,248,230];
                data.cell.styles.fontStyle="bold";
                data.cell.styles.textColor=[200,30,30];

            }

        }

    });

    const y=doc.lastAutoTable.finalY+8;
        doc.setFillColor(...COLORS.navy);

    doc.roundedRect(
        118,
        y,
        82,
        30,
        3,
        3,
        "F"
    );

    doc.setTextColor(255,255,255);

    doc.setFont("helvetica","bold");

    doc.setFontSize(11);

    doc.text(
        "BALANCE",
        159,
        y+9,
        {
            align:"center"
        }
    );

    doc.setFontSize(16);

    doc.text(
        money(balance),
        159,
        y+21,
        {
            align:"center"
        }
    );

    doc.setFontSize(8);

    doc.text(
        "Outstanding Amount",
        159,
        y+27,
        {
            align:"center"
        }
    );

    return y+38;

}
// =============================
// FOOTER
// =============================

function drawFooter(doc, startY) {

    let y = startY;

    // -------------------------
    // Declaration
    // -------------------------

    doc.setFillColor(255,252,245);
    doc.setDrawColor(...COLORS.gold);

    doc.roundedRect(
        10,
        y,
        190,
        24,
        3,
        3,
        "FD"
    );

    doc.setFont("helvetica","bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.navy);

    doc.text(
        "Declaration",
        15,
        y+7
    );

    doc.setFont("helvetica","normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.black);

    const declaration =
        "This is a computer generated receipt issued by R DREAM INFRA DEVELOPERS. Please preserve this receipt for future reference.";

    doc.text(
        doc.splitTextToSize(declaration,175),
        15,
        y+13
    );

    y += 35;

    // -------------------------
    // QR
    // -------------------------

    try{
        doc.addImage(qr,"PNG",15,y,28,28);
    }catch(e){}

    doc.setFontSize(8);

    doc.text(
        "Scan QR",
        19,
        y+33
    );

    // -------------------------
    // Stamp
    // -------------------------

    try{
        doc.addImage(
            stamp,
            "PNG",
            84,
            y-2,
            32,
            32
        );
    }catch(e){}

    doc.text(
        "Company Stamp",
        81,
        y+33
    );

    // -------------------------
    // Signature
    // -------------------------

    try{
        doc.addImage(
            signature,
            "PNG",
            148,
            y+2,
            34,
            18
        );
    }catch(e){}

    doc.line(
        145,
        y+24,
        190,
        y+24
    );

    doc.setFont("helvetica","bold");

    doc.text(
        "Authorized Signature",
        149,
        y+30
    );

    // -------------------------
    // Bottom Footer
    // -------------------------

    doc.setFillColor(...COLORS.navy);

    doc.rect(
        6,
        276,
        198,
        15,
        "F"
    );

    doc.setTextColor(255,255,255);

    doc.setFont("helvetica","bold");
    doc.setFontSize(9);

    doc.text(
        COMPANY.name,
        10,
        282
    );

    doc.setFont("helvetica","normal");
    doc.setFontSize(7);

    doc.text(
        `Phone : ${COMPANY.phone}`,
        10,
        287
    );

    doc.text(
        COMPANY.email,
        70,
        287
    );

    doc.text(
        COMPANY.website,
        125,
        287
    );

    doc.text(
        "Computer Generated Receipt",
        196,
        287,
        {
            align:"right"
        }
    );

}
// =========================================
// MAIN FUNCTION
// =========================================

export function printReceipt(customer, payment) {

    const doc = new jsPDF({
        orientation:"portrait",
        unit:"mm",
        format:"a4"
    });

    drawHeader(doc);

    drawCustomer(doc, customer);

    const footerY = drawPayment(
        doc,
        customer,
        payment
    );

    drawFooter(doc, footerY);

    const filename =
        `Receipt_${customer.plot_no || "Plot"}_${(customer.name || "Customer")
            .replace(/\s+/g,"_")}.pdf`;

    doc.save(filename);

}