import { useEffect, useState } from "react";
import { CalendarDays, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "./TodaysBookings.css";

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

function TodaysBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  async function fetchTodaysBookings({ isRetry = false } = {}) {
    if (isRetry) {
      setRetrying(true);
    } else if (bookings.length > 0) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

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
          `)
          .gte("booking_date", startOfDay.toISOString())
          .lte("booking_date", endOfDay.toISOString())
          .order("booking_date", {
            ascending: false,
          }),
        supabase
          .from("payments")
          .select("customer_id, amount"),
      ]);

      if (customerError) {
        throw new Error(
          `Customers: ${
            customerError.message || "Unable to load today's bookings"
          }`
        );
      }

      if (paymentError) {
        throw new Error(
          `Payments: ${
            paymentError.message || "Unable to load payment data"
          }`
        );
      }

      const paidByCustomer = buildPaidMap(paymentData);

      const normalized = (customerData || []).map((customer) =>
        getCanonicalCustomerFinancials(
          customer,
          paidByCustomer.get(customer.id)
        )
      );

      setBookings(normalized);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Today's Bookings Error:", error);

      setErrorMessage(
        error?.message ||
          "Unable to load today's bookings. Please try again."
      );
    } finally {
      setLoading(false);
      setRetrying(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchTodaysBookings();

    const channel = supabase
      .channel("todays-bookings-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
        },
        () => fetchTodaysBookings()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customers",
        },
        () => fetchTodaysBookings()
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn(
            "Today's Bookings realtime channel error."
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function formatAmount(amount) {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  }

  function formatUpdatedTime(date) {
    if (!date) return "";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function getStatusClass(status) {
    const value = status?.toLowerCase() || "";

    if (value.includes("cancel")) return "cancelled";
    if (value.includes("sold")) return "sold";
    if (value.includes("complete")) return "completed";

    return "booked";
  }

  return (
    <div className="todays-bookings">
      <div className="today-bookings-header">
        <div className="today-bookings-title">
          <div className="today-bookings-icon">
            <CalendarDays size={21} />
          </div>

          <div>
            <h2>Today's Bookings</h2>
            <p>Bookings scheduled for today</p>

            {lastUpdated && !errorMessage && (
              <span className="today-bookings-updated">
                Last updated: {formatUpdatedTime(lastUpdated)}
                {refreshing && " • Refreshing..."}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          className={`today-refresh-btn ${
            refreshing ? "is-refreshing" : ""
          }`}
          onClick={() => fetchTodaysBookings()}
          title="Refresh bookings"
          disabled={refreshing || retrying}
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {errorMessage && (
        <div className="today-bookings-alert" role="alert">
          <div className="today-bookings-alert-icon">⚠️</div>

          <div className="today-bookings-alert-content">
            <strong>Unable to load today's bookings</strong>
            <span>{errorMessage}</span>
          </div>

          <button
            type="button"
            className="today-bookings-retry"
            onClick={() => fetchTodaysBookings({ isRetry: true })}
            disabled={retrying}
          >
            {retrying ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {loading && !bookings.length ? (
        <div className="today-bookings-loading">
          <div className="today-bookings-skeleton-item" />
          <div className="today-bookings-skeleton-item" />
          <div className="today-bookings-skeleton-item" />
        </div>
      ) : bookings.length === 0 ? (
        !errorMessage && (
          <div className="today-bookings-empty">
            <div className="today-empty-icon">
              <CalendarDays size={25} />
            </div>

            <h3>No Bookings Today</h3>
            <p>There are no bookings scheduled for today.</p>
          </div>
        )
      ) : (
        <div className="today-bookings-list">
          {bookings.map((booking) => (
            <div
              className="today-booking-item"
              key={booking.id}
            >
              <div className="today-customer">
                <div className="today-avatar">
                  {booking.name
                    ?.charAt(0)
                    ?.toUpperCase() || "C"}
                </div>

                <div className="today-customer-info">
                  <h3>
                    {booking.name || "Unknown Customer"}
                  </h3>

                  <p>
                    {booking.mobile || "No mobile number"}
                  </p>
                </div>
              </div>

              <div className="today-booking-column">
                <span className="today-label">Plot</span>
                <strong>#{booking.plot_no || "-"}</strong>
              </div>

              <div className="today-booking-column">
                <span className="today-label">
                  Booking Amount
                </span>

                <strong className="booking-amount">
                  {formatAmount(booking.total_amount)}
                </strong>
              </div>

              <div className="today-booking-column">
                <span className="today-label">Status</span>

                <span
                  className={`today-status ${getStatusClass(
                    booking.status
                  )}`}
                >
                  {booking.status || "Booked"}
                </span>
              </div>

              <button
                type="button"
                className="today-view-btn"
                onClick={() =>
                  navigate(`/customer/${booking.id}`)
                }
                title="View customer"
              >
                <Eye size={17} />
                <span>View</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {refreshing && bookings.length > 0 && (
        <div className="today-bookings-refresh-bar">
          Updating today's bookings...
        </div>
      )}
    </div>
  );
}

export default TodaysBookings;
