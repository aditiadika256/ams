# Dokumentasi API: Installment & Drip Lock (Layer 3)

Spesifikasi endpoint backend untuk pemantauan status cicilan pendaftaran siswa (*Enrollment Installment Tracking*), penguncian otomatis kurikulum (*Drip Content Lock*), dan mekanisme override manual (*Manual Bypass*) oleh Admin Cabang.

---

## 1. Installment Tracking (`/api/v1/admin/enrollments/installments`)

### 1.1 List Enrollment Installments
Mengambil daftar hak akses program siswa beserta matriks pelunasan termin cicilannya.

- **URL**: `GET /api/v1/admin/enrollments/installments`
- **Authentication**: `Bearer Token` (Sanctum)
- **Permissions**: `manage_global_settings` | `view_finance_analytics`
- **Query Parameters**:
  - `status` (string, opsional): `all`, `pending`, `paid`, `overdue`, `bypassed`.
  - `program_id` (integer, opsional): Filter berdasarkan ID program.
  - `search` (string, opsional): Pencarian nama siswa atau email.
  - `page` (integer, default: 1).
  - `per_page` (integer, default: 20).

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Enrollment installments retrieved successfully",
  "data": [
    {
      "access_id": 44,
      "user_id": 12,
      "user_name": "Rizky Ramadhan",
      "user_email": "rizky@gmail.com",
      "program_id": 3,
      "program_title": "Bimbel Intensif Kedinasan 2026",
      "program_price": 3000000.00,
      "overall_payment_status": "PARTIAL_ACTIVE",
      "access_status": "ACTIVE",
      "starts_at": "2026-10-26T12:00:00Z",
      "trackers": [
        {
          "id": 101,
          "term_number": 1,
          "title": "DP Pendaftaran (Termin 1)",
          "amount": 1500000.00,
          "amount_paid": 1500000.00,
          "due_date": "2026-10-26T12:00:00Z",
          "paid_at": "2026-10-26T12:05:00Z",
          "status": "paid",
          "bypassed_by": null,
          "bypass_reason": null
        },
        {
          "id": 102,
          "term_number": 2,
          "title": "Pelunasan (Termin 2)",
          "amount": 1500000.00,
          "amount_paid": 0.00,
          "due_date": "2026-11-25T12:00:00Z",
          "paid_at": null,
          "status": "pending",
          "bypassed_by": null,
          "bypass_reason": null
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

---

### 1.2 Manual Bypass Installment
Memberikan dispensasi manual untuk membuka modul/section yang terkunci bagi siswa tertentu tanpa menunggu transfer terverifikasi.

- **URL**: `POST /api/v1/admin/enrollments/installments/{trackerId}/bypass`
- **Authentication**: `Bearer Token` (Sanctum)
- **Request Body**:
```json
{
  "reason": "Dispensasi pembayaran diizinkan Kepala Cabang Medan hingga 5 Nov 2026"
}
```

**Contoh Response `200 OK`**:
```json
{
  "success": true,
  "message": "Manual bypass granted successfully. Syllabus section unlocked for student.",
  "data": {
    "id": 102,
    "status": "bypassed",
    "bypassed_by": 1,
    "bypass_reason": "Dispensasi pembayaran diizinkan Kepala Cabang Medan hingga 5 Nov 2026"
  }
}
```

---

### 1.3 Mark Installment Term as Paid
Mencatat pelunasan cicilan manual (misal pembayaran tunai di kasir cabang).

- **URL**: `POST /api/v1/admin/enrollments/installments/{trackerId}/mark-paid`
- **Authentication**: `Bearer Token` (Sanctum)
- **Request Body**:
```json
{
  "amount_paid": 1500000.00
}
```
