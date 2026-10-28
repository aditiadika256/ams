# Media Library Central API

Dokumentasi API terpusat untuk repositori **Media Library** pada Arkanin Management System (AMS), yang terhubung langsung dengan workspace Program, komponen kurikulum, dan arsitektur Cloudflare R2 & Edge CDN.

## Base URL

```
/api/v1/admin/media-library
```

## Authentication & Authorization

Semua endpoint memerlukan autentikasi Bearer token dengan permission yang sesuai:
- `component-definition.view` atau `program.view`: melihat daftar berkas di Media Library
- `media-asset.upload`: mengunggah berkas baru ke repositori Media Library
- `media-asset.delete`: menghapus berkas dari Media Library

```http
Authorization: Bearer {token}
Accept: application/json
```

---

## Format Berkas & Kemampuan Pratinjau (Format-Specific Preview)

API mendukung pengelolaan berbagai format berkas pembelajaran digital dengan deteksi tipe MIME otomatis:

| Kategori Berkas | Ekstensi Didukung | Dukungan Pratinjau (Viewer) |
| :--- | :--- | :--- |
| **Dokumen PDF** | `.pdf` | Interactive PDF Viewer (native embed & toolbar) |
| **Dokumen Word** | `.docx`, `.doc`, `.rtf`, `.odt` | Microsoft Office Online Viewer via CDN / Google Docs Viewer |
| **Lembar Kerja Excel** | `.xlsx`, `.xls`, `.csv`, `.ods` | Microsoft Office Online Viewer via CDN / Google Docs Viewer |
| **Presentasi Slide** | `.pptx`, `.ppt`, `.odp` | Microsoft Office Online Viewer via CDN / Google Docs Viewer |
| **Video Streaming** | `.mp4`, `.webm`, `.mov`, `.mkv` | HTML5 Responsive Video Player (kontrol durasi, fullscreen) |
| **Audio Pembelajaran**| `.mp3`, `.wav`, `.m4a`, `.ogg`, `.aac` | HTML5 Audio Player dengan metadata track |
| **Gambar Grafis** | `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.gif` | Image Viewer dengan kontrol Zoom (50% - 300%) |
| **Teks & Kode Sumber** | `.txt`, `.json`, `.md`, `.xml`, `.csv` | Monospace Text & Code Content Viewer |
| **Arsip Terkompresi** | `.zip`, `.rar`, `.7z`, `.tar`, `.gz` | Archive Metadata Inspector & Direct Secure Download |

---

## Endpoints

### 1. List Central Media Library

Mengambil daftar seluruh berkas materi digital dari repositori pusat Media Library dengan dukungan filter pencarian, filter folder, filter program, dan pagination.

```http
GET /api/v1/admin/media-library
```

#### Query Parameters

| Nama | Tipe | Wajib | Keterangan |
| :--- | :---: | :---: | :--- |
| `search` | string | Tidak | Kata kunci pencarian nama berkas atau folder |
| `program_id` | integer | Tidak | Filter berkas berdasarkan ID program tertentu |
| `folder` | string | Tidak | Filter berkas berdasarkan nama folder (contoh: `materials`, `documents`, `curriculum`, `slides`) |
| `type` | string | Tidak | Filter jenis format: `pdf`, `video`, `audio`, `image`, `document` |
| `per_page` | integer | Tidak | Jumlah item per halaman (default: `15`) |
| `page` | integer | Tidak | Halaman pagination (default: `1`) |

#### Response `200 OK`

```json
{
  "success": true,
  "message": "Media library assets retrieved successfully",
  "data": [
    {
      "id": 25,
      "program_id": 7,
      "folder": "materials",
      "original_name": "Modul-01-Pengenalan.pdf",
      "mime_type": "application/pdf",
      "extension": "pdf",
      "size_bytes": 1048576,
      "checksum_sha256": "4a5e1289b418fa789c0912ab8e4587de6478bf1290ab4356cd891234567890ef",
      "cdn_url": "https://pub-043d267920b64ff7b8d21410e443f7ee.r2.dev/programs/7/2026/10/modul.pdf",
      "url": "https://pub-043d267920b64ff7b8d21410e443f7ee.r2.dev/programs/7/2026/10/modul.pdf",
      "storage_disk": "cloudflare_r2",
      "created_by": 1,
      "updated_by": 1,
      "uploader_name": "Super Admin",
      "program": {
        "id": 7,
        "name": "Fullstack Web Development",
        "code": "FSWD-2026"
      },
      "created_at": "2026-10-28T10:00:00.000000Z",
      "updated_at": "2026-10-28T10:00:00.000000Z"
    }
  ],
  "links": {
    "first": "https://api.domain.com/api/v1/admin/media-library?page=1",
    "last": "https://api.domain.com/api/v1/admin/media-library?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 1,
    "total": 1,
    "total_storage_bytes": 1048576
  }
}
```

---

### 2. Upload Asset to Central Media Library

Mengunggah berkas baru langsung ke Cloudflare Storage (R2 & Edge CDN) dan menyimpannya di Media Library pusat dengan opsi penautan langsung ke program dan folder kategori.

```http
POST /api/v1/admin/media-library/upload
Content-Type: multipart/form-data
```

#### Form-Data Parameters

| Field | Tipe | Wajib | Keterangan |
| :--- | :---: | :---: | :--- |
| `file` | file | Ya | File biner yang diunggah (Maks. 104.857.600 bytes / 100 MB). Format didukung: PDF, DOCX, XLSX, PPTX, MP4, WEBM, MP3, ZIP, PNG, JPG, JPEG, SVG |
| `program_id` | integer | Tidak | ID program pembelajaran jika berkas ingin ditautkan spesifik |
| `folder` | string | Tidak | Kategori folder penyimpanan (default: `materials`) |
| `reason` | string | Tidak | Catatan alasan pengunggahan untuk audit trail |

#### Response `201 Created`

```json
{
  "success": true,
  "message": "File berhasil diunggah ke Media Library Cloudflare",
  "data": {
    "id": 26,
    "program_id": 7,
    "folder": "materials",
    "original_name": "Silabus-2026.pdf",
    "mime_type": "application/pdf",
    "extension": "pdf",
    "size_bytes": 524288,
    "checksum_sha256": "8f3a91823901bcefa48912cd78ef01ab2345678901234567890123456789abcd",
    "cdn_url": "https://pub-043d267920b64ff7b8d21410e443f7ee.r2.dev/programs/7/2026/10/silabus.pdf",
    "url": "https://pub-043d267920b64ff7b8d21410e443f7ee.r2.dev/programs/7/2026/10/silabus.pdf",
    "storage_disk": "cloudflare_r2",
    "created_by": 1,
    "updated_by": 1,
    "uploader_name": "Super Admin",
    "program": {
      "id": 7,
      "name": "Fullstack Web Development",
      "code": "FSWD-2026"
    },
    "created_at": "2026-10-28T10:15:00.000000Z",
    "updated_at": "2026-10-28T10:15:00.000000Z"
  }
}
```

---

### 3. Delete Asset from Media Library

Menghapus media asset secara permanen dari basis data dan menghapus objek fisik dari Cloudflare R2 Storage.

```http
DELETE /api/v1/admin/media-library/{mediaAsset}
```

#### Parameters

| Nama | Letak | Tipe | Wajib | Keterangan |
| :--- | :---: | :---: | :---: | :--- |
| `mediaAsset` | path | integer | Ya | ID unik dari `MediaAsset` yang akan dihapus |

#### Response `200 OK`

```json
{
  "success": true,
  "message": "Media asset deleted successfully"
}
```

---

## Audit Trail Fields

Seluruh entri `MediaAsset` memiliki field audit kepemilikan dan pelacakan riwayat:
- `created_at`: Waktu unggah awal berkas.
- `created_by`: ID pengguna yang mengunggah berkas.
- `updated_at`: Waktu pembaruan data berkas terakhir.
- `updated_by`: ID pengguna yang melakukan pembaruan berkas terakhir.
- `uploader_name`: Nama lengkap pengguna yang mengunggah (resolved dari relasi `creator`).
- `checksum_sha256`: Hash kriptografis integritas data berkas.
