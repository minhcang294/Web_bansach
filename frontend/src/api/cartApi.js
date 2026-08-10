import axiosClient from "./authApi.js";

export const cartApi = {
  get: () => axiosClient.get("/cart"),
  add: (bookId, quantity = 1) => axiosClient.post("/cart", { bookId, quantity }),
  updateQuantity: (cartItemId, quantity) => axiosClient.put(`/cart/${cartItemId}`, { quantity }),
  remove: (cartItemId) => axiosClient.delete(`/cart/${cartItemId}`),
};
