import React from 'react';

const PARTICLES = Array.from({length:20},(_,i)=>({
  id:i, x:Math.random()*100, y:Math.random()*100,
  size:Math.random()*3+1.5, dur:Math.random()*12+8,
  delay:Math.random()*5,
  dx:(Math.random()-.5)*70, dy:(Math.random()-.5)*70,
}));

export default function FloatParticles({ color = "rgba(45,90,39,0.3)" }) {
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
      {PARTICLES.map(p=>(
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:`${p.y}%`,
          width:p.size, height:p.size, borderRadius:"50%", background:color,
          "--dx":`${p.dx}px`, "--dy":`${p.dy}px`,
          animation:`drift ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}
