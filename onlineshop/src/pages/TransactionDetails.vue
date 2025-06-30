<template>
  <AdminNavbar />

  <div class="container mt-5">
    <div ref="printArea">
      <h2 class="mb-4">Detail Transaksi</h2>

      <div v-if="!transaction">
        <p class="text-muted">Memuat detail transaksi...</p>
      </div>

      <div v-else>
        <div class="mb-3">
          <p><strong>ID Transaksi:</strong> {{ transaction.id || "-" }}</p>
          <p>
            <strong>Metode Pembayaran:</strong>
            {{ transaction.payment_method || "-" }}
          </p>
          <p><strong>Status:</strong> {{ transaction.status || "-" }}</p>
          <p>
            <strong>Waktu:</strong>
            {{
              transaction.created_at
                ? new Date(transaction.created_at).toLocaleString()
                : "-"
            }}
          </p>
          <p>
            <strong>Total:</strong> Rp
            {{ transaction.total_amount?.toLocaleString() || "0" }}
          </p>
          <p>
            <strong>Order ID Midtrans:</strong>
            {{ transaction.midtrans_order_id || "-" }}
          </p>
        </div>

        <table class="table table-bordered align-middle text-center">
          <thead class="table-light">
            <tr>
              <th>No</th>
              <th>Nama Produk</th>
              <th>Harga</th>
              <th>Jumlah</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in transaction.items || []" :key="i">
              <td>{{ i + 1 }}</td>
              <td>{{ item.name || "-" }}</td>
              <td>Rp {{ item.price?.toLocaleString() || "0" }}</td>
              <td>{{ item.quantity }}</td>
              <td>
                Rp {{ (item.price * item.quantity)?.toLocaleString() || "0" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="text-end mt-3">
      <button class="btn btn-outline-primary" @click="cetakPDF">
        <i class="bi bi-printer"></i> Cetak Bukti Transaksi
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import AdminNavbar from "../components/CustomerNavbar.vue";
import html2pdf from "html2pdf.js";

const printArea = ref(null);

export default {
  components: { AdminNavbar },
  setup() {
    const route = useRoute();
    const transaction = ref(null);

    onMounted(async () => {
      try {
        const { id } = route.params;
        const res = await axios.get(
          `http://localhost:3001/api/transaction-details/${id}`
        );
        transaction.value = res.data;
      } catch (err) {
        console.error("Gagal memuat detail transaksi:", err);
      }
    });

    const cetakPDF = () => {
      const element = printArea.value;
      html2pdf()
        .from(element)
        .set({
          margin: 1,
          filename: `Bukti_Transaksi_${transaction.value.id}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
        })
        .save();
    };

    return {
      transaction,
      printArea,
      cetakPDF,
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
