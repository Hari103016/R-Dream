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
  ChevronDown,
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

const SELECTED_VENTURE_STORAGE_KEY = "r-dream-selected-venture-id";

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

  // Added venture selector; existing dashboard cards remain unchanged.
  const [ventures, setVentures] = useState([]);

  // Persist the selected venture so navigation does not reset it.
  // The venture ID is stored, never the display name.
  const [selectedVentureId, setSelectedVentureId] = useState(() => {
    try {
      return (
        localStorage.getItem(
          SELECTED_VENTURE_STORAGE_KEY
        ) || "all"
      );
    } catch (error) {
      console.warn(
        "Unable to read selected venture from localStorage:",
        error
      );
      return "all";
    }
  });

  const [venturesLoading, setVenturesLoading] = useState(true);

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
        ventureId = "all",
      } = {}) => {
        try {
          if (isInitialLoad) {
            setLoading(true);
          } else {
            setRetrying(true);
          }

          setErrorMessage("");

          /*
           * IMPORTANT:
           * A venture is identified by venture_id, never by its name.
           * For a selected venture we first load its plots, then use the
           * customer_id values attached to those plots. This prevents a
           * customer/payment row with an old or missing venture_id from
           * making a booked plot disappear from the selected venture's
           * financial totals.
           */
          let plotQuery = supabase
            .from("plots")
            .select(
              "plot_no, customer_id, status, venture_id"
            );

          if (ventureId && ventureId !== "all") {
            plotQuery = plotQuery.eq(
              "venture_id",
              ventureId
            );
          }

          const { data: plotDataRaw, error: plotError } =
            await plotQuery;

          if (plotError) {
            console.error(
              "Dashboard plots error:",
              plotError
            );
            throw new Error(
              `Plots: ${plotError.message}`
            );
          }

          const plotData = plotDataRaw || [];

          const linkedCustomerIds = [
            ...new Set(
              plotData
                .map((plot) => plot.customer_id)
                .filter((id) => id != null)
                .map((id) => String(id))
            ),
          ];

          /*
           * Load customers by the IDs actually linked to the selected
           * venture's plots. This is deliberately NOT filtered by the
           * customer venture_id when a specific venture is selected.
           */
          let customerData = [];

          if (linkedCustomerIds.length > 0) {
            const { data, error } = await supabase
              .from("customers")
              .select(
                "id, total_amount, amount_paid, balance, status, registration_status, venture_id"
              )
              .in("id", linkedCustomerIds);

            if (error) {
              console.error(
                "Dashboard customers error:",
                error
              );
              throw new Error(
                `Customers: ${error.message}`
              );
            }

            customerData = data || [];
          } else if (ventureId === "all") {
            const { data, error } = await supabase
              .from("customers")
              .select(
                "id, total_amount, amount_paid, balance, status, registration_status, venture_id"
              );

            if (error) {
              console.error(
                "Dashboard customers error:",
                error
              );
              throw new Error(
                `Customers: ${error.message}`
              );
            }

            customerData = data || [];
          }

          /*
           * Payments are also tied back to the selected venture through
           * customer_id. We do not require payments.venture_id to be filled
           * because older payment records may not contain it.
           */
          let paymentData = [];

          if (linkedCustomerIds.length > 0) {
            const { data, error } = await supabase
              .from("payments")
              .select(
                "customer_id, amount, venture_id"
              )
              .in("customer_id", linkedCustomerIds);

            if (error) {
              console.error(
                "Dashboard payments error:",
                error
              );
              throw new Error(
                `Payments: ${error.message}`
              );
            }

            paymentData = data || [];
          } else if (ventureId === "all") {
            const { data, error } = await supabase
              .from("payments")
              .select(
                "customer_id, amount, venture_id"
              );

            if (error) {
              console.error(
                "Dashboard payments error:",
                error
              );
              throw new Error(
                `Payments: ${error.message}`
              );
            }

            paymentData = data || [];
          }

          const paidByCustomer =
            buildPaidMap(paymentData);

          const customers = customerData.map(
            (customer) =>
              getCanonicalCustomerFinancials(
                customer,
                paidByCustomer.get(customer.id)
              )
          );

          const customerStatusMap = new Map(
            customers.map((customer) => [
              String(customer.id),
              customer.status,
            ])
          );

          let available = 0;
          let booked = 0;
          let sold = 0;

          plotData.forEach((plot) => {
            const linkedCustomerStatus =
              plot.customer_id == null
                ? null
                : customerStatusMap.get(
                    String(plot.customer_id)
                  );

            let status =
              plot.status || "Available";

            if (linkedCustomerStatus === "Sold") {
              status = "Sold";
            } else if (linkedCustomerStatus === "Booked") {
              status = "Booked";
            }

            const normalizedStatus = String(status)
              .trim()
              .toLowerCase();

            if (normalizedStatus === "sold") {
              sold += 1;
            } else if (normalizedStatus === "booked") {
              booked += 1;
            } else {
              available += 1;
            }
          });

          const revenue = customers.reduce(
            (sum, customer) =>
              sum + Number(customer.total_amount || 0),
            0
          );

          const collected = customers.reduce(
            (sum, customer) =>
              sum + Number(customer.amount_paid || 0),
            0
          );

          const pending = customers.reduce(
            (sum, customer) =>
              sum + Number(customer.balance || 0),
            0
          );

          setStats({
            totalPlots: plotData.length,
            available,
            booked,
            sold,
            totalCustomers: customers.length,
            revenue,
            collected,
            pending,
          });

          setLastUpdated(new Date());
          setErrorMessage("");

          console.log("Dashboard loaded:", {
            ventureId,
            plots: plotData.length,
            customers: customers.length,
            payments: paymentData.length,
            available,
            booked,
            sold,
            revenue,
            collected,
            pending,
          });
        } catch (error) {
          console.error("Dashboard Error:", error);

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
   * LOAD VENTURES
   * ---------------------------------------------------------
   */
  useEffect(() => {
    let mounted = true;

    const loadVentures = async () => {
      setVenturesLoading(true);

      const { data, error } = await supabase
        .from("ventures")
        .select("*")
        .order("id", { ascending: true });

      if (!mounted) return;

      if (error) {
        console.error("Ventures load error:", error);
        setVentures([]);
        setErrorMessage(
          `Ventures: ${error.message}`
        );
      } else {
        setVentures(data || []);
      }

      setVenturesLoading(false);
    };

    loadVentures();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * INITIAL LOAD + REALTIME FOR SELECTED VENTURE
   * ---------------------------------------------------------
   */
  useEffect(() => {
    let mounted = true;

    fetchDashboardStats({
      isInitialLoad: true,
      ventureId: selectedVentureId,
    });

    const channel =
      supabase
        .channel(
          `dashboard-cards-live-${selectedVentureId}`
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
              fetchDashboardStats({
                ventureId: selectedVentureId,
              });
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
              fetchDashboardStats({
                ventureId: selectedVentureId,
              });
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
              fetchDashboardStats({
                ventureId: selectedVentureId,
              });
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
  }, [
    fetchDashboardStats,
    selectedVentureId,
  ]);

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

  const getVentureLabel = (venture) => {
    if (!venture) return "Unknown Venture";

    // The venture ID is the permanent identity.
    // The text below is only the display label.
    const village = String(venture?.village || "").trim();
    const phase = String(
      venture?.phase_name || venture?.phase || ""
    ).trim();

    if (village && phase) {
      return `${village} — ${phase}`;
    }

    if (village) return village;
    if (phase) return phase;

    return `Venture ${venture.id}`;
  };

  return (
    <>
      {/* =====================================================
          VENTURE SELECTOR — ONLY NEW CONTROL
      ====================================================== */}
      <div className="dashboard-venture-selector">
        <div className="dashboard-venture-selector-label">
          <span>VENTURE</span>
          <strong>
            {selectedVentureId === "all"
              ? "All Ventures"
              : getVentureLabel(
                  ventures.find(
                    (venture) =>
                      String(venture.id) ===
                      String(selectedVentureId)
                  )
                )}
          </strong>
        </div>

        <div className="dashboard-venture-select-wrap">
          <select
            className="dashboard-venture-select"
            value={selectedVentureId}
            onChange={(event) => {
              const ventureId = event.target.value;

              // Store only the permanent venture ID.
              // This survives Dashboard -> Customers -> Dashboard.
              setSelectedVentureId(ventureId);

              try {
                localStorage.setItem(
                  SELECTED_VENTURE_STORAGE_KEY,
                  ventureId
                );
              } catch (error) {
                console.warn(
                  "Unable to save selected venture:",
                  error
                );
              }
            }}
            disabled={venturesLoading}
          >
            <option value="all">
              All Ventures
            </option>

            {ventures.map((venture) => (
              <option
                key={venture.id}
                value={venture.id}
              >
                {getVentureLabel(venture)}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="dashboard-venture-select-icon"
          />
        </div>
      </div>

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
              fetchDashboardStats({
                ventureId: selectedVentureId,
              })
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
    </>
  );
}

export default DashboardCards;
