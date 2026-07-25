import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./CustomerDetails.css";

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);

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

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .or(`plot_no.eq.${id},mobile.eq.${id},name.ilike.%${id}%`);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      setCustomer(data[0]);
    } else {
      setCustomer(null);
    }

    setLoading(false);
  }

  const openEdit = () => {
    if (!customer) return;

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
      console.error(error);
      return;
    }

    setCustomer(formData);
    setShowEdit(false);

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
          Back to Dashboard
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

      <div className="info-grid">

        <div className="info-card">
          <label>Plot Number</label>
          <p>{customer.plot_no}</p>
        </div>

        <div className="info-card">
          <label>Facing</label>
          <p>{customer.facing}</p>
        </div>

        <div className="info-card">
          <label>Mobile</label>
          <p>{customer.mobile}</p>
        </div>

        <div className="info-card">
          <label>Plot Size</label>
          <p>{customer.plot_size} Sq.Yds</p>
        </div>

      </div>

      <hr />

      <h3>Payment Information</h3>

      <div className="payment-grid">

        <div className="info-card">
          <label>Total Amount</label>
          <p>₹{Number(customer.total_amount || 0).toLocaleString()}</p>
        </div>

        <div className="info-card">
          <label>Amount Paid</label>
          <p>₹{Number(customer.amount_paid || 0).toLocaleString()}</p>
        </div>

        <div className="info-card">
          <label>Balance</label>
          <p>₹{Number(customer.balance || 0).toLocaleString()}</p>
        </div>

        <div className="info-card">
          <label>Booking Date</label>
          <p>{customer.booking_date}</p>
        </div>

      </div>

      <div className="action-buttons">

        <button onClick={openEdit}>
          ✏ Edit Customer
        </button>

        <button>
          💰 Add Payment
        </button>

        <button>
          🖨 Print Receipt
        </button>

      </div>

    </div>

    {showEdit && (

      <div className="modal-overlay">

        <div className="edit-modal">

          <h2>Edit Customer</h2>

          <input
            type="text"
            placeholder="Name"
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
            placeholder="Mobile"
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

  </div>
);

}

export default CustomerDetails;