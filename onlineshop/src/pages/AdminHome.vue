<template>
  <AdminNavbar />
  <div class="container mt-4">
    <h2 class="mb-4">Dashboard Admin</h2>
    <div class="row mb-4">
      <div class="col-md-8 mb-3">
        <div class="row mb-2">
          <div class="col-md-6 mb-3">
            <div class="card text-center shadow">
              <div class="card-body">
                <h5 class="card-title">Total Customer</h5>
                <p class="display-5 fw-bold">{{ summary.customers }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <div class="card text-center shadow">
              <div class="card-body">
                <h5 class="card-title">Total Produk</h5>
                <p class="display-5 fw-bold">{{ summary.products }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <div class="card text-center shadow">
              <div class="card-body">
                <h5 class="card-title">Total User Admin</h5>
                <p class="display-5 fw-bold">{{ summary.admins }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <div class="card text-center shadow">
              <div class="card-body">
                <h5 class="card-title">Total User SubAdmin</h5>
                <p class="display-5 fw-bold">{{ summary.subadmins }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card text-center shadow">
          <div class="card-body">
            <h5 class="card-title">Distribusi Stok per Produk</h5>
            <canvas id="stockChart" height="120"></canvas>
          </div>
        </div>
      </div>
    </div>
    <div class="card shadow">
      <div class="card-body">
        <h5 class="card-title">Frekuensi Transaksi 7 Hari Terakhir</h5>
        <canvas id="trxChart" height="80"></canvas>
      </div>
    </div>
  </div>
</template>
<script>
import AdminNavbar from "../components/AdminNavbar.vue";
import { onMounted, ref } from "vue";
import axios from "axios";
export default {
  components: { AdminNavbar },
  setup() {
    const summary = ref({
      customers: 0,
      products: 0,
      stockChart: [],
      transactions: [],
    });
    let chart = null;
    let stockChart = null;
    async function fetchSummary() {
      const res = await axios.get("http://localhost:3001/api/admin/summary");
      summary.value = res.data;
      renderTrxChart();
      renderStockChart();
    }
    function renderTrxChart() {
      if (!window.Chart) return;
      const ctx = document.getElementById("trxChart").getContext("2d");
      if (chart) chart.destroy();
      const labels = summary.value.transactions.map((t) => t.tanggal);
      const data = summary.value.transactions.map((t) => t.jumlah);
      chart = new window.Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Transaksi",
              data,
              borderColor: "#007bff",
              backgroundColor: "rgba(0,123,255,0.1)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
          },
        },
      });
    }
    function renderStockChart() {
      if (!window.Chart) return;
      const ctx = document.getElementById("stockChart").getContext("2d");
      if (stockChart) stockChart.destroy();
      const labels = summary.value.stockChart.map((s) => s.name);
      const data = summary.value.stockChart.map((s) => s.total);
      stockChart = new window.Chart(ctx, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              label: "Stok",
              data,
              backgroundColor: [
                "#007bff",
                "#28a745",
                "#ffc107",
                "#dc3545",
                "#6f42c1",
                "#20c997",
                "#fd7e14",
                "#17a2b8",
                "#6610f2",
                "#e83e8c",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true, position: "bottom" },
          },
        },
      });
    }
    onMounted(() => {
      if (!window.Chart) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = fetchSummary;
        document.head.appendChild(script);
      } else {
        fetchSummary();
      }
    });
    return { summary };
  },
};
</script>
<style scoped>
.card-title {
  font-size: 1.1rem;
}
</style>
