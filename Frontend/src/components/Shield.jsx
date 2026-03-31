import React from 'react';

export default function Shield({ size = 38, color, light = false }) {
  const primary = color || "#03362a";
  const contrast = light ? "#FFFFFF" : primary;
  const inner = light ? primary : "#FFFFFF";

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 4L36 12V20C36 29 29 36.5 20 39C11 36.5 4 29 4 20V12L20 4Z"
        fill={contrast} fillOpacity={light ? 0.9 : 0.85} />
      <path d="M20 10L30 15V20C30 25.5 25.5 30.5 20 32C14.5 30.5 10 25.5 10 20V15L20 10Z"
        fill={inner} fillOpacity={0.75} />
      <circle cx="20" cy="20" r="4"
        fill={contrast} fillOpacity={0.9} />
    </svg>
  );
}
