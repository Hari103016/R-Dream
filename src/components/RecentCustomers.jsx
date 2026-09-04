import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "./RecentCustomers.css";

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

function RecentCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchCustomers({ isRetry = false } = {}) {
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
          .select("*")
          .order("id", { ascending: false }),
        supabase
          .from("payments")
          .select("customer_id, amount"),
      ]);

      if (customerError) {
        throw new Error(
          `Customers: ${customerError.message || "Unable to load customers"}`
        );
      }

      if (paymentError) {
        throw new Error(
          `Payments: ${paymentError.message || "Unable to load payment data"}`
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
        .slice(0, 8);

      setCustomers(normalized);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Recent Customers Error:", error);

      setErrorMessage(
        error?.message ||
          "Unable to load recent customers. Please try again."
      );
    } finally {
      setLoading(false);
      setRetrying(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchCustomers();

    const channel = supabase
      .channel("recent-customers-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
        },
        () => fetchCustomers({ isRetry: false })
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customers",
        },
        () => fetchCustomers({ isRetry: false })
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn(
            "Recent Customers realtime channel error."
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function formatUpdatedTime(date) {
    if (!date) return "";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <div className="recent-customers">
      <div className="recent-customers-header">
        <div>
          <h2>👥 Recent Customers</h2>

          {lastUpdated && !errorMessage && (
            <div className="recent-customers-updated">
              Last updated: {formatUpdatedTime(lastUpdated)}
              {refreshing && (
                <span className="recent-customers-refreshing">
                  {" "}• Refreshing...
                </span>
              )}
            </div>
          )}
        </div>

        {refreshing && (
          <span className="recent-customers-refreshing-indicator">
            Refreshing...
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="recent-customers-alert" role="alert">
          <div className="recent-customers-alert-icon">⚠️</div>

          <div className="recent-customers-alert-content">
            <strong>Unable to load recent customers</strong>
            <span>{errorMessage}</span>
          </div>

          <button
            type="button"
            className="recent-customers-retry"
            onClick={() => fetchCustomers({ isRetry: true })}
            disabled={retrying}
          >
            {retrying ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {loading && !customers.length ? (
        <div className="recent-customers-loading">
          <div className="recent-customers-loading-row" />
          <div className="recent-customers-loading-row" />
          <div className="recent-customers-loading-row" />
          <div className="recent-customers-loading-row" />
          <div className="recent-customers-loading-row" />
        </div>
      ) : customers.length > 0 ? (
        <div className="recent-customers-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Plot No</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Total Amount</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.plot_no}</td>
                  <td>{customer.name}</td>
                  <td>{customer.mobile}</td>
                  <td>
                    <span
                      className={`status ${
                        customer.status?.toLowerCase() || "booked"
                      }`}
                    >
                      {customer.status || "Booked"}
                    </span>
                  </td>
                  <td>
                    ₹
                    {Number(
                      customer.total_amount || 0
                    ).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !errorMessage && (
          <div className="recent-customers-empty">
            <div className="recent-customers-empty-icon">👥</div>
            <strong>No recent customers</strong>
            <span>
              Customer records will appear here after registration.
            </span>
          </div>
        )
      )}

      {refreshing && customers.length > 0 && (
        <div className="recent-customers-refresh-bar">
          Updating customer data...
        </div>
      )}
    </div>
  );
}

export default RecentCustomers;
