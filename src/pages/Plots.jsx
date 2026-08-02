  import { useEffect, useMemo, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { Pencil } from "lucide-react";
  import {
    Plus,
    Search,
    Download,
  } from "lucide-react";
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

  function Plots() {

    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [plots, setPlots] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");

    const [showAddModal, setShowAddModal] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);

    const [showBookingModal, setShowBookingModal] = useState(false);

    const [selectedPlot, setSelectedPlot] = useState(null);

    useEffect(() => {
      fetchPlots();
    }, []);

    async function fetchPlots() {

      setLoading(true);

      const { data, error } = await supabase
        .from("plots")
        .select("*")
        .order("plot_no");

      if (error) {

        toast.error("Unable to load plots");

        setLoading(false);

        return;

      }

      setPlots(data || []);

      setLoading(false);

    }

    const filteredPlots = useMemo(() => {

      return plots.filter((plot) => {

        const matchSearch =
          plot.plot_no
            ?.toString()
            .includes(search) ||
          plot.facing
            ?.toLowerCase()
            .includes(search.toLowerCase());

        const matchStatus =
          statusFilter === "All" ||
          plot.status === statusFilter;

        return matchSearch && matchStatus;

      });

    }, [plots, search, statusFilter]);
    function exportExcel() {

    const rows = filteredPlots.map((plot) => ({
      "Plot No": plot.plot_no,
      "Plot Size": plot.plot_size,
      Facing: plot.facing,
      Rate: plot.rate,
      Price: plot.price,
      Status: plot.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Plots"
    );

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer]),
      `Plots_${new Date().toLocaleDateString()}.xlsx`
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
      .eq("id", plot.id);

    if (error) {
      toast.error("Unable to delete plot");
      return;
    }

    toast.success("Plot deleted successfully");

    fetchPlots();

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

  <p>Total Plots : {filteredPlots.length}</p>

  </div>

  <div className="header-actions">

  <div className="search-box">

  <Search size={18}/>

  <input
  type="text"
  placeholder="Search Plot..."
  value={search}
  onChange={(e)=>setSearch(e.target.value)}
  />

  </div>

  <select
  className="status-filter"
  value={statusFilter}
  onChange={(e)=>setStatusFilter(e.target.value)}
  >

  <option>All</option>
  <option>Available</option>
  <option>Booked</option>
  <option>Sold</option>

  </select>

  <button
  className="export-btn"
  onClick={exportExcel}
  >

  <Download size={18}/>

  Export

  </button>

  <button
  className="add-btn"
  onClick={()=>setShowAddModal(true)}
  >

  <Plus size={18}/>

  Add Plot

  </button>

  </div>

  </div>
  {loading ? (

    <div className="empty">
      Loading Plots...
    </div>

  ) : (

    <div className="plots-grid">

      {filteredPlots.length === 0 ? (

        <div className="empty">
          No Plots Found
        </div>

      ) : (

        filteredPlots.map((plot) => (

          <PlotCard
            key={plot.id}
            plot={plot}

            onEdit={(plot) => {
              setSelectedPlot(plot);
              setShowEditModal(true);
            }}

            onBook={(plot) => {
              setSelectedPlot(plot);
              setShowBookingModal(true);
            }}

            onView={(plot) => {
              if (!plot.customer_id) {
                toast.error("Customer not linked to this plot.");
                return;
              }

              navigate(`/customer/${plot.customer_id}`);
            }}

            onDelete={(plot) => {
              deletePlot(plot);
            }}
          />

        ))

      )}

    </div>

  )}

  {showAddModal && (

    <AddPlotModal
      onClose={() => {
        setShowAddModal(false);
        fetchPlots();
      }}
    />

  )}

  {showEditModal && (

    <EditPlotModal
      plot={selectedPlot}
      onClose={() => {
        setShowEditModal(false);
        fetchPlots();
      }}
    />

  )}

  {showBookingModal && (

    <BookPlotModal
      plot={selectedPlot}
      onClose={() => {
        setShowBookingModal(false);
        fetchPlots();
      }}
    />

  )}

  </div>

  </div>

  </div>

  );

}

  export default Plots;