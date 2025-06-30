const express = require("express");
const cors = require("cors");
const db = require("./db");
const authRoutes = require("./routes/auth");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("✅ Backend berhasil berjalan!");
});

// Test koneksi database
app.get("/test-db", async (req, res) => {
  try {
    const [results] = await db.execute("SELECT NOW() AS waktu");
    res.json({ server_time: results[0].waktu });
  } catch (err) {
    res.status(500).json({ error: "Gagal query ke database" });
  }
});

// Get all categories
app.get("/api/categories", async (req, res) => {
  try {
    const [result] = await db.execute("SELECT * FROM categories");
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products with reviews and stock
app.get("/api/products", async (req, res) => {
  const kategori = req.query.category;

  let sql = `
      SELECT 
        p.*, 
        c.name AS category, 
        s.quantity AS stock,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', r.id,
              'rating', r.rating,
              'comment', r.comment,
              'created_at', r.created_at
            )
          )
          FROM product_reviews r
          WHERE r.product_id = p.id
        ) AS reviews
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN stocks s ON s.product_id = p.id
    `;

  const params = [];

  if (kategori) {
    sql += ` WHERE c.name = ?`;
    params.push(kategori);
  }

  try {
    const [rows] = await db.execute(sql, params);

    const data = rows.map((p) => ({
      ...p,
      reviews: Array.isArray(p.reviews)
        ? p.reviews
        : typeof p.reviews === "string"
        ? JSON.parse(p.reviews)
        : [],
    }));

    res.json(data);
  } catch (err) {
    console.error("Error get products:", err);
    res.status(500).json({ error: "Gagal mengambil data produk" });
  }
});

// Create a new review for a product
app.post("/api/reviews", async (req, res) => {
  const { userId, productId, rating, comment } = req.body;

  try {
    await db.execute(
      "INSERT INTO product_reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)",
      [userId, productId, rating, comment]
    );

    res.json({ message: "Ulasan berhasil dikirim" });
  } catch (err) {
    return res.status(500).json({ error: "Gagal mengirim ulasan" });
  }
});

// Get reviews for a specific product
app.get("/api/reviews/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT r.id, r.rating, r.comment, r.created_at
         FROM product_reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.product_id = ?
         ORDER BY r.created_at DESC`,
      [productId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil ulasan" });
  }
});

// Get Cart for a specific user
app.get("/api/cart/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [items] = await db.execute(
      `SELECT c.id, c.quantity, p.name, p.price, s.quantity AS stock
         FROM carts c
         JOIN products p ON c.product_id = p.id
         JOIN stocks s ON s.product_id = p.id
         WHERE c.user_id = ?`,
      [userId]
    );

    res.json(items);
  } catch (err) {
    console.error("Gagal mengambil keranjang:", err);
    res.status(500).json({ error: "Gagal mengambil keranjang" });
  }
});

// Add or update item in cart
app.post("/api/cart/add", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const [exists] = await db.execute(
      "SELECT * FROM carts WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (exists.length > 0) {
      await db.execute(
        "UPDATE carts SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
        [quantity, userId, productId]
      );
    } else {
      await db.execute(
        "INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [userId, productId, quantity]
      );
    }

    res.json({ message: "Berhasil menambahkan ke keranjang" });
  } catch (err) {
    console.error("Gagal menambahkan ke keranjang:", err);
    res.status(500).json({ error: "Gagal menambahkan ke keranjang" });
  }
});

// Update item quantity in cart
app.put("/api/cart/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    await db.execute("UPDATE carts SET quantity = ? WHERE id = ?", [
      quantity,
      id,
    ]);
    res.json({ message: "Jumlah berhasil diperbarui" });
  } catch (err) {
    console.error("Gagal mengubah jumlah:", err);
    res.status(500).json({ error: "Gagal mengubah jumlah" });
  }
});

// Delete item from cart
app.delete("/api/cart/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute("DELETE FROM carts WHERE id = ?", [id]);
    res.json({ message: "Item berhasil dihapus" });
  } catch (err) {
    console.error("Gagal menghapus item:", err);
    res.status(500).json({ error: "Gagal menghapus item" });
  }
});

// Clear cart for a specific user
app.delete("/api/cart/clear/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    await db.execute("DELETE FROM carts WHERE user_id = ?", [userId]);
    res.json({ message: "Keranjang dikosongkan" });
  } catch (err) {
    console.error("Gagal mengosongkan keranjang:", err);
    res.status(500).json({ error: "Gagal mengosongkan keranjang" });
  }
});

// Checkout process
app.post("/api/checkout", async (req, res) => {
  const { userId } = req.body;
  const orderId = `ORDER-${Date.now()}`;

  try {
    const [cartItems] = await db.execute(
      `SELECT c.product_id, c.quantity, p.price
         FROM carts c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Keranjang kosong" });
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const randomSnapToken = Math.random().toString(36).substring(7);
    const orderId = `ORDER-${Date.now()}`;

    const [insertResult] = await db.execute(
      `INSERT INTO transaction_history (user_id, total_amount, status, payment_method, midtrans_order_id)
           VALUES (?, ?, ?, ?, ?)`,
      [userId, totalAmount, "pending", "midtrans", orderId]
    );

    const transactionId = insertResult.insertId;

    const detailPromises = cartItems.map((item) =>
      db.execute(
        `INSERT INTO transaction_details (transaction_id, product_id, quantity)
           VALUES (?, ?, ?)`,
        [transactionId, item.product_id, item.quantity]
      )
    );

    await Promise.all(detailPromises);

    await db.execute(`DELETE FROM carts WHERE user_id = ?`, [userId]);

    res.json({ message: "Checkout berhasil", randomSnapToken });
  } catch (err) {
    console.error("Gagal proses checkout:", err);
    res.status(500).json({ error: "Gagal proses checkout" });
  }
});

// Get transaction history for a specific user
app.get("/api/transactions/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT * FROM transaction_history WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Gagal mengambil transaksi:", err);
    res.status(500).json({ error: "Gagal mengambil transaksi" });
  }
});

// Cancel a transaction
app.put("/api/transactions/cancel/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      `UPDATE transaction_history
         SET status = 'failed'
         WHERE id = ? AND status = 'pending'`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Transaksi tidak bisa dibatalkan" });
    }

    res.json({ message: "Transaksi dibatalkan" });
  } catch (err) {
    console.error("Gagal membatalkan transaksi:", err);
    res.status(500).json({ error: "Gagal proses pembatalan" });
  }
});

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

// Handle 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: "Halaman tidak ditemukan" });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});
