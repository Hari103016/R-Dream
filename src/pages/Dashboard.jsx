import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCards from "../components/DashboardCards";
import QuickActions from "../components/QuickActions";
import RevenueChart from "../components/RevenueChart";
import RecentCustomers from "../components/RecentCustomers";

import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

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