import React, { useEffect, useState } from "react";
import api from "./api.js";

function money(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState({});
  const [workers, setWorkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [calls, setCalls] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", village: "", workType: "" });

  async function load() {
    const [d, w, c] = await Promise.all([
      api.get("/earnings/dashboard"),
      api.get("/workers"),
      api.get("/calls")
    ]);
    setDashboard(d.data);
    setWorkers(w.data);
    setCalls(c.data);
  }

  useEffect(() => { load().catch(console.error); }, []);

  async function addWorker(e) {
    e.preventDefault();
    await api.post("/workers", form);
    setForm({ name: "", phone: "", village: "", workType: "" });
    await load();
  }

  async function openWorker(id) {
    const { data } = await api.get(`/workers/${id}`);
    setSelected(data);
    setTab("profile");
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>Kulipani AI</h1>
          <p>Telugu AI Worker Earnings & Voice Collection</p>
        </div>
        <button onClick={load}>Refresh</button>
      </header>

      <nav>
        {["dashboard", "workers", "add", "calls", "voice"].map(x =>
          <button key={x} className={tab === x ? "active" : ""} onClick={() => setTab(x)}>
            {x.toUpperCase()}
          </button>
        )}
      </nav>

      {tab === "dashboard" && (
        <main>
          <section className="cards">
            <Card title="Today" value={money(dashboard.todayEarning)} />
            <Card title="This Month" value={money(dashboard.monthEarning)} />
            <Card title="This Year" value={money(dashboard.yearEarning)} />
            <Card title="All Time" value={money(dashboard.allTimeEarning)} />
            <Card title="Working Today" value={dashboard.workingToday} />
            <Card title="Holiday Today" value={dashboard.holidayToday} />
            <Card title="Own Work Today" value={dashboard.ownWorkToday} />
          </section>
          <h2>Workers</h2>
          <WorkerTable workers={workers} openWorker={openWorker} />
        </main>
      )}

      {tab === "workers" && (
        <main>
          <h2>All Workers</h2>
          <WorkerTable workers={workers} openWorker={openWorker} />
        </main>
      )}

      {tab === "add" && (
        <main>
          <h2>Add Worker</h2>
          <form className="form" onSubmit={addWorker}>
            {["name", "phone", "village", "workType"].map(k =>
              <input key={k} placeholder={k} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} required={k === "name" || k === "phone"} />
            )}
            <button>Add Worker</button>
          </form>
        </main>
      )}

      {tab === "calls" && (
        <main>
          <h2>AI Call History</h2>
          <table><thead><tr><th>Worker</th><th>Phone</th><th>Direction</th><th>Status</th><th>Time</th></tr></thead>
          <tbody>{calls.map(c => <tr key={c._id}><td>{c.workerId?.name || "Unknown"}</td><td>{c.phone}</td><td>{c.direction}</td><td>{c.status}</td><td>{new Date(c.createdAt).toLocaleString()}</td></tr>)}</tbody></table>
        </main>
      )}

      {tab === "profile" && selected && (
        <main>
          <button onClick={() => setTab("workers")}>← Back</button>
          <h2>{selected.worker.name}</h2>
          <div className="profile">
            <p><b>Worker ID:</b> {selected.worker.workerId}</p>
            <p><b>Phone:</b> {selected.worker.phone}</p>
            <p><b>Village:</b> {selected.worker.village}</p>
            <p><b>Work:</b> {selected.worker.workType}</p>
            <p><b>Total earning:</b> {money(selected.totals.total)}</p>
            <p><b>Worked days:</b> {selected.totals.workedDays}</p>
            <p><b>Holiday days:</b> {selected.totals.holidays}</p>
            <p><b>Own-work days:</b> {selected.totals.ownWorkDays}</p>
          </div>
          <h3>Daily History</h3>
          <table><thead><tr><th>Date</th><th>Morning</th><th>Evening</th><th>Total</th><th>Status</th><th>Confirmed</th></tr></thead>
          <tbody>{selected.records.map(r => <tr key={r._id}><td>{r.dateKey}</td><td>{money(r.morningEarning)}</td><td>{money(r.eveningEarning)}</td><td>{money(r.totalEarning)}</td><td>{r.status}</td><td>{r.confirmed ? "YES" : "NO"}</td></tr>)}</tbody></table>
        </main>
      )}

      {tab === "voice" && <VoiceTest />}
    </div>
  );
}

function Card({ title, value }) {
  return <div className="card"><span>{title}</span><strong>{value}</strong></div>;
}

function WorkerTable({ workers, openWorker }) {
  return <table><thead><tr><th>Name</th><th>Phone</th><th>Village</th><th>All Time</th><th>Worked Days</th><th></th></tr></thead>
    <tbody>{workers.map(w => <tr key={w._id}><td>{w.name}</td><td>{w.phone}</td><td>{w.village}</td><td>{money(w.total)}</td><td>{w.workedDays}</td><td><button onClick={() => openWorker(w._id)}>Profile</button></td></tr>)}</tbody>
  </table>;
}

function VoiceTest() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function speak() {
    setBusy(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/ai/tts`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text })
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      new Audio(url).play();
    } finally { setBusy(false); }
  }

  return <main>
    <h2>Telugu AI Voice Test</h2>
    <p>This tests your Sarvam TTS connection. Real PSTN calls are connected after the SIP/telephony layer is configured.</p>
    <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Namaskaram. Eeroju meeru pani chesara?" />
    <button disabled={busy || !text.trim()} onClick={speak}>{busy ? "Speaking..." : "Speak Telugu"}</button>
    {audioUrl && <audio controls src={audioUrl} />}
  </main>;
}
