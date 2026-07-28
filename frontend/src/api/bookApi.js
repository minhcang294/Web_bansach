import axiosClient from "./authApi.js"; // Giữ nguyên import của bạn

export const bookApi = {
  // params: { keyword, categoryId, page, pageSize }
  getAll: (params = {}) => axiosClient.get("/books", { params }),
  getById: (id) => axiosClient.get(`/books/${id}`),
  getCategories: () => axiosClient.get("/categories"),

  // ==================================================
  // THÊM HÀM TÌM KIẾM (Dành cho SearchPage)
  // ==================================================
  searchBooks: (keyword) => axiosClient.get(`/books/search?keyword=${keyword}`),

  // Admin
  create: (data) => axiosClient.post("/books", data),
  update: (id, data) => axiosClient.put(`/books/${id}`, data),
  remove: (id) => axiosClient.delete(`/books/${id}`),
};