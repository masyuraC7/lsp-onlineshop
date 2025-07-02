# Frontend - Online Shop

Frontend aplikasi ini dibangun menggunakan **Vue 3** (Composition API) dan **Vite** sebagai dev server & build tool.

## Fitur Utama

- UI responsif dan modern (Bootstrap 5)
- Halaman customer, admin, subadmin
- Manajemen produk, kategori, stok
- Keranjang belanja, checkout, riwayat transaksi
- Review produk
- Notifikasi, konfirmasi, dan loading bar global
- Cetak invoice (PDF)

## Teknologi

- [Vue 3](https://vuejs.org/) (Composition API, Pinia)
- [Vite](https://vitejs.dev/)
- [Bootstrap 5](https://getbootstrap.com/)
- [Chart.js](https://www.chartjs.org/)
- [Axios](https://axios-http.com/)
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)

## Struktur Folder

```
onlineshop/
├── src/
│   ├── components/   # Komponen UI
│   ├── pages/        # Halaman utama
│   ├── stores/       # Pinia store
│   ├── router/       # Routing Vue
│   └── ...
├── public/
├── vite.config.js
├── package.json
```

## Dokumentasi

- [Vue 3 Documentation](https://vuejs.org/guide/introduction.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.0/getting-started/introduction/)

## Menjalankan Frontend

```
cd onlineshop
npm install
npm run dev
```

Pastikan backend sudah berjalan di port 3001 agar API dapat diakses.
