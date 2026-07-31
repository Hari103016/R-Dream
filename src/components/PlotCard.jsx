import "./PlotCard.css";

function PlotCard({ plot, onBook, onView }) {
  return (
    <div className="plot-card">

      {/* Header */}
      <div className="plot-header">
        <h3>Plot #{plot.plot_no}</h3>

        <span
          className={`status ${
            plot.status === "Available"
              ? "available"
              : plot.status === "Booked"
              ? "booked"
              : "sold"
          }`}
        >
          {plot.status}
        </span>
      </div>

      {/* Body */}
      <div className="plot-body">

        <div className="plot-row">
          <span className="label">Size</span>
          <span className="value">{plot.plot_size} Sq.Yds</span>
        </div>

        <div className="plot-row">
          <span className="label">Facing</span>
          <span className="value">{plot.facing}</span>
        </div>

        <div className="plot-row">
          <span className="label">Rate</span>
          <span className="value">
            ₹{Number(plot.rate).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="plot-row">
          <span className="label">Price</span>
          <span className="value">
            ₹{Number(plot.price).toLocaleString("en-IN")}
          </span>
        </div>

      </div>

      {/* Footer */}
      <div className="plot-footer">

        {plot.status === "Available" ? (
          <button
            className="book-btn"
            onClick={() => onBook(plot)}
          >
            📅 Book Plot
          </button>
        ) : (
          <button
            className="view-btn"
            onClick={() => onView(plot)}
          >
            👁 View Details
          </button>
        )}

      </div>

    </div>
  );
}

export default PlotCard;