import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Plus,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  Wallet,
  AlertCircle,
  UserRound,
} from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { supabase } from "../services/supabase";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AddCustomerModal from "../components/AddCustomerModal";

import "./Customers.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /* ==========================================================
     FETCH CUSTOMERS
  ========================================================== */

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("id", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      toast.error("Failed to load customers");
      setLoading(false);
      return;
    }

    setCustomers(data || []);
    setLoading(false);
  }

  /* ==========================================================
     SEARCH
  ========================================================== */

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(value) ||
        customer.mobile
          ?.toString()
          .toLowerCase()
          .includes(value) ||
        customer.plot_no
          ?.toString()
          .toLowerCase()
          .includes(value)
      );
    });
  }, [customers, search]);

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const totalCustomers = filteredCustomers.length;

  const bookedCustomers = filteredCustomers.filter(
    (customer) =>
      customer.status?.toLowerCase() === "booked"
  ).length;

  const totalCollected = filteredCustomers.reduce(
    (sum, customer) =>
      sum + Number(customer.amount_paid || 0),
    0
  );

  const totalPending = filteredCustomers.reduce(
    (sum, customer) =>
      sum + Number(customer.balance || 0),
    0
  );

  /* ==========================================================
     DELETE CUSTOMER
  ========================================================== */

  async function deleteCustomer(customer) {
    const result = await Swal.fire({
      title: "Delete Customer?",
      text: `Delete ${customer.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#2563eb",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      /* Delete payments */
      const { error: paymentError } = await supabase
        .from("payments")
        .delete()
        .eq("customer_id", customer.id);

      if (paymentError) {
        console.error(paymentError);
      }

      /* Make plot available again */
      const { error: plotError } = await supabase
        .from("plots")
        .update({
          status: "Available",
          customer_id: null,
        })
        .eq("plot_no", customer.plot_no);

      if (plotError) {
        console.error(plotError);
      }

      /* Delete customer */
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customer.id);

      if (error) {
        throw error;
      }

      toast.success("Customer deleted successfully");

      fetchCustomers();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  }

  /* ==========================================================
     EXPORT EXCEL
  ========================================================== */

  function exportExcel() {
    if (filteredCustomers.length === 0) {
      toast.warning("No customers to export");
      return;
    }

    const rows = filteredCustomers.map((customer) => ({
      "Plot No": customer.plot_no,
      "Customer Name": customer.name,
      Mobile: customer.mobile,
      Status: customer.status,
      "Total Amount": Number(
        customer.total_amount || 0
      ),
      "Amount Paid": Number(
        customer.amount_paid || 0
      ),
      Balance: Number(customer.balance || 0),
      "Booking Date": customer.booking_date,
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Customers"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Customers_${new Date()
        .toLocaleDateString("en-IN")
        .replace(/\//g, "-")}.xlsx`
    );

    toast.success("Customers exported successfully");
  }

  /* ==========================================================
     STATUS CLASS
  ========================================================== */

  function getStatusClass(status) {
    const value = status?.toLowerCase();

    if (value === "available") return "available";
    if (value === "booked") return "booked";
    if (value === "completed") return "completed";
    if (value === "sold") return "sold";
    if (value === "cancelled") return "cancelled";

    return "default";
  }

  /* ==========================================================
     FORMAT MONEY
  ========================================================== */

  function formatMoney(value) {
    return Number(value || 0).toLocaleString(
      "en-IN"
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="main-content">
        <Topbar
          setSidebarOpen={setSidebarOpen}
        />

        <div className="customers-page">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="customers-header">

            <div className="customers-heading">

              <div className="customers-heading-icon">
                <Users size={24} />
              </div>

              <div>
                <h1>Customers</h1>

                <p>
                  Manage your customers and payment
                  details
                </p>
              </div>

            </div>

            <div className="customers-header-actions">

              {/* SEARCH */}

              <div className="customer-search">

                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search Name, Plot or Mobile..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

                {search && (
                  <button
                    className="clear-search"
                    onClick={() => setSearch("")}
                    type="button"
                  >
                    ×
                  </button>
                )}

              </div>

              {/* REFRESH */}

              <button
                className="customer-refresh-btn"
                onClick={fetchCustomers}
                title="Refresh"
                type="button"
              >
                <RefreshCw size={16} />
              </button>

              {/* EXPORT */}

              <button
                className="customer-export-btn"
                onClick={exportExcel}
                type="button"
              >
                <Download size={16} />
                Export Excel
              </button>

              {/* ADD */}

              <button
                className="customer-add-btn"
                onClick={() => setShowModal(true)}
                type="button"
              >
                <Plus size={17} />
                Add Customer
              </button>

            </div>
          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="customer-stats">

            <div className="customer-stat-card">

              <div className="customer-stat-icon blue">
                <Users size={20} />
              </div>

              <div>
                <span>Total Customers</span>
                <strong>{totalCustomers}</strong>
              </div>

            </div>

            <div className="customer-stat-card">

              <div className="customer-stat-icon orange">
                <UserCheck size={20} />
              </div>

              <div>
                <span>Booked Customers</span>
                <strong>{bookedCustomers}</strong>
              </div>

            </div>

            <div className="customer-stat-card">

              <div className="customer-stat-icon green">
                <Wallet size={20} />
              </div>

              <div>
                <span>Amount Collected</span>

                <strong>
                  ₹{formatMoney(totalCollected)}
                </strong>
              </div>

            </div>

            <div className="customer-stat-card">

              <div className="customer-stat-icon red">
                <AlertCircle size={20} />
              </div>

              <div>
                <span>Pending Balance</span>

                <strong>
                  ₹{formatMoney(totalPending)}
                </strong>
              </div>

            </div>

          </div>

          {/* =================================================
              RESULT INFO
          ================================================= */}

          <div className="customer-result-info">

            <span>
              Showing{" "}
              <strong>
                {filteredCustomers.length}
              </strong>{" "}
              of{" "}
              <strong>
                {customers.length}
              </strong>{" "}
              customers
            </span>

            {search && (
              <span>
                Search:{" "}
                <strong>"{search}"</strong>
              </span>
            )}

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="customer-empty">

              <div className="customer-loading-spinner" />

              <h3>Loading Customers...</h3>

              <p>
                Please wait while we load customer
                information.
              </p>

            </div>
          ) : filteredCustomers.length === 0 ? (

            /* ===============================================
               EMPTY
            =============================================== */

            <div className="customer-empty">

              <div className="customer-empty-icon">
                <UserRound size={30} />
              </div>

              <h3>No Customers Found</h3>

              <p>
                {search
                  ? "Try searching with another name, plot number or mobile number."
                  : "No customers have been added yet."}
              </p>

              {!search && (
                <button
                  className="empty-add-btn"
                  onClick={() =>
                    setShowModal(true)
                  }
                  type="button"
                >
                  <Plus size={16} />
                  Add Customer
                </button>
              )}

            </div>
          ) : (

            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="customers-table-container">

                <table className="customers-table">

                  <thead>
                    <tr>
                      <th>Plot</th>
                      <th>Customer</th>
                      <th>Mobile</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredCustomers.map(
                      (customer) => {

                        const balance =
                          Number(
                            customer.balance || 0
                          );

                        return (
                          <tr key={customer.id}>

                            {/* PLOT */}

                            <td>
                              <span className="plot-number">
                                #{customer.plot_no}
                              </span>
                            </td>

                            {/* CUSTOMER */}

                            <td>
                              <div className="customer-cell">

                                <div className="customer-avatar">
                                  {customer.name
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                    "C"}
                                </div>

                                <div>
                                  <strong>
                                    {customer.name ||
                                      "Unknown"}
                                  </strong>

                                  <span>
                                    Customer
                                  </span>
                                </div>

                              </div>
                            </td>

                            {/* MOBILE */}

                            <td>
                              <span className="mobile-number">
                                {customer.mobile ||
                                  "-"}
                              </span>
                            </td>

                            {/* STATUS */}

                            <td>
                              <span
                                className={`customer-status ${getStatusClass(
                                  customer.status
                                )}`}
                              >
                                <span className="status-dot" />

                                {customer.status ||
                                  "Unknown"}
                              </span>
                            </td>

                            {/* TOTAL */}

                            <td>
                              <span className="money total">
                                ₹
                                {formatMoney(
                                  customer.total_amount
                                )}
                              </span>
                            </td>

                            {/* PAID */}

                            <td>
                              <span className="money paid">
                                ₹
                                {formatMoney(
                                  customer.amount_paid
                                )}
                              </span>
                            </td>

                            {/* BALANCE */}

                            <td>
                              <span
                                className={`money balance ${
                                  balance > 0
                                    ? "pending"
                                    : "clear"
                                }`}
                              >
                                ₹
                                {formatMoney(
                                  balance
                                )}
                              </span>
                            </td>

                            {/* ACTIONS */}

                            <td>
                              <div className="customer-actions">

                                <Link
                                  to={`/customer/${customer.id}`}
                                  className="customer-action view"
                                  title="View Customer"
                                >
                                  <Eye size={16} />
                                </Link>

                                <Link
                                  to={`/edit-customer/${customer.id}`}
                                  className="customer-action edit"
                                  title="Edit Customer"
                                >
                                  <Pencil size={16} />
                                </Link>

                                <button
                                  className="customer-action delete"
                                  title="Delete Customer"
                                  onClick={() =>
                                    deleteCustomer(
                                      customer
                                    )
                                  }
                                  type="button"
                                >
                                  <Trash2 size={16} />
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

              {/* =================================================
                  MOBILE CUSTOMER CARDS
              ================================================= */}

              <div className="customers-mobile-list">

                {filteredCustomers.map(
                  (customer) => {

                    const balance =
                      Number(
                        customer.balance || 0
                      );

                    return (
                      <div
                        className="customer-mobile-card"
                        key={customer.id}
                      >

                        {/* TOP */}

                        <div className="mobile-card-top">

                          <div className="customer-cell">

                            <div className="customer-avatar">
                              {customer.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "C"}
                            </div>

                            <div>
                              <strong>
                                {customer.name ||
                                  "Unknown"}
                              </strong>

                              <span>
                                Customer
                              </span>
                            </div>

                          </div>

                          <span
                            className={`customer-status ${getStatusClass(
                              customer.status
                            )}`}
                          >
                            <span className="status-dot" />

                            {customer.status ||
                              "Unknown"}
                          </span>

                        </div>

                        {/* CONTACT */}

                        <div className="mobile-card-contact">

                          <div>
                            <span>Plot No</span>
                            <strong>
                              #{customer.plot_no}
                            </strong>
                          </div>

                          <div>
                            <span>Mobile</span>
                            <strong>
                              {customer.mobile ||
                                "-"}
                            </strong>
                          </div>

                        </div>

                        {/* MONEY */}

                        <div className="mobile-money-grid">

                          <div>
                            <span>Total</span>

                            <strong className="total-text">
                              ₹
                              {formatMoney(
                                customer.total_amount
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>Paid</span>

                            <strong className="paid-text">
                              ₹
                              {formatMoney(
                                customer.amount_paid
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>Balance</span>

                            <strong
                              className={
                                balance > 0
                                  ? "balance-text"
                                  : "clear-text"
                              }
                            >
                              ₹
                              {formatMoney(
                                balance
                              )}
                            </strong>
                          </div>

                        </div>

                        {/* ACTIONS */}

                        <div className="mobile-card-actions">

                          <Link
                            to={`/customer/${customer.id}`}
                            className="mobile-view-btn"
                          >
                            <Eye size={15} />
                            View
                          </Link>

                          <Link
                            to={`/edit-customer/${customer.id}`}
                            className="mobile-edit-btn"
                          >
                            <Pencil size={15} />
                            Edit
                          </Link>

                          <button
                            className="mobile-delete-btn"
                            onClick={() =>
                              deleteCustomer(
                                customer
                              )
                            }
                            title="Delete"
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            </>
          )}

          {/* =================================================
              ADD CUSTOMER MODAL
          ================================================= */}

          {showModal && (
            <AddCustomerModal
              onClose={() => {
                setShowModal(false);
                fetchCustomers();
              }}
            />
          )}

        </div>
      </div>
    </>
  );
}

export default Customers;