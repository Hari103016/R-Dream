import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { supabase } from "../services/supabase";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import PlotCard from "../components/PlotCard";
import AddPlotModal from "../components/AddPlotModal";
import EditPlotModal from "../components/EditPlotModal";
import BookPlotModal from "../components/BookPlotModal";

import "./Plots.css";

function getCanonicalCustomerFinancials(customer, totalPaidOverride) {
  const total = Number(customer?.total_amount || 0);
  const paid = Number(totalPaidOverride ?? customer?.amount_paid ?? 0);
  const balance = Math.max(total - paid, 0);

  if (total > 0) {
    const paymentCompleted = paid >= total;
    const registrationCompleted =
      String(customer?.registration_status || "").toLowerCase() ===
        "completed" ||
      String(customer?.registration_status || "").toLowerCase() ===
        "registered";

    const completed = paymentCompleted || registrationCompleted;

    return {
      ...customer,
      amount_paid: paid,
      balance,
      status: completed ? "Sold" : "Booked",
      registration_status: completed ? "Completed" : "Pending",
    };
  }

  return {
    ...customer,
    amount_paid: paid,
    balance,
    status: customer?.status || "Booked",
    registration_status: customer?.registration_status || "Pending",
  };
}

function Plots() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [plots, setPlots] = useState([]);
  const [ventures, setVentures] = useState([]);

  const SELECTED_VENTURE_STORAGE_KEY = "r-dream-selected-venture-id";

  const [selectedVentureId, setSelectedVentureId] = useState(() => {
    try {
      return localStorage.getItem(SELECTED_VENTURE_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [loading, setLoading] = useState(true);
  const [ventureLoading, setVentureLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);

  const [selectedPlots, setSelectedPlots] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchVentures();
  }, []);

  useEffect(() => {
    if (selectedVentureId) {
      fetchPlots(selectedVentureId);
    } else {
      setPlots([]);
      setLoading(false);
    }

    setSelectedPlots([]);
    setSelectionMode(false);
  }, [selectedVentureId]);

  async function fetchVentures() {
    setVentureLoading(true);

    try {
      const { data, error } = await supabase
        .from("ventures")
        .select("id, venture_name, village, phase_name, total_plots")
        .order("village", { ascending: true })
        .order("phase_name", { ascending: true });

      if (error) throw error;

      const ventureList = data || [];
      setVentures(ventureList);

      // Keep the same venture selected when navigating away and returning.
      // The venture ID is the permanent identity; the display name is not used.
      let savedVentureId = "";
      try {
        savedVentureId =
          localStorage.getItem(SELECTED_VENTURE_STORAGE_KEY) || "";
      } catch {
        savedVentureId = "";
      }

      const savedVentureExists = ventureList.some(
        (venture) => String(venture.id) === String(savedVentureId)
      );

      if (savedVentureExists) {
        setSelectedVentureId(savedVentureId);
      } else if (ventureList.length > 0) {
        const fallbackVenture = ventureList[0];
        const fallbackId = String(fallbackVenture.id);
        setSelectedVentureId(fallbackId);

        try {
          localStorage.setItem(
            SELECTED_VENTURE_STORAGE_KEY,
            fallbackId
          );
        } catch {
          // Ignore storage errors.
        }
      }
    } catch (error) {
      console.error("Unable to load ventures:", error);
      toast.error("Unable to load ventures");
    } finally {
      setVentureLoading(false);
    }
  }

  async function fetchPlots(ventureId) {
    setLoading(true);

    try {
      const [
        { data: plotData, error: plotError },
        { data: customerData, error: customerError },
        { data: paymentData, error: paymentError },
      ] = await Promise.all([
        supabase
          .from("plots")
          .select("*")
          .eq("venture_id", ventureId)
          .order("plot_no", { ascending: true }),
        supabase
          .from("customers")
          .select(
            "id, total_amount, amount_paid, status, registration_status, plot_no, venture_id"
          )
          .eq("venture_id", ventureId),
        supabase
          .from("payments")
          .select("customer_id, amount, venture_id")
          .eq("venture_id", ventureId),
      ]);

      if (plotError) throw plotError;
      if (customerError) throw customerError;
      if (paymentError) throw paymentError;

      const paidByCustomer = new Map();

      (customerData || []).forEach((customer) => {
        paidByCustomer.set(customer.id, 0);
      });

      (paymentData || []).forEach((payment) => {
        const customerId = payment.customer_id;
        if (customerId == null) return;

        paidByCustomer.set(
          customerId,
          (paidByCustomer.get(customerId) || 0) + Number(payment.amount || 0)
        );
      });

      const customerMap = new Map(
        (customerData || []).map((customer) => [
          customer.id,
          getCanonicalCustomerFinancials(
            customer,
            paidByCustomer.get(customer.id)
          ),
        ])
      );

      const customerByPlotNo = new Map();

      (customerData || []).forEach((customer) => {
        if (customer.plot_no != null) {
          customerByPlotNo.set(String(customer.plot_no), customer);
        }
      });

      const normalizedPlots = (plotData || []).map((plot) => {
        const customer =
          customerMap.get(plot.customer_id) ||
          customerByPlotNo.get(String(plot.plot_no));

        if (!customer) {
          return {
            ...plot,
            status: plot.status || "Available",
          };
        }

        const registrationCompleted =
          String(customer.registration_status || "").toLowerCase() ===
            "completed" ||
          String(customer.registration_status || "").toLowerCase() ===
            "registered";

        const paymentCompleted =
          Number(customer.total_amount || 0) > 0 &&
          Number(
            paidByCustomer.get(customer.id) ?? customer.amount_paid ?? 0
          ) >= Number(customer.total_amount || 0);

        return {
          ...plot,
          customer_id: plot.customer_id || customer.id,
          status:
            registrationCompleted || paymentCompleted
              ? "Sold"
              : "Booked",
        };
      });

      setCustomers(customerData || []);
      setPayments(paymentData || []);
      setPlots(normalizedPlots);
    } catch (error) {
      console.error("Unable to load plots:", error);
      toast.error("Unable to load plots");
      setPlots([]);
    } finally {
      setLoading(false);
    }
  }

  const selectedVenture = useMemo(
    () => ventures.find((venture) => venture.id === selectedVentureId) || null,
    [ventures, selectedVentureId]
  );

  const filteredPlots = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return plots.filter((plot) => {
      const searchableText = [
        plot.plot_no,
        plot.plot_size,
        plot.facing,
        plot.road_width,
        plot.rate,
        plot.price,
        plot.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch =
        !searchValue || searchableText.includes(searchValue);

      const matchStatus =
        statusFilter === "All" || plot.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [plots, search, statusFilter]);

  function togglePlotSelection(plotId) {
    setSelectedPlots((prev) =>
      prev.includes(plotId)
        ? prev.filter((id) => id !== plotId)
        : [...prev, plotId]
    );
  }

  function clearSelection() {
    setSelectedPlots([]);
    setSelectionMode(false);
  }

  function selectAllAvailable() {
    setSelectionMode(true);

    const availableIds = filteredPlots
      .filter((plot) => plot.status === "Available")
      .map((plot) => plot.id);

    setSelectedPlots(availableIds);
  }

  const selectedPlotObjects = useMemo(
    () => plots.filter((plot) => selectedPlots.includes(plot.id)),
    [plots, selectedPlots]
  );

  const selectedTotalPrice = useMemo(
    () =>
      selectedPlotObjects.reduce(
        (sum, plot) => sum + Number(plot.price || 0),
        0
      ),
    [selectedPlotObjects]
  );

  function exportExcel() {
    const rows = filteredPlots.map((plot) => ({
      "Venture": selectedVenture?.village || "",
      "Phase": selectedVenture?.phase_name || "",
      "Plot No": plot.plot_no,
      "Plot Size (Sq.Yds)": plot.plot_size,
      "Facing": plot.facing || "",
      "Road Width": plot.road_width || "",
      "Rate / Sq.Yd": Number(plot.rate || 0),
      "Total Price": Number(plot.price || 0),
      "Status": plot.status || "Available",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Plots");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const ventureName = selectedVenture?.village || "Plots";

    saveAs(
      new Blob([buffer]),
      `${ventureName}_Phase1_Plots_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
  }

  async function deletePlot(plot) {
    const result = await Swal.fire({
      title: "Delete Plot?",
      text: `Plot No ${plot.plot_no} will be deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#2563eb",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase
      .from("plots")
      .delete()
      .eq("id", plot.id)
      .eq("venture_id", selectedVentureId);

    if (error) {
      console.error(error);
      toast.error("Unable to delete plot");
      return;
    }

    toast.success("Plot deleted successfully");
    fetchPlots(selectedVentureId);
  }

  function refreshCurrentVenture() {
    if (selectedVentureId) {
      fetchPlots(selectedVentureId);
    }
  }

  return (
    <div className="dashboard">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="main-content">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <div className="plots-page">
          <div className="plots-header">
            <div>
              <h2>Plots Management</h2>

              <p>
                {selectedVenture
                  ? `${selectedVenture.village} • ${selectedVenture.phase_name}`
                  : "Select a venture"}
                {" • "}
                Total Plots: {filteredPlots.length}
              </p>
            </div>

            <div className="header-actions">
              <select
                className="venture-filter"
                value={selectedVentureId}
                onChange={(e) => {
                  const ventureId = e.target.value;
                  setSelectedVentureId(ventureId);

                  try {
                    localStorage.setItem(
                      SELECTED_VENTURE_STORAGE_KEY,
                      ventureId
                    );
                  } catch {
                    // Ignore storage errors.
                  }
                }}
                disabled={ventureLoading}
              >
                <option value="">
                  {ventureLoading
                    ? "Loading ventures..."
                    : "Select Venture"}
                </option>

                {ventures.map((venture) => (
                  <option key={venture.id} value={venture.id}>
                    {venture.village} - {venture.phase_name}
                  </option>
                ))}
              </select>

              <div className="search-box">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search Plot, Facing, Road..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Available</option>
                <option>Booked</option>
                <option>Sold</option>
              </select>

              <button
                className="select-btn"
                onClick={() => setSelectionMode(true)}
              >
                Select Plots
              </button>

              <button className="export-btn" onClick={exportExcel}>
                <Download size={18} />
                Export
              </button>

              <button
                className="add-btn"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={18} />
                Add Plot
              </button>
            </div>
          </div>

          {selectionMode && (
            <div className="selected-bar">
              <div className="selected-left">
                <h3>
                  Selected: <span>{selectedPlots.length}</span>
                </h3>

                <p>
                  Total Amount: ₹
                  {selectedTotalPrice.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="selected-right">
                <button
                  className="select-all-btn"
                  onClick={selectAllAvailable}
                >
                  Select All Available
                </button>

                <button className="clear-btn" onClick={clearSelection}>
                  Clear
                </button>

                <button
                  className="book-selected-btn"
                  disabled={selectedPlots.length === 0}
                  onClick={() => {
                    setSelectedPlot(null);
                    setShowBookingModal(true);
                  }}
                >
                  Book Selected Plots
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="empty">Loading Plots...</div>
          ) : (
            <div className="plots-grid">
              {filteredPlots.length === 0 ? (
                <div className="empty">
                  No Plots Found
                  {selectedVenture && (
                    <small>
                      {selectedVenture.village} -{" "}
                      {selectedVenture.phase_name}
                    </small>
                  )}
                </div>
              ) : (
                filteredPlots.map((plot) => (
                  <PlotCard
                    key={plot.id}
                    plot={plot}
                    selectionMode={selectionMode}
                    checked={selectedPlots.includes(plot.id)}
                    onCheck={() => togglePlotSelection(plot.id)}
                    onEdit={(plotToEdit) => {
                      setSelectedPlot(plotToEdit);
                      setShowEditModal(true);
                    }}
                    onBook={(plotToBook) => {
                      setSelectionMode(false);
                      setSelectedPlots([plotToBook.id]);
                      setSelectedPlot(plotToBook);
                      setShowBookingModal(true);
                    }}
                    onView={(plotToView) => {
                      if (!plotToView.customer_id) {
                        toast.error(
                          "Customer not linked to this plot."
                        );
                        return;
                      }

                      navigate(`/customer/${plotToView.customer_id}`);
                    }}
                    onDelete={deletePlot}
                  />
                ))
              )}
            </div>
          )}

          {showAddModal && (
            <AddPlotModal
              onClose={() => {
                setShowAddModal(false);
                refreshCurrentVenture();
              }}
            />
          )}

          {showEditModal && (
            <EditPlotModal
              plot={selectedPlot}
              onClose={() => {
                setShowEditModal(false);
                setSelectedPlot(null);
                refreshCurrentVenture();
              }}
            />
          )}

          {showBookingModal && (
            <BookPlotModal
              plot={selectedPlot}
              selectedPlots={selectedPlotObjects}
              onClose={() => {
                setShowBookingModal(false);
                setSelectedPlot(null);
                setSelectedPlots([]);
                refreshCurrentVenture();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Plots;
