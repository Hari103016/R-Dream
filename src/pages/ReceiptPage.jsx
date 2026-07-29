import { useLocation } from "react-router-dom";
import Receipt from "../components/Receipt";

export default function ReceiptPage() {
  const { state } = useLocation();

  if (!state) {
    return <h2>No Receipt Data</h2>;
  }

  return (
    <Receipt
      customer={state.customer}
      payments={state.payments || []}
    />
  );
}