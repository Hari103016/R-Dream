import { useEffect, useState } from "react";
import {
  Map,
  CheckCircle2,
  Home,
  IndianRupee,
  TrendingUp,
} from "lucide-react";

import { supabase } from "../services/supabase";
import "./DashboardCards.css";

function DashboardCards() {
  const [stats, setStats] = useState({
    totalPlots: 0,
    available: 0,
    sold: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      // Total Plots
      const { count: totalPlots } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      // Available
      const { count: available } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("status", "Available");

      // Booked
      const { count: sold } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("status", "Booked");
      // Revenue
      const { data } = await supabase
        .from("customers")
        .select("total_amount");

      const revenue =
        data?.reduce(
        (sum, item) => sum + Number(item.total_amount || 0),
        0
      ) || 0;

      setStats({
        totalPlots: totalPlots || 0,
        available: available || 0,
        sold: sold || 0,
        revenue,
      });
    } catch (error) {
      console.error(error);
    }
  }

  const cards = [
    {
      title: "Total Plots",
      value: stats.totalPlots,
      icon: <Map size={34} />,
      color: "#4F8CFF",
      growth: "+12%",
    },
    {
      title: "Available",
      value: stats.available,
      icon: <CheckCircle2 size={34} />,
      color: "#10B981",
      growth: "+8%",
    },
    {
      title: "Sold",
      value: stats.sold,
      icon: <Home size={34} />,
      color: "#F59E0B",
      growth: "+25%",
    },
    {
      title: "Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: <IndianRupee size={34} />,
      color: "#8B5CF6",
      growth: "+18%",
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
              {card.growth}
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