import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, BookOpen } from "lucide-react";
import { authApi } from "../api/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Trang đăng nhập - Website bán sách
 * Bảng màu: đỏ macaron (blush) + đỏ nhạt + kem ấm
 * Font: Playfair Display (display) + Quicksand (thân chữ)
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validate = () => {
    if (!email.trim()) return "Vui lòng nhập email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không đúng định dạng.";
    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data;

      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      login(user);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMsg("Email hoặc mật khẩu không đúng.");
      } else if (err.response?.status === 403) {
        setErrorMsg("Tài khoản đã bị khóa.");
      } else if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else if (err.code === "ERR_NETWORK") {
        setErrorMsg("Không thể kết nối tới máy chủ. Kiểm tra backend đã chạy chưa.");
      } else {
        setErrorMsg("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Quicksand:wght@400;500;600;700&display=swap');
        
        /* Hiệu ứng focus cho container bọc ngoài input */
        .macaron-input-container:focus-within { 
          border-color: #C97874 !important; 
          box-shadow: 0 0 0 3px rgba(201,120,116,0.15) !important; 
        }
        
        /* Ghi đè màu xanh tự động điền (autofill) của Chrome */
        .macaron-input:-webkit-autofill,
        .macaron-input:-webkit-autofill:hover, 
        .macaron-input:-webkit-autofill:focus, 
        .macaron-input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #FFF9F8 inset !important;
            -webkit-text-fill-color: #4A3230 !important;
            transition: background-color 5000s ease-in-out 0s;
        }

        .macaron-btn:hover:not(:disabled) { background: #C97874 !important; }
        .macaron-link:hover { color: #6E3335 !important; }
        .macaron-check:checked { accent-color: #C97874; }
      `}</style>

      <div style={styles.card}>
        {/* ===== Bên trái ===== */}
        <div style={styles.leftPanel}>
          <ScallopPattern />
          <div style={styles.brandRow}>
            <div style={styles.brandIcon}>
              <BookOpen size={20} color="#6E3335" strokeWidth={2} />
            </div>
            <span style={styles.brandName}>Hiệu Sách</span>
          </div>

          <div style={styles.illustrationWrap}>
            <BookIllustration />
          </div>

          <div>
            <h2 style={styles.leftHeading}>Mỗi trang sách,<br />một câu chuyện mới</h2>
            <p style={styles.leftSub}>
              Đăng nhập để tiếp tục hành trình đọc sách của bạn — lưu giỏ hàng,
              theo dõi đơn hàng và nhận gợi ý sách yêu thích.
            </p>
          </div>

          <div style={styles.dots}>
            <span style={{ ...styles.dot, opacity: 1 }} />
            <span style={{ ...styles.dot, opacity: 0.5 }} />
            <span style={{ ...styles.dot, opacity: 0.5 }} />
          </div>
        </div>

        {/* ===== Bên phải ===== */}
        <div style={styles.rightPanel}>
          <div style={styles.formWrap}>
            <h1 style={styles.title}>Đăng nhập</h1>
            <p style={styles.subtitle}>Chào mừng bạn quay lại hiệu sách của chúng tôi.</p>

            <form onSubmit={handleSubmit} noValidate>
              <label style={styles.label} htmlFor="email">Email</label>
              
              {/* Box Input Email sử dụng Flexbox */}
              <div className="macaron-input-container" style={styles.inputContainer}>
                <div style={styles.iconBox}>
                  <Mail size={17} color="#B0827E" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="ban@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="macaron-input"
                  style={styles.flexInput}
                  autoComplete="email"
                />
              </div>

              <label style={{ ...styles.label, marginTop: 18 }} htmlFor="password">Mật khẩu</label>
              
              {/* Box Input Mật khẩu sử dụng Flexbox (Mắt sẽ tự động bị đẩy qua phải) */}
              <div className="macaron-input-container" style={styles.inputContainer}>
                <div style={styles.iconBox}>
                  <Lock size={17} color="#B0827E" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="macaron-input"
                  style={styles.flexInput}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={styles.eyeBtnFlex}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={17} color="#B0827E" /> : <Eye size={17} color="#B0827E" />}
                </button>
              </div>

              <div style={styles.rowBetween}>
                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="macaron-check"
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxLabel}>Ghi nhớ đăng nhập</span>
                </label>
                <Link to="/forgot-password" style={{ color: '#3498db', textDecoration: 'none', fontSize: '14px' }}>
                 Quên mật khẩu?
                </Link>
              </div>

              {errorMsg && <p style={styles.errorText} role="alert">{errorMsg}</p>}

              <button
                type="submit"
                className="macaron-btn"
                style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <div style={styles.dividerRow}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>hoặc</span>
              <span style={styles.dividerLine} />
            </div>

            <button type="button" style={styles.googleBtn} disabled>
              <GoogleIcon />
              Đăng nhập với Google
            </button>

            <p style={styles.bottomText}>
              Chưa có tài khoản?{" "}
              <Link to="/register" className="macaron-link" style={styles.bottomLink}>Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Trang trí ---------- */
function ScallopPattern() {
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" style={styles.scallop} aria-hidden="true">
      <path
        d="M0,20 Q10,0 20,20 T40,20 T60,20 T80,20 T100,20 T120,20 T140,20 T160,20 T180,20 T200,20 T220,20 T240,20 T260,20 T280,20 T300,20 T320,20 T340,20 T360,20 T380,20 T400,20 L400,40 L0,40 Z"
        fill="rgba(255,255,255,0.14)"
      />
    </svg>
  );
}

function BookIllustration() {
  return (
    <svg viewBox="0 0 220 160" width="220" height="160" aria-hidden="true">
      <ellipse cx="110" cy="148" rx="85" ry="8" fill="rgba(110,51,53,0.12)" />
      <rect x="35" y="105" width="150" height="20" rx="3" fill="#F6DCDA" stroke="#6E3335" strokeWidth="1.5" />
      <rect x="45" y="85" width="130" height="20" rx="3" fill="#FFFFFF" stroke="#6E3335" strokeWidth="1.5" />
      <rect x="55" y="65" width="110" height="20" rx="3" fill="#E39691" stroke="#6E3335" strokeWidth="1.5" />
      <g transform="translate(110,40)">
        <path d="M-26,0 A26,18 0 0 1 0,-18 A26,18 0 0 1 26,0 A26,18 0 0 1 0,18 A26,18 0 0 1 -26,0 Z" fill="#F6DCDA" stroke="#6E3335" strokeWidth="1.5" />
        <ellipse cx="0" cy="0" rx="26" ry="5" fill="#C97874" />
        <path d="M-26,0 A26,18 0 0 0 0,18 A26,18 0 0 0 26,0" fill="none" stroke="#6E3335" strokeWidth="1.2" opacity="0.5" />
      </g>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#FBF3EF",
    fontFamily: "'Quicksand', sans-serif",
    padding: 24,
    boxSizing: "border-box",
  },
  card: {
    display: "flex",
    width: "100%",
    maxWidth: 880,
    minHeight: 560,
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(110,51,53,0.15)",
    flexWrap: "wrap",
  },
  leftPanel: {
    flex: "1 1 340px",
    minWidth: 300,
    background: "linear-gradient(160deg, #F3C9C6 0%, #E39691 55%, #D07E78 100%)",
    padding: "40px 40px 32px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    color: "#6E3335",
  },
  scallop: { position: "absolute", top: 0, left: 0, width: "100%", height: 40 },
  brandRow: { display: "flex", alignItems: "center", gap: 10 },
  brandIcon: {
    width: 36, height: 36, borderRadius: "50%",
    background: "rgba(255,255,255,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  brandName: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: "#5A2727" },
  illustrationWrap: { display: "flex", justifyContent: "center", margin: "16px 0" },
  leftHeading: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 24, lineHeight: 1.3, margin: "0 0 10px", color: "#4A1F1F" },
  leftSub: { fontSize: 14, lineHeight: 1.6, color: "#5A2727", margin: 0, maxWidth: 280 },
  dots: { display: "flex", gap: 6, marginTop: 20 },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "#6E3335", display: "inline-block" },

  rightPanel: {
    flex: "1 1 380px", minWidth: 300, background: "#FFFFFF",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 36px",
  },
  formWrap: { width: "100%", maxWidth: 340 },
  title: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 30, color: "#4A1F1F", margin: "0 0 6px" },
  subtitle: { fontSize: 14, color: "#9A7A78", margin: "0 0 28px" },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#6E3335", marginBottom: 6 },
  
  /* CẤU TRÚC FLEXBOX MỚI ĐẢM BẢO CHÍNH XÁC 100% VỊ TRÍ ICON */
  inputContainer: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: 44,
    borderRadius: 12,
    border: "1.5px solid #F0DAD8",
    background: "#FFF9F8",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
    overflow: "hidden", 
  },
  iconBox: {
    paddingLeft: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  flexInput: {
    flex: 1, /* Đẩy icon mắt sát qua mép phải */
    height: "100%",
    width: "100%",
    background: "transparent",
    border: "none",
    padding: "0 12px",
    fontSize: 14,
    fontFamily: "'Quicksand', sans-serif",
    color: "#4A3230",
    outline: "none",
  },
 eyeBtnFlex: {
  width: 42,
  height: "100%",
  flexShrink: 0,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  paddingRight: 20,
  paddingLeft: 0,
},
  
  rowBetween: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 22 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 7, cursor: "pointer" },
  checkbox: { width: 15, height: 15, cursor: "pointer" },
  checkboxLabel: { fontSize: 13, color: "#6E3335" },
  forgotLink: { fontSize: 13, color: "#C97874", textDecoration: "none", fontWeight: 600 },
  errorText: {
    fontSize: 13, color: "#A32D2D", background: "#FCEBEB",
    border: "1px solid #F0DAD8", borderRadius: 10, padding: "8px 12px", margin: "0 0 16px",
  },
  submitBtn: {
    width: "100%", height: 46, borderRadius: 12, border: "none",
    background: "#D88883", color: "#FFFFFF", fontSize: 15, fontWeight: 700,
    fontFamily: "'Quicksand', sans-serif", transition: "background 0.15s",
  },
  dividerRow: { display: "flex", alignItems: "center", gap: 10, margin: "22px 0" },
  dividerLine: { flex: 1, height: 1, background: "#F0DAD8" },
  dividerText: { fontSize: 12, color: "#B79693" },
  googleBtn: {
    width: "100%", height: 44, borderRadius: 12, border: "1.5px solid #F0DAD8",
    background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, fontSize: 14, fontWeight: 600, color: "#6E3335",
    fontFamily: "'Quicksand', sans-serif", cursor: "not-allowed", opacity: 0.6,
  },
  bottomText: { textAlign: "center", fontSize: 13, color: "#9A7A78", marginTop: 22 },
  bottomLink: { color: "#C97874", fontWeight: 700, textDecoration: "none" },
  testHint: { textAlign: "center", fontSize: 11, color: "#C7ABA8", marginTop: 14 },
};