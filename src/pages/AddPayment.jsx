import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import { toast } from "react-toastify";
import "./AddPayment.css";

function AddPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [payment, setPayment] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [paymentMode, setPaymentMode] = useState("Cash");
  const [remarks, setRemarks] = useState("");

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
      toast.error("Customer not found");
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
      toast.warning("Enter a valid payment amount");
      return;
    }

    if (amount > Number(customer.balance)) {
      toast.warning("Payment cannot exceed the remaining balance");
      return;
    }

    const newPaid = Number(customer.amount_paid) + amount;
    const newBalance = Number(customer.total_amount) - newPaid;

    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        customer_id: customer.id,
        amount,
        payment_mode: paymentMode,
        remarks,
        payment_date: paymentDate,
      });

    if (paymentError) {
      console.error(paymentError);
      toast.error(paymentError.message);
      return;
    }

    const { error: customerError } = await supabase
      .from("customers")
      .update({
        amount_paid: newPaid,
        balance: newBalance,
      })
      .eq("id", customer.id);

    if (customerError) {
      console.error(customerError);
      toast.error("Payment update failed");
      return;
    }

    toast.success("Payment Added Successfully");

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

          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
          </select>

          <textarea
            placeholder="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
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