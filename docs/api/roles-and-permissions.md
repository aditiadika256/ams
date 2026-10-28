# Roles & Permissions API Specification

Dokumentasi API untuk manajemen peran (*Roles*), hak akses (*Permissions*), serta mekanisme otomatisasi sinkronisasi izin akses menu (*Menu Auto-Permission Sync*) pada Arkanin Management System (AMS).

---

## 1. Base URL & Authentication

```
/api/v1/admin
```

Semua endpoint dilindungi oleh `auth:sanctum` dan memerlukan permission tertentu:
```http
Authorization: Bearer {token}
Accept: application/json
```

---

## 2. Endpoints

### 2.1 Daftar Seluruh Role

Mengambil daftar seluruh role yang terdaftar beserta daftar permissions yang terhubung.

```http
GET /api/v1/admin/roles
```

#### Query Parameters
| Parameter | Tipe | Wajib | Deskripsi |
| :--- | :---: | :---: | :--- |
| `guard_name` | string | Tidak | Filter berdasarkan guard (`web` atau `sanctum`) |

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "superadmin",
      "guard_name": "web",
      "created_at": "2026-10-28T10:00:00.000000Z",
      "updated_at": "2026-10-28T10:00:00.000000Z",
      "permissions": [
        {
          "id": 1,
          "name": "view_dashboard_global",
          "guard_name": "web"
        }
      ]
    }
  ]
}
```

---

### 2.2 Daftar Seluruh Permission Master

Mengambil seluruh daftar permission per fitur yang tersedia di sistem AMS.

```http
GET /api/v1/admin/permissions
```

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Permissions retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "program.view",
      "guard_name": "web"
    },
    {
      "id": 2,
      "name": "assessment-context.view",
      "guard_name": "web"
    }
  ]
}
```

---

### 2.3 Tambah Role Baru

```http
POST /api/v1/admin/roles
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "staff_kurikulum",
  "permissions": [
    "program.view",
    "assessment-question.view"
  ]
}
```

---

### 2.4 Update Role & Permissions Matrix

```http
PUT /api/v1/admin/roles/{id}
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "staff_kurikulum",
  "permissions": [
    "program.view",
    "assessment-question.view",
    "assessment-context.view"
  ]
}
```

---

## 3. Mekanisme Menu Auto-Permission Sync

Ketika Super Admin membuat atau memperbarui Menu melalui endpoint:
- `POST /api/v1/admin/menus`
- `PUT /api/v1/admin/menus/{id}`

Dengan menyertakan parameter `required_permission` (contoh: `"custom-feature.view"` atau `"perm_a|perm_b"`):
1. **Auto-Discovery & Creation**: Jika permission tersebut belum ada di tabel `permissions`, sistem otomatis membuatnya untuk guard `web` dan `sanctum`.
2. **Auto-Grant to Super Admin & Direktur**: Sistem otomatis memberikan permission tersebut ke role `superadmin` dan `direktur` pada kedua guard.
3. **Zero Lockout**: Super Admin yang membuat menu dijamin langsung memiliki hak akses penuh ke menu yang baru saja didaftarkan.
4. **Cache Busting**: Cache permission Spatie dan versi menu (`menus:cache_version`) otomatis diperbarui seketika.
