import React from 'react';

export default function Table({ data }) {
  if (!data?.length) return null;
  const keys = Object.keys(data[0]);
  return (
    <div style={{ overflowX: "auto", marginTop: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "var(--bg2)" }}>
            {keys.map(k => (
              <th key={k} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 500, color: "var(--text2)", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                {k.replace(/([A-Z])/g, ' $1')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
              {keys.map(k => (
                <td key={k} style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                  {k === "status" ? <span className={`status-${row[k]}`}>{row[k]}</span> : row[k]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
