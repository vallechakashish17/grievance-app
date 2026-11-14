import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [grievances, setGrievances] = useState([]);
  const [form, setForm] = useState({ title: "", category: "Academic", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadGrievances() {
    try {
      const res = await fetch(`${API}/api/grievances`);
      if (!res.ok) throw new Error("Failed to load grievances");
      setGrievances(await res.json());
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadGrievances(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.title.trim().length < 5) return setError("Title must be at least 5 characters.");
    if (form.description.trim().length < 10) return setError("Description must be at least 10 characters.");
    try {
      const res = await fetch(`${API}/api/grievances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      setForm({ title: "", category: "Academic", description: "" });
      setError("");
      loadGrievances();
    } catch (err) { setError(err.message); }
  }

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`${API}/api/grievances/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Update failed");
      loadGrievances();
    } catch (err) { setError(err.message); }
  }

  async function remove(id) {
    try {
      const res = await fetch(`${API}/api/grievances/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      loadGrievances();
    } catch (err) { setError(err.message); }
  }

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", fontFamily: "Arial", padding: "0 12px" }}>
      <h1>Grievance Redressal</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Academic</option><option>Hostel</option><option>Library</option><option>Other</option>
        </select>
        <textarea placeholder="Description" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit">Submit</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <ul style={{ padding: 0 }}>
          {grievances.map((g) => (
            <li key={g._id} style={{ listStyle: "none", border: "1px solid #ccc", margin: "8px 0", padding: 10 }}>
              <strong>{g.title}</strong> ({g.category})
              <p>{g.description}</p>
              <select value={g.status} onChange={(e) => updateStatus(g._id, e.target.value)}>
                <option>Pending</option><option>In Progress</option><option>Resolved</option>
              </select>
              <button onClick={() => remove(g._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}