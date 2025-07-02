import express from "express";
import db from "../db.js";
const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM categories");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data kategori" });
  }
});

// Add category
router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ error: "Nama kategori wajib diisi" });
  try {
    const [result] = await db.execute(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );
    res.json({ message: "Kategori berhasil ditambah", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Gagal menambah kategori" });
  }
});

// Update category
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ error: "Nama kategori wajib diisi" });
  try {
    const [result] = await db.execute(
      "UPDATE categories SET name = ? WHERE id = ?",
      [name, id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Kategori tidak ditemukan" });
    res.json({ message: "Kategori berhasil diupdate" });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengupdate kategori" });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute("DELETE FROM categories WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Kategori tidak ditemukan" });
    res.json({ message: "Kategori berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus kategori" });
  }
});

export default router;
