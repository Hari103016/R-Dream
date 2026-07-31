import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function DashboardCharts({ available, booked, revenue, balance }) {
  const pieData = {
    labels: ["Available", "Booked"],
    datasets: [
      {
        data: [available, booked],
      },
    ],
  };

  const barData = {
    labels: ["Revenue", "Balance"],
    datasets: [
      {
        label: "Amount",
        data: [revenue, balance],
      },
    ],
  };

  return (
    <div className="charts-container">
      <div className="chart-card">
        <h3>Plots Status</h3>
        <Pie data={pieData} />
      </div>

      <div className="chart-card">
        <h3>Revenue</h3>
        <Bar data={barData} />
      </div>
    </div>
  );
}

export default DashboardCharts;