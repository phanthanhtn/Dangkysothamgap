import React, { useState, useEffect, useRef } from "react";
import { Download, RefreshCw, CheckCircle, ShieldCheck, Phone, Calendar, User, FileText, Share2 } from "lucide-react";
import { Visit } from "../types";
import QRCode from "qrcode";
import { motion } from "motion/react";

interface TicketScreenProps {
  visit: Visit;
  onReset: () => void;
}

export default function TicketScreen({ visit, onReset }: TicketScreenProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate safe client-side QR Code URL
  useEffect(() => {
    const generateQr = async () => {
      try {
        const qrContent = `STT:${visit.stt}|CCCD:${visit.visitorCccd}|NAME:${visit.visitorName}|PRISONER:${visit.prisonerName}`;
        const url = await QRCode.toDataURL(qrContent, {
          width: 200,
          margin: 1,
          color: {
            dark: "#1e1b4b", // deep indigo
            light: "#ffffff",
          },
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error("QR Code generation failed:", err);
      }
    };
    generateQr();
  }, [visit]);

  // High-Resolution Export Engine
  const downloadTicketImage = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Settings for a high-quality 800x1100 print-quality image (High-DPI)
        canvas.width = 800;
        canvas.height = 1100;

        // 1. Background clean off-white
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Main Border Frame
        ctx.strokeStyle = "#4338ca"; // Indigo-700
        ctx.lineWidth = 12;
        ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

        // Inner light border line
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

        // 3. Header Banner
        ctx.fillStyle = "#312e81"; // Deep Indigo
        ctx.fillRect(32, 32, canvas.width - 64, 210);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("BỘ CÔNG AN - CÔNG AN TỈNH TÂY NINH", canvas.width / 2, 75);

        ctx.font = "bold 28px sans-serif";
        ctx.fillText("TRẠI TẠM GIAM SỐ 1 - TÂY NINH", canvas.width / 2, 115);

        ctx.fillStyle = "#fbbf24"; // Amber-400
        ctx.font = "bold 24px sans-serif";
        ctx.fillText("VÉ ĐĂNG KÝ THĂM GẶP CAN PHẠM NHÂN", canvas.width / 2, 165);

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "14px sans-serif";
        ctx.fillText("Hệ thống khai báo tự động • Phê duyệt trực tuyến", canvas.width / 2, 200);

        // 4. Ticket Content section
        // STT Box background
        ctx.fillStyle = "#e0e7ff"; // Indigo-100
        ctx.fillRect(250, 260, 300, 150);
        ctx.strokeStyle = "#4338ca";
        ctx.lineWidth = 3;
        ctx.strokeRect(250, 260, 300, 150);

        ctx.fillStyle = "#1e1b4b";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText("SỐ THỨ TỰ VÀO CỔNG", canvas.width / 2, 290);

        ctx.fillStyle = "#4338ca";
        ctx.font = "black bold 80px sans-serif";
        ctx.fillText(visit.stt, canvas.width / 2, 370);

        // Ticket perforation line
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        ctx.moveTo(50, 440);
        ctx.lineTo(750, 440);
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // 5. Visitor details left-aligned
        ctx.fillStyle = "#1e293b"; // Slate-800
        ctx.font = "bold 22px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("I. THÔNG TIN NGƯỜI ĐI THĂM", 70, 490);

        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Họ tên người thăm:", 70, 530);
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(visit.visitorName, 260, 530);

        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Giới tính:", 70, 565);
        ctx.fillStyle = "#0f172a";
        ctx.fillText(visit.visitorGender, 260, 565);

        ctx.fillStyle = "#475569";
        ctx.fillText("Ngày sinh:", 70, 600);
        ctx.fillStyle = "#0f172a";
        ctx.fillText(visit.visitorDob, 260, 600);

        ctx.fillStyle = "#475569";
        ctx.fillText("Số CCCD (12 số):", 70, 635);
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(visit.visitorCccd, 260, 635);

        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Mối quan hệ:", 70, 670);
        ctx.fillStyle = "#4338ca";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(visit.relationship, 260, 670);

        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Điện thoại liên hệ:", 70, 705);
        ctx.fillStyle = "#0f172a";
        ctx.fillText(visit.visitorPhone, 260, 705);

        // Divider
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(70, 730);
        ctx.lineTo(730, 730);
        ctx.stroke();

        // Prisoner Details
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("II. THÔNG TIN PHẠM NHÂN", 70, 770);

        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Can phạm nhân:", 70, 810);
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(visit.prisonerName, 260, 810);

        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Ngày sinh can phạm:", 70, 845);
        ctx.fillStyle = "#0f172a";
        ctx.fillText(visit.prisonerDob, 260, 845);

        ctx.font = "18px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText("Ngày hẹn gặp:", 70, 880);
        ctx.fillStyle = "#dc2626"; // Red-600
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(`${visit.visitDate} (Đúng hẹn)`, 260, 880);

        // Draw QR code image on Canvas if loaded
        if (qrCodeUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 570, 480, 160, 160);

            // 6. Security Footer Stamp
            ctx.fillStyle = "#1e293b";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("TRẠI TẠM GIAM SỐ 1 - HỆ THỐNG PHÊ DUYỆT TỰ ĐỘNG", canvas.width / 2, 980);

            ctx.font = "italic 11px sans-serif";
            ctx.fillStyle = "#64748b";
            ctx.fillText("Chú ý: Vui lòng lưu trữ ảnh này trong điện thoại và xuất trình cùng CCCD gốc tại cổng gác.", canvas.width / 2, 1010);
            ctx.fillText(`Mã giao dịch điện tử: ${visit.id} - Ngày tạo: ${new Date(visit.createdAt).toLocaleDateString("vi-VN")}`, canvas.width / 2, 1030);

            // Trigger the download immediately
            const dlLink = document.createElement("a");
            dlLink.download = `VE_THAM_GAP_STT_${visit.stt}_${visit.visitorName.replace(/\s+/g, "_")}.png`;
            dlLink.href = canvas.toDataURL("image/png");
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
            setIsGenerating(false);
          };
          img.src = qrCodeUrl;
        } else {
          setIsGenerating(false);
        }
      } catch (err) {
        console.error("Export canvas error:", err);
        setIsGenerating(false);
      }
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-2.5 bg-green-50 text-green-700 rounded-full border border-green-100">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Đăng Ký Thành Công</h2>
        <p className="text-xs text-slate-500 font-medium">Hệ thống đã xác thực thông tin và cấp số tự động</p>
      </div>

      {/* TICKET WRAPPER */}
      <div
        id="print-ticket"
        className="border-2 border-indigo-600 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white shadow-xl overflow-hidden relative"
      >
        {/* Ticket Header */}
        <div className="bg-indigo-900 text-white p-4 text-center space-y-1">
          <p className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">Trại Tạm giam số 1 - Tây Ninh</p>
          <p className="text-sm font-black uppercase tracking-wider">Vé Vào Cửa Thăm Gặp</p>
        </div>

        {/* Big STT display */}
        <div className="p-6 text-center border-b border-dashed border-slate-200 relative">
          {/* Half circles on edges to resemble ticket punches */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-100 border-r border-dashed border-slate-200 rounded-r-full"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-100 border-l border-dashed border-slate-200 rounded-l-full"></div>

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Số thứ tự của bạn</p>
          <div className="text-6xl font-black text-indigo-700 tracking-wider mt-1">{visit.stt}</div>
          <p className="text-[10px] text-indigo-500 font-bold mt-2 bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-100">
            Hãy xuất trình mã này tại bàn soát vé
          </p>
        </div>

        {/* Ticket Body Content */}
        <div className="p-5 space-y-4 text-xs text-slate-600 bg-white">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center gap-1.5 uppercase tracking-wide">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Thân nhân đi thăm
            </h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div>
                <span className="text-slate-400">Họ và tên:</span>
                <p className="font-bold text-slate-800">{visit.visitorName}</p>
              </div>
              <div>
                <span className="text-slate-400">Mối quan hệ:</span>
                <p className="font-bold text-indigo-700">{visit.relationship}</p>
              </div>
              <div>
                <span className="text-slate-400">Số CCCD:</span>
                <p className="font-semibold text-slate-800">{visit.visitorCccd}</p>
              </div>
              <div>
                <span className="text-slate-400">Điện thoại:</span>
                <p className="font-medium text-slate-800">{visit.visitorPhone}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Can phạm nhân gặp mặt
            </h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div>
                <span className="text-slate-400">Họ tên can phạm:</span>
                <p className="font-bold text-slate-800">{visit.prisonerName}</p>
              </div>
              <div>
                <span className="text-slate-400">Ngày sinh:</span>
                <p className="font-medium text-slate-800">{visit.prisonerDob}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Ngày giờ thăm gặp:</span>
                <p className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 inline-block">
                  Đợt ngày {visit.visitDate}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive client-side QR code */}
          <div className="flex flex-col items-center justify-center pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 shadow-inner flex items-center justify-center w-40 h-40">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Hệ thống gác cổng quét QR tự động đối chiếu CCCD</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3 pt-2">
        <button
          id="btn-download"
          onClick={downloadTicketImage}
          disabled={isGenerating}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang kết xuất ảnh chất lượng cao...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Tải Ảnh Vé Về Điện Thoại (Sắc nét)</span>
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
        >
          <span>Đăng ký lượt thăm khác</span>
        </button>
      </div>

      {/* Hidden Canvas for High-Quality Export */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
