import React, { useState, useEffect } from "react";
import { 
  Users, UserCheck, Settings, ShieldAlert, Plus, Search, 
  Trash2, Edit, AlertCircle, Check, RefreshCw, LogOut, 
  Database, Calendar, BarChart2, CheckSquare, XCircle, FileSpreadsheet, Clock
} from "lucide-react";
import { Prisoner, Visit, SystemSettings } from "../types";
import { motion } from "motion/react";

interface AdminPanelProps {
  onExit: () => void;
}

export default function AdminPanel({ onExit }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"queue" | "prisoners" | "settings">("queue");
  
  // Data State
  const [visits, setVisits] = useState<Visit[]>([]);
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  
  // Interactive UI state
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal / Form state for Prisoners
  const [showAddPrisoner, setShowAddPrisoner] = useState(false);
  const [editingPrisoner, setEditingPrisoner] = useState<Prisoner | null>(null);
  const [prisName, setPrisName] = useState("");
  const [prisDob, setPrisDob] = useState("");
  const [prisAddress, setPrisAddress] = useState("");
  const [prisStatus, setPrisStatus] = useState<"active" | "disciplined">("active");
  const [prisReason, setPrisReason] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPrisoners, resVisits, resSettings] = await Promise.all([
        fetch("/api/prisoners"),
        fetch("/api/visits"),
        fetch("/api/settings")
      ]);

      if (!resPrisoners.ok || !resVisits.ok || !resSettings.ok) {
        throw new Error("Không thể kết nối đến cơ sở dữ liệu máy chủ");
      }

      const listPrisoners = await resPrisoners.json();
      const listVisits = await resVisits.json();
      const currentSettings = await resSettings.json();

      setPrisoners(listPrisoners);
      setVisits(listVisits);
      setSettings(currentSettings);
    } catch (err: any) {
      setError(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 4000);
    }
  };

  // CHECK IN VISIT
  const handleCheckIn = async (id: string) => {
    try {
      const res = await fetch(`/api/visits/${id}/checkin`, { method: "POST" });
      if (!res.ok) throw new Error("Thao tác check-in thất bại");
      const updated = await res.json();
      setVisits(prev => prev.map(v => v.id === id ? updated : v));
      showNotification("Đã cập nhật trạng thái ra vào cổng của khách thành công!");
    } catch (err: any) {
      showNotification(err.message, false);
    }
  };

  // CANCEL VISIT
  const handleCancelVisit = async (id: string) => {
    try {
      const res = await fetch(`/api/visits/${id}/cancel`, { method: "POST" });
      if (!res.ok) throw new Error("Thao tác hủy lượt thất bại");
      const updated = await res.json();
      setVisits(prev => prev.map(v => v.id === id ? updated : v));
      showNotification("Đã hủy lượt đăng ký thăm gặp.");
    } catch (err: any) {
      showNotification(err.message, false);
    }
  };

  // DELETE VISIT
  const handleDeleteVisit = async (id: string) => {
    if (!window.confirm("Xác nhận xóa hẳn hồ sơ thăm gặp này khỏi hệ thống?")) return;
    try {
      const res = await fetch(`/api/visits/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Lỗi khi xóa hồ sơ");
      setVisits(prev => prev.filter(v => v.id !== id));
      showNotification("Đã xóa hồ sơ khỏi danh sách lưu trữ.");
    } catch (err: any) {
      showNotification(err.message, false);
    }
  };

  // ADD / EDIT PRISONER
  const handleSavePrisoner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prisName.trim() || !prisDob.trim() || !prisAddress.trim()) {
      showNotification("Vui lòng điền đủ Họ tên, Ngày sinh và Hộ khẩu can phạm", false);
      return;
    }

    try {
      const payload = {
        name: prisName.toUpperCase().trim(),
        dob: prisDob.trim(),
        address: prisAddress.trim(),
        status: prisStatus,
        reason: prisReason.trim()
      };

      if (editingPrisoner) {
        // Edit flow
        const res = await fetch(`/api/prisoners/${editingPrisoner.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Cập nhật can phạm thất bại");
        const updated = await res.json();
        setPrisoners(prev => prev.map(p => p.id === editingPrisoner.id ? updated : p));
        showNotification("Đã cập nhật hồ sơ can phạm nhân.");
      } else {
        // Add flow
        const res = await fetch("/api/prisoners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Thêm can phạm thất bại");
        const added = await res.json();
        setPrisoners(prev => [...prev, added]);
        showNotification("Đã thêm can phạm nhân mới vào hệ thống gác.");
      }

      // Reset Form State
      setShowAddPrisoner(false);
      setEditingPrisoner(null);
      setPrisName("");
      setPrisDob("");
      setPrisAddress("");
      setPrisStatus("active");
      setPrisReason("");
    } catch (err: any) {
      showNotification(err.message, false);
    }
  };

  const startEditPrisoner = (p: Prisoner) => {
    setEditingPrisoner(p);
    setPrisName(p.name);
    setPrisDob(p.dob);
    setPrisAddress(p.address);
    setPrisStatus(p.status);
    setPrisReason(p.reason || "");
    setShowAddPrisoner(true);
  };

  const handleDeletePrisoner = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hẳn phạm nhân này khỏi cơ sở dữ liệu?")) return;
    try {
      const res = await fetch(`/api/prisoners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Không thể xóa can phạm");
      setPrisoners(prev => prev.filter(p => p.id !== id));
      showNotification("Đã xóa can phạm khỏi cơ sở dữ liệu.");
    } catch (err: any) {
      showNotification(err.message, false);
    }
  };

  // SAVE SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error("Lưu cấu hình hệ thống thất bại");
      const updated = await res.json();
      setSettings(updated);
      showNotification("Cấu hình hệ thống đã được đồng bộ hóa và lưu trữ.");
    } catch (err: any) {
      showNotification(err.message, false);
    }
  };

  // FILTER LOGIC
  const filteredVisits = visits.filter(v =>
    v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.visitorCccd.includes(searchTerm) ||
    v.stt.includes(searchTerm) ||
    v.prisonerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrisoners = prisoners.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dob.includes(searchTerm)
  );

  // Statistics calculation
  const stats = {
    totalVisits: visits.length,
    waiting: visits.filter(v => v.status === "waiting").length,
    checkedIn: visits.filter(v => v.status === "checked-in").length,
    cancelled: visits.filter(v => v.status === "cancelled").length,
    totalPrisoners: prisoners.length,
    disciplinedPrisoners: prisoners.filter(p => p.status === "disciplined").length
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-slate-900 -mx-6 -mt-6 px-6 py-4 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">HỆ THỐNG QUẢN LÝ THĂM GẶP</h1>
            <p className="text-[10px] text-slate-400">Dành riêng cho cán bộ quản giáo & cổng gác</p>
          </div>
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Về Cổng Người Dân</span>
        </button>
      </div>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Hôm nay</span>
            <div className="text-2xl font-black text-slate-800">{stats.totalVisits} lượt</div>
          </div>
          <BarChart2 className="w-8 h-8 text-indigo-500 opacity-80" />
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Chờ duyệt</span>
            <div className="text-2xl font-black text-amber-600">{stats.waiting} lượt</div>
          </div>
          <Clock className="w-8 h-8 text-amber-500 opacity-80" />
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Đã vào</span>
            <div className="text-2xl font-black text-green-600">{stats.checkedIn} lượt</div>
          </div>
          <UserCheck className="w-8 h-8 text-green-500 opacity-80" />
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Can phạm</span>
            <div className="text-2xl font-black text-slate-800">{stats.totalPrisoners} người</div>
          </div>
          <Users className="w-8 h-8 text-blue-500 opacity-80" />
        </div>
      </div>

      {/* ADMIN TABS NAVIGATION */}
      <div className="border-b border-slate-200 flex gap-1 bg-slate-50 p-1.5 rounded-xl">
        <button
          onClick={() => { setActiveTab("queue"); setSearchTerm(""); }}
          className={`flex-grow py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "queue"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-150"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Hôm nay ({stats.waiting} chờ)
        </button>

        <button
          onClick={() => { setActiveTab("prisoners"); setSearchTerm(""); }}
          className={`flex-grow py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "prisoners"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-150"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
          }`}
        >
          <Users className="w-4 h-4" />
          Hồ sơ can phạm
        </button>

        <button
          onClick={() => { setActiveTab("settings"); setSearchTerm(""); }}
          className={`flex-grow py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "settings"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-150"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
          }`}
        >
          <Settings className="w-4 h-4" />
          Cấu hình gác
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-150 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-pulse">
          <CheckSquare className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-150 text-red-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: VISITING QUEUE AND CHECK IN */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm khách theo Tên, STT hoặc Số CCCD..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium shadow-sm"
              />
            </div>
            <button
              onClick={fetchData}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
              title="Làm mới hàng chờ"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500">Đang đồng bộ danh sách lượt đăng ký...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVisits.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-2xl">
                  Chưa có lượt khai báo nào được ghi nhận cho đợt thăm này.
                </div>
              ) : (
                filteredVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className={`p-4 bg-white border rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      visit.status === "checked-in"
                        ? "border-green-200 bg-green-50/10"
                        : visit.status === "cancelled"
                        ? "border-slate-200 opacity-60"
                        : "border-slate-200 hover:border-indigo-200"
                    }`}
                  >
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-900 text-white font-black text-sm px-3 py-1 rounded-xl tracking-wider">
                          STT: {visit.stt}
                        </span>
                        {visit.status === "waiting" ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">
                            Chờ kiểm tra
                          </span>
                        ) : visit.status === "checked-in" ? (
                          <span className="bg-green-100 text-green-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-green-200 uppercase">
                            Đã qua cổng
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                            Đã hủy lượt
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-6 text-xs">
                        <div>
                          <strong className="text-slate-800">Thân nhân:</strong>{" "}
                          <span className="font-semibold text-slate-900">{visit.visitorName}</span> ({visit.visitorGender}, {visit.visitorDob})
                        </div>
                        <div>
                          <strong className="text-slate-800">Người gặp:</strong>{" "}
                          <span className="font-bold text-slate-900 uppercase">{visit.prisonerName}</span> ({visit.relationship})
                        </div>
                        <div>
                          <strong className="text-slate-800">Số CCCD:</strong>{" "}
                          <span className="font-mono">{visit.visitorCccd}</span>
                        </div>
                        <div>
                          <strong className="text-slate-800">Liên hệ:</strong>{" "}
                          <span>{visit.visitorPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end">
                      {visit.status === "waiting" && (
                        <>
                          <button
                            onClick={() => handleCheckIn(visit.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Cho Vào Cổng</span>
                          </button>
                          <button
                            onClick={() => handleCancelVisit(visit.id)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1.5 px-2.5 rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Hủy vé</span>
                          </button>
                        </>
                      )}

                      {visit.status === "checked-in" && (
                        <button
                          onClick={() => handleCheckIn(visit.id)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold py-1.5 px-3 rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-amber-200"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Thu Hồi Số</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteVisit(visit.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Xóa hồ sơ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRISONER CRUD */}
      {activeTab === "prisoners" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-3">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm can phạm theo Họ tên hoặc Ngày sinh..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
              />
            </div>
            <button
              onClick={() => {
                setEditingPrisoner(null);
                setPrisName("");
                setPrisDob("");
                setPrisAddress("");
                setPrisStatus("active");
                setPrisReason("");
                setShowAddPrisoner(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Mới</span>
            </button>
          </div>

          {showAddPrisoner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-sm"
            >
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {editingPrisoner ? "Cập nhật thông tin can phạm" : "Khai báo can phạm nhân mới"}
              </h3>
              <form onSubmit={handleSavePrisoner} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600">Họ và tên can phạm nhân</label>
                  <input
                    type="text"
                    required
                    value={prisName}
                    onChange={(e) => setPrisName(e.target.value.toUpperCase())}
                    placeholder="NGUYỄN VĂN A"
                    className="w-full mt-1 border border-slate-300 rounded-lg py-1.5 px-3 focus:outline-none focus:border-indigo-500 bg-white uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600">Ngày sinh (dd-mm-yyyy)</label>
                  <input
                    type="text"
                    required
                    placeholder="12-05-1990"
                    maxLength={10}
                    value={prisDob}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      let formatted = "";
                      if (value.length > 0) {
                        formatted += value.substr(0, 2);
                        if (value.length > 2) {
                          formatted += "-" + value.substr(2, 2);
                          if (value.length > 4) {
                            formatted += "-" + value.substr(4, 4);
                          }
                        }
                      }
                      setPrisDob(formatted);
                    }}
                    className="w-full mt-1 border border-slate-300 rounded-lg py-1.5 px-3 focus:outline-none focus:border-indigo-500 bg-white font-semibold text-center"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-600">Hộ khẩu thường trú</label>
                  <input
                    type="text"
                    required
                    value={prisAddress}
                    onChange={(e) => setPrisAddress(e.target.value)}
                    placeholder="Số nhà, Đường/Phố, Phường/Xã, Quận/Huyện, Tỉnh/Thành"
                    className="w-full mt-1 border border-slate-300 rounded-lg py-1.5 px-3 focus:outline-none focus:border-indigo-500 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600">Trạng thái giam giữ</label>
                  <select
                    value={prisStatus}
                    onChange={(e) => setPrisStatus(e.target.value as "active" | "disciplined")}
                    className="w-full mt-1 border border-slate-300 rounded-lg py-1.5 px-3 focus:outline-none focus:border-indigo-500 bg-white font-semibold text-slate-700"
                  >
                    <option value="active">Được thăm gặp (Bình thường)</option>
                    <option value="disciplined">Bị kỷ luật (Đình chỉ thăm)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600">Lý do kỷ luật (nếu có)</label>
                  <input
                    type="text"
                    value={prisReason}
                    disabled={prisStatus !== "disciplined"}
                    onChange={(e) => setPrisReason(e.target.value)}
                    placeholder="Vi phạm điều mấy nội quy, đình chỉ bao nhiêu ngày..."
                    className="w-full mt-1 border border-slate-300 rounded-lg py-1.5 px-3 focus:outline-none focus:border-indigo-500 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed font-medium"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddPrisoner(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-4 rounded-lg cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded-lg cursor-pointer shadow"
                  >
                    {editingPrisoner ? "Cập Nhật" : "Thêm Can Phạm"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="max-h-[350px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Họ và tên</th>
                      <th className="p-3">Ngày sinh</th>
                      <th className="p-3">Địa chỉ cư trú</th>
                      <th className="p-3 text-center">Trạng thái</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPrisoners.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-bold text-slate-950 uppercase tracking-wide">{p.name}</td>
                        <td className="p-3 font-semibold text-slate-600 whitespace-nowrap">{p.dob}</td>
                        <td className="p-3 max-w-xs truncate text-slate-500" title={p.address}>{p.address}</td>
                        <td className="p-3 text-center">
                          {p.status === "active" ? (
                            <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full text-[10px] border border-green-200">
                              Bình thường
                            </span>
                          ) : (
                            <span
                              className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full text-[10px] border border-red-200"
                              title={p.reason}
                            >
                              Bị kỷ luật
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => startEditPrisoner(p)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer inline-flex"
                            title="Sửa hồ sơ"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePrisoner(p.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer inline-flex"
                            title="Xóa hẳn can phạm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SYSTEM SETTINGS */}
      {activeTab === "settings" && settings && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Settings className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-slate-800 uppercase tracking-wider">Cấu Hình Toàn Hệ Thống</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700">Ngày Thăm Gặp Đợt Này</label>
              <div className="relative mt-1">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={settings.visitDate}
                  onChange={(e) => setSettings({ ...settings, visitDate: e.target.value })}
                  placeholder="30-06-2026"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                * Toàn bộ người dân nộp tờ khai thăm gặp sẽ mặc định đăng ký vào ngày này.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700">Giới Hạn Lượt Đăng Ký Mỗi Ngày</label>
              <input
                type="number"
                required
                value={settings.maxVisitsPerDay}
                onChange={(e) => setSettings({ ...settings, maxVisitsPerDay: parseInt(e.target.value, 10) })}
                className="w-full mt-1 border border-slate-300 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                * Giới hạn để tránh ùn ứ tại phòng chờ thăm gặp của trại giam.
              </p>
            </div>

            <div className="md:col-span-2 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-indigo-900">Liên Kết Với Google Sheets (Apps Script)</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="bypass-cb"
                  checked={settings.bypassAppsScript}
                  onChange={(e) => setSettings({ ...settings, bypassAppsScript: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="bypass-cb" className="font-bold text-slate-700 cursor-pointer">
                  Sử dụng cơ sở dữ liệu nội bộ bảo mật (Bypass Apps Script)
                </label>
              </div>

              {!settings.bypassAppsScript && (
                <div className="space-y-1.5 pt-1.5">
                  <label className="block font-bold text-slate-600">Đường Dẫn Google Apps Script Web App URL</label>
                  <input
                    type="url"
                    value={settings.scriptUrl}
                    onChange={(e) => setSettings({ ...settings, scriptUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full border border-slate-300 rounded-lg py-1.5 px-3 focus:outline-none focus:border-indigo-500 bg-white font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    * Khi tắt chế độ Bypass, hệ thống sẽ thực hiện truy vấn trực tiếp đến liên kết Apps Script này.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl cursor-pointer shadow transition-colors"
            >
              Lưu Thay Đổi Cấu Hình
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
