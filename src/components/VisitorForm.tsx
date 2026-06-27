import React, { useState, useEffect } from "react";
import { User, Shield, Phone, FileText, MapPin, Calendar, Users, Eye, HelpCircle, ArrowRight } from "lucide-react";
import { Prisoner } from "../types";
import { motion } from "motion/react";

interface VisitorFormProps {
  onSubmit: (formData: any) => void;
  onShowRegulations: () => void;
  onShowPrisoners: () => void;
  selectedPrisoner: Prisoner | null;
  clearSelectedPrisoner: () => void;
  visitDate: string;
}

export default function VisitorForm({
  onSubmit,
  onShowRegulations,
  onShowPrisoners,
  selectedPrisoner,
  clearSelectedPrisoner,
  visitDate,
}: VisitorFormProps) {
  const [fullname, setFullname] = useState("");
  const [gender, setGender] = useState("");
  const [relationship, setRelationship] = useState("");
  const [visitorDob, setVisitorDob] = useState("");
  const [cccd, setCccd] = useState("");
  const [phone, setPhone] = useState("");

  const [prisonerName, setPrisonerName] = useState("");
  const [prisonerDob, setPrisonerDob] = useState("");
  const [prisonerAddress, setPrisonerAddress] = useState("");

  const [error, setError] = useState<string | null>(null);

  // Sync selected prisoner from sidebar or picker
  useEffect(() => {
    if (selectedPrisoner) {
      setPrisonerName(selectedPrisoner.name);
      setPrisonerDob(selectedPrisoner.dob);
      setPrisonerAddress(selectedPrisoner.address);
    }
  }, [selectedPrisoner]);

  // Handle dynamic dropdown options based on selected gender (Vietnamese matching)
  const getRelationshipOptions = () => {
    if (gender === "Nam") {
      return ["Cha", "Anh ruột", "Em ruột", "Con ruột", "Ông nội", "Ông ngoại"];
    } else if (gender === "Nữ") {
      return ["Mẹ", "Chị ruột", "Em ruột", "Con ruột", "Bà nội", "Bà ngoại"];
    }
    return [];
  };

  // Safe and robust date input mask (DD-MM-YYYY)
  const handleDateMask = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);

    let formatted = "";
    if (value.length > 0) {
      formatted += value.slice(0, 2);
      if (value.length > 2) {
        formatted += "-" + value.slice(2, 4);
        if (value.length > 4) {
          formatted += "-" + value.slice(4, 8);
        }
      }
    }
    setter(formatted);
  };

  const validateDate = (dateStr: string): boolean => {
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (!regex.test(dateStr)) return false;
    const parts = dateStr.split("-");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) return false;
    if (month < 1 || month > 12) return false;

    const daysInMonth = [
      31,
      year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
    if (day < 1 || day > daysInMonth[month - 1]) return false;
    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate empty fields
    if (
      !fullname.trim() ||
      !gender ||
      !relationship ||
      !visitorDob ||
      !cccd.trim() ||
      !phone.trim() ||
      !prisonerName.trim() ||
      !prisonerDob ||
      !prisonerAddress.trim()
    ) {
      setError("Vui lòng khai báo đầy đủ tất cả các thông tin có dấu đỏ (*)");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Full name letters validation
    const vietnameseLettersRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠƯưăâêôơưẤẤẦẦẨẨẪẪẬẬẮẮẰẰẲẲẴẴẬẬẾẾỀỀỂỂỄỄỆỆỐỐỒỒỔỔỖỖỘỘỚỚỜỜỞỞỠỠỢỢỨỨỪỪỬỬỮỮỰỰýỳỷỹ\s]+$/;
    if (!vietnameseLettersRegex.test(fullname.trim()) || !vietnameseLettersRegex.test(prisonerName.trim())) {
      setError("Họ và tên bắt buộc phải là ký tự chữ tiếng Việt hợp lệ");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // CCCD (12-digit) validation
    if (!/^\d{12}$/.test(cccd.trim())) {
      setError("Số CCCD người thăm phải đúng định dạng 12 số nguyên liên tiếp");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Phone number validation (Standard Vietnam mobile layout)
    const normalizedPhone = phone.replace(/\s+/g, "");
    if (!/^(03|05|07|08|09)\d{8}$/.test(normalizedPhone)) {
      setError("Số điện thoại không đúng định dạng mạng viễn thông Việt Nam (10 số, bắt đầu bằng 03/05/07/08/09)");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Birth dates validation
    if (!validateDate(visitorDob)) {
      setError("Ngày sinh người đi thăm không hợp lệ hoặc sai định dạng dd-mm-yyyy");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!validateDate(prisonerDob)) {
      setError("Ngày sinh can phạm nhân không hợp lệ hoặc sai định dạng dd-mm-yyyy");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Success - trigger parent callback
    onSubmit({
      fullname: fullname.trim().toUpperCase(),
      gender,
      relationship,
      visitorDob,
      cccd: cccd.trim(),
      phone: normalizedPhone,
      prisonerName: prisonerName.trim().toUpperCase(),
      prisonerDob,
      prisonerAddress: prisonerAddress.trim(),
      visitDate,
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Khai Báo Thông Tin Thăm Gặp</h2>
        <p className="text-xs text-slate-500 mt-1">Vui lòng cung cấp thông tin trung thực để hệ thống duyệt số thứ tự.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onShowRegulations}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          Nội Quy Quy Định
        </button>
        <button
          type="button"
          onClick={onShowPrisoners}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          <Users className="w-4 h-4" />
          Xem can phạm nhân
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-xs font-semibold text-red-700"
        >
          {error}
        </motion.div>
      )}

      {selectedPrisoner && (
        <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center justify-between">
          <div className="text-xs text-emerald-800">
            <span className="font-bold">Đã chọn:</span> {selectedPrisoner.name} ({selectedPrisoner.dob})
          </div>
          <button
            type="button"
            onClick={clearSelectedPrisoner}
            className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-2 py-1 rounded transition-colors cursor-pointer"
          >
            Thay đổi
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* SECTION 1: VISITOR */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">I. Thông Tin Người Đi Thăm</h3>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Họ và tên người thăm <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value.toUpperCase())}
                placeholder="NHẬP HỌ TÊN ĐẦY ĐỦ (Ví dụ: NGUYỄN VĂN A)"
                className="w-full pl-9 pr-3 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setRelationship(""); // Clear previous invalid relationship
                }}
                className="w-full mt-1 border border-slate-250 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                <option value="">-- Chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Mối quan hệ <span className="text-red-500">*</span>
              </label>
              <select
                disabled={!gender}
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className={`w-full mt-1 border border-slate-250 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium ${
                  !gender ? "bg-slate-100 cursor-not-allowed opacity-60" : ""
                }`}
              >
                <option value="">{gender ? "-- Chọn quan hệ --" : "-- Chọn giới tính trước --"}</option>
                {getRelationshipOptions().map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={10}
                  value={visitorDob}
                  onChange={(e) => handleDateMask(e, setVisitorDob)}
                  placeholder="DD-MM-YYYY"
                  className="w-full pl-9 pr-3 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Số CCCD (12 số) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={12}
                  value={cccd}
                  onChange={(e) => setCccd(e.target.value.replace(/\D/g, ""))}
                  placeholder="12 chữ số"
                  className="w-full pl-9 pr-3 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Số điện thoại liên hệ <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="Ví dụ: 0912345678"
                className="w-full pl-9 pr-3 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRISONER */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600"></div>
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              II. Can Phạm Nhân Muốn Thăm Gặp
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Họ và tên can phạm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={prisonerName}
                onChange={(e) => {
                  if (selectedPrisoner) clearSelectedPrisoner();
                  setPrisonerName(e.target.value.toUpperCase());
                }}
                placeholder="NHẬP HỌ TÊN"
                className="w-full mt-1 border border-slate-250 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                value={prisonerDob}
                onChange={(e) => {
                  if (selectedPrisoner) clearSelectedPrisoner();
                  handleDateMask(e, setPrisonerDob);
                }}
                placeholder="DD-MM-YYYY"
                className="w-full mt-1 border border-slate-250 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Hộ khẩu thường trú <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={prisonerAddress}
                onChange={(e) => {
                  if (selectedPrisoner) clearSelectedPrisoner();
                  setPrisonerAddress(e.target.value);
                }}
                placeholder="Nhập địa chỉ cư trú chính xác"
                className="w-full pl-9 pr-3 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* VISITING DATE */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600"></div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Ngày Hẹn Gặp Đợt Này
          </label>
          <div className="relative mt-1.5">
            <Calendar className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              value={`${visitDate} (Ngày thăm gặp định kỳ)`}
              className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-rose-700 bg-rose-50/50 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <button
        id="btn-register"
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Xác Nhận & Kiểm Tra Trên Hệ Thống</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
