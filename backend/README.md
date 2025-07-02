# Backend - Online Shop

Backend aplikasi ini dibangun menggunakan **Node.js** dan **Express.js** sebagai REST API server, serta **MySQL** sebagai database utama.

## Fitur Utama
- Autentikasi user (login/register)
- CRUD produk, kategori, stok
- Manajemen user (admin)
- Manajemen transaksi & riwayat
- Upload & serve gambar produk
- Validasi, notifikasi, dan error handling

## Teknologi
- [Node.js](https://nodejs.org/) (runtime JavaScript)
- [Express.js](https://expressjs.com/) (web framework)
- [MySQL](https://www.mysql.com/) (database)
- [Multer](https://github.com/expressjs/multer) (upload file)
- [CORS](https://expressjs.com/en/resources/middleware/cors.html)

## Struktur Folder
```
backend/
├── db.js                # Koneksi database
├── index.js             # Entry point server Express
├── lsp_onlineshop.sql   # File SQL database
├── routes/              # Semua endpoint API
│   ├── auth.js
│   ├── users.js
│   ├── products.js
│   └── ...
├── uploads/             # Folder upload gambar produk
```

## Dokumentasi
- [Node.js Documentation](https://nodejs.org/en/docs)
- [Express.js Documentation](https://expressjs.com/en/4x/api.html)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## Menjalankan Backend
```
cd backend
npm install
node index.js
```

Pastikan database sudah di-import dan konfigurasi di `db.js` sudah benar.
