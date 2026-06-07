"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Home() {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("all"); 
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [backendError, setBackendError] = useState(false);

  const loadVaultData = () => {
    setLoading(true);
    setBackendError(false);
    
    fetch("http://127.0.0.1:8000/api/vaulted-asteroids")
      .then((res) => {
        if (!res.ok) throw new Error("Server node bad response");
        return res.json();
      })
      .then((data) => {
        setAsteroids(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Data bridge linkage connection failure:", err);
        setBackendError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadVaultData();
  }, []);

  const requestSort = (columnKey) => {
    let direction = "asc";
    if (sortColumn === columnKey && sortDirection === "asc") {
      direction = "desc";
    }
    setSortColumn(columnKey);
    setSortDirection(direction);
  };

  const filteredAsteroids = asteroids.filter((asteroid) => {
    if (filterMode === "hazardous") {
      return asteroid.is_hazardous === true;
    }
    return true;
  });

  const displayedAsteroids = [...filteredAsteroids].sort((a, b) => {
    if (!sortColumn) return 0;
    
    // Handle string sorting for the new trajectory column
    if (typeof a[sortColumn] === 'string') {
      return sortDirection === "asc" 
        ? a[sortColumn].localeCompare(b[sortColumn])
        : b[sortColumn].localeCompare(a[sortColumn]);
    }

    if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getSortIcon = (columnKey) => {
    if (sortColumn !== columnKey) return " ↕";
    return sortDirection === "asc" ? " ▴" : " ▾";
  };

  // Helper function to colorize the trajectory status text
  const getTrajectoryStyle = (status) => {
    if (!status) return "text-slate-500";
    if (status.includes("COLLISION")) return "text-red-500 font-bold animate-pulse bg-red-950/30 px-2 py-1 rounded border border-red-900";
    if (status.includes("GRAZE")) return "text-orange-400 font-bold";
    if (status.includes("CISLUNAR")) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono p-8">
      
      {/* HEADER */}
      <header className="border-b border-slate-800 pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 tracking-wider">ORION COMMAND CENTER</h1>
          <p className="text-xs text-slate-400 mt-1">
            SYSTEM STATUS: PLANETARY DEFENSE GRID ACTIVE // LOCAL DATE: {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex border border-slate-800 rounded bg-slate-900 p-1 text-xs">
          <button 
            onClick={() => setFilterMode("all")}
            disabled={backendError}
            className={`px-4 py-2 rounded font-bold transition-all ${backendError ? "opacity-30 cursor-not-allowed" : ""} ${filterMode === "all" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"}`}
          >
            ALL TRACKED ASSETS
          </button>
          <button 
            onClick={() => setFilterMode("hazardous")}
            disabled={backendError}
            className={`px-4 py-2 rounded font-bold transition-all ${backendError ? "opacity-30 cursor-not-allowed" : ""} ${filterMode === "hazardous" ? "bg-red-500 text-white shadow animate-pulse" : "text-slate-400 hover:text-red-400"}`}
          >
            CRITICAL HAZARDS ONLY
          </button>
        </div>
      </header>

      {/* ERROR FALLBACK */}
      {backendError && (
        <div className="bg-red-950/40 border-2 border-red-800 p-8 rounded-lg mb-8 max-w-4xl mx-auto text-center">
          <h3 className="text-red-400 font-bold text-xl mb-2">⚠️ CRITICAL FAULT: DETACHED DATA GRID LINKAGE</h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-6">
            The frontend dashboard failed to establish a handshake connection with the Python FastAPI core execution service on port 8000.
          </p>
          <button 
            onClick={loadVaultData}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded transition-all text-sm uppercase tracking-wider"
          >
            🔄 Retry Data Bridge Handshake
          </button>
        </div>
      )}

      {/* MASTER GRID */}
      <div className={backendError ? "opacity-25 pointer-events-none transition-all duration-300" : "transition-all duration-300"}>
        <main className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* CHART */}
          <div className="xl:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-lg flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-cyan-300 mb-2">// KINETIC IMPACT YIELD SPECTRUM</h2>
              <p className="text-xs text-slate-400 mb-6">
                Displaying localized metrics for <span className="text-cyan-400 font-bold">{displayedAsteroids.length}</span> verified nodes.
              </p>
            </div>
            
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-500 animate-pulse">Accessing core parameters...</div>
            ) : (
              <div className="h-72 w-full bg-slate-950/50 p-4 border border-slate-800 rounded-md">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayedAsteroids}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" MT" />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", fontFamily: "monospace" }} itemStyle={{ color: "#22d3ee" }} />
                    <Bar dataKey="tnt_megatons" name="Explosive Yield" fill={filterMode === "hazardous" ? "#ef4444" : "#06b6d4"} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* TELEMETRY */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
            <h2 className="text-lg font-bold text-cyan-300 mb-4">// TELEMETRY INDEX STATUS</h2>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                <p className="text-xs text-slate-500 uppercase">Ablation Engine</p>
                <p className="text-md font-bold text-green-400 mt-1 uppercase">● ACTIVE (35m Barrier)</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                <p className="text-xs text-slate-500 uppercase">Trajectory Calculus</p>
                <p className="text-md font-bold text-green-400 mt-1 uppercase">● INTERSECT MAPPING LIVE</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                <p className="text-xs text-slate-500 uppercase">Tracked Profiles</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{displayedAsteroids.length}</p>
              </div>
            </div>
          </div>

          {/* SYSTEM LEDGER */}
          <div className="xl:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-lg overflow-hidden">
            <h2 className="text-lg font-bold text-cyan-300 mb-2">// ADVANCED THREAT INTELLIGENCE LOGS</h2>
            
            {!loading && displayedAsteroids.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider select-none">
                      <th onClick={() => requestSort("name")} className="py-2 cursor-pointer hover:text-cyan-400 pr-4">Asset Name{getSortIcon("name")}</th>
                      
                      {/* NEW: Trajectory Header */}
                      <th onClick={() => requestSort("trajectory_status")} className="py-2 cursor-pointer hover:text-cyan-400 pr-4">Trajectory Status{getSortIcon("trajectory_status")}</th>
                      
                      <th onClick={() => requestSort("diameter_km")} className="py-2 cursor-pointer hover:text-cyan-400 pr-4">Diameter{getSortIcon("diameter_km")}</th>
                      <th onClick={() => requestSort("velocity_km_s")} className="py-2 cursor-pointer hover:text-cyan-400 pr-4">Velocity{getSortIcon("velocity_km_s")}</th>
                      <th onClick={() => requestSort("survives_atmosphere")} className="py-2 cursor-pointer hover:text-cyan-400 pr-4">Atmospheric Fate{getSortIcon("survives_atmosphere")}</th>
                      <th onClick={() => requestSort("crater_diameter_km")} className="py-2 cursor-pointer hover:text-cyan-400 pr-4">Est. Crater{getSortIcon("crater_diameter_km")}</th>
                      <th onClick={() => requestSort("severity_classification")} className="py-2 cursor-pointer hover:text-cyan-400">Severity{getSortIcon("severity_classification")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {displayedAsteroids.map((asteroid) => (
                      <tr key={asteroid.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-bold text-slate-300 pr-4">{asteroid.name}</td>
                        
                        {/* NEW: Trajectory Data Cell */}
                        <td className={`py-3 pr-4 ${getTrajectoryStyle(asteroid.trajectory_status)}`}>
                          {asteroid.trajectory_status}
                        </td>

                        <td className="py-3 text-cyan-400 pr-4">{asteroid.diameter_km} km</td>
                        <td className="py-3 text-yellow-400 pr-4">{asteroid.velocity_km_s} km/s</td>
                        
                        <td className="py-3 pr-4">
                          {asteroid.survives_atmosphere ? (
                            <span className="text-red-400 font-bold border border-red-900 bg-red-950/50 px-2 py-0.5 rounded">GROUND STRIKE</span>
                          ) : (
                            <span className="text-blue-400 border border-blue-900 bg-blue-950/50 px-2 py-0.5 rounded">AIRBURST ONLY</span>
                          )}
                        </td>
                        
                        <td className="py-3 text-slate-400 pr-4">
                          {asteroid.crater_diameter_km > 0 ? `${asteroid.crater_diameter_km} km` : "N/A"}
                        </td>
                        
                        <td className={`py-3 ${asteroid.survives_atmosphere ? 'text-red-400' : 'text-slate-500'}`}>
                          {asteroid.severity_classification}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}