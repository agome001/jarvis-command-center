"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

export default function Login() {
  const router = useRouter();
  const mode = "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) { setMessage("Supabase configuration is missing. Contact the administrator."); return; }
    setBusy(true); setMessage("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/login" } });
        if (error) throw error;
        if (data.session) router.replace("/");
        else setMessage("Account request received. Check your email for a confirmation link before signing in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/");
      }
    } catch (err) { setMessage(err instanceof Error ? err.message : "Authentication failed."); }
    finally { setBusy(false); }
  }
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:20}}>
    <div className="panel" style={{width:"100%",maxWidth:440}}>
      <div className="brand">J.A.R.V.I.S.</div>
      <p className="muted">Secure Command Center Access</p>
      <h1>{mode==="login"?"Sign in":"Create account"}</h1>
      <form onSubmit={submit} style={{display:"grid",gap:14}}>
        <label>Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} style={{display:"block",width:"100%",padding:12,marginTop:8,background:"#081321",color:"white",border:"1px solid #35516b",borderRadius:8}}/></label>
        <label>Password<input required minLength={6} type="password" autoComplete={mode==="login"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} style={{display:"block",width:"100%",padding:12,marginTop:8,background:"#081321",color:"white",border:"1px solid #35516b",borderRadius:8}}/></label>
        <button disabled={busy} style={{padding:14,background:"#55c3ff",color:"#061321",border:0,borderRadius:8,fontWeight:700}}>{busy?"Please wait...":mode==="login"?"Sign in":"Register"}</button>
      </form>
      {message && <p role="status" className="muted">{message}</p>}

    </div>
  </main>;
}
