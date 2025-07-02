import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
const router = express.Router();

// Konfigurasi multer untuk upload gambar ke folder uploads
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File harus berupa gambar"));
    }
    cb(null, true);
  },
});

// Endpoint upload gambar
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File tidak ditemukan" });
  }
  res.json({ filename: req.file.filename });
});

// Get all products with reviews and total stock
router.get("/", async (req, res) => {
  const kategori = req.query.category;

  let sql = `
      SELECT 
        p.*, 
        c.name AS category, 
        COALESCE(SUM(st.quantity), 0) AS stock,
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
      LEFT JOIN stocks st ON st.product_id = p.id
  `;

  const params = [];

  if (kategori) {
    sql += ` WHERE c.name = ?`;
    params.push(kategori);
  }

  sql += ` GROUP BY p.id`;

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

// Tambah produk baru
router.post("/", async (req, res) => {
  const { name, category, price, image } = req.body;
  try {
    // Ambil id kategori, jika tidak ada, return error
    const [catRows] = await db.execute(
      "SELECT id FROM categories WHERE name = ?",
      [category]
    );
    if (catRows.length === 0) {
      return res.status(400).json({ error: "Kategori tidak ditemukan" });
    }
    const categoryId = catRows[0].id;
    const [result] = await db.execute(
      "INSERT INTO products (name, category_id, price, image) VALUES (?, ?, ?, ?)",
      [name, categoryId, price, image || null]
    );
    res.json({ message: "Produk berhasil ditambah", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Gagal menambah produk" });
  }
});

// Edit produk
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, category, price, image } = req.body;
  try {
    // Ambil image lama
    const [oldRows] = await db.execute(
      "SELECT image FROM products WHERE id = ?",
      [id]
    );
    const oldImage = oldRows[0]?.image;
    // Jika image lama adalah file dan image baru adalah link, hapus file lama
    if (
      oldImage &&
      !/^https?:\/\//i.test(oldImage) &&
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(oldImage) &&
      image &&
      /^https?:\/\//i.test(image)
    ) {
      const filePath = path.join(uploadDir, oldImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    // Jika image lama adalah file dan image baru juga file, tapi namanya berbeda (upload baru), hapus file lama
    if (
      oldImage &&
      !/^https?:\/\//i.test(oldImage) &&
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(oldImage) &&
      image &&
      !/^https?:\/\//i.test(image) &&
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(image) &&
      oldImage !== image
    ) {
      const filePath = path.join(uploadDir, oldImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    const [catRows] = await db.execute(
      "SELECT id FROM categories WHERE name = ?",
      [category]
    );
    let categoryId;
    if (catRows.length > 0) {
      categoryId = catRows[0].id;
    } else {
      const [catInsert] = await db.execute(
        "INSERT INTO categories (name) VALUES (?)",
        [category]
      );
      categoryId = catInsert.insertId;
    }
    await db.execute(
      "UPDATE products SET name = ?, category_id = ?, price = ?, image = ? WHERE id = ?",
      [name, categoryId, price, image || null, id]
    );
    res.json({ message: "Produk berhasil diupdate" });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengupdate produk" });
  }
});

// Hapus produk
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Ambil image lama
    const [oldRows] = await db.execute(
      "SELECT image FROM products WHERE id = ?",
      [id]
    );
    const oldImage = oldRows[0]?.image;
    // Hapus produk
    await db.execute("DELETE FROM products WHERE id = ?", [id]);
    // Jika image lama adalah file, hapus file
    if (
      oldImage &&
      !/^https?:\/\//i.test(oldImage) &&
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(oldImage)
    ) {
      const filePath = path.join(uploadDir, oldImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.json({ message: "Produk berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus produk" });
  }
});

export default router;
