import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Prisoner, Visit, SystemSettings } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up local database folder and file
const DB_DIR = path.join(process.cwd(), "src", "data");
const DB_PATH = path.join(DB_DIR, "db.json");

interface LocalDB {
  prisoners: Prisoner[];
  visits: Visit[];
  settings: SystemSettings;
}

const DEFAULT_PRISONERS: Prisoner[] = [
  {
    id: "P001",
    name: "NGUYỄN VĂN THẮNG",
    dob: "12-05-1990",
    address: "Số 12, Ngõ 45, Phố Vọng, Hai Bà Trưng, Hà Nội",
    status: "active"
  },
  {
    id: "P002",
    name: "TRẦN THỊ MAI",
    dob: "23-08-1985",
    address: "Tổ 3, Khu phố 2, Phường Bãi Cháy, Hạ Long, Quảng Ninh",
    status: "disciplined",
    reason: "Vi phạm nội quy buồng giam (Cất giấu vật cấm) - Đình chỉ thăm gặp 30 ngày"
  },
  {
    id: "P003",
    name: "LÊ HOÀNG NAM",
    dob: "05-11-1993",
    address: "Thôn Thượng, Xã Yên Tiến, Ý Yên, Nam Định",
    status: "active"
  },
  {
    id: "P004",
    name: "PHẠM MINH ĐỨC",
    dob: "18-02-1992",
    address: "Khu đô thị Từ Sơn, Thành phố Từ Sơn, Bắc Ninh",
    status: "active"
  },
  {
    id: "P005",
    name: "HOÀNG QUỐC VIỆT",
    dob: "30-07-1988",
    address: "Số 88, Đường Lê Lợi, Phủ Lý, Hà Nam",
    status: "active"
  },
  {
    id: "P006",
    name: "VŨ ĐÌNH PHONG",
    dob: "14-10-1991",
    address: "Xã Đông Hợp, Huyện Đông Hưng, Thái Bình",
    status: "disciplined",
    reason: "Đang chấp hành hình phạt kỷ luật tại buồng kỷ luật - Không tiếp xúc thân nhân"
  },
  {
    id: "P007",
    name: "BÙI THỊ HỒNG",
    dob: "08-03-1996",
    address: "Bản Lác, Chiềng Châu, Mai Châu, Hòa Bình",
    status: "active"
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  scriptUrl: "",
  visitDate: "30-06-2026",
  bypassAppsScript: true,
  maxVisitsPerDay: 100
};

// Ensure database file exists and is populated
function loadDatabase(): LocalDB {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      const initialDB: LocalDB = {
        prisoners: DEFAULT_PRISONERS,
        visits: [],
        settings: DEFAULT_SETTINGS
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2), "utf-8");
      return initialDB;
    }
    const content = fs.readFileSync(DB_PATH, "utf-8");
    const data = JSON.parse(content) as LocalDB;
    // Backwards compatibility check
    if (!data.prisoners) data.prisoners = DEFAULT_PRISONERS;
    if (!data.visits) data.visits = [];
    if (!data.settings) data.settings = DEFAULT_SETTINGS;
    return data;
  } catch (error) {
    console.error("Error reading database:", error);
    return {
      prisoners: DEFAULT_PRISONERS,
      visits: [],
      settings: DEFAULT_SETTINGS
    };
  }
}

function saveDatabase(data: LocalDB) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving database:", error);
  }
}

// --------------------------------------------------------
// API ENDPOINTS
// --------------------------------------------------------

// Get Prisoners
app.get("/api/prisoners", (req, res) => {
  const db = loadDatabase();
  res.json(db.prisoners);
});

// Add Prisoner
app.post("/api/prisoners", (req, res) => {
  const db = loadDatabase();
  const { name, dob, address, status, reason } = req.body;
  if (!name || !dob || !address) {
    res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    return;
  }
  const newPrisoner: Prisoner = {
    id: "P" + String(db.prisoners.length + 1).padStart(3, "0") + "_" + Date.now().toString().slice(-4),
    name: String(name).toUpperCase().trim(),
    dob,
    address,
    status: status || "active",
    reason: reason || ""
  };
  db.prisoners.push(newPrisoner);
  saveDatabase(db);
  res.status(201).json(newPrisoner);
});

// Update Prisoner
app.put("/api/prisoners/:id", (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  const index = db.prisoners.findIndex(p => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Không tìm thấy phạm nhân" });
    return;
  }
  const updated = { ...db.prisoners[index], ...req.body };
  if (updated.name) updated.name = updated.name.toUpperCase().trim();
  db.prisoners[index] = updated;
  saveDatabase(db);
  res.json(updated);
});

// Delete Prisoner
app.delete("/api/prisoners/:id", (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  const initialLen = db.prisoners.length;
  db.prisoners = db.prisoners.filter(p => p.id !== id);
  if (db.prisoners.length === initialLen) {
    res.status(404).json({ error: "Không tìm thấy phạm nhân" });
    return;
  }
  saveDatabase(db);
  res.json({ success: true });
});

// Get Visits
app.get("/api/visits", (req, res) => {
  const db = loadDatabase();
  res.json(db.visits);
});

// Toggle Visit Check-in
app.post("/api/visits/:id/checkin", (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  const visit = db.visits.find(v => v.id === id);
  if (!visit) {
    res.status(404).json({ error: "Không tìm thấy lượt đăng ký" });
    return;
  }
  visit.status = visit.status === "checked-in" ? "waiting" : "checked-in";
  saveDatabase(db);
  res.json(visit);
});

// Cancel Visit
app.post("/api/visits/:id/cancel", (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  const visit = db.visits.find(v => v.id === id);
  if (!visit) {
    res.status(404).json({ error: "Không tìm thấy lượt đăng ký" });
    return;
  }
  visit.status = "cancelled";
  saveDatabase(db);
  res.json(visit);
});

// Delete Visit record
app.delete("/api/visits/:id", (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  db.visits = db.visits.filter(v => v.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

// Settings Management
app.get("/api/settings", (req, res) => {
  const db = loadDatabase();
  res.json(db.settings);
});

app.post("/api/settings", (req, res) => {
  const db = loadDatabase();
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  res.json(db.settings);
});

// --------------------------------------------------------
// UNIVERSAL GOOGLE APPS SCRIPT GATEWAY / PROXY ENDPOINT
// This provides 100% identical compatibility with SCRIPT_URL
// --------------------------------------------------------
app.all("/api/visit-gateway", async (req, res) => {
  const db = loadDatabase();
  
  // Accept parameters from GET (query) or POST (body)
  const action = req.query.action || req.body.action;
  
  // CASE 1: Get Prisoner List
  if (action === "get_list") {
    // Return standard formatted list for visitor viewing
    const visitorList = db.prisoners.map(p => ({
      name: p.name,
      dob: p.dob,
      status: p.status === "active" ? "Được gặp" : "Kỷ luật"
    }));
    res.json(visitorList);
    return;
  }

  // CASE 2: Register visit (No action parameter, contains user info)
  const name = (req.query.name || req.body.name || "").toString().trim().toUpperCase();
  const gender = (req.query.gender || req.body.gender || "").toString().trim();
  const visitorDob = (req.query.visitorDob || req.body.visitorDob || "").toString().trim();
  const cccd = (req.query.cccd || req.body.cccd || "").toString().trim();
  const phone = (req.query.phone || req.body.phone || "").toString().trim();
  const relationship = (req.query.relationship || req.body.relationship || "").toString().trim();
  const prisonerName = (req.query.prisonerName || req.body.prisonerName || "").toString().trim().toUpperCase();
  const prisonerDob = (req.query.prisonerDob || req.body.prisonerDob || "").toString().trim();
  const prisonerAddress = (req.query.prisonerAddress || req.body.prisonerAddress || "").toString().trim();
  const date = (req.query.date || req.body.date || db.settings.visitDate || "30-06-2026").toString().trim();

  if (!name || !prisonerName || !cccd) {
    res.json({ result: "error", error: "Thiếu thông tin người thăm, can phạm nhân hoặc số CCCD!" });
    return;
  }

  // Find prisoner in local database
  const matchedPrisoner = db.prisoners.find(p => 
    p.name.toUpperCase() === prisonerName && 
    p.dob === prisonerDob
  );

  if (!matchedPrisoner) {
    res.json({ result: "not_found" });
    return;
  }

  if (matchedPrisoner.status === "disciplined") {
    res.json({ result: "disciplined", error: matchedPrisoner.reason || "Can phạm nhân đang chịu kỷ luật." });
    return;
  }

  // Valid registration - Generate standard auto-increment STT
  // STT has standard serial numbers per day: eg. "001", "002"
  const todayVisits = db.visits.filter(v => v.visitDate === date);
  const nextNumber = todayVisits.length + 1;
  const stt = String(nextNumber).padStart(3, "0");

  const newVisit: Visit = {
    id: "V_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    stt,
    visitorName: name,
    visitorGender: gender as "Nam" | "Nữ",
    visitorDob,
    visitorCccd: cccd,
    visitorPhone: phone,
    relationship,
    prisonerId: matchedPrisoner.id,
    prisonerName: matchedPrisoner.name,
    prisonerDob: matchedPrisoner.dob,
    visitDate: date,
    createdAt: new Date().toISOString(),
    status: "waiting"
  };

  db.visits.push(newVisit);
  saveDatabase(db);

  res.json({ 
    result: "success", 
    stt: stt,
    data: newVisit
  });
});

// Serve frontend react files or load Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Hệ thống chạy trên cổng http://localhost:${PORT}`);
  });
}

startServer();
