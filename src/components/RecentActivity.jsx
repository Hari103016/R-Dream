import { useCallback, useEffect, useState } from "react";
import {
  MapPinned,
  CalendarDays,
  CreditCard,
  UserPlus,
  Activity,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "../services/supabase";
import "./RecentActivity.css";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  function getCustomerFinancials(customer, totalPaidOverride) {
    const total = Number(customer?.total_amount || 0);
    const paid = Number(
      totalPaidOverride ?? customer?.amount_paid ?? 0
    );
    const balance = Math.max(total - paid, 0);

    if (total > 0) {
      const completed = paid >= total;

      return {
        total,
        paid,
        balance,
        status: completed ? "Sold" : "Booked",
        registrationStatus: completed ? "Completed" : "Pending",
      };
    }

    return {
      total,
      paid,
      balance,
      status: customer?.status || "Booked",
      registrationStatus:
        customer?.registration_status || "Pending",
    };
  }

  function buildPaidMap(payments) {
    const paidByCustomer = new Map();

    (payments || []).forEach((payment) => {
      if (payment.customer_id == null) return;

      const customerId = String(payment.customer_id);
      const previous = paidByCustomer.get(customerId) || 0;

      paidByCustomer.set(
        customerId,
        previous + Number(payment.amount || 0)
      );
    });

    return paidByCustomer;
  }

  function buildCustomerMap(customers) {
    const customerMap = new Map();

    (customers || []).forEach((customer) => {
      customerMap.set(String(customer.id), customer);
    });

    return customerMap;
  }

  function buildLatestPaymentMap(payments) {
    const latestPayments = new Map();

    (payments || []).forEach((payment) => {
      if (payment.customer_id == null) return;

      const customerId = String(payment.customer_id);
      const existing = latestPayments.get(customerId);

      const currentDate = payment.payment_date || null;
      const existingDate = existing?.payment_date || null;

      const currentTime = currentDate
        ? new Date(currentDate).getTime()
        : 0;

      const existingTime = existingDate
        ? new Date(existingDate).getTime()
        : 0;

      if (!existing || currentTime >= existingTime) {
        latestPayments.set(customerId, payment);
      }
    });

    return latestPayments;
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  }

  function formatPlotNumbers(plotValue) {
    if (plotValue == null || plotValue === "") return "";

    if (Array.isArray(plotValue)) {
      return plotValue
        .filter(Boolean)
        .map((value) => `Plot #${String(value).trim()}`)
        .join(", ");
    }

    return String(plotValue)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => `Plot #${item}`)
      .join(", ");
  }

  function getIcon(type) {
    switch (type) {
      case "sold":
        return <CheckCircle2 size={18} />;
      case "payment":
        return <CreditCard size={18} />;
      case "booking":
        return <CalendarDays size={18} />;
      case "customer":
        return <UserPlus size={18} />;
      case "plot":
        return <MapPinned size={18} />;
      default:
        return <Activity size={18} />;
    }
  }

  function getColor(type) {
    switch (type) {
      case "sold":
        return "red";
      case "payment":
        return "purple";
      case "booking":
        return "orange";
      case "customer":
        return "blue";
      case "plot":
        return "green";
      default:
        return "blue";
    }
  }

  function formatTime(dateString) {
    if (!dateString) return "Unknown time";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Unknown time";
    }

    const now = new Date();
    const difference = now.getTime() - date.getTime();

    if (difference < 0) {
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const seconds = Math.floor(difference / 1000);

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function buildPaymentActivities(payments, customerMap) {
    return (payments || [])
      .map((payment) => {
        const customer = customerMap.get(
          String(payment.customer_id)
        );

        if (!customer) return null;

        const plotText = formatPlotNumbers(customer.plot_no);
        const amount = Number(payment.amount || 0);

        return {
          id: `payment-${payment.id}`,
          type: "payment",
          title: `${formatCurrency(amount)} payment received`,
          description: plotText
            ? `${customer.name || "Customer"} • ${plotText}`
            : customer.name || "Customer payment received",
          created_at: payment.payment_date,
          extra: payment.payment_mode || "Payment",
          color: "purple",
        };
      })
      .filter(Boolean);
  }

  function buildSoldActivities(
    customers,
    paidByCustomer,
    latestPaymentMap
  ) {
    return (customers || [])
      .map((customer) => {
        const paid =
          paidByCustomer.get(String(customer.id)) || 0;

        const financials = getCustomerFinancials(
          customer,
          paid
        );

        if (
          financials.total <= 0 ||
          financials.paid < financials.total
        ) {
          return null;
        }

        const plotText = formatPlotNumbers(customer.plot_no);
        const latestPayment = latestPaymentMap.get(
          String(customer.id)
        );

        return {
          id: `sold-${customer.id}`,
          type: "sold",
          title: plotText
            ? `${plotText} marked Sold`
            : "Plot marked Sold",
          description: "Full payment completed",
          created_at:
            latestPayment?.payment_date ||
            customer.booking_date ||
            null,
          extra: customer.name || "Customer",
          color: "red",
        };
      })
      .filter(Boolean);
  }

  function buildBookingActivities(customers, paidByCustomer) {
    return (customers || [])
      .map((customer) => {
        const paid =
          paidByCustomer.get(String(customer.id)) || 0;

        const financials = getCustomerFinancials(
          customer,
          paid
        );

        if (financials.status === "Sold") return null;

        const plotText = formatPlotNumbers(customer.plot_no);

        return {
          id: `booking-${customer.id}`,
          type: "booking",
          title: plotText
            ? `${plotText} booked`
            : "Plot booked",
          description:
            customer.name || "Customer booking",
          created_at: customer.booking_date || null,
          extra:
            financials.balance > 0
              ? `Balance ${formatCurrency(financials.balance)}`
              : "Registration Pending",
          color: "orange",
        };
      })
      .filter(Boolean);
  }

  function buildCustomerActivities(customers) {
    return (customers || []).map((customer) => {
      const plotText = formatPlotNumbers(customer.plot_no);

      return {
        id: `customer-${customer.id}`,
        type: "customer",
        title: "New customer registered",
        description: customer.name || "New customer",
        created_at: customer.booking_date || null,
        extra: plotText || "Customer",
        color: "blue",
      };
    });
  }

  function removeDuplicates(list) {
    const seen = new Set();

    return list.filter((activity) => {
      const key =
        `${activity.type}|${activity.title}|${activity.description}|${activity.created_at}`;

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      /*
       * IMPORTANT:
       * Do not request customers.created_at because
       * that column does not exist in the current schema.
       *
       * booking_date is used for customer/booking activity time.
       */
      const [customersResult, paymentsResult] =
        await Promise.all([
          supabase
            .from("customers")
            .select(`
              id,
              name,
              plot_no,
              status,
              total_amount,
              amount_paid,
              balance,
              registration_status,
              booking_date
            `)
            .order("booking_date", {
              ascending: false,
              nullsFirst: false,
            }),

          supabase
            .from("payments")
            .select(`
              id,
              customer_id,
              amount,
              payment_mode,
              remarks,
              payment_date
            `)
            .order("payment_date", {
              ascending: false,
              nullsFirst: false,
            }),
        ]);

      if (customersResult.error) {
        throw new Error(
          `Customers: ${customersResult.error.message}`
        );
      }

      if (paymentsResult.error) {
        throw new Error(
          `Payments: ${paymentsResult.error.message}`
        );
      }

      const customers = customersResult.data || [];
      const payments = paymentsResult.data || [];

      const customerMap = buildCustomerMap(customers);
      const paidByCustomer = buildPaidMap(payments);
      const latestPaymentMap =
        buildLatestPaymentMap(payments);

      const paymentActivities =
        buildPaymentActivities(
          payments,
          customerMap
        );

      const soldActivities =
        buildSoldActivities(
          customers,
          paidByCustomer,
          latestPaymentMap
        );

      const bookingActivities =
        buildBookingActivities(
          customers,
          paidByCustomer
        );

      const customerActivities =
        buildCustomerActivities(customers);

      let combined = [
        ...paymentActivities,
        ...soldActivities,
        ...bookingActivities,
        ...customerActivities,
      ];

      combined = removeDuplicates(combined);

      combined.sort((a, b) => {
        const aTime = a.created_at
          ? new Date(a.created_at).getTime()
          : 0;

        const bTime = b.created_at
          ? new Date(b.created_at).getTime()
          : 0;

        return bTime - aTime;
      });

      setActivities(combined.slice(0, 8));
    } catch (error) {
      console.error("Recent Activity Error:", error);
      setActivities([]);
      setErrorMessage(
        error?.message ||
          "Unable to load recent activity."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-recent-activity")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customers",
        },
        () => {
          fetchActivities();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities]);

  return (
    <div className="recent-activity">
      <div className="activity-header">
        <div className="activity-title">
          <div className="activity-title-icon">
            <Activity size={20} />
          </div>

          <div>
            <h2>Recent Activity</h2>
            <p>
              Latest actions performed in the system
            </p>
          </div>
        </div>

        <button
          type="button"
          className="activity-refresh"
          onClick={fetchActivities}
          disabled={loading}
          title="Refresh activities"
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "activity-refresh-spin"
                : ""
            }
          />
        </button>
      </div>

      {loading ? (
        <div className="activity-loading">
          <div className="activity-spinner"></div>
          <span>Loading activities...</span>
        </div>
      ) : errorMessage ? (
        <div className="activity-empty">
          <div className="empty-icon">
            <Activity size={24} />
          </div>

          <h3>Unable to load activity</h3>
          <p>{errorMessage}</p>

          <button
            type="button"
            className="activity-retry"
            onClick={fetchActivities}
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="activity-empty">
          <div className="empty-icon">
            <Activity size={24} />
          </div>

          <h3>No Recent Activity</h3>

          <p>
            Activities will appear here when bookings,
            payments, or customers are added.
          </p>

          <button
            type="button"
            className="activity-retry"
            onClick={fetchActivities}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      ) : (
        <div className="activity-list">
          {activities.map((activity, index) => {
            const color =
              activity.color ||
              getColor(activity.type);

            return (
              <div
                className="activity-item"
                key={
                  activity.id ||
                  `${activity.created_at}-${index}`
                }
              >
                <div className="activity-timeline">
                  <div
                    className={`activity-icon ${color}`}
                  >
                    {getIcon(activity.type)}
                  </div>

                  {index !== activities.length - 1 && (
                    <div className="timeline-line"></div>
                  )}
                </div>

                <div className="activity-details">
                  <div className="activity-main">
                    <h3>
                      {activity.title || "Activity"}
                    </h3>

                    <span
                      className={`activity-badge ${color}`}
                    >
                      {activity.extra || "Admin"}
                    </span>
                  </div>

                  <p>
                    {activity.description ||
                      "An action was performed."}
                  </p>

                  <span className="activity-time">
                    {formatTime(activity.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;
