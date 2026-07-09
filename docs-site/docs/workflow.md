---
sidebar_position: 4
title: Fitur & Alur Kerja Utama
---

# 🔄 Fitur & Alur Kerja Utama

Dokumen ini menjelaskan alur operasional utama sistem dan logika bisnis yang diterapkan pada masing-masing peran pengguna.

---

## 🔑 1. Registrasi Akun & Validasi Whitelist

Untuk mencegah pihak luar mendaftar ke sistem, pendaftaran akun mahasiswa dan dosen divalidasi silang menggunakan data akademik kampus yang terdaftar di tabel `civitas_akademika`:

```text
[User di Form Register] 
      │ 
      │ 1. Input NIM/NIDN & Nama Lengkap
      ▼
[Server Next.js (Service Role)]
      │
      │ 2. Cari di `civitas_akademika` berdasarkan identifier
      ├─► [Tidak Ditemukan] ──► Tolak (Tampilkan pesan error)
      ├─► [Sudah Terdaftar] ──► Tolak ("Identifier sudah terdaftar")
      │
      │ 3. Normalisasi Nama & Bandingkan
      ├─► [Nama Tidak Sesuai] ─► Tolak ("Nama tidak sesuai data akademik")
      ▼
[Pendaftaran Sukses]
      │
      │ 4. Buat auth.users di Supabase
      │ 5. Buat profil di `profiles`
      │ 6. Tandai `civitas_akademika.is_registered` = TRUE
```

* **Keamanan Tambahan**: Jika terjadi kegagalan sistem setelah akun auth dibuat tetapi gagal saat menyimpan baris profil, server secara otomatis akan menghapus kembali (*rollback*) akun auth yang sudah terlanjur dibuat agar tidak terjadi akun "yatim".

---

## 📤 2. Alur Pengajuan Karya (Upload KTI)

Mahasiswa/dosen yang sudah masuk dapat mengajukan karya tulis ilmiah dengan langkah berikut:

1. **Pengisian Formulir**: Mengisi metadata karya (Judul, Abstrak, Jenis Karya, Program Studi, Dosen Pembimbing, Tahun, Kata Kunci).
2. **Pengecekan Checklist Mandiri**: Sebelum menekan submit, pengaju wajib mencentang 4 syarat keabsahan:
   - Karya bebas plagiarisme (sudah uji kemiripan).
   - Format penulisan sesuai dengan pedoman instansi.
   - Karya sudah ditandatangani/disetujui dosen pembimbing.
   - Menyelesaikan urusan bebas pustaka di perpustakaan.
3. **Penyimpanan**: Berkas PDF diunggah ke cPanel via FTPS dan metadatanya dimasukkan ke tabel `submissions` dengan status awal `pending`.
4. **Notifikasi**: Sistem mengirim email notifikasi pengajuan masuk ke kotak masuk email pengguna menggunakan **Resend API**.

---

## 📝 3. Peninjauan Karya oleh Akademik (Reviewer)

Akademik (staff/admin) bertanggung jawab meninjau pengajuan KTI melalui Panel Admin:

1. **Dashboard Review**: Menampilkan daftar seluruh antrian pengajuan berdasarkan tab: *Menunggu Review*, *Disetujui*, atau *Ditolak*.
2. **Pratinjau File**: Reviewer dapat membaca dokumen secara instan tanpa mengunduh file mentahnya secara publik menggunakan Signed URL.
3. **Keputusan Reviewer**:
   - **Disetujui (`approved`)**: Karya akan langsung dipublikasikan dan dapat diakses oleh publik secara bebas di menu "Cari Karya".
   - **Ditolak (`rejected`)**: Karya ditolak untuk direvisi. Reviewer wajib memasukkan catatan alasan penolakan/revisi.
4. **Notifikasi Hasil**: Sistem secara otomatis mengirimkan email notifikasi status hasil review ke email mahasiswa/dosen yang bersangkutan.

---

## 👥 4. Manajemen Akun oleh Super Admin

Super Admin memiliki panel khusus di `/admin/staff` dan `/admin/users` untuk mengelola seluruh akun pengguna di sistem:

### ⚙️ Pengelolaan Akun Staff (Reviewer)
* Admin dapat mendaftarkan akun staff baru dengan memasukkan nama, inisial/identifier, dan password awal.
* Admin dapat memperbarui nama, inisial, role (`staff` ↔ `admin`), serta mereset sandi masuk staff.
* Admin dapat menghapus akun staff (akun admin lain tidak dapat dihapus melalui antarmuka ini untuk mencegah penguncian sistem tidak sengaja).

### 🎓 Pengelolaan Akun Mahasiswa & Dosen
* Admin dapat mencari pengguna berdasarkan nama atau NIM/NIDN.
* Admin dapat memfilter daftar berdasarkan tab Mahasiswa / Dosen / Semua.
* Admin dapat mengedit profil secara inline: nama lengkap, identifier, program studi, email kontak, dan mereset password baru.
* **Fitur Hapus Akun yang Aman**: Untuk mencegah kerusakan relasi data (*broken foreign key references*), **akun mahasiswa/dosen tidak bisa dihapus jika ia masih memiliki karya (submission) aktif di database**. Admin harus menghapus seluruh submission miliknya terlebih dahulu di panel admin utama sebelum menghapus akunnya. Setelah akun terhapus, data di tabel `civitas_akademika` akan di-reset (`is_registered = false` dan `user_id = null`) sehingga NIM/NIDN tersebut dapat digunakan kembali untuk mendaftar akun baru.
