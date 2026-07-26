import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default async function downloadReceipt(receiptRef) {
  const receipt = receiptRef.current;

  if (!receipt) return;

  const canvas = await html2canvas(receipt, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  pdf.save(`Receipt-${Date.now()}.pdf`);
}