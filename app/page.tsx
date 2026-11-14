"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../lib/supabase";
import BusinessBuilder from "../components/BusinessBuilder";

const modules = [
  { name: "Universal Business Builder", icon: "🏢", detail: "Form any legal business, research filings, permits, licenses and launch requirements.", steps: ["Research jurisdiction and entity type", "Prepare documents and review requirements", "Request approval before any submission"] },
  { name: "Business Headquarters", icon: "📋", detail: "Manage multiple companies, projects, contracts, invoices and operations.", steps: ["Company profiles", "Project and task tracking", "Financial reporting"] },
  { name: "ACE Forex", icon: "📈", detail: "Demo trading supervision, strategy review and human-approved execution.", steps: ["$25 maximum risk per trade", "$50 daily loss limit; 2 trades per day", "One open position account-wide; approval for every trade"] },
  { name: "Opportunity Radar", icon: "📡", detail: "Discover and evaluate business opportunities, contracts and new markets.", steps: ["Industry research", "Opportunity scoring", "Bid and lead tracking"] },
  { name: "Financial Intelligence", icon: "💰", detail: "Track cash flow, revenue, expenses, forecasts and company budgets.", steps: ["Separate company ledgers", "Receivables and expenses", "Forecasts and alerts"] },
  { name: "Executive Assistant", icon: "🧠", detail: "Priorities, scheduling, documents, reminders and approval workflows.", steps: ["Morning briefing", "Draft and review", "Approval and audit history"] },
];
export default function Home() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) { router.replace("/login"); return; }
    let alive = true;
    supabase.auth.getSession().then(({data}) => { if (!alive) return; if (!data.session) router.replace("/login"); else setAuthenticated(true); });
    const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => { if (!alive) return; if (!session) { setAuthenticated(false); router.replace("/login"); } else setAuthenticated(true); });
    return () => { alive = false; subscription.unsubscribe(); };
  }, [router]);
  async function signOut() { const supabase = getSupabase(); await supabase?.auth.signOut(); router.replace("/login"); }
  const [active, setActive] = useState("Overview");
  const [command, setCommand] = useState("");
  const [preview, setPreview] = useState("");
  const selected = modules.find(m => m.name === active);
  if (!authenticated) return <main style={{padding:32}}>Checking secure session...</main>;
  return <div className="shell">
    <aside className="sidebar"><div className="brand">J.A.R.V.I.S.</div><div className="sub">EXECUTIVE COMMAND CENTER</div>
      <nav className="nav" aria-label="Main navigation">
        {["Overview", ...modules.map(m => m.name)].map(item => <button key={item} className={active===item?"active":""} onClick={()=>{setActive(item);setPreview("");}}>{item}</button>)}
      </nav>
      <button onClick={signOut} style={{marginTop:28,background:"transparent",border:"1px solid #36516b",color:"#d6e7f8",borderRadius:8,padding:12,width:"100%"}}>Sign out</button>
    </aside>
    <main className="main">
      <div className="eyebrow">System prototype · integrations not connected</div>
      <h1 className="headline">{selected ? selected.name : "Welcome to JARVIS"}</h1>
      <p className="muted">{selected ? selected.detail : "Your universal business, opportunity and forex command center. Choose a module to explore its planned workflow."}</p>
      {active === "Universal Business Builder" ? <BusinessBuilder /> : selected ? <section className="panel section"><span className="pill">Planned workflow</span><h3 style={{marginTop:18}}>Capabilities</h3><ul className="list">{selected.steps.map(s=><li key={s}>{s}</li>)}</ul><p>Coming next: authentication, persistent company data, official-source research and secure integrations.</p></section> :
      <div className="grid">{modules.map(m=><article className="panel" key={m.name}><span style={{fontSize:30}} aria-hidden>{m.icon}</span><h3 style={{marginTop:16}}>{m.name}</h3><p>{m.detail}</p><button className="pill" style={{border:0}} onClick={()=>setActive(m.name)}>Explore module</button></article>)}</div>}
      <section className="panel section"><h3>JARVIS Command Interface</h3><p>Command preview only. AI execution will be enabled after secure backend integration.</p>
        <form className="command" onSubmit={e=>{e.preventDefault();setPreview(command.trim()? "Command captured locally (not submitted): "+command : "Enter a command to preview.");}}><input aria-label="JARVIS command" value={command} onChange={e=>setCommand(e.target.value)} placeholder="JARVIS, help me start a new company..." /><button type="submit">Preview</button></form>
        {preview && <div className="notice" role="status">{preview}</div>}
      </section>
      <p className="notice">No filings, payments, emails or trades are executed by this prototype. ACE Forex remains separate and demo-only.</p>
    </main>
  </div>;
}
