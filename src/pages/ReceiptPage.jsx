import { useLocation } from "react-router-dom";
import Receipt from "../components/Receipt";

export default function ReceiptPage() {
  const { state } = useLocation();

  if (!state) {
    return <h2>No receipt data found.</h2>;
  }

  return (
    <Receipt
      customer={state.customer}
      payment={state.payment}
    />
  );
}