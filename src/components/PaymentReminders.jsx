import { useEffect, useState } from "react";
import {
  Wallet,
  Eye,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../services/supabase";

import "./PaymentReminders.css";

function PaymentReminders() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentReminders();
  }, []);

  async function fetchPaymentReminders() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("customers")
        .select(`
          id,
          name,
          mobile,
          plot_no,
          total_amount,
          amount_paid,
          balance,
          status,
          booking_date
        `)
        .gt("balance", 0)
        .order("balance", {
          ascending: false,
        })
        .limit(8);

      if (error) {
        console.error(
          "Payment Reminder Error:",
          error
        );

        setCustomers([]);
        return;
      }

      setCustomers(data || []);
    } catch (error) {
      console.error(
        "Payment Reminder Error:",
        error
      );

      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  function formatAmount(amount) {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  }

  function getPriority(balance) {
    const amount = Number(balance || 0);

    if (amount >= 100000) {
      return {
        label: "High",
        className: "high",
      };
    }

    if (amount >= 50000) {
      return {
        label: "Medium",
        className: "medium",
      };
    }

    return {
      label: "Low",
      className: "low",
    };
  }

  function getDueText(customer) {
    if (!customer.booking_date) {
      return "No due date";
    }

    const bookingDate = new Date(
      customer.booking_date
    );

    if (Number.isNaN(bookingDate.getTime())) {
      return "No due date";
    }

    return `Booked ${bookingDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    )}`;
  }

  return (
    <div className="payment-reminders">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="payment-reminders-header">

        <div className="payment-reminders-title">

          <div className="payment-reminders-icon">
            <Wallet size={21} />
          </div>

          <div>
            <h2>Payment Reminders</h2>

            <p>
              Customers with pending payments
            </p>
          </div>

        </div>

        <button
          className="payment-refresh-btn"
          onClick={fetchPaymentReminders}
          title="Refresh payment reminders"
        >
          <RefreshCw size={17} />
        </button>

      </div>

      {/* ==========================================
          LOADING
      ========================================== */}

      {loading ? (
        <div className="payment-reminders-loading">

          <div className="payment-spinner"></div>

          <span>
            Loading payment reminders...
          </span>

        </div>
      ) : customers.length === 0 ? (

        /* ========================================
           EMPTY
        ======================================== */

        <div className="payment-reminders-empty">

          <div className="payment-empty-icon">
            <Wallet size={25} />
          </div>

          <h3>No Pending Payments</h3>

          <p>
            All customer payments are up to date.
          </p>

        </div>
      ) : (

        /* ========================================
           REMINDERS
        ======================================== */

        <div className="payment-reminder-list">

          {customers.map((customer) => {

            const priority =
              getPriority(
                customer.balance
              );

            return (
              <div
                className="payment-reminder-item"
                key={customer.id}
              >

                {/* Customer */}

                <div className="payment-customer">

                  <div className="payment-avatar">
                    {customer.name
                      ?.charAt(0)
                      ?.toUpperCase() || "C"}
                  </div>

                  <div className="payment-customer-info">

                    <h3>
                      {customer.name ||
                        "Unknown Customer"}
                    </h3>

                    <p>
                      Plot #
                      {customer.plot_no || "-"}
                    </p>

                  </div>

                </div>

                {/* Balance */}

                <div className="payment-balance">

                  <span className="payment-label">
                    Pending
                  </span>

                  <strong>
                    {formatAmount(
                      customer.balance
                    )}
                  </strong>

                </div>

                {/* Due */}

                <div className="payment-due">

                  <span className="payment-label">
                    Date
                  </span>

                  <span>
                    {getDueText(customer)}
                  </span>

                </div>

                {/* Priority */}

                <div className="payment-priority">

                  <span className="payment-label">
                    Priority
                  </span>

                  <span
                    className={`priority-badge ${priority.className}`}
                  >
                    {priority.label}
                  </span>

                </div>

                {/* Actions */}

                <div className="payment-actions">

                  <button
                    className="quick-payment-btn"
                    onClick={() =>
                      navigate(
                        `/customer/${customer.id}`
                      )
                    }
                    title="Make payment"
                  >
                    <CreditCard size={16} />

                    <span>
                      Payment
                    </span>
                  </button>

                  <button
                    className="payment-view-btn"
                    onClick={() =>
                      navigate(
                        `/customer/${customer.id}`
                      )
                    }
                    title="View customer"
                  >
                    <Eye size={16} />
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default PaymentReminders;