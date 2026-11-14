require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow only the frontend origin once CLIENT_URL is set; open while testing
app.use(cors(process.env.CLIENT_URL ? { origin: process.env.CLIENT_URL } : undefined));
app.use(express.json());

// Model / schema
const grievanceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 5 },
    description: { type: String, required: true, trim: true, minlength: 10 },
    category: { type: String, enum: ["Academic", "Hostel", "Library", "Other"], default: "Other" },
    status: { type: String, enum: ["Pending", "In Progress", "Resolved"], default: "Pending" }
  },
  { timestamps: true }
);
const Grievance = mongoose.model("Grievance", grievanceSchema);

// Endpoints
app.get("/", (req, res) => res.json({ status: "Grievance API running" }));

app.get("/api/grievances", async (req, res, next) => {
  try { res.json(await Grievance.find().sort({ createdAt: -1 })); }
  catch (err) { next(err); }
});

app.post("/api/grievances", async (req, res, next) => {
  try { res.status(201).json(await Grievance.create(req.body)); }
  catch (err) { next(err); }
});

app.put("/api/grievances/:id", async (req, res, next) => {
  try {
    const updated = await Grievance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "Grievance not found" });
    res.json(updated);
  } catch (err) { next(err); }
});

app.delete("/api/grievances/:id", async (req, res, next) => {
  try {
    const deleted = await Grievance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Grievance not found" });
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
});

// Centralized error handler
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") return res.status(400).json({ error: err.message });
  if (err.name === "CastError") return res.status(400).json({ error: "Invalid id" });
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server on port ${PORT}`));
  })
  .catch((err) => console.error("DB connection failed:", err.message));