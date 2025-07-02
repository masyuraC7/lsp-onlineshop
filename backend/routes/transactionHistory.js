import express from "express";
import db from "../db.js";
const router = express.Router();

// Get all transaction history (admin)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM transaction_history ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data transaksi" });
  }
});

// Get transaction history by user id
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT * FROM transaction_history WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data transaksi user" });
  }
});

// Delete transaction by id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute(
      `DELETE FROM transaction_history WHERE id = ?`,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
    res.json({ message: "Transaksi berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus transaksi" });
  }
});

// Cancel a transaction
router.put("/cancel/:id", async (req, res) => {
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

// Set transaction as paid
router.put("/pay/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute(
      `UPDATE transaction_history SET status = 'paid' WHERE id = ? AND status = 'pending'`,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(400).json({
        error: "Transaksi tidak bisa dibayar atau sudah dibayar.",
      });
    }
    res.json({ message: "Transaksi berhasil dibayar" });
  } catch (err) {
    console.error("Gagal memproses pembayaran:", err);
    res.status(500).json({ error: "Gagal proses pembayaran" });
  }
});

// Update payment method
router.put("/method/:id", async (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body;
  try {
    const [result] = await db.execute(
      `UPDATE transaction_history SET payment_method = ? WHERE id = ?`,
      [payment_method, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
    res.json({ message: "Metode pembayaran berhasil diubah" });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengubah metode pembayaran" });
  }
});

export default router;
