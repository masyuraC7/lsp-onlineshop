# Online Shop Fullstack Project

## Deskripsi Singkat

Aplikasi Online Shop modern berbasis web, terdiri dari frontend (Vue 3 + Vite) dan backend (Node.js + Express + MySQL). Mendukung fitur e-commerce lengkap untuk customer, admin, dan subadmin, dengan sistem autentikasi, manajemen produk, transaksi, dan dashboard statistik.

---

## Daftar Role & Fitur

### 1. Customer

- Registrasi & Login
- Melihat dan mencari produk (berdasarkan kategori atau pencarian)
- Menambah produk ke keranjang
- Checkout & pembayaran (Gopay, Shopee)
- Melihat riwayat transaksi & detail transaksi
- Memberi ulasan/review produk
- Edit profil

### 2. Admin

- Login admin
- Dashboard statistik (produk, user, transaksi, stok)
- CRUD produk, kategori, stok
- Manajemen user (lihat, hapus user)
- Melihat & mengelola transaksi
- Upload gambar produk (link/file)
- Hapus gambar produk saat update/delete

### 3. Subadmin

- Fitur hampir sama admin, kecuali manajemen user

---

## Teknologi & Tools

### Backend

- **Node.js** (ESM)
- **Express.js**
- **MySQL** (database)
- **Multer** (upload gambar)
- **CORS**

### Frontend

- **Vue 3** (Composition API, Pinia)
- **Vite** (dev server & build)
- **Bootstrap 5** (UI)
- **Chart.js** (dashboard)
- **Axios** (HTTP client)
- **html2pdf.js** (cetak invoice)

### Tools & Lainnya

- **VS Code**
- **npm**
- **Git**

---

## Struktur Project

```
/ (root)
├── backend/         # Backend Express + MySQL
├── onlineshop/      # Frontend Vue 3 + Vite
├── README.md        # (file ini)
```

---

## Cara Menjalankan

### 1. Backend

```
cd backend
npm install
node index.js
```

### 2. Frontend

```
cd onlineshop
npm install
npm run dev
```

---

## Import Database

Sebelum menjalankan backend, lakukan import database berikut:

1. Buka MySQL (misal via phpMyAdmin, DBeaver, atau command line).
2. Buat database baru, misal: `onlineshop`.
3. Import file SQL yang sudah disediakan di:
   - `backend/lsp_onlineshop.sql`
4. Pastikan konfigurasi koneksi di `backend/db.js` sudah sesuai dengan nama database, user, dan password MySQL Anda.

---

## Catatan Penting

- Pastikan MySQL sudah berjalan dan database sudah di-setup.
- Folder `/uploads` di backend harus writable.
- Konfigurasi koneksi database ada di `backend/db.js`.
- Untuk development, backend berjalan di port 3001, frontend di 5173 (default Vite).

---

## Kontribusi & Lisensi

Silakan modifikasi, gunakan, dan kembangkan project ini sesuai kebutuhan.
