import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "../services/supabase";

/*
=====================================================
GENERATE RECEIPT PDF
=====================================================
*/

async function generateReceiptPDF(
  receiptRef,
  fileName = "Payment_Receipt.pdf"
) {
  if (!receiptRef?.current) {
    throw new Error("Receipt element not found.");
  }

  const receiptElement = receiptRef.current;

  /*
  =====================================================
  CAPTURE RECEIPT
  =====================================================
  */

  const canvas = await html2canvas(
    receiptElement,
    {
      scale: 2,

      useCORS: true,

      allowTaint: false,

      backgroundColor: "#ffffff",

      logging: false,

      imageTimeout: 15000,

      scrollX: 0,

      scrollY: -window.scrollY,

      windowWidth:
        receiptElement.scrollWidth,

      windowHeight:
        receiptElement.scrollHeight,
    }
  );

  const imgData =
    canvas.toDataURL(
      "image/jpeg",
      0.95
    );

  /*
  =====================================================
  CREATE EXACT A4 PDF
  =====================================================
  */

  const pdf = new jsPDF({
    orientation: "portrait",

    unit: "mm",

    format: "a4",

    compress: true,
  });

  /*
  =====================================================
  A4 DIMENSIONS
  =====================================================
  */

  const pdfWidth =
    pdf.internal.pageSize.getWidth();

  const pdfHeight =
    pdf.internal.pageSize.getHeight();

  /*
  =====================================================
  FORCE RECEIPT TO FULL A4
  =====================================================

  No margins.
  No white space.
  Full width.
  Full height.
  */

  const imageX = 0;

  const imageY = 0;

  const imageWidth =
    pdfWidth;

  const imageHeight =
    pdfHeight;

  /*
  =====================================================
  ADD RECEIPT
  =====================================================
  */

  pdf.addImage(
    imgData,

    "JPEG",

    imageX,

    imageY,

    imageWidth,

    imageHeight,

    undefined,

    "MEDIUM"
  );

  /*
  =====================================================
  RETURN PDF
  =====================================================
  */

  const pdfBlob =
    pdf.output("blob");

  const pdfFile =
    new File(
      [pdfBlob],

      fileName,

      {
        type:
          "application/pdf",
      }
    );

  return {
    blob: pdfBlob,

    file: pdfFile,
  };
}

/*
=====================================================
DOWNLOAD RECEIPT
=====================================================
*/

export async function downloadReceipt(
  receiptRef,
  fileName = "Payment_Receipt.pdf"
) {
  const { blob } =
    await generateReceiptPDF(
      receiptRef,
      fileName
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    fileName;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/*
=====================================================
SHARE RECEIPT
=====================================================
*/

export async function shareReceipt(
  receiptRef,
  customerMobile,
  customerName = "Customer",
  fileName = "Payment_Receipt.pdf"
) {
  /*
  =====================================================
  GENERATE SAME FULL-A4 PDF
  =====================================================
  */

  const { file } =
    await generateReceiptPDF(
      receiptRef,
      fileName
    );

  /*
  =====================================================
  CLEAN MOBILE NUMBER
  =====================================================
  */

  let mobile =
    String(customerMobile || "")
      .replace(/\D/g, "");

  /*
  9876543210
  ->
  919876543210
  */

  if (mobile.length === 10) {
    mobile =
      `91${mobile}`;
  }

  /*
  09876543210
  ->
  919876543210
  */

  else if (
    mobile.startsWith("0") &&
    mobile.length === 11
  ) {
    mobile =
      `91${mobile.slice(1)}`;
  }

  /*
  Already:
  919876543210
  */

  else if (
    mobile.startsWith("91") &&
    mobile.length === 12
  ) {
    // Already correct
  }

  /*
  =====================================================
  VALIDATE MOBILE
  =====================================================
  */

  if (
    mobile.length !== 12 ||
    !mobile.startsWith("91")
  ) {
    throw new Error(
      "Please enter a valid Indian customer mobile number."
    );
  }

  /*
  =====================================================
  UPLOAD PDF TO SUPABASE
  =====================================================
  */

  /*
  Remove unsafe characters from filename.
  */

  const safeFileName =
    fileName.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

  /*
  Create a folder using the receipt filename.

  Example:

  receipts/
    Payment_Receipt_RD-85/
      Payment_Receipt_RD-85.pdf
  */

  const filePath =
    `${safeFileName.replace(
      ".pdf",
      ""
    )}/${safeFileName}`;

  console.log(
    "Uploading receipt:",
    filePath
  );

  const {
    data: uploadData,
    error: uploadError,
  } =
    await supabase.storage
      .from("receipts")
      .upload(
        filePath,

        file,

        {
          contentType:
            "application/pdf",

          /*
          Replace existing PDF
          if the same receipt is sent again.
          */

          upsert: true,

          cacheControl:
            "3600",
        }
      );

  /*
  =====================================================
  CHECK UPLOAD ERROR
  =====================================================
  */

  if (uploadError) {
    console.error(
      "Supabase upload error:",
      uploadError
    );

    throw new Error(
      `Unable to upload receipt PDF: ${uploadError.message}`
    );
  }

  console.log(
    "Receipt uploaded successfully:",
    uploadData
  );

  /*
  =====================================================
  GET PUBLIC PDF URL
  =====================================================
  */

  const {
    data: publicUrlData,
  } =
    supabase.storage
      .from("receipts")
      .getPublicUrl(
        filePath
      );

  const pdfUrl =
    publicUrlData?.publicUrl;

  /*
  =====================================================
  CHECK PDF URL
  =====================================================
  */

  if (!pdfUrl) {
    throw new Error(
      "Unable to create receipt PDF link."
    );
  }

  console.log(
    "Receipt PDF URL:",
    pdfUrl
  );

  /*
  =====================================================
  WHATSAPP MESSAGE
  =====================================================
  */

  const message =
`🏠 R DREAM INFRA DEVELOPERS

Dear ${customerName || "Customer"},

Please find your payment receipt below.

📄 Payment Receipt:
${pdfUrl}

Thank you for choosing
R DREAM INFRA DEVELOPERS.`;

  /*
  =====================================================
  OPEN CUSTOMER'S WHATSAPP
  =====================================================
  */

  const whatsappUrl =
    `https://wa.me/${mobile}` +
    `?text=${encodeURIComponent(
      message
    )}`;

  window.open(
    whatsappUrl,

    "_blank",

    "noopener,noreferrer"
  );

  /*
  =====================================================
  RETURN SUCCESS
  =====================================================
  */

  return {
    success: true,

    method:
      "whatsapp-link",

    pdfUrl,

    filePath,

    mobile,
  };
}

/*
=====================================================
DEFAULT EXPORT
=====================================================
*/

export default downloadReceipt;