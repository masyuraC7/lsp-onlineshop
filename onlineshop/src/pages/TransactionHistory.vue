<template>
  <AdminNavbar />

  <div class="container mt-5">
    <h2 class="mb-4">Riwayat Transaksi</h2>

    <div v-if="transactions.length === 0" class="text-center text-muted">
      <i class="bi bi-receipt display-4"></i>
      <p class="mt-3">Belum ada transaksi.</p>
    </div>

    <div v-else>
      <table class="table table-bordered align-middle text-center">
        <thead class="table-light">
          <tr>
            <th>No</th>
            <th>ID Transaksi</th>
            <th>Total</th>
            <th>Status</th>
            <th>Metode</th>
            <th>Order ID</th>
            <th>Tanggal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tx, i) in transactions" :key="tx.id">
            <td>{{ i + 1 }}</td>
            <td>{{ tx.id }}</td>
            <td>Rp {{ tx.total_amount.toLocaleString() }}</td>
            <td>
              <span
                :class="{
                  'text-success': tx.status === 'paid',
                  'text-danger': tx.status === 'cancelled',
                  'text-warning': tx.status === 'pending',
                }"
              >
                {{ tx.status }}
              </span>
            </td>
            <td>{{ tx.payment_method }}</td>
            <td>{{ tx.midtrans_order_id }}</td>
            <td>{{ formatDate(tx.created_at) }}</td>
            <td>
              <button
                v-if="tx.status === 'pending'"
                class="btn btn-sm btn-danger"
                @click="cancelTransaction(tx.id)"
              >
                Batalkan
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar.vue";
import { onMounted, ref } from "vue";
import { useUserStore } from "../stores/UserStore";
import { useNotificationStore } from "../stores/NotificationStore";

export default {
  components: { AdminNavbar },
  setup() {
    const transactions = ref([]);
    const userStore = useUserStore();

    const fetchTransactions = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/transactions/${userStore.id}`
        );
        transactions.value = res.data;
      } catch (err) {
        console.error("Gagal memuat transaksi:", err);
      }
    };

    const formatDate = (str) => {
      const d = new Date(str);
      return d.toLocaleString("id-ID");
    };

    onMounted(() => {
      fetchTransactions();
    });

    const cancelTransaction = async (transactionId) => {
      const notif = useNotificationStore();
      try {
        await axios.put(
          `http://localhost:3001/api/transactions/cancel/${transactionId}`
        );
        await fetchTransactions();
      } catch (err) {
        console.error("Gagal membatalkan transaksi:", err);
        notif.show("error", "Gagal membatalkan transaksi");
      } finally {
        notif.show("success", "Transaksi berhasil dibatalkan");
      }
    };

    return {
      transactions,
      formatDate,
      cancelTransaction,
    };
  },
};
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>
