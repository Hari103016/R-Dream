import {
  Pencil,
  Trash2,
  Calendar,
  Eye,
} from "lucide-react";

import "./PlotCard.css";

function PlotCard({

  plot,

  selectionMode = false,

  checked = false,

  onCheck,

  onBook,

  onView,

  onEdit,

  onDelete,

}) {

  return (

    <div className="plot-card">

      {/* Header */}

      <div className="plot-header">

        <div className="plot-title">

          {selectionMode && plot.status === "Available" && (

            <input
              type="checkbox"
              className="plot-checkbox"
              checked={checked}
              onChange={onCheck}
            />

          )}

          <h3>

            Plot - {plot.plot_no}

          </h3>

        </div>

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

          <span className="label">

            Size

          </span>

          <span className="value">

            {plot.plot_size} Sq.Yds

          </span>

        </div>

        <div className="plot-row">

          <span className="label">

            Facing

          </span>

          <span className="value">

            {plot.facing}

          </span>

        </div>

        <div className="plot-row">

          <span className="label">

            Rate

          </span>

          <span className="value">

            ₹{Number(plot.rate).toLocaleString("en-IN")}

          </span>

        </div>

        <div className="plot-row">

          <span className="label">

            Price

          </span>

          <span className="value">

            ₹{Number(plot.price).toLocaleString("en-IN")}

          </span>

        </div>

      </div>

      {/* Footer */}

      <div className="plot-footer">

        <button
          className="edit-btn"
          onClick={() => onEdit(plot)}
          title="Edit Plot"
        >

          <Pencil size={18} />

        </button>

        {plot.status === "Available" ? (

          <button
            className="book-btn"
            onClick={() => onBook(plot)}
          >

            <Calendar size={18} />

            Book Plot

          </button>

        ) : (

          <button
            className="view-btn"
            onClick={() => onView(plot)}
          >

            <Eye size={18} />

            View Details

          </button>

        )}

        <button
          className="delete-btn"
          onClick={() => onDelete(plot)}
          title="Delete Plot"
        >

          <Trash2 size={18} />

        </button>

      </div>

    </div>

  );

}

export default PlotCard;