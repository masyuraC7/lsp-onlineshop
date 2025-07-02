<template>
  <AdminNavbar v-if="userRole === 'admin' || userRole === 'subadmin'" />
  <CustomerNavbar v-else />
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
                  'text-danger': tx.status === 'failed',
                  'text-warning': tx.status === 'pending',
                }"
              >
                {{ tx.status }}
              </span>
            </td>
            <td>{{ tx.payment_method }}</td>
            <td>{{ tx.order_id }}</td>
            <td>{{ formatDate(tx.created_at) }}</td>
            <td>
              <button
                v-if="
                  userRole === 'customer' &&
                  tx.status === 'pending' &&
                  !isPaying(tx.id)
                "
                class="btn btn-sm btn-success me-1"
                @click="openPaymentModal(tx)"
              >
                Bayar
              </button>
              <button
                v-if="
                  userRole === 'customer' &&
                  tx.status === 'pending' &&
                  isPaying(tx.id)
                "
                class="btn btn-sm btn-warning me-1"
                @click="showPaymentDetail(tx.id)"
              >
                Konfirmasi
              </button>
              <button
                v-if="userRole === 'customer' && tx.status === 'pending'"
                class="btn btn-sm btn-danger me-1"
                @click="showCancelConfirm(tx.id)"
              >
                Batalkan
              </button>
              <button
                class="btn btn-sm btn-primary me-1"
                @click="showDetail(tx.id)"
              >
                Details
              </button>
              <button
                class="btn btn-sm btn-outline-secondary"
                @click="printInvoice(tx.id)"
              >
                Cetak Invoice
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- SimpleModal untuk detail transaksi -->
    <SimpleModal
      id="transactionDetailModal"
      title="Detail Transaksi"
      :visible="showDetailModal"
      @update:visible="showDetailModal = $event"
      :closable="true"
      :buttons="[]"
    >
      <template #body>
        <div v-if="detailTarget">
          <table class="table table-sm table-borderless mb-2">
            <tbody>
              <tr>
                <th>ID</th>
                <td>{{ detailTarget.id }}</td>
              </tr>
              <tr>
                <th>Total</th>
                <td>Rp {{ detailTarget.total_amount?.toLocaleString() }}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td
                  :class="{
                    'text-success': detailTarget.status === 'paid',
                    'text-danger': detailTarget.status === 'failed',
                    'text-warning': detailTarget.status === 'pending',
                  }"
                >
                  {{ detailTarget.status }}
                </td>
              </tr>
              <tr>
                <th>Metode</th>
                <td>{{ detailTarget.payment_method }}</td>
              </tr>
              <tr>
                <th>Order ID</th>
                <td>{{ detailTarget.order_id }}</td>
              </tr>
              <tr>
                <th>Tanggal</th>
                <td>{{ formatDate(detailTarget.created_at) }}</td>
              </tr>
            </tbody>
          </table>
          <div><b>Item Transaksi:</b></div>
          <table class="table table-bordered table-sm">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Harga</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in detailItems" :key="idx">
                <td>{{ item.name }}</td>
                <td>Rp {{ item.price?.toLocaleString() }}</td>
                <td>{{ item.quantity }}</td>
              </tr>
              <tr v-if="!detailItems || detailItems.length === 0">
                <td colspan="3" class="text-center">Tidak ada item</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </SimpleModal>
    <SimpleModal
      id="paymentMethodModal"
      title="Pilih Metode Pembayaran"
      :visible="showPaymentModal"
      @update:visible="showPaymentModal = $event"
      :closable="true"
      :buttons="[]"
    >
      <template #body>
        <div class="text-center">
          <button
            class="btn btn-outline-primary me-2"
            @click="selectPayment('gopay')"
          >
            Gopay
          </button>
          <button
            class="btn btn-outline-warning"
            @click="selectPayment('shopee')"
          >
            Shopee
          </button>
        </div>
      </template>
    </SimpleModal>
    <SimpleModal
      id="paymentDetailModal"
      title="Detail Pembayaran"
      :visible="showPaymentDetailModal"
      @update:visible="showPaymentDetailModal = $event"
      :closable="true"
      :buttons="[]"
    >
      <template #body>
        <div v-if="selectedPayment && paymentDetail">
          <div class="mb-2"><b>Metode:</b> {{ selectedPaymentLabel }}</div>
          <div class="mb-2">
            <b>Kode QR:</b>
          </div>
          <QrCodeImg :value="paymentDetail.qr" :size="200" class="mb-2" />
          <div class="mb-2">
            <b>No. {{ selectedPaymentLabel }}:</b> {{ paymentDetail.number }}
          </div>
          <div class="mb-2">
            <b>Nominal:</b> Rp {{ paymentDetail.amount?.toLocaleString() }}
          </div>
          <div class="mb-2">
            <b>Waktu Tersisa:</b>
            <span :class="{ 'text-danger': countdown <= 30 }">
              {{ countdownDisplay }}
            </span>
          </div>
          <div v-if="!isConfirmed">
            <button class="btn btn-success" @click="confirmPayment">
              Konfirmasi Pembayaran
            </button>
          </div>
          <div v-else>
            <span v-if="isVerifying" class="text-primary">
              <span class="spinner-border spinner-border-sm me-2"></span>
              Verifikasi pembayaran...
            </span>
            <span v-else class="text-success"
              >Pembayaran berhasil! Status transaksi sudah menjadi paid.</span
            >
          </div>
        </div>
      </template>
    </SimpleModal>
    <SimpleModal
      id="confirmCancelModal"
      title="Konfirmasi Pembatalan"
      :visible="showCancelModal"
      :buttons="cancelModalButtons"
      @update:visible="showCancelModal = $event"
      @button-click="handleCancelModalButton"
    >
      <template #body>
        <div>Apakah Anda yakin ingin membatalkan transaksi ini?</div>
      </template>
    </SimpleModal>
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";
import AdminNavbar from "../components/AdminNavbar.vue";
import CustomerNavbar from "../components/CustomerNavbar.vue";
import SimpleModal from "../components/SimpleModal.vue";
import QrCodeImg from "../components/QrCodeImg.vue";
import { onMounted, ref, computed } from "vue";
import { useUserStore } from "../stores/UserStore";
import { useNotificationStore } from "../stores/NotificationStore";

export default {
  components: { AdminNavbar, CustomerNavbar, SimpleModal, QrCodeImg },
  setup() {
    const router = useRouter();
    const transactions = ref([]);
    const userStore = useUserStore();
    const userRole = computed(() => userStore.user?.role || "");
    const notif = useNotificationStore();

    const showDetailModal = ref(false);
    const detailTarget = ref(null);
    const detailItems = ref([]);
    const showPaymentModal = ref(false);
    const showPaymentDetailModal = ref(false);
    const selectedPayment = ref(null);
    const selectedPaymentLabel = computed(() => {
      if (selectedPayment.value === "gopay") return "Gopay";
      if (selectedPayment.value === "shopee") return "Shopee";
      return "";
    });
    const paymentDetail = ref(null);
    const payingTransactionId = ref(null);
    const countdown = ref(300);
    const countdownTimer = ref(null);
    const isConfirmed = ref(false);
    const isVerifying = ref(false);
    const countdownDisplay = computed(() => {
      const m = Math.floor(countdown.value / 60);
      const s = countdown.value % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    });

    const showCancelModal = ref(false);
    const cancelModalButtons = [
      { label: "Batal", class: "btn-secondary", dismiss: true },
      { label: "Ya, Batalkan", class: "btn-danger", dismiss: true },
    ];
    const cancelTargetId = ref(null);

    function isPaying(id) {
      return payingTransactionId.value === id;
    }

    function openPaymentModal(tx) {
      payingTransactionId.value = tx.id;
      showPaymentModal.value = true;
      selectedPayment.value = null;
      paymentDetail.value = null;
      isConfirmed.value = false;
      isVerifying.value = false;
      countdown.value = 300;
      clearInterval(countdownTimer.value);
    }

    function selectPayment(method) {
      selectedPayment.value = method;
      // Update payment_method in database
      const tx = transactions.value.find(
        (t) => t.id === payingTransactionId.value
      );
      if (tx) {
        axios
          .put(
            `http://localhost:3001/api/transactionsHistory/method/${tx.id}`,
            {
              payment_method: method,
            }
          )
          .catch(() => {
            notif.show("error", "Gagal mengubah metode pembayaran");
          });
        tx.payment_method = method; // update local for immediate UI feedback
      }
      paymentDetail.value = {
        qr: `${method.toUpperCase()}|${tx?.id}|${tx?.total_amount}`,
        number: method === "gopay" ? "0812-1234-5678" : "0813-4567-8987",
        amount: tx?.total_amount || 0,
      };
      showPaymentModal.value = false;
      showPaymentDetailModal.value = true;
      startCountdown();
    }

    function showPaymentDetail(id) {
      payingTransactionId.value = id;
      showPaymentDetailModal.value = true;
    }

    function startCountdown() {
      clearInterval(countdownTimer.value);
      countdownTimer.value = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else {
          clearInterval(countdownTimer.value);
          autoCancelTransaction();
        }
      }, 1000);
    }

    async function autoCancelTransaction() {
      if (payingTransactionId.value) {
        try {
          await axios.put(
            `http://localhost:3001/api/transactionsHistory/cancel/${payingTransactionId.value}`
          );
          await fetchTransactions();
        } catch (err) {
          notif.show("error", "Gagal membatalkan transaksi (auto-cancel)");
        } finally {
          showPaymentDetailModal.value = false;
          payingTransactionId.value = null;
          isConfirmed.value = false;
          isVerifying.value = false;
          notif.show(
            "error",
            "Transaksi dibatalkan karena tidak ada konfirmasi pembayaran dalam waktu yang ditentukan."
          );
        }
      }
    }

    const handleDetail = (id) => {
      router.push(`/olshopv1/transaction-details/${id}`);
    };

    const showDetail = async (id) => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/transaction-details/${id}`
        );
        detailTarget.value = res.data;
        detailItems.value = res.data.items || [];
        showDetailModal.value = true;
      } catch (err) {
        detailTarget.value = null;
        detailItems.value = [];
      }
    };

    const fetchTransactions = async () => {
      try {
        let url;
        if (userRole.value === "admin" || userRole.value === "subadmin") {
          url = `http://localhost:3001/api/transactionsHistory`;
        } else {
          url = `http://localhost:3001/api/transactionsHistory/${userStore.id}`;
        }
        const res = await axios.get(url);
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
      try {
        await axios.put(
          `http://localhost:3001/api/transactionsHistory/cancel/${transactionId}`
        );
        await fetchTransactions();
      } catch (err) {
        console.error("Gagal membatalkan transaksi:", err);
        notif.show("error", "Gagal membatalkan transaksi");
      } finally {
        notif.show("success", "Transaksi berhasil dibatalkan");
      }
    };

    const confirmPayment = async () => {
      isConfirmed.value = true;
      isVerifying.value = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await axios.put(
          `http://localhost:3001/api/transactionsHistory/pay/${payingTransactionId.value}`
        );

        await fetchTransactions();
        showPaymentDetailModal.value = false;
        payingTransactionId.value = null;
        isConfirmed.value = false;
      } catch (err) {
        notif.show("error", "Gagal memverifikasi pembayaran");
      } finally {
        isVerifying.value = false;
        notif.show("success", "Pembayaran berhasil diverifikasi");
      }
    };

    const showCancelConfirm = (id) => {
      cancelTargetId.value = id;
      showCancelModal.value = true;
    };
    const handleCancelModalButton = (btn) => {
      if (btn.label === "Ya, Batalkan" && cancelTargetId.value) {
        cancelTransaction(cancelTargetId.value);
      }
    };

    function printInvoice(id) {
      router.push(`/olshopv1/transaction-details/${id}`);
    }

    return {
      transactions,
      formatDate,
      cancelTransaction,
      showDetail,
      showDetailModal,
      detailTarget,
      detailItems,
      handleDetail,
      userRole,
      showPaymentModal,
      showPaymentDetailModal,
      selectedPayment,
      selectedPaymentLabel,
      paymentDetail,
      openPaymentModal,
      selectPayment,
      showPaymentDetail,
      isPaying,
      countdown,
      countdownDisplay,
      confirmPayment,
      isConfirmed,
      isVerifying,
      showCancelModal,
      cancelModalButtons,
      showCancelConfirm,
      handleCancelModalButton,
      printInvoice,
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
