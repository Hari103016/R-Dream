import "./DashboardAnalytics.css";

function DashboardAnalytics() {
  return (
    <div className="analytics-grid">
      {/* Summary Cards */}

      <div className="analytics-card">
        <h3>💰 Total Revenue</h3>
        <p>Overall project revenue</p>
      </div>

      <div className="analytics-card">
        <h3>📈 Monthly Revenue</h3>
        <p>Current month's revenue</p>
      </div>

      <div className="analytics-card">
        <h3>🏡 Available Plots</h3>
        <p>Available plots overview</p>
      </div>

      <div className="analytics-card">
        <h3>👥 Total Customers</h3>
        <p>Registered customers</p>
      </div>

      {/* Chart Panels */}

      <div className="analytics-panel">
        <h3>📊 Plot Status</h3>
        <p>Replace with a Pie Chart (Chart.js / Recharts).</p>
      </div>

      <div className="analytics-panel">
        <h3>📉 Monthly Revenue</h3>
        <p>Replace with a Bar Chart (Chart.js / Recharts).</p>
      </div>
    </div>
  );
}

export default DashboardAnalytics;