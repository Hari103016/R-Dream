import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import AddPaymentModal from "../components/AddPaymentModal";

import "./CustomerDetails.css";

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    plot_no: "",
    plot_size: "",
    facing: "",
    status: "",
    total_amount: "",
    amount_paid: "",
    balance: "",
    booking_date: "",
  });

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  async function fetchCustomer() {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .or(`id.eq.${id},plot_no.eq.${id}`);

      if (error) throw error;

      if (!data || data.length === 0) {
        setCustomer(null);
        setPayments([]);
        setLoading(false);
        return;
      }

      const selectedCustomer = data[0];
      setCustomer(selectedCustomer);

      const { data: paymentData } = await supabase
        .from("payments")
        .select("*")
        .eq("customer_id", selectedCustomer.id)
        .order("payment_date", { ascending: false });

      setPayments(paymentData || []);
    } catch (err) {
      console.error(err);
      setCustomer(null);
      setPayments([]);
    }

    setLoading(false);
  }

  const openEdit = () => {
    setFormData({
      ...customer,
    });

    setShowEdit(true);
  };

  const saveCustomer = async () => {
    const { error } = await supabase
      .from("customers")
      .update({
        name: formData.name,
        mobile: formData.mobile,
        plot_no: formData.plot_no,
        plot_size: formData.plot_size,
        facing: formData.facing,
        status: formData.status,
        total_amount: formData.total_amount,
        amount_paid: formData.amount_paid,
        balance: formData.balance,
        booking_date: formData.booking_date,
      })
      .eq("id", customer.id);

    if (error) {
      alert("Failed to update customer.");
      return;
    }

    setShowEdit(false);
    fetchCustomer();

    alert("Customer updated successfully.");
  };

  if (loading) {
    return (
      <div className="customer-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="customer-page">
        <h2>Customer Not Found</h2>

        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="customer-page">

      <div className="header">

        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Back
        </button>

        <h1>👤 Customer Profile</h1>

      </div>

      <div className="profile-card">

        <div className="profile-top">

          <div>

            <h2>{customer.name}</h2>

            <span className="status">
              {customer.status}
            </span>

          </div>

        </div>

        {/* Customer Information */}

        <div className="customer-info-grid">

          <div className="customer-info-card">
            <label>Plot Number</label>
            <p>{customer.plot_no}</p>
          </div>

          <div className="customer-info-card">
            <label>Facing</label>
            <p>{customer.facing}</p>
          </div>

          <div className="customer-info-card">
            <label>Mobile</label>
            <p>{customer.mobile}</p>
          </div>

          <div className="customer-info-card">
            <label>Plot Size</label>
            <p>{customer.plot_size} Sq.Yds</p>
          </div>

        </div>

        <hr />

        <h3>Payment Information</h3>

        <div className="customer-payment-grid">

          <div className="customer-info-card">
            <label>Total Amount</label>
            <p>
              ₹{Number(customer.total_amount).toLocaleString()}
            </p>
          </div>

          <div className="customer-info-card">
            <label>Amount Paid</label>
            <p>
              ₹{Number(customer.amount_paid).toLocaleString()}
            </p>
          </div>

          <div className="customer-info-card">
            <label>Balance</label>
            <p>
              ₹{Number(customer.balance).toLocaleString()}
            </p>
          </div>

          <div className="customer-info-card">
            <label>Booking Date</label>
            <p>{customer.booking_date}</p>
          </div>

        </div>

        <div className="action-buttons">

          <button onClick={openEdit}>
            ✏ Edit Customer
          </button>

          <button onClick={() => setShowPayment(true)}>
            💰 Add Payment
          </button>

          <button
            onClick={() =>
              navigate("/receipt", {
                state: {
                  customer,
                  payment:
                    payments.length > 0
                      ? payments[0]
                      : null,
                },
              })
            }
          >
            🖨 Print Receipt
          </button>

        </div>

        <hr />
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
                <td colSpan="4">
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
                    ₹{Number(payment.amount).toLocaleString()}
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

        {showEdit && (

          <div className="modal-overlay">

            <div className="edit-modal">

              <h2>Edit Customer</h2>

              <input
                type="text"
                placeholder="Customer Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mobile: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Plot Number"
                value={formData.plot_no}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plot_no: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Plot Size"
                value={formData.plot_size}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plot_size: e.target.value,
                  })
                }
              />

              <select
                value={formData.facing}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    facing: e.target.value,
                  })
                }
              >
                <option>East</option>
                <option>West</option>
                <option>North</option>
                <option>South</option>
              </select>

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value,
                  })
                }
              >
                <option>Available</option>
                <option>Booked</option>
                <option>Sold</option>
              </select>

              <input
                type="number"
                placeholder="Total Amount"
                value={formData.total_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_amount: e.target.value,
                    balance:
                      Number(e.target.value) -
                      Number(formData.amount_paid),
                  })
                }
              />

              <input
                type="number"
                placeholder="Amount Paid"
                value={formData.amount_paid}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount_paid: e.target.value,
                    balance:
                      Number(formData.total_amount) -
                      Number(e.target.value),
                  })
                }
              />

              <input
                type="number"
                value={formData.balance}
                readOnly
              />

              <input
                type="date"
                value={formData.booking_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    booking_date: e.target.value,
                  })
                }
              />

              <div className="modal-buttons">

                <button
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>

                <button
                  onClick={saveCustomer}
                >
                  Save Changes
                </button>

              </div>

            </div>

          </div>

        )}

        {showPayment && (

          <AddPaymentModal
            customer={customer}
            onClose={() => setShowPayment(false)}
            onSuccess={fetchCustomer}
          />

        )}

      </div>

    </div>

  );
}

export default CustomerDetails;