import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Table from '../components/Table';
import { SAMPLE } from '../utils/constants';
import { showSuccess, showError } from '../services/notificationService';

const wardDefaulters = {
  1: [
    { owner: "Rahul Patil", ward: 1, amountDue: 5000, contact: "rahul@email.com", phone: "9876543210" },
    { owner: "Sneha Joshi", ward: 1, amountDue: 3200, contact: "sneha@email.com", phone: "9876543211" },
    { owner: "Vijay Deshmukh", ward: 1, amountDue: 4500, contact: "vijay@email.com", phone: "9876543221" },
    { owner: "Anjali More", ward: 1, amountDue: 2100, contact: "anjali@email.com", phone: "9876543222" },
    { owner: "Sagar Shinde", ward: 1, amountDue: 6700, contact: "sagar@email.com", phone: "9876543223" },
    { owner: "Priya Rao", ward: 1, amountDue: 3400, contact: "priya@email.com", phone: "9876543224" }
  ],
  2: [
    { owner: "Amit Kulkarni", ward: 2, amountDue: 4500, contact: "amit@email.com", phone: "9876543212" },
    { owner: "Neha Deshmukh", ward: 2, amountDue: 2800, contact: "neha@email.com", phone: "9876543213" },
    { owner: "Rohan Gupta", ward: 2, amountDue: 8900, contact: "rohan@email.com", phone: "9876543225" },
    { owner: "Meena Jain", ward: 2, amountDue: 5600, contact: "meena@email.com", phone: "9876543226" },
    { owner: "Karan Johar", ward: 2, amountDue: 1200, contact: "karan@email.com", phone: "9876543227" },
    { owner: "Shweta Tiwari", ward: 2, amountDue: 4300, contact: "shweta@email.com", phone: "9876543228" },
    { owner: "Sahil Khan", ward: 2, amountDue: 2900, contact: "sahil@email.com", phone: "9876543229" },
    { owner: "Tanvi Shah", ward: 2, amountDue: 7500, contact: "tanvi@email.com", phone: "9876543230" }
  ],
  3: [
    { owner: "Suresh Pawar", ward: 3, amountDue: 6200, contact: "suresh@email.com", phone: "9876543214" },
    { owner: "Anita Shinde", ward: 3, amountDue: 3900, contact: "anita@email.com", phone: "9876543215" },
    { owner: "Rohit Jadhav", ward: 3, amountDue: 5100, contact: "rohit@email.com", phone: "9876543216" },
    { owner: "Divya Khosla", ward: 3, amountDue: 9200, contact: "divya@email.com", phone: "9876543231" },
    { owner: "Abhishek Bachchan", ward: 3, amountDue: 4400, contact: "abhishek@email.com", phone: "9876543232" },
    { owner: "Karishma Kapoor", ward: 3, amountDue: 1500, contact: "karishma@email.com", phone: "9876543233" }
  ],
  4: [
    { owner: "Kiran More", ward: 4, amountDue: 7000, contact: "kiran@email.com", phone: "9876543217" },
    { owner: "Pooja Patil", ward: 4, amountDue: 4300, contact: "pooja@email.com", phone: "9876543218" },
    { owner: "Hrithik Roshan", ward: 4, amountDue: 12000, contact: "hrithik@email.com", phone: "9876543234" },
    { owner: "Katrina Kaif", ward: 4, amountDue: 8500, contact: "katrina@email.com", phone: "9876543235" },
    { owner: "Ranbir Kapoor", ward: 4, amountDue: 4500, contact: "ranbir@email.com", phone: "9876543236" },
    { owner: "Deepika Padukone", ward: 4, amountDue: 3200, contact: "deepika@email.com", phone: "9876543237" },
    { owner: "Alia Bhatt", ward: 4, amountDue: 9800, contact: "alia@email.com", phone: "9876543238" },
    { owner: "Varun Dhawan", ward: 4, amountDue: 5400, contact: "varun@email.com", phone: "9876543239" },
    { owner: "Sidharth Malhotra", ward: 4, amountDue: 6100, contact: "sid@email.com", phone: "9876543240" },
    { owner: "Kiara Advani", ward: 4, amountDue: 7700, contact: "kiara@email.com", phone: "9876543241" }
  ],
  5: [
    { owner: "Vikas Shinde", ward: 5, amountDue: 5500, contact: "vikas@email.com", phone: "9876543219" },
    { owner: "Priya Kulkarni", ward: 5, amountDue: 3000, contact: "priya@email.com", phone: "9876543220" },
    { owner: "Manish Malhotra", ward: 5, amountDue: 25000, contact: "manish@email.com", phone: "9876543242" },
    { owner: "Karan Malik", ward: 5, amountDue: 4200, contact: "karanm@email.com", phone: "9876543243" },
    { owner: "Rhea Pillai", ward: 5, amountDue: 6800, contact: "rhea@email.com", phone: "9876543244" },
    { owner: "Anand Ahuja", ward: 5, amountDue: 9500, contact: "anand@email.com", phone: "9876543245" },
    { owner: "Sonam Kapoor", ward: 5, amountDue: 1200, contact: "sonam@email.com", phone: "9876543246" }
  ]
};

export default function Defaulters() {
  const { t, isAdmin } = useOutletContext();
  const [selectedWard, setSelectedWard] = useState(5);

  const rawData = wardDefaulters[selectedWard];

  const defaulters = rawData.map(d => ({
    uid: `MH-WD${selectedWard}-${Math.floor(Math.random()*900)+100}`,
    owner: d.owner,
    dues: `₹${d.amountDue.toLocaleString()}`,
    ward: d.ward,
    amountDue: d.amountDue,
    contact: d.contact,
    phone: d.phone,
    status: "defaulter",
    years: Math.floor(Math.random()*3)+1
  }));

  const handleExportCSV = () => {
    const data = defaulters;
    const csv = [
      ["Owner", "UID / Ward", "Amount", "Status"],
      ...data.map(d => [d.owner, d.uid, d.dues, d.status])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "defaulters.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSendNotices = async () => {
    try {
      const resp = await fetch('http://localhost:5000/api/notices/send-bulk-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaulters })
      });
      
      if (resp.ok) {
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Bulk_Notices_Ward_${selectedWard}.pdf`;
        a.click();
        showSuccess(`Bulk notices generated for Ward ${selectedWard} (${defaulters.length} properties)`);
      } else {
        showError("Failed to generate bulk notices.");
      }
    } catch (err) {
      console.error("Notice error:", err);
      showError("Connection error while connecting to server.");
    }
  };

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyCenter: "space-between", marginBottom: 20, justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 600 }}>{t.defaulters}</h2>
          <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>
            {defaulters.length} active defaulters — Ward {selectedWard}
          </p>
        </div>
        
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text3)", display: "block", marginBottom: 4 }}>Filter by Ward</label>
            <select 
              value={selectedWard}
              onChange={(e) => setSelectedWard(Number(e.target.value))}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontSize: 14 }}
            >
              {[1, 2, 3, 4, 5].map(w => <option key={w} value={w}>Ward {w}</option>)}
            </select>
          </div>
          {isAdmin && (
            <div style={{ display: "flex", gap: 8, marginTop: 17 }}>
              <button className="btn-outline" onClick={handleExportCSV}>📤 Export CSV</button>
              <button className="btn-primary" onClick={handleSendNotices}>📝 Send Bulk Notice</button>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
        {[
          { ward: 1, count: 8 },
          { ward: 2, count: 22 },
          { ward: 3, count: 6 },
          { ward: 4, count: 35 },
          { ward: 5, count: 12 }
        ].map(w => {
          let color = "var(--success)";
          let status = "🟢 Good";
          let bg = "rgba(46, 204, 113, 0.1)";

          if (w.count > 30) {
            color = "var(--danger)";
            status = "🔴 High Risk";
            bg = "rgba(231, 76, 60, 0.1)";
          } else if (w.count >= 10) {
            color = "var(--warning)";
            status = "🟠 Medium Risk";
            bg = "rgba(243, 156, 18, 0.1)";
          }

          return (
            <div key={w.ward} className="card" style={{ 
              background: bg, border: `1.5px solid ${color}`,
              padding: "16px", textAlign: "center", animation: "fadeUp 0.4s ease"
            }}>
              <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 4 }}>Ward {w.ward}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: color, marginBottom: 2 }}>{w.count}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: color }}>{status}</div>
            </div>
          );
        })}
      </div>
      <div className="card">
        <Table data={defaulters} />
      </div>
    </div>
  );
}
