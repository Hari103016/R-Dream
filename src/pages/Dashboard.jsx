import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCards from "../components/DashboardCards";
import QuickActions from "../components/QuickActions";
import RevenueChart from "../components/RevenueChart";
import RecentCustomers from "../components/RecentCustomers";

import "./Dashboard.css";

function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard">

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="main-content">

        <Topbar
          setSidebarOpen={setSidebarOpen}
        />

        <div className="dashboard-body">

          <DashboardCards />

          <div className="dashboard-grid">
            <QuickActions />
          </div>

          <RevenueChart />

          <RecentCustomers />

        </div>

      </div>

    </div>
  );
}

export default Dashboard;