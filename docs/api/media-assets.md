# Media Assets API

Dokumentasi endpoint API untuk pengelolaan berkas privat dan Media Library pada program pembelajaran Arkanin Management System (AMS).

## Base URL

```
/api/v1/admin/programs/{program}/media-assets
```

## Authentication & Authorization

Semua endpoint memerlukan autentikasi Bearer token dengan permission:
- `program.view` atau `media-asset.upload` untuk melihat daftar berkas
- `media-asset.upload` untuk mengunggah berkas baru
- `media-asset.delete` untuk menghapus berkas

```http
Authorization: Bearer {token}
Accept: application/json
```

---

## Endpoints

### 1. List Program Media Assets

Mengambil seluruh daftar berkas privat / media asset yang terunggah pada suatu program untuk keperluan kurikulum atau komponen.

```http
GET /api/v1/admin/programs/{program}/media-assets
```

#### Parameters

| Nama | Letak | Tipe | Wajib | Keterangan |
| :--- | :--- | :--- | :---: | :--- |
| `program` | path | integer | Ya | ID program pembelajaran |

#### Response

`200 OK`

```json
{
  "success": true,
  "message": "Media assets retrieved successfully",
  "data": [
    {
      "id": 14,
      "program_id": 7,
      "original_name": "Modul-1-Pengenalan-Materi.pdf",
      "mime_type": "application/pdf",
      "extension": "pdf",
      "size_bytes": 2451000,
      "checksum_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "cdn_url": "https://cdn.arkanin.my.id/programs/7/2026/10/01JDH76G1234.pdf",
      "created_at": "2026-10-28T08:30:00.000000Z",
      "deleted_at": null
    }
  ]
}
```

---

### Cloudflare R2 & CDN Integration (Dual-Bucket Architecture)

AMS mendukung arsitektur 2 bucket pada **Cloudflare R2** dengan edge delivery melalui **Cloudflare CDN** untuk keamanan data dan kecepatan akses global tanpa biaya transfer data keluar (*zero egress fees*):

1. **Bucket Publik — `public-files`**:
   - Untuk foto profil, gambar produk, thumbnail, banner, logo, dan aset publik.
   - Endpoint: `https://13186a6d991d58c1204634129a35ea3c.r2.cloudflarestorage.com/public-files`
   - Public Development URL / CDN: `https://pub-043d267920b64ff7b8d21410e443f7ee.r2.dev`
   - Disk Laravel: `cloudflare-r2-public`
2. **Bucket Privat — `private-files`**:
   - Untuk dokumen pengguna, lampiran pengajuan, dokumen internal, dan berkas materi program yang memerlukan otentikasi login.
   - Endpoint: `https://13186a6d991d58c1204634129a35ea3c.r2.cloudflarestorage.com/private-files`
   - Disk Laravel: `cloudflare-r2-private`

```env
# .env Configuration
CLOUDFLARE_R2_ENABLED=true
CLOUDFLARE_R2_ACCOUNT_ID=13186a6d991d58c1204634129a35ea3c
CLOUDFLARE_R2_ENDPOINT=https://13186a6d991d58c1204634129a35ea3c.r2.cloudflarestorage.com
CLOUDFLARE_R2_REGION=auto
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key

# Public Bucket
CLOUDFLARE_R2_PUBLIC_BUCKET=public-files
CLOUDFLARE_R2_PUBLIC_URL=https://pub-043d267920b64ff7b8d21410e443f7ee.r2.dev
CLOUDFLARE_CDN_URL=https://pub-043d267920b64ff7b8d21410e443f7ee.r2.dev

# Private Bucket
CLOUDFLARE_R2_PRIVATE_BUCKET=private-files
COMPONENT_MEDIA_DISK=cloudflare-r2-private
```

---

### 2. Store / Upload Media Asset

Mengunggah berkas privat baru ke dalam program. Berkas disimpan pada disk privat terisolasi dengan nama objek yang diacak untuk menjaga keamanan hak cipta materi.

```http
POST /api/v1/admin/programs/{program}/media-assets
```

#### Parameters

| Nama | Letak | Tipe | Wajib | Keterangan |
| :--- | :--- | :--- | :---: | :--- |
| `program` | path | integer | Ya | ID program |

#### Request Body (`multipart/form-data`)

| Bidang | Tipe | Wajib | Keterangan |
| :--- | :--- | :---: | :--- |
| `file` | file | Ya | Berkas yang diunggah (`pdf`, `docx`, `pptx`, `mp4`, `zip`, `png`, `jpg`, maks. 100MB) |
| `reason` | string | Ya | Alasan pengunggahan berkas (min. 5, maks. 1000 karakter) untuk pencatatan audit log |

#### Response

`201 Created`

```json
{
  "success": true,
  "message": "Private media uploaded successfully",
  "data": {
    "id": 15,
    "program_id": 7,
    "original_name": "Slide-Presentasi.pptx",
    "mime_type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "extension": "pptx",
    "size_bytes": 5120000,
    "checksum_sha256": "b5a2c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852c921"
  }
}
```

---

### 3. Delete Media Asset

Menghapus (soft delete) berkas privat dari program.

```http
DELETE /api/v1/admin/programs/{program}/media-assets/{mediaAsset}
```

#### Request Body (`application/json`)

| Bidang | Tipe | Wajib | Keterangan |
| :--- | :--- | :---: | :--- |
| `reason` | string | Ya | Alasan penghapusan berkas untuk pencatatan audit log |

#### Response

`204 No Content`

---

### 4. Workspace Media Stream & View Page

Endpoint bagi siswa untuk membuka dan melihat berkas materi pembelajaran secara inline (View Page) atau mengunduh.

```http
GET /api/v1/workspace/accesses/{programAccess}/media-assets/{mediaAsset}?inline=1
```

#### Query Parameters

| Parameter | Tipe | Wajib | Keterangan |
| :--- | :--- | :---: | :--- |
| `inline` | boolean / integer | Tidak | Set `1` atau `true` untuk pratinjau langsung di peramban (`Content-Disposition: inline`) tanpa memicu dialog unduhan otomatis. |

#### Response

- `200 OK`: Stream data berkas biner (`Content-Type: application/pdf`, `video/mp4`, dsb) dengan header `Cache-Control: private, max-age=3600`.
- `403 Forbidden`: Siswa tidak memiliki akses ke komponen atau materi modul terkait.
- `404 Not Found`: Berkas media tidak ditemukan di storage Cloudflare / lokal.
