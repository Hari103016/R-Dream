import { useEffect, useState } from "react";
import {
  MapPinned,
  CalendarDays,
  Trash2,
  CreditCard,
  UserPlus,
  Edit3,
  Activity,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../services/supabase";

import "./RecentActivity.css";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", {
          ascending: false,
        })
        .limit(8);

      if (error) {
        console.error("Activity Log Error:", error);
        setActivities([]);
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error("Activity Log Error:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  function getIcon(action) {
    const value = action?.toLowerCase() || "";

    if (value.includes("plot")) {
      return <MapPinned size={18} />;
    }

    if (
      value.includes("booking") ||
      value.includes("book")
    ) {
      return <CalendarDays size={18} />;
    }

    if (
      value.includes("payment") ||
      value.includes("received")
    ) {
      return <CreditCard size={18} />;
    }

    if (
      value.includes("delete") ||
      value.includes("deleted")
    ) {
      return <Trash2 size={18} />;
    }

    if (
      value.includes("customer") ||
      value.includes("user")
    ) {
      return <UserPlus size={18} />;
    }

    if (
      value.includes("edit") ||
      value.includes("update")
    ) {
      return <Edit3 size={18} />;
    }

    return <Activity size={18} />;
  }

  function getColor(action) {
    const value = action?.toLowerCase() || "";

    if (value.includes("delete")) {
      return "red";
    }

    if (
      value.includes("payment") ||
      value.includes("received")
    ) {
      return "purple";
    }

    if (
      value.includes("booking") ||
      value.includes("book")
    ) {
      return "orange";
    }

    if (value.includes("plot")) {
      return "green";
    }

    if (value.includes("customer")) {
      return "blue";
    }

    return "blue";
  }

  function formatTime(dateString) {
    if (!dateString) {
      return "Unknown time";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Unknown time";
    }

    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const seconds = Math.floor(
      difference / 1000
    );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes < 60) {
      return `${minutes} min${
        minutes === 1 ? "" : "s"
      } ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? "" : "s"
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} day${
        days === 1 ? "" : "s"
      } ago`;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <div className="recent-activity">

      {/* Header */}

      <div className="activity-header">

        <div className="activity-title">

          <div className="activity-title-icon">
            <Activity size={20} />
          </div>

          <div>
            <h2>Recent Activity</h2>

            <p>
              Latest actions performed in the system
            </p>
          </div>

        </div>

        <button
          className="activity-refresh"
          onClick={fetchActivities}
          title="Refresh activities"
        >
          <RefreshCw size={17} />
        </button>

      </div>

      {/* Content */}

      {loading ? (
        <div className="activity-loading">

          <div className="activity-spinner"></div>

          <span>
            Loading activities...
          </span>

        </div>
      ) : activities.length === 0 ? (
        <div className="activity-empty">

          <div className="empty-icon">
            <Activity size={24} />
          </div>

          <h3>No Recent Activity</h3>

          <p>
            Activities will appear here when
            actions are performed.
          </p>

        </div>
      ) : (
        <div className="activity-list">

          {activities.map(
            (activity, index) => {

              const color =
                getColor(activity.action);

              return (
                <div
                  className="activity-item"
                  key={
                    activity.id ||
                    `${activity.created_at}-${index}`
                  }
                >

                  {/* Timeline */}

                  <div className="activity-timeline">

                    <div
                      className={`activity-icon ${color}`}
                    >
                      {getIcon(
                        activity.action
                      )}
                    </div>

                    {index !==
                      activities.length - 1 && (
                      <div className="timeline-line"></div>
                    )}

                  </div>

                  {/* Details */}

                  <div className="activity-details">

                    <div className="activity-main">

                      <h3>
                        {activity.action ||
                          "Activity"}
                      </h3>

                      <span
                        className={`activity-badge ${color}`}
                      >
                        {activity.user_name ||
                          "Admin"}
                      </span>

                    </div>

                    <p>
                      {activity.description ||
                        "An action was performed."}
                    </p>

                    <span className="activity-time">
                      {formatTime(
                        activity.created_at
                      )}
                    </span>

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}

export default RecentActivity;