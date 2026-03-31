import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { showSuccess, showError } from '../services/notificationService';

export default function TaxCalculator() {
  const { t } = useOutletContext();
  
  const [value, setValue] = useState('');
  const [rate, setRate] = useState('5');
  const [ward, setWard] = useState('1');
  const [type, setType] = useState('Residential');
  const [result, setResult] = useState(null);

  const calculateTax = () => {
    if (!value || isNaN(value)) {
      showError("Please enter a valid property value");
      return;
    }

    const val = parseFloat(value);
    const r = parseFloat(rate);
    
    const baseTax = (val * r) / 100;
    const penalty = baseTax * 0.1;
    const total = baseTax + penalty;

    setResult({ baseTax, penalty, total });
    showSuccess("Tax calculated successfully!");
  };

  const downloadResult = () => {
    if (!result) return;
    const content = `
      MUNICIPAL PROPERTY TAX CALCULATION
      ---------------------------------
      Ward: ${ward}
      Type: ${type}
      Property Value: ₹${value}
      Tax Rate: ${rate}%
      ---------------------------------
      Base Tax: ₹${result.baseTax.toLocaleString()}
      Penalty (10%): ₹${result.penalty.toLocaleString()}
      Total Amount: ₹${result.total.toLocaleString()}
      ---------------------------------
      Generated on: ${new Date().toLocaleString()}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tax_Calculation_Ward_${ward}.txt`;
    a.click();
  };

  return (
    <div style={{ animation: "fadeUp .4s ease", maxWidth: 800 }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
        🧮 {t.taxCalculator}
      </h2>

      <div className="card" style={{ padding: "24px", background: "var(--bg2)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 8 }}>Property Value (₹)</label>
            <input 
              type="number" 
              placeholder="e.g. 500000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 8 }}>Tax Rate (%)</label>
            <input 
              type="number" 
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 8 }}>Ward</label>
            <select value={ward} onChange={(e) => setWard(e.target.value)}>
              {[1, 2, 3, 4, 5].map(w => <option key={w} value={w}>Ward {w}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 8 }}>Property Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={calculateTax}
          style={{ marginTop: 24, width: "100%", padding: "12px", fontSize: 15, fontWeight: 600 }}
        >
          Calculate Tax
        </button>
      </div>

      {result && (
        <div className="card" style={{ marginTop: 24, background: "#fdf8ef", border: "1px solid #e2d5c3", animation: "fadeUp 0.3s ease" }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "var(--primary)" }}>Calculation Breakdown</div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "var(--text2)" }}>Base Tax</span>
            <span style={{ fontWeight: 500 }}>₹{result.baseTax.toLocaleString()}</span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "var(--text2)" }}>Penalty (10% standard)</span>
            <span style={{ color: "#c0392b" }}>+ ₹{result.penalty.toLocaleString()}</span>
          </div>

          <div style={{ height: "1px", background: "#e2d5c3", margin: "16px 0" }}></div>
          
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>Total Amount Due</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--primary)" }}>₹{result.total.toLocaleString()}</span>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button className="btn-outline" onClick={downloadResult} style={{ flex: 1, fontSize: 13 }}>
              📥 Download Report
            </button>
            <button className="btn-outline" onClick={() => showSuccess("Result saved to municipal records")} style={{ flex: 1, fontSize: 13 }}>
              💾 Save Result
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
