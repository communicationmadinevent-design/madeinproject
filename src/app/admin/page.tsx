"use client";

import { useEffect, useState } from "react";

interface Lead {
  id: string;
  ref: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  org: string;
  score: number;
  mode: string;
  created_at: string;
  ai_analysis?: string;
}

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [search, modeFilter]);

  async function fetchLeads() {
    setLoading(true);
    const url = new URL("/api/leads", window.location.origin);
    if (search) url.searchParams.set("search", search);
    if (modeFilter !== "all") url.searchParams.set("mode", modeFilter);

    try {
      const res = await fetch(url);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error("Erreur:", err);
    }
    setLoading(false);
  }

  function exportCSV() {
    if (!leads.length) return;

    const headers = ["Ref", "Nom", "Prénom", "Email", "Téléphone", "Org", "Score", "Mode", "Date"];
    const rows = leads.map((l) => [
      l.ref,
      l.lastname,
      l.firstname,
      l.email,
      l.phone,
      l.org || "-",
      l.score,
      l.mode,
      new Date(l.created_at).toLocaleDateString("fr-FR"),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  function scoreColor(score: number) {
    if (score >= 90) return "🔥 Prioritaire";
    if (score >= 70) return "🌤️ Avancé";
    if (score >= 50) return "🌱 Maturation";
    return "💭 À affiner";
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Back-Office MadeInProject</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Chercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            minWidth: "200px",
          }}
        />
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <option value="all">Tous les modes</option>
          <option value="standard">Standard</option>
          <option value="express">Express</option>
          <option value="chat">Chat</option>
        </select>
        <button
          onClick={exportCSV}
          style={{
            padding: "8px 16px",
            background: "#2e4baf",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          📥 Exporter CSV
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "8px" }}>
          <div style={{ fontSize: "12px", color: "#666" }}>Total leads</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{leads.length}</div>
        </div>
        <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "8px" }}>
          <div style={{ fontSize: "12px", color: "#666" }}>🔥 Prioritaires</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{leads.filter((l) => l.score >= 90).length}</div>
        </div>
        <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "8px" }}>
          <div style={{ fontSize: "12px", color: "#666" }}>🌤️ Avancés</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{leads.filter((l) => l.score >= 70 && l.score < 90).length}</div>
        </div>
        <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "8px" }}>
          <div style={{ fontSize: "12px", color: "#666" }}>Score moyen</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length || 0)}</div>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Ref</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Nom</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Téléphone</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Score</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Mode</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Date</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                  Chargement...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                  Aucun lead trouvé
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  onMouseEnter={() => setHoveredRow(lead.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    borderBottom: "1px solid #eee",
                    background: hoveredRow === lead.id ? "#f9f9f9" : "white",
                  }}
                >
                  <td style={{ padding: "12px", fontWeight: "bold", color: "#2e4baf" }}>{lead.ref}</td>
                  <td style={{ padding: "12px" }}>{lead.lastname} {lead.firstname}</td>
                  <td style={{ padding: "12px" }}>{lead.email}</td>
                  <td style={{ padding: "12px" }}>{lead.phone}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ background: "#f0f0f0", padding: "4px 8px", borderRadius: "4px" }}>
                      {lead.score}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>{lead.mode}</td>
                  <td style={{ padding: "12px", fontSize: "12px", color: "#999" }}>
                    {new Date(lead.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => setSelectedLead(lead)}
                      style={{
                        padding: "4px 12px",
                        background: "#16213e",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedLead && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedLead(null)}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{selectedLead.firstname} {selectedLead.lastname}</h2>
            <p><strong>Ref:</strong> {selectedLead.ref}</p>
            <p><strong>Email:</strong> {selectedLead.email}</p>
            <p><strong>Téléphone:</strong> {selectedLead.phone}</p>
            <p><strong>Organisation:</strong> {selectedLead.org || "-"}</p>
            <p><strong>Score:</strong> {selectedLead.score} — {scoreColor(selectedLead.score)}</p>
            <p><strong>Mode:</strong> {selectedLead.mode}</p>
            <p><strong>Date:</strong> {new Date(selectedLead.created_at).toLocaleDateString("fr-FR")}</p>
            {selectedLead.ai_analysis && (
              <>
                <h3>Analyse IA</h3>
                <p style={{ fontSize: "14px", color: "#666" }}>{selectedLead.ai_analysis}</p>
              </>
            )}
            <button
              onClick={() => setSelectedLead(null)}
              style={{
                padding: "8px 16px",
                background: "#2e4baf",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
