const mysql = require("mysql2");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // default Laragon tidak pakai password
  database: "lsp_onlineshop",
});

conn.connect((err) => {
  if (err) {
    console.error("❌ Gagal koneksi ke database:", err);
  } else {
    console.log("✅ Terhubung ke database MySQL");
  }
});

module.exports = conn;
