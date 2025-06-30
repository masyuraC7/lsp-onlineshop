const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all users (for admin)
router.get("/", async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT id, full_name AS namaLengkap, username, email, birth_date AS tglLahir, gender AS jenisKelamin, address AS alamat, city AS kota, phone AS noHp, bank_name AS bank, bank_account AS noRek, role FROM users`
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
});

// Get user by id (for profile)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [users] = await db.execute(
      `SELECT id, full_name AS namaLengkap, username, email, birth_date AS tglLahir, gender AS jenisKelamin, address AS alamat, city AS kota, phone AS noHp, bank_name AS bank, bank_account AS noRek, role FROM users WHERE id = ?`,
      [id]
    );
    if (users.length === 0)
      return res.status(404).json({ error: "User tidak ditemukan" });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
});

// Update user profile
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  let {
    namaLengkap,
    username,
    email,
    tglLahir,
    jenisKelamin,
    alamat,
    kota,
    noHp,
    bank,
    noRek,
  } = req.body;

  if (tglLahir && tglLahir.includes("T")) {
    try {
      const d = new Date(tglLahir);
      tglLahir = d.toISOString().slice(0, 10);
    } catch (e) {}
  }
  try {
    await db.execute(
      `UPDATE users SET full_name=?, username=?, email=?, birth_date=?, gender=?, address=?, city=?, phone=?, bank_name=?, bank_account=? WHERE id=?`,
      [
        namaLengkap,
        username,
        email,
        tglLahir,
        jenisKelamin,
        alamat,
        kota,
        noHp,
        bank,
        noRek,
        id,
      ]
    );
    res.json({ message: "Profil berhasil diperbarui" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal update profil" });
  }
});

// Reset/Change password
router.put("/:id/password", async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  try {
    const [users] = await db.execute("SELECT password FROM users WHERE id=?", [
      id,
    ]);
    if (users.length === 0)
      return res.status(404).json({ error: "User tidak ditemukan" });
    const user = users[0];

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Password lama salah" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE users SET password=? WHERE id=?", [hashed, id]);
    res.json({ message: "Password berhasil diubah" });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengubah password" });
  }
});

module.exports = router;
