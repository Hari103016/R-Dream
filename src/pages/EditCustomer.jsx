import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./EditCustomer.css";

function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    plot_no: "",
    plot_size: "",
    facing: "East",
    status: "Available",
    total_amount: "",
    amount_paid: "",
    balance: "",
    booking_date: "",
  });

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
      alert("Customer not found.");
      navigate("/dashboard");
      return;
    }

    setFormData(data);
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    const updated = {
      ...formData,
      [name]: value,
    };

    if (name === "total_amount") {
      updated.balance =
        Number(value || 0) -
        Number(updated.amount_paid || 0);
    }

    if (name === "amount_paid") {
      updated.balance =
        Number(updated.total_amount || 0) -
        Number(value || 0);
    }

    setFormData(updated);
  }

  async function updateCustomer(e) {
    e.preventDefault();

    const { error } = await supabase
      .from("customers")
      .update(formData)
      .eq("id", id);

    if (error) {
      alert("Failed to update customer.");
      return;
    }

    alert("Customer updated successfully.");

    navigate(`/customer/${formData.plot_no}`);
  }

  if (loading) {
    return (
      <div className="edit-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="edit-page">

      <div className="edit-card">

        <h1>Edit Customer</h1>

        <form onSubmit={updateCustomer}>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Customer Name"
            required
          />

          <input
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Mobile Number"
            required
          />

          <input
            name="plot_no"
            value={formData.plot_no}
            onChange={handleChange}
            placeholder="Plot Number"
            required
          />

          <input
            type="number"
            name="plot_size"
            value={formData.plot_size}
            onChange={handleChange}
            placeholder="Plot Size"
          />

          <select
            name="facing"
            value={formData.facing}
            onChange={handleChange}
          >
            <option>East</option>
            <option>West</option>
            <option>North</option>
            <option>South</option>
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option>Available</option>
            <option>Booked</option>
            <option>Sold</option>
          </select>

          <input
            type="number"
            name="total_amount"
            value={formData.total_amount}
            onChange={handleChange}
            placeholder="Total Amount"
          />

          <input
            type="number"
            name="amount_paid"
            value={formData.amount_paid}
            onChange={handleChange}
            placeholder="Amount Paid"
          />

          <input
            type="number"
            name="balance"
            value={formData.balance}
            readOnly
          />

          <input
            type="date"
            name="booking_date"
            value={formData.booking_date}
            onChange={handleChange}
          />

          <div className="button-group">

            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
            >
              Save Changes
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditCustomer;