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

function getCanonicalCustomerFinancials(customer, totalPaidOverride) {
  const total = Number(customer?.total_amount || 0);
  const paid = Number(
    totalPaidOverride ?? customer?.amount_paid ?? 0
  );
  const balance = Math.max(total - paid, 0);

  if (total > 0) {
    const completed = paid >= total;

    return {
      ...customer,
      amount_paid: paid,
      balance,
      status: completed ? "Sold" : "Booked",
      registration_status: completed ? "Completed" : "Pending",
    };
  }

  return {
    ...customer,
    amount_paid: paid,
    balance,
    status: customer?.status || "Booked",
    registration_status:
      customer?.registration_status || "Pending",
  };
}

function buildPaidMap(payments) {
  const paidByCustomer = new Map();

  (payments || []).forEach((payment) => {
    const customerId = payment.customer_id;
    if (customerId == null) return;

    paidByCustomer.set(
      customerId,
      (paidByCustomer.get(customerId) || 0) +
        Number(payment.amount || 0)
    );
  });

  return paidByCustomer;
}

function PaymentReminders() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  async function fetchPaymentReminders({ isRetry = false } = {}) {
    if (isRetry) {
      setRetrying(true);
    } else if (customers.length > 0) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    try {
      const [
        { data: customerData, error: customerError },
        { data: paymentData, error: paymentError },
      ] = await Promise.all([
        supabase
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
            registration_status,
            booking_date
          `),
        supabase
          .from("payments")
          .select("customer_id, amount"),
      ]);

      if (customerError) {
        throw new Error(
          `Customers: ${
            customerError.message ||
            "Unable to load customers"
          }`
        );
      }

      if (paymentError) {
        throw new Error(
          `Payments: ${
            paymentError.message ||
            "Unable to load payment data"
          }`
        );
      }

      const paidByCustomer = buildPaidMap(paymentData);

      const normalized = (customerData || [])
        .map((customer) =>
          getCanonicalCustomerFinancials(
            customer,
            paidByCustomer.get(customer.id)
          )
        )
        .filter(
          (customer) => Number(customer.balance || 0) > 0
        )
        .sort(
          (a, b) =>
            Number(b.balance || 0) -
            Number(a.balance || 0)
        )
        .slice(0, 8);

      setCustomers(normalized);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        "Payment Reminder Error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to load payment reminders. Please try again."
      );
    } finally {
      setLoading(false);
      setRetrying(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchPaymentReminders();

    const channel = supabase
      .channel("payment-reminders-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
        },
        () => fetchPaymentReminders()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customers",
        },
        () => fetchPaymentReminders()
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn(
            "Payment Reminders realtime channel error."
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function formatAmount(amount) {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  }

  function formatUpdatedTime(date) {
    if (!date) return "";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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
      <div className="payment-reminders-header">
        <div className="payment-reminders-title">
          <div className="payment-reminders-icon">
            <Wallet size={21} />
          </div>

          <div>
            <h2>Payment Reminders</h2>
            <p>Customers with pending payments</p>

            {lastUpdated && !errorMessage && (
              <span className="payment-reminders-updated">
                Last updated:{" "}
                {formatUpdatedTime(lastUpdated)}
                {refreshing && " • Refreshing..."}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          className={`payment-refresh-btn ${
            refreshing ? "is-refreshing" : ""
          }`}
          onClick={() => fetchPaymentReminders()}
          title="Refresh payment reminders"
          disabled={refreshing || retrying}
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {errorMessage && (
        <div
          className="payment-reminders-alert"
          role="alert"
        >
          <div className="payment-reminders-alert-icon">
            ⚠️
          </div>

          <div className="payment-reminders-alert-content">
            <strong>
              Unable to load payment reminders
            </strong>
            <span>{errorMessage}</span>
          </div>

          <button
            type="button"
            className="payment-reminders-retry"
            onClick={() =>
              fetchPaymentReminders({ isRetry: true })
            }
            disabled={retrying}
          >
            {retrying ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {loading && !customers.length ? (
        <div className="payment-reminders-loading">
          <div className="payment-reminders-skeleton-item" />
          <div className="payment-reminders-skeleton-item" />
          <div className="payment-reminders-skeleton-item" />
        </div>
      ) : customers.length === 0 ? (
        !errorMessage && (
          <div className="payment-reminders-empty">
            <div className="payment-empty-icon">
              <Wallet size={25} />
            </div>

            <h3>No Pending Payments</h3>

            <p>
              All customer payments are up to date.
            </p>
          </div>
        )
      ) : (
        <div className="payment-reminder-list">
          {customers.map((customer) => {
            const priority = getPriority(
              customer.balance
            );

            return (
              <div
                className="payment-reminder-item"
                key={customer.id}
              >
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

                <div className="payment-balance">
                  <span className="payment-label">
                    Pending
                  </span>

                  <strong>
                    {formatAmount(customer.balance)}
                  </strong>
                </div>

                <div className="payment-due">
                  <span className="payment-label">
                    Date
                  </span>

                  <span>
                    {getDueText(customer)}
                  </span>
                </div>

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

                <div className="payment-actions">
                  <button
                    type="button"
                    className="quick-payment-btn"
                    onClick={() =>
                      navigate(
                        `/customer/${customer.id}`
                      )
                    }
                    title="Make payment"
                  >
                    <CreditCard size={16} />
                    <span>Payment</span>
                  </button>

                  <button
                    type="button"
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

      {refreshing && customers.length > 0 && (
        <div className="payment-reminders-refresh-bar">
          Updating payment reminders...
        </div>
      )}
    </div>
  );
}

export default PaymentReminders;
