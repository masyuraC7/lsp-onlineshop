import express from "express";
import db from "../db.js";
const router = express.Router();

// Get all stocks (join product name)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.id, s.product_id, p.name AS product_name, s.quantity, s.supplier
       FROM stocks s
       JOIN products p ON s.product_id = p.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data stok" });
  }
});

// Add new stock
router.post("/", async (req, res) => {
  const { product_id, quantity, supplier } = req.body;
  if (!product_id || quantity == null || !supplier) {
    return res.status(400).json({ error: "Field tidak boleh kosong" });
  }
  try {
    const [result] = await db.execute(
      "INSERT INTO stocks (product_id, quantity, supplier) VALUES (?, ?, ?)",
      [product_id, quantity, supplier]
    );
    res.json({ message: "Stok berhasil ditambah", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Gagal menambah stok" });
  }
});

// Edit stock
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { product_id, quantity, supplier } = req.body;
  if (!product_id || quantity == null || !supplier) {
    return res.status(400).json({ error: "Field tidak boleh kosong" });
  }
  try {
    await db.execute(
      "UPDATE stocks SET product_id = ?, quantity = ?, supplier = ? WHERE id = ?",
      [product_id, quantity, supplier, id]
    );
    res.json({ message: "Stok berhasil diupdate" });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengupdate stok" });
  }
});

// Delete stock
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute("DELETE FROM stocks WHERE id = ?", [id]);
    res.json({ message: "Stok berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus stok" });
  }
});

export default router;
