import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Plus,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  Wallet,
  AlertCircle,
  UserRound,
  Phone,
  MapPin,
  FileText,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Bell,
} from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { supabase } from "../services/supabase";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AddCustomerModal from "../components/AddCustomerModal";

import "./Customers.css";


/* ==========================================================
   CUSTOMER FINANCIAL CALCULATIONS
========================================================== */

function getCanonicalCustomerFinancials(
  customer,
  totalPaidOverride
) {
  const total = Number(
    customer?.total_amount || 0
  );

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
    const completed =
      paid >= total;

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


/* ==========================================================
   MAIN COMPONENT
========================================================== */

function Customers() {

  const [
    customers,
    setCustomers,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    statusFilter,
    setStatusFilter,
  ] = useState(
    "All Status"
  );

  const [
    registrationFilter,
    setRegistrationFilter,
  ] = useState(
    "All Registration"
  );

  const [
    dateFilter,
    setDateFilter,
  ] = useState("");


  /* ========================================================
     FETCH CUSTOMERS
  ======================================================== */

  useEffect(() => {
    fetchCustomers();
  }, []);


  async function fetchCustomers() {

    setLoading(true);

    try {

      const [
        {
          data: customerData,
          error: customerError,
        },

        {
          data: paymentData,
          error: paymentError,
        },
      ] = await Promise.all([

        supabase
          .from("customers")
          .select("*")
          .order("id", {
            ascending: false,
          }),

        supabase
          .from("payments")
          .select(
            "customer_id, amount"
          ),
      ]);


      if (customerError) {
        throw customerError;
      }

      if (paymentError) {
        throw paymentError;
      }


      const paidByCustomer =
        new Map();


      (customerData || []).forEach(
        (customer) => {

          paidByCustomer.set(
            customer.id,
            0
          );

        }
      );


      (paymentData || []).forEach(
        (payment) => {

          const customerId =
            payment.customer_id;

          if (
            customerId == null
          ) {
            return;
          }


          paidByCustomer.set(

            customerId,

            (
              paidByCustomer.get(
                customerId
              ) || 0
            ) +

              Number(
                payment.amount || 0
              )

          );

        }
      );


      const normalizedCustomers =
        (customerData || []).map(
          (customer) =>
            getCanonicalCustomerFinancials(
              customer,

              paidByCustomer.get(
                customer.id
              )
            )
        );


      setCustomers(
        normalizedCustomers
      );

    } catch (error) {

      console.error(
        "Failed to load customers:",
        error
      );

      toast.error(
        "Failed to load customers"
      );

    } finally {

      setLoading(false);

    }
  }


  /* ==========================================================
     SEARCH + FILTERS
  ========================================================== */

  const filteredCustomers =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();


      return customers.filter(
        (customer) => {

          const matchesSearch =
            !value ||

            customer.name
              ?.toLowerCase()
              .includes(value) ||

            customer.mobile
              ?.toString()
              .toLowerCase()
              .includes(value) ||

            customer.plot_no
              ?.toString()
              .toLowerCase()
              .includes(value);


          const matchesStatus =
            statusFilter ===
              "All Status" ||

            customer.status
              ?.toLowerCase() ===
              statusFilter.toLowerCase();


          const matchesRegistration =
            registrationFilter ===
              "All Registration" ||

            customer.registration_status
              ?.toLowerCase() ===
              registrationFilter.toLowerCase();


          const matchesDate =
            !dateFilter ||

            (
              customer.booking_date &&

              new Date(
                customer.booking_date
              )
                .toISOString()
                .slice(0, 10) ===
                dateFilter
            );


          return (
            matchesSearch &&
            matchesStatus &&
            matchesRegistration &&
            matchesDate
          );

        }
      );

    }, [
      customers,
      search,
      statusFilter,
      registrationFilter,
      dateFilter,
    ]);


  /* ==========================================================
     STATISTICS
  ========================================================== */

  const totalCustomers =
    customers.length;


  const bookedCustomers =
    customers.filter(
      (customer) =>
        customer.status
          ?.toLowerCase() ===
        "booked"
    ).length;


  const soldCustomers =
    customers.filter(
      (customer) =>
        customer.status
          ?.toLowerCase() ===
        "sold"
    ).length;


  const totalCollected =
    customers.reduce(
      (sum, customer) =>
        sum +
        Number(
          customer.amount_paid || 0
        ),
      0
    );


  const totalPending =
    customers.reduce(
      (sum, customer) =>
        sum +
        Number(
          customer.balance || 0
        ),
      0
    );


  /* ==========================================================
     DELETE CUSTOMER
  ========================================================== */

  async function deleteCustomer(
    customer
  ) {

    const result =
      await Swal.fire({

        title:
          "Delete Customer?",

        text:
          `Delete ${customer.name}?`,

        icon:
          "warning",

        showCancelButton:
          true,

        confirmButtonColor:
          "#ef4444",

        cancelButtonColor:
          "#2563eb",

        confirmButtonText:
          "Delete",

        cancelButtonText:
          "Cancel",

      });


    if (
      !result.isConfirmed
    ) {
      return;
    }


    try {

      /* Delete payments */

      const {
        error: paymentError,
      } = await supabase
        .from("payments")
        .delete()
        .eq(
          "customer_id",
          customer.id
        );


      if (paymentError) {

        console.error(
          paymentError
        );

      }


      /* Make plot available again */

      const {
        error: plotError,
      } = await supabase
        .from("plots")
        .update({
          status:
            "Available",

          customer_id:
            null,
        })
        .eq(
          "plot_no",
          customer.plot_no
        );


      if (plotError) {

        console.error(
          plotError
        );

      }


      /* Delete customer */

      const {
        error,
      } = await supabase
        .from("customers")
        .delete()
        .eq(
          "id",
          customer.id
        );


      if (error) {
        throw error;
      }


      toast.success(
        "Customer deleted successfully"
      );


      fetchCustomers();

    } catch (error) {

      console.error(
        error
      );

      toast.error(
        "Delete failed"
      );

    }
  }


  /* ==========================================================
     EXPORT EXCEL
     PROFESSIONAL R DREAM FORMAT
  ========================================================== */

  function exportExcel() {

    if (
      filteredCustomers.length === 0
    ) {

      toast.warning(
        "No customers to export"
      );

      return;
    }


    try {

      /* ======================================================
         PREPARE DATA
      ====================================================== */

      const rows =
        filteredCustomers.map(
          (customer) => {

            const totalAmount =
              Number(
                customer.total_amount ||
                0
              );


            const amountPaid =
              Number(
                customer.amount_paid ||
                0
              );


            const balance =
              Math.max(
                totalAmount -
                  amountPaid,
                0
              );


            let bookingDate =
              "";


            if (
              customer.booking_date
            ) {

              const date =
                new Date(
                  customer.booking_date
                );


              if (
                !Number.isNaN(
                  date.getTime()
                )
              ) {

                const day =
                  String(
                    date.getDate()
                  ).padStart(
                    2,
                    "0"
                  );


                const month =
                  String(
                    date.getMonth() + 1
                  ).padStart(
                    2,
                    "0"
                  );


                const year =
                  date.getFullYear();


                bookingDate =
                  `${day}-${month}-${year}`;

              }
            }


            return [

              customer.plot_no ??
                "",

              customer.name ??
                "",

              String(
                customer.mobile ??
                  ""
              ),

              customer.status ??
                "Booked",

              totalAmount,

              amountPaid,

              balance,

              bookingDate,

            ];

          }
        );


      /* ======================================================
         CREATE WORKSHEET
      ====================================================== */

      const worksheet =
        XLSX.utils.aoa_to_sheet([

          [
            "R DREAM INFRA DEVELOPERS",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ],

          [
            "CUSTOMER BOOKING RECORDS",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ],

          [
            "Plot No",
            "Customer Name",
            "Mobile",
            "Status",
            "Total Amount",
            "Amount Paid",
            "Balance",
            "Booking Date",
          ],

          ...rows,

        ]);


      /* ======================================================
         MERGE TITLE
      ====================================================== */

      worksheet["!merges"] = [

        {
          s: {
            r: 0,
            c: 0,
          },

          e: {
            r: 0,
            c: 7,
          },
        },

        {
          s: {
            r: 1,
            c: 0,
          },

          e: {
            r: 1,
            c: 7,
          },
        },

      ];


      /* ======================================================
         COLUMN WIDTHS
      ====================================================== */

      worksheet["!cols"] = [

        {
          wch: 18,
        },

        {
          wch: 30,
        },

        {
          wch: 20,
        },

        {
          wch: 16,
        },

        {
          wch: 21,
        },

        {
          wch: 21,
        },

        {
          wch: 21,
        },

        {
          wch: 20,
        },

      ];


      /* ======================================================
         ROW HEIGHTS
      ====================================================== */

      worksheet["!rows"] = [

        {
          hpt: 32,
        },

        {
          hpt: 24,
        },

        {
          hpt: 28,
        },

      ];


      /* ======================================================
         TITLE STYLE
      ====================================================== */

      worksheet["A1"].s = {

        font: {

          name:
            "Arial",

          sz:
            18,

          bold:
            true,

          color: {
            rgb:
              "FFFFFF",
          },

        },


        fill: {

          patternType:
            "solid",

          fgColor: {
            rgb:
              "8F0000",
          },

        },


        alignment: {

          horizontal:
            "center",

          vertical:
            "center",

        },


        border: {

          top: {

            style:
              "medium",

            color: {
              rgb:
                "D5A43C",
            },

          },

          bottom: {

            style:
              "medium",

            color: {
              rgb:
                "D5A43C",
            },

          },

          left: {

            style:
              "medium",

            color: {
              rgb:
                "D5A43C",
            },

          },

          right: {

            style:
              "medium",

            color: {
              rgb:
                "D5A43C",
            },

          },

        },

      };


      /* ======================================================
         SUBTITLE STYLE
      ====================================================== */

      worksheet["A2"].s = {

        font: {

          name:
            "Arial",

          sz:
            11,

          bold:
            true,

          color: {
            rgb:
              "8F0000",
          },

        },


        fill: {

          patternType:
            "solid",

          fgColor: {
            rgb:
              "FFF7E6",
          },

        },


        alignment: {

          horizontal:
            "center",

          vertical:
            "center",

        },


        border: {

          bottom: {

            style:
              "thin",

            color: {
              rgb:
                "D5A43C",
            },

          },

        },

      };


      /* ======================================================
         HEADER STYLE
      ====================================================== */

      const headerCells = [

        "A3",
        "B3",
        "C3",
        "D3",
        "E3",
        "F3",
        "G3",
        "H3",

      ];


      headerCells.forEach(
        (cellAddress) => {

          worksheet[
            cellAddress
          ].s = {

            font: {

              name:
                "Arial",

              sz:
                11,

              bold:
                true,

              color: {
                rgb:
                  "FFFFFF",
              },

            },


            fill: {

              patternType:
                "solid",

              fgColor: {
                rgb:
                  "A80000",
              },

            },


            alignment: {

              horizontal:
                "center",

              vertical:
                "center",

              wrapText:
                true,

            },


            border: {

              top: {

                style:
                  "thin",

                color: {
                  rgb:
                    "D5A43C",
                },

              },

              bottom: {

                style:
                  "thin",

                color: {
                  rgb:
                    "D5A43C",
                },

              },

              left: {

                style:
                  "thin",

                color: {
                  rgb:
                    "D5A43C",
                },

              },

              right: {

                style:
                  "thin",

                color: {
                  rgb:
                    "D5A43C",
                },

              },

            },

          };

        }
      );


      /* ======================================================
         DATA ROW FORMATTING
      ====================================================== */

      for (
        let rowNumber = 4;

        rowNumber <=
          rows.length + 3;

        rowNumber++
      ) {

        const isAlternate =
          rowNumber % 2 === 0;


        for (
          let column = 0;

          column < 8;

          column++
        ) {

          const cellAddress =
            XLSX.utils.encode_cell({

              r:
                rowNumber - 1,

              c:
                column,

            });


          const cell =
            worksheet[
              cellAddress
            ];


          if (!cell) {
            continue;
          }


          cell.s = {

            font: {

              name:
                "Arial",

              sz:
                10,

              color: {
                rgb:
                  "222222",
              },

            },


            fill: {

              patternType:
                "solid",

              fgColor: {

                rgb:
                  isAlternate
                    ? "FFF8F6"
                    : "FFFFFF",

              },

            },


            alignment: {

              vertical:
                "center",

              horizontal:

                column === 0 ||
                column === 2 ||
                column === 3 ||
                column === 7

                  ? "center"

                  : "left",

            },


            border: {

              top: {

                style:
                  "thin",

                color: {
                  rgb:
                    "DDDDDD",
                },

              },

              bottom: {

                style:
                  "thin",

                color: {
                  rgb:
                    "DDDDDD",
                },

              },

              left: {

                style:
                  "thin",

                color: {
                  rgb:
                    "DDDDDD",
                },

              },

              right: {

                style:
                  "thin",

                color: {
                  rgb:
                    "DDDDDD",
                },

              },

            },

          };

        }


        /* ====================================================
           CURRENCY FORMAT
        ==================================================== */

        const amountCells = [

          `E${rowNumber}`,

          `F${rowNumber}`,

          `G${rowNumber}`,

        ];


        amountCells.forEach(
          (cellAddress) => {

            if (
              worksheet[
                cellAddress
              ]
            ) {

              worksheet[
                cellAddress
              ].z =
                '₹#,##0';


              worksheet[
                cellAddress
              ].s = {

                ...worksheet[
                  cellAddress
                ].s,


                alignment: {

                  horizontal:
                    "right",

                  vertical:
                    "center",

                },


                font: {

                  name:
                    "Arial",

                  sz:
                    10,

                  bold:
                    true,

                  color: {
                    rgb:
                      "222222",
                  },

                },

              };

            }

          }
        );


        /* ====================================================
           BALANCE COLOR
        ==================================================== */

        const balanceCell =
          worksheet[
            `G${rowNumber}`
          ];


        if (
          balanceCell &&
          Number(
            balanceCell.v || 0
          ) > 0
        ) {

          balanceCell.s = {

            ...balanceCell.s,


            font: {

              name:
                "Arial",

              sz:
                10,

              bold:
                true,

              color: {
                rgb:
                  "B00000",
              },

            },


            fill: {

              patternType:
                "solid",

              fgColor: {
                rgb:
                  "FFF0EE",
              },

            },

          };

        }

      }


      /* ======================================================
         STATUS FORMATTING
      ====================================================== */

      for (
        let rowNumber = 4;

        rowNumber <=
          rows.length + 3;

        rowNumber++
      ) {

        const statusCell =
          worksheet[
            `D${rowNumber}`
          ];


        if (!statusCell) {
          continue;
        }


        const status =
          String(
            statusCell.v || ""
          ).toLowerCase();


        if (
          status ===
          "booked"
        ) {

          statusCell.s = {

            font: {

              name:
                "Arial",

              sz:
                10,

              bold:
                true,

              color: {
                rgb:
                  "9C6500",
              },

            },


            fill: {

              patternType:
                "solid",

              fgColor: {
                rgb:
                  "FFF2CC",
              },

            },


            alignment: {

              horizontal:
                "center",

              vertical:
                "center",

            },

          };

        }


        if (
          status ===
          "sold"
        ) {

          statusCell.s = {

            font: {

              name:
                "Arial",

              sz:
                10,

              bold:
                true,

              color: {
                rgb:
                  "FFFFFF",
              },

            },


            fill: {

              patternType:
                "solid",

              fgColor: {
                rgb:
                  "A80000",
              },

            },


            alignment: {

              horizontal:
                "center",

              vertical:
                "center",

            },

          };

        }

      }


      /* ======================================================
         AUTO FILTER
      ====================================================== */

      worksheet["!autofilter"] = {

        ref:
          `A3:H${
            rows.length + 3
          }`,

      };


      /* ======================================================
         PAGE SETUP
      ====================================================== */

      worksheet["!pageSetup"] = {

        orientation:
          "landscape",

        paperSize:
          9,

        fitToPage:
          true,

        fitToWidth:
          1,

        fitToHeight:
          0,

      };


      /* ======================================================
         CREATE WORKBOOK
      ====================================================== */

      const workbook =
        XLSX.utils.book_new();


      XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Customers"

      );


      /* ======================================================
         WORKBOOK PROPERTIES
      ====================================================== */

      workbook.Props = {

        Title:
          "R Dream Infra Developers - Customer Records",

        Subject:
          "Customer Booking Records",

        Author:
          "R Dream Infra Developers",

        Company:
          "R Dream Infra Developers",

        Category:
          "Real Estate Customer Records",

        Keywords:
          "R Dream, Customers, Bookings, Payments",

      };


      /* ======================================================
         WRITE EXCEL FILE
      ====================================================== */

      const excelBuffer =
        XLSX.write(

          workbook,

          {

            bookType:
              "xlsx",

            type:
              "array",

            cellStyles:
              true,

            bookSST:
              false,

          }

        );


      /* ======================================================
         DOWNLOAD
      ====================================================== */

      const blob =
        new Blob(

          [excelBuffer],

          {

            type:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          }

        );


      const fileName =
        `R_Dream_Customers_${
          new Date()
            .toLocaleDateString(
              "en-IN"
            )
            .replace(
              /\//g,
              "-"
            )
        }.xlsx`;


      saveAs(
        blob,
        fileName
      );


      toast.success(
        "Customers exported successfully"
      );


    } catch (error) {

      console.error(
        "Excel export error:",
        error
      );

      toast.error(
        "Failed to export Excel file"
      );

    }
  }


  /* ==========================================================
     STATUS CLASS
  ========================================================== */

  function getStatusClass(
    status
  ) {

    const value =
      status?.toLowerCase();


    if (
      value ===
      "available"
    ) {
      return "available";
    }


    if (
      value ===
      "booked"
    ) {
      return "booked";
    }


    if (
      value ===
      "completed"
    ) {
      return "completed";
    }


    if (
      value ===
      "sold"
    ) {
      return "sold";
    }


    if (
      value ===
      "cancelled"
    ) {
      return "cancelled";
    }


    return "default";
  }


  /* ==========================================================
     FORMAT MONEY
  ========================================================== */

  function formatMoney(
    value
  ) {

    return Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    );

  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <Sidebar
        sidebarOpen={
          sidebarOpen
        }
        setSidebarOpen={
          setSidebarOpen
        }
      />


      <div className="main-content customers-main-content">

        <Topbar
          setSidebarOpen={
            setSidebarOpen
          }
        />


        <main className="customers-premium-page">

          {/* ==================================================
              HERO
          ================================================== */}

          <section className="premium-customer-hero">

            <div className="hero-overlay" />


            <div className="hero-content">

              <div className="hero-kicker">
                CUSTOMER MANAGEMENT
              </div>


              <h1>
                Customers
              </h1>


              <p>
                Manage your customers,
                bookings and payments
                in one place.
              </p>


              <div className="hero-highlights">

                <span>

                  <CheckCircle2
                    size={17}
                  />

                  Trusted by many

                </span>


                <span>

                  <MapPin
                    size={17}
                  />

                  Prime Locations

                </span>


                <span>

                  <FileText
                    size={17}
                  />

                  Clear Titles

                </span>


                <span>

                  <span className="road-icon">
                    ▰
                  </span>

                  Better Future

                </span>

              </div>

            </div>


            <div
              className="hero-architecture"
              aria-hidden="true"
            >

              <div className="hero-glow" />


              <div className="hero-house">

                <div className="house-roof" />


                <div className="house-floor floor-one">

                  <i />
                  <i />
                  <i />
                  <i />

                </div>


                <div className="house-floor floor-two">

                  <i />
                  <i />
                  <i />

                </div>


                <div className="house-gate">

                  <span />
                  <span />
                  <span />

                </div>


                <div className="house-lawn" />

              </div>


              <div className="hero-script">

                Building
                <br />
                Better Tomorrow

              </div>

            </div>

          </section>


          {/* ==================================================
              KPI CARDS
          ================================================== */}

          <section className="premium-kpis">

            <article className="premium-kpi kpi-blue">

              <div className="kpi-icon">

                <Users
                  size={27}
                />

              </div>


              <div>

                <span>
                  Total Customers
                </span>

                <strong>
                  {totalCustomers}
                </strong>

                <small>
                  All registered
                  customers
                </small>

              </div>


              <b className="kpi-trend">

                ↑{" "}
                {totalCustomers
                  ? "12%"
                  : "0%"}

              </b>

            </article>


            <article className="premium-kpi kpi-green">

              <div className="kpi-icon">

                <CalendarDays
                  size={27}
                />

              </div>


              <div>

                <span>
                  Booked Customers
                </span>

                <strong>
                  {bookedCustomers}
                </strong>

                <small>
                  Customers with
                  bookings
                </small>

              </div>


              <b className="kpi-trend">
                ↑ 8%
              </b>

            </article>


            <article className="premium-kpi kpi-gold">

              <div className="kpi-icon">
                ₹
              </div>


              <div>

                <span>
                  Total Amount
                  Collected
                </span>

                <strong>
                  ₹
                  {formatMoney(
                    totalCollected
                  )}
                </strong>

                <small>
                  Total payments
                  received
                </small>

              </div>


              <b className="kpi-trend">
                ↑ 14%
              </b>

            </article>


            <article className="premium-kpi kpi-red">

              <div className="kpi-icon">

                <Clock3
                  size={27}
                />

              </div>


              <div>

                <span>
                  Pending Balance
                </span>

                <strong>
                  ₹
                  {formatMoney(
                    totalPending
                  )}
                </strong>

                <small>
                  Remaining amount
                  to be collected
                </small>

              </div>


              <b className="kpi-trend down">
                ↓ 5%
              </b>

            </article>

          </section>


          {/* ==================================================
              FILTER BAR
          ================================================== */}

          <section className="premium-filter-bar">

            <div className="premium-search">

              <Search
                size={19}
              />


              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search by name, phone number, plot number..."
              />


              {search && (

                <button
                  type="button"
                  className="premium-clear"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ×
                </button>

              )}

            </div>


            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option>
                All Status
              </option>

              <option>
                Booked
              </option>

              <option>
                Sold
              </option>

            </select>


            <select
              value={
                registrationFilter
              }
              onChange={(e) =>
                setRegistrationFilter(
                  e.target.value
                )
              }
            >

              <option>
                All Registration
              </option>

              <option>
                Pending
              </option>

              <option>
                Completed
              </option>

            </select>


            <label className="date-filter">

              <CalendarDays
                size={17}
              />


              <input
                type="date"
                value={
                  dateFilter
                }
                onChange={(e) =>
                  setDateFilter(
                    e.target.value
                  )
                }
              />

            </label>


            <button
              className="premium-refresh"
              type="button"
              onClick={
                fetchCustomers
              }
            >

              <RefreshCw
                size={17}
              />

              Refresh

            </button>


            <button
              className="premium-export"
              type="button"
              onClick={
                exportExcel
              }
            >

              <Download
                size={17}
              />

              Export Excel

            </button>


            <button
              className="premium-add"
              type="button"
              onClick={() =>
                setShowModal(true)
              }
            >

              <Plus
                size={18}
              />

              Add Customer

            </button>

          </section>


          {/* ==================================================
              DIRECTORY
          ================================================== */}

          <section className="premium-directory">

            <div className="premium-directory-head">

              <div className="directory-heading">

                <div className="directory-heading-icon">

                  <Users
                    size={25}
                  />

                </div>


                <div>

                  <h2>
                    Customer Directory
                  </h2>


                  <p>

                    Showing{" "}

                    <b>
                      {
                        filteredCustomers.length
                      }
                    </b>

                    {" "}of{" "}

                    <b>
                      {
                        customers.length
                      }
                    </b>

                    {" "}customers

                  </p>

                </div>

              </div>


              <div className="database-connected">

                <span />


                <div>

                  <b>
                    Database Connected
                  </b>

                  <small>
                    Live data from
                    Supabase
                  </small>

                </div>

              </div>

            </div>


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

              <div className="premium-empty">

                <div className="premium-spinner" />

                <h3>
                  Loading Customers
                </h3>

                <p>
                  Fetching the latest
                  customer records.
                </p>

              </div>


            ) : filteredCustomers.length === 0 ? (

              /* ===============================================
                 EMPTY STATE
              =============================================== */

              <div className="premium-empty">

                <div className="empty-icon">

                  <UserRound
                    size={30}
                  />

                </div>


                <h3>
                  No Customers Found
                </h3>


                <p>

                  {
                    search ||
                    statusFilter !==
                      "All Status" ||
                    registrationFilter !==
                      "All Registration" ||
                    dateFilter

                      ? "Change your search or filters and try again."

                      : "No customer records are available."
                  }

                </p>

              </div>


            ) : (

              <>

                {/* ==========================================
                    DESKTOP TABLE
                ========================================== */}

                <div className="premium-table-wrap">

                  <table className="premium-customers-table">

                    <thead>

                      <tr>

                        <th>
                          #
                        </th>


                        <th>
                          CUSTOMER
                        </th>


                        <th>
                          PLOT DETAILS
                        </th>


                        <th>
                          CONTACT
                        </th>


                        <th>
                          TOTAL AMOUNT
                        </th>


                        <th>
                          PAID AMOUNT
                        </th>


                        <th>
                          BALANCE
                        </th>


                        <th>
                          STATUS
                        </th>


                        <th>
                          REGISTRATION
                        </th>


                        <th>
                          ACTIONS
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredCustomers.map(
                        (
                          customer,
                          index
                        ) => {

                          const balance =
                            Number(
                              customer.balance ||
                                0
                            );


                          const status =
                            customer.status ||
                            "Booked";


                          const registration =
                            customer.registration_status ||
                            "Pending";


                          return (

                            <tr
                              key={
                                customer.id
                              }
                            >

                              <td className="row-number">

                                {index + 1}

                              </td>


                              {/* CUSTOMER */}

                              <td>

                                <div className="premium-customer">

                                  <div
                                    className={`premium-avatar avatar-${
                                      index % 7
                                    }`}
                                  >

                                    {
                                      customer.name
                                        ?.charAt(
                                          0
                                        )
                                        ?.toUpperCase() ||
                                      "C"
                                    }

                                  </div>


                                  <div>

                                    <strong>

                                      {
                                        customer.name ||
                                        "Unknown"
                                      }

                                    </strong>


                                    <small>

                                      <CalendarDays
                                        size={10}
                                      />


                                      {
                                        customer.booking_date

                                          ? new Date(
                                              customer.booking_date
                                            ).toLocaleDateString(
                                              "en-IN",
                                              {
                                                day:
                                                  "2-digit",

                                                month:
                                                  "short",

                                                year:
                                                  "numeric",
                                              }
                                            )

                                          : "No booking date"
                                      }

                                    </small>

                                  </div>

                                </div>

                              </td>


                              {/* PLOT DETAILS */}

                              <td>

                                <div className="premium-plot-details">

                                  <span>

                                    #
                                    {
                                      customer.plot_no ||
                                      "-"
                                    }

                                  </span>


                                  <small>

                                    {
                                      customer.plot_size

                                        ? `${customer.plot_size} Sq.Yds`

                                        : customer.plot_area

                                        ? `${customer.plot_area} Sq.Yds`

                                        : "Plot details"
                                    }

                                  </small>

                                </div>

                              </td>


                              {/* CONTACT */}

                              <td>

                                <div className="premium-phone">

                                  <Phone
                                    size={14}
                                  />

                                  <span>

                                    {
                                      customer.mobile ||
                                      "-"
                                    }

                                  </span>

                                </div>

                              </td>


                              {/* TOTAL */}

                              <td className="amount-cell">

                                ₹
                                {formatMoney(
                                  customer.total_amount
                                )}

                              </td>


                              {/* PAID */}

                              <td>

                                <span className="paid-pill">

                                  ₹
                                  {formatMoney(
                                    customer.amount_paid
                                  )}

                                </span>

                              </td>


                              {/* BALANCE */}

                              <td>

                                <span
                                  className={`premium-balance ${
                                    balance >
                                    0
                                      ? "has-balance"
                                      : "no-balance"
                                  }`}
                                >

                                  ₹
                                  {formatMoney(
                                    balance
                                  )}

                                </span>

                              </td>


                              {/* STATUS */}

                              <td>

                                <span
                                  className={`premium-status ${getStatusClass(
                                    status
                                  )}`}
                                >

                                  <i />

                                  {status}

                                </span>

                              </td>


                              {/* REGISTRATION */}

                              <td>

                                <span
                                  className={`registration-pill ${
                                    registration
                                      .toLowerCase() ===
                                    "completed"
                                      ? "completed"
                                      : "pending"
                                  }`}
                                >

                                  {
                                    registration
                                  }

                                </span>

                              </td>


                              {/* ACTIONS */}

                              <td>

                                <div className="premium-actions">

                                  <Link
                                    to={`/customer/${customer.id}`}
                                    className="premium-action view"
                                    title="View Customer"
                                  >

                                    <Eye
                                      size={17}
                                    />

                                  </Link>


                                  <Link
                                    to={`/edit-customer/${customer.id}`}
                                    className="premium-action edit"
                                    title="Edit Customer"
                                  >

                                    <Pencil
                                      size={17}
                                    />

                                  </Link>


                                  <button
                                    type="button"
                                    className="premium-action delete"
                                    title="Delete Customer"
                                    onClick={() =>
                                      deleteCustomer(
                                        customer
                                      )
                                    }
                                  >

                                    <Trash2
                                      size={17}
                                    />

                                  </button>

                                </div>

                              </td>

                            </tr>

                          );

                        }
                      )}

                    </tbody>

                  </table>

                </div>


                {/* ==========================================
                    MOBILE LIST
                ========================================== */}

                <div className="premium-mobile-list">

                  {filteredCustomers.map(
                    (
                      customer,
                      index
                    ) => {

                      const balance =
                        Number(
                          customer.balance ||
                            0
                        );


                      return (

                        <article
                          className="premium-mobile-card"
                          key={
                            customer.id
                          }
                        >

                          <div className="mobile-card-heading">

                            <div className="premium-customer">

                              <div
                                className={`premium-avatar avatar-${
                                  index % 7
                                }`}
                              >

                                {
                                  customer.name
                                    ?.charAt(
                                      0
                                    )
                                    ?.toUpperCase() ||
                                  "C"
                                }

                              </div>


                              <div>

                                <strong>

                                  {
                                    customer.name ||
                                    "Unknown"
                                  }

                                </strong>


                                <small>

                                  Plot #
                                  {
                                    customer.plot_no ||
                                    "-"
                                  }

                                </small>

                              </div>

                            </div>


                            <span
                              className={`premium-status ${getStatusClass(
                                customer.status
                              )}`}
                            >

                              <i />

                              {
                                customer.status ||
                                "Booked"
                              }

                            </span>

                          </div>


                          <div className="mobile-card-grid">

                            <div>

                              <small>
                                Mobile
                              </small>

                              <b>
                                {
                                  customer.mobile ||
                                  "-"
                                }
                              </b>

                            </div>


                            <div>

                              <small>
                                Total
                              </small>

                              <b>

                                ₹
                                {formatMoney(
                                  customer.total_amount
                                )}

                              </b>

                            </div>


                            <div>

                              <small>
                                Paid
                              </small>

                              <b className="mobile-paid">

                                ₹
                                {formatMoney(
                                  customer.amount_paid
                                )}

                              </b>

                            </div>


                            <div>

                              <small>
                                Balance
                              </small>

                              <b className="mobile-balance">

                                ₹
                                {formatMoney(
                                  balance
                                )}

                              </b>

                            </div>

                          </div>


                          <div className="mobile-actions">

                            <Link
                              to={`/customer/${customer.id}`}
                              className="mobile-view"
                            >

                              <Eye
                                size={15}
                              />

                              View

                            </Link>


                            <Link
                              to={`/edit-customer/${customer.id}`}
                              className="mobile-edit"
                            >

                              <Pencil
                                size={15}
                              />

                              Edit

                            </Link>


                            <button
                              type="button"
                              className="mobile-delete"
                              onClick={() =>
                                deleteCustomer(
                                  customer
                                )
                              }
                            >

                              <Trash2
                                size={16}
                              />

                            </button>

                          </div>

                        </article>

                      );

                    }
                  )}

                </div>

              </>

            )}

          </section>


          {/* ==================================================
              ADD CUSTOMER MODAL
          ================================================== */}

          {showModal && (

            <AddCustomerModal

              onClose={() => {

                setShowModal(
                  false
                );

                fetchCustomers();

              }}

            />

          )}

        </main>

      </div>

    </>
  );
}


export default Customers;