import axiosClient from "./authApi.js";

export const bookApi = {
  // params: { keyword, categoryId, page, pageSize }
  getAll: (params = {}) => axiosClient.get("/books", { params }),
  getById: (id) => axiosClient.get(`/books/${id}`),
  getCategories: () => axiosClient.get("/categories"),

  // Admin
  create: (data) => axiosClient.post("/books", data),
  update: (id, data) => axiosClient.put(`/books/${id}`, data),
  remove: (id) => axiosClient.delete(`/books/${id}`),
};
