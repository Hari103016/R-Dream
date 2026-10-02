import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, BellRing, CalendarDays, CheckCircle2, Clock3, MessageCircle,
  Phone, Plus, Search, Trash2, UserRound, Users, X
} from "lucide-react";
import { supabase } from "../services/supabase";
import "./FollowUps.css";

const EMPTY_FORM = {
  follow_up_name: "",
  customer_id: "",
  follow_up_date: "",
  follow_up_time: "",
  type: "Call",
  status: "Pending",
  notes: "",
};

function FollowUps() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ open:false, type:"success", title:"", message:"" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [c, f] = await Promise.all([
      supabase.from("customers").select("id,name,mobile,plot_no").order("name"),
      supabase.from("follow_ups").select("*, customers(name,mobile,plot_no)")
        .order("follow_up_date", { ascending:true })
        .order("follow_up_time", { ascending:true }),
    ]);

    if (c.error) console.error("Customers:", c.error);
    if (f.error) {
      console.error("Follow-ups:", f.error);
      setNotice({ open:true, type:"error", title:"Unable to load follow-ups", message:f.error.message });
    }
    setCustomers(c.data || []);
    setItems(f.data || []);
    setLoading(false);
  }

  function openForm() {
    setForm({ ...EMPTY_FORM, follow_up_date:new Date().toISOString().slice(0,10) });
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  async function save(e) {
    e.preventDefault();
    if (!form.follow_up_name.trim()) {
      setNotice({
        open:true,
        type:"warning",
        title:"Follow-up Name Required",
        message:"Please enter the follow-up person's name before saving.",
      });
      return;
    }
    if (!form.follow_up_date) {
      setNotice({ open:true, type:"warning", title:"Date Required", message:"Please select a follow-up date." });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("follow_ups").insert([{
      follow_up_name: form.follow_up_name.trim(),
      customer_id: form.customer_id || null,
      follow_up_date: form.follow_up_date,
      follow_up_time: form.follow_up_time || null,
      type: form.type,
      status: form.status,
      notes: form.notes.trim() || null,
    }]);
    setSaving(false);

    if (error) {
      setNotice({ open:true, type:"error", title:"Unable to Save Follow-up", message:error.message });
      return;
    }

    closeForm();
    await load();
    setNotice({
      open:true,
      type:"success",
      title:"Follow-up Saved",
      message:`${form.follow_up_name.trim()}'s follow-up has been saved successfully.`,
    });
  }

  function remove(id) {
    const item = items.find(x => String(x.id) === String(id));
    const name = item?.follow_up_name || item?.customers?.name || "this follow-up";
    setDeleteTarget({ id, name });
    setNotice({
      open:true, type:"confirm-delete", title:"Delete Follow-up?",
      message:`Are you sure you want to delete ${name}'s follow-up? This action cannot be undone.`,
    });
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) return;
    const target = { ...deleteTarget };
    setNotice(x => ({ ...x, open:false }));

    const { error } = await supabase.from("follow_ups").delete().eq("id", target.id);
    if (error) {
      setDeleteTarget(null);
      setNotice({ open:true, type:"error", title:"Delete Failed", message:error.message });
      return;
    }

    setDeleteTarget(null);
    await load();
    setNotice({
      open:true, type:"success", title:"Follow-up Deleted",
      message:`${target.name}'s follow-up has been deleted successfully.`,
    });
  }

  async function complete(id) {
    const item = items.find(x => String(x.id) === String(id));
    const { error } = await supabase.from("follow_ups").update({ status:"Completed" }).eq("id", id);
    if (error) {
      setNotice({ open:true, type:"error", title:"Update Failed", message:error.message });
      return;
    }
    await load();
    setNotice({
      open:true, type:"success", title:"Follow-up Completed",
      message:`${item?.follow_up_name || item?.customers?.name || "The customer"}'s follow-up is now completed.`,
    });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(x => [
      x.follow_up_name, x.customers?.name, x.customers?.mobile, x.customers?.plot_no,
      x.type, x.status, x.notes
    ].filter(Boolean).some(v => String(v).toLowerCase().includes(q)));
  }, [items, search]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0,10);
    return {
      total:items.length,
      pending:items.filter(x=>x.status==="Pending").length,
      completed:items.filter(x=>x.status==="Completed").length,
      today:items.filter(x=>x.follow_up_date===today).length,
    };
  }, [items]);

  function typeIcon(type) {
    if (type === "WhatsApp") return <MessageCircle size={15}/>;
    if (type === "Meeting") return <Users size={15}/>;
    return <Phone size={15}/>;
  }

  return (
    <div className="followups-page">
      <button className="followups-back" type="button" onClick={() => navigate(-1)}>
        <ArrowLeft size={18}/> Back
      </button>

      <section className="followups-hero">
        <div>
          <div className="followups-kicker">R DREAM INFRA DEVELOPERS</div>
          <h1>Follow-ups</h1>
          <p>Schedule, track and manage every customer follow-up from one place.</p>
        </div>
        <div className="followups-hero-mark"><BellRing size={32}/></div>
      </section>

      <section className="followups-stats">
        {[
          ["blue", <BellRing size={20}/>, "Total Follow-ups", stats.total],
          ["orange", <Clock3 size={20}/>, "Pending", stats.pending],
          ["green", <CheckCircle2 size={20}/>, "Completed", stats.completed],
          ["purple", <CalendarDays size={20}/>, "Today", stats.today],
        ].map(([color,icon,label,value]) => (
          <div className="followup-stat" key={label}>
            <div className={`followup-stat-icon ${color}`}>{icon}</div>
            <div><span>{label}</span><strong>{value}</strong></div>
          </div>
        ))}
      </section>

      <section className="followups-panel">
        <div className="followups-toolbar">
          <div className="followups-search">
            <Search size={19}/>
            <input placeholder="Search customer, mobile, plot or status..." value={search}
              onChange={e=>setSearch(e.target.value)}/>
            {search && <button type="button" onClick={()=>setSearch("")}><X size={15}/></button>}
          </div>
          <button className="followups-primary" type="button" onClick={openForm}>
            <Plus size={18}/> Add Follow-up
          </button>
        </div>

        {loading ? (
          <div className="followups-empty"><BellRing size={34}/><h3>Loading follow-ups...</h3></div>
        ) : filtered.length === 0 ? (
          <div className="followups-empty">
            <div className="followups-empty-icon"><BellRing size={28}/></div>
            <h3>{search ? "No matching follow-ups" : "No follow-ups yet"}</h3>
            <p>{search ? "Try another customer, plot or status." : "Add your first customer follow-up to get started."}</p>
            {!search && <button className="followups-primary" type="button" onClick={openForm}><Plus size={17}/> Add Follow-up</button>}
          </div>
        ) : (
          <div className="followups-table-wrap">
            <table className="followups-table">
              <thead><tr>
                <th>Customer</th><th>Plot</th><th>Date</th><th>Time</th>
                <th>Type</th><th>Status</th><th>Notes</th><th>Action</th>
              </tr></thead>
              <tbody>
                {filtered.map(x => (
                  <tr key={x.id}>
                    <td><div className="followup-customer">
                      <div className="followup-avatar"><UserRound size={17}/></div>
                      <div><strong>{x.follow_up_name || x.customers?.name || "Unknown"}</strong><small>{x.customers?.mobile || "Manual follow-up"}</small></div>
                    </div></td>
                    <td><span className="followup-plot">#{x.customers?.plot_no || "—"}</span></td>
                    <td><span className="followup-date"><CalendarDays size={15}/>{x.follow_up_date || "—"}</span></td>
                    <td><span className="followup-time"><Clock3 size={15}/>{x.follow_up_time || "—"}</span></td>
                    <td><span className={`followup-type ${String(x.type).toLowerCase()}`}>{typeIcon(x.type)}{x.type}</span></td>
                    <td><span className={`followup-status ${String(x.status).toLowerCase()}`}>{x.status}</span></td>
                    <td><span className="followup-notes">{x.notes || "—"}</span></td>
                    <td><div className="followup-actions">
                      {x.status !== "Completed" && <button className="followup-complete" type="button" title="Complete" onClick={()=>complete(x.id)}><CheckCircle2 size={16}/></button>}
                      <button className="followup-delete" type="button" title="Delete" onClick={()=>remove(x.id)}><Trash2 size={16}/></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="followups-modal-overlay" onMouseDown={closeForm}>
          <div className="followups-modal" onMouseDown={e=>e.stopPropagation()}>
            <div className="followups-modal-header">
              <div><div className="followups-modal-kicker">NEW FOLLOW-UP</div><h2>Add Follow-up</h2>
              <p>Create the next customer action.</p></div>
              <button className="followups-close" type="button" onClick={closeForm}><X size={19}/></button>
            </div>
            <form className="followups-form" onSubmit={save}>
              <div className="followups-section-title"><UserRound size={17}/> Customer Details</div>
              <div className="followups-form-grid">
                <label className="followups-field full"><span>Follow-up Name <b>*</b></span>
                  <div className="followups-input-icon">
                    <UserRound size={16}/>
                    <input
                      type="text"
                      placeholder="Enter follow-up person's name manually"
                      value={form.follow_up_name}
                      onChange={e=>setForm({...form,follow_up_name:e.target.value})}
                      autoFocus
                    />
                  </div>
                </label>

                <label className="followups-field full"><span>Existing Customer (Optional)</span>
                  <select value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})}>
                    <option value="">Select existing customer</option>
                    {customers.map(c=><option key={c.id} value={c.id}>{c.name} — Plot {c.plot_no} — {c.mobile}</option>)}
                  </select>
                  <small className="followups-help">
                    Enter the name manually above. If this person already exists in your CRM, you can link the customer here.
                  </small>
                </label>
                <label className="followups-field"><span>Date <b>*</b></span>
                  <div className="followups-input-icon"><CalendarDays size={16}/><input type="date" value={form.follow_up_date} onChange={e=>setForm({...form,follow_up_date:e.target.value})}/></div>
                </label>
                <label className="followups-field"><span>Time</span>
                  <div className="followups-input-icon"><Clock3 size={16}/><input type="time" value={form.follow_up_time} onChange={e=>setForm({...form,follow_up_time:e.target.value})}/></div>
                </label>
                <label className="followups-field"><span>Type</span>
                  <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Call</option><option>WhatsApp</option><option>Meeting</option></select>
                </label>
                <label className="followups-field"><span>Status</span>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Pending</option><option>Completed</option><option>Missed</option></select>
                </label>
                <label className="followups-field full"><span>Notes</span>
                  <textarea placeholder="Add discussion points, requirements or next steps..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
                </label>
              </div>
              <div className="followups-modal-footer">
                <button className="followups-secondary" type="button" onClick={closeForm} disabled={saving}>Cancel</button>
                <button className="followups-primary" type="submit" disabled={saving}><CheckCircle2 size={18}/>{saving ? "Saving..." : "Save Follow-up"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notice.open && (
        <div className="follow-notice-overlay" onMouseDown={()=>{setDeleteTarget(null);setNotice(x=>({...x,open:false}))}}>
          <div className={`follow-notice-modal ${notice.type}`} onMouseDown={e=>e.stopPropagation()}>
            <div className="follow-notice-glow"/>
            <div className="follow-notice-icon">
              {notice.type==="success" && <CheckCircle2 size={28}/>}
              {notice.type==="warning" && <Clock3 size={28}/>}
              {notice.type==="error" && <X size={28}/>}
              {notice.type==="confirm-delete" && <Trash2 size={28}/>}
            </div>
            <div className="follow-notice-content">
              <div className="follow-notice-label">
                {notice.type==="success" ? "R DREAM CRM" : notice.type==="confirm-delete" ? "CONFIRM ACTION" : notice.type==="warning" ? "ACTION REQUIRED" : "SYSTEM ERROR"}
              </div>
              <h3>{notice.title}</h3><p>{notice.message}</p>
              {notice.type==="confirm-delete" ? (
                <div className="follow-notice-actions">
                  <button className="follow-notice-cancel" type="button" onClick={()=>{setDeleteTarget(null);setNotice(x=>({...x,open:false}))}}>Cancel</button>
                  <button className="follow-notice-delete" type="button" onClick={confirmDelete}><Trash2 size={16}/> Delete Follow-up</button>
                </div>
              ) : (
                <button className="follow-notice-ok" type="button" onClick={()=>setNotice(x=>({...x,open:false}))}><CheckCircle2 size={17}/> Continue</button>
              )}
            </div>
            <button className="follow-notice-close" type="button" onClick={()=>{setDeleteTarget(null);setNotice(x=>({...x,open:false}))}}><X size={17}/></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FollowUps;
