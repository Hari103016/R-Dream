import { useEffect, useState } from "react";
import { CalendarDays, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../services/supabase";

import "./TodaysBookings.css";

function TodaysBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysBookings();
  }, []);

  async function fetchTodaysBookings() {
    try {
      setLoading(true);

      const today = new Date();

      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

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
        .gte(
          "booking_date",
          startOfDay.toISOString()
        )
        .lte(
          "booking_date",
          endOfDay.toISOString()
        )
        .order("booking_date", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Today's Bookings Error:",
          error
        );

        setBookings([]);
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error(
        "Today's Bookings Error:",
        error
      );

      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  function formatAmount(amount) {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  }

  function getStatusClass(status) {
    const value =
      status?.toLowerCase() || "";

    if (value.includes("complete")) {
      return "completed";
    }

    if (value.includes("cancel")) {
      return "cancelled";
    }

    if (value.includes("sold")) {
      return "sold";
    }

    return "booked";
  }

  return (
    <div className="todays-bookings">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="today-bookings-header">

        <div className="today-bookings-title">

          <div className="today-bookings-icon">
            <CalendarDays size={21} />
          </div>

          <div>
            <h2>Today's Bookings</h2>

            <p>
              Bookings scheduled for today
            </p>
          </div>

        </div>

        <button
          className="today-refresh-btn"
          onClick={fetchTodaysBookings}
          title="Refresh bookings"
        >
          <RefreshCw size={17} />
        </button>

      </div>

      {/* ==========================================
          LOADING
      ========================================== */}

      {loading ? (
        <div className="today-bookings-loading">

          <div className="today-spinner"></div>

          <span>
            Loading today's bookings...
          </span>

        </div>
      ) : bookings.length === 0 ? (

        /* ========================================
           EMPTY
        ======================================== */

        <div className="today-bookings-empty">

          <div className="today-empty-icon">
            <CalendarDays size={25} />
          </div>

          <h3>No Bookings Today</h3>

          <p>
            There are no bookings scheduled
            for today.
          </p>

        </div>
      ) : (

        /* ========================================
           BOOKINGS
        ======================================== */

        <div className="today-bookings-list">

          {bookings.map((booking) => (

            <div
              className="today-booking-item"
              key={booking.id}
            >

              {/* Customer */}

              <div className="today-customer">

                <div className="today-avatar">
                  {booking.name
                    ?.charAt(0)
                    ?.toUpperCase() || "C"}
                </div>

                <div className="today-customer-info">

                  <h3>
                    {booking.name ||
                      "Unknown Customer"}
                  </h3>

                  <p>
                    {booking.mobile ||
                      "No mobile number"}
                  </p>

                </div>

              </div>

              {/* Plot */}

              <div className="today-booking-column">

                <span className="today-label">
                  Plot
                </span>

                <strong>
                  #{booking.plot_no || "-"}
                </strong>

              </div>

              {/* Booking Amount */}

              <div className="today-booking-column">

                <span className="today-label">
                  Booking Amount
                </span>

                <strong className="booking-amount">
                  {formatAmount(
                    booking.total_amount
                  )}
                </strong>

              </div>

              {/* Status */}

              <div className="today-booking-column">

                <span className="today-label">
                  Status
                </span>

                <span
                  className={`today-status ${getStatusClass(
                    booking.status
                  )}`}
                >
                  {booking.status ||
                    "Booked"}
                </span>

              </div>

              {/* View */}

              <button
                className="today-view-btn"
                onClick={() =>
                  navigate(
                    `/customer/${booking.id}`
                  )
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

    </div>
  );
}

export default TodaysBookings;