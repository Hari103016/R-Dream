import { useEffect, useState } from "react";
import {
  Users,
  MapPinned,
  IndianRupee,
  Wallet,
} from "lucide-react";
import { supabase } from "../services/supabase";
import "./Reports.css";

function Reports() {
  const [report, setReport] = useState({
    totalCustomers: 0,
    totalPlots: 0,
    availablePlots: 0,
    bookedPlots: 0,
    totalRevenue: 0,
    pendingBalance: 0,
  });

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    const { data: customers } = await supabase
      .from("customers")
      .select("*");

    const { data: plots } = await supabase
      .from("plots")
      .select("*");

    const totalRevenue =
      customers?.reduce(
        (sum, c) => sum + Number(c.amount_paid || 0),
        0
      ) || 0;

    const pendingBalance =
      customers?.reduce(
        (sum, c) => sum + Number(c.balance || 0),
        0
      ) || 0;

    setReport({
      totalCustomers: customers?.length || 0,
      totalPlots: plots?.length || 0,
      availablePlots:
        plots?.filter(
          (p) =>
            p.status?.toLowerCase() === "available"
        ).length || 0,
      bookedPlots:
        plots?.filter(
          (p) =>
            p.status?.toLowerCase() === "booked"
        ).length || 0,
      totalRevenue,
      pendingBalance,
    });
  }

  return (
    <div className="reports-page">

      <h2>Reports</h2>

      <div className="report-grid">

        <div className="report-card">

          <Users size={35} />

          <h4>Total Customers</h4>

          <h2>{report.totalCustomers}</h2>

        </div>

        <div className="report-card">

          <MapPinned size={35} />

          <h4>Total Plots</h4>

          <h2>{report.totalPlots}</h2>

        </div>

        <div className="report-card">

          <MapPinned size={35} />

          <h4>Available</h4>

          <h2>{report.availablePlots}</h2>

        </div>

        <div className="report-card">

          <MapPinned size={35} />

          <h4>Booked</h4>

          <h2>{report.bookedPlots}</h2>

        </div>

        <div className="report-card">

          <IndianRupee size={35} />

          <h4>Total Revenue</h4>

          <h2>
            ₹
            {report.totalRevenue.toLocaleString("en-IN")}
          </h2>

        </div>

        <div className="report-card">

          <Wallet size={35} />

          <h4>Pending Balance</h4>

          <h2>
            ₹
            {report.pendingBalance.toLocaleString("en-IN")}
          </h2>

        </div>

      </div>

    </div>
  );
}

export default Reports;