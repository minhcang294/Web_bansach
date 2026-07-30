import axios from "axios";

// LƯU Ý: Hãy đảm bảo port API khớp với Backend của bạn (Mặc định 5000)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ⚡ Bọc thép: Tự động quét cả "accessToken" hoặc "token" để tránh tuyệt đối lỗi 401 do lệch tên
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token hết hạn hoặc không hợp lệ (401) -> tự động dọn dẹp LocalStorage
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  // Khớp với AuthController.cs -> [HttpPost("login")]
  login: (email, password) =>
    axiosClient.post("/auth/login", { email, password }),

  // Khớp với AuthController.cs -> [HttpPost("register")]
  register: (fullName, email, password) =>
    axiosClient.post("/auth/register", { fullName, email, password }),

  // Khớp với AuthController.cs -> [HttpPost("google-login")]
  googleLogin: (tokenId) =>
    axiosClient.post("/auth/google-login", { TokenId: tokenId }),

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: () => !!localStorage.getItem("accessToken") || !!localStorage.getItem("token"),
};

export default axiosClient;