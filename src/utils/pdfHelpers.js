// src/utils/pdfHelpers.js

export const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

export const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN");
};

export const generateReceiptNumber = () => {
  return "RD-" + Date.now().toString().slice(-6);
};