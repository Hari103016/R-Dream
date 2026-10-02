import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, Download, FileCheck2, FileText, FileUp,
  FolderOpen, Plus, Search, ShieldCheck, Trash2, Upload, UserRound, X
} from "lucide-react";
import { supabase } from "../services/supabase";
import "./Documents.css";

const TYPES = ["ID Proof","PAN Card","Booking Form","Sale Agreement","Payment Receipt","Registration Document","Other"];

function Documents() {
  const navigate = useNavigate();
  const [docs,setDocs]=useState([]);
  const [customers,setCustomers]=useState([]);
  const [search,setSearch]=useState("");
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({customer_name:"",customer_id:"",document_type:"ID Proof"});
  const [file,setFile]=useState(null);
  const [loading,setLoading]=useState(true);
  const [uploading,setUploading]=useState(false);
  const [notice,setNotice]=useState({open:false,type:"success",title:"",message:""});
  const [deleteTarget,setDeleteTarget]=useState(null);

  useEffect(()=>{load();},[]);

  async function load(){
    setLoading(true);
    const [c,d]=await Promise.all([
      supabase.from("customers").select("id,name,mobile,plot_no").order("name"),
      supabase.from("documents").select("*, customers(name,mobile,plot_no)").order("created_at",{ascending:false}),
    ]);
    if(c.error) console.error("Customers:",c.error);
    if(d.error) {
      console.error("Documents:",d.error);
      setNotice({open:true,type:"error",title:"Unable to load documents",message:d.error.message});
    }
    setCustomers(c.data||[]);
    setDocs(d.data||[]);
    setLoading(false);
  }

  function openForm(){setForm({customer_name:"",customer_id:"",document_type:"ID Proof"});setFile(null);setShowForm(true);}
  function closeForm(){if(uploading)return;setShowForm(false);setFile(null);}

  async function uploadDocument(e){
    e.preventDefault();
    if(!form.customer_name.trim()){
      setNotice({open:true,type:"warning",title:"Customer Name Required",message:"Please enter the customer name before uploading the document."});return;
    }
    if(!file){
      setNotice({open:true,type:"warning",title:"File Required",message:"Please choose a document file before uploading."});return;
    }

    setUploading(true);
    try{
      const customer=customers.find(c=>String(c.id)===String(form.customer_id));
      const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
      const customerFolder=(customer?.id || form.customer_name.trim().replace(/[^a-zA-Z0-9_-]/g,"_")).slice(0,80);
      const path=`${customerFolder}/${Date.now()}_${safe}`;

      const {error:up}=await supabase.storage.from("customer-documents").upload(path,file,{
        upsert:false,contentType:file.type||"application/octet-stream"
      });
      if(up) throw up;

      const {error:db}=await supabase.from("documents").insert([{
        customer_name:form.customer_name.trim(),
        customer_id:customer?.id || null,
        document_type:form.document_type,
        file_name:file.name,
        storage_path:path,file_size:file.size,mime_type:file.type||null
      }]);
      if(db){
        await supabase.storage.from("customer-documents").remove([path]);
        throw db;
      }

      const name=file.name;
      closeForm();
      await load();
      setNotice({open:true,type:"success",title:"Document Uploaded",message:`${name} has been uploaded successfully.`});
    }catch(error){
      setNotice({open:true,type:"error",title:"Upload Failed",message:error.message||"The document could not be uploaded."});
    }finally{setUploading(false);}
  }

  async function downloadDocument(doc){
    const {data,error}=await supabase.storage.from("customer-documents").createSignedUrl(doc.storage_path,300);
    if(error){
      setNotice({open:true,type:"error",title:"Download Failed",message:error.message});return;
    }
    window.open(data.signedUrl,"_blank","noopener,noreferrer");
  }

  function removeDocument(doc){
    setDeleteTarget({id:doc.id,path:doc.storage_path,name:doc.file_name});
    setNotice({open:true,type:"confirm-delete",title:"Delete Document?",message:`Are you sure you want to delete ${doc.file_name}? This action cannot be undone.`});
  }

  async function confirmDelete(){
    if(!deleteTarget?.id)return;
    const target={...deleteTarget};
    setNotice(x=>({...x,open:false}));

    const {error:storageError}=await supabase.storage.from("customer-documents").remove([target.path]);
    if(storageError){
      setDeleteTarget(null);
      setNotice({open:true,type:"error",title:"Delete Failed",message:storageError.message});return;
    }
    const {error}=await supabase.from("documents").delete().eq("id",target.id);
    if(error){
      setDeleteTarget(null);
      setNotice({open:true,type:"error",title:"Delete Failed",message:error.message});return;
    }

    setDeleteTarget(null);
    await load();
    setNotice({open:true,type:"success",title:"Document Deleted",message:`${target.name} has been deleted successfully.`});
  }

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    if(!q)return docs;
    return docs.filter(d=>[
      d.customer_name,d.customers?.name,d.customers?.mobile,d.customers?.plot_no,d.file_name,d.document_type
    ].filter(Boolean).some(v=>String(v).toLowerCase().includes(q)));
  },[docs,search]);

  const stats=useMemo(()=>{
    const today=new Date().toISOString().slice(0,10);
    return {
      total:docs.length,
      today:docs.filter(d=>d.created_at?.slice(0,10)===today).length,
      registration:docs.filter(d=>d.document_type==="Registration Document").length,
      customers:new Set(docs.map(d=>d.customer_name||d.customers?.name).filter(Boolean)).size,
    };
  },[docs]);

  function size(bytes){
    if(!bytes)return "—";
    if(bytes<1024)return `${bytes} B`;
    if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/(1024*1024)).toFixed(1)} MB`;
  }

  return (
    <div className="documents-page">
      <button className="documents-back" type="button" onClick={()=>navigate(-1)}><ArrowLeft size={18}/> Back</button>

      <section className="documents-hero">
        <div><div className="documents-kicker">R DREAM INFRA DEVELOPERS</div><h1>Documents</h1>
          <p>Upload, organize and manage customer documents from one place.</p></div>
        <div className="documents-hero-mark"><FolderOpen size={32}/></div>
      </section>

      <section className="documents-stats">
        {[
          ["blue",<FileText size={20}/>,"Total Documents",stats.total],
          ["orange",<FileUp size={20}/>,"Uploaded Today",stats.today],
          ["green",<ShieldCheck size={20}/>,"Registration Docs",stats.registration],
          ["purple",<UserRound size={20}/>,"Customers",stats.customers],
        ].map(([color,icon,label,value])=><div className="document-stat" key={label}>
          <div className={`document-stat-icon ${color}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong></div>
        </div>)}
      </section>

      <section className="documents-panel">
        <div className="documents-toolbar">
          <div className="documents-search"><Search size={19}/>
            <input placeholder="Search customer, plot, document or type..." value={search} onChange={e=>setSearch(e.target.value)}/>
            {search&&<button type="button" onClick={()=>setSearch("")}><X size={15}/></button>}
          </div>
          <button className="documents-primary" type="button" onClick={openForm}><Plus size={18}/> Upload Document</button>
        </div>

        {loading ? <div className="documents-empty"><FileText size={34}/><h3>Loading documents...</h3></div> :
        filtered.length===0 ? <div className="documents-empty">
          <div className="documents-empty-icon"><FolderOpen size={28}/></div>
          <h3>{search?"No matching documents":"No documents yet"}</h3>
          <p>{search?"Try another customer, plot or document type.":"Upload your first customer document to get started."}</p>
          {!search&&<button className="documents-primary" type="button" onClick={openForm}><Plus size={17}/> Upload Document</button>}
        </div> :
        <div className="documents-table-wrap"><table className="documents-table">
          <thead><tr><th>Customer</th><th>Plot</th><th>Document</th><th>Type</th><th>Size</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>{filtered.map(d=><tr key={d.id}>
            <td><div className="document-customer"><div className="document-avatar"><UserRound size={17}/></div><div><strong>{d.customer_name||d.customers?.name||"Unknown"}</strong><small>{d.customers?.mobile||"Manual entry"}</small></div></div></td>
            <td><span className="document-plot">#{d.customers?.plot_no||"—"}</span></td>
            <td><div className="document-file"><FileCheck2 size={18}/><span>{d.file_name}</span></div></td>
            <td><span className="document-type">{d.document_type}</span></td>
            <td>{size(d.file_size)}</td>
            <td>{d.created_at?new Date(d.created_at).toLocaleDateString("en-IN"):"—"}</td>
            <td><div className="document-actions">
              <button className="document-download" type="button" title="Download" onClick={()=>downloadDocument(d)}><Download size={16}/></button>
              <button className="document-delete" type="button" title="Delete" onClick={()=>removeDocument(d)}><Trash2 size={16}/></button>
            </div></td>
          </tr>)}</tbody>
        </table></div>}
      </section>

      {showForm&&<div className="documents-modal-overlay" onMouseDown={closeForm}>
        <div className="documents-modal" onMouseDown={e=>e.stopPropagation()}>
          <div className="documents-modal-header"><div><div className="documents-modal-kicker">NEW DOCUMENT</div><h2>Upload Document</h2><p>Enter the customer name manually or link an existing CRM customer.</p></div>
            <button className="documents-close" type="button" onClick={closeForm}><X size={19}/></button>
          </div>
          <form className="documents-form" onSubmit={uploadDocument}>
            <div className="documents-section-title"><ShieldCheck size={17}/> Document Details</div>
            <div className="documents-form-grid">
              <label className="documents-field full"><span>Customer Name <b>*</b></span>
                <div className="documents-input-icon">
                  <UserRound size={16}/>
                  <input
                    type="text"
                    placeholder="Enter customer name manually"
                    value={form.customer_name}
                    onChange={e=>setForm({...form,customer_name:e.target.value})}
                    autoFocus
                  />
                </div>
              </label>
              <label className="documents-field full"><span>Existing Customer (Optional)</span>
                <select value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})}>
                  <option value="">Select existing customer</option>
                  {customers.map(c=><option key={c.id} value={c.id}>{c.name} — Plot {c.plot_no} — {c.mobile}</option>)}
                </select>
                <small className="documents-help">Enter the name manually. If the person already exists in your CRM, you can link the existing customer here.</small>
              </label>
              <label className="documents-field"><span>Document Type</span>
                <select value={form.document_type} onChange={e=>setForm({...form,document_type:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</select>
              </label>
              <label className="documents-field"><span>Choose File <b>*</b></span>
                <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)}/>
              </label>
              {file&&<div className="documents-selected-file full"><FileCheck2 size={18}/><div><strong>{file.name}</strong><span>{size(file.size)}</span></div></div>}
            </div>
            <div className="documents-modal-footer">
              <button className="documents-secondary" type="button" onClick={closeForm} disabled={uploading}>Cancel</button>
              <button className="documents-primary" type="submit" disabled={uploading}><Upload size={18}/>{uploading?"Uploading...":"Upload Document"}</button>
            </div>
          </form>
        </div>
      </div>}

      {notice.open&&<div className="document-notice-overlay" onMouseDown={()=>{setDeleteTarget(null);setNotice(x=>({...x,open:false}))}}>
        <div className={`document-notice-modal ${notice.type}`} onMouseDown={e=>e.stopPropagation()}>
          <div className="document-notice-glow"/>
          <div className="document-notice-icon">
            {notice.type==="success"&&<CheckCircle2 size={28}/>}
            {notice.type==="warning"&&<ShieldCheck size={28}/>}
            {notice.type==="error"&&<X size={28}/>}
            {notice.type==="confirm-delete"&&<Trash2 size={28}/>}
          </div>
          <div className="document-notice-content">
            <div className="document-notice-label">{notice.type==="success"?"R DREAM CRM":notice.type==="confirm-delete"?"CONFIRM ACTION":notice.type==="warning"?"ACTION REQUIRED":"SYSTEM ERROR"}</div>
            <h3>{notice.title}</h3><p>{notice.message}</p>
            {notice.type==="confirm-delete"?
              <div className="document-notice-actions">
                <button className="document-notice-cancel" type="button" onClick={()=>{setDeleteTarget(null);setNotice(x=>({...x,open:false}))}}>Cancel</button>
                <button className="document-notice-delete" type="button" onClick={confirmDelete}><Trash2 size={16}/> Delete Document</button>
              </div>:
              <button className="document-notice-ok" type="button" onClick={()=>setNotice(x=>({...x,open:false}))}><CheckCircle2 size={17}/> Continue</button>}
          </div>
          <button className="document-notice-close" type="button" onClick={()=>{setDeleteTarget(null);setNotice(x=>({...x,open:false}))}}><X size={17}/></button>
        </div>
      </div>}
    </div>
  );
}

export default Documents;
