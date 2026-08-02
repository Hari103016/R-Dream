import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./PaymentReminders.css";

function PaymentReminders() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  async function fetchPendingPayments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .gt("balance", 0)
      .order("balance", { ascending: false });

    if (!error) {
      setCustomers(data);
    }

    setLoading(false);
  }

  function getColor(balance) {
    if (balance > 200000) return "high";
    if (balance > 50000) return "medium";
    return "low";
  }

  if (loading) {
    return (
      <div className="payment-reminders">
        <h2>Payment Reminders</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="payment-reminders">
      <div className="reminder-header">
        <h2>🔔 Payment Reminders</h2>
        <span>{customers.length} Pending</span>
      </div>

      {customers.length === 0 ? (
        <div className="empty-state">
          <p>🎉 No pending payments.</p>
        </div>
      ) : (
        customers.map((customer) => (
          <div
            key={customer.id}
            className={`reminder-card ${getColor(customer.balance)}`}
          >
            <div className="customer-info">
              <h3>{customer.name}</h3>

              <p>
                <strong>Plot:</strong> {customer.plot_no}
              </p>

              <p>
                <strong>Mobile:</strong> {customer.mobile}
              </p>

              <p>
                <strong>Paid:</strong> ₹
                {Number(customer.amount_paid).toLocaleString("en-IN")}
              </p>

              <p className="balance">
                Balance : ₹
                {Number(customer.balance).toLocaleString("en-IN")}
              </p>
            </div>

            <button
              className="collect-btn"
              onClick={() => navigate(`/customer/${customer.id}`)}
            >
              Collect Payment
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default PaymentReminders;