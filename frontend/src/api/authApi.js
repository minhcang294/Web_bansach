import axios from "axios";

// Đổi cổng theo backend thực tế (xem launchSettings.json của BookStore.API, thường là 5000/5001)
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:5001/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Tự động đính JWT token vào mọi request nếu đã đăng nhập
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token hết hạn (401) -> tự động đăng xuất
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
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

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: () => !!localStorage.getItem("accessToken"),
};

export default axiosClient;
