import { useEffect, useState } from "react";
import {
  Map,
  CheckCircle2,
  Bookmark,
  Home,
  IndianRupee,
  Wallet,
  CreditCard,
  TrendingUp,
} from "lucide-react";

import { supabase } from "../services/supabase";
import "./DashboardCards.css";

function DashboardCards() {
  const [stats, setStats] = useState({
    totalPlots: 0,
    available: 0,
    booked: 0,
    sold: 0,
    revenue: 0,
    collected: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      // -----------------------------
      // Plot Statistics
      // -----------------------------
      const { count: totalPlots } = await supabase
        .from("plots")
        .select("*", { count: "exact", head: true });

      const { count: available } = await supabase
        .from("plots")
        .select("*", { count: "exact", head: true })
        .eq("status", "Available");

      const { count: booked } = await supabase
        .from("plots")
        .select("*", { count: "exact", head: true })
        .eq("status", "Booked");

      const { count: sold } = await supabase
        .from("plots")
        .select("*", { count: "exact", head: true })
        .eq("status", "Sold");

      // -----------------------------
      // Financial Statistics
      // -----------------------------
      const { data: customers } = await supabase
        .from("customers")
        .select(
          "total_amount, amount_paid, balance"
        );

      const revenue =
        customers?.reduce(
          (sum, c) => sum + Number(c.total_amount || 0),
          0
        ) || 0;

      const collected =
        customers?.reduce(
          (sum, c) => sum + Number(c.amount_paid || 0),
          0
        ) || 0;

      const pending =
        customers?.reduce(
          (sum, c) => sum + Number(c.balance || 0),
          0
        ) || 0;

      setStats({
        totalPlots: totalPlots || 0,
        available: available || 0,
        booked: booked || 0,
        sold: sold || 0,
        revenue,
        collected,
        pending,
      });
    } catch (err) {
      console.error(err);
    }
  }

  const cards = [
    {
      title: "Total Plots",
      value: stats.totalPlots,
      icon: <Map size={32} />,
      color: "#2563EB",
    },
    {
      title: "Available",
      value: stats.available,
      icon: <CheckCircle2 size={32} />,
      color: "#10B981",
    },
    {
      title: "Booked",
      value: stats.booked,
      icon: <Bookmark size={32} />,
      color: "#F59E0B",
    },
    {
      title: "Sold",
      value: stats.sold,
      icon: <Home size={32} />,
      color: "#EF4444",
    },
    {
      title: "Revenue",
      value: `₹${stats.revenue.toLocaleString("en-IN")}`,
      icon: <IndianRupee size={32} />,
      color: "#8B5CF6",
    },
    {
      title: "Collected",
      value: `₹${stats.collected.toLocaleString("en-IN")}`,
      icon: <Wallet size={32} />,
      color: "#06B6D4",
    },
    {
      title: "Pending",
      value: `₹${stats.pending.toLocaleString("en-IN")}`,
      icon: <CreditCard size={32} />,
      color: "#F97316",
    },
  ];

  return (
    <div className="dashboard-cards">
      {cards.map((card, index) => (
        <div className="luxury-card" key={index}>
          <div className="card-top">
            <div
              className="icon-box"
              style={{ background: card.color }}
            >
              {card.icon}
            </div>

            <div className="growth">
              <TrendingUp size={16} />
            </div>
          </div>

          <h4>{card.title}</h4>
          <h1>{card.value}</h1>
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;