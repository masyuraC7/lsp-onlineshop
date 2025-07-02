import express from "express";
import db from "../db.js";
const router = express.Router();

// Create a new review for a product
router.post("/", async (req, res) => {
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
router.get("/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS userName
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

export default router;
