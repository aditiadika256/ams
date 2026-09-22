# Master Indeks Dokumentasi Platform Arkanin

Indeks ini memetakan seluruh dokumentasi arsitektur, produk, API, dan panduan operasional pada repositori **Arkanin Education Platform (`lms.arkanin.my.id`)**.

---

## 🌟 1. Dokumen Rujukan Utama (Single Source of Truth)

Dokumen-dokumen berikut merupakan sumber kebenaran produk dan panduan aktif pengembangan:

| Dokumen | Deskripsi | Status |
| --- | --- | --- |
| **[Master To-Do List (2026-09-21)](file:///d:/project/ams/docs/to-do-list.md)** | Peta kerja & backlog prioritas pengembangan 5 tahap | **Active (Sprint Core)** |
| **[PRD Ekosistem & Mekanisme Baru](file:///d:/project/ams/docs/plans/2026-09-21-PRD-ekosistem-dan-mekanisme-baru.md)** | PRD resmi mencakup AMS, ASA, ASD, A+, A-Teams, Dual-Wallet, CBT 5 tipe, dan Gamifikasi Store | **Active (Authoritative)** |
| **[PRD Refactor Programs & Workspace](file:///d:/project/ams/docs/plans/2026-08-20-PRD-refactor-programs-workspace.md)** | Arsitektur program modular (penghapusan level/type, penggantian ke tag & component) | **Active (Architecture Base)** |
| **[Program Workspace API Contract](file:///d:/project/ams/docs/program-workspace-api.md)** | Kontrak endpoint API resmi untuk program modular dan workspace | **Active (API Contract)** |

---

## 🛠️ 2. Panduan Setup & Infrastruktur

| Dokumen | Deskripsi |
| --- | --- |
| **[Quickstart](file:///d:/project/ams/docs/quickstart.md)** | Ringkasan cepat menjalankan project dengan Docker |
| **[Setup Guide (Docker)](file:///d:/project/ams/docs/setup.md)** | Panduan lengkap instalasi developer baru menggunakan Docker Desktop |
| **[Setup Lokal (Tanpa Docker)](file:///d:/project/ams/docs/setup-local.md)** | Panduan menjalankan backend Laravel dan frontend Next.js langsung di OS host |
| **[Database Standard](file:///d:/project/ams/docs/database-standard.md)** | Standar kolom tabel wajib (`id`, `row_status`, audit timestamps & users) |
| **[Deployment Guide](file:///d:/project/ams/docs/deployment.md)** | Prosedur rilis dan deployment production |
| **[Ops README](file:///d:/project/ams/docs/ops/README.md)** | Konfigurasi Docker, Nginx reverse proxy, dan CI/CD |

---

## 🔐 3. Autentikasi, Keamanan & Sesi

| Dokumen | Deskripsi |
| --- | --- |
| **[Analisis Mekanisme Sesi](file:///d:/project/ams/docs/session_management_analysis.md)** | Analisis sesi Sanctum stateless vs cookie HttpOnly dan rekomendasi security |
| **[Auth Development Guide](file:///d:/project/ams/docs/auth/development-guide.md)** | Struktur controller auth, form requests, dan model HasRoles |
| **[Google OAuth Integration](file:///d:/project/ams/docs/auth/google-integration.md)** | Panduan integrasi login Google OAuth & Socialite |
| **[Google OAuth Flow](file:///d:/project/ams/docs/dev-guide/google-oauth-flow.md)** | Diagram sekuens alur pertukaran token Google OAuth |

---

## 📡 4. Spesifikasi API & Postman Reference

| Modul API | Path Dokumen |
| --- | --- |
| **Auth, Programs, & Orders** | [docs/api/auth-programs-orders.md](file:///d:/project/ams/docs/api/auth-programs-orders.md) |
| **Computer-Based Testing (CBT)** | [docs/api/cbt.md](file:///d:/project/ams/docs/api/cbt.md) |
| **Admin & CMS Posts** | [docs/api/admin-cms.md](file:///d:/project/ams/docs/api/admin-cms.md) |
| **Learning & Curriculum** | [docs/api/learning-curriculum.md](file:///d:/project/ams/docs/api/learning-curriculum.md) |
| **Finance & Analytics** | [docs/api/finance-analytics.md](file:///d:/project/ams/docs/api/finance-analytics.md) |
| **Color Palette API** | [docs/api/color-palette-api.md](file:///d:/project/ams/docs/api/color-palette-api.md) |

---

## 🎨 5. Desain Antarmuka & Frontend

| Dokumen | Deskripsi |
| --- | --- |
| **[UI Style System](file:///d:/project/ams/docs/web/UI-style.md)** | Sistem desain visual, palet warna, tipografi, dan tokens |
| **[Refactoring Admin Views](file:///d:/project/ams/docs/dev-guide/refactoring-admin-views.md)** | Standar pemisahan `view.tsx` dan modal dialog `form.tsx` glassmorphism |
| **[UI Wireframe Design](file:///d:/project/ams/docs/ui-wireframe-design)** | Kumpulan wireframe antarmuka per persona (Admin, Guest, Member, Mentor, Student) |

---

## ⚠️ 6. Dokumen yang Tereliminasi / Deprecated (Arsip)

Dokumen berikut **tidak lagi berlaku** dan telah digantikan oleh spesifikasi arsitektur baru:

| Dokumen Usang | Alasan Eliminasi | Dokumen Pengganti |
| --- | --- | --- |
| `docs/master-main-menu.md` | Konsep `ProgramLevel` dan `ProgramType` telah dihapus total. | [PRD Ekosistem Baru](file:///d:/project/ams/docs/plans/2026-09-21-PRD-ekosistem-dan-mekanisme-baru.md) |
| `docs/plans/2026-07-31-program-master-lov-design.md` | Rancangan tabel lookup level/type dibatalkan oleh arsitektur modular. | [PRD Refactor Programs](file:///d:/project/ams/docs/plans/2026-08-20-PRD-refactor-programs-workspace.md) |
| `docs/plans/2026-07-31-program-master-lov.md` | Rencana implementasi level/type master tidak lagi valid. | [Master To-Do List](file:///d:/project/ams/docs/to-do-list.md) |
| `docs/new-concept.md` | Draf mentah catatan chat telah diformalisasikan ke PRD resmi. | [PRD Ekosistem Baru](file:///d:/project/ams/docs/plans/2026-09-21-PRD-ekosistem-dan-mekanisme-baru.md) |
