import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import StatCard from '../components/StatCard';
import Chart from '../components/Chart';
import Table from '../components/Table';
import { SAMPLE } from '../utils/constants';

const wardData = {
  1: {
    properties: 284,
    collection: 1820000,
    defaulters: 8,
    recovery: 87,
    monthlyGrowth: "+5%",
    chart: 82
  },
  2: {
    properties: 312,
    collection: 1480000,
    defaulters: 12,
    recovery: 72,
    monthlyGrowth: "+3%",
    chart: 67
  },
  3: {
    properties: 198,
    collection: 2240000,
    defaulters: 6,
    recovery: 91,
    monthlyGrowth: "+8%",
    chart: 91
  },
  4: {
    properties: 247,
    collection: 1610000,
    defaulters: 15,
    recovery: 68,
    monthlyGrowth: "-2%",
    chart: 45
  },
  5: {
    properties: 290,
    collection: 1750000,
    defaulters: 10,
    recovery: 73,
    monthlyGrowth: "+4%",
    chart: 73
  }
};

export default function Dashboard() {
  const { t, zone, isAdmin } = useOutletContext();
  const [selectedWard, setSelectedWard] = useState(3);
  const data = wardData[selectedWard];

  const chartData = [
    { ward: "Jan", collected: Math.floor(Math.random() * 30 + 50) },
    { ward: "Feb", collected: Math.floor(Math.random() * 30 + 50) },
    { ward: "Mar", collected: Math.floor(Math.random() * 30 + 50) },
    { ward: "Apr", collected: Math.floor(Math.random() * 30 + 50) },
    { ward: "May", collected: wardData[selectedWard].chart }
  ];

  const leaderboard = Object.entries(wardData)
    .map(([ward, wdata]) => ({
      ward: `Ward ${ward}`,
      recovery: wdata.recovery,
      isHighlight: Number(ward) === selectedWard
    }))
    .sort((a, b) => b.recovery - a.recovery);

  const zones = ["Sector A", "Sector B", "Sector C", "Sector D", "Sector E"];
  const summary = zones.map((z, idx) => ({
    zone: `Ward ${selectedWard} — ${z}`,
    properties: Math.floor(data.properties / 5) + Math.floor(Math.random() * 10),
    collected: `₹${(data.collection / 5 + Math.random() * 100000).toLocaleString('en-IN', {maximumFractionDigits:0})}`,
    defaulters: Math.floor(data.defaulters / 5) + Math.floor(Math.random() * 3),
    rate: `${Math.floor(data.recovery - 5 + Math.random() * 10)}%`,
  }));

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 600 }}>
            {t.dashboard} — Ward {selectedWard}
          </h2>
          <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>
            {isAdmin ? "Full system overview" : `Zone ${zone} field data`}
          </p>
        </div>
        
        <div>
          <label style={{ fontSize: 12, color: "var(--text2)", display: "block", marginBottom: 6 }}>Select Ward</label>
          <select 
            value={selectedWard} 
            onChange={e => setSelectedWard(parseInt(e.target.value))}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: 14 }}
          >
            {[1, 2, 3, 4, 5].map(w => (
              <option key={w} value={w}>Ward {w}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Properties" value={data.properties} sub={data.monthlyGrowth + " this month"} color="var(--info)" icon="🏠" />
        <StatCard label="Total Collection" value={`₹${data.collection.toLocaleString()}`} sub="82% of target" color="var(--success)" icon="💰" />
        <StatCard label="Active Defaulters" value={data.defaulters} sub="↑ 5 this week" color="var(--danger)" icon="⚠️" />
        <StatCard label="Recovery Rate" value={`${data.recovery}%`} sub={isAdmin ? "All wards" : `Ward ${selectedWard}`} color="var(--accent)" icon="📈" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Monthly Collection Trend (%)</div>
          <Chart data={chartData} />
        </div>
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Leaderboard</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {leaderboard.map((item, idx) => (
              <div key={item.ward} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 12px", borderRadius: 8,
                background: item.isHighlight ? "var(--primary-ll)" : "var(--bg2)",
                border: item.isHighlight ? "2px solid var(--primary)" : "2px solid transparent",
                transition: "all .2s"
              }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ fontWeight: 600, color: "var(--text3)", width: 20 }}>#{idx + 1}</div>
                  <div style={{ fontWeight: item.isHighlight ? 600 : 400 }}>{item.ward}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {item.isHighlight && <span style={{ fontSize: 11, background: "var(--primary)", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>Selected</span>}
                  <div style={{ fontWeight: 600 }}>{item.recovery}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isAdmin && (
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Ward summary (Admin view)</div>
          <Table data={summary} />
        </div>
      )}
    </div>
  );
}
