import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import AddPaymentModal from "../components/AddPaymentModal";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "./CustomerDetails.css";

import {
  User,
  Phone,
  MapPinned,
  Calendar,
  IndianRupee,
  CreditCard,
  Wallet,
  Receipt,
  ArrowLeft,
} from "lucide-react";

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
        .eq("id", id)
        .single();

      if (error) throw error;

      setCustomer(data);

      const { data: paymentData } = await supabase
        .from("payments")
        .select("*")
        .eq("customer_id", data.id)
        .order("payment_date", { ascending: false });

      setPayments(paymentData || []);
    } catch (err) {
      console.error(err);
      toast.error("Customer not found.");
      navigate("/customers");
      return;
    }

    setLoading(false);
  }

  function openEdit() {
    setFormData({
      ...customer,
    });

    setShowEdit(true);
  }

  async function saveCustomer() {
    const { error } = await supabase
      .from("customers")
      .update({
        name: formData.name,
        mobile: formData.mobile,
        plot_no: formData.plot_no,
        plot_size: formData.plot_size,
        facing: formData.facing,
        status: formData.status,
        total_amount: Number(formData.total_amount),
        amount_paid: Number(formData.amount_paid),
        balance: Number(formData.balance),
        booking_date: formData.booking_date,
      })
      .eq("id", customer.id);

    if (error) {
      toast.error(err.message || "Something went wrong");
      return;
    }

    setShowEdit(false);

    fetchCustomer();

    toast.success("Customer Updated Successfully");
  }

  async function deleteCustomer() {
    const result = await Swal.fire({
      title: "Delete Customer?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#2563eb",
    });

    if (!result.isConfirmed) return;

    try {
      // 1. Delete payment history
      const { error: paymentError } = await supabase
        .from("payments")
        .delete()
        .eq("customer_id", customer.id);

      if (paymentError) throw paymentError;

      // 2. Make the plot available again
      // 2. Make the plot available again
      const { error: plotError } = await supabase
        .from("plots")
        .update({
          status: "Available",
          customer_id: null,
        })
        .eq("customer_id", customer.id);

      if (plotError) throw plotError;

      // 3. Delete customer
      const { error: customerError } = await supabase
        .from("customers")
        .delete()
        .eq("id", customer.id);

      if (customerError) throw customerError;

      await Swal.fire({
        title: "Deleted!",
        text: "Customer deleted successfully.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      navigate("/plots", { replace: true });

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    }
  }

  if (loading) {
    return (
      <div className="customer-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  const total = Number(customer.total_amount || 0);
  const paid = Number(customer.amount_paid || 0);
  const balance = Number(customer.balance || 0);

  const percent =
    total === 0
      ? 0
      : Math.round((paid / total) * 100);

  return (
    <div className="customer-page">
            {/* ============================
          Header
      ============================= */}

      <div className="customer-header">

        <button
          className="back-btn"
          onClick={() => navigate("/customers")}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1>Customer Profile</h1>

      </div>

      {/* ============================
          Profile Card
      ============================= */}

      <div className="profile-card">

        <div className="profile-top">

          <div className="avatar">
            {customer.name
              ? customer.name.charAt(0).toUpperCase()
              : "C"}
          </div>

          <div className="profile-details">

            <h2>{customer.name}</h2>

            <p>
              Customer ID :
              <strong> #{customer.id}</strong>
            </p>

            <p>
              📱 {customer.mobile}
            </p>

            <p>
              🏡 Plot No :
              <strong> {customer.plot_no}</strong>
            </p>

            <p>
              📅 {customer.booking_date}
            </p>

            <span
              className={`status-badge ${customer.status
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {customer.status}
            </span>

          </div>

        </div>

        {/* ============================
            Summary Cards
        ============================= */}

        <div className="summary-grid">

          <div className="summary-card">

            <IndianRupee size={30} />

            <h4>Total Amount</h4>

            <h2>
              ₹{total.toLocaleString()}
            </h2>

          </div>

          <div className="summary-card paid">

            <Wallet size={30} />

            <h4>Amount Paid</h4>

            <h2>
              ₹{paid.toLocaleString()}
            </h2>

          </div>

          <div className="summary-card balance">

            <CreditCard size={30} />

            <h4>Balance</h4>

            <h2>
              ₹{balance.toLocaleString()}
            </h2>

          </div>

          <div className="summary-card">

            <Receipt size={30} />

            <h4>Total Payments</h4>

            <h2>
              {payments.length}
            </h2>

          </div>

        </div>

        {/* ============================
            Payment Progress
        ============================= */}

        <div className="progress-section">

          <div className="progress-header">

            <span>Payment Progress</span>

            <span>{percent}%</span>

          </div>

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width: `${percent}%`,
              }}
            />

          </div>

        </div>

      </div>

      {/* ============================
          Customer Information
      ============================= */}

      <div className="cd-info-grid">

        <div className="cd-info-card">
          <User className="card-icon" />
          <div className="card-content">
            <h4>Customer Name</h4>
            <p>{customer.name}</p>
          </div>
        </div>

        <div className="cd-info-card">
          <Phone className="card-icon" />
          <div className="card-content">
            <h4>Mobile Number</h4>
            <p>{customer.mobile}</p>
          </div>
        </div>

        <div className="cd-info-card">
          <MapPinned className="card-icon" />
          <div className="card-content">
            <h4>Plot Number</h4>
            <p>{customer.plot_no}</p>
          </div>
        </div>

        <div className="cd-info-card">
          <MapPinned className="card-icon" />
          <div className="card-content">
            <h4>Facing</h4>
            <p>{customer.facing}</p>
          </div>
        </div>

        <div className="cd-info-card">
          <MapPinned className="card-icon" />
          <div className="card-content">
            <h4>Plot Size</h4>
            <p>{customer.plot_size} Sq.Yds</p>
          </div>
        </div>

        <div className="cd-info-card">
          <Calendar className="card-icon" />
          <div className="card-content">
            <h4>Booking Date</h4>
            <p>{customer.booking_date}</p>
          </div>
        </div>

      </div>
            {/* ============================
          Action Buttons
      ============================= */}

      <div className="action-buttons">

        <button
          className="edit-btn"
          onClick={openEdit}
        >
          ✏ Edit Customer
        </button>

        <button
          className="payment-btn"
          onClick={() => setShowPayment(true)}
        >
          💰 Add Payment
        </button>

        <button
          className="receipt-btn"
          onClick={() =>
            navigate("/receipt", {
              state: {
                customer,
                payments,
              },
            })
          }
        >
          🖨 Print Receipt
        </button>

        <button
          className="delete-btn"
          onClick={deleteCustomer}
        >
          🗑 Delete Customer
        </button>

      </div>

      {/* ============================
          Payment History
      ============================= */}

      <div className="payment-history">

        <h2>Payment History</h2>

        <table className="payment-table">

          <thead>

            <tr>

              <th>Date</th>

              <th>Receipt No</th>

              <th>Amount</th>

              <th>Mode</th>

              <th>Remarks</th>

            </tr>

          </thead>

          <tbody>

            {payments.length === 0 ? (

              <tr>

                <td colSpan="5">
                  No Payments Found
                </td>

              </tr>

            ) : (

              payments.map((payment, index) => (

                <tr key={payment.id}>

                  <td>
                    {new Date(
                      payment.payment_date
                    ).toLocaleDateString("en-IN")}
                  </td>

                  <td>
                    RCPT-
                    {String(index + 1).padStart(4, "0")}
                  </td>

                  <td>
                    ₹
                    {Number(payment.amount).toLocaleString()}
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

      {/* ============================
          Booking Timeline
      ============================= */}

      <div className="timeline-section">

        <h2>Booking Timeline</h2>

        <div className="timeline">

          <div className="timeline-item">

            <div className="timeline-icon success">
              ✓
            </div>

            <div className="timeline-content">

              <h4>Plot Booked</h4>

              <p>
                {customer.booking_date}
              </p>

            </div>

          </div>

          <div className="timeline-item">

            <div className="timeline-icon paid">
              ₹
            </div>

            <div className="timeline-content">

              <h4>Advance Paid</h4>

              <p>
                ₹
                {Number(customer.amount_paid).toLocaleString()}
              </p>

            </div>

          </div>

          {Number(customer.balance) > 0 && (

            <div className="timeline-item">

              <div className="timeline-icon pending">
                !
              </div>

              <div className="timeline-content">

                <h4>Balance Pending</h4>

                <p>
                  ₹
                  {Number(customer.balance).toLocaleString()}
                </p>

              </div>

            </div>

          )}

          {Number(customer.balance) === 0 && (

            <div className="timeline-item">

              <div className="timeline-icon complete">
                ✓
              </div>

              <div className="timeline-content">

                <h4>Payment Completed</h4>

                <p>
                  Customer has cleared all dues.
                </p>

              </div>

            </div>

          )}

        </div>

      </div>
            {/* ============================
          Edit Customer Modal
      ============================= */}

      {showEdit && (
        <div className="modal-overlay">

          <div className="modal">

            <h2>Edit Customer</h2>

            <div className="form-grid">

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
                type="text"
                placeholder="Plot Size"
                value={formData.plot_size}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plot_size: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Facing"
                value={formData.facing}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    facing: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Total Amount"
                value={formData.total_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_amount: e.target.value,
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
                  })
                }
              />

              <input
                type="number"
                placeholder="Balance"
                value={formData.balance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    balance: e.target.value,
                  })
                }
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

            </div>

            <div className="modal-buttons">

              <button
                className="save-btn"
                onClick={saveCustomer}
              >
                Save Changes
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ============================
          Add Payment Modal
      ============================= */}

      {showPayment && (
        <AddPaymentModal
          customer={customer}
          onClose={() => {
            setShowPayment(false);
            fetchCustomer();
          }}
        />
      )}

    </div>
  );
}

export default CustomerDetails;