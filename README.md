# GA Yayasan — Aplikasi Sarana & Prasarana

Aplikasi web internal untuk divisi General Affair (GA) yang mengelola sarana dan prasarana di seluruh unit yayasan (PAUD, SD, SMP, SMA).

*made by al with love*

## Modul

1. **Perbaikan Sarpra** — staff unit mengajukan laporan kerusakan, GA memproses statusnya.
2. **Pengajuan Sarana** — staff unit mengajukan kebutuhan sarana/barang baru, GA memproses statusnya.
3. **Peminjaman Sarana** — staff unit mengajukan peminjaman barang. **Yang berhak Approve/Edit/Tolak adalah staff dari unit PEMILIK barang** (bukan cuma GA) — mis. Staff SD meminjam proyektor milik SMP, maka Staff SMP yang memproses permohonan tersebut. GA tetap punya akses penuh sebagai oversight.
4. **Inventarisir Barang** — setiap staff bisa menambahkan aset, dan kepemilikan otomatis mengikuti unit staff yang menambahkan (tidak bisa dititipkan ke unit lain). GA bisa menambah/mengubah aset untuk unit mana pun. Tersedia juga tombol **Unduh Template Excel** dan **Import Excel** untuk input massal — kode aset boleh dikosongkan di template, akan dibuat otomatis oleh sistem.
5. **Pemetaan Aset** — daftar aset dikelompokkan per unit dan lokasi.

## Peran & Kepemilikan

- **GA** — melihat semua pengajuan dari seluruh unit, memproses status seluruh jenis pengajuan, dan mengelola aset semua unit.
- **STAFF** — melihat & mengajukan untuk unitnya sendiri; menambah/mengedit aset miliknya sendiri; khusus **Peminjaman**, berwenang memproses permohonan yang menyasar aset milik unitnya.

## Teknologi

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + SQLite (mudah dijalankan lokal; tinggal ganti `provider` ke `postgresql` di `prisma/schema.prisma` untuk produksi)
- Autentikasi sesi sederhana (cookie httpOnly + JWT via `jose`, password di-hash dengan `bcryptjs`)

## Menjalankan di Komputer Anda

Pastikan Node.js versi 18+ terpasang.

```bash
# 1. Masuk ke folder project
cd ga-app

# 2. Install dependencies (ini juga otomatis menjalankan `prisma generate`)
npm install

# 3. Buat database SQLite & tabel-tabelnya
npx prisma migrate dev --name init

# 4. Isi data awal (akun login + contoh aset)
npm run seed

# 5. Jalankan aplikasi
npm run dev
```

Buka `http://localhost:3000`.

Jika sebelumnya Anda sudah pernah menjalankan `npm run seed` (database sudah ada, mis. sudah punya akun GA & Staff SMP), **jalankan `npm run seed` lagi setelah update ini** — aman diulang (upsert), akan menambahkan 3 akun staff yang belum ada tanpa mengubah/menghapus data yang sudah ada.

## Akun Login (dari seed)

Semua akun memakai password yang sama: **password123**

| Peran | Email |
|---|---|
| GA | ga@albanna.sch.id |
| Staff PAUD | staff.paud@albanna.sch.id |
| Staff SD | staff.sd@albanna.sch.id |
| Staff SMP | staff.smp@albanna.sch.id |
| Staff SMA | staff.sma@albanna.sch.id |

**Segera ganti password ini** setelah setup awal — buat halaman/skrip ubah password, atau update manual lewat Prisma Studio (`npx prisma studio`).

## Menambah Unit / Akun Lain

Edit `prisma/seed.ts` untuk menambah unit atau user lain, lalu jalankan ulang `npm run seed`. Atau gunakan `npx prisma studio` untuk mengelola data lewat antarmuka visual.

## Catatan Keamanan Sebelum Produksi

- Ganti `SESSION_SECRET` di file `.env` dengan string acak yang panjang dan rahasia.
- Pindahkan `DATABASE_URL` ke PostgreSQL/MySQL untuk deployment (Vercel + Neon/Supabase direkomendasikan).
- Pertimbangkan menambah fitur reset password & pembuatan akun oleh GA langsung dari aplikasi (saat ini akun dibuat lewat seed/Prisma Studio).

## Struktur Folder

```
app/
├── login/                  # halaman login
├── dashboard/
│   ├── perbaikan/          # modul 1
│   ├── pengajuan-sarana/   # modul 2
│   ├── peminjaman/         # modul 3
│   ├── inventaris/         # modul 4
│   └── pemetaan-aset/      # modul 5
└── api/                    # route handler (auth, requests, assets)
components/                 # komponen UI
lib/                        # auth, prisma client, helper label
prisma/                     # schema & seed database
```

## Deploy ke GitHub + Netlify

Aplikasi ini pakai **Neon (Postgres)** untuk database dan **Netlify Blobs** untuk foto/dokumen — bukan SQLite/disk lokal, karena hosting serverless filesystem-nya sementara (ephemeral), tidak cocok untuk simpan data permanen.

Netlify dipilih (bukan Vercel) karena free tier-nya **tidak melarang pemakaian organisasi/kerja** — aman dipakai untuk aplikasi internal yayasan seperti ini.

### 1. Bikin database Neon
1. Daftar di [neon.tech](https://neon.tech), buat project baru
2. Copy **connection string** dari dashboard
3. Tempel ke `.env` lokal Anda sebagai `DATABASE_URL`

### 2. Migrasi database (dari komputer lokal)
```bash
npm install
npx prisma migrate deploy
npm run seed
```

### 3. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```
> `.env` **tidak akan ikut ter-commit** (sudah masuk `.gitignore`) — aman, kredensial tidak bocor ke GitHub.

### 4. Deploy ke Netlify
1. Daftar di [netlify.com](https://netlify.com) → **Sign up** → pilih **GitHub** (tanpa kartu kredit)
2. Di dashboard, klik **Add new site > Import an existing project**
3. Pilih **Deploy with GitHub**, cari & pilih repo Anda
4. Netlify otomatis mendeteksi ini project Next.js (lewat `@netlify/plugin-nextjs`) — biarkan pengaturan default
5. Buka bagian **Environment variables**, tambahkan:
   - `DATABASE_URL` → connection string Neon Anda
   - `SESSION_SECRET` → string acak panjang yang sama dengan di `.env`
6. Klik **Deploy site** — tunggu beberapa menit
7. Setelah selesai, Netlify kasih Anda URL seperti `nama-acak.netlify.app` (bisa diganti nama custom di Site settings)

### 5. Aktifkan Netlify Blobs (untuk foto & dokumen)
Netlify Blobs **tidak perlu setup manual apa pun** — begitu situs Anda live di Netlify, fitur upload foto/dokumen otomatis jalan tanpa environment variable tambahan.

### 6. Development lokal (opsional, kalau mau lanjut ngoding di komputer)
Untuk fitur biasa (login, CRUD, dsb), tetap pakai:
```bash
npm run dev
```

**Tapi untuk uji coba fitur upload foto/dokumen**, perlu Netlify CLI supaya Netlify Blobs bisa jalan secara lokal:
```bash
npm install -g netlify-cli
netlify login
netlify link          # sambungkan folder lokal ke site Netlify Anda
netlify dev            # jalankan dev server lewat Netlify (bukan npm run dev)
```

### 7. Setelah itu
Tiap kali Anda `git push` ke branch `main`, Netlify otomatis build & deploy ulang. Push ke branch lain akan menghasilkan **deploy preview** terpisah untuk uji coba sebelum ke production.
