import { useEffect, useMemo, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

import { IndianRupee } from "lucide-react";

import { supabase } from "../services/supabase";

import "./RevenueChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

function RevenueChart() {
  /* ===========================================
     STATE
  =========================================== */

  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  /* ===========================================
     FETCH PAYMENTS
  =========================================== */

  useEffect(() => {
    fetchRevenue();
  }, []);

  async function fetchRevenue() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("payments")
        .select("amount,payment_date")
        .order("payment_date", {
          ascending: true,
        });

      if (error) throw error;

      setPayments(data || []);
    } catch (error) {
      console.error(
        "Revenue Chart Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===========================================
     MONTHLY DATA
  =========================================== */

  const monthlyStats = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const revenue = new Array(12).fill(0);

    payments.forEach((payment) => {
      const date = new Date(payment.payment_date);

      const month = date.getMonth();

      revenue[month] += Number(
        payment.amount || 0
      );
    });

    const thisMonth =
      revenue[new Date().getMonth()];

    const highest =
      Math.max(...revenue);

    const average =
      revenue.reduce(
        (a, b) => a + b,
        0
      ) / 12;

    return {
      months,
      revenue,
      thisMonth,
      highest,
      average,
    };
  }, [payments]);

  /* ===========================================
     CHART DATA
  =========================================== */
    const data = {
    labels: monthlyStats.months,

    datasets: [
      {
        label: "Revenue",

        data: monthlyStats.revenue,

        borderColor: "#3B82F6",

        backgroundColor: "rgba(59,130,246,.15)",

        fill: true,

        tension: 0.4,

        pointRadius: 5,

        pointHoverRadius: 8,

        pointBackgroundColor: "#3B82F6",

        pointBorderColor: "#FFFFFF",

        pointBorderWidth: 2,
      },
    ],
  };

  /* ===========================================
     CHART OPTIONS
  =========================================== */

  const options = {
    responsive: true,

    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#111827",

        borderColor: "#2563EB",

        borderWidth: 1,

        padding: 12,

        titleColor: "#FFFFFF",

        bodyColor: "#CBD5E1",

        callbacks: {
          label: function (context) {
            return (
              " Revenue : ₹" +
              Number(
                context.raw
              ).toLocaleString("en-IN")
            );
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#94A3B8",
          font: {
            size: 12,
          },
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: "rgba(255,255,255,.05)",
        },

        ticks: {
          color: "#94A3B8",

          callback(value) {
            return (
              "₹" +
              (
                Number(value) / 100000
              ).toFixed(1) +
              "L"
            );
          },
        },
      },
    },
  };

  /* ===========================================
     RETURN
  =========================================== */

  return (
    <div className="revenue-chart">

  {/* ===========================================
      HEADER
  =========================================== */}

  <div className="chart-header">

    <div>

      <h2>Revenue Analytics</h2>

      <p>Monthly payment collection overview</p>

    </div>

  </div>

  {/* ===========================================
      SUMMARY CARDS
  =========================================== */}

  <div className="chart-stats">

    <div className="mini-card">

      <div className="mini-icon blue">
        <IndianRupee size={20} />
      </div>

      <div>

        <span>This Month</span>

        <h3>
          ₹
          {monthlyStats.thisMonth.toLocaleString(
            "en-IN"
          )}
        </h3>

      </div>

    </div>

    <div className="mini-card">

      <div className="mini-icon green">
        <IndianRupee size={20} />
      </div>

      <div>

        <span>Highest Month</span>

        <h3>
          ₹
          {monthlyStats.highest.toLocaleString(
            "en-IN"
          )}
        </h3>

      </div>

    </div>

    <div className="mini-card">

      <div className="mini-icon purple">
        <IndianRupee size={20} />
      </div>

      <div>

        <span>Average Month</span>

        <h3>
          ₹
          {monthlyStats.average.toLocaleString(
            "en-IN",
            {
              maximumFractionDigits: 0,
            }
          )}
        </h3>

      </div>

    </div>

  </div>

  {/* ===========================================
      CHART
  =========================================== */}

  <div className="chart-box">

    {loading ? (

      <div className="chart-loading">
        Loading Revenue Chart...
      </div>

    ) : (

      <Line
        data={data}
        options={options}
      />

    )}

  </div>

</div>
  );
}

export default RevenueChart;