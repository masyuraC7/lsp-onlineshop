import bcrypt from "bcrypt";
import express from "express";
import db from "../db.js";
const router = express.Router();

// endpoint login
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const query = `
      SELECT *
      FROM users
      WHERE email = ? OR username = ?
      LIMIT 1
    `;
    const [users] = await db.execute(query, [identifier, identifier]);
    if (users.length === 0) {
      return res.status(401).json({ error: "Akun tidak ditemukan" });
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Password salah" });
    }
    res.json({
      id: user.id,
      nama: user.full_name,
      username: user.username,
      role: user.role,
      message: "Login berhasil",
    });
  } catch (err) {
    res.status(500).json({ error: "Terjadi kesalahan saat login" });
  }
});

// endpoint register
router.post("/register", async (req, res) => {
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
    const hashedPassword = await bcrypt.hash(password, 10);
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
    await db.execute(sql, values);
    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      if (err.message.includes("username")) {
        return res.status(400).json({ error: "Username sudah digunakan" });
      }
      if (err.message.includes("email")) {
        return res.status(400).json({ error: "Email sudah digunakan" });
      }
    }
    res.status(500).json({ error: "Terjadi kesalahan saat registrasi" });
  }
});

export default router;
