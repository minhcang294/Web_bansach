import axiosClient from "./authApi.js";

export const orderApi = {
  create: (shippingAddress, phoneNumber) =>
    axiosClient.post("/orders", { shippingAddress, phoneNumber }),
  getMyOrders: () => axiosClient.get("/orders"),
  getById: (id) => axiosClient.get(`/orders/${id}`),
};
