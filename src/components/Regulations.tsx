import React from "react";
import { ShieldAlert, BookOpen, Clock, BadgeCheck, PhoneCall, Scale } from "lucide-react";
import { motion } from "motion/react";

interface RegulationsProps {
  onBack: () => void;
}

export default function Regulations({ onBack }: RegulationsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-full mb-3">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Nội Quy & Quy Định Thăm Gặp</h2>
        <p className="text-xs text-slate-500 mt-1">Trại Tạm giam số 1 - Công an tỉnh Tây Ninh</p>
      </div>

      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
        {/* Section 1 */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
            <Scale className="w-4 h-4" />
            <h3>1. Đối Tượng Được Phép Thăm Gặp</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thân nhân của người bị tạm giữ, người bị tạm giam đến thăm gặp phải là người trong gia đình bao gồm: 
            <strong> Cha, mẹ đẻ; cha, mẹ vợ (hoặc chồng); vợ hoặc chồng; con đẻ, con nuôi hợp pháp; anh, chị, em ruột; ông bà nội, ông bà ngoại</strong>.
          </p>
          <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 leading-relaxed">
            * Lưu ý: Mối quan hệ khai báo phải chính xác và tương ứng với Giới tính của người đi thăm theo đúng quy định pháp luật Việt Nam.
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
            <BadgeCheck className="w-4 h-4" />
            <h3>2. Giấy Tờ Khi Đến Cổng Gác</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Khi đến thăm gặp, thân nhân bắt buộc phải mang theo các giấy tờ bản gốc để đối chiếu:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
            <li>Thẻ Căn cước công dân (CCCD) hoặc Hộ chiếu còn hiệu lực.</li>
            <li>Giấy tờ chứng minh quan hệ (Giấy khai sinh, Đăng ký kết hôn, Sổ hộ khẩu cũ...).</li>
            <li><strong>Mã QR vé điện tử</strong> chứa số thứ tự hợp lệ đã đăng ký thành công trên hệ thống này.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <h3>3. Các Trường Hợp Bị Từ Chối Thăm Gặp</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hệ thống sẽ tự động từ chối hoặc cán bộ gác cổng sẽ từ chối giải quyết các trường hợp:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
            <li className="text-red-600 font-medium">Người bị tạm giữ, tạm giam đang bị kỷ luật buồng giam.</li>
            <li>Thân nhân không có giấy tờ tùy thân hoặc thông tin khai báo không trùng khớp.</li>
            <li>Người có dấu hiệu say rượu, bia, chất kích thích hoặc không chấp hành nội quy trại giam.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
            <Clock className="w-4 h-4" />
            <h3>4. Thời Gian & Quy Định Đồ Gửi</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            - Đồ tiếp tế (quà bánh, nhu yếu phẩm) gửi cho can phạm nhân phải nằm trong danh mục cho phép của Bộ Công An, cân nặng không vượt quá 3kg/lần và được kiểm tra nghiêm ngặt trước khi nhận.
          </p>
        </div>
      </div>

      <button
        id="btn-close-rules"
        onClick={onBack}
        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
      >
        Tôi Đã Hiểu - Quay Lại Đăng Ký
      </button>
    </motion.div>
  );
}
