import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPinned,
  Ruler,
  Compass,
  IndianRupee,
  BadgeCheck,
} from "lucide-react";
import { supabase } from "../services/supabase";
import "./Plots.css";

function Plots() {
  const navigate = useNavigate();

  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchPlots();
  }, []);

  async function fetchPlots() {
    setLoading(true);

    const { data, error } = await supabase
      .from("plots")
      .select("*")
      .order("plot_no", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setPlots(data);
    }

    setLoading(false);
  }

  const filteredPlots = plots.filter((plot) => {
    const matchesSearch = plot.plot_no
      ?.toString()
      .includes(search);

    const matchesFilter =
      filter === "All" ||
      plot.status?.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const totalPlots = plots.length;

  const availablePlots = plots.filter(
    (p) => p.status?.toLowerCase() === "available"
  ).length;

  const soldPlots = plots.filter(
    (p) =>
      p.status?.toLowerCase() === "sold" ||
      p.status?.toLowerCase() === "booked"
  ).length;

  const reservedPlots = plots.filter(
    (p) => p.status?.toLowerCase() === "reserved"
  ).length;

  return (
    <div className="plots-page">

      {/* Header */}

      <div className="plots-header">

        <h2>Plots Management</h2>

        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search Plot Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>

      {/* Summary */}

      <div className="summary-cards">

        <div className="summary-card">
          <h4>Total Plots</h4>
          <h1>{totalPlots}</h1>
        </div>

        <div className="summary-card available-card">
          <h4>Available</h4>
          <h1>{availablePlots}</h1>
        </div>

        <div className="summary-card sold-card">
          <h4>Sold / Booked</h4>
          <h1>{soldPlots}</h1>
        </div>

        <div className="summary-card reserved-card">
          <h4>Reserved</h4>
          <h1>{reservedPlots}</h1>
        </div>

      </div>

      {/* Filter */}

      <div className="filter-buttons">

        <button
          className={filter === "All" ? "active" : ""}
          onClick={() => setFilter("All")}
        >
          All
        </button>

        <button
          className={filter === "Available" ? "active" : ""}
          onClick={() => setFilter("Available")}
        >
          Available
        </button>

        <button
          className={filter === "Sold" ? "active" : ""}
          onClick={() => setFilter("Sold")}
        >
          Sold
        </button>

        <button
          className={filter === "Reserved" ? "active" : ""}
          onClick={() => setFilter("Reserved")}
        >
          Reserved
        </button>

      </div>

      {/* Cards */}

      {loading ? (
        <h3>Loading plots...</h3>
      ) : filteredPlots.length === 0 ? (
        <h3>No Plots Found</h3>
      ) : (

        <div className="plots-grid">

          {filteredPlots.map((plot) => {

            const totalPrice =
              plot.price ??
              (plot.plot_size || 0) * (plot.rate || 0);

            return (

              <div className="plot-card" key={plot.id}>

                <div className="plot-title">

                  <MapPinned size={24} />

                  <h2>Plot No : {plot.plot_no}</h2>

                </div>

                <div className="plot-info">

                  <div className="info-row">

                    <div className="left">

                      <Ruler size={18} />

                      <span>Size</span>

                    </div>

                    <div className="right">
                      {plot.plot_size} Sq.Yds
                    </div>

                  </div>

                  <div className="info-row">

                    <div className="left">

                      <Compass size={18} />

                      <span>Facing</span>

                    </div>

                    <div className="right">
                      {plot.facing}
                    </div>

                  </div>

                  <div className="info-row">

                    <div className="left">

                      <IndianRupee size={18} />

                      <span>Price</span>

                    </div>

                    <div className="right">
                      ₹{Number(totalPrice).toLocaleString("en-IN")}
                    </div>

                  </div>

                  <div className="info-row">

                    <div className="left">

                      <BadgeCheck size={18} />

                      <span>Status</span>

                    </div>

                    <span
                      className={`badge ${plot.status?.toLowerCase()}`}
                    >
                      {plot.status}
                    </span>

                  </div>

                </div>

                {plot.status?.toLowerCase() === "available" ? (

                  <button
                    className="book-btn"
                    onClick={() => navigate(`/book/${plot.id}`)}
                  >
                    Book Plot
                  </button>

                ) : (

                  <button
                    className="details-btn"
                    onClick={() => {

                      if (plot.customer_id) {
                        navigate(`/customer/${plot.customer_id}`);
                      } else {
                        alert("Customer not assigned to this plot.");
                      }

                    }}
                  >
                    View Details
                  </button>

                )}

              </div>

            );

          })}

        </div>

      )}

    </div>
  );
}

export default Plots;