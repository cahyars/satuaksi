# Panduan Hosting Project SatuAksi di Hostinger

## 1. Ringkasan
Proyek ini terdiri dari:
- `frontend/`: aplikasi Next.js (React)
- `backend/`: server Node.js dengan Express dan Prisma
- `backend/prisma/schema.prisma`: menggunakan SQLite sebagai basis data default

Karena ada backend Node.js, opsi terbaik di Hostinger adalah menggunakan VPS, Cloud VPS, atau plan hosting yang mendukung Node.js. Shared hosting standar Hostinger biasanya tidak cocok untuk menjalankan server Node.js penuh.

## 2. Pilihan Hostinger
1. **Hostinger VPS / Cloud VPS** (direkomendasikan)
   - Mendukung Node.js
   - Bisa install npm, PM2, dan menjalankan backend serta frontend Next.js
2. **Hostinger Shared Hosting**
   - Hanya cocok jika kamu menjadikan frontend sebagai static site dan backend ditempatkan di layanan terpisah.
   - Pada proyek ini, tidak direkomendasikan karena backend membutuhkan runtime Node.js.

## 3. Persiapan sebelum deploy
1. Beli dan aktifkan layanan Hostinger yang mendukung Node.js: VPS atau Cloud VPS.
2. Siapkan akses SSH ke server Hostinger.
3. Siapkan domain atau subdomain untuk aplikasi.
4. Pastikan memiliki file proyek lengkap di lokal.
5. Pastikan Node.js dan npm kompatibel dengan dependensi:
   - `frontend` menggunakan Next.js 16 dan React 19
   - `backend` menggunakan Node.js / Express
6. Siapkan file environment dari contoh:
   - `backend/.env.example` → salin menjadi `backend/.env`
   - `frontend/.env.local.example` → salin menjadi `frontend/.env.local`

## 4. Struktur deployment yang direkomendasikan
- `frontend` dijalankan sebagai aplikasi Next.js: `npm run build` + `npm start`
- `backend` dijalankan sebagai API server Express: `npm install` + `node server.js`
- Gunakan `pm2` atau process manager lain untuk menjaga aplikasi tetap berjalan.

## 5. Tahapan deploy di Hostinger VPS
### 5.1. Login ke server
1. Akses SSH:
   ```bash
   ssh username@alamat-ip-server
   ```
2. Pastikan Node.js dan npm terpasang:
   ```bash
   node -v
   npm -v
   ```
3. Jika belum ada, install Node.js dan npm dengan paket manajer Ubuntu/Debian atau menggunakan NodeSource.

### 5.2. Salin kode ke server
1. Gunakan Git jika tersedia:
   ```bash
   git clone <repo-url> satuaksi
   ```
2. Atau upload file via SFTP/FTP ke direktori yang kamu pilih.
3. Pindah ke folder proyek:
   ```bash
   cd satuaksi
   ```

### 5.3. Siapkan backend
1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Install dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` di folder `backend/`.
4. Isi `.env` dengan variabel penting, misalnya:
   ```env
   PORT=5000
   DATABASE_URL="file:./dev.db"
   JWT_SECRET=isi_rahasia_jwt
   GOOGLE_API_KEY=isi_google_api_key
   ```
5. Jika menggunakan SQLite, pastikan server punya izin tulis di folder `backend/`.
6. Jalankan Prisma generate/migrate jika diperlukan:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
   > Catatan: Karena schema menggunakan `provider = "sqlite"`, deploy bisa berjalan tanpa database eksternal. Namun untuk produksi, migrasi ke MySQL/PostgreSQL akan lebih kuat jika kamu menggunakan Hostinger Database.

### 5.4. Menjalankan backend dengan PM2
1. Install PM2 global jika belum:
   ```bash
   npm install -g pm2
   ```
2. Jalankan backend:
   ```bash
   pm2 start server.js --name satuaksi-backend
   ```
3. Simpan konfigurasi PM2 agar restart otomatis:
   ```bash
   pm2 save
   pm2 startup
   ```

### 5.5. Siapkan frontend
1. Masuk ke folder frontend:
   ```bash
   cd ../frontend
   ```
2. Install dependensi:
   ```bash
   npm install
   ```
3. Build aplikasi Next.js:
   ```bash
   npm run build
   ```
4. Jalankan aplikasi Next.js:
   ```bash
   pm2 start npm --name satuaksi-frontend -- start
   ```
5. Pastikan `frontend/src/services/api.ts` atau konfigurasi API menggunakan URL backend server yang benar.
   - Contoh: `https://api.domainkamu.com` atau `http://alamat-ip:5000`

## 6. Konfigurasi domain dan reverse proxy
1. Jika menggunakan web server seperti Nginx, buat konfigurasi reverse proxy untuk:
   - `frontend` di port Next.js (misal `3000`)
   - `backend` di port Express (misal `5000`)
2. Contoh blok Nginx sederhana:
   ```nginx
   server {
     listen 80;
     server_name www.domainkamu.com domainkamu.com;

     location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }

     location /api/ {
       proxy_pass http://127.0.0.1:5000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```
3. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

## 7. Opsi lain: frontend statis + backend terpisah
Jika kamu hanya memiliki shared hosting tanpa Node.js, solusi alternatif:
- Export frontend ke static (opsi terbatas karena Next.js tidak otomatis statis untuk semua halaman).
- Taruh frontend statis di shared hosting.
- Jalankan backend di layanan lain seperti Heroku, Railway, Render, atau VPS lain.
- Sesuaikan URL API di frontend.

> Namun untuk aplikasi ini, solusi paling cocok adalah Hostinger VPS/Cloud dengan Node.js penuh.

## 8. Hal-hal penting yang perlu diperhatikan
- Pastikan `backend` dan `frontend` punya variabel lingkungan yang benar.
- Pastikan API frontend mengarah ke alamat backend yang dapat diakses.
- Pastikan folder database SQLite di server dapat ditulis jika kamu masih menggunakan SQLite.
- Jika pakai Hostinger MySQL, ubah `backend/prisma/schema.prisma` ke `provider = "mysql"` dan sesuaikan `DATABASE_URL`.
- Gunakan HTTPS / SSL agar aplikasi aman.

## 9. Checklist singkat
1. Pilih plan Hostinger VPS/Cloud.
2. Akses SSH dan install Node.js + npm.
3. Clone/upload repo ke server.
4. Install dependency `backend` dan `frontend`.
5. Konfigurasi `.env` untuk backend.
6. Build `frontend` dan jalankan dengan PM2.
7. Jalankan `backend` dengan PM2.
8. Konfigurasi domain/reverse proxy.
9. Cek aplikasi di browser.

---

Dengan langkah di atas, kamu dapat menjalankan `frontend` dan `backend` pada Hostinger VPS/Cloud secara bersamaan. Untuk hasil terbaik, gunakan VPS karena project ini memerlukan runtime Node.js dan akses database yang stabil.