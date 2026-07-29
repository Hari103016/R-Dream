import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Phone, Calendar } from "lucide-react";
import { supabase } from "../services/supabase";
import "./Bookings.css";
import { CalendarDays } from "lucide-react";

function Bookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("booking_date", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setBookings(data);
    }

    setLoading(false);
  }

  const filteredBookings = bookings.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.mobile.includes(search) ||
      customer.plot_no.toString().includes(search)
    );
  });

  return (
    <div className="bookings-page">

      <div className="bookings-header">

        <h2>Bookings</h2>

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search Customer / Plot / Mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>

      {loading ? (
        <h3>Loading...</h3>
      ) : filteredBookings.length === 0 ? (
        <h3>No Bookings Found</h3>
      ) : (

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

                <td>{customer.plot_no}</td>

                <td>

                  <Phone size={16} />

                  {customer.mobile}

                </td>

                <td>

                  <Calendar size={16} />

                  {customer.booking_date}

                </td>

                <td>
                  ₹{Number(customer.amount_paid).toLocaleString("en-IN")}
                </td>

                <td>
                  ₹{Number(customer.balance).toLocaleString("en-IN")}
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

      )}

    </div>
  );
}

export default Bookings;