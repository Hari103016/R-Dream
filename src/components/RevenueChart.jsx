import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

import "./RevenueChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function RevenueChart() {
  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
    ],
    datasets: [
      {
        label: "Revenue",
        data: [
          120000,
          180000,
          250000,
          220000,
          300000,
          420000,
          500000,
        ],
        borderColor: "#2563EB",
        backgroundColor: "rgba(37,99,235,.15)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#94A3B8",
        },
        grid: {
          color: "rgba(255,255,255,.05)",
        },
      },
      y: {
        ticks: {
          color: "#94A3B8",
        },
        grid: {
          color: "rgba(255,255,255,.05)",
        },
      },
    },
  };

  return (
    <div className="revenue-chart">
      <h2>📈 Monthly Revenue</h2>

      <Line data={data} options={options} />
    </div>
  );
}

export default RevenueChart;