import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Plus,
  Download,
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
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load customers");
      setLoading(false);
      return;
    }

    setCustomers(data || []);
    setFilteredCustomers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    const value = search.toLowerCase();

    const results = customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(value) ||
        customer.mobile?.toString().includes(value) ||
        customer.plot_no?.toString().includes(value)
      );
    });

    setFilteredCustomers(results);
  }, [search, customers]);
    async function deleteCustomer(customer) {
    const result = await Swal.fire({
      title: "Delete Customer?",
      text: `Delete ${customer.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3b82f6",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await supabase
        .from("payments")
        .delete()
        .eq("customer_id", customer.id);

      await supabase
        .from("plots")
        .update({
          status: "Available",
          customer_id: null,
        })
        .eq("plot_no", customer.plot_no);

      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customer.id);

      if (error) throw error;

      toast.success("Customer deleted successfully");

      fetchCustomers();
    } catch (err) {
      console.error(err);

      toast.error("Delete failed");
    }
  }
    function exportExcel() {
    const rows = filteredCustomers.map((customer) => ({
      "Plot No": customer.plot_no,
      "Customer Name": customer.name,
      Mobile: customer.mobile,
      Status: customer.status,
      "Total Amount": customer.total_amount,
      "Amount Paid": customer.amount_paid,
      Balance: customer.balance,
      "Booking Date": customer.booking_date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

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
      new Blob([excelBuffer]),
      `Customers_${new Date().toLocaleDateString()}.xlsx`
    );
  }
    return (
    <div className="dashboard">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="main-content">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <div className="customers-page">

          {/* Header */}

          <div className="customers-header">

            <div>
              <h1>Customers</h1>

              <p className="customer-count">
                Total Customers :
                <strong> {filteredCustomers.length}</strong>
              </p>
            </div>

            <div className="header-actions">

              {/* Search */}

              <div className="search-box">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search by Name, Plot No or Mobile..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Export */}

              <button
                className="export-btn"
                onClick={exportExcel}
              >
                <Download size={18} />
                Export Excel
              </button>

              {/* Add Customer */}

              <button
                className="add-btn"
                onClick={() => setShowModal(true)}
              >
                <Plus size={18} />
                Add Customer
              </button>

            </div>

          </div>

          {/* Loading */}

          {loading ? (

            <div className="empty">
              Loading Customers...
            </div>

          ) : (

            <div className="table-container">

              <table>

                <thead>

                  <tr>

                    <th>Plot No</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {filteredCustomers.length === 0 ? (

                    <tr>

                      <td
                        className="empty"
                        colSpan="8"
                      >
                        No Customers Found
                      </td>

                    </tr>

                  ) : (

                    filteredCustomers.map((customer) => (

                      <tr key={customer.id}>

                        <td>{customer.plot_no}</td>

                        <td>{customer.name}</td>

                        <td>{customer.mobile}</td>

                        <td>

                          <span
                            className={`status ${customer.status
                              ?.toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {customer.status}
                          </span>

                        </td>

                        <td>
                          ₹
                          {Number(
                            customer.total_amount || 0
                          ).toLocaleString("en-IN")}
                        </td>

                        <td>
                          ₹
                          {Number(
                            customer.amount_paid || 0
                          ).toLocaleString("en-IN")}
                        </td>

                        <td>
                          ₹
                          {Number(
                            customer.balance || 0
                          ).toLocaleString("en-IN")}
                        </td>

                        <td className="actions">

                          <Link
                            to={`/customer/${customer.id}`}
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>

                          <Link
                            to={`/edit-customer/${customer.id}`}
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </Link>

                          <button
                            title="Delete"
                            onClick={() =>
                              deleteCustomer(customer)
                            }
                          >
                            <Trash2 size={18} />
                          </button>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          )}
                    {/* Add Customer Modal */}

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
    </div>
  );
}

export default Customers;