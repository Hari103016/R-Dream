import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./AddPayment.css";

function AddPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [payment, setPayment] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchCustomer();
  }, []);

  async function fetchCustomer() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert("Customer not found");
      navigate("/dashboard");
      return;
    }

    setCustomer(data);
  }

  async function savePayment(e) {
    e.preventDefault();

    if (!customer) return;

    const amount = Number(payment);

    if (isNaN(amount) || amount <= 0) {
      alert("Enter a valid payment amount");
      return;
    }

    if (amount > Number(customer.balance)) {
      alert("Payment cannot exceed the remaining balance");
      return;
    }

    const newPaid = Number(customer.amount_paid) + amount;
    const newBalance = Number(customer.total_amount) - newPaid;

    const { error } = await supabase
      .from("customers")
      .update({
        amount_paid: newPaid,
        balance: newBalance,
      })
      .eq("id", customer.id);

    if (error) {
      console.error(error);
      alert("Payment update failed");
      return;
    }

    alert("Payment Added Successfully");

    navigate(`/customer/${customer.id}`);
  }

  if (!customer) {
    return (
      <div className="payment-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h1>Add Payment</h1>

        <form onSubmit={savePayment}>
          <input value={customer.name} disabled />
          <input value={customer.plot_no} disabled />
          <input value={customer.total_amount} disabled />
          <input value={customer.amount_paid} disabled />
          <input value={customer.balance} disabled />

          <input
            type="number"
            placeholder="Payment Amount"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            required
          />

          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />

          <div className="buttons">
            <button
              type="button"
              className="cancel"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>

            <button type="submit" className="save">
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPayment;