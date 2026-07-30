import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { orderApi } from "../api/orderApi.js";
import { formatCurrency } from "../utils/formatCurrency.js";

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  // STATES THÔNG TIN CÁ NHÂN
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  
  // Phương thức thanh toán mặc định là COD
  const [paymentMethod] = useState("COD");

  // STATES ĐỊA CHỈ (COMBOBOX)
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [street, setStreet] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. TẢI DANH SÁCH TỈNH/THÀNH TỪ API MỞ
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("https://provinces.open-api.vn/api/?depth=3");
        const data = await res.json();
        setProvinces(data);
      } catch (err) {
        console.error("Lỗi tải API Tỉnh/Thành:", err);
      }
    };
    fetchProvinces();
  }, []);

  // 2. XỬ LÝ KHI CHỌN TỈNH -> LOAD QUẬN/HUYỆN
  const handleProvinceChange = (e) => {
    const pCode = e.target.value;
    setSelectedProvince(pCode);
    setSelectedDistrict("");
    setSelectedWard("");
    
    const p = provinces.find((prov) => prov.code == pCode);
    setDistricts(p ? p.districts : []);
    setWards([]);
  };

  // 3. XỬ LÝ KHI CHỌN QUẬN -> LOAD PHƯỜNG/XÃ
  const handleDistrictChange = (e) => {
    const dCode = e.target.value;
    setSelectedDistrict(dCode);
    setSelectedWard("");

    const d = districts.find((dist) => dist.code == dCode);
    setWards(d ? d.wards : []);
  };

  // 4. XỬ LÝ ĐẶT HÀNG
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !selectedProvince || !selectedDistrict || !selectedWard || !street) {
      setError("Vui lòng nhập đầy đủ thông tin giao hàng có dấu (*).");
      return;
    }

    setError("");
    setLoading(true);

    // Ghép chuỗi địa chỉ hoàn chỉnh
    const pName = provinces.find(p => p.code == selectedProvince)?.name || "";
    const dName = districts.find(d => d.code == selectedDistrict)?.name || "";
    const wName = wards.find(w => w.code == selectedWard)?.name || "";
    const fullAddress = `${street}, ${wName}, ${dName}, ${pName}`;

    // 🌟 ĐÓNG GÓI DỮ LIỆU ĐÚNG TÊN TRƯỜNG BACKEND ĐANG CẦN
    const orderPayload = {
      customerName: fullName,
      email: email,
      phoneNumber: phone,          // Sửa thành phoneNumber cho khớp Backend
      shippingAddress: fullAddress, // Sửa thành shippingAddress cho khớp Backend
      paymentMethod: paymentMethod,
      note: note
    };

    try {
      const res = await orderApi.create(orderPayload);
      await refreshCart();
      navigate(`/orders/${res.data.id}`, { state: { justPlaced: true } });
    } catch (err) {
      // Bắt lỗi chi tiết từ Backend nếu có
      const errorMessage = err.response?.data?.message || err.response?.data?.title || "Không thể đặt hàng. Vui lòng kiểm tra lại thông tin.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return <div className="container page-wrap"><div className="empty-state">Giỏ hàng trống, không có gì để thanh toán.</div></div>;
  }

  return (
    <div className="container page-wrap">
      <h2 className="section-title">Thanh toán</h2>

      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* ================= FORM THÔNG TIN GIAO HÀNG ================= */}
        <form className="card" style={{ flex: "1 1 500px", padding: 24 }} onSubmit={handleSubmit}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--wine-dark)", margin: "0 0 18px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
            1. Thông tin giao hàng
          </h3>

          <div style={{ display: "flex", gap: "15px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Họ và tên (*)</label>
              <input type="text" className="form-input" placeholder="Nguyễn Văn A" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Số điện thoại (*)</label>
              <input type="text" className="form-input" placeholder="0912345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <label className="form-label">Email (Để nhận hóa đơn)</label>
          <input type="email" className="form-input" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: "16px" }} />

          <label className="form-label">Khu vực giao hàng (*)</label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <select className="form-input" value={selectedProvince} onChange={handleProvinceChange} style={{ flex: 1, cursor: 'pointer' }}>
              <option value="">-- Chọn Tỉnh/Thành --</option>
              {provinces.map((p) => (<option key={p.code} value={p.code}>{p.name}</option>))}
            </select>

            <select className="form-input" value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} style={{ flex: 1, cursor: selectedProvince ? 'pointer' : 'not-allowed' }}>
              <option value="">-- Chọn Quận/Huyện --</option>
              {districts.map((d) => (<option key={d.code} value={d.code}>{d.name}</option>))}
            </select>

            <select className="form-input" value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict} style={{ flex: 1, cursor: selectedDistrict ? 'pointer' : 'not-allowed' }}>
              <option value="">-- Chọn Phường/Xã --</option>
              {wards.map((w) => (<option key={w.code} value={w.code}>{w.name}</option>))}
            </select>
          </div>

          <label className="form-label">Số nhà, tên đường (*)</label>
          <input type="text" className="form-input" placeholder="Ví dụ: 123 Đường ABC..." value={street} onChange={(e) => setStreet(e.target.value)} style={{ marginBottom: "16px" }} />

          <label className="form-label">Ghi chú đơn hàng (Tùy chọn)</label>
          <textarea className="form-input form-textarea" placeholder="Giao giờ hành chính, gọi trước khi giao..." value={note} onChange={(e) => setNote(e.target.value)} style={{ marginBottom: "24px", minHeight: "80px" }} />

          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--wine-dark)", margin: "0 0 18px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
            2. Phương thức thanh toán
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "2px solid #8b5cf6", borderRadius: "8px", backgroundColor: "#f5f3ff" }}>
              <input type="radio" name="payment" value="COD" checked={true} readOnly style={{ accentColor: "#8b5cf6", width: "18px", height: "18px" }} />
              <span style={{ fontWeight: "bold" }}>Thanh toán khi nhận hàng (COD)</span>
            </label>
          </div>

          {error && <p className="form-error" style={{ backgroundColor: "#fee2e2", color: "#dc2626", padding: "10px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ fontSize: "16px", padding: "14px" }}>
            {loading ? "Đang xử lý..." : `XÁC NHẬN ĐẶT HÀNG • ${formatCurrency(cart.totalAmount)}`}
          </button>
        </form>

        {/* ================= TÓM TẮT ĐƠN HÀNG BÊN PHẢI ================= */}
        <div className="card" style={{ flex: "1 1 320px", padding: 22, position: "sticky", top: "20px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--wine-dark)", margin: "0 0 16px" }}>Đơn hàng ({cart.totalQuantity} sản phẩm)</h3>
          
          <div style={{ maxHeight: "350px", overflowY: "auto", paddingRight: "5px", marginBottom: "15px" }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 15, color: "var(--text)", borderBottom: "1px dashed #eee", paddingBottom: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", maxWidth: "200px" }}>
                  <span style={{ fontWeight: 500, lineHeight: "1.4", marginBottom: "4px" }}>{item.title}</span>
                  <span style={{ color: "#888", fontSize: "12px" }}>SL: x{item.quantity}</span>
                </div>
                <span style={{ fontWeight: 600, color: "#e74c3c" }}>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: "#555", marginBottom: "10px" }}>
            <span>Tạm tính</span>
            <span>{formatCurrency(cart.totalAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: "#555", marginBottom: "15px" }}>
            <span>Phí vận chuyển</span>
            <span style={{ color: "#27ae60", fontWeight: "bold" }}>Miễn phí</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: "var(--wine-dark)", borderTop: "2px solid #eee", paddingTop: 16 }}>
            <span>Tổng cộng</span>
            <span style={{ color: "#e74c3c", fontSize: "22px" }}>{formatCurrency(cart.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}