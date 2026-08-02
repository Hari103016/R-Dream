import { useEffect, useMemo, useState } from "react";

import {
  IndianRupee,
  Users,
  MapPinned,
  Wallet,
  Search,
  Download,
} from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { supabase } from "../services/supabase";

import "./Reports.css";

function Reports() {
  const [customers, setCustomers] = useState([]);
  const [plots, setPlots] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);

    // Customers
    const { data: customerData, error: customerError } =
      await supabase
        .from("customers")
        .select("*")
        .order("booking_date", {
          ascending: false,
        });

    if (customerError) {
      console.error(customerError);
    } else {
      setCustomers(customerData || []);
    }

    // Plots
    const { data: plotData, error: plotError } =
      await supabase
        .from("plots")
        .select("*");

    if (plotError) {
      console.error(plotError);
    } else {
      setPlots(plotData || []);
    }

    setLoading(false);
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const value = search.toLowerCase();

      return (
        customer.name?.toLowerCase().includes(value) ||
        customer.mobile?.includes(search) ||
        customer.plot_no?.toString().includes(search)
      );
    });
  }, [customers, search]);

  // Customer Statistics
  const totalCustomers = filteredCustomers.length;

  const totalRevenue = filteredCustomers.reduce(
    (sum, customer) =>
      sum + Number(customer.total_amount || 0),
    0
  );

  const totalReceived = filteredCustomers.reduce(
    (sum, customer) =>
      sum + Number(customer.amount_paid || 0),
    0
  );

  const totalBalance = filteredCustomers.reduce(
    (sum, customer) =>
      sum + Number(customer.balance || 0),
    0
  );

  // Plot Statistics
  const totalPlots = plots.length;

  const availablePlots = plots.filter(
    (plot) => plot.status === "Available"
  ).length;

  const bookedPlots = plots.filter(
    (plot) => plot.status === "Booked"
  ).length;

  const soldPlots = plots.filter(
    (plot) => plot.status === "Sold"
  ).length;

  function exportExcel() {
    const rows = filteredCustomers.map((customer) => ({
      "Plot No": customer.plot_no,
      Name: customer.name,
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
      "Reports"
    );

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer]),
      `Reports_${new Date().toLocaleDateString()}.xlsx`
    );
  }

  return (
    <div className="reports-page">

      <div className="reports-header">

        <h2>Reports</h2>

        <div className="header-actions">

          <div className="search-box">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search Customer..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <button
            className="export-btn"
            onClick={exportExcel}
          >
            <Download size={18} />
            Export Excel
          </button>

        </div>

      </div>

      {/* Report Cards */}

      <div className="report-cards">

        <div className="report-card">
          <MapPinned size={32} />
          <h3>{totalPlots}</h3>
          <p>Total Plots</p>
        </div>

        <div className="report-card">
          <MapPinned size={32} />
          <h3>{availablePlots}</h3>
          <p>Available Plots</p>
        </div>

        <div className="report-card">
          <MapPinned size={32} />
          <h3>{bookedPlots}</h3>
          <p>Booked Plots</p>
        </div>

        <div className="report-card">
          <MapPinned size={32} />
          <h3>{soldPlots}</h3>
          <p>Sold Plots</p>
        </div>

        <div className="report-card">
          <Users size={32} />
          <h3>{totalCustomers}</h3>
          <p>Total Customers</p>
        </div>

        <div className="report-card">
          <IndianRupee size={32} />
          <h3>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </h3>
          <p>Total Revenue</p>
        </div>

        <div className="report-card">
          <Wallet size={32} />
          <h3>
            ₹{totalReceived.toLocaleString("en-IN")}
          </h3>
          <p>Amount Received</p>
        </div>

        <div className="report-card">
          <IndianRupee size={32} />
          <h3>
            ₹{totalBalance.toLocaleString("en-IN")}
          </h3>
          <p>Pending Balance</p>
        </div>

      </div>

      {loading ? (

        <div className="empty">
          Loading Reports...
        </div>

      ) : (

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>Plot</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
              </tr>

            </thead>

            <tbody>

              {filteredCustomers.map((customer) => (

                <tr key={customer.id}>

                  <td>{customer.plot_no}</td>

                  <td>{customer.name}</td>

                  <td>{customer.mobile}</td>

                  <td>{customer.status}</td>

                  <td>
                    ₹
                    {Number(
                      customer.total_amount
                    ).toLocaleString("en-IN")}
                  </td>

                  <td>
                    ₹
                    {Number(
                      customer.amount_paid
                    ).toLocaleString("en-IN")}
                  </td>

                  <td>
                    ₹
                    {Number(
                      customer.balance
                    ).toLocaleString("en-IN")}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Reports;