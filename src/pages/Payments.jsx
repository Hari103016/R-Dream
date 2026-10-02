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
  RefreshCw,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { supabase } from "../services/supabase";
import "./Payments.css";

function Payments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchPayments();

    const channel = supabase
      .channel("payments-page-refresh")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
        },
        () => fetchPayments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let data = [...payments];

    if (search.trim() !== "") {
      const value = search.toLowerCase();

      data = data.filter((payment) => {
        return (
          payment.customers?.name?.toLowerCase().includes(value) ||
          payment.customers?.mobile?.toString().includes(search) ||
          payment.customers?.plot_no?.toString().includes(search)
        );
      });
    }

    if (paymentModeFilter !== "All") {
      data = data.filter(
        (payment) => payment.payment_mode === paymentModeFilter
      );
    }

    if (dateFilter !== "") {
      data = data.filter(
        (payment) => payment.payment_date === dateFilter
      );
    }

    setFilteredPayments(data);
  }, [payments, search, paymentModeFilter, dateFilter]);

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
        .order("payment_date", { ascending: false });

      if (error) throw error;

      setPayments(data || []);
      setFilteredPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const totalPayments = payments.length;

    const totalCollection = payments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    );

    const today = new Date().toISOString().split("T")[0];

    const todayCollection = payments
      .filter((payment) => payment.payment_date === today)
      .reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0
      );

    const cashPayments = payments.filter(
      (payment) => payment.payment_mode === "Cash"
    ).length;

    return {
      totalPayments,
      totalCollection,
      todayCollection,
      cashPayments,
    };
  }, [payments]);

  function exportExcel() {
    const rows = filteredPayments.map((payment) => ({
      "Customer Name": payment.customers?.name,
      "Plot No": payment.customers?.plot_no,
      Mobile: payment.customers?.mobile,
      Amount: payment.amount,
      "Payment Mode": payment.payment_mode,
      "Payment Date": payment.payment_date,
      Remarks: payment.remarks,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

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
      `Payments_${new Date().toLocaleDateString("en-IN")}.xlsx`
    );
  }

  function clearFilters() {
    setSearch("");
    setPaymentModeFilter("All");
    setDateFilter("");
  }

  return (
    <div className="payments-page payments-unique-page">
      <section className="payments-hero">
        <div className="payments-hero-content">
          <div className="payments-kicker">R DREAM INFRA DEVELOPERS</div>

          <div className="payments-title-row">
            <button
              type="button"
              className="payments-back-btn"
              onClick={() => navigate(-1)}
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1>Payments</h1>
              <p>
                A clear financial command center for every customer
                payment and collection.
              </p>
            </div>
          </div>

          <div className="payments-live-line">
            <span />
            LIVE PAYMENT DATABASE
            <b>{payments.length} transactions</b>
          </div>
        </div>

        <div className="payments-hero-art" aria-hidden="true">
          <div className="payment-orbit orbit-one" />
          <div className="payment-orbit orbit-two" />
          <div className="payment-orbit orbit-three" />
          <div className="payment-art-card art-card-one">
            <IndianRupee size={23} />
          </div>
          <div className="payment-art-card art-card-two">
            <CreditCard size={20} />
          </div>
          <div className="payment-art-line" />
        </div>
      </section>

      <section className="payment-stats-section">
        <div className="payment-section-label">
          <span>COLLECTION OVERVIEW</span>
          <i />
        </div>

        <div className="payment-stat-grid">
          <article className="payment-stat-card green">
            <div className="payment-stat-icon">
              <IndianRupee size={22} />
            </div>
            <div className="payment-stat-content">
              <span>Total Collection</span>
              <strong>
                ₹{stats.totalCollection.toLocaleString("en-IN")}
              </strong>
              <small>All payments received</small>
            </div>
            <b>01</b>
          </article>

          <article className="payment-stat-card blue">
            <div className="payment-stat-icon">
              <Clock3 size={22} />
            </div>
            <div className="payment-stat-content">
              <span>Today's Collection</span>
              <strong>
                ₹{stats.todayCollection.toLocaleString("en-IN")}
              </strong>
              <small>Collected today</small>
            </div>
            <b>02</b>
          </article>

          <article className="payment-stat-card purple">
            <div className="payment-stat-icon">
              <CreditCard size={22} />
            </div>
            <div className="payment-stat-content">
              <span>Total Payments</span>
              <strong>{stats.totalPayments}</strong>
              <small>Recorded transactions</small>
            </div>
            <b>03</b>
          </article>

          <article className="payment-stat-card gold">
            <div className="payment-stat-icon">
              <BadgeCheck size={22} />
            </div>
            <div className="payment-stat-content">
              <span>Cash Payments</span>
              <strong>{stats.cashPayments}</strong>
              <small>Cash transactions</small>
            </div>
            <b>04</b>
          </article>
        </div>
      </section>

      <section className="payment-toolbar-section">
        <div className="payment-section-label">
          <span>TRANSACTION FILTERS</span>
          <i />
        </div>

        <div className="payment-toolbar">
          <label className="payment-search">
            <Search size={18} />
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

          <label className="payment-filter">
            <span>PAYMENT MODE</span>
            <select
              value={paymentModeFilter}
              onChange={(e) => setPaymentModeFilter(e.target.value)}
            >
              <option value="All">All Payment Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </label>

          <label className="payment-filter date">
            <span>PAYMENT DATE</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </label>


          <button
            type="button"
            className="payment-export-btn"
            onClick={exportExcel}
          >
            <Download size={17} />
            Export Excel
          </button>

          <button
            type="button"
            className="payment-clear-btn"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>
      </section>

      <section className="payment-record-panel">
        <div className="payment-record-head">
          <div>
            <div className="payment-record-kicker">
              CUSTOMER PAYMENT REGISTER
            </div>
            <h2>Payment Transactions</h2>
            <p>
              Showing <strong>{filteredPayments.length}</strong> of{" "}
              <strong>{payments.length}</strong> transactions
            </p>
          </div>

          <div className="payment-live-badge">
            <span />
            DATABASE CONNECTED
          </div>
        </div>

        {loading ? (
          <div className="payment-empty">
            <div className="payment-spinner" />
            <h3>Loading payments</h3>
            <p>Fetching the latest transactions from Supabase.</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="payment-empty">
            <div className="payment-empty-icon">
              <CreditCard size={30} />
            </div>
            <h3>No payments found</h3>
            <p>Try another customer, plot, payment mode or date.</p>
            <button
              type="button"
              className="payment-empty-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="payment-table-scroll">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plot</th>
                  <th>Mobile</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Payment Date</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment, index) => (
                  <tr key={payment.id}>
                    <td>
                      <div className="payment-customer">
                        <div className={`payment-avatar avatar-${(index % 6) + 1}`}>
                          {payment.customers?.name
                            ?.charAt(0)
                            .toUpperCase() || "C"}
                        </div>

                        <div>
                          <strong>
                            {payment.customers?.name || "Unknown Customer"}
                          </strong>
                          <small>
                            Customer · {String(payment.customer_id || "").slice(0, 8)}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="payment-plot">
                        #{payment.customers?.plot_no ?? "—"}
                      </span>
                    </td>

                    <td>
                      <span className="payment-mobile">
                        {payment.customers?.mobile || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="payment-amount">
                        ₹{Number(payment.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td>
                      <span className="payment-mode-badge">
                        <CreditCard size={14} />
                        {payment.payment_mode || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="payment-date">
                        {payment.payment_date
                          ? new Date(payment.payment_date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </span>
                    </td>

                    <td>
                      <span className="payment-remarks">
                        {payment.remarks || "No remarks"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="payment-view-btn"
                        onClick={() =>
                          navigate(`/customer/${payment.customer_id}`)
                        }
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Payments;
