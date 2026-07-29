import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Receipt,
  User,
  IndianRupee,
  Calendar,
  CreditCard,
} from "lucide-react";
import { supabase } from "../services/supabase";
import "./Payments.css";

function Payments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        customers (
          id,
          name,
          plot_no
        )
      `)
      .order("payment_date", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPayments(data || []);
    }

    setLoading(false);
  }

  const filteredPayments = payments.filter((payment) => {
    const customerName =
      payment.customers?.name?.toLowerCase() || "";

    const plot =
      payment.customers?.plot_no?.toString() || "";

    return (
      customerName.includes(search.toLowerCase()) ||
      plot.includes(search)
    );
  });

  return (
    <div className="payments-page">

      <div className="payments-header">

        <h2>Payments</h2>

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search Customer / Plot"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>

      {loading ? (
        <h3>Loading...</h3>
      ) : filteredPayments.length === 0 ? (
        <h3>No Payments Found</h3>
      ) : (

        <table className="payment-table">

          <thead>

            <tr>

              <th>Receipt</th>
              <th>Customer</th>
              <th>Plot</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Date</th>
              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {filteredPayments.map((payment, index) => (

              <tr key={payment.id}>

                <td>

                  <Receipt size={16} />

                  RCPT-
                  {String(index + 1).padStart(4, "0")}

                </td>

                <td>

                  <User size={16} />

                  {payment.customers?.name}

                </td>

                <td>

                  {payment.customers?.plot_no}

                </td>

                <td>

                  <IndianRupee size={16} />

                  {Number(payment.amount).toLocaleString("en-IN")}

                </td>

                <td>

                  <CreditCard size={16} />

                  {payment.payment_mode}

                </td>

                <td>

                  <Calendar size={16} />

                  {payment.payment_date}

                </td>

                <td>

                  <button
                    className="view-btn"
                    onClick={() =>
                      navigate(`/customer/${payment.customer_id}`)
                    }
                  >
                    View
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>
  );
}

export default Payments;