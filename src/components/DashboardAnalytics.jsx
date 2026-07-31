import "./DashboardAnalytics.css";

export default function DashboardAnalytics() {
  return (
    <div className="analytics-grid">
      <div className="analytics-card">💰 Total Revenue</div>
      <div className="analytics-card">📈 Monthly Revenue</div>
      <div className="analytics-card">🏡 Available Plots</div>
      <div className="analytics-card">👥 Total Customers</div>

      <div className="analytics-panel">
        <h3>Plot Status</h3>
        <p>Replace with a Pie Chart (Chart.js).</p>
      </div>

      <div className="analytics-panel">
        <h3>Monthly Revenue</h3>
        <p>Replace with a Bar Chart (Chart.js).</p>
      </div>

      <div className="analytics-panel">
        <h3>Recent Activity</h3>
        <p>Display latest bookings, payments and updates.</p>
      </div>
    </div>
  );
}