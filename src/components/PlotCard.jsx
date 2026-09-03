import {
  Pencil,
  Trash2,
  Calendar,
  Eye,
  MapPinned,
  Star,
  BadgeCheck,
  ArrowUpRight,
  Ruler,
  Compass,
  Route,
  IndianRupee,
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

  const status =
    plot.status || "Available";


  const statusClass =
    status === "Available"
      ? "available"
      : status === "Booked"
      ? "booked"
      : "sold";


  const size =
    plot.plot_size ||
    plot.size ||
    0;


  const facing =
    plot.facing ||
    "East";


  const road =
    plot.road_width ||
    "24 Ft";


  const rate =
    Number(plot.rate || 0);


  const price =
    Number(plot.price || 0);


  return (

    <div className="plot-card">

      <div className="shine"></div>


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="plot-header">

        <div className="plot-title">

          {selectionMode &&
            status === "Available" && (

              <input
                type="checkbox"
                className="plot-checkbox"
                checked={checked}
                onChange={onCheck}
                onClick={(e) =>
                  e.stopPropagation()
                }
              />

            )}


          <h3>

            <MapPinned size={20} />

            Plot-{plot.plot_no}

          </h3>

        </div>


        <span
          className={`status ${statusClass}`}
        >
          {status}
        </span>

      </div>


      {/* =================================================
          BADGES
      ================================================= */}

      {(plot.premium || plot.dtcp) && (

        <div className="plot-badges">

          {plot.premium && (

            <span className="premium-badge">

              <Star size={14} />

              Premium

            </span>

          )}


          {plot.dtcp && (

            <span className="dtcp-badge">

              <BadgeCheck size={14} />

              DTCP

            </span>

          )}

        </div>

      )}


      {/* =================================================
          DETAILS
      ================================================= */}

      <div className="plot-details">


        {/* SIZE */}

        <div className="detail-row">

          <span className="detail-label">

            <Ruler size={16} />

            Size

          </span>


          <span className="detail-value">

            {size} Sq.Yds

          </span>

        </div>


        {/* FACING */}

        <div className="detail-row">

          <span className="detail-label">

            <Compass size={16} />

            Facing

          </span>


          <span className="detail-value">

            {facing}

          </span>

        </div>


        {/* ROAD */}

        <div className="detail-row">

          <span className="detail-label">

            <Route size={16} />

            Road

          </span>


          <span className="detail-value">

            {road}

          </span>

        </div>


        {/* RATE */}

        <div className="detail-row">

          <span className="detail-label">

            <IndianRupee size={16} />

            Rate

          </span>


          <span className="detail-value">

            ₹
            {rate.toLocaleString("en-IN")}

          </span>

        </div>

      </div>


      {/* =================================================
          PRICE
      ================================================= */}

      <div className="price-card">

        <span className="price-title">

          Current Price

        </span>


        <h2>

          ₹
          {price.toLocaleString("en-IN")}

        </h2>


        <div className="price-growth">

          <ArrowUpRight size={15} />

          +8% Appreciation

        </div>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="plot-footer">


        {/* EDIT */}

        <button
          type="button"
          className="edit-btn"
          onClick={() =>
            onEdit && onEdit(plot)
          }
          title="Edit Plot"
        >

          <Pencil size={18} />

        </button>


        {/* BOOK / VIEW */}

        {status === "Available" ? (

          <button
            type="button"
            className="book-btn"
            onClick={() =>
              onBook && onBook(plot)
            }
          >

            <Calendar size={18} />

            Book Plot

          </button>

        ) : (

          <button
            type="button"
            className="view-btn"
            onClick={() =>
              onView && onView(plot)
            }
          >

            <Eye size={18} />

            View Details

          </button>

        )}


        {/* DELETE */}

        <button
          type="button"
          className="delete-btn"
          onClick={() =>
            onDelete && onDelete(plot)
          }
          title="Delete Plot"
        >

          <Trash2 size={18} />

        </button>

      </div>

    </div>
  );
}


export default PlotCard;