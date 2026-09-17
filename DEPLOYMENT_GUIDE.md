# 🚀 Panduan Deployment GitHub Pages

## Langkah-Langkah Lengkap

### 1. **Setup Repository GitHub (Jika Belum Ada)**
```bash
# Inisialisasi Git (jika belum)
git init

# Tambah remote repository (ganti dengan URL repo Anda)
git remote add origin https://github.com/username/repository-name.git
```

### 2. **Upload Files ke GitHub**
```bash
# Cek status files
git status

# Tambah semua files
git add .

# Commit dengan pesan yang jelas
git commit -m "Add Expense & Budget Visualizer web app"

# Push ke GitHub
git push -u origin main
```

### 3. **Enable GitHub Pages**

#### Melalui Website GitHub:
1. **Buka Repository** di GitHub.com
2. Klik tab **"Settings"** (di bagian atas menu repository)
3. **Scroll ke bawah** di sidebar kiri, cari **"Pages"**
4. Pada bagian **"Source"**:
   - Pilih **"Deploy from a branch"**
   - Branch: **"main"**
   - Folder: **"/ (root)"**
5. Klik **"Save"**

#### Melalui GitHub CLI (Alternative):
```bash
# Install GitHub CLI jika belum ada
# Kemudian jalankan:
gh repo view --web
# Lalu ikuti langkah di atas
```

### 4. **Verifikasi Deployment**

Setelah 2-5 menit, website akan tersedia di:
```
https://[username].github.io/[repository-name]
```

**Contoh:**
Jika username GitHub: `johndoe` dan repository: `expense-tracker`
Maka URL website: `https://johndoe.github.io/expense-tracker`

### 5. **Update Website (Untuk Perubahan Selanjutnya)**
```bash
# Setiap kali ada perubahan:
git add .
git commit -m "Update: deskripsi perubahan"
git push origin main
```

## ✅ Checklist Deployment

- [ ] Repository sudah ada di GitHub
- [ ] File `index.html` ada di root folder
- [ ] Folder `css/` dan `js/` sudah terupload
- [ ] GitHub Pages sudah diaktifkan
- [ ] Website bisa diakses di URL GitHub Pages
- [ ] Semua fitur berfungsi dengan baik online

## 🔧 Troubleshooting

### Problem: Website tidak muncul
**Solusi:**
- Tunggu 5-10 menit untuk deployment
- Pastikan `index.html` ada di root folder
- Cek Settings > Pages sudah benar

### Problem: CSS/JS tidak load
**Solusi:**
- Pastikan path relatif: `css/styles.css` bukan `/css/styles.css`
- Cek console browser untuk error 404

### Problem: Chart.js tidak muncul
**Solusi:**
- Pastikan koneksi internet untuk CDN
- Atau download Chart.js dan simpan lokal

## 🎯 Tips Tambahan

1. **Custom Domain (Optional):**
   - Bisa tambah custom domain di Settings > Pages
   - Contoh: `www.myexpensetracker.com`

2. **HTTPS:**
   - GitHub Pages otomatis menggunakan HTTPS
   - Website Anda akan aman untuk pengguna

3. **SEO:**
   - Tambah meta tags di `<head>` untuk SEO
   - Tambah favicon untuk branding

4. **Analytics:**
   - Bisa tambah Google Analytics
   - Track pengunjung website

## 📱 Test Website

Setelah deploy, test di:
- [ ] Desktop browser
- [ ] Mobile browser  
- [ ] Different browsers (Chrome, Firefox, Safari)
- [ ] Check all features work online

## 🎉 Selesai!

Website Expense & Budget Visualizer Anda sekarang sudah online dan bisa diakses siapa saja di internet!