# Dokumentasi API: Physical Rooms (Schedule Tool)

Spesifikasi endpoint backend untuk inventaris ruangan kelas fisik per cabang, kapasitas kursi, dan proteksi jadwal bentrok (*Double Booking Prevention*).

---

## 1. Physical Rooms (`/api/v1/admin/physical-rooms`)

### 1.1 List Physical Rooms
Mengambil daftar ruangan fisik per cabang beserta fasilitas dan status aktif.

- **URL**: `GET /api/v1/admin/physical-rooms`
- **Authentication**: `Bearer Token` (Sanctum)
- **Permissions**: `manage_global_settings` | `manage_learning_content`
- **Query Parameters**:
  - `branch_id` (integer, opsional): Filter cabang.
  - `is_active` (boolean, opsional): Filter status aktif.
  - `search` (string, opsional): Pencarian nama/nomor ruangan.
  - `page` (integer, default: 1).
  - `per_page` (integer, default: 15).

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Physical rooms retrieved successfully",
  "data": [
    {
      "id": 1,
      "branch_id": 2,
      "room_number": "R.101",
      "room_name": "Ruang Teori Al-Khawarizmi",
      "capacity": 35,
      "facilities": ["AC", "Projector", "Sound System", "High-speed WiFi"],
      "is_active": true,
      "row_status": 1,
      "branch": {
        "id": 2,
        "name": "Cabang Medan Merdeka",
        "code": "MDN"
      },
      "created_at": "2026-10-26T12:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  }
}
```

---

### 1.2 Create Physical Room
Menambahkan ruangan fisik baru dengan pencegahan duplikasi nomor ruangan pada cabang yang sama.

- **URL**: `POST /api/v1/admin/physical-rooms`
- **Authentication**: `Bearer Token` (Sanctum)
- **Request Body**:
```json
{
  "branch_id": 2,
  "room_number": "R.102",
  "room_name": "Lab Komputer CBT 1",
  "capacity": 40,
  "facilities": ["AC", "40x PC CBT", "Projector", "CCTV 360", "LAN Gigabit"],
  "is_active": true
}
```

**Field Validation**:
- `room_number`: required | string | max:50 | unique per branch_id
- `room_name`: required | string | max:100
- `capacity`: required | integer | min:1 | max:500
- `facilities`: array

**Contoh Response `201 Created`**:
```json
{
  "success": true,
  "message": "Physical room created successfully",
  "data": {
    "id": 2,
    "room_number": "R.102",
    "room_name": "Lab Komputer CBT 1",
    "capacity": 40
  }
}
```

---

### 1.3 Update Physical Room
Memperbarui data kapasitas, fasilitas, atau status aktif ruangan.

- **URL**: `PUT /api/v1/admin/physical-rooms/{id}`
- **Authentication**: `Bearer Token` (Sanctum)

---

### 1.4 Soft Delete Physical Room
Menghapus ruangan fisik dengan mengubah `row_status` menjadi `0` dan `is_active` menjadi `false`.

- **URL**: `DELETE /api/v1/admin/physical-rooms/{id}`
- **Authentication**: `Bearer Token` (Sanctum)
