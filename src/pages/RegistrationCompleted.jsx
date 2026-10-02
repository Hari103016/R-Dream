import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Download,
  RefreshCw,
  Search,
  Phone,
  MapPin,
  User,
  FileCheck2,
  AlertCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";
import { supabase } from "../services/supabase";
import "./RegistrationCompleted.css";

/* =========================================================
   HELPERS
   ========================================================= */

const normalize = (value) =>
  value === null || value === undefined
    ? ""
    : String(value)
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const dateFormat = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const getName = (row) =>
  row?.name || row?.customer_name || row?.full_name || "-";

const getMobile = (row) =>
  row?.mobile || row?.phone || row?.mobile_number || "-";

const getPlotNo = (row) =>
  row?.plot_no || row?.plot_number || row?.plot || "-";

const getPlotSize = (row) =>
  row?.plot_size || row?.size || "-";

const getFacing = (row) =>
  row?.facing || "-";

const getRoad = (row) =>
  row?.road_width || row?.road || row?.roadwidth || "-";

const getTotalAmount = (row) =>
  Number(
    row?.total_amount ??
      row?.total_price ??
      row?.amount ??
      0
  );

const getAmountPaid = (row) =>
  Number(
    row?.amount_paid ??
      row?.paid_amount ??
      row?.paid ??
      0
  );

const getBalance = (row) => {
  if (
    row?.balance !== null &&
    row?.balance !== undefined &&
    row?.balance !== ""
  ) {
    return Math.max(Number(row.balance || 0), 0);
  }

  return Math.max(
    getTotalAmount(row) - getAmountPaid(row),
    0
  );
};

const getVentureName = (venture) =>
  venture?.venture_name ||
  venture?.project_name ||
  venture?.venture ||
  venture?.project ||
  venture?.title ||
  "Unknown Venture";

const getVentureVillage = (venture) =>
  venture?.village || venture?.location || "-";

const getVenturePhase = (venture) =>
  venture?.phase_name || venture?.phase || "-";

/* =========================================================
   IMPORTANT REGISTRATION LOGIC

   Your Customers / Plots code already treats a customer as
   completed when:
   1. registration_status says completed/registered, OR
   2. total amount has been completely paid, OR
   3. the linked plot is Sold/Registered.

   RegistrationCompleted now uses the SAME logic.

   This fixes the situation where Customers/Plots show the
   registration as completed but this page only saw
   registration_status = Pending in Supabase.
   ========================================================= */

const explicitCompletedRegistration = (customer) => {
  const registration = normalize(
    customer?.registration_status
  );

  return [
    "completed",
    "complete",
    "registered",
    "registration completed",
    "registration complete",
    "registration done",
    "registered successfully",
    "done",
    "yes",
    "true",
  ].includes(registration);
};

const explicitCompletedStatus = (customer, linkedPlot) => {
  const customerStatus = normalize(customer?.status);
  const plotStatus = normalize(linkedPlot?.status);

  const completedValues = [
    "sold",
    "registered",
    "registration completed",
    "registration complete",
    "registration done",
    "completed",
    "complete",
  ];

  return (
    completedValues.includes(customerStatus) ||
    completedValues.includes(plotStatus)
  );
};

const isRegistrationCompleted = (customer, linkedPlot) => {
  if (!customer) return false;

  if (explicitCompletedRegistration(customer)) {
    return true;
  }

  if (explicitCompletedStatus(customer, linkedPlot)) {
    return true;
  }

  const total = getTotalAmount(customer);
  const paid = getAmountPaid(customer);

  /*
    IMPORTANT:
    This matches the financial logic already used by your
    Customers and Plots pages.
  */
  if (total > 0 && paid >= total) {
    return true;
  }

  return false;
};

const isBookedNotRegistered = (customer, linkedPlot) => {
  if (!customer) return false;

  if (isRegistrationCompleted(customer, linkedPlot)) {
    return false;
  }

  const status = normalize(customer?.status);
  const registration = normalize(
    customer?.registration_status
  );

  return (
    [
      "booked",
      "booking",
      "reserved",
      "reserve",
      "pending",
    ].includes(status) ||
    [
      "pending",
      "not registered",
      "notregistered",
      "registration pending",
      "awaiting registration",
    ].includes(registration)
  );
};

/* Natural plot ordering: 1, 2, 3, 10, 11... */
const plotSortValue = (value) => {
  const match = String(value ?? "").match(/\d+/);
  return match
    ? Number(match[0])
    : Number.MAX_SAFE_INTEGER;
};

const sortCustomers = (rows) =>
  [...rows].sort((a, b) => {
    const plotCompare =
      plotSortValue(a.plot_no) -
      plotSortValue(b.plot_no);

    if (plotCompare !== 0) return plotCompare;

    return getName(a).localeCompare(
      getName(b),
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      }
    );
  });

/* =========================================================
   EXCEL
   ========================================================= */

const EXCEL_COLUMNS = [
  "S.No",
  "Customer Name",
  "Mobile",
  "Plot No",
  "Plot Size",
  "Facing",
  "Road Width",
  "Status",
  "Registration Status",
  "Total Amount",
  "Amount Paid",
  "Balance",
  "Booking Date",
  "Venture",
  "Village",
  "Phase",
];

const makeExcelRows = (rows, venture) =>
  sortCustomers(rows).map((customer, index) => ({
    "S.No": index + 1,
    "Customer Name": getName(customer),
    Mobile: getMobile(customer),
    "Plot No": getPlotNo(customer),
    "Plot Size": getPlotSize(customer),
    Facing: getFacing(customer),
    "Road Width": getRoad(customer),
    Status: customer?.status || "-",
    "Registration Status":
      customer?.registration_status || "-",
    "Total Amount": getTotalAmount(customer),
    "Amount Paid": getAmountPaid(customer),
    Balance: getBalance(customer),
    "Booking Date": customer?.booking_date || "",
    Venture: getVentureName(venture),
    Village: getVentureVillage(venture),
    Phase: getVenturePhase(venture),
  }));

const styleExcelSheet = (sheet) => {
  sheet["!cols"] = [
    { wch: 7 },
    { wch: 28 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 15 },
    { wch: 14 },
    { wch: 24 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 28 },
    { wch: 20 },
    { wch: 16 },
  ];

  sheet["!freeze"] = {
    xSplit: 0,
    ySplit: 1,
  };

  if (sheet["!ref"]) {
    sheet["!autofilter"] = {
      ref: sheet["!ref"],
    };
  }
};

/* =========================================================
   COMPONENT
   ========================================================= */

export default function RegistrationCompleted() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [customers, setCustomers] = useState([]);
  const [ventures, setVentures] = useState([]);
  const [plots, setPlots] = useState([]);

  const [selectedVentureId, setSelectedVentureId] =
    useState("");

  const [search, setSearch] = useState("");

  /* =======================================================
     STORED VENTURE
     ======================================================= */

  const getStoredVentureId = useCallback(() => {
    const keys = [
      "selectedVentureId",
      "selected_venture_id",
      "ventureId",
      "currentVentureId",
    ];

    for (const key of keys) {
      const value = localStorage.getItem(key);

      if (!value) continue;

      try {
        const parsed = JSON.parse(value);

        if (
          parsed &&
          typeof parsed === "object"
        ) {
          const id =
            parsed.id ||
            parsed.venture_id ||
            parsed.value;

          if (id) return String(id);
        }
      } catch {
        return String(value);
      }
    }

    return "";
  }, []);

  /* =======================================================
     LOAD VENTURES
     ======================================================= */

  const fetchVentures = useCallback(async () => {
    const { data, error: ventureError } =
      await supabase
        .from("ventures")
        .select(
          "id, venture_name, village, phase_name, total_plots"
        )
        .order("village", {
          ascending: true,
        })
        .order("phase_name", {
          ascending: true,
        });

    if (ventureError) {
      throw ventureError;
    }

    const list = Array.isArray(data)
      ? data
      : [];

    setVentures(list);

    const storedId =
      getStoredVentureId();

    if (
      storedId &&
      list.some(
        (v) =>
          String(v.id) ===
          String(storedId)
      )
    ) {
      setSelectedVentureId(
        String(storedId)
      );
      return;
    }

    if (list.length > 0) {
      const firstId = String(
        list[0].id
      );

      setSelectedVentureId(
        firstId
      );

      localStorage.setItem(
        "selectedVentureId",
        firstId
      );

      localStorage.setItem(
        "selected_venture_id",
        firstId
      );

      localStorage.setItem(
        "ventureId",
        firstId
      );
    }
  }, [getStoredVentureId]);

  /* =======================================================
     LOAD CUSTOMERS + PLOTS + PAYMENTS

     Payments are used to calculate the real amount paid.
     Plots are used to catch a Sold/Registered plot even
     when customers.registration_status was not updated.
     ======================================================= */

  const fetchCustomers = useCallback(
    async (ventureId) => {
      if (!ventureId) {
        setCustomers([]);
        setPlots([]);
        return;
      }

      // Load plots first. A customer can be linked to the venture
      // through plots.customer_id even if customers.venture_id is wrong/missing.
      const { data: rawPlots, error: plotError } = await supabase
        .from("plots")
        .select("*")
        .eq("venture_id", ventureId);

      if (plotError) throw plotError;

      const plots = Array.isArray(rawPlots) ? rawPlots : [];

      const plotCustomerIds = [
        ...new Set(
          plots
            .map((plot) => plot?.customer_id)
            .filter((id) => id !== null && id !== undefined && id !== "")
            .map((id) => String(id))
        ),
      ];

      // Load normal venture customers.
      const { data: ventureCustomers, error: ventureCustomerError } =
        await supabase
          .from("customers")
          .select("*")
          .eq("venture_id", ventureId)
          .order("id", { ascending: true });

      if (ventureCustomerError) throw ventureCustomerError;

      // Also load customers linked from the venture's plots.
      let linkedCustomers = [];
      if (plotCustomerIds.length > 0) {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .in("id", plotCustomerIds);

        if (error) throw error;
        linkedCustomers = Array.isArray(data) ? data : [];
      }

      // Merge without duplicates.
      const customerMap = new Map();
      [
        ...(Array.isArray(ventureCustomers) ? ventureCustomers : []),
        ...linkedCustomers,
      ].forEach((customer) => {
        if (customer?.id !== null && customer?.id !== undefined) {
          customerMap.set(String(customer.id), customer);
        }
      });

      const rawCustomers = [...customerMap.values()];

      // Load payments by customer ID, not only payments.venture_id.
      let payments = [];
      const customerIds = rawCustomers
        .map((customer) => customer?.id)
        .filter((id) => id !== null && id !== undefined && id !== "");

      if (customerIds.length > 0) {
        const { data, error } = await supabase
          .from("payments")
          .select("customer_id, amount, venture_id")
          .in("customer_id", customerIds);

        if (error) throw error;
        payments = Array.isArray(data) ? data : [];
      }

      const paidByCustomer = new Map();
      rawCustomers.forEach((customer) => {
        paidByCustomer.set(String(customer.id), 0);
      });

      payments.forEach((payment) => {
        if (payment?.customer_id === null || payment?.customer_id === undefined) return;
        const key = String(payment.customer_id);
        paidByCustomer.set(
          key,
          (paidByCustomer.get(key) || 0) + Number(payment.amount || 0)
        );
      });

      const plotByCustomer = new Map();
      const plotByNumber = new Map();

      plots.forEach((plot) => {
        if (plot?.customer_id !== null && plot?.customer_id !== undefined) {
          plotByCustomer.set(String(plot.customer_id), plot);
        }
        if (plot?.plot_no !== null && plot?.plot_no !== undefined) {
          plotByNumber.set(normalize(plot.plot_no), plot);
        }
      });

      const normalizedCustomers = rawCustomers.map((customer) => {
        const linkedPlot =
          plotByCustomer.get(String(customer.id)) ||
          plotByNumber.get(normalize(customer.plot_no));

        const paid =
          paidByCustomer.get(String(customer.id)) ??
          Number(customer.amount_paid || 0);

        const total = getTotalAmount(customer);

        const customerRegistration = normalize(customer?.registration_status);
        const customerStatus = normalize(customer?.status);
        const plotRegistration = normalize(linkedPlot?.registration_status);
        const plotStatus = normalize(linkedPlot?.status);

        const completed =
          explicitCompletedRegistration(customer) ||
          explicitCompletedStatus(customer, linkedPlot) ||
          [
            "completed", "complete", "registered",
            "registration completed", "registration complete",
            "registration done", "done", "yes", "true",
          ].includes(customerRegistration) ||
          [
            "sold", "registered", "registration completed",
            "registration complete", "registration done",
            "completed", "complete",
          ].includes(customerStatus) ||
          [
            "sold", "registered", "registration completed",
            "registration complete", "registration done",
            "completed", "complete",
          ].includes(plotStatus) ||
          [
            "completed", "complete", "registered",
            "registration completed", "registration complete",
            "registration done", "done", "yes", "true",
          ].includes(plotRegistration) ||
          customer?.registration_completed === true ||
          customer?.is_registered === true ||
          linkedPlot?.registration_completed === true ||
          linkedPlot?.is_registered === true ||
          (total > 0 && paid >= total);

        return {
          ...customer,
          plot_no:
            customer?.plot_no ??
            customer?.plot_number ??
            linkedPlot?.plot_no ??
            "",
          plot_size:
            customer?.plot_size ??
            customer?.size ??
            linkedPlot?.plot_size ??
            linkedPlot?.size ??
            "",
          facing:
            customer?.facing ??
            linkedPlot?.facing ??
            "",
          road_width:
            customer?.road_width ??
            customer?.road ??
            linkedPlot?.road_width ??
            linkedPlot?.road ??
            "",
          amount_paid: paid,
          balance: Math.max(total - paid, 0),
          status: completed ? "Sold" : customer?.status || "Booked",
          registration_status:
            completed ? "Completed" : customer?.registration_status || "Pending",
          __linkedPlot: linkedPlot || null,
          __registrationCompleted: completed,
        };
      });

      setCustomers(normalizedCustomers);
      setPlots(plots);

      console.log("Registration page data:", {
        ventureId,
        plots: plots.length,
        customers: normalizedCustomers.length,
        completed: normalizedCustomers.filter((c) => c.__registrationCompleted).length,
        pending: normalizedCustomers.filter(
          (c) => !c.__registrationCompleted && isBookedNotRegistered(c, c.__linkedPlot)
        ).length,
      });
    },
    []
  );

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        await fetchVentures();

        if (cancelled) return;
      } catch (err) {
        console.error(
          "Registration venture error:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load ventures."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchVentures]);

  /* =======================================================
     LOAD SELECTED VENTURE
     ======================================================= */

  useEffect(() => {
    if (!selectedVentureId) {
      setCustomers([]);
      setPlots([]);
      return;
    }

    let cancelled = false;

    const loadCustomers = async () => {
      try {
        setError("");

        await fetchCustomers(
          selectedVentureId
        );
      } catch (err) {
        console.error(
          "Registration customer error:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load customers."
          );
        }
      }
    };

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, [
    selectedVentureId,
    fetchCustomers,
  ]);

  /* =======================================================
     SELECTED VENTURE
     ======================================================= */

  const selectedVenture =
    useMemo(
      () =>
        ventures.find(
          (venture) =>
            String(venture.id) ===
            String(
              selectedVentureId
            )
        ) || null,
      [
        ventures,
        selectedVentureId,
      ]
    );

  const ventureName =
    getVentureName(
      selectedVenture
    );

  /* =======================================================
     CHANGE VENTURE
     ======================================================= */

  const handleVentureChange =
    (event) => {
      const id =
        event.target.value;

      setSelectedVentureId(id);
      setSearch("");

      localStorage.setItem(
        "selectedVentureId",
        id
      );

      localStorage.setItem(
        "selected_venture_id",
        id
      );

      localStorage.setItem(
        "ventureId",
        id
      );

      const venture =
        ventures.find(
          (item) =>
            String(item.id) ===
            String(id)
        );

      if (venture) {
        localStorage.setItem(
          "selectedVenture",
          JSON.stringify({
            id: venture.id,
            name:
              getVentureName(
                venture
              ),
            village:
              venture.village,
            phase_name:
              venture.phase_name,
          })
        );
      }
    };

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh =
    async () => {
      try {
        setRefreshing(true);
        setError("");

        if (selectedVentureId) {
          await fetchCustomers(
            selectedVentureId
          );
        } else {
          await fetchVentures();
        }
      } catch (err) {
        console.error(
          "Registration refresh error:",
          err
        );

        setError(
          err?.message ||
            "Unable to refresh data."
        );
      } finally {
        setRefreshing(false);
      }
    };

  /* =======================================================
     FINAL LISTS
     ======================================================= */

  const completedCustomers =
    useMemo(() => {
      return sortCustomers(
        customers.filter(
          (customer) =>
            customer.__registrationCompleted ===
            true
        )
      );
    }, [customers]);

  const pendingCustomers =
    useMemo(() => {
      return sortCustomers(
        customers.filter(
          (customer) =>
            customer.__registrationCompleted !==
              true &&
            isBookedNotRegistered(
              customer,
              customer.__linkedPlot
            )
        )
      );
    }, [customers]);

  /* =======================================================
     SEARCH
     ======================================================= */

  const filterRows =
    useCallback(
      (rows) => {
        const query =
          normalize(search);

        if (!query) {
          return rows;
        }

        return rows.filter(
          (customer) =>
            [
              getName(customer),
              getMobile(customer),
              getPlotNo(customer),
              getPlotSize(customer),
              getFacing(customer),
              customer?.status,
              customer?.registration_status,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(query)
        );
      },
      [search]
    );

  const filteredCompleted =
    useMemo(
      () =>
        filterRows(
          completedCustomers
        ),
      [
        completedCustomers,
        filterRows,
      ]
    );

  const filteredPending =
    useMemo(
      () =>
        filterRows(
          pendingCustomers
        ),
      [
        pendingCustomers,
        filterRows,
      ]
    );

  /* =======================================================
     EXCEL DOWNLOAD

     SHEET 1 = Registration Completed
     SHEET 2 = Not Registered

     Excel uses ALL records, not search-filtered records.
     ======================================================= */

  const downloadExcel =
    async () => {
      try {
        if (!selectedVenture) {
          alert(
            "Please select a venture first."
          );
          return;
        }

        /*
         * ONE XLSX FILE
         *
         * Sheet 1 = Registration Completed
         * Sheet 2 = Not Registered
         *
         * The data is taken from the complete page lists,
         * not from the search-filtered lists.
         */

        const workbook =
          XLSX.utils.book_new();

        // =====================================================
        // SHEET 1 — REGISTRATION COMPLETED
        // =====================================================

        const completedRows =
          makeExcelRows(
            completedCustomers,
            selectedVenture
          );

        const completedSheet =
          XLSX.utils.json_to_sheet(
            completedRows,
            {
              header:
                EXCEL_COLUMNS,
            }
          );

        styleExcelSheet(
          completedSheet
        );

        XLSX.utils.book_append_sheet(
          workbook,
          completedSheet,
          "Registration Completed"
        );

        // =====================================================
        // SHEET 2 — NOT REGISTERED
        // =====================================================

        const pendingRows =
          makeExcelRows(
            pendingCustomers,
            selectedVenture
          );

        const pendingSheet =
          XLSX.utils.json_to_sheet(
            pendingRows,
            {
              header:
                EXCEL_COLUMNS,
            }
          );

        styleExcelSheet(
          pendingSheet
        );

        XLSX.utils.book_append_sheet(
          workbook,
          pendingSheet,
          "Not Registered"
        );

        // =====================================================
        // CREATE A REAL XLSX BINARY
        //
        // Using XLSX.write + Blob is more reliable than
        // XLSX.writeFile with WPS Office.
        // =====================================================

        const excelArray =
          XLSX.write(
            workbook,
            {
              bookType: "xlsx",
              type: "array",
              compression: true,
            }
          );

        const blob =
          new Blob(
            [excelArray],
            {
              type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }
          );

        // =====================================================
        // SAFE FILE NAME
        // =====================================================

        const safeName =
          getVentureName(
            selectedVenture
          )
            .replace(
              /[^a-zA-Z0-9-_ ]/g,
              ""
            )
            .replace(
              /\s+/g,
              "-"
            );

        const fileName =
          `Registration-Report-${
            safeName || "Venture"
          }.xlsx`;

        // =====================================================
        // DOWNLOAD
        // =====================================================

        const downloadUrl =
          window.URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement(
            "a"
          );

        anchor.href =
          downloadUrl;

        anchor.download =
          fileName;

        anchor.style.display =
          "none";

        document.body.appendChild(
          anchor
        );

        anchor.click();

        document.body.removeChild(
          anchor
        );

        setTimeout(() => {
          window.URL.revokeObjectURL(
            downloadUrl
          );
        }, 1000);

        console.log(
          "========================================"
        );

        console.log(
          "REGISTRATION EXCEL CREATED"
        );

        console.log(
          "Venture:",
          getVentureName(
            selectedVenture
          )
        );

        console.log(
          "Registration Completed:",
          completedRows.length
        );

        console.log(
          "Not Registered:",
          pendingRows.length
        );

        console.log(
          "Excel Sheets:",
          [
            "Registration Completed",
            "Not Registered",
          ]
        );

        console.log(
          "========================================"
        );

      } catch (err) {
        console.error(
          "Excel download error:",
          err
        );

        alert(
          `Excel download failed:\n${
            err?.message ||
            "Unknown error"
          }`
        );
      }
    };

  /* =======================================================
     CUSTOMER CARD
     ======================================================= */

  const CustomerCard =
    ({
      customer,
      completed,
    }) => (
      <div className="registration-customer-card">
        <div className="registration-card-top">
          <div className="registration-customer-info">
            <div className="registration-avatar">
              <User size={20} />
            </div>

            <div>
              <h3>
                {getName(customer)}
              </h3>

              <div className="registration-mobile">
                <Phone size={14} />
                {getMobile(customer)}
              </div>
            </div>
          </div>

          <div
            className={
              completed
                ? "registration-status completed"
                : "registration-status pending"
            }
          >
            {completed ? (
              <>
                <CheckCircle2
                  size={15}
                />
                Completed
              </>
            ) : (
              <>
                <Clock3 size={15} />
                Not Registered
              </>
            )}
          </div>
        </div>

        <div className="registration-details-grid">
          <div className="registration-detail">
            <span>Plot No</span>
            <strong>
              {getPlotNo(customer)}
            </strong>
          </div>

          <div className="registration-detail">
            <span>Plot Size</span>
            <strong>
              {getPlotSize(customer)}
            </strong>
          </div>

          <div className="registration-detail">
            <span>Facing</span>
            <strong>
              {getFacing(customer)}
            </strong>
          </div>

          <div className="registration-detail">
            <span>Road</span>
            <strong>
              {getRoad(customer)}
            </strong>
          </div>

          <div className="registration-detail">
            <span>Status</span>
            <strong>
              {customer?.status ||
                "-"}
            </strong>
          </div>

          <div className="registration-detail">
            <span>Registration</span>
            <strong>
              {customer?.registration_status ||
                "-"}
            </strong>
          </div>

          <div className="registration-detail money">
            <span>Total Amount</span>
            <strong>
              {money(
                getTotalAmount(
                  customer
                )
              )}
            </strong>
          </div>

          <div className="registration-detail money">
            <span>Amount Paid</span>
            <strong>
              {money(
                getAmountPaid(
                  customer
                )
              )}
            </strong>
          </div>

          <div className="registration-detail money balance">
            <span>Balance</span>
            <strong>
              {money(
                getBalance(customer)
              )}
            </strong>
          </div>

          <div className="registration-detail">
            <span>Booking Date</span>
            <strong>
              {dateFormat(
                customer?.booking_date
              )}
            </strong>
          </div>
        </div>
      </div>
    );

  /* =======================================================
     EMPTY STATE
     ======================================================= */

  const EmptyState =
    ({ completed }) => (
      <div className="registration-empty">
        <div
          className={
            completed
              ? "registration-empty-icon completed"
              : "registration-empty-icon pending"
          }
        >
          {completed ? (
            <CheckCircle2
              size={32}
            />
          ) : (
            <Clock3 size={32} />
          )}
        </div>

        <h3>
          {completed
            ? "No Completed Registrations"
            : "No Booked Customers Pending Registration"}
        </h3>

        <p>
          {completed
            ? "No customers have completed registration for this venture."
            : "No booked customers are waiting for registration for this venture."}
        </p>
      </div>
    );

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="registration-page">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={
            setSidebarOpen
          }
        />

        <main className="registration-main">
          <div className="registration-loading">
            <RefreshCw
              size={30}
              className="registration-spin"
            />
            Loading registration data...
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     UI
     ======================================================= */

  return (
    <div className="registration-page">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="registration-main">
        <div className="registration-header">
          <div>
            <div className="registration-eyebrow">
              R DREAM INFRA DEVELOPERS
            </div>

            <h1>
              Registration Completed
            </h1>

            <p>
              Manage completed and
              pending plot registrations.
            </p>
          </div>

          <button
            type="button"
            className="registration-refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "registration-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="registration-error">
            <AlertCircle size={20} />

            <div>
              <strong>
                Error loading registrations
              </strong>

              <span>
                {error}
              </span>
            </div>
          </div>
        )}

        <div className="registration-venture-bar">
          <div>
            <span>
              VENTURE
            </span>

            <strong>
              {ventureName}
            </strong>
          </div>

          <select
            value={selectedVentureId}
            onChange={
              handleVentureChange
            }
          >
            {ventures.length ===
            0 ? (
              <option value="">
                No Ventures Found
              </option>
            ) : (
              ventures.map(
                (venture) => (
                  <option
                    key={
                      venture.id
                    }
                    value={
                      venture.id
                    }
                  >
                    {getVentureName(
                      venture
                    )}{" "}
                    —{" "}
                    {getVentureVillage(
                      venture
                    )}{" "}
                    —{" "}
                    {getVenturePhase(
                      venture
                    )}
                  </option>
                )
              )
            )}
          </select>
        </div>

        <div className="registration-summary">
          <div className="registration-summary-card completed">
            <div className="registration-summary-icon">
              <CheckCircle2
                size={25}
              />
            </div>

            <div>
              <span>
                Completed Registrations
              </span>

              <strong>
                {completedCustomers.length}
              </strong>
            </div>
          </div>

          <div className="registration-summary-card pending">
            <div className="registration-summary-icon">
              <Clock3 size={25} />
            </div>

            <div>
              <span>
                Booked — Not Registered
              </span>

              <strong>
                {pendingCustomers.length}
              </strong>
            </div>
          </div>
        </div>

        <div className="registration-toolbar">
          <div className="registration-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search customer, plot no or mobile..."
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="button"
            className="registration-excel-button"
            onClick={
              downloadExcel
            }
          >
            <Download size={18} />
            Download Excel
          </button>
        </div>

        {/* =================================================
            COMPLETED
            ================================================= */}

        <section className="registration-section">
          <div className="registration-section-heading">
            <div>
              <div className="registration-section-title-row">
                <FileCheck2
                  size={20}
                />
                <h2>
                  Registration Completed
                </h2>
              </div>

              <p>
                {filteredCompleted.length}{" "}
                customers
              </p>
            </div>

            <div className="registration-count completed">
              {
                filteredCompleted.length
              }
            </div>
          </div>

          {filteredCompleted.length ===
          0 ? (
            <EmptyState
              completed
            />
          ) : (
            <div className="registration-customer-list">
              {filteredCompleted.map(
                (customer) => (
                  <CustomerCard
                    key={
                      customer.id
                    }
                    customer={
                      customer
                    }
                    completed
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* =================================================
            BOOKED NOT REGISTERED
            ================================================= */}

        <section className="registration-section pending-section">
          <div className="registration-section-heading">
            <div>
              <div className="registration-section-title-row">
                <Clock3 size={20} />
                <h2>
                  Booked — Not Registered
                </h2>
              </div>

              <p>
                {filteredPending.length}{" "}
                customers
              </p>
            </div>

            <div className="registration-count pending">
              {
                filteredPending.length
              }
            </div>
          </div>

          {filteredPending.length ===
          0 ? (
            <EmptyState
              completed={false}
            />
          ) : (
            <div className="registration-customer-list">
              {filteredPending.map(
                (customer) => (
                  <CustomerCard
                    key={
                      customer.id
                    }
                    customer={
                      customer
                    }
                    completed={false}
                  />
                )
              )}
            </div>
          )}
        </section>

        <div className="registration-footer-info">
          <MapPin size={15} />

          <span>Showing:</span>

          <strong>
            {ventureName}
          </strong>

          <span>•</span>

          <span>
            Total Customers:
          </span>

          <strong>
            {customers.length}
          </strong>
        </div>
      </main>
    </div>
  );
}
