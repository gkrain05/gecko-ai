"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GeckoFinal(){
  const [user,setUser]=useState(null);
  const [email,setEmail]=useState(""); const [pass,setPass]=useState("");
  const [mode,setMode]=useState("login");
  const [listening,setListening]=useState(false);
  const [speaking,setSpeaking]=useState(false);
  const [transcript,setTranscript]=useState("");
  const [response,setResponse]=useState("I am GECKO - Live, I remember you forever.");
  const [memories,setMemories]=useState([]);
  const [tokens,setTokens]=useState(500);
  const recRef=useRef(null);

  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>{ if(data.user) load(data.user); });
  },[]);

  const load=async(u)=>{
    setUser(u);
    const {data:p}=await supabase.from("profiles").select("*").eq("id",u.id).single();
    if(!p){ await supabase.from("profiles").insert({id:u.id,email:u.email,tokens:500}); setTokens(500); }
    else setTokens(p.tokens);
    const {data:m}=await supabase.from("memories").select("*").eq("user_id",u.id).order("created_at",{ascending:true}).limit(20);
    if(m) setMemories(m);
  };

  const doRegister=async()=>{
    const {error}=await supabase.auth.signUp({email,password:pass});
    if(error) alert(error.message); else alert("Account created! Now click Login");
  };
  const doLogin=async()=>{
    const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
    if(error) alert(error.message); else load(data.user);
  };
  const doLogout=async()=>{ await supabase.auth.signOut(); setUser(null); };

  // VOICE ENGINE
  useEffect(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return;
    const rec=new SR(); rec.continuous=true; rec.interimResults=true; rec.lang="en-US";
    rec.onresult=(e)=>{ let t=""; for(let i=e.resultIndex;i<e.results.length;i++) t+=e.results[i][0].transcript; setTranscript(t); };
    rec.onend=()=>{ if(listening) rec.start(); };
    recRef.current=rec;
  },[listening]);

  const speak=(txt)=>{
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(txt);
    u.onstart=()=>setSpeaking(true); u.onend=()=>setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const startVoice=()=>{
    setListening(true); recRef.current?.start();
    const hello=`Yes ${email.split("@")[0] || "boss"}, I'm listening. I remember you.`;
    setResponse(hello); speak(hello);
  };

  const stopVoice=async()=>{
    setListening(false); recRef.current?.stop();
    if(!transcript) return;
    const userMsg=transcript;
    setMemories(prev=>[...prev,{role:"user",content:userMsg}]);
    await supabase.from("memories").insert({user_id:user.id,role:"user",content:userMsg});

    // GECKO BRAIN
    let reply=`You said: ${userMsg}. I don save am for your permanent memory. I fit do essay, image, song, video.`;
    if(userMsg.toLowerCase().includes("essay")) reply=`Essay for you: ${userMsg} - Gecko don write am. Full essay ready and saved.`;
    if(userMsg.toLowerCase().includes("remember")) reply=`I remember you be ${user.email}, you get ${tokens} tokens, and you don talk ${memories.length} times before.`;

    setResponse(reply); speak(reply);
    setMemories(prev=>[...prev,{role:"gecko",content:reply}]);
    await supabase.from("memories").insert({user_id:user.id,role:"gecko",content:reply});
    const newT=tokens-5; setTokens(newT);
    await supabase.from("profiles").update({tokens:newT}).eq("id",user.id);
    setTranscript("");
  };

  if(!user){
    return(
      <div style={{minHeight:"100vh",background:"#050505",color:"white",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"sans-serif"}}>
        <div style={{background:"#111",border:"1px solid #222",borderRadius:20,padding:24,width:"100%",maxWidth:360}}>
          <h2 style={{color:"#2bff88",margin:0}}>🦎 GECKO</h2>
          <p style={{fontSize:12,opacity:0.6}}>Login - Best AI wey dey remember you</p>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{width:"100%",padding:12,marginTop:12,background:"#000",border:"1px solid #333",color:"white",borderRadius:10}}/>
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Password (min 6)" style={{width:"100%",padding:12,marginTop:8,background:"#000",border:"1px solid #333",color:"white",borderRadius:10}}/>
          {mode==="login" ? <>
            <button onClick={doLogin} style={{width:"100%",marginTop:12,background:"#2bff88",color:"black",padding:12,borderRadius:10,fontWeight:800,border:"none"}}>Login</button>
            <button onClick={()=>setMode("register")} style={{width:"100%",marginTop:8,background:"transparent",color:"#aaa",padding:8,border:"none",fontSize:12}}>No account? Create one</button>
          </> : <>
            <button onClick={doRegister} style={{width:"100%",marginTop:12,background:"#2bff88",color:"black",padding:12,borderRadius:10,fontWeight:800,border:"none"}}>Create Account (Free 500 🪙)</button>
            <button onClick={()=>setMode("login")} style={{width:"100%",marginTop:8,background:"transparent",color:"#aaa",padding:8,border:"none",fontSize:12}}>Already have? Login</button>
          </>}
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:"radial-gradient(circle at top,#102a18,#000)",color:"white",padding:16,fontFamily:"sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",maxWidth:600,margin:"0 auto"}}>
        <b style={{color:"#2bff88"}}>🦎 LIVE GECKO</b>
        <div style={{display:"flex",gap:8}}><span style={{background:"#111",border:"1px solid #333",padding:"4px 10px",borderRadius:20,fontSize:12}}>🪙 {tokens}</span><button onClick={doLogout} style={{background:"#222",border:"1px solid #333",color:"white",padding:"4px 10px",borderRadius:20,fontSize:11}}>Logout</button></div>
      </div>

      <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginTop:30}}>
        <div onClick={listening?stopVoice:startVoice} style={{width:160,height:160,borderRadius:"50%",background:listening?"radial-gradient(circle,#2bff88,#044)":"radial-gradient(circle,#222,#000)",border:`3px solid ${speaking?"#2bff88":"#333"}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:listening?"0 0 50px #2bff88":"0 0 20px #111",animation:speaking?"pulse 0.7s infinite":listening?"pulse 1.2s infinite":"none"}}><span style={{fontSize:50}}>{speaking?"🗣️":listening?"👂":"🦎"}</span></div>
        <div style={{marginTop:12,fontSize:12,opacity:0.6}}>{listening?"Listening... tap to stop":speaking?"Gecko dey talk...":"Tap orb or talk - e dey remember you"}</div>

        <div style={{marginTop:16,background:"rgba(255,255,255,0.06)",border:"1px solid #222",borderRadius:16,padding:16,width:"100%",maxWidth:600}}>
          <div style={{fontSize:11,opacity:0.5}}>YOU: {transcript || "..."}</div>
          <div style={{height:1,background:"#222",margin:"10px 0"}}/>
          <div style={{fontSize:14,lineHeight:1.5}}>GECKO: {response}</div>
        </div>

        <div style={{marginTop:16,width:"100%",maxWidth:600,maxHeight:220,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
          {memories.map((m,i)=><div key={i} style={{background:m.role==="user"?"#111":"#0f2414",border:"1px solid #222",padding:"8px 10px",borderRadius:10,fontSize:12}}><span style={{fontSize:10,opacity:0.5}}>{m.role.toUpperCase()}:</span> {m.content}</div>)}
        </div>
      </div>
      <style>{`@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}`}</style>
    </div>
  );
}
