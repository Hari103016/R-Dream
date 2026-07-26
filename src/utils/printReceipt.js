import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import logo from "../assets/logo.png";
import qr from "../assets/qr.png";
import stamp from "../assets/stamp.png";
import signature from "../assets/signature.png";

/* ===========================
   COMPANY DETAILS
=========================== */

const COMPANY = {
  name: "R DREAM INFRA DEVELOPERS",
  project: "DTCP Approved Open Plots",
  location: "Konyapalem Venture",
  district: "NTR District",
  phone: "+91 XXXXXXXXXX",
  email: "info@rdreaminfra.com",
  website: "www.rdreaminfra.com",
};

/* ===========================
   COLORS
=========================== */

const COLORS = {
  navy: [15, 36, 67],
  gold: [203, 168, 84],
  white: [255, 255, 255],
  black: [40, 40, 40],
  gray: [110, 110, 110],
  border: [220, 220, 220],
  light: [248, 249, 252],
  green: [16, 185, 129],
  red: [220, 38, 38],
  orange: [245, 158, 11],
};

/* ===========================
   HELPERS
=========================== */

function money(value) {
  return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function receiptNumber(payment) {
  return (
    payment?.receipt_number ||
    `RD-${new Date().getFullYear()}-${Date.now()
      .toString()
      .slice(-6)}`
  );
}

/* ===========================
   WATERMARK
=========================== */

function drawWatermark(doc) {
  doc.saveGraphicsState();

  doc.setGState(new doc.GState({ opacity: 0.06 }));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(60);
  doc.setTextColor(150);

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
}

/* ===========================
   HEADER
=========================== */

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
  doc.setFontSize(20);

  doc.text(
    COMPANY.name,
    42,
    18
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  doc.text(
    COMPANY.project,
    42,
    25
  );

  doc.text(
    `${COMPANY.location}, ${COMPANY.district}`,
    42,
    31
  );

  doc.setDrawColor(...COLORS.gold);
  doc.line(42, 34, 150, 34);

  doc.setFontSize(7);

  doc.text(
    `Phone : ${COMPANY.phone}`,
    42,
    39
  );

  doc.text(
    COMPANY.email,
    95,
    39
  );

  // Receipt Badge

  doc.setFillColor(...COLORS.gold);

  doc.roundedRect(
    158,
    10,
    38,
    26,
    2,
    2,
    "F"
  );

  doc.setTextColor(...COLORS.navy);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text(
    "PAYMENT",
    177,
    18,
    { align: "center" }
  );

  doc.text(
    "RECEIPT",
    177,
    25,
    { align: "center" }
  );

  // Receipt Number

  doc.setFillColor(35, 35, 35);

  doc.roundedRect(
    148,
    50,
    50,
    16,
    2,
    2,
    "F"
  );

  doc.setTextColor(255,255,255);

  doc.setFontSize(7);

  doc.text(
    "Receipt No.",
    152,
    56
  );

  doc.setFontSize(8);

  doc.text(
    receiptNumber(payment),
    152,
    62
  );

  // Date Box

  doc.setFillColor(245,248,255);

  doc.setDrawColor(...COLORS.border);

  doc.roundedRect(
    10,
    50,
    42,
    16,
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
    56
  );

  doc.setFont("helvetica","normal");
  doc.setFontSize(8);

  doc.text(
    formatDate(new Date()),
    14,
    62
  );

  drawWatermark(doc);
}
/* ===========================================
   COMMON INFO ROW
=========================================== */

function infoRow(doc, label, value, x1, x2, y) {

    doc.setFont("helvetica","bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.black);

    doc.text(label, x1, y);

    doc.setFont("helvetica","normal");
    doc.setTextColor(...COLORS.gray);

    doc.text(
        value ? String(value) : "-",
        x2,
        y
    );

}

/* ===========================================
   STATUS BADGE
=========================================== */

function statusBadge(doc,status,x,y){

    let color=COLORS.green;
    let text="BOOKED";

    switch((status || "").toLowerCase()){

        case "available":
            color=COLORS.green;
            text="AVAILABLE";
            break;

        case "reserved":
            color=COLORS.orange;
            text="RESERVED";
            break;

        case "sold":
            color=COLORS.red;
            text="SOLD";
            break;

        default:
            color=COLORS.green;
            text=status || "BOOKED";

    }

    doc.setFillColor(...color);

    doc.roundedRect(
        x,
        y-5,
        30,
        8,
        2,
        2,
        "F"
    );

    doc.setTextColor(255,255,255);

    doc.setFont("helvetica","bold");
    doc.setFontSize(8);

    doc.text(
        text.toUpperCase(),
        x+15,
        y,
        {
            align:"center"
        }
    );

}

/* ===========================================
   CUSTOMER + PLOT SECTION
=========================================== */

function drawCustomer(doc,customer){

    //----------------------------------------------------
    // Customer Card
    //----------------------------------------------------

    doc.setFillColor(...COLORS.light);
    doc.setDrawColor(...COLORS.border);

    doc.roundedRect(
        10,
        75,
        92,
        64,
        3,
        3,
        "FD"
    );

    doc.setFillColor(...COLORS.navy);

    doc.roundedRect(
        10,
        75,
        92,
        12,
        3,
        3,
        "F"
    );

    doc.setTextColor(255,255,255);

    doc.setFont("helvetica","bold");
    doc.setFontSize(11);

    doc.text(
        "CUSTOMER INFORMATION",
        15,
        83
    );

    let y=96;

    infoRow(doc,"Customer",customer.name,15,45,y);

    y+=9;

    infoRow(doc,"Mobile",customer.phone,15,45,y);

    y+=9;

    infoRow(doc,"Email",customer.email || "-",15,45,y);

    y+=9;

    infoRow(
        doc,
        "Booking",
        formatDate(customer.booking_date),
        15,
        45,
        y
    );

    y+=9;

    infoRow(
        doc,
        "Executive",
        customer.sales_executive || "Admin",
        15,
        45,
        y
    );

    y+=9;

    doc.setFont("helvetica","bold");

    doc.setTextColor(...COLORS.black);

    doc.text("Status",15,y);

    statusBadge(
        doc,
        customer.status,
        45,
        y
    );

    //----------------------------------------------------
    // Plot Card
    //----------------------------------------------------

    doc.setFillColor(...COLORS.light);

    doc.roundedRect(
        108,
        75,
        92,
        64,
        3,
        3,
        "FD"
    );

    doc.setFillColor(...COLORS.navy);

    doc.roundedRect(
        108,
        75,
        92,
        12,
        3,
        3,
        "F"
    );

    doc.setTextColor(255,255,255);

    doc.setFont("helvetica","bold");
    doc.setFontSize(11);

    doc.text(
        "PLOT INFORMATION",
        113,
        83
    );

    y=96;

    infoRow(
        doc,
        "Plot No",
        customer.plot_no,
        113,
        152,
        y
    );

    y+=9;

    infoRow(
        doc,
        "Size",
        `${customer.plot_size || "-"} Sq.Yds`,
        113,
        152,
        y
    );

    y+=9;

    infoRow(
        doc,
        "Facing",
        customer.facing || "-",
        113,
        152,
        y
    );

    y+=9;

    infoRow(
        doc,
        "Road",
        customer.road_width || "-",
        113,
        152,
        y
    );

    y+=9;

    infoRow(
        doc,
        "Location",
        customer.location || "Konyapalem",
        113,
        152,
        y
    );

    y+=11;

    //----------------------------------------------------
    // Total Amount Highlight
    //----------------------------------------------------

    doc.setFillColor(250,248,240);

    doc.roundedRect(
        112,
        y-6,
        84,
        12,
        2,
        2,
        "F"
    );

    doc.setFont("helvetica","bold");
    doc.setFontSize(10);

    doc.setTextColor(...COLORS.navy);

    doc.text(
        "TOTAL",
        116,
        y+1
    );

    doc.setFontSize(12);

    doc.text(
        money(customer.total_amount),
        192,
        y+1,
        {
            align:"right"
        }
    );

    //----------------------------------------------------
    // Decorative Divider
    //----------------------------------------------------

    doc.setDrawColor(...COLORS.gold);

    doc.setLineWidth(0.5);

    doc.line(
        10,
        147,
        200,
        147
    );

}
/* ===========================================
   PAYMENT SECTION
=========================================== */

function drawPayment(doc, customer, payment) {

    const total = Number(customer.total_amount || 0);
    const paid = Number(customer.amount_paid || 0);
    const current = Number(payment.amount || 0);

    const balance = total - paid;

    //---------------------------------------------------
    // Title
    //---------------------------------------------------

    doc.setFont("helvetica","bold");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.navy);

    doc.text(
        "PAYMENT SUMMARY",
        10,
        157
    );

    doc.setDrawColor(...COLORS.gold);
    doc.line(10,160,60,160);

    //---------------------------------------------------
    // Payment Table
    //---------------------------------------------------

    autoTable(doc,{

        startY:165,

        theme:"grid",

        head:[
            [
                "DESCRIPTION",
                "DETAILS"
            ]
        ],

        body:[

            [
                "Total Plot Amount",
                money(total)
            ],

            [
                "Amount Paid Till Date",
                money(paid)
            ],

            [
                "Current Payment",
                money(current)
            ],

            [
                "Outstanding Balance",
                money(balance)
            ],

            [
                "Payment Mode",
                payment.payment_mode || "-"
            ],

            [
                "Transaction ID",
                payment.transaction_id || "-"
            ],

            [
                "Payment Date",
                formatDate(payment.payment_date)
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

            cellPadding:4,

            lineColor:COLORS.border,

            lineWidth:0.25,

            textColor:COLORS.black

        },

        alternateRowStyles:{

            fillColor:[250,250,250]

        },

        columnStyles:{

            0:{
                cellWidth:70,
                fontStyle:"bold"
            },

            1:{
                cellWidth:110,
                halign:"right"
            }

        },

        didParseCell(data){

            // Highlight balance row

            if(
                data.section==="body" &&
                data.row.index===3
            ){

                data.cell.styles.fillColor=[255,248,230];

                data.cell.styles.fontStyle="bold";

                data.cell.styles.textColor=[210,40,40];

            }

        }

    });

    //---------------------------------------------------
    // Progress
    //---------------------------------------------------

    let progress=0;

    if(total>0){

        progress=(paid/total)*100;

    }

    progress=Math.min(progress,100);

    let y=doc.lastAutoTable.finalY+8;

    doc.setFont("helvetica","bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.navy);

    doc.text(
        "Payment Progress",
        10,
        y
    );

    y+=6;

    doc.setFillColor(230,230,230);

    doc.roundedRect(
        10,
        y,
        92,
        8,
        4,
        4,
        "F"
    );

    doc.setFillColor(...COLORS.green);

    doc.roundedRect(

        10,

        y,

        (92*progress)/100,

        8,

        4,

        4,

        "F"

    );

    doc.setFont("helvetica","bold");

    doc.setFontSize(8);

    doc.setTextColor(...COLORS.black);

    doc.text(

        `${progress.toFixed(1)} % Paid`,

        106,

        y+6

    );

    //---------------------------------------------------
    // Balance Card
    //---------------------------------------------------

    const cardX=118;
    const cardY=doc.lastAutoTable.finalY+3;

    let status="PENDING";
    let badgeColor=COLORS.red;

    if(balance<=0){

        status="PAID";

        badgeColor=COLORS.green;

    }

    else if(paid>0){

        status="PARTIALLY PAID";

        badgeColor=COLORS.orange;

    }

    doc.setFillColor(...COLORS.navy);

    doc.roundedRect(

        cardX,

        cardY,

        82,

        45,

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

        cardY+9,

        {

            align:"center"

        }

    );

    doc.setFontSize(20);

    doc.text(

        money(balance),

        159,

        cardY+23,

        {

            align:"center"

        }

    );

    doc.setFillColor(...badgeColor);

    doc.roundedRect(

        135,

        cardY+30,

        48,

        9,

        3,

        3,

        "F"

    );

    doc.setFontSize(8);

    doc.text(

        status,

        159,

        cardY+36,

        {

            align:"center"

        }

    );

    //---------------------------------------------------
    // Safe Footer Position
    //---------------------------------------------------

    return Math.max(

        y+18,

        cardY+50

    );

}
/* ===========================================
   FOOTER
=========================================== */

function drawFooter(doc, startY, payment) {

    let y = Math.min(startY, 205);

    // If footer won't fit, continue on new page
    if (y > 220) {
        doc.addPage();
        drawHeader(doc, payment);
        y = 40;
    }

    //----------------------------------------
    // Declaration
    //----------------------------------------

    doc.setFillColor(255,252,245);
    doc.setDrawColor(...COLORS.gold);

    doc.roundedRect(
        10,
        y,
        190,
        30,
        3,
        3,
        "FD"
    );

    doc.setFont("helvetica","bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.navy);

    doc.text(
        "DECLARATION",
        15,
        y+7
    );

    doc.setFont("helvetica","normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.black);

    const declaration =
        "This is a computer generated receipt issued by R DREAM INFRA DEVELOPERS. Please preserve this receipt for future reference. Payments are subject to the booking agreement.";

    doc.text(
        doc.splitTextToSize(
            declaration,
            175
        ),
        15,
        y+13
    );

    //----------------------------------------
    // QR + Stamp + Signature
    //----------------------------------------

    y += 38;

    try{
        doc.addImage(
            qr,
            "PNG",
            15,
            y,
            22,
            22
        );
    }catch(e){}

    doc.setFontSize(8);
    doc.text(
        "Scan QR",
        18,
        y+27
    );

    try{
        doc.addImage(
            stamp,
            "PNG",
            88,
            y,
            24,
            24
        );
    }catch(e){}

    doc.text(
        "Company Stamp",
        82,
        y+27
    );

    try{
        doc.addImage(
            signature,
            "PNG",
            150,
            y+3,
            30,
            12
        );
    }catch(e){}

    doc.line(
        145,
        y+18,
        190,
        y+18
    );

    doc.setFont("helvetica","bold");

    doc.text(
        "Authorized Signature",
        148,
        y+24
    );

    //----------------------------------------
    // Bottom Footer
    //----------------------------------------

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
        126,
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

/* ===========================================
   MAIN FUNCTION
=========================================== */

export function printReceipt(customer, payment) {

    const doc = new jsPDF({
        orientation:"portrait",
        unit:"mm",
        format:"a4"
    });

    drawHeader(doc, payment);

    drawCustomer(doc, customer);

    const footerY = drawPayment(
        doc,
        customer,
        payment
    );

    drawFooter(
        doc,
        footerY,
        payment
    );

    const fileName =
        `Receipt_${customer.plot_no || "Plot"}_${(customer.name || "Customer")
            .replace(/\s+/g,"_")}.pdf`;

    doc.save(fileName);
}