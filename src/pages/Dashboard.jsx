import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import DashboardCards from "../components/DashboardCards";
import QuickActions from "../components/QuickActions";
import RevenueChart from "../components/RevenueChart";
import RecentCustomers from "../components/RecentCustomers";
import RecentActivity from "../components/RecentActivity";
import TodaysBookings from "../components/TodaysBookings";
import PaymentReminders from "../components/PaymentReminders";

import "./Dashboard.css";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard">

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <div className="main-content">

        {/* ========================================
            TOPBAR
        ======================================== */}

        <Topbar
          setSidebarOpen={setSidebarOpen}
        />

        {/* ========================================
            DASHBOARD BODY
        ======================================== */}

        <div className="dashboard-body">

          {/* ======================================
              DASHBOARD STATISTICS
          ====================================== */}

          <DashboardCards />

          {/* ======================================
              QUICK ACTIONS
          ====================================== */}

          <QuickActions />

          {/* ======================================
              REVENUE ANALYTICS
          ====================================== */}

          <RevenueChart />

          {/* ======================================
              RECENT CUSTOMERS + ACTIVITY
          ====================================== */}

          <div className="dashboard-grid">

            <RecentCustomers />

            <RecentActivity />

          </div>

          {/* ======================================
              TODAY'S BOOKINGS + PAYMENT REMINDERS
          ====================================== */}

          <div className="dashboard-grid">

            <TodaysBookings />

            <PaymentReminders />

          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;