import express from "express";
import db from "../db.js";
const router = express.Router();

// Get Cart for a specific user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [items] = await db.execute(
      `SELECT c.id, c.quantity, p.name, p.price, COALESCE(SUM(s.quantity), 0) AS stock
         FROM carts c
         JOIN products p ON c.product_id = p.id
         LEFT JOIN stocks s ON s.product_id = p.id
         WHERE c.user_id = ?
         GROUP BY c.id`,
      [userId]
    );

    res.json(items);
  } catch (err) {
    console.error("Gagal mengambil keranjang:", err);
    res.status(500).json({ error: "Gagal mengambil keranjang" });
  }
});

// Add or update item in cart
router.post("/add", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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
router.delete("/clear/:userId", async (req, res) => {
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
router.post("/checkout", async (req, res) => {
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

    const [insertResult] = await db.execute(
      `INSERT INTO transaction_history (user_id, total_amount, status, order_id)
           VALUES (?, ?, ?, ?)`,
      [userId, totalAmount, "pending", orderId]
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

    res.json({ message: "Checkout berhasil", transactionId });
  } catch (err) {
    console.error("Gagal proses checkout:", err);
    res.status(500).json({ error: "Gagal proses checkout" });
  }
});

export default router;
