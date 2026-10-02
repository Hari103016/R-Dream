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
import ExcelJS from "exceljs";
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

        confirmButtonText:
          "Delete",

        cancelButtonText:
          "Cancel",

        buttonsStyling:
          false,

        customClass: {
          popup:
            "rd-customer-delete-popup",

          icon:
            "rd-customer-delete-icon",

          title:
            "rd-customer-delete-title",

          htmlContainer:
            "rd-customer-delete-text",

          actions:
            "rd-customer-delete-actions",

          confirmButton:
            "rd-customer-delete-confirm",

          cancelButton:
            "rd-customer-delete-cancel",
        },

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
     CUSTOMER REGISTRATION EXCEL
     - One button for every customer row
     - Groups all separate bookings using mobile number
     - Shows every booked plot
     - Shows registration status per plot
     - Excel Registration column has Pending / Completed dropdown
  ========================================================== */

  async function exportCustomerRegistrationExcel(customer) {
    try {
      const mobile = String(customer?.mobile || "").trim();
      if (!mobile) {
        toast.warning("Customer mobile number is missing");
        return;
      }

      toast.info("Preparing customer registration Excel...");

      const { data: customerRows, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("mobile", mobile)
        .order("booking_date", { ascending: true });

      if (customerError) throw customerError;

      const bookings = customerRows || [];
      if (!bookings.length) {
        toast.warning("No booking records found for this customer");
        return;
      }

      const customerIds = bookings
        .map((row) => row.id)
        .filter((id) => id !== null && id !== undefined);

      const { data: plotRows, error: plotError } = await supabase
        .from("plots")
        .select("*")
        .in("customer_id", customerIds);

      if (plotError) throw plotError;

      const bookingById = new Map(
        bookings.map((row) => [String(row.id), row])
      );

      const asList = (value) => {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined || value === "") return [];
        return String(value)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      };

      const formatDate = (value) => {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };

      const getValue = (obj, keys, fallback = "") => {
        for (const key of keys) {
          if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== "") {
            return obj[key];
          }
        }
        return fallback;
      };

      const getRegistration = (booking) => {
        const value = String(
          booking?.registration_status || customer?.registration_status || "Pending"
        ).toLowerCase();
        return value === "completed" || value === "registered"
          ? "Registered"
          : "Not Registered";
      };

      const finalPlotRows = [];
      const linkedBookingIds = new Set();

      (plotRows || []).forEach((plot) => {
        const booking = bookingById.get(String(plot.customer_id));
        if (booking?.id !== undefined && booking?.id !== null) {
          linkedBookingIds.add(String(booking.id));
        }

        const size = Number(
          getValue(plot, ["plot_size", "plot_area", "size", "area"], 0)
        ) || 0;
        const value = Number(
          getValue(plot, ["price", "total_amount", "amount"], 0)
        ) || 0;

        finalPlotRows.push({
          plotNo: getValue(plot, ["plot_no", "plot_number", "plotNumber"], ""),
          plotSize: size,
          rate: size > 0 ? value / size : 0,
          plotValue: value,
          registration: getRegistration(booking),
          registrationDate:
            getRegistration(booking) === "Registered"
              ? formatDate(
                  getValue(plot, [
                    "registration_date",
                    "registered_date",
                    "registrationDate",
                  ])
                )
              : "",
        });
      });

      bookings.forEach((booking) => {
        if (linkedBookingIds.has(String(booking.id))) return;

        const plotNumbers = asList(booking.plot_no);
        const plotSizes = asList(booking.plot_size || booking.plot_area);
        const count = Math.max(plotNumbers.length, plotSizes.length, 1);
        const totalValue = Number(booking.total_amount || 0) || 0;
        const perPlotValue = count === 1 ? totalValue : totalValue / count;

        for (let i = 0; i < count; i += 1) {
          const size = Number(plotSizes[i] || 0) || 0;
          finalPlotRows.push({
            plotNo: plotNumbers[i] || booking.plot_no || "",
            plotSize: size,
            rate: size > 0 ? perPlotValue / size : 0,
            plotValue: perPlotValue,
            registration: getRegistration(booking),
            registrationDate: "",
          });
        }
      });

      finalPlotRows.forEach((row, index) => {
        row.sno = index + 1;
      });

      const totalPaid = bookings.reduce(
        (sum, row) => sum + Number(row.amount_paid || 0),
        0
      );

      const totalArea = finalPlotRows.reduce(
        (sum, row) => sum + Number(row.plotSize || 0),
        0
      );

      const bookingTotalValue = finalPlotRows.reduce(
        (sum, row) => sum + Number(row.plotValue || 0),
        0
      );

      const customerName = customer?.name || bookings[0]?.name || "Customer";
      const safeName =
        String(customerName)
          .replace(/[^a-zA-Z0-9 _-]/g, "")
          .trim()
          .replace(/\s+/g, "_") || "Customer";

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "R Dream Infra Developers";
      workbook.company = "R Dream Infra Developers";
      workbook.title = `${customerName} Plot Registry`;
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("Plot Registry", {
        views: [{ showGridLines: false }],
        pageSetup: {
          orientation: "landscape",
          paperSize: 9,
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          horizontalCentered: true,
          verticalCentered: false,
          margins: {
            left: 0.20,
            right: 0.20,
            top: 0.20,
            bottom: 0.20,
            header: 0.15,
            footer: 0.15,
          },
        },
      });

      // Simple, balanced widths. No oversized blank area and no clipped right edge.
      worksheet.columns = [
        { width: 17 }, // A Serial
        { width: 26 }, // B Plot Number
        { width: 16 }, // C Sq.Yd.
        { width: 28 }, // D Rate
        { width: 32 }, // E Registration Date
        { width: 28 }, // F Status
        { width: 29 }, // G Plot Value
        { width: 29 }, // H Amount Paid
      ];

      const darkGreen = "2F6B3B";
      const lightGreen = "EEF6EB";
      const border = "C7D8C2";
      const gold = "D5AF45";
      const text = "243424";
      const white = "FFFFFF";
      const yellow = "FFF0B5";
      const green = "C8EFC2";

      const borderStyle = {
        top: { style: "thin", color: { argb: border } },
        bottom: { style: "thin", color: { argb: border } },
        left: { style: "thin", color: { argb: border } },
        right: { style: "thin", color: { argb: border } },
      };

      const style = (cell, opts = {}) => {
        cell.font = {
          name: "Arial",
          size: opts.size || 10,
          bold: !!opts.bold,
          color: { argb: opts.color || text },
        };
        cell.alignment = {
          horizontal: opts.align || "center",
          vertical: "middle",
          wrapText: !!opts.wrap,
        };
        cell.border = borderStyle;
      };

      // Header
      worksheet.mergeCells("A1:H1");
      worksheet.getCell("A1").value = "R DREAM INFRA DEVELOPERS";
      worksheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: darkGreen },
      };
      worksheet.getCell("A1").font = {
        name: "Arial",
        size: 19,
        bold: true,
        color: { argb: white },
      };
      worksheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell("A1").border = {
        bottom: { style: "medium", color: { argb: gold } },
      };
      worksheet.getRow(1).height = 32;

      worksheet.mergeCells("A2:H2");
      worksheet.getCell("A2").value = "REAL ESTATE PLOT REGISTRY TRACKER";
      worksheet.getCell("A2").font = {
        name: "Arial",
        size: 14,
        bold: true,
        color: { argb: darkGreen },
      };
      worksheet.getCell("A2").alignment = {
        horizontal: "left",
        vertical: "middle",
      };
      worksheet.getRow(2).height = 25;

      // Customer details
      worksheet.mergeCells("A3:D3");
      worksheet.mergeCells("E3:H3");
      worksheet.getCell("A3").value = `Customer Name : ${customerName}`;
      worksheet.getCell("E3").value = `Mobile Number : ${mobile}`;
      ["A3", "E3"].forEach((address) => {
        style(worksheet.getCell(address), {
          size: 11,
          bold: true,
          align: "left",
        });
        worksheet.getCell(address).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: lightGreen },
        };
      });
      worksheet.getRow(3).height = 24;

      // Four simple summary blocks.
      const blocks = [
        ["A4:B4", "A5:B5", "TOTAL PLOTS", { formula: `COUNTA(B9:B${8 + finalPlotRows.length})` }],
        ["C4:D4", "C5:D5", "TOTAL AREA (SQ YD)", { formula: `SUM(C9:C${8 + finalPlotRows.length})` }],
        ["E4:F4", "E5:F5", "TOTAL REGISTERED VALUE", { formula: `SUMIF(F9:F${8 + finalPlotRows.length},\"Registered\",G9:G${8 + finalPlotRows.length})` }],
        ["G4:H4", "G5:H5", "TOTAL DUE", { formula: `MAX(0,E5-SUMIF(F9:F${8 + finalPlotRows.length},\"Registered\",H9:H${8 + finalPlotRows.length}))` }],
      ];

      blocks.forEach(([labelRange, valueRange, label, value]) => {
        worksheet.mergeCells(labelRange);
        worksheet.mergeCells(valueRange);
        const labelCell = worksheet.getCell(labelRange.split(":")[0]);
        const valueCell = worksheet.getCell(valueRange.split(":")[0]);
        labelCell.value = label;
        valueCell.value = value;
        style(labelCell, { size: 9, bold: true, color: "657565" });
        style(valueCell, { size: 16, bold: true });
        labelCell.fill = valueCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: lightGreen },
        };
      });

      worksheet.getCell("A5").numFmt = "#,##0";
      worksheet.getCell("C5").numFmt = "#,##0";
      worksheet.getCell("E5").numFmt = '₹#,##0';
      worksheet.getCell("G5").numFmt = '₹#,##0';
      worksheet.getRow(4).height = 20;
      worksheet.getRow(5).height = 30;

      worksheet.mergeCells("A6:D6");
      worksheet.mergeCells("E6:H6");
      worksheet.getCell("A6").value = `TOTAL AMOUNT PAID : ₹${totalPaid.toLocaleString("en-IN")}`;
      worksheet.getCell("E6").value = `AMOUNT RECEIVED : ₹${totalPaid.toLocaleString("en-IN")}`;
      ["A6", "E6"].forEach((address) => {
        style(worksheet.getCell(address), { size: 10, bold: true, align: "left", color: darkGreen });
        worksheet.getCell(address).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: lightGreen },
        };
      });
      worksheet.getRow(6).height = 22;
      worksheet.getRow(7).height = 23;

      // Registry title
      worksheet.mergeCells("A7:H7");
      worksheet.getCell("A7").value = "PLOT REGISTRY";
      worksheet.getCell("A7").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: darkGreen },
      };
      worksheet.getCell("A7").font = {
        name: "Arial",
        size: 12,
        bold: true,
        color: { argb: white },
      };
      worksheet.getCell("A7").alignment = { horizontal: "left", vertical: "middle" };
      worksheet.getRow(7).height = 23;

      const header = worksheet.addRow([
        "Serial No.",
        "Plot Number",
        "Sq. Yd.",
        "Rate (per Sq. Yd.)",
        "Date of Registration",
        "Status",
        "Plot Value",
        "Amount Paid",
      ]);

      header.eachCell((cell) => {
        style(cell, { size: 10, bold: true, color: white, wrap: true });
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: darkGreen },
        };
      });
      header.height = 28;

      const plotStartRow = header.number + 1;
      const plotEndRow = plotStartRow + finalPlotRows.length - 1;

      finalPlotRows.forEach((row) => {
        const value = Number(row.plotValue || 0);
        const paid =
          bookingTotalValue > 0 && value > 0
            ? totalPaid * (value / bookingTotalValue)
            : 0;

        const excelRow = worksheet.addRow([
          row.sno,
          row.plotNo,
          Number(row.plotSize || 0),
          Number(row.rate || 0),
          row.registrationDate || "",
          row.registration,
          value,
          paid,
        ]);

        excelRow.eachCell((cell) => style(cell, { size: 10 }));
        excelRow.getCell(3).numFmt = "#,##0";
        excelRow.getCell(4).numFmt = '₹#,##0';
        excelRow.getCell(7).numFmt = '₹#,##0';
        excelRow.getCell(8).numFmt = '₹#,##0';

        const status = excelRow.getCell(6);
        status.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: row.registration === "Registered" ? green : yellow },
        };
        status.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: text },
        };
      });

      if (plotEndRow >= plotStartRow) {
        worksheet.dataValidations.add(`F${plotStartRow}:F${plotEndRow}`, {
          type: "list",
          allowBlank: false,
          formulae: ['"Registered,Not Registered"'],
          showErrorMessage: true,
          errorTitle: "Invalid status",
          error: "Select Registered or Not Registered.",
        });
      }

      worksheet.autoFilter = `A${header.number}:H${plotEndRow}`;
      worksheet.freezePanes = `A${plotStartRow}`;

      // Clean, lightly highlighted totals row.
      // Keep every value in its own column so the row stays simple and readable.
      const totalRow = worksheet.addRow([
        "TOTAL",
        `${finalPlotRows.length} PLOTS`,
        { formula: `SUM(C${plotStartRow}:C${plotEndRow})` },
        "",
        "",
        "TOTAL VALUE",
        { formula: `SUM(G${plotStartRow}:G${plotEndRow})` },
        { formula: `SUM(H${plotStartRow}:H${plotEndRow})` },
      ]);

      const totalLightGreen = "F1F7F2";
      const totalBorder = "B8D2BE";
      const totalText = "1F5E38";

      totalRow.height = 27;
      totalRow.eachCell((cell) => {
        cell.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: totalText },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: totalLightGreen },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin", color: { argb: totalBorder } },
          bottom: { style: "thin", color: { argb: totalBorder } },
          left: { style: "thin", color: { argb: totalBorder } },
          right: { style: "thin", color: { argb: totalBorder } },
        };
      });

      totalRow.getCell(3).numFmt = "#,##0";
      totalRow.getCell(7).numFmt = '₹#,##0';
      totalRow.getCell(8).numFmt = '₹#,##0';

      // No payment-history section and no extra explanatory rows.
      worksheet.properties.defaultRowHeight = 18;
      worksheet.pageSetup.printArea = `A1:H${totalRow.number}`;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `R_Dream_${safeName}_Plot_Registry.xlsx`);
      toast.success("Customer plot registry Excel downloaded");
    } catch (error) {
      console.error("Customer registration Excel error:", error);
      toast.error(error?.message || "Failed to create customer Excel");
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

                                <div className="registration-cell">

                                  <span
                                    className={`registration-pill ${
                                      registration
                                        .toLowerCase() ===
                                      "completed"
                                        ? "completed"
                                        : "pending"
                                    }`}
                                  >

                                    {registration}

                                  </span>

                                  <button
                                    type="button"
                                    className="registration-excel-button"
                                    title="Download one Excel containing all plots booked by this customer"
                                    onClick={() =>
                                      exportCustomerRegistrationExcel(
                                        customer
                                      )
                                    }
                                  >
                                    <Download size={14} />
                                    Excel
                                  </button>

                                </div>

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