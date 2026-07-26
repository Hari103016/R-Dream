import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { Eye, Pencil, Trash2, Search, Plus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AddCustomerModal from "../components/AddCustomerModal";
import "./Customers.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setCustomers(data || []);
    setFiltered(data || []);
  }

  useEffect(() => {
    const value = search.toLowerCase();

    setFiltered(
      customers.filter((customer) => {
        return (
          customer.name?.toLowerCase().includes(value) ||
          customer.mobile?.toString().includes(value) ||
          customer.plot_no?.toString().includes(value)
        );
      })
    );
  }, [search, customers]);

  async function deleteCustomer(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchCustomers();
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
                Total Customers : <strong>{filtered.length}</strong>
              </p>
            </div>

            <div className="header-actions">
              <div className="search-box">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search by Name, Plot No or Mobile..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button
                className="add-btn"
                onClick={() => setShowModal(true)}
              >
                <Plus size={18} />
                Add Customer
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Plot No</th>
                  <th>Customer Name</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Amount Paid</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer) => (
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
                        {Number(customer.amount_paid || 0).toLocaleString()}
                      </td>

                      <td>
                        ₹
                        {Number(customer.balance || 0).toLocaleString()}
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
                          onClick={() => deleteCustomer(customer.id)}
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
        </div>

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
  );
}

export default Customers;