import { Link } from "react-router-dom";
import { useState } from "react";
import {
  UserPlus,
  MapPinned,
  CalendarCheck,
  CreditCard,
  MapPin,
  BellRing,
  FolderOpen,
  Settings2,
  ArrowUpRight,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardCards from "../components/DashboardCards";
import RevenueChart from "../components/RevenueChart";

import "./Dashboard.css";

const quickActions = [
  {
    title: "Add Customer",
    description: "Register a new customer",
    path: "/customers",
    icon: UserPlus,
    tone: "blue",
  },
  {
    title: "Manage Plots",
    description: "View and update plot inventory",
    path: "/plots",
    icon: MapPinned,
    tone: "green",
  },
  {
    title: "Bookings",
    description: "Manage plot bookings",
    path: "/bookings",
    icon: CalendarCheck,
    tone: "orange",
  },
  {
    title: "Payments",
    description: "Track payment collections",
    path: "/payments",
    icon: CreditCard,
    tone: "purple",
  },
  {
    title: "Site Visits",
    description: "Schedule and track visits",
    path: "/site-visits",
    icon: MapPin,
    tone: "cyan",
  },
  {
    title: "Follow-ups",
    description: "Manage customer follow-ups",
    path: "/follow-ups",
    icon: BellRing,
    tone: "gold",
  },
  {
    title: "Documents",
    description: "Manage customer documents",
    path: "/documents",
    icon: FolderOpen,
    tone: "teal",
  },
  {
    title: "Settings",
    description: "Configure CRM settings",
    path: "/settings",
    icon: Settings2,
    tone: "red",
  },
];

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard dashboard-command">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="main-content dashboard-main">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <main className="dashboard-body">
          {/* HERO */}
          <header className="command-hero">
            <div className="command-hero-content">
              <div className="command-eyebrow">
                <span className="command-eyebrow-line" />
                R DREAM INFRA DEVELOPERS
              </div>

              <h1>Real Estate Command Center</h1>

              <p>
                Manage customers, plots, bookings, collections and daily
                operations from one place.
              </p>

              <div className="command-hero-meta">
                <span className="command-live">
                  <span className="command-live-dot" />
                  System Online
                </span>

                <span className="command-meta-divider" />

                <span>Live CRM workspace</span>
              </div>
            </div>

            <div className="command-hero-orbit">
              <div className="orbit-ring orbit-ring-one" />
              <div className="orbit-ring orbit-ring-two" />

              <div className="orbit-core">
                <span>R</span>
                <small>DREAM</small>
              </div>
            </div>
          </header>

          {/* BUSINESS SNAPSHOT */}
          <section className="command-section command-snapshot">
            <div className="command-section-head">
              <div>
                <div className="command-kicker">
                  <span>01</span>
                  BUSINESS SNAPSHOT
                </div>

                <h2>Today's numbers</h2>
              </div>

              <div className="command-section-note">
                Live values from your CRM
              </div>
            </div>

            <div className="command-card-wrap">
              <DashboardCards />
            </div>
          </section>

          {/* QUICK WORKSPACE */}
          <section className="command-section">
            <div className="command-section-head">
              <div>
                <div className="command-kicker">
                  <span>02</span>
                  OPERATIONS
                </div>

                <h2>Quick workspace</h2>
              </div>

              <div className="command-section-note">
                Open a module directly
              </div>
            </div>

            <div className="command-actions-grid">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.path}
                    to={action.path}
                    className={`command-action-card ${action.tone}`}
                  >
                    <div className="command-action-icon">
                      <Icon size={22} strokeWidth={2.2} />
                    </div>

                    <div className="command-action-copy">
                      <strong>{action.title}</strong>
                      <span>{action.description}</span>
                    </div>

                    <ArrowUpRight
                      className="command-action-arrow"
                      size={19}
                      strokeWidth={2}
                    />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* REVENUE */}
          <section className="command-section">
            <div className="command-section-head">
              <div>
                <div className="command-kicker">
                  <span>03</span>
                  FINANCIAL INTELLIGENCE
                </div>

                <h2>Revenue performance</h2>
              </div>

              <div className="command-section-note">
                Payment collection overview
              </div>
            </div>

            <div className="command-panel command-chart-panel">
              <div className="command-panel-topline">
                <div>
                  <span className="command-panel-label">
                    COLLECTION TREND
                  </span>

                  <h3>Revenue analytics</h3>
                </div>

                <div className="command-panel-badge">
                  <span />
                  Live data
                </div>
              </div>

              <RevenueChart />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
