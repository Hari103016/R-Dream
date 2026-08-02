import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "./RecentActivity.css";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Activities Data:", data);
    console.log("Activities Error:", error);

    if (error) {
      console.error(error);
    } else {
      setActivities(data || []);
    }

    setLoading(false);
  }

  return (
    <div className="activity-card">
      <h2>📋 Recent Activity</h2>

      <p style={{ color: "white" }}>
        Loading: {loading ? "Yes" : "No"}
      </p>

      <p style={{ color: "white" }}>
        Total Activities: {activities.length}
      </p>

      {activities.length === 0 ? (
        <p style={{ color: "orange" }}>No activities found.</p>
      ) : (
        activities.map((item) => (
          <div className="activity-item" key={item.id}>
            <h4>{item.title}</h4>
            <p>{item.description}</p>
            <small>{new Date(item.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
}

export default RecentActivity;