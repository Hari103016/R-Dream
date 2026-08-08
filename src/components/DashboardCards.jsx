import { useEffect, useMemo, useState } from "react";
import {
  Map,
  CheckCircle2,
  Bookmark,
  Home,
  IndianRupee,
  Wallet,
  CreditCard,
  Users,
  TrendingUp,
} from "lucide-react";

import { supabase } from "../services/supabase";
import "./DashboardCards.css";

function DashboardCards() {
  /* ===========================================
     STATE
  =========================================== */

  const [stats, setStats] = useState({
    totalPlots: 0,
    available: 0,
    booked: 0,
    sold: 0,
    totalCustomers: 0,
    revenue: 0,
    collected: 0,
    pending: 0,
  });

  const [loading, setLoading] = useState(true);

  /* ===========================================
     LOAD DASHBOARD
  =========================================== */

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  /* ===========================================
     FETCH DASHBOARD DATA
  =========================================== */

  async function fetchDashboardStats() {
    try {
      setLoading(true);

      // -----------------------------
      // Plot Statistics
      // -----------------------------

      const { count: totalPlots } = await supabase
        .from("plots")
        .select("*", {
          count: "exact",
          head: true,
        });

      const { count: available } = await supabase
        .from("plots")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("status", "Available");

      const { count: booked } = await supabase
        .from("plots")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("status", "Booked");

      const { count: sold } = await supabase
        .from("plots")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("status", "Sold");

      // -----------------------------
      // Customer Statistics
      // -----------------------------

      const {
        data: customers,
        count: totalCustomers,
      } = await supabase
        .from("customers")
        .select(
          "total_amount, amount_paid, balance",
          {
            count: "exact",
          }
        );

      const revenue =
        customers?.reduce(
          (sum, customer) =>
            sum +
            Number(customer.total_amount || 0),
          0
        ) || 0;

      const collected =
        customers?.reduce(
          (sum, customer) =>
            sum +
            Number(customer.amount_paid || 0),
          0
        ) || 0;

      const pending =
        customers?.reduce(
          (sum, customer) =>
            sum +
            Number(customer.balance || 0),
          0
        ) || 0;

      setStats({
        totalPlots: totalPlots || 0,
        available: available || 0,
        booked: booked || 0,
        sold: sold || 0,
        totalCustomers:
          totalCustomers || 0,
        revenue,
        collected,
        pending,
      });

    } catch (error) {

      console.error(
        "Dashboard Error:",
        error
      );

    } finally {

      setLoading(false);

    }
  }

  /* ===========================================
     CARD DATA
  =========================================== */
    const cards = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: `₹${stats.revenue.toLocaleString("en-IN")}`,
        subtitle: "Overall Sales Value",
        icon: <IndianRupee size={28} />,
        color: "purple",
        badge: "+ Revenue",
      },

      {
        title: "Amount Collected",
        value: `₹${stats.collected.toLocaleString("en-IN")}`,
        subtitle: "Payments Received",
        icon: <Wallet size={28} />,
        color: "blue",
        badge: "+ Collected",
      },

      {
        title: "Pending Amount",
        value: `₹${stats.pending.toLocaleString("en-IN")}`,
        subtitle: "Outstanding Balance",
        icon: <CreditCard size={28} />,
        color: "orange",
        badge: "Pending",
      },

      {
        title: "Customers",
        value: stats.totalCustomers,
        subtitle: "Registered Customers",
        icon: <Users size={28} />,
        color: "green",
        badge: `${stats.totalCustomers} Total`,
      },

      {
        title: "Total Plots",
        value: stats.totalPlots,
        subtitle: "Plots in Venture",
        icon: <Map size={28} />,
        color: "indigo",
        badge: "Inventory",
      },

      {
        title: "Available",
        value: stats.available,
        subtitle: "Ready for Booking",
        icon: <CheckCircle2 size={28} />,
        color: "emerald",
        badge: "Available",
      },

      {
        title: "Booked",
        value: stats.booked,
        subtitle: "Advance Paid",
        icon: <Bookmark size={28} />,
        color: "yellow",
        badge: "Reserved",
      },

      {
        title: "Sold",
        value: stats.sold,
        subtitle: "Registration Completed",
        icon: <Home size={28} />,
        color: "red",
        badge: "Completed",
      },
    ],
    [stats]
  );

  /* ===========================================
     RETURN
  =========================================== */

  return (
    <div className="dashboard-cards">

  {loading ? (

    Array.from({ length: 8 }).map((_, index) => (

      <div
        key={index}
        className="luxury-card loading-card"
      >

        <div className="loading-shimmer"></div>

      </div>

    ))

  ) : (

    cards.map((card, index) => (

      <div
        key={index}
        className={`luxury-card ${card.color}`}
      >

        {/* ==========================
            TOP
        ========================== */}

        <div className="card-top">

          <div className="icon-box">

            {card.icon}

          </div>

          <div className="card-badge">

            <TrendingUp size={14} />

            <span>{card.badge}</span>

          </div>

        </div>

        {/* ==========================
            CONTENT
        ========================== */}

        <div className="card-content">

          <h4>{card.title}</h4>

          <h2>{card.value}</h2>

          <p>{card.subtitle}</p>

        </div>

        {/* ==========================
            DECORATION
        ========================== */}

        <div className="card-glow"></div>

      </div>

    ))

  )}

</div>
  );
}

export default DashboardCards;