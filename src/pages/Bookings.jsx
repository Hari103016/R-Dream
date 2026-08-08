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
} from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { supabase } from "../services/supabase";

import "./Bookings.css";

function Bookings() {
  const navigate = useNavigate();

  /* ===========================================
     STATE
  =========================================== */

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [paymentFilter, setPaymentFilter] = useState("All");

  const [dateFilter, setDateFilter] = useState("");

  /* ===========================================
     LOAD BOOKINGS
  =========================================== */

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ===========================================
     FILTER BOOKINGS
  =========================================== */

  useEffect(() => {
    let data = [...bookings];

    // Search
    if (search.trim() !== "") {
      const value = search.toLowerCase();

      data = data.filter((customer) => {
        return (
          customer.name
            ?.toLowerCase()
            .includes(value) ||
          customer.mobile
            ?.toString()
            .includes(search) ||
          customer.plot_no
            ?.toString()
            .includes(search)
        );
      });
    }

    // Booking Status
    if (statusFilter !== "All") {
      data = data.filter(
        (customer) =>
          customer.status === statusFilter
      );
    }

    // Payment Status
    if (paymentFilter === "Paid") {
      data = data.filter(
        (customer) =>
          Number(customer.balance || 0) === 0
      );
    }

    if (paymentFilter === "Pending") {
      data = data.filter(
        (customer) =>
          Number(customer.balance || 0) > 0
      );
    }

    // Date Filter
    if (dateFilter !== "") {
      data = data.filter(
        (customer) =>
          customer.booking_date === dateFilter
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

  /* ===========================================
     FETCH BOOKINGS
  =========================================== */

  async function fetchBookings() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("booking_date", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setBookings(data || []);
      setFilteredBookings(data || []);
    } catch (error) {
      console.error(
        "Error fetching bookings:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===========================================
     STATISTICS
  =========================================== */

  const stats = useMemo(() => {
    const totalBookings = bookings.length;

    const totalCollection = bookings.reduce(
      (total, customer) =>
        total +
        Number(customer.amount_paid || 0),
      0
    );

    const totalBalance = bookings.reduce(
      (total, customer) =>
        total +
        Number(customer.balance || 0),
      0
    );

    const pendingPayments = bookings.filter(
      (customer) =>
        Number(customer.balance || 0) > 0
    ).length;

    const completedBookings = bookings.filter(
      (customer) =>
        Number(customer.balance || 0) === 0
    ).length;

    return {
      totalBookings,
      totalCollection,
      totalBalance,
      pendingPayments,
      completedBookings,
    };
  }, [bookings]);

  /* ===========================================
     EXPORT BOOKINGS
  =========================================== */

  function exportExcel() {
    const exportData = filteredBookings.map(
      (customer) => ({
        "Customer Name": customer.name,
        "Plot No": customer.plot_no,
        Mobile: customer.mobile,
        "Booking Date": customer.booking_date,
        "Amount Paid": customer.amount_paid,
        Balance: customer.balance,
        Status: customer.status,
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Bookings"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(
      file,
      `Bookings_${new Date().toLocaleDateString(
        "en-IN"
      )}.xlsx`
    );
  }

  /* ===========================================
     RETURN
  =========================================== */

  return (
    <div className="bookings-page">

      {/* ===========================================
          PAGE HEADER
      =========================================== */}

      <div className="bookings-header">

        <div className="bookings-title-section">

          {/* BACK BUTTON */}

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div>
            <h1>Bookings</h1>

            <p className="page-subtitle">
              Manage all customer bookings
            </p>
          </div>

        </div>

        {/* EXPORT */}

        <button
          type="button"
          className="export-btn"
          onClick={exportExcel}
        >
          <Download size={18} />
          Export Excel
        </button>

      </div>

      {/* ===========================================
          DASHBOARD CARDS
      =========================================== */}

      <div className="stats-grid">

        {/* Total Bookings */}

        <div className="stat-card blue">

          <div className="stat-icon">
            <User size={24} />
          </div>

          <div className="stat-content">
            <span>Total Bookings</span>

            <h2>
              {stats.totalBookings}
            </h2>
          </div>

        </div>

        {/* Collection */}

        <div className="stat-card green">

          <div className="stat-icon">
            <IndianRupee size={24} />
          </div>

          <div className="stat-content">

            <span>Total Collection</span>

            <h2>
              ₹
              {stats.totalCollection.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

        </div>

        {/* Pending */}

        <div className="stat-card orange">

          <div className="stat-icon">
            <Clock3 size={24} />
          </div>

          <div className="stat-content">

            <span>Pending Payments</span>

            <h2>
              {stats.pendingPayments}
            </h2>

          </div>

        </div>

        {/* Completed */}

        <div className="stat-card purple">

          <div className="stat-icon">
            <BadgeCheck size={24} />
          </div>

          <div className="stat-content">

            <span>Completed</span>

            <h2>
              {stats.completedBookings}
            </h2>

          </div>

        </div>

      </div>

      {/* ===========================================
          FILTER BAR
      =========================================== */}

      <div className="toolbar">

        {/* SEARCH */}

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search customer, plot or mobile..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {/* STATUS */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">
            All Status
          </option>

          <option value="Available">
            Available
          </option>

          <option value="Booked">
            Booked
          </option>

          <option value="Sold">
            Sold
          </option>
        </select>

        {/* PAYMENT */}

        <select
          value={paymentFilter}
          onChange={(e) =>
            setPaymentFilter(e.target.value)
          }
        >
          <option value="All">
            All Payments
          </option>

          <option value="Paid">
            Paid
          </option>

          <option value="Pending">
            Pending
          </option>
        </select>

        {/* DATE */}

        <input
          type="date"
          value={dateFilter}
          onChange={(e) =>
            setDateFilter(e.target.value)
          }
        />

      </div>

      {/* ===========================================
          TABLE
      =========================================== */}

      {loading ? (

        <div className="empty">
          Loading bookings...
        </div>

      ) : filteredBookings.length === 0 ? (

        <div className="empty">
          No bookings found.
        </div>

      ) : (

        <div className="table-card">

          <div className="table-wrapper">

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
                  <th>Action</th>
                </tr>

              </thead>

              {/* IMPORTANT:
                  No whitespace/text between tbody
                  and the map expression.
              */}

              <tbody>
                {filteredBookings.map(
                  (customer) => {

                    const isPaid =
                      Number(
                        customer.balance || 0
                      ) === 0;

                    return (
                      <tr
                        key={customer.id}
                      >

                        {/* Customer */}

                        <td>

                          <div className="customer-info">

                            <div className="customer-avatar">
                              {customer.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="customer-details">

                              <h4>
                                {customer.name}
                              </h4>

                              <span>
                                Customer
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* Plot */}

                        <td>

                          <span className="plot-badge">
                            Plot #
                            {customer.plot_no}
                          </span>

                        </td>

                        {/* Mobile */}

                        <td>

                          <div className="table-info">

                            <Phone size={15} />

                            <span>
                              {customer.mobile}
                            </span>

                          </div>

                        </td>

                        {/* Booking Date */}

                        <td>

                          <div className="table-info">

                            <Calendar size={15} />

                            <span>
                              {customer.booking_date}
                            </span>

                          </div>

                        </td>

                        {/* Amount Paid */}

                        <td className="paid-amount">

                          ₹
                          {Number(
                            customer.amount_paid ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>

                        {/* Balance */}

                        <td className="balance-amount">

                          ₹
                          {Number(
                            customer.balance ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>

                        {/* Payment Status */}

                        <td>

                          <span
                            className={
                              isPaid
                                ? "status-badge paid"
                                : "status-badge pending"
                            }
                          >
                            {isPaid
                              ? "Paid"
                              : "Pending"}
                          </span>

                        </td>

                        {/* Action */}

                        <td>

                          <div className="table-actions">

                            <button
                              type="button"
                              className="view-btn"
                              onClick={() =>
                                navigate(
                                  `/customer/${customer.id}`
                                )
                              }
                            >
                              <Eye size={16} />
                              View
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}
              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}

export default Bookings;