import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Table from '../components/Table';

export default function Reports() {
  const { t, isAdmin } = useOutletContext();
  
  const [reportType, setReportType] = useState('Collection Summary');
  const [reportYear, setReportYear] = useState('2024');
  const [reportWard, setReportWard] = useState('All Wards');
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadReport = async (type, year, ward, format = 'pdf') => {
    setIsGenerating(true);
    try {
      const resp = await fetch('http://localhost:5000/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, year, ward, format })
      });
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 600, marginBottom: 20 }}>{t.reports}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {[
          { title: "Q2 2024 Collection Report", date: "Generated: 1 Jul 2024", size: "2.4 MB", icon: "📊" },
          { title: "Ward 5 Defaulter List", date: "Generated: 28 Jun 2024", size: "856 KB", icon: "⚠️" },
          { title: "Annual Summary 2023–24", date: "Generated: 1 Apr 2024", size: "5.1 MB", icon: "📋" },
          { title: "Payment Receipt Batch", depth: "Generated: 15 Jun 2024", size: "1.2 MB", icon: "💰" },
          { title: "Ward-wise Comparison", date: "Generated: 10 Jun 2024", size: "3.8 MB", icon: "📈" },
          { title: "Pending Dues Notice Set", date: "Generated: 5 Jun 2024", size: "990 KB", icon: "📝" },
        ].map((r, i) => (
          <div key={i} className="card" style={{ cursor: "pointer" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{r.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{r.title}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>{r.date || "Generated: 15 Jun 2024"} • {r.size}</div>
            <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => downloadReport(r.title, '2024', 'All Wards')} disabled={isGenerating}>⬇ Download PDF</button>
          </div>
        ))}
      </div>
      {isAdmin && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Generate new report</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Report type</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)}>
                <option>Collection Summary</option>
                <option>Defaulter List</option>
                <option>Ward Comparison</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Year</label>
              <select value={reportYear} onChange={e => setReportYear(e.target.value)}>
                <option>2026</option>
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Ward</label>
              <select value={reportWard} onChange={e => setReportWard(e.target.value)}>
                <option>All Wards</option>
                <option>Ward 1</option>
                <option>Ward 2</option>
                <option>Ward 3</option>
                <option>Ward 4</option>
                <option>Ward 5</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary" onClick={() => downloadReport(reportType, reportYear, reportWard, 'pdf')} disabled={isGenerating}>
                {isGenerating ? "Wait..." : "Export PDF"}
              </button>
              <button className="btn-outline" onClick={() => downloadReport(reportType, reportYear, reportWard, 'csv')} disabled={isGenerating}>
                {isGenerating ? "Wait..." : "Export CSV"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
