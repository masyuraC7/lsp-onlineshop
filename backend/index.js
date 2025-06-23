const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend berhasil berjalan!");
});

// Coba endpoint test koneksi ke database
app.get("/test-db", (req, res) => {
  db.query("SELECT NOW() AS waktu", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Gagal query ke database" });
    }
    res.json({ server_time: results[0].waktu });
  });
});

app.get("/api/products", (req, res) => {
  const kategori = req.query.category;

  let sql = `
      SELECT 
        p.*, c.name AS category, s.quantity AS stock,
        (
          SELECT 
            JSON_ARRAYAGG(
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

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // Ubah reviews yang null jadi array kosong
    const data = result.map((p) => ({
      ...p,
      reviews: p.reviews || [],
    }));

    res.json(data);
  });
});

app.get("/api/categories", (req, res) => {
  const sql = "SELECT * FROM categories";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Endpoint untuk login & register
const bcrypt = require("bcrypt");

app.post("/api/register", async (req, res) => {
  const {
    namaLengkap,
    username,
    email,
    password,
    tglLahir,
    jenisKelamin,
    alamat,
    kota,
    noHp,
    bank,
    noRek,
  } = req.body;

  try {
    // Hash password di sini
    const hashedPassword = await bcrypt.hash(password, 10); // angka 10 = salt rounds
    const roleCustomer = "customer";
    const genderCustomer = jenisKelamin === "Laki-laki" ? "L" : "P";

    const sql = `
      INSERT INTO users
      (full_name, username, email, password, birth_date, gender, address, city, phone, bank_name, bank_account, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      namaLengkap,
      username,
      email,
      hashedPassword,
      tglLahir,
      genderCustomer,
      alamat,
      kota,
      noHp,
      bank,
      noRek,
      roleCustomer,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          if (err.sqlMessage.includes("username")) {
            return res.status(400).json({ error: "Username sudah digunakan" });
          }
          if (err.sqlMessage.includes("email")) {
            return res.status(400).json({ error: "Email sudah digunakan" });
          }
        }
        return res.status(500).json({ error: "Terjadi kesalahan pada server" });
      }

      res.status(201).json({ message: "Registrasi berhasil" });
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengenkripsi password" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});
