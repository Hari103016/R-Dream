import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  IndianRupee,
  Users,
  MapPinned,
  Wallet,
  Search,
  Download,
  ArrowLeft,
} from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { supabase } from "../services/supabase";

import "./Reports.css";

function Reports() {
  const navigate = useNavigate();

  /* ===========================================
     STATE
  =========================================== */

  const [customers, setCustomers] = useState([]);
  const [plots, setPlots] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  /* ===========================================
     LOAD REPORT DATA
  =========================================== */

  useEffect(() => {
    fetchReports();
  }, []);

  /* ===========================================
     FETCH REPORT DATA
  =========================================== */

  async function fetchReports() {
    try {
      setLoading(true);

      // Customers

      const {
        data: customerData,
        error: customerError,
      } = await supabase
        .from("customers")
        .select("*")
        .order("booking_date", {
          ascending: false,
        });

      if (customerError) {
        throw customerError;
      }

      // Plots

      const {
        data: plotData,
        error: plotError,
      } = await supabase
        .from("plots")
        .select("*");

      if (plotError) {
        throw plotError;
      }

      setCustomers(customerData || []);
      setPlots(plotData || []);

    } catch (error) {
      console.error(
        "Error fetching reports:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===========================================
     SEARCH
  =========================================== */

  const filteredCustomers = useMemo(() => {
    const value = search.toLowerCase();

    return customers.filter((customer) => {
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
  }, [customers, search]);

  /* ===========================================
     REPORT STATISTICS
  =========================================== */

  const reportStats = useMemo(() => {
    const totalCustomers =
      filteredCustomers.length;

    const totalRevenue =
      filteredCustomers.reduce(
        (total, customer) =>
          total +
          Number(
            customer.total_amount || 0
          ),
        0
      );

    const totalReceived =
      filteredCustomers.reduce(
        (total, customer) =>
          total +
          Number(
            customer.amount_paid || 0
          ),
        0
      );

    const totalBalance =
      filteredCustomers.reduce(
        (total, customer) =>
          total +
          Number(
            customer.balance || 0
          ),
        0
      );

    const totalPlots = plots.length;

    const availablePlots =
      plots.filter(
        (plot) =>
          plot.status === "Available"
      ).length;

    const bookedPlots =
      plots.filter(
        (plot) =>
          plot.status === "Booked"
      ).length;

    const soldPlots =
      plots.filter(
        (plot) =>
          plot.status === "Sold"
      ).length;

    return {
      totalCustomers,
      totalRevenue,
      totalReceived,
      totalBalance,
      totalPlots,
      availablePlots,
      bookedPlots,
      soldPlots,
    };
  }, [filteredCustomers, plots]);

  /* ===========================================
     EXPORT REPORT
  =========================================== */

  function exportExcel() {
    const rows = filteredCustomers.map(
      (customer) => ({
        "Plot No": customer.plot_no,
        "Customer Name": customer.name,
        Mobile: customer.mobile,
        Status: customer.status,
        "Total Amount":
          customer.total_amount,
        "Amount Paid":
          customer.amount_paid,
        Balance: customer.balance,
        "Booking Date":
          customer.booking_date,
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Reports"
    );

    const excelBuffer = XLSX.write(
      workbook,
      {
        bookType: "xlsx",
        type: "array",
      }
    );

    const file = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }
    );

    saveAs(
      file,
      `Reports_${new Date().toLocaleDateString(
        "en-IN"
      )}.xlsx`
    );
  }

  /* ===========================================
     RETURN
  =========================================== */

  return (
    <div className="reports-page">

      {/* ===========================================
          HEADER
      =========================================== */}

      <div className="reports-header">

        {/* TITLE + BACK */}

        <div className="reports-title-section">

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div>
            <h1>Reports</h1>

            <p className="page-subtitle">
              Business Analytics & Reports
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

        {/* Total Plots */}

        <div className="stat-card blue">

          <div className="stat-icon">
            <MapPinned size={24} />
          </div>

          <div className="stat-content">

            <span>
              Total Plots
            </span>

            <h2>
              {reportStats.totalPlots}
            </h2>

          </div>

        </div>

        {/* Total Customers */}

        <div className="stat-card green">

          <div className="stat-icon">
            <Users size={24} />
          </div>

          <div className="stat-content">

            <span>
              Total Customers
            </span>

            <h2>
              {reportStats.totalCustomers}
            </h2>

          </div>

        </div>

        {/* Total Revenue */}

        <div className="stat-card purple">

          <div className="stat-icon">
            <IndianRupee size={24} />
          </div>

          <div className="stat-content">

            <span>
              Total Revenue
            </span>

            <h2>
              ₹
              {reportStats.totalRevenue.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

        </div>

        {/* Amount Received */}

        <div className="stat-card orange">

          <div className="stat-icon">
            <Wallet size={24} />
          </div>

          <div className="stat-content">

            <span>
              Amount Received
            </span>

            <h2>
              ₹
              {reportStats.totalReceived.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

        </div>

        {/* Pending Balance */}

        <div className="stat-card cyan">

          <div className="stat-icon">
            <IndianRupee size={24} />
          </div>

          <div className="stat-content">

            <span>
              Pending Balance
            </span>

            <h2>
              ₹
              {reportStats.totalBalance.toLocaleString(
                "en-IN"
              )}
            </h2>

          </div>

        </div>

        {/* Available Plots */}

        <div className="stat-card emerald">

          <div className="stat-icon">
            <MapPinned size={24} />
          </div>

          <div className="stat-content">

            <span>
              Available Plots
            </span>

            <h2>
              {reportStats.availablePlots}
            </h2>

          </div>

        </div>

        {/* Booked Plots */}

        <div className="stat-card yellow">

          <div className="stat-icon">
            <MapPinned size={24} />
          </div>

          <div className="stat-content">

            <span>
              Booked Plots
            </span>

            <h2>
              {reportStats.bookedPlots}
            </h2>

          </div>

        </div>

        {/* Sold Plots */}

        <div className="stat-card red">

          <div className="stat-icon">
            <MapPinned size={24} />
          </div>

          <div className="stat-content">

            <span>
              Sold Plots
            </span>

            <h2>
              {reportStats.soldPlots}
            </h2>

          </div>

        </div>

      </div>

      {/* ===========================================
          SEARCH TOOLBAR
      =========================================== */}

      <div className="toolbar">

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

      </div>

      {/* ===========================================
          REPORT TABLE
      =========================================== */}

      {loading ? (

        <div className="empty">
          Loading Reports...
        </div>

      ) : filteredCustomers.length === 0 ? (

        <div className="empty">
          No Reports Found
        </div>

      ) : (

        <div className="table-card">

          <div className="table-wrapper">

            <table className="reports-table">

              <thead>

                <tr>
                  <th>Plot</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                </tr>

              </thead>

              <tbody>

                {filteredCustomers.map(
                  (customer) => (

                    <tr
                      key={customer.id}
                    >

                      {/* Plot */}

                      <td>

                        <span className="plot-badge">
                          Plot #
                          {customer.plot_no}
                        </span>

                      </td>

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

                      {/* Mobile */}

                      <td>
                        {customer.mobile}
                      </td>

                      {/* Status */}

                      <td>

                        <span
                          className={`status-badge ${
                            customer.status
                              ?.toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )
                          }`}
                        >
                          {customer.status}
                        </span>

                      </td>

                      {/* Total Amount */}

                      <td className="amount-text">

                        ₹
                        {Number(
                          customer.total_amount ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </td>

                      {/* Amount Paid */}

                      <td className="received-text">

                        ₹
                        {Number(
                          customer.amount_paid ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </td>

                      {/* Balance */}

                      <td className="balance-text">

                        ₹
                        {Number(
                          customer.balance ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}

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

export default Reports;