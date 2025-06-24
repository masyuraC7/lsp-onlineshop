import { defineStore } from "pinia";
import axios from "axios";
import { useUserStore } from "./UserStore";
import { useNotificationStore } from "./NotificationStore";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [],
  }),
  getters: {
    totalHarga: (state) =>
      state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
  },
  actions: {
    async fetchCart() {
      const userStore = useUserStore();
      try {
        const res = await axios.get(
          `http://localhost:3001/api/cart/${userStore.id}`
        );
        this.items = res.data;
      } catch (error) {
        console.error("Gagal mengambil keranjang:", error);
      }
    },
    async removeItem(cartId) {
      const notificationStore = useNotificationStore();

      try {
        await axios.delete(`http://localhost:3001/api/cart/${cartId}`);
        this.items = this.items.filter((item) => item.id !== cartId);

        notificationStore.show("success", "Item berhasil dihapus");
      } catch (err) {
        notificationStore.show("error", "Gagal menghapus item");
      }
    },
    async clearCart() {
      const userStore = useUserStore();
      const notificationStore = useNotificationStore();

      try {
        await axios.delete(
          `http://localhost:3001/api/cart/clear/${userStore.id}`
        );
        this.items = [];

        notificationStore.show("success", "Keranjang dikosongkan");
      } catch (err) {
        notificationStore.show("error", "Gagal mengosongkan keranjang");
      }
    },
    async updateQuantity(cartId, newQuantity) {
      try {
        await axios.put(`http://localhost:3001/api/cart/${cartId}`, {
          quantity: newQuantity,
        });

        const item = this.items.find((i) => i.id === cartId);
        if (item) item.quantity = newQuantity;
      } catch (err) {
        console.error("Gagal mengubah jumlah:", err);
      }
    },
  },
});
