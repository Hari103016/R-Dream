import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Download,
  Eye,
  CreditCard,
  IndianRupee,
  BadgeCheck,
  Clock3,
  ArrowLeft,
} from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { supabase } from "../services/supabase";

import "./Payments.css";

function Payments() {
  const navigate = useNavigate();

  /* ===========================================
     STATE
  =========================================== */

  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [paymentModeFilter, setPaymentModeFilter] =
    useState("All");

  const [dateFilter, setDateFilter] =
    useState("");

  /* ===========================================
     LOAD PAYMENTS
  =========================================== */

  useEffect(() => {
    fetchPayments();
  }, []);

  /* ===========================================
     FILTER PAYMENTS
  =========================================== */

  useEffect(() => {
    let data = [...payments];

    /* Search */

    if (search.trim() !== "") {
      const value = search.toLowerCase();

      data = data.filter((payment) => {
        return (
          payment.customers?.name
            ?.toLowerCase()
            .includes(value) ||
          payment.customers?.mobile
            ?.toString()
            .includes(search) ||
          payment.customers?.plot_no
            ?.toString()
            .includes(search)
        );
      });
    }

    /* Payment Mode */

    if (paymentModeFilter !== "All") {
      data = data.filter(
        (payment) =>
          payment.payment_mode ===
          paymentModeFilter
      );
    }

    /* Date */

    if (dateFilter !== "") {
      data = data.filter(
        (payment) =>
          payment.payment_date === dateFilter
      );
    }

    setFilteredPayments(data);
  }, [
    payments,
    search,
    paymentModeFilter,
    dateFilter,
  ]);

  /* ===========================================
     FETCH PAYMENTS
  =========================================== */

  async function fetchPayments() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          customers (
            id,
            name,
            mobile,
            plot_no
          )
        `)
        .order("payment_date", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setPayments(data || []);
      setFilteredPayments(data || []);
    } catch (error) {
      console.error(
        "Error fetching payments:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===========================================
     DASHBOARD STATISTICS
  =========================================== */

  const stats = useMemo(() => {
    const totalPayments = payments.length;

    const totalCollection = payments.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const todayCollection = payments
      .filter(
        (payment) =>
          payment.payment_date === today
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

    const cashPayments = payments.filter(
      (payment) =>
        payment.payment_mode === "Cash"
    ).length;

    return {
      totalPayments,
      totalCollection,
      todayCollection,
      cashPayments,
    };
  }, [payments]);

  /* ===========================================
     EXPORT TO EXCEL
  =========================================== */

  function exportExcel() {
    const rows = filteredPayments.map(
      (payment) => ({
        "Customer Name":
          payment.customers?.name,

        "Plot No":
          payment.customers?.plot_no,

        Mobile:
          payment.customers?.mobile,

        Amount:
          payment.amount,

        "Payment Mode":
          payment.payment_mode,

        "Payment Date":
          payment.payment_date,

        Remarks:
          payment.remarks,
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Payments"
    );

    const excelBuffer =
      XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

    const file = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }
    );

    saveAs(
      file,
      `Payments_${new Date().toLocaleDateString(
        "en-IN"
      )}.xlsx`
    );
  }

  /* ===========================================
     RETURN
  =========================================== */

  return (
    <div className="payments-page">

      {/* ===========================================
          HEADER
      =========================================== */}

      <div className="payments-header">

        {/* TITLE + BACK */}

        <div className="payments-title-section">

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div>
            <h1>Payments</h1>

            <p className="page-subtitle">
              Manage customer payment history
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

        {/* Total Collection */}

        <div className="stat-card green">

          <div className="stat-icon">
            <IndianRupee size={24} />
          </div>

          <div className="stat-content">

            <span>
              Total Collection
            </span>

            <h2>
              ₹
              {stats.totalCollection.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

        </div>


        {/* Today's Collection */}

        <div className="stat-card blue">

          <div className="stat-icon">
            <Clock3 size={24} />
          </div>

          <div className="stat-content">

            <span>
              Today's Collection
            </span>

            <h2>
              ₹
              {stats.todayCollection.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

        </div>


        {/* Total Payments */}

        <div className="stat-card purple">

          <div className="stat-icon">
            <CreditCard size={24} />
          </div>

          <div className="stat-content">

            <span>
              Total Payments
            </span>

            <h2>
              {stats.totalPayments}
            </h2>

          </div>

        </div>


        {/* Cash Payments */}

        <div className="stat-card orange">

          <div className="stat-icon">
            <BadgeCheck size={24} />
          </div>

          <div className="stat-content">

            <span>
              Cash Payments
            </span>

            <h2>
              {stats.cashPayments}
            </h2>

          </div>

        </div>

      </div>


      {/* ===========================================
          FILTER TOOLBAR
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


        {/* PAYMENT MODE */}

        <select
          value={paymentModeFilter}
          onChange={(e) =>
            setPaymentModeFilter(
              e.target.value
            )
          }
        >

          <option value="All">
            All Payment Modes
          </option>

          <option value="Cash">
            Cash
          </option>

          <option value="UPI">
            UPI
          </option>

          <option value="Bank Transfer">
            Bank Transfer
          </option>

          <option value="Cheque">
            Cheque
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
          PAYMENTS TABLE
      =========================================== */}

      {loading ? (

        <div className="empty">
          Loading Payments...
        </div>

      ) : filteredPayments.length === 0 ? (

        <div className="empty">
          No Payments Found
        </div>

      ) : (

        <div className="table-card">

          <div className="table-wrapper">

            <table className="payments-table">

              <thead>

                <tr>
                  <th>Customer</th>
                  <th>Plot</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Date</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {filteredPayments.map(
                  (payment) => (

                    <tr
                      key={payment.id}
                    >

                      {/* Customer */}

                      <td>

                        <div className="customer-info">

                          <div className="customer-avatar">

                            {payment
                              .customers
                              ?.name
                              ?.charAt(0)
                              .toUpperCase()}

                          </div>

                          <div className="customer-details">

                            <h4>
                              {
                                payment
                                  .customers
                                  ?.name
                              }
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
                          {
                            payment
                              .customers
                              ?.plot_no
                          }
                        </span>

                      </td>


                      {/* Amount */}

                      <td className="amount-text">

                        ₹
                        {Number(
                          payment.amount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </td>


                      {/* Payment Mode */}

                      <td>

                        <span className="payment-badge">

                          <CreditCard
                            size={14}
                          />

                          {
                            payment.payment_mode
                          }

                        </span>

                      </td>


                      {/* Date */}

                      <td>

                        {payment.payment_date
                          ? new Date(
                              payment.payment_date
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}

                      </td>


                      {/* Remarks */}

                      <td>
                        {payment.remarks || "-"}
                      </td>


                      {/* Action */}

                      <td>

                        <div className="table-actions">

                          <button
                            type="button"
                            className="view-btn"
                            onClick={() =>
                              navigate(
                                `/customer/${payment.customer_id}`
                              )
                            }
                          >

                            <Eye size={16} />

                            View

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}

export default Payments;