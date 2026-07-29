import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function PaymentHistory({ customerId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      fetchPayments();
    }
  }, [customerId]);

  async function fetchPayments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("customer_id", customerId)
      .order("payment_date", { ascending: false });

    if (error) {
      console.error("Payment Fetch Error:", error);
      setPayments([]);
    } else {
      console.log("Payments:", data);
      setPayments(data || []);
    }

    setLoading(false);
  }

  if (loading) {
    return <p>Loading payment history...</p>;
  }

  return (
    <div className="payment-history">

      <h2>Payment History</h2>

      <table className="payment-table">

        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Mode</th>
            <th>Remarks</th>
          </tr>
        </thead>

        <tbody>

          {payments.length === 0 ? (

            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No Payments Found
              </td>
            </tr>

          ) : (

            payments.map((payment) => (

              <tr key={payment.id}>

                <td>
                  {new Date(
                    payment.payment_date
                  ).toLocaleDateString("en-IN")}
                </td>

                <td>
                  ₹{Number(payment.amount).toLocaleString("en-IN")}
                </td>

                <td>
                  {payment.payment_mode}
                </td>

                <td>
                  {payment.remarks || "-"}
                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}

export default PaymentHistory;