"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "../lib/supabase";

type Company = { id:string; name:string; industry:string|null; entity_type:string|null; jurisdiction:string|null; status:string };
type Requirement = {id:string; company_id:string; title:string; requirement_type:string; status:string};
export default function BusinessBuilder(){
 const [companies,setCompanies]=useState<Company[]>([]);
 const [requirements,setRequirements]=useState<Requirement[]>([]);
 const [name,setName]=useState(""); const [industry,setIndustry]=useState("");
 const [entityType,setEntityType]=useState("LLC"); const [jurisdiction,setJurisdiction]=useState("Florida, USA");
 const [selected,setSelected]=useState(""); const [reqTitle,setReqTitle]=useState("");
 const [reqType,setReqType]=useState("registration");
 const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
 async function load(){
  const db=getSupabase(); if(!db)return;
  const {data,error}=await db.from("companies").select("id,name,industry,entity_type,jurisdiction,status").order("created_at",{ascending:false});
  if(error){setMessage(error.message);return;}setCompanies(data||[]);
  const {data:items,error:re}=await db.from("business_requirements").select("id,company_id,title,requirement_type,status").order("created_at",{ascending:false});
  if(re)setMessage(re.message);else setRequirements(items||[]);
 }
 useEffect(()=>{void load()},[]);
 async function createCompany(e:React.FormEvent){
  e.preventDefault();const db=getSupabase();if(!db)return;setBusy(true);setMessage("");
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError||!user){setMessage("Please sign in again.");setBusy(false);return;}
  const {error}=await db.from("companies").insert({owner_id:user.id,name:name.trim(),industry:industry.trim()||null,entity_type:entityType,jurisdiction:jurisdiction.trim(),status:"planning"});
  if(error)setMessage(error.message);else{setName("");setIndustry("");setMessage("Company profile saved. No government filing was submitted.");await load();}
  setBusy(false);
 }
 async function addRequirement(e:React.FormEvent){
  e.preventDefault();if(!selected)return;const db=getSupabase();if(!db)return;setBusy(true);setMessage("");
  const {error}=await db.from("business_requirements").insert({company_id:selected,title:reqTitle.trim(),requirement_type:reqType,status:"not_started"});
  if(error)setMessage(error.message);else{setReqTitle("");setMessage("Requirement added.");await load();}setBusy(false);
 }
 async function toggleRequirement(item:Requirement){
  const db=getSupabase();if(!db)return;const next=item.status==="completed"?"not_started":"completed";
  const {error}=await db.from("business_requirements").update({status:next}).eq("id",item.id);
  if(error)setMessage(error.message);else await load();
 }
 const fieldStyle={width:"100%",background:"#091827",border:"1px solid #34516c",color:"white",padding:12,borderRadius:8,marginTop:6};
 return <div style={{display:"grid",gap:20,marginTop:24}}>
  <section className="panel"><h3>Create a company profile</h3><p>Save any lawful business idea. This does not register a legal entity.</p>
   <form onSubmit={createCompany} style={{display:"grid",gap:12,gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
    <label>Company name<input required maxLength={160} value={name} onChange={e=>setName(e.target.value)} style={fieldStyle} placeholder="Company name"/></label>
    <label>Industry<input value={industry} onChange={e=>setIndustry(e.target.value)} style={fieldStyle} placeholder="Construction, transportation..."/></label>
    <label>Entity type<select value={entityType} onChange={e=>setEntityType(e.target.value)} style={fieldStyle}><option>LLC</option><option>Corporation</option><option>Sole proprietorship</option><option>Partnership</option><option>Other / undecided</option></select></label>
    <label>Jurisdiction<input required value={jurisdiction} onChange={e=>setJurisdiction(e.target.value)} style={fieldStyle}/></label>
    <button disabled={busy||!name.trim()} type="submit" style={{background:"#53bfff",border:0,borderRadius:9,padding:12,fontWeight:700,color:"#041321"}}>Save company</button>
   </form>
  </section>
  <section className="panel"><h3>Saved companies ({companies.length})</h3>
   {companies.length===0?<p>No company profiles saved yet.</p>:<div style={{display:"grid",gap:10}}>{companies.map(c=><div key={c.id} style={{border:"1px solid #34516c",borderRadius:10,padding:12}}><strong>{c.name}</strong><p style={{margin:"6px 0"}}>{[c.industry,c.entity_type,c.jurisdiction].filter(Boolean).join(" · ")} · {c.status}</p><button className="pill" onClick={()=>setSelected(c.id)}>{selected===c.id?"Selected":"Manage requirements"}</button></div>)}</div>}
  </section>
  {selected&&companies.some(c=>c.id===selected)&&<section className="panel"><h3>Formation & compliance tracker</h3><p>Requirements are entered manually and must be checked against official authorities before filing.</p>
   <form onSubmit={addRequirement} style={{display:"flex",gap:10,flexWrap:"wrap"}}>
    <input required placeholder="e.g. State formation filing" value={reqTitle} onChange={e=>setReqTitle(e.target.value)} style={{...fieldStyle,flex:"2 1 230px",width:"auto"}}/>
    <select value={reqType} onChange={e=>setReqType(e.target.value)} style={{...fieldStyle,flex:"1 1 150px",width:"auto"}}><option value="registration">Registration</option><option value="license">License</option><option value="permit">Permit</option><option value="insurance">Insurance</option><option value="tax">Tax</option><option value="other">Other</option></select>
    <button disabled={busy||!reqTitle.trim()} style={{background:"#53bfff",border:0,borderRadius:9,padding:"10px 18px"}}>Add requirement</button>
   </form>
   <div style={{display:"grid",gap:10,marginTop:16}}>{requirements.filter(r=>r.company_id===selected).map(r=><label key={r.id} style={{display:"flex",gap:10,alignItems:"center"}}><input type="checkbox" checked={r.status==="completed"} onChange={()=>void toggleRequirement(r)}/>{r.title} ({r.requirement_type})</label>)}</div>
  </section>}
  {message&&<div role="status" className="notice">{message}</div>}
 </div>;
}
