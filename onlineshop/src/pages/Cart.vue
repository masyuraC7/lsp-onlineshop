<template>
  <AdminNavbar />
  <div class="container mt-5">
    <h2 class="mb-4">Keranjang Belanja</h2>
    <SimpleModal
      id="confirmDeleteModal"
      title="Konfirmasi Hapus"
      :visible="modalDeleteVisible"
      :buttons="modalDeleteButtons"
      @update:visible="modalDeleteVisible = $event"
      @button-click="handleDeleteModalButton"
    >
      <template #body>
        <div>
          {{
            deleteType === "item"
              ? "Hapus produk ini dari keranjang?"
              : "Kosongkan seluruh keranjang?"
          }}
        </div>
      </template>
    </SimpleModal>
    <SimpleModal
      id="confirmCheckoutModal"
      title="Konfirmasi Checkout"
      :visible="modalCheckoutVisible"
      :buttons="modalCheckoutButtons"
      @update:visible="modalCheckoutVisible = $event"
      @button-click="handleCheckoutModalButton"
    >
      <template #body>
        <div>
          Apakah Anda yakin ingin melakukan checkout semua produk di keranjang?
        </div>
      </template>
    </SimpleModal>
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
                @click="showDeleteModal('item', item.id)"
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
        <button
          class="btn btn-outline-danger me-2"
          @click="showDeleteModal('cart')"
        >
          Kosongkan Keranjang
        </button>
        <button
          class="btn btn-success"
          @click="showCheckoutModal"
          :disabled="cartItems.length === 0"
        >
          Checkout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import AdminNavbar from "../components/CustomerNavbar.vue";
import { useCartStore } from "../stores/CartStore";
import { onMounted, ref, computed } from "vue";
import axios from "axios";
import { useUserStore } from "../stores/UserStore";
import { useNotificationStore } from "../stores/NotificationStore";
import SimpleModal from "../components/SimpleModal.vue";
import { useRouter } from "vue-router";

const cart = useCartStore();
const modalDeleteVisible = ref(false);
const modalDeleteButtons = [
  { label: "Batal", class: "btn-secondary", dismiss: true },
  { label: "Ya, Hapus", class: "btn-danger", dismiss: true },
];
const deleteType = ref("item");
const deleteItemId = ref(null);
const notif = useNotificationStore();
const modalCheckoutVisible = ref(false);
const modalCheckoutButtons = [
  { label: "Batal", class: "btn-secondary", dismiss: true },
  { label: "Ya, Checkout", class: "btn-success", dismiss: true },
];
const router = useRouter();

onMounted(() => {
  cart.fetchCart();
});

const showDeleteModal = (type, id = null) => {
  deleteType.value = type;
  deleteItemId.value = id;
  modalDeleteVisible.value = true;
};

const handleDeleteModalButton = (btn) => {
  if (btn.label === "Ya, Hapus") {
    if (deleteType.value === "item" && deleteItemId.value) {
      cart.removeItem(deleteItemId.value);
    } else if (deleteType.value === "cart") {
      cart.clearCart();
    }
  }
};

const showCheckoutModal = () => {
  modalCheckoutVisible.value = true;
};
const handleCheckoutModalButton = (btn) => {
  if (btn.label === "Ya, Checkout") {
    handleCheckout();
  }
};

const handleCheckout = async () => {
  const userStore = useUserStore();
  try {
    const userId = userStore.id;
    const res = await axios.post("http://localhost:3001/api/cart/checkout", {
      userId,
    });
    notif.show("success", res.data.message || "Checkout berhasil");
    await cart.fetchCart();
    router.push("/olshopv1/transaction-history");
  } catch (err) {
    notif.show("error", err.response?.data?.error || "Checkout gagal");
  }
};

const cartItems = computed(() => cart.items);
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>
