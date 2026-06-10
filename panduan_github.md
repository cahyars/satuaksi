# Panduan Push Project SatuAksi ke GitHub

Repository tujuan:
https://github.com/cahyars/satuaksi.git

## 1. Pastikan repository Git sudah terinisialisasi
Jika kamu sudah berada di folder project `SatuAksi`, jalankan:
```bash
git status
```
Jika belum ada `.git`, inisialisasi:
```bash
git init
```

## 2. Periksa branch dan remote saat ini
```bash
git branch --show-current

git remote -v
```
Jika branch saat ini `main`, gunakan `main`.

## 3. Atur remote ke GitHub baru
Jika remote belum ada:
```bash
git remote add origin https://github.com/cahyars/satuaksi.git
```
Jika remote `origin` sudah menunjuk repositori lain, ganti alamatnya:
```bash
git remote set-url origin https://github.com/cahyars/satuaksi.git
```

## 4. Pastikan file penting sudah diabaikan (`.gitignore`)
Kamu sudah memiliki `.gitignore` masing-masing di:
- `backend/.gitignore`
- `frontend/.gitignore`

Jika ingin, tambahkan root `.gitignore` di folder `SatuAksi` untuk melindungi file environment atau build di root.

## 5. Tambahkan semua file dan buat commit
```bash
git add .
git commit -m "Initial commit for SatuAksi"
```

## 6. Pastikan nama branch utama adalah `main`
Jika masih `master` atau nama lain, ubah ke `main`:
```bash
git branch -M main
```

## 7. Push ke GitHub
```bash
git push -u origin main
```

Jika repository GitHub sudah ada dan kosong, perintah di atas akan mengirim semua isi project.

## 8. Jika GitHub sudah memiliki branch dan kamu ingin menyelaraskan
Gunakan `git pull origin main --rebase` atau `git fetch` terlebih dahulu sebelum push.

## 9. Setelah push berhasil
Buka:
- https://github.com/cahyars/satuaksi

Pastikan seluruh folder `backend/`, `frontend/`, dan file `panduan_hosting.md` ikut terkirim.

## 10. Clone dari server SSH nanti
Di server Hostinger atau VPS, kamu bisa langsung menjalankan:
```bash
cd ~/path/ke/folder
git clone https://github.com/cahyars/satuaksi.git
cd satuaksi
```

## 11. Lanjutkan setup di server
Setelah clone, jalankan:
```bash
cd satuaksi/backend
npm install

cd ../frontend
npm install
npm run build
```

Jika kamu menggunakan Hostinger Node.js dan hanya punya satu Node app, jalankan backend sebagai Node app, lalu deploy frontend secara statis jika perlu.

## Catatan tambahan
- Jangan commit file `.env` nyata ke GitHub.
- Kamu sudah membuat file contoh environment:
  - `backend/.env.example`
  - `frontend/.env.local.example`
- Jika sudah ada perubahan di repo lokal, cukup ulangi `git add .`, `git commit -m "..."`, lalu `git push`.
