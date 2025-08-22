import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function LoveGreeting() {
  const [step, setStep] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [backupSettings, setBackupSettings] = useState(null);
  const [passInput, setPassInput] = useState("");

  const cornerTapRef = useRef(0);
  useEffect(() => {
    const onKey = (e) => { if ((e.ctrlKey||e.metaKey) && e.shiftKey && (e.key==='A'||e.key==='a')) setShowAdmin(true); };
    const onClick = (e) => {
      if (e.clientX < 32 && e.clientY < 32) { cornerTapRef.current++; if (cornerTapRef.current>=5){ cornerTapRef.current=0; setShowAdmin(true);} }
      else { cornerTapRef.current=0; }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('click', onClick); };
  }, []);

  const [settings, setSettings] = useState(() => {
    let base = {};
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        base = JSON.parse(window.localStorage.getItem('loveGreetingSettings') || '{}');
      }
    } catch {}
    return {
      password: "082307",
      adminPin: "8901",
      introText: "I have something special for you… ❤️",
      headline: "You are my everything 💕",
      paragraphs: [
        "From the moment I met you, my world changed in ways I never imagined.",
        "Every smile of yours is my favorite reason to live happily.",
        "I promise to always be by your side—today, tomorrow, forever.",
      ],
      extraParagraphs: [],

      introBg: "",
      passBg: "",
      revealBg: "",

      music: "",
      musicTitle: "Your song",
      autoplayMusic: true,
      musicVolume: 0.9,
      musicStartMuted: false,

      heartEnabled: true,
      heartColor: "#ff4d6d",
      heartSize: 28,
      heartDensity: 0.8,
      heartGlow: true,
      heartTwinkle: true,

      ...base,
    };
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('loveGreetingSettings', JSON.stringify(settings));
      }
    } catch {}
  }, [settings]);
  useEffect(() => { if (isAdmin) setBackupSettings(settings); }, [isAdmin]);

  const audioRef = useRef(null);
  const heartCanvasRef = useRef(null);

  const handleUnlock = () => {
    if ((passInput||"").trim() === String(settings.password)) { setUnlocked(true); setStep(2); }
    else alert("Wrong password!");
  };

  const pageBg = step===0? settings.introBg : step===1? settings.passBg : settings.revealBg;

  useEffect(() => {
    if (!(unlocked && step===2 && settings.music && settings.autoplayMusic && audioRef.current)) return;
    try {
      audioRef.current.muted = !!settings.musicStartMuted;
      audioRef.current.volume = Math.min(1, Math.max(0, settings.musicVolume ?? 0.9));
      void audioRef.current.play();
    } catch {}
  }, [unlocked, step, settings.music, settings.autoplayMusic, settings.musicVolume, settings.musicStartMuted]);

  const [uiPlaying, setUiPlaying] = useState(false);
  const [uiMuted, setUiMuted] = useState(false);
  useEffect(() => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    const sync = () => { setUiPlaying(!a.paused); setUiMuted(a.muted); };
    a.addEventListener('play', sync);
    a.addEventListener('pause', sync);
    a.addEventListener('volumechange', sync);
    sync();
    return () => { a.removeEventListener('play', sync); a.removeEventListener('pause', sync); a.removeEventListener('volumechange', sync); };
  }, [step, settings.music]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center" style={pageBg ? { backgroundImage: `url(${pageBg})`, backgroundSize:'cover'} : {}}>
      {unlocked && step===2 && settings.heartEnabled && (
        <canvas ref={heartCanvasRef} className="fixed inset-0 w-full h-full pointer-events-none" />
      )}

      {step === 0 && (
        <div className="text-center p-6 bg-white/70 rounded-2xl shadow-xl">
          {settings.introBg && <img src={settings.introBg} alt="intro" className="mx-auto mb-4 max-h-48 rounded" />}
          <h1 className="text-3xl font-bold">{settings.introText}</h1>
          <button className="mt-4 px-6 py-2 rounded-xl bg-pink-500 text-white" onClick={() => setStep(1)}>Continue</button>
        </div>
      )}

      {step === 1 && !unlocked && (
        <div className="text-center p-6 bg-white/70 rounded-2xl shadow-xl">
          {settings.passBg && <img src={settings.passBg} alt="pass" className="mx-auto mb-4 max-h-48 rounded" />}
          <h2 className="text-2xl mb-2">🔒 Enter Love Lock</h2>
          <input type="password" className="border p-2 rounded w-full" value={passInput} onChange={(e)=>setPassInput(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && handleUnlock()} />
          <div className="mt-3 flex gap-2 justify-center">
            <button className="px-6 py-2 rounded-xl bg-green-500 text-white" onClick={handleUnlock}>Confirm</button>
            <button className="px-6 py-2 rounded-xl border" onClick={() => { setPassInput(''); setStep(0); }}>Cancel</button>
          </div>
        </div>
      )}

      {step === 2 && unlocked && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative text-center p-6 bg-white/70 rounded-2xl shadow-xl max-w-2xl w-[92vw]">
          {settings.revealBg && <img src={settings.revealBg} alt="reveal" className="mx-auto mb-4 max-h-48 rounded" />}
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-pink-600">{settings.headline}</h1>
            <button className="text-sm underline" onClick={() => { setUnlocked(false); setStep(0); }}>← Back to main</button>
          </div>
          <div className="mt-4 space-y-3">
            {settings.paragraphs.map((p, i) => (<p key={i} className="text-lg leading-relaxed">{p}</p>))}
          </div>
          {settings.extraParagraphs?.length>0 && (
            <div className="mt-6 space-y-2">
              {settings.extraParagraphs.map((p,i)=>(<p key={i} className="text-md italic">{p}</p>))}
            </div>
          )}

          {settings.music && (<audio ref={audioRef} src={settings.music} preload="auto" playsInline hidden />)}

          {settings.music && (
            <div className="pointer-events-auto fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/60 backdrop-blur shadow border">
                <button className="text-sm" onClick={() => { const a=audioRef.current; if (!a) return; if (a.paused) a.play(); else a.pause(); }}>{uiPlaying? '⏸' : '▶️'}</button>
                <button className="text-sm" onClick={() => { const a=audioRef.current; if (!a) return; a.muted = !a.muted; }}>{uiMuted? '🔇' : '🔊'}</button>
                <div className="text-xs text-gray-800 truncate max-w-[40vw]">{settings.musicTitle||'Music'}</div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {showAdmin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            {!isAdmin ? (
              <div>
                <h2 className="text-xl mb-2">Enter Admin PIN</h2>
                <input type="password" className="border p-2 w-full mb-2" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} />
                <div className="flex gap-2">
                  <button className="bg-pink-500 text-white px-4 py-2 rounded" onClick={() => setIsAdmin(adminPinInput === settings.adminPin)}>Unlock</button>
                  <button className="px-4 py-2 border rounded" onClick={() => setShowAdmin(false)}>Close</button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <section>
                  <h3 className="font-semibold mb-2">Texts</h3>
                  <label className="block text-sm">Intro</label>
                  <input className="border p-2 w-full mb-2" value={settings.introText} onChange={(e)=>setSettings({...settings,introText:e.target.value})} />
                  <label className="block text-sm">Headline</label>
                  <input className="border p-2 w-full mb-2" value={settings.headline} onChange={(e)=>setSettings({...settings,headline:e.target.value})} />
                  <div className="mt-2">
                    <div className="flex items-center justify-between"><h4 className="font-medium">Main paragraphs</h4><div className="flex gap-2"><button className="px-2 py-1 border rounded" onClick={()=>setSettings(s=>({...s, paragraphs:[...s.paragraphs, 'New line…']}))}>+ Add</button><button className="px-2 py-1 border rounded" onClick={()=>setSettings(s=>({...s, paragraphs:s.paragraphs.slice(0,-1)}))}>– Remove last</button></div></div>
                    <div className="space-y-2 mt-2">{settings.paragraphs.map((p,i)=>(<textarea key={i} className="border p-2 w-full" value={p} onChange={(e)=>setSettings(s=>{ const arr=[...s.paragraphs]; arr[i]=e.target.value; return {...s, paragraphs: arr}; })} />))}</div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between"><h4 className="font-medium">Extra notes</h4><div className="flex gap-2"><button className="px-2 py-1 border rounded" onClick={()=>setSettings(s=>({...s, extraParagraphs:[...s.extraParagraphs, 'Another note…']}))}>+ Add</button><button className="px-2 py-1 border rounded" onClick={()=>setSettings(s=>({...s, extraParagraphs:s.extraParagraphs.slice(0,-1)}))}>– Remove last</button></div></div>
                    <div className="space-y-2 mt-2">{settings.extraParagraphs.map((p,i)=>(<textarea key={i} className="border p-2 w-full" value={p} onChange={(e)=>setSettings(s=>{ const arr=[...s.extraParagraphs]; arr[i]=e.target.value; return {...s, extraParagraphs: arr}; })} />))}</div>
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">Backgrounds & Music</h3>
                  <div className="space-y-2 text-sm">
                    <label className="block">Intro Background Image<input type="file" accept="image/*" onChange={async (e)=>{const f=e.target.files?.[0]; if(!f) return; const url=await new Promise(res=>{const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(f);}); setSettings({...settings,introBg:url});}} /></label>
                    <label className="block">Pass Background Image<input type="file" accept="image/*" onChange={async (e)=>{const f=e.target.files?.[0]; if(!f) return; const url=await new Promise(res=>{const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(f);}); setSettings({...settings,passBg:url});}} /></label>
                    <label className="block">Reveal Background Image<input type="file" accept="image/*" onChange={async (e)=>{const f=e.target.files?.[0]; if(!f) return; const url=await new Promise(res=>{const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(f);}); setSettings({...settings,revealBg:url});}} /></label>
                  </div>

                  <div className="mt-4">
                    <div className="font-medium">Music</div>
                    <label className="block text-sm mt-1">Track title</label>
                    <input className="border p-2 w-full mb-2" value={settings.musicTitle} onChange={(e)=>setSettings({...settings, musicTitle:e.target.value})} />
                    <label className="block text-sm">Audio file</label>
                    <input type="file" accept="audio/*" onChange={async (e)=>{ const f=e.target.files?.[0]; if(!f) return; const url = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); }); setSettings(s=>({...s, music:url })); }} />
                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={settings.autoplayMusic} onChange={(e)=>setSettings({...settings, autoplayMusic:e.target.checked})} /> Autoplay after unlock</label>
                      <label className="flex items-center gap-2">Volume <input type="range" min={0} max={1} step={0.01} value={settings.musicVolume} onChange={(e)=>setSettings({...settings, musicVolume:Number(e.target.value)})} /></label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={settings.musicStartMuted} onChange={(e)=>setSettings({...settings, musicStartMuted:e.target.checked})} /> Start muted</label>
                    </div>
                  </div>
                </section>

                <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                  <button className="px-4 py-2 border rounded" onClick={() => { if (backupSettings) setSettings(backupSettings); setIsAdmin(false); setShowAdmin(false); }}>Cancel</button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => { setIsAdmin(false); setShowAdmin(false); }}>Save & Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
