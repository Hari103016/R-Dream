import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  UserRound,
  Phone,
  X,
  UserPlus,
} from "lucide-react";
import { supabase } from "../services/supabase";
import "./SiteVisits.css";

const EMPTY_FORM = {
  visitor_name: "",
  customer_id: "",
  visit_date: "",
  visit_time: "",
  status: "Scheduled",
  assigned_to: "",
  notes: "",
};

function SiteVisits() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const [customersResult, visitsResult] = await Promise.all([
      supabase
        .from("customers")
        .select("id,name,mobile,plot_no")
        .order("name"),
      supabase
        .from("site_visits")
        .select("*, customers(name,mobile,plot_no)")
        .order("visit_date", { ascending: false })
        .order("visit_time", { ascending: false }),
    ]);

    if (customersResult.error) {
      console.error("Customers:", customersResult.error);
    }

    if (visitsResult.error) {
      console.error("Site visits:", visitsResult.error);
      setNotice({
        open: true,
        type: "error",
        title: "Unable to load site visits",
        message: visitsResult.error.message || "Could not load site visit records.",
      });
    }

    setCustomers(customersResult.data || []);
    setVisits(visitsResult.data || []);
    setLoading(false);
  }

  function openForm() {
    setForm({
      ...EMPTY_FORM,
      visit_date: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  function updateForm(key, value) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function handleCustomerSelect(customerId) {
    const customer = customers.find((item) => String(item.id) === String(customerId));

    setForm((previous) => ({
      ...previous,
      customer_id: customerId,
      visitor_name:
        customer && !previous.visitor_name.trim()
          ? customer.name || ""
          : previous.visitor_name,
    }));
  }

  async function save(event) {
    event.preventDefault();

    const visitorName = form.visitor_name.trim();

    if (!visitorName) {
      setNotice({
        open: true,
        type: "warning",
        title: "Visitor name required",
        message: "Please enter the visitor name before saving the site visit.",
      });
      return;
    }

    if (!form.visit_date) {
      setNotice({
        open: true,
        type: "warning",
        title: "Visit date required",
        message: "Please select a date for this site visit.",
      });
      return;
    }

    setSaving(true);

    const payload = {
      visitor_name: visitorName,
      customer_id: form.customer_id || null,
      visit_date: form.visit_date,
      visit_time: form.visit_time || null,
      status: form.status,
      assigned_to: form.assigned_to.trim() || null,
      notes: form.notes.trim() || null,
    };

    const { error } = await supabase.from("site_visits").insert([payload]);

    setSaving(false);

    if (error) {
      setNotice({
        open: true,
        type: "error",
        title: "Unable to save visit",
        message: error.message || "Something went wrong while saving the site visit.",
      });
      return;
    }

    closeForm();
    await load();

    setNotice({
      open: true,
      type: "success",
      title: "Site Visit Scheduled",
      message: `${visitorName}'s site visit has been saved successfully.`,
    });
  }

  function remove(id) {
    const visit = visits.find((item) => String(item.id) === String(id));

    const visitorName =
      visit?.visitor_name ||
      visit?.customers?.name ||
      "this site visit";

    setDeleteTarget({
      id,
      visitorName,
    });

    setNotice({
      open: true,
      type: "confirm-delete",
      title: "Delete Site Visit?",
      message: `Are you sure you want to delete ${visitorName}'s site visit? This action cannot be undone.`,
    });
  }

  async function confirmDeleteVisit() {
    if (!deleteTarget?.id) return;

    const { id, visitorName } = deleteTarget;

    setNotice((previous) => ({
      ...previous,
      open: false,
    }));

    const { error } = await supabase
      .from("site_visits")
      .delete()
      .eq("id", id);

    if (error) {
      setDeleteTarget(null);

      setNotice({
        open: true,
        type: "error",
        title: "Delete Failed",
        message:
          error.message ||
          "The site visit could not be deleted. Please try again.",
      });
      return;
    }

    setDeleteTarget(null);
    await load();

    setNotice({
      open: true,
      type: "success",
      title: "Site Visit Deleted",
      message: `${visitorName}'s site visit has been deleted successfully.`,
    });
  }

  const filteredVisits = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return visits;

    return visits.filter((visit) => {
      const customer = visit.customers || {};

      return [
        visit.visitor_name,
        customer.name,
        customer.mobile,
        customer.plot_no,
        visit.assigned_to,
        visit.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [visits, search]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return {
      total: visits.length,
      scheduled: visits.filter((v) => v.status === "Scheduled").length,
      completed: visits.filter((v) => v.status === "Completed").length,
      today: visits.filter((v) => v.visit_date === today).length,
    };
  }, [visits]);

  return (
    <div className="site-visits-page">
      <button
        type="button"
        className="site-visits-back-button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <section className="site-visits-hero">
        <div className="site-visits-hero-content">
          <div className="site-visits-kicker">R DREAM INFRA DEVELOPERS</div>
          <h1>Site Visits</h1>
          <p>
            Schedule, track and manage customer visits to your layout from one
            place.
          </p>
        </div>

        <div className="site-visits-hero-mark">
          <MapPin size={32} strokeWidth={1.8} />
        </div>
      </section>

      <section className="site-visits-stats">
        <div className="site-visit-stat">
          <div className="site-visit-stat-icon blue">
            <MapPin size={20} />
          </div>
          <div>
            <span>Total Visits</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="site-visit-stat">
          <div className="site-visit-stat-icon orange">
            <CalendarDays size={20} />
          </div>
          <div>
            <span>Scheduled</span>
            <strong>{stats.scheduled}</strong>
          </div>
        </div>

        <div className="site-visit-stat">
          <div className="site-visit-stat-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </div>
        </div>

        <div className="site-visit-stat">
          <div className="site-visit-stat-icon purple">
            <Clock3 size={20} />
          </div>
          <div>
            <span>Today</span>
            <strong>{stats.today}</strong>
          </div>
        </div>
      </section>

      <section className="site-visits-panel">
        <div className="site-visits-toolbar">
          <div className="site-visits-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search name, mobile, plot or assigned person..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                className="site-visits-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button type="button" className="site-visits-primary" onClick={openForm}>
            <Plus size={18} />
            Schedule Site Visit
          </button>
        </div>

        {loading ? (
          <div className="site-visits-empty">
            <div className="site-visits-empty-icon">
              <MapPin size={28} />
            </div>
            <h3>Loading site visits</h3>
            <p>Getting your visit records from Supabase.</p>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="site-visits-empty">
            <div className="site-visits-empty-icon">
              <MapPin size={28} />
            </div>
            <h3>{search ? "No matching visits" : "No site visits yet"}</h3>
            <p>
              {search
                ? "Try another name, mobile number or plot number."
                : "Schedule your first customer visit to get started."}
            </p>
            {!search && (
              <button
                type="button"
                className="site-visits-primary empty-action"
                onClick={openForm}
              >
                <Plus size={17} />
                Schedule First Visit
              </button>
            )}
          </div>
        ) : (
          <div className="site-visits-table-wrap">
            <table className="site-visits-table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Plot</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredVisits.map((visit) => {
                  const customer = visit.customers || {};
                  const displayName =
                    visit.visitor_name || customer.name || "Unknown visitor";

                  return (
                    <tr key={visit.id}>
                      <td>
                        <div className="site-visitor-cell">
                          <div className="site-visitor-avatar">
                            <UserRound size={18} />
                          </div>

                          <div>
                            <strong>{displayName}</strong>
                            <small>
                              {customer.mobile || "Manual visitor"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {customer.plot_no ? (
                          <span className="site-plot-chip">
                            Plot #{customer.plot_no}
                          </span>
                        ) : (
                          <span className="site-muted">Not linked</span>
                        )}
                      </td>

                      <td>
                        <div className="site-date-cell">
                          <CalendarDays size={15} />
                          {visit.visit_date || "—"}
                        </div>
                      </td>

                      <td>
                        <div className="site-time-cell">
                          <Clock3 size={15} />
                          {visit.visit_time || "—"}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`site-status-badge ${
                            visit.status === "Completed"
                              ? "completed"
                              : visit.status === "Cancelled"
                              ? "cancelled"
                              : visit.status === "Rescheduled"
                              ? "rescheduled"
                              : "scheduled"
                          }`}
                        >
                          {visit.status}
                        </span>
                      </td>

                      <td>{visit.assigned_to || "—"}</td>

                      <td>
                        <span className="site-notes-cell">
                          {visit.notes || "—"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="site-delete-button"
                          onClick={() => remove(visit.id)}
                          title="Delete visit"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>


      {notice.open && (
        <div
          className="site-notice-overlay"
          onMouseDown={() =>
            setNotice((previous) => ({ ...previous, open: false }))
          }
        >
          <div
            className={`site-notice-modal ${notice.type}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="site-notice-glow" />

            <div className="site-notice-icon">
              {notice.type === "success" && <CheckCircle2 size={28} />}
              {notice.type === "warning" && <Clock3 size={28} />}
              {notice.type === "error" && <X size={28} />}
              {notice.type === "confirm-delete" && <Trash2 size={28} />}
            </div>

            <div className="site-notice-content">
              <div className="site-notice-label">
                {notice.type === "success"
                  ? "R DREAM CRM"
                  : notice.type === "warning"
                  ? "ACTION REQUIRED"
                  : notice.type === "confirm-delete"
                  ? "CONFIRM ACTION"
                  : "SYSTEM ERROR"}
              </div>

              <h3>{notice.title}</h3>
              <p>{notice.message}</p>

              {notice.type === "confirm-delete" ? (
                <div className="site-notice-actions">
                  <button
                    type="button"
                    className="site-notice-cancel"
                    onClick={() => {
                      setDeleteTarget(null);
                      setNotice((previous) => ({
                        ...previous,
                        open: false,
                      }));
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="site-notice-delete"
                    onClick={confirmDeleteVisit}
                  >
                    <Trash2 size={16} />
                    Delete Visit
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="site-notice-ok"
                  onClick={() =>
                    setNotice((previous) => ({
                      ...previous,
                      open: false,
                    }))
                  }
                >
                  <CheckCircle2 size={17} />
                  Continue
                </button>
              )}
            </div>

            <button
              type="button"
              className="site-notice-close"
              onClick={() => {
                setDeleteTarget(null);
                setNotice((previous) => ({ ...previous, open: false }));
              }}
              aria-label="Close notification"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="site-visits-modal-overlay" onMouseDown={closeForm}>
          <div
            className="site-visits-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="site-visits-modal-header">
              <div>
                <div className="site-visits-modal-kicker">
                  NEW SITE VISIT
                </div>
                <h2>Schedule Site Visit</h2>
                <p>Add a visitor manually or link an existing customer.</p>
              </div>

              <button
                type="button"
                className="site-visits-close"
                onClick={closeForm}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form className="site-visits-form" onSubmit={save}>
              <div className="site-form-section-title">
                <UserPlus size={17} />
                Visitor Details
              </div>

              <div className="site-form-grid">
                <label className="site-form-field full">
                  <span>
                    Visitor Name <b>*</b>
                  </span>

                  <div className="site-input-with-icon">
                    <UserRound size={17} />
                    <input
                      type="text"
                      placeholder="Enter visitor name manually"
                      value={form.visitor_name}
                      onChange={(event) =>
                        updateForm("visitor_name", event.target.value)
                      }
                      autoFocus
                    />
                  </div>
                </label>

                <label className="site-form-field full">
                  <span>Existing Customer (Optional)</span>

                  <select
                    value={form.customer_id}
                    onChange={(event) =>
                      handleCustomerSelect(event.target.value)
                    }
                  >
                    <option value="">Select existing customer</option>

                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                        {customer.plot_no
                          ? ` — Plot ${customer.plot_no}`
                          : ""}
                        {customer.mobile ? ` — ${customer.mobile}` : ""}
                      </option>
                    ))}
                  </select>

                  <small>
                    Select an existing customer if this visitor is already in
                    your CRM. Otherwise, leave it unselected.
                  </small>
                </label>

                <label className="site-form-field">
                  <span>Date <b>*</b></span>
                  <div className="site-input-with-icon">
                    <CalendarDays size={17} />
                    <input
                      type="date"
                      value={form.visit_date}
                      onChange={(event) =>
                        updateForm("visit_date", event.target.value)
                      }
                    />
                  </div>
                </label>

                <label className="site-form-field">
                  <span>Time</span>
                  <div className="site-input-with-icon">
                    <Clock3 size={17} />
                    <input
                      type="time"
                      value={form.visit_time}
                      onChange={(event) =>
                        updateForm("visit_time", event.target.value)
                      }
                    />
                  </div>
                </label>

                <label className="site-form-field">
                  <span>Status</span>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm("status", event.target.value)
                    }
                  >
                    <option>Scheduled</option>
                    <option>Completed</option>
                    <option>Rescheduled</option>
                    <option>Cancelled</option>
                  </select>
                </label>

                <label className="site-form-field">
                  <span>Assigned Person</span>
                  <input
                    type="text"
                    placeholder="Enter staff / agent name"
                    value={form.assigned_to}
                    onChange={(event) =>
                      updateForm("assigned_to", event.target.value)
                    }
                  />
                </label>

                <label className="site-form-field full">
                  <span>Notes</span>
                  <textarea
                    placeholder="Add visit requirements, discussion points or remarks..."
                    value={form.notes}
                    onChange={(event) =>
                      updateForm("notes", event.target.value)
                    }
                  />
                </label>
              </div>

              <div className="site-visits-modal-footer">
                <button
                  type="button"
                  className="site-visits-secondary"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="site-visits-primary"
                  disabled={saving}
                >
                  <CheckCircle2 size={18} />
                  {saving ? "Saving..." : "Save Site Visit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SiteVisits;
