import express from "express";
import cors from "cors";
import db from "./db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import transactionHistoryRoutes from "./routes/transactionHistory.js";
import categoriesRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import stocksRoutes from "./routes/stocks.js";
import reviewsRoutes from "./routes/reviews.js";
import cartRoutes from "./routes/cart.js";
import path from "path";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Serve folder uploads statis agar gambar bisa diakses dari frontend
app.use("/uploads", express.static(path.resolve("uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactionsHistory", transactionHistoryRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stocks", stocksRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/cart", cartRoutes);

// Get transaction details by ID
app.get("/api/transaction-details/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [transaksiRows] = await db.execute(
      `SELECT *
         FROM transaction_history
         WHERE id = ?`,
      [id]
    );

    if (transaksiRows.length === 0) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    const transaksi = transaksiRows[0];

    const [itemRows] = await db.execute(
      `SELECT p.name, p.price, td.quantity
         FROM transaction_details td
         JOIN products p ON td.product_id = p.id
         WHERE td.transaction_id = ?`,
      [id]
    );

    transaksi.items = itemRows;

    res.json(transaksi);
  } catch (err) {
    console.error("Gagal mengambil detail transaksi:", err);
    res.status(500).json({ error: "Gagal mengambil detail transaksi" });
  }
});

// Statistik untuk dashboard admin
app.get("/api/admin/summary", async (req, res) => {
  try {
    // Total customer
    const [userRows] = await db.execute(
      "SELECT COUNT(*) as total FROM users WHERE role = 'customer'"
    );
    // Total admin
    const [adminRows] = await db.execute(
      "SELECT COUNT(*) as total FROM users WHERE role = 'admin'"
    );
    // Total subadmin
    const [subadminRows] = await db.execute(
      "SELECT COUNT(*) as total FROM users WHERE role = 'subadmin'"
    );
    // Total produk
    const [productRows] = await db.execute(
      "SELECT COUNT(*) as total FROM products"
    );
    // Stok per produk untuk grafik lingkaran
    const [stockRows] = await db.execute(`
      SELECT p.name, COALESCE(SUM(s.quantity),0) as total
      FROM products p
      LEFT JOIN stocks s ON s.product_id = p.id
      GROUP BY p.id
    `);
    // Frekuensi transaksi per hari (7 hari terakhir)
    const [trxRows] = await db.execute(`
      SELECT DATE(created_at) as tanggal, COUNT(*) as jumlah
      FROM transaction_history
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY tanggal ASC
    `);
    res.json({
      customers: userRows[0].total,
      admins: adminRows[0].total,
      subadmins: subadminRows[0].total,
      products: productRows[0].total,
      stockChart: stockRows,
      transactions: trxRows,
    });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data summary" });
  }
});

// Handle 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: "Halaman tidak ditemukan" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Terjadi kesalahan pada server" });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});
