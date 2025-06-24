<template>
  <AdminNavbar />

  <div class="container mt-5">
    <h2 class="mb-4">Keranjang Belanja</h2>

    <div v-if="cartItems.length === 0" class="text-center text-muted">
      <i class="bi bi-cart-x display-4"></i>
      <p class="mt-3">Keranjang Anda kosong</p>
    </div>

    <div v-else>
      <table class="table table-bordered align-middle text-center">
        <thead class="table-light">
          <tr>
            <th>No</th>
            <th>Nama Produk</th>
            <th>Jumlah</th>
            <th>Harga</th>
            <th>Total Harga</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in cartItems" :key="item.id">
            <td>{{ i + 1 }}</td>
            <td>{{ item.name }}</td>
            <td>
              <div class="d-flex justify-content-center align-items-center">
                <button
                  class="btn btn-sm btn-outline-secondary me-3"
                  :disabled="item.quantity <= 1"
                  @click="cart.updateQuantity(item.id, item.quantity - 1)"
                >
                  –
                </button>
                {{ item.quantity }}
                <button
                  class="btn btn-sm btn-outline-secondary ms-3"
                  :disabled="item.quantity >= item.stock"
                  @click="cart.updateQuantity(item.id, item.quantity + 1)"
                >
                  +
                </button>
              </div>
            </td>
            <td>Rp {{ item.price.toLocaleString() }}</td>
            <td>Rp {{ (item.price * item.quantity).toLocaleString() }}</td>
            <td>
              <button
                class="btn btn-sm btn-danger"
                @click="cart.removeItem(item.id)"
              >
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="table-info">
            <td colspan="4" class="text-end fw-bold">Total</td>
            <td class="fw-bold">Rp {{ cart.totalHarga.toLocaleString() }}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div class="text-end mt-3">
        <button class="btn btn-outline-danger me-2" @click="cart.clearCart">
          Kosongkan Keranjang
        </button>
        <button
          class="btn btn-success"
          @click="handleCheckout"
          :disabled="cartItems.length === 0"
        >
          Checkout
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AdminNavbar from "../components/AdminNavbar.vue";
import { useCartStore } from "../stores/CartStore";
import { onMounted } from "vue";
import axios from "axios";
import { useUserStore } from "../stores/UserStore";
import { useNotificationStore } from "../stores/NotificationStore";

export default {
  components: { AdminNavbar },
  name: "CartPage",
  setup() {
    const cart = useCartStore();

    onMounted(() => {
      cart.fetchCart(); // load dari backend
    });

    const handleCheckout = async () => {
      const userStore = useUserStore();
      const notif = useNotificationStore();

      try {
        const userId = userStore.id;
        const res = await axios.post("http://localhost:3001/api/checkout", {
          userId,
        });

        notif.show("success", res.data.message || "Checkout berhasil");

        await cart.fetchCart();
      } catch (err) {
        notif.show("error", err.response?.data?.error || "Checkout gagal");
      }
    };

    return {
      cart,
      cartItems: cart.items,
      handleCheckout,
    };
  },
  computed: {
    cartItems() {
      return this.cart.items;
    },
  },
};
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>
