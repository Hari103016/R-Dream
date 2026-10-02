import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Download,
  User,
  Phone,
  Calendar,
  IndianRupee,
  BadgeCheck,
  Clock3,
  Eye,
  ArrowLeft,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { supabase } from "../services/supabase";
import "./Bookings.css";

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

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status) {
  return String(status || "Booked")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function Bookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let data = [...bookings];

    const query = search.trim().toLowerCase();

    if (query) {
      data = data.filter((customer) => {
        const name = String(customer.name || "").toLowerCase();
        const mobile = String(customer.mobile || "");
        const plot = String(customer.plot_no || "");

        return (
          name.includes(query) ||
          mobile.includes(search.trim()) ||
          plot.includes(search.trim())
        );
      });
    }

    if (statusFilter !== "All") {
      data = data.filter(
        (customer) => customer.status === statusFilter
      );
    }

    if (paymentFilter === "Paid") {
      data = data.filter(
        (customer) => Number(customer.balance || 0) === 0
      );
    }

    if (paymentFilter === "Pending") {
      data = data.filter(
        (customer) => Number(customer.balance || 0) > 0
      );
    }

    if (dateFilter) {
      data = data.filter(
        (customer) => customer.booking_date === dateFilter
      );
    }

    setFilteredBookings(data);
  }, [
    bookings,
    search,
    statusFilter,
    paymentFilter,
    dateFilter,
  ]);

  async function fetchBookings() {
    try {
      setLoading(true);

      const [
        { data: customerData, error: customerError },
        { data: paymentData, error: paymentError },
      ] = await Promise.all([
        supabase
          .from("customers")
          .select("*")
          .order("booking_date", { ascending: false }),

        supabase
          .from("payments")
          .select("customer_id, amount"),
      ]);

      if (customerError) throw customerError;
      if (paymentError) throw paymentError;

      const paidByCustomer = new Map();

      (customerData || []).forEach((customer) => {
        paidByCustomer.set(customer.id, 0);
      });

      (paymentData || []).forEach((payment) => {
        if (payment.customer_id == null) return;

        paidByCustomer.set(
          payment.customer_id,
          (paidByCustomer.get(payment.customer_id) || 0) +
            Number(payment.amount || 0)
        );
      });

      const normalized = (customerData || []).map((customer) =>
        getCanonicalCustomerFinancials(
          customer,
          paidByCustomer.get(customer.id)
        )
      );

      setBookings(normalized);
      setFilteredBookings(normalized);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const totalBookings = bookings.length;

    const totalCollection = bookings.reduce(
      (sum, customer) =>
        sum + Number(customer.amount_paid || 0),
      0
    );

    const totalBalance = bookings.reduce(
      (sum, customer) =>
        sum + Number(customer.balance || 0),
      0
    );

    const pendingPayments = bookings.filter(
      (customer) => Number(customer.balance || 0) > 0
    ).length;

    const completedBookings = bookings.filter(
      (customer) => customer.status === "Sold"
    ).length;

    return {
      totalBookings,
      totalCollection,
      totalBalance,
      pendingPayments,
      completedBookings,
    };
  }, [bookings]);

  function exportExcel() {
    const rows = filteredBookings.map((customer) => ({
      "Customer Name": customer.name,
      "Plot No": customer.plot_no,
      Mobile: customer.mobile,
      "Booking Date": customer.booking_date,
      "Amount Paid": customer.amount_paid,
      Balance: customer.balance,
      Status: customer.status,
      Registration: customer.registration_status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Bookings"
    );

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Bookings_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setDateFilter("");
  }

  return (
    <div className="bookings-page bookings-unique-page">

      <section className="booking-hero">
        <div className="booking-hero-content">
          <div className="booking-kicker">
            R DREAM INFRA DEVELOPERS
          </div>

          <div className="booking-heading-row">
            <button
              type="button"
              className="booking-back-btn"
              onClick={() => navigate(-1)}
              title="Go back"
            >
              <ArrowLeft size={17} />
            </button>

            <div>
              <h1>Bookings</h1>
              <p>
                Track every plot booking, payment and customer commitment
                from one place.
              </p>
            </div>
          </div>

          <div className="booking-hero-meta">
            <span className="live-indicator" />
            LIVE BOOKING DATABASE
            <b>{bookings.length} records</b>
          </div>
        </div>

        <div className="booking-hero-art" aria-hidden="true">
          <div className="art-ring ring-one" />
          <div className="art-ring ring-two" />
          <div className="art-block block-one" />
          <div className="art-block block-two" />
          <div className="art-block block-three" />
          <div className="art-line line-one" />
          <div className="art-line line-two" />
        </div>
      </section>

      <section className="booking-overview">
        <div className="section-caption">
          <span>BOOKING OVERVIEW</span>
          <i />
        </div>

        <div className="booking-stat-grid">
          <article className="booking-stat-card blue">
            <div className="booking-stat-icon">
              <User size={21} />
            </div>
            <div>
              <span>Total Bookings</span>
              <strong>{stats.totalBookings}</strong>
              <small>All customer bookings</small>
            </div>
            <b className="stat-corner">01</b>
          </article>

          <article className="booking-stat-card green">
            <div className="booking-stat-icon">
              <IndianRupee size={21} />
            </div>
            <div>
              <span>Total Collected</span>
              <strong>₹{formatMoney(stats.totalCollection)}</strong>
              <small>Payments received</small>
            </div>
            <b className="stat-corner">02</b>
          </article>

          <article className="booking-stat-card gold">
            <div className="booking-stat-icon">
              <Clock3 size={21} />
            </div>
            <div>
              <span>Pending Payments</span>
              <strong>{stats.pendingPayments}</strong>
              <small>Customers with balance</small>
            </div>
            <b className="stat-corner">03</b>
          </article>

          <article className="booking-stat-card purple">
            <div className="booking-stat-icon">
              <BadgeCheck size={21} />
            </div>
            <div>
              <span>Completed</span>
              <strong>{stats.completedBookings}</strong>
              <small>Fully paid bookings</small>
            </div>
            <b className="stat-corner">04</b>
          </article>
        </div>
      </section>

      <section className="booking-filter-panel">
        <div className="section-caption">
          <span>SEARCH & FILTER BOOKINGS</span>
          <i />
        </div>

        <div className="booking-filter-grid">
          <label className="booking-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search customer, plot number or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <label className="booking-select-wrap">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Booked">Booked</option>
              <option value="Sold">Sold</option>
              <option value="Available">Available</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          <label className="booking-select-wrap">
            <span>Payment</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </label>

          <label className="booking-date-wrap">
            <span>Date</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="booking-refresh-btn"
            onClick={fetchBookings}
            title="Refresh"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            className="booking-export-btn"
            onClick={exportExcel}
          >
            <Download size={16} />
            Export
          </button>

          <button
            type="button"
            className="booking-clear-btn"
            onClick={clearFilters}
            title="Clear filters"
          >
            <SlidersHorizontal size={16} />
            Clear
          </button>
        </div>
      </section>

      <section className="booking-records">
        <div className="booking-record-header">
          <div>
            <div className="record-eyebrow">CUSTOMER BOOKING REGISTER</div>
            <h2>Booking Records</h2>
            <p>
              Showing <strong>{filteredBookings.length}</strong> of{" "}
              <strong>{bookings.length}</strong> records
            </p>
          </div>

          <div className="record-live">
            <span />
            LIVE DATA
          </div>
        </div>

        {loading ? (
          <div className="booking-empty">
            <div className="booking-spinner" />
            <h3>Loading bookings</h3>
            <p>Fetching the latest customer and payment records.</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="booking-empty">
            <div className="empty-booking-icon">
              <Calendar size={28} />
            </div>
            <h3>No bookings found</h3>
            <p>Try changing your search or filters.</p>
            <button
              type="button"
              className="booking-clear-main"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="booking-table-scroll">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plot</th>
                  <th>Mobile</th>
                  <th>Booking Date</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Registration</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((customer, index) => {
                  const balance = Number(customer.balance || 0);
                  const paid = Number(customer.amount_paid || 0);
                  const isPaid = balance === 0;

                  return (
                    <tr key={customer.id}>
                      <td>
                        <div className="booking-customer">
                          <div className={`booking-avatar avatar-${(index % 6) + 1}`}>
                            {customer.name
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}
                          </div>
                          <div>
                            <strong>{customer.name || "Unknown"}</strong>
                            <small>
                              Customer ID · {String(customer.id).slice(0, 8)}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="booking-plot">
                          #{customer.plot_no ?? "—"}
                        </span>
                      </td>

                      <td>
                        <div className="booking-contact">
                          <Phone size={14} />
                          {customer.mobile || "—"}
                        </div>
                      </td>

                      <td>
                        <div className="booking-contact date">
                          <Calendar size={14} />
                          {formatDate(customer.booking_date)}
                        </div>
                      </td>

                      <td>
                        <span className="booking-money paid">
                          ₹{formatMoney(paid)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`booking-money ${
                            isPaid ? "clear" : "balance"
                          }`}
                        >
                          ₹{formatMoney(balance)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`booking-status ${statusClass(
                            customer.status
                          )}`}
                        >
                          <i />
                          {customer.status || "Booked"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`booking-registration ${
                            customer.registration_status === "Completed"
                              ? "completed"
                              : "pending"
                          }`}
                        >
                          {customer.registration_status || "Pending"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="booking-view-btn"
                          onClick={() =>
                            navigate(`/customer/${customer.id}`)
                          }
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Bookings;
