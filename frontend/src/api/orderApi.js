import axiosClient from "./authApi.js";

export const orderApi = {
  // ==========================================
  // API DÀNH CHO KHÁCH HÀNG
  // ==========================================
  
  // 🌟 ĐÃ SỬA: Thay vì nhận từng biến lẻ, bây giờ nhận toàn bộ object (payload) từ CheckoutPage
  create: (payload) => 
    axiosClient.post("/orders", payload),
    
  getMyOrders: () => 
    axiosClient.get("/orders"),
    
  getById: (id) => 
    axiosClient.get(`/orders/${id}`),

  // ==========================================
  // API DÀNH CHO NHÂN VIÊN & ADMIN (STAFF DASHBOARD)
  // ==========================================
  
  // 1. Lấy số liệu thống kê KPI 4 thẻ đầu trang
  getStaffStats: () => 
    axiosClient.get("/orders/staff-stats"),

  // 2. Lấy danh sách đơn hàng có hỗ trợ tìm kiếm và lọc trạng thái
  getRecentOrders: (search = "", status = "Tất cả") => {
    let url = "/orders/recent?";
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (status && status !== "Tất cả") url += `status=${encodeURIComponent(status)}`;
    return axiosClient.get(url);
  },

  // 3. Lấy toàn bộ danh sách hóa đơn
  getAllOrders: () => 
    axiosClient.get("/orders/all"),

  // 4. Cập nhật trạng thái đơn hàng (Duyệt đơn, Đang giao, Hoàn tất, Hủy) kèm gửi Email tự động
  updateStatus: (id, status) => 
    axiosClient.put(`/orders/${id}/status`, { status }),
};