import React, { useState, useEffect } from "react";
import { Shield, BookOpen, Users, Lock, Key, CheckSquare, Server, LogIn, Database } from "lucide-react";
import VisitorForm from "./components/VisitorForm";
import TicketScreen from "./components/TicketScreen";
import Regulations from "./components/Regulations";
import PrisonerList from "./components/PrisonerList";
import AdminPanel from "./components/AdminPanel";
import { Prisoner, Visit, SystemSettings } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Navigation Screens: 'form' | 'regulations' | 'prisoners' | 'ticket' | 'admin'
  const [screen, setScreen] = useState<"form" | "regulations" | "prisoners" | "ticket" | "admin">("form");
  
  // Data State
  const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [visitDate, setVisitDate] = useState("30-06-2026");
  const [bypassMode, setBypassMode] = useState(true);

  // Administrative entry state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Global loading/error notifications
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{ text: string; type: "error" | "warning" | "success" | "info" } | null>(null);

  // Fetch settings on load
  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const settings: SystemSettings = await response.json();
        setVisitDate(settings.visitDate);
        setBypassMode(settings.bypassAppsScript);
      }
    } catch (err) {
      console.warn("Could not fetch settings, using defaults.", err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [screen]);

  const showNotification = (text: string, type: "error" | "warning" | "success" | "info" = "error") => {
    setGlobalMessage({ text, type });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit Declaration & Check in the Database
  const handleFormSubmit = async (formData: any) => {
    setGlobalLoading(true);
    setGlobalMessage(null);

    try {
      // Build final API request matching standard Google Sheets parameters
      const params = new URLSearchParams({
        name: formData.fullname,
        gender: formData.gender,
        visitorDob: formData.visitorDob,
        cccd: formData.cccd,
        phone: formData.phone,
        relationship: formData.relationship,
        prisonerName: formData.prisonerName,
        prisonerDob: formData.prisonerDob,
        prisonerAddress: formData.prisonerAddress,
        date: formData.visitDate
      });

      // Query local full-stack Apps Script gateway
      const gatewayUrl = `/api/visit-gateway?${params.toString()}`;
      const response = await fetch(gatewayUrl, { method: "GET" });
      
      if (!response.ok) {
        throw new Error("Lỗi kết nối máy chủ gác cổng!");
      }

      const data = await response.json();

      if (data.result === "success" && data.data) {
        // Success - set active ticket
        setCurrentVisit(data.data);
        setScreen("ticket");
        showNotification("Thông tin khai báo hợp lệ. Đã duyệt số thứ tự vào cổng!", "success");
      } else if (data.result === "not_found") {
        showNotification(
          "Hệ thống gác cổng không tìm thấy can phạm nhân này trong danh sách được thăm đợt này. Vui lòng kiểm tra lại Họ tên và Ngày sinh phạm nhân!",
          "warning"
        );
      } else if (data.result === "disciplined") {
        showNotification(
          `Cảnh báo: Can phạm nhân đang thi hành hình phạt kỷ luật buồng giam. Hệ thống từ chối giải quyết thăm gặp đợt này! (${data.error || ""})`,
          "error"
        );
      } else {
        showNotification(data.error || "Hồ sơ không hợp lệ hoặc bị từ chối.", "error");
      }
    } catch (err: any) {
      showNotification(err.message || "Lỗi kết nối máy chủ gác.", "error");
    } finally {
      setGlobalLoading(false);
    }
  };

  // Administrative Authentication
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    if (pinCode === "113") {
      setShowPinModal(false);
      setPinCode("");
      setScreen("admin");
    } else {
      setPinError("Mã PIN cán bộ không chính xác (Thử lại hoặc dùng mã '113')");
    }
  };

  return (
    <div className="bg-slate-100 font-sans min-h-screen flex flex-col justify-between text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* HEADER SECTION */}
      <header className="bg-indigo-900 text-white shadow-xl relative overflow-hidden">
        {/* Subtle accent light pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl opacity-30 -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-10 -ml-10 -mb-10"></div>

        <div className="max-w-2xl mx-auto px-4 py-6 text-center flex flex-col items-center space-y-2 relative">
          <div className="space-y-1">
            <span className="block text-xs font-black tracking-widest text-indigo-200 uppercase">Bộ Công An</span>
            <span className="block text-sm md:text-base font-extrabold tracking-wider text-yellow-400 uppercase">Công an tỉnh Tây Ninh</span>
            <span className="block text-base md:text-lg font-black tracking-wide text-white uppercase">Trại Tạm giam số 1</span>
          </div>

          <div className="w-20 h-[1px] bg-indigo-500/50 my-1"></div>

          <h1 className="text-lg md:text-xl font-black tracking-tight uppercase">
            Hệ thống Đăng ký Thăm gặp Tự động
          </h1>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-lg border border-slate-200/80 relative overflow-hidden">
          
          {/* Top subtle visual strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-700 via-purple-600 to-emerald-500"></div>

          {/* GLOBAL STATUS MESSAGES */}
          {globalMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl text-xs font-semibold mb-5 text-center border ${
                globalMessage.type === "success"
                  ? "bg-green-50 text-green-800 border-green-100"
                  : globalMessage.type === "warning"
                  ? "bg-amber-50 text-amber-800 border-amber-100"
                  : globalMessage.type === "info"
                  ? "bg-blue-50 text-blue-800 border-blue-100"
                  : "bg-red-50 text-red-800 border-red-100"
              }`}
            >
              {globalMessage.text}
            </motion.div>
          )}

          {/* ACTIVE SCREEN TRANSITIONS */}
          <AnimatePresence mode="wait">
            {screen === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <VisitorForm
                  onSubmit={handleFormSubmit}
                  onShowRegulations={() => setScreen("regulations")}
                  onShowPrisoners={() => setScreen("prisoners")}
                  selectedPrisoner={selectedPrisoner}
                  clearSelectedPrisoner={() => setSelectedPrisoner(null)}
                  visitDate={visitDate}
                />
              </motion.div>
            )}

            {screen === "regulations" && (
              <motion.div
                key="regulations"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Regulations onBack={() => setScreen("form")} />
              </motion.div>
            )}

            {screen === "prisoners" && (
              <motion.div
                key="prisoners"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <PrisonerList
                  onBack={() => setScreen("form")}
                  onSelectPrisoner={(prisoner) => {
                    if (prisoner.status === "disciplined") {
                      showNotification(
                        `Không thể chọn: Can phạm nhân ${prisoner.name} đang bị kỷ luật dừng thăm gặp.`,
                        "error"
                      );
                      return;
                    }
                    setSelectedPrisoner(prisoner);
                    setScreen("form");
                  }}
                />
              </motion.div>
            )}

            {screen === "ticket" && currentVisit && (
              <motion.div
                key="ticket"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <TicketScreen
                  visit={currentVisit}
                  onReset={() => {
                    setCurrentVisit(null);
                    setSelectedPrisoner(null);
                    setScreen("form");
                    setGlobalMessage(null);
                  }}
                />
              </motion.div>
            )}

            {screen === "admin" && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <AdminPanel onExit={() => setScreen("form")} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* LOADING SPINNER COVERS */}
          {globalLoading && (
            <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-600">Đang kiểm tra đối chiếu hồ sơ cổng gác...</p>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER & ADMIN ACCESS */}
      <footer className="bg-slate-900 text-slate-500 text-center py-4 text-xs border-t border-slate-800 space-y-2">
        <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 Trại Tạm Giam Số 1 - Tất cả quyền được bảo lưu</p>
          
          <button
            id="btn-admin-entrance"
            onClick={() => setShowPinModal(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors py-1 px-3 bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700/60 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Khu vực Cán bộ</span>
          </button>
        </div>
      </footer>

      {/* PIN AUTH MODAL FOR STAFF ENTRANCE */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200 relative"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-3xl"></div>
            
            <h3 className="text-base font-bold text-slate-800 text-center flex items-center justify-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              Xác Minh Danh Tính Cán Bộ
            </h3>
            <p className="text-[11px] text-slate-400 text-center mt-1">
              Nhập mã PIN của bạn để truy cập Bảng quản lý gác (Mã PIN mặc định: <span className="font-bold text-indigo-600">113</span>)
            </p>

            <form onSubmit={handlePinSubmit} className="mt-5 space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • •"
                  className="w-full border-2 border-slate-200 rounded-xl py-3 px-4 text-center font-black tracking-[1em] text-lg focus:outline-none focus:border-indigo-600"
                />
              </div>

              {pinError && (
                <p className="text-[10px] font-bold text-red-600 text-center">{pinError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPinModal(false); setPinCode(""); setPinError(null); }}
                  className="flex-grow bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-3 rounded-xl text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs cursor-pointer shadow"
                >
                  Xác Nhận
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
