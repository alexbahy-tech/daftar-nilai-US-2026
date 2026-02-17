# 📋 Panduan Setup — SMK Negeri 1 Maluku Tengah Sistem Nilai

## Cara Kerja Sistem

```
┌─────────────────┐       GET (baca)       ┌──────────────────┐       ┌─────────────┐
│  GitHub Pages   │ ◄──────────────────────► │  Apps Script API │ ◄────► │Google Sheets│
│  (index.html)   │       POST (simpan)     │    (Code.gs)     │       │ (DATA NILAI)│
└─────────────────┘                          └──────────────────┘       └─────────────┘
     Browser                                   Google Server              Database
```

- **GitHub Pages** = tampilan website (HTML)
- **Apps Script** = API perantara (baca + tulis ke Google Sheets)
- **Google Sheets** = database nilai siswa

GitHub Pages sendiri TIDAK BISA menulis ke Google Sheets.
Butuh Apps Script sebagai "jembatan" API.

---

## Langkah Setup (10 menit)

### STEP 1 — Deploy Apps Script API

1. Buka https://script.google.com
2. Klik **"Project Baru"**
3. Hapus semua isi `Code.gs`, paste isi file **Code.gs** yang disertakan
4. Klik **Deploy** → **New Deployment**
5. Di "Select type", pilih **Web app**
6. Isi:
   - **Description**: `SMK API`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
7. Klik **Deploy**
8. Klik **Authorize access** → pilih akun Google Anda → Allow
9. **COPY URL** yang muncul (format: `https://script.google.com/macros/s/AKfycb.../exec`)

> ⚠️ URL ini RAHASIA — jangan share ke publik

### STEP 2 — Paste URL ke index.html

1. Buka file **index.html**
2. Cari baris ini (sekitar baris 6-7 di dalam `<script>`):
   ```javascript
   var GAS_URL = '';
   ```
3. Paste URL dari Step 1 di antara tanda kutip:
   ```javascript
   var GAS_URL = 'https://script.google.com/macros/s/AKfycbxxxxxxx/exec';
   ```
4. Save file

### STEP 3 — Upload ke GitHub Pages

1. Buka repository GitHub Anda
2. Upload/update file `index.html`
3. Pastikan GitHub Pages aktif (Settings → Pages)
4. Buka website Anda — selesai!

---

## Testing

1. Buka website → Login (password: `SMKBisa`)
2. Pilih Program Keahlian → Pilih Mata Pelajaran
3. Klik tombol **"Edit Nilai"** di kanan atas tabel
4. Isi nilai di kolom input
5. Klik **"💾 Simpan Nilai"**
6. Cek Google Sheets — nilai harus sudah terupdate

---

## FAQ

**Q: Tanpa GAS_URL, apa yang terjadi?**
A: Website masih bisa MEMBACA data (via JSONP), tapi TIDAK BISA MENYIMPAN. 
   Banner kuning akan muncul mengingatkan setup.

**Q: Apakah harus deploy ulang kalau edit data di Sheets?**
A: Tidak. Data selalu dibaca langsung dari Google Sheets secara real-time.

**Q: Kalau saya edit Code.gs, harus deploy ulang?**
A: Ya. Setiap kali edit Code.gs, buat **New Deployment** baru dan update URL di index.html.

**Q: Error "Kelas tidak valid"?**  
A: Pastikan URL deployment sudah benar dan spreadsheet ID di Code.gs cocok.

**Q: Error CORS / fetch gagal?**
A: Pastikan di Apps Script deploy setting "Who has access" = "Anyone".
