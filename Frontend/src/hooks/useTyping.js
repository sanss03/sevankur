import { useState, useEffect } from "react";

export function useTyping(text, { delay=0, speed=50, active=true }={}) {
  const [out, setOut] = useState("");
  useEffect(()=>{
    if(!active){ setOut(""); return; }
    let i=0, t1, t2;
    t1 = setTimeout(()=>{
      const tick=()=>{ setOut(text.slice(0,++i)); if(i<text.length) t2=setTimeout(tick,speed); };
      tick();
    },delay);
    return ()=>{ clearTimeout(t1); clearTimeout(t2); };
  },[text,delay,speed,active]);
  return out;
}
