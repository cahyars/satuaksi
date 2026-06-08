# LifeLine AI - Platform AI Predictive Public Safety 🌐🚨

**LifeLine AI** adalah platform keselamatan publik masa depan yang membantu mencegah bahaya sebelum kejadian terjadi. Dengan memadukan sensor telemetri smartphone, laporan komunitas terverifikasi, anomali cuaca ekstrem, dan kecerdasan Gemini ai, kami membangun jaringan keselamatan terpantau di ujung jari Anda.

---

## 🛠️ Tech Stack & Modul

* **Frontend**: Next.js 15 App Router, TypeScript, Zustand, Framer Motion, Recharts, Tailwind CSS.
* **Backend**: Express.js, TypeScript/JavaScript MVC, Prisma ORM, Socket.io (Real-time).
* **Database**: MySQL.
* **Integrasi AI**: Google Gemini 2.5 Flash (via `@google/generative-ai`).

---

## 🚀 Panduan Memulai Cepat

### 1. Inisialisasi Database (MySQL)

Pastikan layanan MySQL Anda telah aktif (misal via XAMPP/Laragon). 
1. Buat database baru bernama `lifeline_ai`.
2. Masuk ke direktori `backend` dan jalankan migrasi database serta dummy seed data:
```bash
cd backend
npx prisma db push
npm run db:seed
```

*Note: Data awal akan diisi dengan data simulasi bencana alam, kriminalitas, akun Admin (`admin@lifeline.ai` / `admin123`), dan akun Warga (`warga@lifeline.ai` / `user123`).*

### 2. Menjalankan Server Backend Express.js

Di dalam folder `backend`, jalankan:
```bash
npm run dev
```
Server backend akan aktif di `http://localhost:5000` dengan koneksi Socket.io siap siaga.

### 3. Menjalankan Aplikasi Frontend Next.js

Di dalam folder `frontend`, jalankan:
```bash
npm run dev
```
Buka `http://localhost:3001` pada peramban Anda untuk menikmati dashboard premium LifeLine AI.

---

## 🔑 Akun Uji Coba Demo

Untuk login cepat ke dalam dashboard, gunakan akun bawaan hasil seed berikut:

* **Level Administrator**:
  * **Email**: `admin@lifeline.ai`
  * **Sandi**: `admin123`
* **Level Warga Umum**:
  * **Email**: `warga@lifeline.ai`
  * **Sandi**: `user123`
