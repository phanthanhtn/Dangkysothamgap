import React, { useState, useEffect } from "react";
import { Search, RotateCw, CheckCircle, AlertTriangle, User, Calendar } from "lucide-react";
import { Prisoner } from "../types";
import { motion } from "motion/react";

interface PrisonerListProps {
  onBack: () => void;
  onSelectPrisoner?: (prisoner: Prisoner) => void;
}

export default function PrisonerList({ onBack, onSelectPrisoner }: PrisonerListProps) {
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/prisoners");
      if (!response.ok) {
        throw new Error("Lỗi khi kết nối đến cơ sở dữ liệu trại giam");
      }
      const data = await response.json();
      setPrisoners(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredPrisoners = prisoners.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dob.includes(searchTerm)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-emerald-700 rounded-full mb-3">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Danh Sách Người Được Thăm Gặp</h2>
        <p className="text-xs text-slate-500 mt-1">Tra cứu nhanh khả năng nhận cuộc thăm đợt này</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-prisoner-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Tên hoặc Ngày sinh (VD: NGUYÊN hoặc 12-05)..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
          />
        </div>
        <button
          onClick={fetchList}
          className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors flex items-center justify-center cursor-pointer"
          title="Tải lại danh sách"
        >
          <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Đang tải danh sách can phạm nhân trực tiếp...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center text-red-700 space-y-2">
          <p className="text-xs font-semibold">{error}</p>
          <button
            onClick={fetchList}
            className="text-[11px] bg-red-100 hover:bg-red-200 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Thử Lại
          </button>
        </div>
      ) : (
        <div className="border border-slate-150 rounded-xl overflow-hidden bg-white max-h-[280px] overflow-y-auto shadow-inner">
          {filteredPrisoners.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              Không tìm thấy can phạm nhân nào trùng khớp.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPrisoners.map((prisoner) => (
                <div
                  key={prisoner.id}
                  onClick={() => {
                    if (onSelectPrisoner) {
                      onSelectPrisoner(prisoner);
                    }
                  }}
                  className={`p-3.5 flex items-center justify-between transition-colors text-left ${
                    onSelectPrisoner ? "hover:bg-emerald-50/50 cursor-pointer" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-sm tracking-wide uppercase">
                      {prisoner.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ngày sinh: {prisoner.dob}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {prisoner.status === "active" ? (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-green-100">
                        <CheckCircle className="w-3 h-3" />
                        Được gặp
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-100"
                        title={prisoner.reason}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Kỷ luật
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {onSelectPrisoner && (
        <p className="text-[11px] text-center text-slate-400 italic">
          * Mẹo: Click trực tiếp vào tên can phạm nhân để tự động điền vào tờ khai.
        </p>
      )}

      <button
        onClick={onBack}
        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
      >
        Quay Lại Tờ Khai
      </button>
    </motion.div>
  );
}
