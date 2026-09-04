import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Map as MapIcon,
  CheckCircle2,
  Bookmark,
  Home,
  IndianRupee,
  Wallet,
  CreditCard,
  Users,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../services/supabase";
import "./DashboardCards.css";

function getCanonicalCustomerFinancials(
  customer,
  totalPaidOverride
) {
  const total = Number(customer?.total_amount || 0);

  const paid = Number(
    totalPaidOverride ??
      customer?.amount_paid ??
      0
  );

  const balance = Math.max(
    total - paid,
    0
  );

  if (total > 0) {
    const completed = paid >= total;

    return {
      ...customer,
      amount_paid: paid,
      balance,
      status: completed
        ? "Sold"
        : "Booked",
      registration_status:
        completed
          ? "Completed"
          : "Pending",
    };
  }

  return {
    ...customer,
    amount_paid: paid,
    balance,
    status:
      customer?.status ||
      "Booked",
    registration_status:
      customer?.registration_status ||
      "Pending",
  };
}

function buildPaidMap(payments) {
  const paidByCustomer =
    new Map();

  (payments || []).forEach(
    (payment) => {
      const customerId =
        payment.customer_id;

      if (customerId == null) {
        return;
      }

      paidByCustomer.set(
        customerId,
        (paidByCustomer.get(
          customerId
        ) || 0) +
          Number(
            payment.amount || 0
          )
      );
    }
  );

  return paidByCustomer;
}

function DashboardCards() {
  const [stats, setStats] =
    useState({
      totalPlots: 0,
      available: 0,
      booked: 0,
      sold: 0,
      totalCustomers: 0,
      revenue: 0,
      collected: 0,
      pending: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [retrying, setRetrying] =
    useState(false);

  const fetchDashboardStats =
    useCallback(
      async ({
        isInitialLoad = false,
      } = {}) => {
        try {
          if (isInitialLoad) {
            setLoading(true);
          } else {
            setRetrying(true);
          }

          setErrorMessage("");

          const [
            plotResult,
            customerResult,
            paymentResult,
          ] = await Promise.all([
            supabase
              .from("plots")
              .select(
                "plot_no, customer_id, status"
              ),

            supabase
              .from("customers")
              .select(
                "id, total_amount, amount_paid, balance, status, registration_status"
              ),

            supabase
              .from("payments")
              .select(
                "customer_id, amount"
              ),
          ]);

          if (plotResult.error) {
            console.error(
              "Dashboard plots error:",
              plotResult.error
            );

            throw new Error(
              `Plots: ${plotResult.error.message}`
            );
          }

          if (customerResult.error) {
            console.error(
              "Dashboard customers error:",
              customerResult.error
            );

            throw new Error(
              `Customers: ${customerResult.error.message}`
            );
          }

          if (paymentResult.error) {
            console.error(
              "Dashboard payments error:",
              paymentResult.error
            );

            throw new Error(
              `Payments: ${paymentResult.error.message}`
            );
          }

          const plotData =
            plotResult.data || [];

          const customerData =
            customerResult.data || [];

          const paymentData =
            paymentResult.data || [];

          const paidByCustomer =
            buildPaidMap(
              paymentData
            );

          const customers =
            customerData.map(
              (customer) =>
                getCanonicalCustomerFinancials(
                  customer,
                  paidByCustomer.get(
                    customer.id
                  )
                )
            );

          const customerStatusMap =
            new Map(
              customers.map(
                (customer) => [
                  String(
                    customer.id
                  ),
                  customer.status,
                ]
              )
            );

          let available = 0;
          let booked = 0;
          let sold = 0;

          plotData.forEach(
            (plot) => {
              const linkedCustomerStatus =
                plot.customer_id ==
                null
                  ? null
                  : customerStatusMap.get(
                      String(
                        plot.customer_id
                      )
                    );

              let status =
                plot.status ||
                "Available";

              /*
               * Payment-derived customer
               * status has priority.
               */
              if (
                linkedCustomerStatus ===
                "Sold"
              ) {
                status = "Sold";
              } else if (
                linkedCustomerStatus ===
                "Booked"
              ) {
                status = "Booked";
              }

              const normalizedStatus =
                String(status)
                  .trim()
                  .toLowerCase();

              if (
                normalizedStatus ===
                "sold"
              ) {
                sold += 1;
              } else if (
                normalizedStatus ===
                "booked"
              ) {
                booked += 1;
              } else {
                available += 1;
              }
            }
          );

          const revenue =
            customers.reduce(
              (sum, customer) =>
                sum +
                Number(
                  customer.total_amount ||
                    0
                ),
              0
            );

          const collected =
            customers.reduce(
              (sum, customer) =>
                sum +
                Number(
                  customer.amount_paid ||
                    0
                ),
              0
            );

          const pending =
            customers.reduce(
              (sum, customer) =>
                sum +
                Number(
                  customer.balance ||
                    0
                ),
              0
            );

          setStats({
            totalPlots:
              plotData.length,
            available,
            booked,
            sold,
            totalCustomers:
              customers.length,
            revenue,
            collected,
            pending,
          });

          setLastUpdated(
            new Date()
          );

          setErrorMessage("");

          console.log(
            "Dashboard loaded:",
            {
              plots:
                plotData.length,
              customers:
                customers.length,
              payments:
                paymentData.length,
              available,
              booked,
              sold,
              revenue,
              collected,
              pending,
            }
          );
        } catch (error) {
          console.error(
            "Dashboard Error:",
            error
          );

          /*
           * IMPORTANT:
           * Keep the previous dashboard
           * values visible when a refresh
           * temporarily fails.
           */
          setErrorMessage(
            error?.message ||
              "Unable to load dashboard data."
          );
        } finally {
          setLoading(false);
          setRetrying(false);
        }
      },
      []
    );

  /*
   * ---------------------------------------------------------
   * INITIAL LOAD + REALTIME
   * ---------------------------------------------------------
   */
  useEffect(() => {
    let mounted = true;

    fetchDashboardStats({
      isInitialLoad: true,
    });

    const channel =
      supabase
        .channel(
          "dashboard-cards-live"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "payments",
          },
          () => {
            if (mounted) {
              fetchDashboardStats();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "customers",
          },
          () => {
            if (mounted) {
              fetchDashboardStats();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "plots",
          },
          () => {
            if (mounted) {
              fetchDashboardStats();
            }
          }
        )
        .subscribe((status) => {
          if (
            status ===
            "CHANNEL_ERROR"
          ) {
            console.warn(
              "Dashboard realtime connection failed. Manual refresh remains available."
            );
          }
        });

    return () => {
      mounted = false;
      supabase.removeChannel(
        channel
      );
    };
  }, [fetchDashboardStats]);

  /*
   * ---------------------------------------------------------
   * CARDS
   * ---------------------------------------------------------
   */
  const cards = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: `₹${stats.revenue.toLocaleString(
          "en-IN"
        )}`,
        subtitle:
          "Overall Sales Value",
        icon: (
          <IndianRupee
            size={28}
          />
        ),
        color: "purple",
        badge: "+ Revenue",
      },
      {
        title: "Amount Collected",
        value: `₹${stats.collected.toLocaleString(
          "en-IN"
        )}`,
        subtitle:
          "Payments Received",
        icon: (
          <Wallet size={28} />
        ),
        color: "blue",
        badge: "+ Collected",
      },
      {
        title: "Pending Amount",
        value: `₹${stats.pending.toLocaleString(
          "en-IN"
        )}`,
        subtitle:
          "Outstanding Balance",
        icon: (
          <CreditCard
            size={28}
          />
        ),
        color: "orange",
        badge: "Pending",
      },
      {
        title: "Customers",
        value: stats.totalCustomers,
        subtitle:
          "Registered Customers",
        icon: (
          <Users size={28} />
        ),
        color: "green",
        badge: `${stats.totalCustomers} Total`,
      },
      {
        title: "Total Plots",
        value: stats.totalPlots,
        subtitle:
          "Plots in Venture",
        icon: (
          <MapIcon size={28} />
        ),
        color: "indigo",
        badge: "Inventory",
      },
      {
        title: "Available",
        value: stats.available,
        subtitle:
          "Ready for Booking",
        icon: (
          <CheckCircle2
            size={28}
          />
        ),
        color: "emerald",
        badge: "Available",
      },
      {
        title: "Booked",
        value: stats.booked,
        subtitle:
          "Payment Pending",
        icon: (
          <Bookmark
            size={28}
          />
        ),
        color: "yellow",
        badge: "Reserved",
      },
      {
        title: "Sold",
        value: stats.sold,
        subtitle:
          "Registration Completed",
        icon: (
          <Home size={28} />
        ),
        color: "red",
        badge: "Completed",
      },
    ],
    [stats]
  );

  /*
   * ---------------------------------------------------------
   * INITIAL LOADING
   * ---------------------------------------------------------
   */
  if (loading) {
    return (
      <div className="dashboard-cards">
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <div
            key={index}
            className="luxury-card loading-card"
          >
            <div className="loading-shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard-cards">

      {/* =====================================================
          REFRESH ERROR
      ====================================================== */}

      {errorMessage && (
        <div className="dashboard-cards-alert">
          <div className="dashboard-cards-alert-icon">
            <AlertCircle
              size={19}
            />
          </div>

          <div className="dashboard-cards-alert-content">
            <strong>
              Dashboard refresh failed
            </strong>

            <span>
              {errorMessage}
            </span>
          </div>

          <button
            type="button"
            className="dashboard-cards-retry"
            onClick={() =>
              fetchDashboardStats()
            }
            disabled={retrying}
          >
            <RefreshCw
              size={15}
              className={
                retrying
                  ? "dashboard-retry-spin"
                  : ""
              }
            />
            {retrying
              ? "Retrying..."
              : "Retry"}
          </button>
        </div>
      )}

      {cards.map(
        (card, index) => (
          <div
            key={index}
            className={`luxury-card ${card.color}`}
          >
            <div className="card-top">
              <div className="icon-box">
                {card.icon}
              </div>

              <div className="card-badge">
                <TrendingUp
                  size={14}
                />
                <span>
                  {card.badge}
                </span>
              </div>
            </div>

            <div className="card-content">
              <h4>
                {card.title}
              </h4>

              <h2>
                {card.value}
              </h2>

              <p>
                {card.subtitle}
              </p>
            </div>

            <div className="card-glow"></div>
          </div>
        )
      )}

      {/* =====================================================
          LAST UPDATED
      ====================================================== */}

      {lastUpdated && (
        <div className="dashboard-cards-status">
          <span>
            Data updated{" "}
            {lastUpdated.toLocaleTimeString(
              "en-IN",
              {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }
            )}
          </span>

          {retrying && (
            <span className="dashboard-refreshing">
              <RefreshCw
                size={12}
                className="dashboard-retry-spin"
              />
              Refreshing...
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardCards;
