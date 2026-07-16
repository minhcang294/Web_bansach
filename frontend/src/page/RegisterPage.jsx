import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, BookOpen } from "lucide-react";
import { authApi } from "../api/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validate = () => {
    if (!fullName.trim()) return "Vui lòng nhập họ tên.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không đúng định dạng.";
    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
    if (password !== confirmPassword) return "Mật khẩu nhập lại không khớp.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setErrorMsg(err); return; }

    setErrorMsg("");
    setLoading(true);
    try {
      const res = await authApi.register(fullName, email, password);
      const { token, user } = res.data;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      login(user);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 409) setErrorMsg("Email này đã được sử dụng.");
      else if (err.response?.data?.message) setErrorMsg(err.response.data.message);
      else setErrorMsg("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: "36px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span className="brand-icon"><BookOpen size={18} /></span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--wine-dark)" }}>Hiệu Sách</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--wine-dark)", margin: "10px 0 4px" }}>Tạo tài khoản</h1>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 24px" }}>Đăng ký để bắt đầu mua sắm tại Hiệu Sách.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="form-label">Họ và tên</label>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <User size={16} style={iconStyle} />
            <input className="form-input" style={{ paddingLeft: 38 }} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
          </div>

          <label className="form-label">Email</label>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <Mail size={16} style={iconStyle} />
            <input className="form-input" style={{ paddingLeft: 38 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@email.com" />
          </div>

          <label className="form-label">Mật khẩu</label>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <Lock size={16} style={iconStyle} />
            <input className="form-input" style={{ paddingLeft: 38 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ít nhất 6 ký tự" />
          </div>

          <label className="form-label">Nhập lại mật khẩu</label>
          <div style={{ position: "relative", marginBottom: 18 }}>
            <Lock size={16} style={iconStyle} />
            <input className="form-input" style={{ paddingLeft: 38 }} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu" />
          </div>

          {errorMsg && <p className="form-error">{errorMsg}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 20 }}>
          Đã có tài khoản?{" "}
          <Link to="/login" style={{ color: "var(--macaron-deep)", fontWeight: 700 }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "calc(100vh - 140px)", display: "flex", alignItems: "center",
  justifyContent: "center", padding: 24,
};
const iconStyle = { position: "absolute", left: 13, top: 14, color: "#B0827E" };
