"use client";
import { useState, useEffect, useRef } from "react";

export default function GeckoVoice(){
  const [listening,setListening]=useState(false);
  const [speaking,setSpeaking]=useState(false);
  const [transcript,setTranscript]=useState("");
  const [response,setResponse]=useState("Hey! I'm GECKO. Say 'Hey Gecko' or tap the orb to talk. Try: 'Write essay' or 'Make song'");
  const [tokens,setTokens]=useState(500);
  const recognitionRef=useRef(null);

  useEffect(()=>{
    if(typeof window!=="undefined"){
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if(!SpeechRecognition){ setResponse("Your browser no support voice. Use Chrome."); return; }
      const rec = new SpeechRecognition();
      rec.continuous=true;
      rec.interimResults=true;
      rec.lang="en-US";
      rec.onresult=(e)=>{
        let text="";
        for(let i=e.resultIndex;i<e.results.length;i++) text+=e.results[i][0].transcript;
        const lower=text.toLowerCase();
        setTranscript(text);
        if(lower.includes("hey gecko") || lower.includes("hey gecko")){
          if(!listening) startGecko();
        }
      };
      rec.onend=()=>{ if(listening) rec.start(); };
      recognitionRef.current=rec;
    }
  },[listening]);

  const speak = (text)=>{
    if(!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter=new SpeechSynthesisUtterance(text);
    utter.rate=1; utter.pitch=1.1;
    utter.onstart=()=>setSpeaking(true);
    utter.onend=()=>setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const startGecko=()=>{
    setListening(true);
    setTokens(t=>t-1);
    const msg="Yes boss, I'm listening... What you need? Essay, image, song, or video?";
    setResponse(msg);
    speak(msg);
    recognitionRef.current?.start();
  };

  const stopGecko=()=>{
    setListening(false);
    recognitionRef.current?.stop();
    if(transcript){
      handleCommand(transcript);
    }
  };

  const handleCommand=(cmd)=>{
    setTokens(t=>t-5);
    let reply="";
    const c=cmd.toLowerCase();
    if(c.includes("essay")) reply=`Got it. Writing essay about ${cmd.replace(/.*essay/i,"")}. Done! Essay ready, boss.`;
    else if(c.includes("image")) reply=`Creating image for: ${cmd}. Image generated! Check preview.`;
    else if(c.includes("song") || c.includes("music")) reply=`Making Afrobeats song about ${cmd}. Beat ready!`;
    else if(c.includes("video")) reply=`Editing video for ${cmd}. Done!`;
    else if(c.includes("summarize")) reply=`Summarizing your text... Summary: This is key point of ${cmd}`;
    else reply=`You said: ${cmd}. I'm GECKO Voice, extra perfect than Siri. I can essay, summarize, image edit, video edit, song, plagiarism, presentation. What next?`;
    
    setResponse(reply);
    speak(reply);
    setTranscript("");
  };

  return(
    <div style={{minHeight:"100vh", background:"radial-gradient(circle at center, #0f1f14 0%, #050505 70%)", color:"white", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"sans-serif"}}>
      <div style={{position:"absolute", top:16, width:"100%", maxWidth:400, display:"flex", justifyContent:"space-between", padding:"0 20px"}}>
        <b style={{color:"#2bff88"}}>🦎 GECKO VOICE</b>
        <span style={{background:"#111", border:"1px solid #222", padding:"4px 10px", borderRadius:20, fontSize:12}}>🪙 {tokens}</span>
      </div>

      {/* ORB LIKE SIRI */}
      <div onClick={listening?stopGecko:startGecko} style={{width:180, height:180, borderRadius:"50%", background: listening?"radial-gradient(circle, #2bff88, #0a4a24)":"radial-gradient(circle, #222, #000)", border:`2px solid ${speaking?"#2bff88":"#333"}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow: listening?"0 0 60px #2bff88":"0 0 20px #111", transition:"all 0.3s", animation: speaking?"pulse 0.8s infinite":listening?"pulse 1.5s infinite":"none"}}>
        <span style={{fontSize:50}}>{speaking?"🗣️":listening?"👂":"🎙️"}</span>
      </div>
      <style>{`@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}`}</style>

      <div style={{marginTop:20, fontSize:13, opacity:0.6}}>{listening?"Listening... tap to stop":speaking?"Speaking...":"Tap orb or say 'Hey Gecko'"}</div>

      <div style={{marginTop:24, background:"rgba(255,255,255,0.06)", border:"1px solid #222", borderRadius:16, padding:16, width:"100%", maxWidth:400, minHeight:120}}>
        <div style={{fontSize:11, opacity:0.5, marginBottom:6}}>You said:</div>
        <div style={{fontSize:14, minHeight:20}}>{transcript || "..."}</div>
        <div style={{height:1, background:"#222", margin:"12px 0"}}/>
        <div style={{fontSize:11, opacity:0.5, marginBottom:6}}>GECKO:</div>
        <div style={{fontSize:14, lineHeight:1.5}}>{response}</div>
      </div>

      <div style={{marginTop:16, display:"flex", gap:8, flexWrap:"wrap", maxWidth:400, justifyContent:"center"}}>
        {["Hey Gecko write essay","Hey Gecko make image","Hey Gecko make song","Hey Gecko summarize"].map(c=><button key={c} onClick={()=>{setTranscript(c); handleCommand(c);}} style={{background:"#111", border:"1px solid #333", color:"#aaa", padding:"6px 10px", borderRadius:20, fontSize:11}}>{c}</button>)}
      </div>

      <div style={{marginTop:20, fontSize:11, opacity:0.4, textAlign:"center"}}>Works only on Chrome / HTTPS. Allow microphone. <br/>Next: We add real Flux image + MusicGen + Essay brain.</div>
    </div>
  );
}
