import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  User,
  Phone,
  Calendar,
  Download,
} from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { supabase } from "../services/supabase";

import "./Bookings.css";

function Bookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("booking_date", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setBookings(data || []);
    setFilteredBookings(data || []);

    setLoading(false);
  }

  useEffect(() => {
    const value = search.toLowerCase();

    const result = bookings.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(value) ||
        customer.mobile?.includes(search) ||
        customer.plot_no?.toString().includes(search)
      );
    });

    setFilteredBookings(result);

  }, [search, bookings]);

  function exportExcel() {

    const rows = filteredBookings.map((customer) => ({
      "Customer Name": customer.name,
      "Plot No": customer.plot_no,
      Mobile: customer.mobile,
      "Booking Date": customer.booking_date,
      "Amount Paid": customer.amount_paid,
      Balance: customer.balance,
      Status: customer.status,
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    const workbook =
      XLSX.utils.book_new();

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
      new Blob([buffer]),
      `Bookings_${new Date().toLocaleDateString()}.xlsx`
    );
  }
    return (
    <div className="bookings-page">

      {/* Header */}

      <div className="bookings-header">

        <h2>Bookings</h2>

        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >

          {/* Search */}

          <div className="search-box">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search Customer / Plot / Mobile"
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

        </div>

      </div>

      {/* Loading */}

      {loading ? (

        <div className="empty">
          Loading Bookings...
        </div>

      ) : filteredBookings.length === 0 ? (

        <div className="empty">
          No Bookings Found
        </div>

      ) : (

        <div style={{ overflowX: "auto" }}>

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

            <tbody>

              {filteredBookings.map((customer) => (

                <tr key={customer.id}>

                  <td>
                    <User size={16} />
                    {customer.name}
                  </td>

                  <td>
                    {customer.plot_no}
                  </td>

                  <td>
                    <Phone size={16} />
                    {customer.mobile}
                  </td>

                  <td>
                    <Calendar size={16} />
                    {customer.booking_date}
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

                  <td>

                    <span className="booking-status">
                      {customer.status}
                    </span>

                  </td>

                  <td>

                    <button
                      className="view-btn"
                      onClick={() =>
                        navigate(`/customer/${customer.id}`)
                      }
                    >
                      View
                    </button>

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

export default Bookings;